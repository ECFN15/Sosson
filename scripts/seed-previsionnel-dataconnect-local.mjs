import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import net from 'node:net'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399
const SEED_DIR = resolve('dataconnect/previsionnel_seed')

function isPortOpen(host, port) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host, port })
    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.once('error', () => resolve(false))
    socket.setTimeout(1000, () => {
      socket.destroy()
      resolve(false)
    })
  })
}

if (!(await isPortOpen(EMULATOR_HOST, EMULATOR_PORT))) {
  console.error(
    `SQL Connect emulator is not reachable at ${EMULATOR_HOST}:${EMULATOR_PORT}.\n` +
      'Start it first with: npm run emulators:dataconnect'
  )
  process.exit(1)
}

if (!existsSync(SEED_DIR)) {
  console.error(`Chunked seed directory missing: ${SEED_DIR}`)
  console.error('Generate it first with: npm run seed:previsionnel:generate')
  process.exit(1)
}

const files = readdirSync(SEED_DIR)
  .filter(file => file.endsWith('.gql'))
  .sort()

for (const [index, file] of files.entries()) {
  const relativePath = `dataconnect/previsionnel_seed/${file}`
  console.log(`[${index + 1}/${files.length}] Executing ${relativePath}`)

  const result = spawnSync(
    'npx',
    [
      '-y',
      'firebase-tools@latest',
      'dataconnect:execute',
      relativePath,
      '--service',
      'sosson-sandbox-service',
      '--location',
      'europe-west9',
    ],
    {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        FIREBASE_DATA_CONNECT_EMULATOR_HOST: `${EMULATOR_HOST}:${EMULATOR_PORT}`,
      },
    }
  )

  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1)
  }
}
