import { spawn } from 'node:child_process'
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

const children = []

function run(label, command, args) {
  const child = spawn(command, args, {
    shell: true,
    stdio: 'inherit',
    env: process.env,
  })

  children.push(child)
  child.on('exit', code => {
    if (code && code !== 0) {
      console.error(`${label} exited with code ${code}`)
    }
  })
}

if (await isPortOpen(EMULATOR_HOST, EMULATOR_PORT)) {
  console.log(`SQL Connect emulator already running on ${EMULATOR_HOST}:${EMULATOR_PORT}`)
} else {
  run('SQL Connect emulator', 'npm', ['run', 'emulators:dataconnect'])
}

run('Vite dev server', 'npm', ['run', 'dev'])

function shutdown() {
  for (const child of children) {
    child.kill()
  }
}

process.on('SIGINT', () => {
  shutdown()
  process.exit(0)
})
process.on('SIGTERM', () => {
  shutdown()
  process.exit(0)
})
