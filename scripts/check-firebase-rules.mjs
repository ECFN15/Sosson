import { readFile } from 'node:fs/promises'

const findings = []

const firestoreRules = await readFile('firestore.rules', 'utf8')
const storageRules = await readFile('storage.rules', 'utf8')

function compact(source) {
  return source.replace(/\s+/g, ' ')
}

function assertNoBroadAllow(source, file) {
  const broadAllowPatterns = [
    /allow\s+read\s*,\s*write\s*:\s*if\s+true\s*;/,
    /allow\s+read\s*,\s*write\s*:\s*if\s+request\.auth\s*!=\s*null\s*;/,
    /allow\s+write\s*:\s*if\s+request\.auth\s*!=\s*null\s*;/,
  ]

  for (const pattern of broadAllowPatterns) {
    if (pattern.test(source)) {
      findings.push(`${file}: ouverture globale detectee: ${pattern}`)
    }
  }
}

assertNoBroadAllow(firestoreRules, 'firestore.rules')
assertNoBroadAllow(storageRules, 'storage.rules')

const firestoreCompact = compact(firestoreRules)
if (!/match \/users\/\{userId\} \{ allow read: if request\.auth != null && request\.auth\.uid == userId; allow write: if false; \}/.test(firestoreCompact)) {
  findings.push('firestore.rules: users/{userId} doit rester lisible seulement par soi et non ecrivable par le client.')
}

if (!/match \/\{document=\*\*\} \{ allow read, write: if false; \}/.test(firestoreCompact)) {
  findings.push('firestore.rules: le catch-all doit rester en deny par defaut.')
}

const storageCompact = compact(storageRules)
if (!/match \/\{allPaths=\*\*\} \{ allow read, write: if false; \}/.test(storageCompact)) {
  findings.push('storage.rules: le catch-all Storage doit rester en deny par defaut tant que le flux produit n est pas branche.')
}

if (findings.length) {
  console.error('Garde-fous Firebase rules non respectes:')
  for (const finding of findings) console.error(`- ${finding}`)
  process.exit(1)
}

console.log('Garde-fous Firebase rules OK: Firestore et Storage restent en deny par defaut.')
