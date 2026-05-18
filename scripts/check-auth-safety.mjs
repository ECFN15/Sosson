import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const repoRoot = process.cwd()
const envFiles = ['.env.sandbox', '.env.production']
const generatedDirs = new Set([
  path.normalize('src/dataconnect-generated'),
  path.normalize('src/dataconnect-admin-generated'),
])

const findings = []

async function assertFallbackDisabled(file) {
  const content = await readFile(path.join(repoRoot, file), 'utf8')
  const match = content.match(/^VITE_ENABLE_LOCAL_AUTH_FALLBACK=(.*)$/m)
  if (!match) {
    findings.push(`${file}: VITE_ENABLE_LOCAL_AUTH_FALLBACK manquant.`)
    return
  }
  if (match[1].trim() !== 'false') {
    findings.push(`${file}: VITE_ENABLE_LOCAL_AUTH_FALLBACK doit rester false.`)
  }
}

async function collectSourceFiles(dir) {
  const fullDir = path.join(repoRoot, dir)
  const normalized = path.normalize(dir)
  if ([...generatedDirs].some(generatedDir => normalized.startsWith(generatedDir))) return []

  const entries = await readdir(fullDir, { withFileTypes: true })
  const files = await Promise.all(entries.map(entry => {
    const child = path.join(dir, entry.name)
    if (entry.isDirectory()) return collectSourceFiles(child)
    return /\.(tsx?|jsx?)$/.test(entry.name) ? [child] : []
  }))
  return files.flat()
}

for (const file of envFiles) {
  await assertFallbackDisabled(file)
}

const authContent = await readFile(path.join(repoRoot, 'src/lib/auth.ts'), 'utf8')
if (!/export const isLocalAuthFallbackEnabled\s*=\s*[\s\S]*import\.meta\.env\.DEV[\s\S]*ENV !== 'production'[\s\S]*VITE_ENABLE_LOCAL_AUTH_FALLBACK === 'true'/.test(authContent)) {
  findings.push('src/lib/auth.ts: isLocalAuthFallbackEnabled doit rester limite a DEV, hors production, avec flag explicite.')
}

if (!/if \(!isLocalAuthFallbackEnabled && isFirebaseConfigured\) return null/.test(authContent)) {
  findings.push('src/lib/auth.ts: le fallback users local doit rester bloque quand Firebase est configure sans flag dev.')
}

const loginPageContent = await readFile(path.join(repoRoot, 'src/pages/LoginPage.tsx'), 'utf8')
if (/from '@\/data\/users'/.test(loginPageContent)) {
  if (!/\{isLocalAuthFallbackEnabled && \(/.test(loginPageContent)) {
    findings.push('src/pages/LoginPage.tsx: les comptes seeds ne doivent etre affiches que derriere isLocalAuthFallbackEnabled.')
  }

  if (!/if \(!isLocalAuthFallbackEnabled\) \{[\s\S]*Acces dev desactive/.test(loginPageContent)) {
    findings.push('src/pages/LoginPage.tsx: loginAsDev doit refuser explicitement l acces si le fallback local est desactive.')
  }
}

const sourceFiles = await collectSourceFiles('src')

for (const file of sourceFiles) {
  const content = await readFile(path.join(repoRoot, file), 'utf8')
  const lines = content.split(/\r?\n/)
  lines.forEach((line, index) => {
    if (/\b(upsertCurrentUser|useUpsertCurrentUser)\b/.test(line)) {
      findings.push(`${file}:${index + 1}: UpsertCurrentUser ne doit pas etre appele depuis le front applicatif.`)
    }
  })
}

if (findings.length) {
  console.error('Garde-fous auth non respectes:')
  for (const finding of findings) console.error(`- ${finding}`)
  process.exit(1)
}

console.log('Garde-fous auth OK: fallback local strictement dev/local, login dev masque hors flag, aucun UpsertCurrentUser front applicatif.')
