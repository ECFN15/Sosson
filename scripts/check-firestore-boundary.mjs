import { execFileSync } from 'node:child_process'
import path from 'node:path'

const allowedFiles = new Set([
  'src/lib/firebase.ts',
  'src/lib/auth.ts',
])

const patterns = [
  'firebase/firestore',
  '\\bgetFirestore\\b',
  '\\bgetDoc\\b',
  '\\bsetDoc\\b',
  '\\baddDoc\\b',
  '\\bupdateDoc\\b',
  '\\bdeleteDoc\\b',
  '\\bcollection\\b',
  '\\bdoc\\(',
]

function runRg(pattern) {
  try {
    return execFileSync('rg', [
      '-n',
      pattern,
      'src',
      '--glob',
      '!src/dataconnect-generated/**',
      '--glob',
      '!src/dataconnect-admin-generated/**',
    ], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim()
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 1) return ''
    throw error
  }
}

const findings = []

for (const pattern of patterns) {
  const output = runRg(pattern)
  if (!output) continue

  for (const line of output.split(/\r?\n/)) {
    const [rawFile] = line.split(':')
    const normalized = rawFile.split(path.sep).join('/')
    if (!allowedFiles.has(normalized)) findings.push(line)
  }
}

if (findings.length > 0) {
  console.error('Frontiere Firestore KO: usages hors fichiers transitoires autorises.')
  for (const finding of findings) console.error(`- ${finding}`)
  process.exit(1)
}

console.log('Frontiere Firestore OK: usage limite a src/lib/firebase.ts et src/lib/auth.ts.')
