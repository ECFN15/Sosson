import { mkdir, writeFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import {
  connectorConfig,
  listPrevisionnelCellEdits,
  listPrevisionnelExercises,
  listPrevisionnelLinesByExercise,
  updatePrevisionnelMonthlyAmount,
  upsertPrevisionnelCellEdit,
} from '@dataconnect/admin-generated'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399
const repoRoot = process.cwd()
const outputArg = process.argv.find(arg => arg.startsWith('--output='))
const outputPath = outputArg?.slice('--output='.length) || 'tmp/checkpoint-002/previsionnel-edits-local.json'
const targetSheet = '2025-26'

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

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function roundAmount(value) {
  return Number(value.toFixed(2))
}

function sameAmount(left, right) {
  return Math.abs((left ?? 0) - (right ?? 0)) < 0.001
}

function monthlySnapshot(monthly) {
  return {
    id: monthly.id,
    month: monthly.month,
    label: monthly.label,
    monthOrder: monthly.monthOrder,
    planned: monthly.planned ?? null,
    realized: monthly.realized ?? null,
    invoiceSent: Boolean(monthly.invoiceSent),
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
  console.error(`Preuve edition previsionnel SQL locale ecrite dans ${relative}`)
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
  id: 'previsionnel-edit-local',
  email: 'previsionnel.edit@sosson.local',
  nom: 'Previsionnel',
  prenom: 'Edit',
  role: 'assistante',
  avatar: 'PE',
}
const options = impersonate(actor.id, actor.email)
const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)

await dc.upsert('User', actor)

const exercisesResponse = await listPrevisionnelExercises(dc, options)
const exercise =
  exercisesResponse.data.previsionnelExercises.find(item => item.sheet === targetSheet) ??
  exercisesResponse.data.previsionnelExercises.at(-1)
assert(exercise, 'Aucun exercice previsionnel local disponible.')

const linesResponse = await listPrevisionnelLinesByExercise(dc, { exerciseId: exercise.id }, options)
const line = linesResponse.data.previsionnelLines.find(item => item.monthly.length > 0)
assert(line, `Aucune ligne mensuelle disponible pour l exercice ${exercise.sheet}.`)

const monthly = line.monthly[0]
const before = monthlySnapshot(monthly)
const next = {
  id: monthly.id,
  planned: roundAmount((before.planned ?? 0) + 123.45),
  realized: roundAmount((before.realized ?? 0) + 67.89),
  invoiceSent: !before.invoiceSent,
}

await updatePrevisionnelMonthlyAmount(dc, next, options)

const afterUpdateLines = await listPrevisionnelLinesByExercise(dc, { exerciseId: exercise.id }, options)
const afterUpdateLine = afterUpdateLines.data.previsionnelLines.find(item => item.id === line.id)
const afterUpdateMonthly = afterUpdateLine?.monthly.find(item => item.id === monthly.id)
assert(afterUpdateMonthly, 'Montant mensuel modifie introuvable apres update.')

await updatePrevisionnelMonthlyAmount(
  dc,
  {
    id: monthly.id,
    planned: before.planned,
    realized: before.realized,
    invoiceSent: before.invoiceSent,
  },
  options,
)

const afterRevertLines = await listPrevisionnelLinesByExercise(dc, { exerciseId: exercise.id }, options)
const afterRevertLine = afterRevertLines.data.previsionnelLines.find(item => item.id === line.id)
const afterRevertMonthly = afterRevertLine?.monthly.find(item => item.id === monthly.id)
assert(afterRevertMonthly, 'Montant mensuel modifie introuvable apres restauration.')

const cellRef = 'ZZ999'
const cellEditId = `verify-${exercise.sheet}-${cellRef}`.replace(/[^a-zA-Z0-9_-]/g, '-')
const numericValue = 1000 + Number(stamp.slice(-6))
await upsertPrevisionnelCellEdit(
  dc,
  {
    id: cellEditId,
    sourceSheet: exercise.sheet,
    cellRef,
    valueText: `preuve locale ${stamp}`,
    numericValue,
  },
  options,
)

const cellEditsResponse = await listPrevisionnelCellEdits(dc, { sourceSheet: exercise.sheet }, options)
const cellEdit = cellEditsResponse.data.previsionnelCellEdits.find(item => item.id === cellEditId)

const updateSnapshot = monthlySnapshot(afterUpdateMonthly)
const revertSnapshot = monthlySnapshot(afterRevertMonthly)

const checks = {
  exerciseFound: Boolean(exercise),
  monthlyUpdateApplied:
    sameAmount(updateSnapshot.planned, next.planned) &&
    sameAmount(updateSnapshot.realized, next.realized) &&
    updateSnapshot.invoiceSent === next.invoiceSent,
  monthlySeedStateReverted:
    sameAmount(revertSnapshot.planned, before.planned) &&
    sameAmount(revertSnapshot.realized, before.realized) &&
    revertSnapshot.invoiceSent === before.invoiceSent,
  cellEditUpserted:
    Boolean(cellEdit) &&
    cellEdit?.cellRef === cellRef &&
    cellEdit?.valueText === `preuve locale ${stamp}` &&
    cellEdit?.numericValue === numericValue,
}

const failures = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name)

const proof = {
  mode: 'local-emulator',
  mutatesData: true,
  revertsMonthlySeedState: true,
  createsOrUpdatesCellEdit: true,
  countSafeBecauseRunsAfterCleanCount: true,
  generatedAt: new Date().toISOString(),
  actorUid: actor.id,
  exercise: {
    id: exercise.id,
    sheet: exercise.sheet,
    lineCount: exercise.lineCount,
  },
  line: {
    id: line.id,
    sourceRow: line.sourceRow,
    rawName: line.rawName,
  },
  monthly: {
    before,
    afterUpdate: updateSnapshot,
    afterRevert: revertSnapshot,
  },
  cellEdit: cellEdit
    ? {
        id: cellEdit.id,
        sourceSheet: cellEdit.sourceSheet,
        cellRef: cellEdit.cellRef,
        valueText: cellEdit.valueText,
        numericValue: cellEdit.numericValue,
      }
    : null,
  checks,
}

await writeOutput(proof)
console.log(JSON.stringify(proof, null, 2))

if (failures.length > 0) {
  console.error(`Verification edition previsionnel SQL KO:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
