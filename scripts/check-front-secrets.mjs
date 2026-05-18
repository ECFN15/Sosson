import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const repoRoot = process.cwd()
const targets = [
  'AGENTS.md',
  'README.md',
  'documentation.md',
  'src',
  'docs',
  'scripts',
  '.github/workflows',
  '.env.example',
  '.env.sandbox',
  '.env.production',
  'index.html',
  'vite.config.ts',
]

const forbidden = [
  /(?:^|\s)(VITE_[A-Z0-9_]*SECRET)\s*=/i,
  /(?:^|\s)(VITE_[A-Z0-9_]*TOKEN)\s*=/i,
  /(?:^|\s)(VITE_[A-Z0-9_]*REFRESH)\s*=/i,
  /(?:^|\s)(VITE_[A-Z0-9_]*PASSWORD)\s*=/i,
  /import\.meta\.env\.VITE_[A-Z0-9_]*SECRET/i,
  /import\.meta\.env\.VITE_[A-Z0-9_]*TOKEN/i,
  /import\.meta\.env\.VITE_[A-Z0-9_]*REFRESH/i,
  /import\.meta\.env\.VITE_[A-Z0-9_]*PASSWORD/i,
  /(?:^|\s)(VITE_MICROSOFT_CLIENT_SECRET)\s*=/i,
  /import\.meta\.env\.VITE_MICROSOFT_CLIENT_SECRET/i,
  /matthis\.fradinpro14@outlook\.fr/i,
]

async function collectFiles(target) {
  const fullPath = path.join(repoRoot, target)
  try {
    const entries = await readdir(fullPath, { withFileTypes: true })
    const files = await Promise.all(entries.map(entry => {
      const child = path.join(target, entry.name)
      return entry.isDirectory() ? collectFiles(child) : [child]
    }))
    return files.flat()
  } catch {
    return [target]
  }
}

const files = (await Promise.all(targets.map(collectFiles))).flat()
const findings = []

for (const file of files) {
  if (!/\.(tsx?|jsx?|html|md|ya?ml|env|example|production|sandbox)$/.test(file) && !file.startsWith('.env')) continue

  let content = ''
  try {
    content = await readFile(path.join(repoRoot, file), 'utf8')
  } catch {
    continue
  }

  const lines = content.split(/\r?\n/)
  lines.forEach((line, index) => {
    if (forbidden.some(pattern => pattern.test(line))) {
      findings.push(`${file}:${index + 1}: ${line.trim()}`)
    }
  })
}

if (findings.length) {
  console.error('Secrets ou identifiants sensibles interdits detectes:')
  for (const finding of findings) console.error(`- ${finding}`)
  process.exit(1)
}

console.log('Aucune variable front de type secret/token/refresh/password ni identifiant de test sensible detecte.')
