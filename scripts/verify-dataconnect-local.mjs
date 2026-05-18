import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import net from 'node:net'
import {
  connectorConfig,
  listFactures,
  listOperationalChantiers,
  listOperationalClients,
} from '@dataconnect/admin-generated'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399
process.env.DATA_CONNECT_EMULATOR_HOST ??= `${EMULATOR_HOST}:${EMULATOR_PORT}`

const expectedSeedIds = {
  clients: [
    'aaaaaaaa-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000003',
  ],
  chantiers: [
    'bbbbbbbb-0000-0000-0000-000000000001',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'bbbbbbbb-0000-0000-0000-000000000003',
    'bbbbbbbb-0000-0000-0000-000000000004',
  ],
  factures: Array.from({ length: 12 }, (_, index) => {
    const suffix = String(index + 1).padStart(3, '0')
    return `cccccccc-0000-0000-0000-000000000${suffix}`
  }),
}

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

if (!(await isPortOpen(EMULATOR_HOST, EMULATOR_PORT))) {
  console.error(
    `SQL Connect emulator is not reachable at ${EMULATOR_HOST}:${EMULATOR_PORT}.\n` +
      'Start it first with: npm run emulators:dataconnect'
  )
  process.exit(1)
}

if (getApps().length === 0) {
  initializeApp({ projectId: 'sosson-sandbox' })
}

const dc = getDataConnect(connectorConfig)
const [clients, chantiers, factures] = await Promise.all([
  listOperationalClients(dc),
  listOperationalChantiers(dc),
  listFactures(dc),
])

const counts = {
  clients: clients.data.clients.length,
  chantiers: chantiers.data.chantiers.length,
  factures: factures.data.factures.length,
}

const idSets = {
  clients: new Set(clients.data.clients.map(client => normalizeUuid(client.id))),
  chantiers: new Set(chantiers.data.chantiers.map(chantier => normalizeUuid(chantier.id))),
  factures: new Set(factures.data.factures.map(facture => normalizeUuid(facture.id))),
}

const missing = {
  clients: expectedSeedIds.clients.filter(id => !idSets.clients.has(normalizeUuid(id))),
  chantiers: expectedSeedIds.chantiers.filter(id => !idSets.chantiers.has(normalizeUuid(id))),
  factures: expectedSeedIds.factures.filter(id => !idSets.factures.has(normalizeUuid(id))),
}

console.log(JSON.stringify({ counts, missingSeedIds: missing }, null, 2))

if (missing.clients.length > 0 || missing.chantiers.length > 0 || missing.factures.length > 0) {
  process.exitCode = 1
}
