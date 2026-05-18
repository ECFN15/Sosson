import { execFileSync } from 'node:child_process'

const forbiddenGeneratedPatterns = [
  'UpsertCurrentUser',
  'upsertCurrentUser',
  'useUpsertCurrentUser',
]

const generatedDirs = [
  'src/dataconnect-generated',
  'src/dataconnect-admin-generated',
]

const sourceDirs = [
  'src',
  'dataconnect',
]

function rg(pattern, paths, extraArgs = []) {
  try {
    const output = execFileSync('rg', ['-n', pattern, ...paths, ...extraArgs], { encoding: 'utf8' }).trim()
    return output ? output.split('\n') : []
  } catch (error) {
    if (error.status === 1) return []
    throw error
  }
}

const failures = []

for (const pattern of forbiddenGeneratedPatterns) {
  const matches = rg(pattern, generatedDirs)
  if (matches.length > 0) {
    failures.push(`Operation interdite detectee dans les SDKs generes: ${pattern}`, ...matches.map(line => `- ${line}`))
  }
}

const frontMatches = rg('useUpsertCurrentUser|upsertCurrentUser', sourceDirs, [
  '--glob',
  '!src/dataconnect-generated/**',
  '--glob',
  '!src/dataconnect-admin-generated/**',
  '--glob',
  '!scripts/check-dataconnect-client-surface.mjs',
  '--glob',
  '!scripts/check-auth-safety.mjs',
])

if (frontMatches.length > 0) {
  failures.push('Usage applicatif interdit de UpsertCurrentUser:', ...frontMatches.map(line => `- ${line}`))
}

if (failures.length > 0) {
  console.error('Surface client Data Connect KO:')
  for (const failure of failures) console.error(failure)
  process.exit(1)
}

console.log('Surface client Data Connect OK: UpsertCurrentUser absent des SDKs et du front applicatif.')
