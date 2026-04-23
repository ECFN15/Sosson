import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import {
  connectorConfig,
  listChantiers,
  listClients,
  listFactures,
} from '@dataconnect/admin-generated'

process.env.DATA_CONNECT_EMULATOR_HOST ??= '127.0.0.1:9399'

if (getApps().length === 0) {
  initializeApp({ projectId: 'sosson-sandbox' })
}

const dc = getDataConnect(connectorConfig)
const [clients, chantiers, factures] = await Promise.all([
  listClients(dc),
  listChantiers(dc),
  listFactures(dc),
])

const counts = {
  clients: clients.data.clients.length,
  chantiers: chantiers.data.chantiers.length,
  factures: factures.data.factures.length,
}

console.log(JSON.stringify(counts, null, 2))

if (counts.clients !== 3 || counts.chantiers !== 4 || counts.factures !== 12) {
  process.exitCode = 1
}
