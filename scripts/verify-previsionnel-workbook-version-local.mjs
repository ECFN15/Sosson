import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import ExcelJS from 'exceljs'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import {
  connectorConfig,
  createPrevisionnelImportBatch,
  createPrevisionnelWorkbookVersionPending,
  getLatestGeneratedPrevisionnelWorkbookVersion,
  getPrevisionnelWorkbookVersion,
  listPrevisionnelCellEdits,
  markPrevisionnelWorkbookVersionFailed,
  markPrevisionnelWorkbookVersionGenerated,
  markPrevisionnelWorkbookVersionGenerating,
  upsertPrevisionnelCellEdit,
} from '@dataconnect/admin-generated'
import {
  generatePrevisionnelWorkbookVersion,
  PREVISIONNEL_CURRENT_STORAGE_PATH,
  PREVISIONNEL_SOURCE_STORAGE_PATH,
  sha256,
  versionStoragePath,
} from '../functions/src/previsionnelWorkbookCore.mjs'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399
const repoRoot = process.cwd()
const storageRoot = path.resolve(repoRoot, 'tmp/previsionnel-workbook-storage')
const targetSheet = '2025-26'
const outputArg = process.argv.find(arg => arg.startsWith('--output='))
const outputPath = outputArg?.slice('--output='.length) || 'tmp/checkpoint-002/previsionnel-workbook-version-local.json'
const keepArtifacts = process.argv.includes('--keep-artifacts')

process.env.DATA_CONNECT_EMULATOR_HOST ??= `${EMULATOR_HOST}:${EMULATOR_PORT}`

function assert(condition, message) {
  if (!condition) throw new Error(message)
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

function storageObjectPath(storagePath) {
  const resolved = path.resolve(storageRoot, storagePath.replaceAll('/', path.sep))
  const relative = path.relative(storageRoot, resolved)

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Chemin Storage local refuse: ${storagePath}`)
  }

  return resolved
}

function localStorageAdapter() {
  return {
    async read(storagePath) {
      return readFile(storageObjectPath(storagePath))
    },
    async write(storagePath, buffer) {
      const resolved = storageObjectPath(storagePath)
      await mkdir(path.dirname(resolved), { recursive: true })
      await writeFile(resolved, buffer)
    },
    isNotFound(error) {
      return error?.code === 'ENOENT'
    },
  }
}

function failingStorageAdapter() {
  const notFound = Object.assign(new Error('Storage local volontairement indisponible'), { code: 'ENOENT' })
  return {
    async read() {
      throw notFound
    },
    async write() {
      throw new Error('write ne doit pas etre appele quand la source est introuvable')
    },
    isNotFound(error) {
      return error?.code === 'ENOENT'
    },
  }
}

async function writeOutput(payload) {
  const resolved = path.resolve(repoRoot, outputPath)
  const relative = path.relative(repoRoot, resolved)

  if (relative.startsWith('..') || path.isAbsolute(relative) || !relative.startsWith(`tmp${path.sep}`)) {
    throw new Error('--output doit rester sous tmp/.')
  }

  await mkdir(path.dirname(resolved), { recursive: true })
  await writeFile(resolved, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.error(`Preuve version Excel previsionnel locale ecrite dans ${relative}`)
}

async function seedSourceWorkbook(storage, sheetName) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(sheetName)
  sheet.getCell('A1').value = 'Sosson previsionnel source local'
  sheet.getCell('B8').value = 'Source locale'
  sheet.getCell('BP174').value = 0
  workbook.calcProperties = { fullCalcOnLoad: true, forceFullCalc: true }
  const buffer = Buffer.from(await workbook.xlsx.writeBuffer())
  await storage.write(PREVISIONNEL_SOURCE_STORAGE_PATH, buffer)
  return { storagePath: PREVISIONNEL_SOURCE_STORAGE_PATH, sha256: sha256(buffer), sizeBytes: buffer.length }
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
  id: 'previsionnel-workbook-local',
  email: 'previsionnel.workbook@sosson.local',
  nom: 'Previsionnel',
  prenom: 'Workbook',
  role: 'assistante',
  avatar: 'PW',
}
const options = impersonate(actor.id, actor.email)
const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
const storage = localStorageAdapter()

await dc.upsert('User', actor)

const source = await seedSourceWorkbook(storage, targetSheet)
const batchResponse = await createPrevisionnelImportBatch(
  dc,
  {
    workbook: 'PREVISIONNEL-original.xlsx',
    sourcePath: 'local-storage-mock',
    workbookHash: source.sha256,
    sourceStoragePath: PREVISIONNEL_SOURCE_STORAGE_PATH,
    sourceSha256: source.sha256,
    originalFileName: 'PREVISIONNEL-original.xlsx',
    notes: `Verification workbook locale ${stamp}`,
  },
  options,
)
const batchId = batchResponse.data.previsionnelImportBatch_insert.id
const exerciseId = '00000000-0000-4000-8000-000000002526'
await dc.upsert('PrevisionnelExercise', {
  id: exerciseId,
  batchId,
  sheet: targetSheet,
  exercise: targetSheet,
  startYear: 2025,
  endYear: 2026,
  lineCount: 1,
  chantierCount: 1,
  caPrevision: 0,
  caContrat: 0,
  plannedTotal: 0,
  realizedTotal: 0,
  invoicedTotal: 0,
})
const exercise = {
  id: exerciseId,
  sheet: targetSheet,
  batch: {
    id: batchId,
  },
}
const cellRef = 'BP174'
const numericValue = Number(`20${stamp.slice(-6)}`)
const editId = `verify-workbook-${exercise.sheet}-${cellRef}`.replace(/[^a-zA-Z0-9_-]/g, '-')

await upsertPrevisionnelCellEdit(
  dc,
  {
    id: editId,
    sourceSheet: exercise.sheet,
    cellRef,
    valueText: null,
    numericValue,
  },
  options,
)

const cellEditsResponse = await listPrevisionnelCellEdits(dc, { sourceSheet: exercise.sheet }, options)
const cellEdit = cellEditsResponse.data.previsionnelCellEdits.find(item => item.id === editId)
assert(cellEdit, 'Cell edit de preuve introuvable apres upsert.')

const versionDate = new Date()
const versionId = `verify-pwv-${stamp}`
const storagePath = versionStoragePath(versionId, versionDate)

await createPrevisionnelWorkbookVersionPending(
  dc,
  {
    id: versionId,
    batchId: exercise.batch.id,
    sourceSheet: exercise.sheet,
    storagePath,
    currentStoragePath: PREVISIONNEL_CURRENT_STORAGE_PATH,
    baseStoragePath: null,
    editCount: cellEditsResponse.data.previsionnelCellEdits.length,
  },
  options,
)

await markPrevisionnelWorkbookVersionGenerating(dc, { id: versionId, retryCount: 1 }, options)

const versionResponse = await getPrevisionnelWorkbookVersion(dc, { id: versionId }, options)
const version = versionResponse.data.previsionnelWorkbookVersion
assert(version, 'Version pending introuvable apres creation.')

const latestResponse = await getLatestGeneratedPrevisionnelWorkbookVersion(dc, { sourceSheet: exercise.sheet }, options)
const latestGeneratedVersion = latestResponse.data.previsionnelWorkbookVersions[0] ?? null
const generated = await generatePrevisionnelWorkbookVersion({
  version,
  latestGeneratedVersion,
  cellEdits: cellEditsResponse.data.previsionnelCellEdits,
  storage,
})

await markPrevisionnelWorkbookVersionGenerated(
  dc,
  {
    id: versionId,
    storagePath: generated.storagePath,
    currentStoragePath: generated.currentStoragePath,
    sha256: generated.sha256,
    sizeBytes: generated.sizeBytes,
    editCount: generated.appliedEditCount,
  },
  options,
)

const finalVersion = (await getPrevisionnelWorkbookVersion(dc, { id: versionId }, options)).data.previsionnelWorkbookVersion
assert(finalVersion?.status === 'generated', 'La version finale doit etre generated.')

const versionBuffer = await storage.read(storagePath)
const currentBuffer = await storage.read(PREVISIONNEL_CURRENT_STORAGE_PATH)
assert(sha256(versionBuffer) === finalVersion.sha256, 'Hash version Storage incoherent.')
assert(sha256(currentBuffer) === finalVersion.sha256, 'Hash current Storage incoherent.')

const workbook = new ExcelJS.Workbook()
await workbook.xlsx.load(versionBuffer)
assert(workbook.getWorksheet(exercise.sheet)?.getCell(cellRef).value === numericValue, 'Cell edit non applique dans le xlsx genere.')

const failedVersionId = `verify-pwv-failed-${stamp}`
await createPrevisionnelWorkbookVersionPending(
  dc,
  {
    id: failedVersionId,
    batchId: null,
    sourceSheet: exercise.sheet,
    storagePath: versionStoragePath(failedVersionId, versionDate),
    currentStoragePath: PREVISIONNEL_CURRENT_STORAGE_PATH,
    baseStoragePath: 'previsionnel/missing/PREVISIONNEL.xlsx',
    editCount: 1,
  },
  options,
)
await markPrevisionnelWorkbookVersionGenerating(dc, { id: failedVersionId, retryCount: 1 }, options)
const failedVersion = (await getPrevisionnelWorkbookVersion(dc, { id: failedVersionId }, options)).data.previsionnelWorkbookVersion
assert(failedVersion, 'Version de simulation failed introuvable.')

try {
  await generatePrevisionnelWorkbookVersion({
    version: failedVersion,
    latestGeneratedVersion: null,
    cellEdits: cellEditsResponse.data.previsionnelCellEdits,
    storage: failingStorageAdapter(),
  })
  throw new Error('La generation aurait du echouer avec Storage indisponible.')
} catch (error) {
  await markPrevisionnelWorkbookVersionFailed(
    dc,
    {
      id: failedVersionId,
      errorMessage: error instanceof Error ? error.message : 'erreur inconnue',
    },
    options,
  )
}

const failedFinal = (await getPrevisionnelWorkbookVersion(dc, { id: failedVersionId }, options)).data.previsionnelWorkbookVersion
const cellStillExists = (await listPrevisionnelCellEdits(dc, { sourceSheet: exercise.sheet }, options)).data.previsionnelCellEdits.some(
  item => item.id === editId,
)

const sourceBuffer = await storage.read(PREVISIONNEL_SOURCE_STORAGE_PATH)
await storage.write(PREVISIONNEL_CURRENT_STORAGE_PATH, sourceBuffer)
const resetCurrentBuffer = await storage.read(PREVISIONNEL_CURRENT_STORAGE_PATH)
const currentResetSha256 = sha256(resetCurrentBuffer)

const checks = {
  sourceOriginalMocked: source.storagePath === PREVISIONNEL_SOURCE_STORAGE_PATH,
  pendingCreated: Boolean(version),
  generatedStatus: finalVersion.status === 'generated',
  versionFileWritten: versionBuffer.length > 0,
  currentFileWritten: currentBuffer.length > 0,
  generatedHashStored: finalVersion.sha256 === generated.sha256,
  cellEditApplied: workbook.getWorksheet(exercise.sheet)?.getCell(cellRef).value === numericValue,
  failedStatusStored: failedFinal?.status === 'failed',
  sqlEditKeptAfterFailure: cellStillExists,
  currentResetToOriginal: currentResetSha256 === source.sha256,
}
const failures = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name)

const proof = {
  mode: 'local-emulator',
  storageMode: 'local-tmp-mock',
  generatedAt: new Date().toISOString(),
  actorUid: actor.id,
  exercise: { id: exercise.id, sheet: exercise.sheet },
  source,
  edit: { id: editId, cellRef, numericValue },
  version: {
    id: finalVersion.id,
    status: finalVersion.status,
    storagePath: finalVersion.storagePath,
    currentStoragePath: finalVersion.currentStoragePath,
    sha256: finalVersion.sha256,
    sizeBytes: finalVersion.sizeBytes,
  },
  failedVersion: {
    id: failedFinal?.id,
    status: failedFinal?.status,
    errorMessage: failedFinal?.errorMessage,
  },
  cleanup: {
    currentResetToOriginal: currentResetSha256 === source.sha256,
    currentSha256AfterReset: currentResetSha256,
    storageArtifactsRemoved: !keepArtifacts,
  },
  checks,
}

if (!keepArtifacts) {
  await rm(storageRoot, { recursive: true, force: true })
}

await writeOutput(proof)
console.log(JSON.stringify(proof, null, 2))

if (failures.length > 0) {
  console.error(`Verification version Excel previsionnel KO:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
