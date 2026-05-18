import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import {
  connectorConfig,
  createAnalyticsSnapshot,
  listAnalyticsSnapshots,
  listFactures,
  listOperationalChantiers,
  listOperationalClients,
  listPrevisionnelExercises,
  listPrevisionnelLinesByExercise,
} from '@dataconnect/admin-generated'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399
const repoRoot = process.cwd()
const outputArg = process.argv.find(arg => arg.startsWith('--output='))
const outputPath = outputArg?.slice('--output='.length) || 'tmp/checkpoint-002/analytics-snapshot-local.json'

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

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function sum(rows, getValue) {
  return rows.reduce((total, row) => total + Number(getValue(row) ?? 0), 0)
}

function latestExercise(exercises) {
  return [...exercises].sort((a, b) => {
    if (b.endYear !== a.endYear) return b.endYear - a.endYear
    if (b.startYear !== a.startYear) return b.startYear - a.startYear
    return b.sheet.localeCompare(a.sheet)
  })[0] ?? null
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
  console.error(`Preuve snapshot analytics locale ecrite dans ${relative}`)
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
  id: 'analytics-snapshot-local',
  email: 'analytics.snapshot@sosson.local',
  nom: 'Snapshot',
  prenom: 'Analytics',
  role: 'gerant',
  avatar: 'AS',
}
const options = impersonate(actor.id, actor.email)

await dc.upsert('User', actor)

const [
  clientsResponse,
  chantiersResponse,
  facturesResponse,
  exercisesResponse,
] = await Promise.all([
  listOperationalClients(dc),
  listOperationalChantiers(dc),
  listFactures(dc),
  listPrevisionnelExercises(dc),
])

const clients = clientsResponse.data.clients
const chantiers = chantiersResponse.data.chantiers
const factures = facturesResponse.data.factures
const exercises = exercisesResponse.data.previsionnelExercises
const exercise = latestExercise(exercises)
const lineResponses = exercise
  ? await Promise.all([listPrevisionnelLinesByExercise(dc, { exerciseId: exercise.id })])
  : []
const previsionnelLines = lineResponses.flatMap(response => response.data.previsionnelLines)

const validatedFactures = factures.filter(facture => facture.statut === 'validee')
const pendingFactures = factures.filter(facture => facture.statut === 'en_attente')
const rejectedFactures = factures.filter(facture => facture.statut === 'rejetee')
const chantierBudgetTotal = sum(chantiers, chantier => chantier.budgetPrevisionnel)
const facturesValidatedTtc = sum(validatedFactures, facture => facture.montantTTC)
const facturesAllTtc = sum(factures, facture => facture.montantTTC)
const latestFactureDate = [...factures].sort((a, b) => b.date.localeCompare(a.date))[0]?.date ?? null
const latestLineRow = previsionnelLines.reduce((max, line) => Math.max(max, line.sourceRow), 0)

const sourcePayload = {
  environment: 'local-emulator',
  snapshotType: 'dashboard-global',
  scopeType: 'all',
  generatedAt: new Date().toISOString(),
  sourceCounts: {
    clients: clients.length,
    chantiers: chantiers.length,
    factures: factures.length,
    facturesValidees: validatedFactures.length,
    facturesEnAttente: pendingFactures.length,
    facturesRejetees: rejectedFactures.length,
    previsionnelExercises: exercises.length,
    previsionnelLines: previsionnelLines.length,
  },
  totals: {
    chantierBudgetTotal,
    facturesValidatedTtc,
    facturesAllTtc,
    caPrevision: exercise?.caPrevision ?? null,
    caRealise: exercise?.realizedTotal ?? null,
    caInvoiced: exercise?.invoicedTotal ?? null,
    margeApprox: chantierBudgetTotal - facturesValidatedTtc,
  },
  latestPrevisionnelExercise: exercise
    ? {
        id: exercise.id,
        sheet: exercise.sheet,
        exercise: exercise.exercise,
        startYear: exercise.startYear,
        endYear: exercise.endYear,
        lineCount: exercise.lineCount,
        chantierCount: exercise.chantierCount,
      }
    : null,
  sourceWatermarkInputs: {
    latestFactureDate,
    latestLineRow,
    latestExerciseId: exercise?.id ?? null,
  },
}

const payloadHash = sha256(JSON.stringify(sourcePayload))
const sourceWatermark = sha256(JSON.stringify(sourcePayload.sourceWatermarkInputs))
const payloadPath = outputPath.replaceAll('\\', '/')
const snapshotResponse = await createAnalyticsSnapshot(
  dc,
  {
    environment: sourcePayload.environment,
    snapshotType: sourcePayload.snapshotType,
    scopeType: sourcePayload.scopeType,
    scopeId: null,
    periodStart: exercise ? `${exercise.startYear}-01-01` : null,
    periodEnd: exercise ? `${exercise.endYear}-12-31` : null,
    status: 'generated',
    totalCaPrevision: sourcePayload.totals.caPrevision,
    totalCaRealise: sourcePayload.totals.caRealise,
    totalFacturesTtc: sourcePayload.totals.facturesValidatedTtc,
    totalMarge: sourcePayload.totals.margeApprox,
    payloadPath,
    payloadHash,
    sourceWatermark,
    createdById: actor.id,
  },
  options,
)
const snapshotId = snapshotResponse.data.analyticsSnapshot_insert.id

const snapshotsResponse = await listAnalyticsSnapshots(dc, { environment: 'local-emulator' }, options)
const readBack = snapshotsResponse.data.analyticsSnapshots.find(snapshot => snapshot.id === snapshotId)

if (!readBack) {
  throw new Error('AnalyticsSnapshot cree mais non relu via ListAnalyticsSnapshots.')
}

const proof = {
  mode: 'local-emulator',
  mutatesData: true,
  generatedAt: new Date().toISOString(),
  snapshotId,
  payloadPath,
  payloadHash,
  sourceWatermark,
  sourcePayload,
  readBack: {
    listedSnapshots: snapshotsResponse.data.analyticsSnapshots.length,
    snapshotFound: true,
    status: readBack.status,
    snapshotType: readBack.snapshotType,
    totalCaPrevision: readBack.totalCaPrevision,
    totalCaRealise: readBack.totalCaRealise,
    totalFacturesTtc: readBack.totalFacturesTtc,
    totalMarge: readBack.totalMarge,
  },
}

await writeOutput(proof)
console.log(JSON.stringify(proof, null, 2))
