import { rm } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399
const repoRoot = process.cwd()
const dataDir = path.resolve(repoRoot, 'dataconnect/.dataconnect/pgliteData')
const allowedParent = path.resolve(repoRoot, 'dataconnect/.dataconnect')
const args = new Set(process.argv.slice(2))

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

function assertSafeTarget() {
  const relativeToParent = path.relative(allowedParent, dataDir)
  if (relativeToParent.startsWith('..') || path.isAbsolute(relativeToParent)) {
    throw new Error(`Chemin de reset hors repertoire autorise: ${dataDir}`)
  }

  if (path.basename(dataDir) !== 'pgliteData') {
    throw new Error(`Chemin de reset inattendu: ${dataDir}`)
  }
}

console.log('Reset local de l etat SQL Connect emulator.')
console.log(`Cible: ${path.relative(repoRoot, dataDir)}`)
console.log('Cette commande ne touche pas a Firebase sandbox ni production.')

if (!args.has('--yes-local-reset')) {
  console.error('\nReset local bloque.')
  console.error('Cette action supprime uniquement la base locale pglite de l emulateur Data Connect.')
  console.error('Relancer explicitement avec: npm run reset:dataconnect:local -- --yes-local-reset')
  process.exit(1)
}

assertSafeTarget()

if (await isPortOpen(EMULATOR_HOST, EMULATOR_PORT)) {
  console.error(`\nReset local bloque: l emulateur Data Connect ecoute encore sur ${EMULATOR_HOST}:${EMULATOR_PORT}.`)
  console.error('Arreter npm run emulators:dataconnect avant de supprimer pgliteData.')
  process.exit(1)
}

await rm(dataDir, { recursive: true, force: true })
console.log('Etat local pglite Data Connect supprime.')
console.log('Relancer ensuite npm run emulators:dataconnect puis npm run checkpoint:002:emulator.')
