import { mkdir, writeFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import {
  connectorConfig,
  listOperationalChantiers,
  listOperationalClients,
  listPrevisionnelExercises,
  listPrevisionnelLinesByExercise,
} from '@dataconnect/admin-generated'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399
const repoRoot = process.cwd()
const outputArg = process.argv.find(arg => arg.startsWith('--output='))
const outputPath = outputArg?.slice('--output='.length)

const expectedOperational = {
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
}

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

function diffIds(actualIds, expectedIds) {
  const expectedSet = new Set(expectedIds.map(normalizeUuid))
  const actualSet = new Set(actualIds.map(normalizeUuid))

  return {
    missing: expectedIds.filter(id => !actualSet.has(normalizeUuid(id))),
    unexpected: actualIds.filter(id => !expectedSet.has(normalizeUuid(id))),
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
  console.error(`Preuve frontiere operationnel/previsionnel ecrite dans ${relative}`)
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
const [clientsResponse, chantiersResponse, exercisesResponse] = await Promise.all([
  listOperationalClients(dc),
  listOperationalChantiers(dc),
  listPrevisionnelExercises(dc),
])

const exercises = exercisesResponse.data.previsionnelExercises
const lineResponses = await Promise.all(
  exercises.map(exercise => listPrevisionnelLinesByExercise(dc, { exerciseId: exercise.id })),
)
const previsionnelLines = lineResponses.flatMap(response => response.data.previsionnelLines)
const expectedPrevisionnelLines = exercises.reduce((sum, exercise) => sum + exercise.lineCount, 0)

const operationalClientIds = clientsResponse.data.clients.map(client => client.id)
const operationalChantierIds = chantiersResponse.data.chantiers.map(chantier => chantier.id)
const clientDiff = diffIds(operationalClientIds, expectedOperational.clients)
const chantierDiff = diffIds(operationalChantierIds, expectedOperational.chantiers)
const previsionnelLinkedClientIds = new Set(
  previsionnelLines.map(line => line.client?.id).filter(id => typeof id === 'string'),
)
const previsionnelLinkedChantierIds = new Set(
  previsionnelLines.map(line => line.chantier?.id).filter(id => typeof id === 'string'),
)

const proof = {
  mode: 'local-emulator',
  generatedAt: new Date().toISOString(),
  mutatesData: false,
  operational: {
    clients: clientsResponse.data.clients.length,
    chantiers: chantiersResponse.data.chantiers.length,
    expectedClientIds: expectedOperational.clients,
    expectedChantierIds: expectedOperational.chantiers,
    missingClientIds: clientDiff.missing,
    unexpectedClientIds: clientDiff.unexpected,
    missingChantierIds: chantierDiff.missing,
    unexpectedChantierIds: chantierDiff.unexpected,
  },
  previsionnel: {
    exercises: exercises.length,
    expectedLinesFromExerciseMetadata: expectedPrevisionnelLines,
    loadedLinesViaQuery: previsionnelLines.length,
    linkedClients: previsionnelLinkedClientIds.size,
    linkedChantiers: previsionnelLinkedChantierIds.size,
    lineQueryMayBeTruncated: previsionnelLines.length < expectedPrevisionnelLines,
  },
  checks: {
    operationalClientsStaySeedOnlyAfterPrevisionnelSeed:
      clientDiff.missing.length === 0 && clientDiff.unexpected.length === 0,
    operationalChantiersStaySeedOnlyAfterPrevisionnelSeed:
      chantierDiff.missing.length === 0 && chantierDiff.unexpected.length === 0,
    previsionnelLinesFullyLoaded:
      previsionnelLines.length === expectedPrevisionnelLines && previsionnelLines.length > 0,
  },
}

const failures = Object.entries(proof.checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name)

await writeOutputIfRequested(proof)
console.log(JSON.stringify(proof, null, 2))

if (failures.length > 0) {
  console.error(`Frontiere operationnel/previsionnel KO:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
