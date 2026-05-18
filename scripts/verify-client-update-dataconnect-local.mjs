import { mkdir, writeFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import {
  connectorConfig,
  listOperationalClients,
  updateClient,
} from '@dataconnect/admin-generated'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399
const repoRoot = process.cwd()
const outputArg = process.argv.find(arg => arg.startsWith('--output='))
const outputPath = outputArg?.slice('--output='.length)
const targetClientSeedId = 'aaaaaaaa-0000-0000-0000-000000000001'

process.env.DATA_CONNECT_EMULATOR_HOST ??= `${EMULATOR_HOST}:${EMULATOR_PORT}`

function normalizeUuid(value) {
  return value.replaceAll('-', '').toLowerCase()
}

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

function impersonate(uid, email) {
  return {
    impersonate: {
      authClaims: {
        sub: uid,
        uid,
        email,
        email_verified: true,
      },
    },
  }
}

function clientSnapshot(client) {
  return {
    type: client.type,
    nom: client.nom,
    email: client.email ?? null,
    telephone: client.telephone ?? null,
    adresse: client.adresse ?? null,
    ville: client.ville ?? null,
    codePostal: client.codePostal ?? null,
  }
}

async function writeOutputIfRequested(payload) {
  if (!outputPath) return

  const resolved = path.resolve(repoRoot, outputPath)
  const relative = path.relative(repoRoot, resolved)

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('--output doit rester dans le repo.')
  }

  if (!relative.startsWith(`tmp${path.sep}`)) {
    throw new Error('--output doit pointer sous tmp/ pour eviter de committer des preuves locales par accident.')
  }

  await mkdir(path.dirname(resolved), { recursive: true })
  await writeFile(resolved, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.error(`Preuve edition client SQL locale ecrite dans ${relative}`)
}

async function getTargetClient(dc) {
  const response = await listOperationalClients(dc)
  return response.data.clients.find(client =>
    normalizeUuid(client.id) === normalizeUuid(targetClientSeedId)
  )
}

if (!(await isPortOpen(EMULATOR_HOST, EMULATOR_PORT))) {
  console.error(
    `SQL Connect emulator is not reachable at ${EMULATOR_HOST}:${EMULATOR_PORT}.\n` +
      'Start it first with: npm run emulators:dataconnect',
  )
  process.exit(1)
}

if (getApps().length === 0) {
  initializeApp({ projectId: 'sosson-sandbox' })
}

const dc = getDataConnect(connectorConfig)
const profile = {
  id: 'client-update-local',
  email: 'client.update@sosson.local',
  nom: 'Client',
  prenom: 'Update',
  role: 'assistante',
  avatar: 'CU',
}
const auth = impersonate(profile.id, profile.email)

await dc.upsert('User', profile)

const before = await getTargetClient(dc)
if (!before) {
  throw new Error(`Client operationnel local introuvable: ${targetClientSeedId}`)
}

const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
const next = {
  id: before.id,
  type: before.type,
  nom: `${before.nom} MAJ ${stamp}`,
  email: 'client.update@sosson.local',
  telephone: '01 23 45 67 89',
  adresse: '1 rue SQL locale',
  ville: 'Testville',
  codePostal: '75000',
}

await updateClient(dc, next, auth)
const afterUpdate = await getTargetClient(dc)

await updateClient(
  dc,
  {
    id: before.id,
    ...clientSnapshot(before),
  },
  auth,
)
const afterRevert = await getTargetClient(dc)

const beforeSnapshot = clientSnapshot(before)
const proof = {
  mode: 'local-emulator',
  mutatesData: true,
  revertsSeedState: true,
  generatedAt: new Date().toISOString(),
  clientId: before.id,
  actorUid: profile.id,
  before: beforeSnapshot,
  afterUpdate: afterUpdate ? clientSnapshot(afterUpdate) : null,
  afterRevert: afterRevert ? clientSnapshot(afterRevert) : null,
  checks: {
    targetFound: Boolean(before),
    updateApplied:
      afterUpdate?.nom === next.nom &&
      afterUpdate?.email === next.email &&
      afterUpdate?.adresse === next.adresse &&
      afterUpdate?.ville === next.ville &&
      afterUpdate?.codePostal === next.codePostal,
    seedStateReverted:
      Boolean(afterRevert) &&
      JSON.stringify(clientSnapshot(afterRevert)) === JSON.stringify(beforeSnapshot),
  },
}

const failures = Object.entries(proof.checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name)

await writeOutputIfRequested(proof)
console.log(JSON.stringify(proof, null, 2))

if (failures.length > 0) {
  console.error(`Verification edition client SQL KO:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
