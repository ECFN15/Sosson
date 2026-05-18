import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

const checks = [
  {
    label: 'provisioning sandbox refuse le fichier exemple',
    args: [
      'scripts/provision-sql-users.mjs',
      '--sandbox',
      '--yes-sandbox',
      '--file=dataconnect/user_profiles.example.json',
    ],
    env: { ALLOW_SANDBOX_USER_PROVISIONING: 'true' },
    expectedMessage: 'fichier/profil exemple detecte',
  },
  {
    label: 'comptage sandbox refuse sans profils connus',
    args: [
      'scripts/count-dataconnect.mjs',
      '--sandbox',
      '--yes-sandbox',
      `--output=tmp/checkpoint-002/sandbox-guardrails-no-profiles-${process.pid}.json`,
    ],
    env: { ALLOW_SANDBOX_DATACONNECT_READ: 'true' },
    expectedMessage: '--user-profiles est obligatoire',
    forbiddenOutput: `tmp/checkpoint-002/sandbox-guardrails-no-profiles-${process.pid}.json`,
  },
  {
    label: 'comptage sandbox refuse le fichier exemple',
    args: [
      'scripts/count-dataconnect.mjs',
      '--sandbox',
      '--yes-sandbox',
      '--user-profiles=dataconnect/user_profiles.example.json',
      `--output=tmp/checkpoint-002/sandbox-guardrails-${process.pid}.json`,
    ],
    env: { ALLOW_SANDBOX_DATACONNECT_READ: 'true' },
    expectedMessage: '--user-profiles pointe vers le fichier exemple',
    forbiddenOutput: `tmp/checkpoint-002/sandbox-guardrails-${process.pid}.json`,
  },
  {
    label: 'comptage sandbox refuse sans preuve archivee',
    args: [
      'scripts/count-dataconnect.mjs',
      '--sandbox',
      '--yes-sandbox',
      '--user-profiles=dataconnect/user_profiles.local.json',
    ],
    env: { ALLOW_SANDBOX_DATACONNECT_READ: 'true' },
    expectedMessage: '--output sous tmp/ est obligatoire',
  },
  {
    label: 'reset local Data Connect refuse sans confirmation',
    args: ['scripts/reset-dataconnect-emulator-local.mjs'],
    env: {},
    expectedMessage: 'Reset local bloque',
  },
  {
    label: 'seed sandbox refuse sans validation explicite',
    args: [
      'scripts/seed-dataconnect-sandbox.mjs',
      '--sandbox',
      '--yes-sandbox',
      '--kind=operational',
    ],
    env: {},
    expectedMessage: 'Seed sandbox bloque',
  },
  {
    label: 'dry-run seed sandbox refuse une preuve hors tmp',
    args: [
      'scripts/seed-dataconnect-sandbox.mjs',
      '--dry-run',
      '--kind=operational',
      `--output=docs/seed-sandbox-guardrails-${process.pid}.json`,
    ],
    env: {},
    expectedMessage: '--output doit pointer sous tmp/',
    forbiddenOutput: `docs/seed-sandbox-guardrails-${process.pid}.json`,
  },
]
const forbiddenOutputPatterns = [
  /firebase-auth-uid-to-replace/i,
  /prenom\.nom@sosson\.fr/i,
]

const failures = []
const ignoredPaths = [
  '.env.local',
  'dataconnect/user_profiles.local.json',
  'dataconnect/.dataconnect/pgliteData',
  'tmp/checkpoint-002/counts-sandbox.json',
  'tmp/checkpoint-002/frontend-sources.json',
  'tmp/checkpoint-002/seed-sandbox-dry-run.json',
]
const sourceChecks = [
  {
    path: 'scripts/count-dataconnect.mjs',
    required: [
      /--user-profiles est obligatoire/,
      /--output sous tmp\/ est obligatoire/,
      /expectedRole:\s*profile\.expectedRole/,
      /roleMatches:\s*profile\.expectedRole \? response\.data\.user\?\.role === profile\.expectedRole : null/,
      /uidFingerprint:\s*fingerprintUid\(profile\.uid\)/,
      /emailDomain:\s*emailDomain\(profile\.email\)/,
    ],
    forbidden: [/userChecks\.push\(\s*\{\s*uid:\s*profile\.uid/s, /userChecks\.push\(\s*\{[\s\S]*email:\s*profile\.email/s],
  },
  {
    path: 'scripts/provision-sql-users.mjs',
    required: [/formatProfileForLog\(profile\)/, /maskUid\(profile\.uid\)/],
    forbidden: [/console\.log\(`-\s*\$\{profile\.uid\}/, /console\.log\(`Profil SQL User upsert:\s*\$\{profile\.uid\}/],
  },
  {
    path: 'scripts/reset-dataconnect-emulator-local.mjs',
    required: [
      /args\.has\('--yes-local-reset'\)/,
      /path\.resolve\(repoRoot, 'dataconnect\/\.dataconnect\/pgliteData'\)/,
      /path\.basename\(dataDir\) !== 'pgliteData'/,
      /isPortOpen\(EMULATOR_HOST, EMULATOR_PORT\)/,
    ],
    forbidden: [
      /rm\([^)]*repoRoot/,
      /rm\([^)]*'dataconnect'/,
    ],
  },
  {
    path: 'scripts/seed-dataconnect-sandbox.mjs',
    required: [
      /ALLOW_SANDBOX_DATACONNECT_SEED/,
      /args\.has\('--sandbox'\)/,
      /args\.has\('--yes-sandbox'\)/,
      /'--project',\s*PROJECT/,
      /mutatesData:\s*false/,
      /--output doit pointer sous tmp\//,
    ],
    forbidden: [
      /PROJECT\s*=\s*'sosson-prod'/,
      /firebase deploy/,
    ],
  },
]

for (const check of checks) {
  const result = spawnSync(process.execPath, check.args, {
    cwd: process.cwd(),
    env: { ...process.env, ...check.env },
    encoding: 'utf8',
  })
  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`

  if (result.status === 0) {
    failures.push(`${check.label}: la commande aurait du echouer.`)
  }

  if (!output.includes(check.expectedMessage)) {
    failures.push(`${check.label}: message attendu absent (${check.expectedMessage}).`)
  }

  if (forbiddenOutputPatterns.some(pattern => pattern.test(output))) {
    failures.push(`${check.label}: sortie non redactee detectee.`)
  }

  if (check.forbiddenOutput && existsSync(check.forbiddenOutput)) {
    failures.push(`${check.label}: fichier interdit cree (${check.forbiddenOutput}).`)
  }
}

for (const ignoredPath of ignoredPaths) {
  const result = spawnSync('git', ['check-ignore', '--quiet', ignoredPath], {
    cwd: process.cwd(),
    encoding: 'utf8',
  })

  if (result.status !== 0) {
    failures.push(`${ignoredPath}: chemin sensible/temporaire non ignore par git.`)
  }
}

for (const sourceCheck of sourceChecks) {
  const source = readFileSync(sourceCheck.path, 'utf8')

  for (const pattern of sourceCheck.required) {
    if (!pattern.test(source)) {
      failures.push(`${sourceCheck.path}: motif de masquage attendu absent (${pattern}).`)
    }
  }

  for (const pattern of sourceCheck.forbidden) {
    if (pattern.test(source)) {
      failures.push(`${sourceCheck.path}: sortie brute UID/email interdite detectee (${pattern}).`)
    }
  }
}

if (failures.length) {
  console.error('Garde-fous sandbox non respectes:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Garde-fous sandbox OK: fichiers exemples refuses avant lecture/mutation distante, seed sandbox bloque sans validation, preuves hors tmp refusees, reset local bloque sans confirmation, artefacts locaux ignores par git, sorties profils masquees.')
