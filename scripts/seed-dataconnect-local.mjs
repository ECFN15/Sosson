import { spawnSync } from 'node:child_process'
import net from 'node:net'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399

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

const result = spawnSync(
  'npx',
  [
    '-y',
    'firebase-tools@latest',
    'dataconnect:execute',
    'dataconnect/seed_data.gql',
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

process.exit(result.status ?? 1)
