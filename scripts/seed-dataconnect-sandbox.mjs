import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import path, { resolve } from 'node:path'

const SERVICE = 'sosson-sandbox-service'
const LOCATION = 'europe-west9'
const PROJECT = 'sosson-sandbox'
const PREVISIONNEL_SEED_DIR = resolve('dataconnect/previsionnel_seed')

const args = new Set(process.argv.slice(2))
const kindArg = process.argv.find(arg => arg.startsWith('--kind='))
const kind = kindArg?.slice('--kind='.length) || 'all'
const outputArg = process.argv.find(arg => arg.startsWith('--output='))
const outputPath = outputArg?.slice('--output='.length)
const dryRun = args.has('--dry-run')
const sandbox = args.has('--sandbox')
const yesSandbox = args.has('--yes-sandbox')

if (!['operational', 'previsionnel', 'all'].includes(kind)) {
  console.error('--kind doit valoir operational, previsionnel ou all.')
  process.exit(1)
}

function listSeedFiles() {
  const files = []

  if (kind === 'operational' || kind === 'all') {
    files.push('dataconnect/seed_data.gql')
  }

  if (kind === 'previsionnel' || kind === 'all') {
    if (!existsSync(PREVISIONNEL_SEED_DIR)) {
      console.error(`Dossier seed previsionnel absent: ${PREVISIONNEL_SEED_DIR}`)
      console.error('Generer les chunks avec: npm run seed:previsionnel:generate')
      process.exit(1)
    }

    files.push(
      ...readdirSync(PREVISIONNEL_SEED_DIR)
        .filter(file => file.endsWith('.gql'))
        .sort()
        .map(file => `dataconnect/previsionnel_seed/${file}`)
    )
  }

  return files
}

const seedFiles = listSeedFiles()

function writeOutputIfRequested(payload) {
  if (!outputPath) return

  const resolved = path.resolve(process.cwd(), outputPath)
  const relative = path.relative(process.cwd(), resolved)

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('--output doit rester dans le repo.')
  }

  if (!relative.startsWith(`tmp${path.sep}`)) {
    throw new Error('--output doit pointer sous tmp/ pour eviter de committer des preuves sandbox par accident.')
  }

  mkdirSync(path.dirname(resolved), { recursive: true })
  writeFileSync(resolved, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.error(`Preuve dry-run seed sandbox ecrite dans ${relative}`)
}

if (dryRun) {
  const payload = {
    mode: 'sandbox-seed-dry-run',
    project: PROJECT,
    service: SERVICE,
    location: LOCATION,
    kind,
    outputPath: outputPath ?? null,
    files: seedFiles,
    mutatesData: false,
  }

  try {
    writeOutputIfRequested(payload)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }

  console.log(JSON.stringify(payload, null, 2))
  process.exit(0)
}

if (!sandbox || !yesSandbox || process.env.ALLOW_SANDBOX_DATACONNECT_SEED !== 'true') {
  console.error(
    'Seed sandbox bloque.\n' +
      'Cette action ecrit dans une base distante reelle. Relancer seulement apres validation humaine avec:\n' +
      'ALLOW_SANDBOX_DATACONNECT_SEED=true npm run seed:sandbox -- --sandbox --yes-sandbox --kind=all'
  )
  process.exit(1)
}

console.log(`Seed sandbox Data Connect: ${seedFiles.length} fichier(s), projet ${PROJECT}.`)

for (const [index, file] of seedFiles.entries()) {
  console.log(`[${index + 1}/${seedFiles.length}] Executing ${file}`)

  const result = spawnSync(
    'npx',
    [
      '-y',
      'firebase-tools@latest',
      'dataconnect:execute',
      file,
      '--service',
      SERVICE,
      '--location',
      LOCATION,
      '--project',
      PROJECT,
    ],
    {
      stdio: 'inherit',
      shell: true,
    }
  )

  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1)
  }
}
