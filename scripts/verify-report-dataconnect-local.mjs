import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import {
  connectorConfig,
  createAnalyticsSnapshot,
  createRapport,
  getAnalyticsSnapshot,
  getRapport,
  listRapports,
  markRapportGenerated,
} from '@dataconnect/admin-generated'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399
const repoRoot = process.cwd()
const outputArg = process.argv.find(arg => arg.startsWith('--output='))
const outputPath = outputArg?.slice('--output='.length) || 'tmp/checkpoint-002/report-local.json'

process.env.DATA_CONNECT_EMULATOR_HOST ??= `${EMULATOR_HOST}:${EMULATOR_PORT}`

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

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function toRepoRelativePath(value) {
  return value.split(path.sep).join('/')
}

async function writeTmpArtifact(relativePath, content) {
  const resolved = path.resolve(repoRoot, relativePath)
  const relative = path.relative(repoRoot, resolved)

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Les artefacts rapport doivent rester dans le repo.')
  }

  if (!relative.startsWith(`tmp${path.sep}`)) {
    throw new Error('Les artefacts rapport doivent pointer sous tmp/.')
  }

  await mkdir(path.dirname(resolved), { recursive: true })
  await writeFile(resolved, content, 'utf8')

  return {
    path: toRepoRelativePath(relative),
    sha256: sha256(content),
    sizeBytes: Buffer.byteLength(content, 'utf8'),
  }
}

async function writeOutput(payload) {
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
  console.error(`Preuve rapport SQL locale ecrite dans ${relative}`)
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
const actor = {
  id: 'report-local',
  email: 'report@sosson.local',
  nom: 'Rapport',
  prenom: 'Local',
  role: 'gerant',
  avatar: 'RL',
}
const options = impersonate(actor.id, actor.email)
const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
const snapshotPayload = {
  environment: 'local-emulator',
  snapshotType: 'report-proof',
  scopeType: 'all',
  periodStart: '2026-01-01',
  periodEnd: '2026-01-31',
  totalCaPrevision: 12345.67,
  totalCaRealise: 8901.23,
  totalFacturesTtc: 4567.89,
  totalMarge: 4333.34,
  generatedFor: 'verify:reports:dataconnect',
}
const payloadArtifact = await writeTmpArtifact(
  path.join('tmp', 'checkpoint-002', 'reports', `rapport-source-${stamp}.json`),
  `${JSON.stringify(snapshotPayload, null, 2)}\n`,
)
const exportRows = [
  ['periode_debut', 'periode_fin', 'ca_previsionnel', 'ca_realise', 'factures_ttc', 'marge'],
  [
    snapshotPayload.periodStart,
    snapshotPayload.periodEnd,
    snapshotPayload.totalCaPrevision.toFixed(2),
    snapshotPayload.totalCaRealise.toFixed(2),
    snapshotPayload.totalFacturesTtc.toFixed(2),
    snapshotPayload.totalMarge.toFixed(2),
  ],
]
const exportCsv = `${exportRows.map(row => row.join(';')).join('\n')}\n`
const exportArtifact = await writeTmpArtifact(
  path.join('tmp', 'checkpoint-002', 'reports', `rapport-${stamp}.csv`),
  exportCsv,
)
const generatedAt = new Date().toISOString()

await dc.upsert('User', actor)

const snapshotResponse = await createAnalyticsSnapshot(
  dc,
  {
    environment: 'local-emulator',
    snapshotType: 'report-proof',
    scopeType: 'all',
    scopeId: null,
    periodStart: '2026-01-01',
    periodEnd: '2026-01-31',
    status: 'generated',
    totalCaPrevision: 12345.67,
    totalCaRealise: 8901.23,
    totalFacturesTtc: 4567.89,
    totalMarge: 4333.34,
    payloadPath: payloadArtifact.path,
    payloadHash: payloadArtifact.sha256,
    sourceWatermark: sha256(`report-watermark-${stamp}`),
    createdById: actor.id,
  },
  options,
)
const snapshotId = snapshotResponse.data.analyticsSnapshot_insert.id

const reportResponse = await createRapport(
  dc,
  {
    snapshotId,
    authorId: actor.id,
    clientId: null,
    chantierId: null,
    titre: `Rapport local ${stamp}`,
    rapportType: 'mensuel',
    statut: 'draft',
    periodeDebut: '2026-01-01',
    periodeFin: '2026-01-31',
    format: null,
    storagePath: null,
    sha256: null,
    summary: 'Brouillon local cree pour verifier la table Rapport.',
    generatedAt: null,
  },
  options,
)
const reportId = reportResponse.data.rapport_insert.id

await markRapportGenerated(
  dc,
  {
    id: reportId,
    statut: 'generated',
    format: 'csv',
    storagePath: exportArtifact.path,
    sha256: exportArtifact.sha256,
    generatedAt,
    summary: 'Rapport local marque genere avec chemin et hash d artefact CSV local.',
  },
  options,
)

const [reportRead, reportsRead, snapshotRead] = await Promise.all([
  getRapport(dc, { id: reportId }, options),
  listRapports(dc, options),
  getAnalyticsSnapshot(dc, { id: snapshotId }, options),
])

const report = reportRead.data.rapport
const snapshot = snapshotRead.data.analyticsSnapshot

assert(report?.id === reportId, 'Rapport cree puis genere introuvable via GetRapport.')
assert(report.statut === 'generated', 'Statut rapport non mis a jour.')
assert(report.format === 'csv', 'Format rapport non mis a jour.')
assert(report.storagePath === exportArtifact.path, 'storagePath rapport non relu.')
assert(report.sha256 === exportArtifact.sha256, 'Hash export rapport non relu.')
assert(report.snapshot?.id === snapshotId, 'Lien Rapport -> AnalyticsSnapshot non relu.')
assert(report.author?.id === actor.id, 'Auteur rapport non relu.')
assert(reportsRead.data.rapports.some(item => item.id === reportId), 'Rapport absent de ListRapports.')
assert(snapshot?.rapports.some(item => item.id === reportId), 'Rapport absent de la relation AnalyticsSnapshot.rapports.')
assert(snapshot.payloadPath === payloadArtifact.path, 'Chemin payload snapshot non relu.')
assert(snapshot.payloadHash === payloadArtifact.sha256, 'Hash payload snapshot non relu.')

const proof = {
  mode: 'local-emulator',
  mutatesData: true,
  generatedAt: new Date().toISOString(),
  snapshotId,
  reportId,
  readBack: {
    found: true,
    statut: report.statut,
    format: report.format,
    storagePath: report.storagePath,
    sha256: report.sha256,
    artifactExistsLocally: true,
    artifactSizeBytes: exportArtifact.sizeBytes,
    payloadPath: snapshot.payloadPath,
    payloadHash: snapshot.payloadHash,
    payloadSizeBytes: payloadArtifact.sizeBytes,
    author: report.author ? {
      id: report.author.id,
      nom: report.author.nom,
      prenom: report.author.prenom,
      avatar: report.author.avatar,
    } : null,
    snapshotLinked: report.snapshot?.id === snapshotId,
    listedInRapports: true,
    reportsOnSnapshot: snapshot?.rapports.length ?? 0,
  },
}

await writeOutput(proof)
console.log(JSON.stringify(proof, null, 2))
