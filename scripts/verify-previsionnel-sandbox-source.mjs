import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { posix, resolve } from 'node:path'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import JSZip from 'jszip'
import {
  connectorConfig,
  getCurrentUser,
  listPrevisionnelCellEdits,
  listPrevisionnelExercises,
} from '@dataconnect/admin-generated'

const SHEET = '2025-26'
const WORKBOOK_PATH = resolve('public/excel/previsionnel-template.xlsx')
const CURRENT_SHEET_PATH = resolve('src/data/previsionnelCurrentSheet.ts')
const repoRoot = process.cwd()
const editableSourceLineTypes = new Set(['chantier', 'commission', 'avoir', 'remboursement', 'facturation', 'example'])

const args = new Set(process.argv.slice(2))
const sandbox = args.has('--sandbox')
const yesSandbox = args.has('--yes-sandbox')
const dryRun = args.has('--dry-run')
const userProfilesArg = process.argv.find(arg => arg.startsWith('--user-profiles='))
const userProfilesPath = userProfilesArg?.slice('--user-profiles='.length)
const outputArg = process.argv.find(arg => arg.startsWith('--output='))
const outputPath = outputArg?.slice('--output='.length)

function decodeXml(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function getAttr(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`\\b${escaped}="([^"]*)"`).exec(tag)
  return match ? decodeXml(match[1]) : null
}

function extractJsonConst(source, name, filePath) {
  const marker = `export const ${name}`
  const start = source.indexOf(marker)
  if (start < 0) throw new Error(`Impossible de lire ${name} dans ${filePath}`)

  const equals = source.indexOf('=', start)
  let index = equals + 1
  while (/\s/.test(source[index])) index += 1

  const open = source[index]
  const close = open === '[' ? ']' : open === '{' ? '}' : null
  if (!close) throw new Error(`Constante ${name} non JSON dans ${filePath}`)

  let depth = 0
  let inString = false
  let escaped = false

  for (let cursor = index; cursor < source.length; cursor += 1) {
    const char = source[cursor]

    if (inString) {
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') {
      inString = true
      continue
    }

    if (char === open) depth += 1
    if (char === close) {
      depth -= 1
      if (depth === 0) return JSON.parse(source.slice(index, cursor + 1))
    }
  }

  throw new Error(`Fin JSON introuvable pour ${name} dans ${filePath}`)
}

function round2(value) {
  return Number.isFinite(value) ? Number(value.toFixed(2)) : 0
}

function formatEuro(value) {
  return round2(value).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function cellNumber(sheet, rowNumber, col) {
  const row = sheet.rows.find(item => item.rowNumber === rowNumber)
  const value = row?.cells.find(cell => cell.col === col)?.value
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function sumRange(sheet, col, start, end) {
  let total = 0
  for (let rowNumber = start; rowNumber <= end; rowNumber += 1) {
    total += cellNumber(sheet, rowNumber, col)
  }
  return round2(total)
}

function realizedTotal(sheet) {
  return round2(sheet.monthPairs.reduce((sum, pair) => sum + cellNumber(sheet, 174, pair.realized), 0))
}

function sourceEditableCells(sheet) {
  return sheet.rows.flatMap(row =>
    row.cells
      .filter(cell => {
        if (!editableSourceLineTypes.has(row.lineType)) return false
        if (!cell.editable) return false
        if (cell.value === null || cell.value === undefined) return false
        if (typeof cell.value === 'string' && cell.value === '') return false
        return true
      })
      .map(cell => ({
        id: `${sheet.sheet}:${cell.ref}`,
        sourceSheet: sheet.sheet,
        cellRef: cell.ref,
        valueText: typeof cell.value === 'string' ? cell.value : null,
        numericValue: typeof cell.value === 'number' && Number.isFinite(cell.value) ? round2(cell.value) : null,
      })),
  )
}

async function readWorkbookSummaryCells() {
  const zip = await JSZip.loadAsync(readFileSync(WORKBOOK_PATH))
  const workbookXml = await zip.file('xl/workbook.xml')?.async('string')
  const relsXml = await zip.file('xl/_rels/workbook.xml.rels')?.async('string')
  if (!workbookXml || !relsXml) throw new Error(`Classeur Excel invalide: ${WORKBOOK_PATH}`)

  const sheetTag = (workbookXml.match(/<sheet\b[^>]*>/g) ?? []).find(tag => getAttr(tag, 'name') === SHEET)
  if (!sheetTag) throw new Error(`Onglet ${SHEET} absent de ${WORKBOOK_PATH}`)

  const relId = getAttr(sheetTag, 'r:id')
  const relTag = (relsXml.match(/<Relationship\b[^>]*>/g) ?? []).find(tag => getAttr(tag, 'Id') === relId)
  const target = relTag ? getAttr(relTag, 'Target') : null
  if (!target) throw new Error(`Relation Excel introuvable pour ${SHEET}`)

  const worksheetPath = target.startsWith('/')
    ? target.slice(1)
    : posix.normalize(`xl/${target}`)
  const worksheetXml = await zip.file(worksheetPath)?.async('string')
  if (!worksheetXml) throw new Error(`Worksheet introuvable: ${worksheetPath}`)

  return Object.fromEntries(
    ['D171', 'E171', 'F171'].map(ref => {
      const cellMatch = new RegExp(`<c\\b[^>]*\\br="${ref}"[^>]*>([\\s\\S]*?)</c>`).exec(worksheetXml)
      if (!cellMatch) throw new Error(`Cellule ${ref} absente de ${WORKBOOK_PATH}`)

      const formula = decodeXml((/<f[^>]*>([\s\S]*?)<\/f>/.exec(cellMatch[1])?.[1] ?? '').trim())
      const value = Number(decodeXml((/<v>([\s\S]*?)<\/v>/.exec(cellMatch[1])?.[1] ?? '').trim()))
      if (!Number.isFinite(value)) throw new Error(`Valeur Excel non numerique pour ${ref}`)

      return [ref, { formula, value: round2(value) }]
    }),
  )
}

function assertNear(failures, label, actual, expected) {
  if (Math.abs(round2(actual) - round2(expected)) > 0.01) {
    failures.push(`${label}: attendu ${formatEuro(expected)}, obtenu ${formatEuro(actual)}`)
  }
}

function fingerprintUid(uid) {
  return createHash('sha256').update(uid).digest('hex').slice(0, 12)
}

function emailDomain(email) {
  return email.includes('@') ? email.split('@').pop() : null
}

async function loadKnownProfiles() {
  if (!userProfilesPath) return []
  const content = await readFile(userProfilesPath, 'utf8')
  const parsed = JSON.parse(content)
  if (!Array.isArray(parsed)) throw new Error('Le fichier --user-profiles doit contenir un tableau JSON.')
  return parsed
    .filter(profile => profile && typeof profile.uid === 'string' && typeof profile.email === 'string')
    .map(profile => ({
      uid: profile.uid.trim(),
      email: profile.email.trim(),
      expectedRole: typeof profile.role === 'string' ? profile.role.trim() : null,
    }))
}

async function writeOutputIfRequested(payload) {
  if (!outputPath) return

  const resolved = resolve(repoRoot, outputPath)
  const relative = posix.normalize(outputPath.replace(/\\/g, '/'))
  if (relative.startsWith('../') || relative.startsWith('/')) {
    throw new Error('--output doit rester dans le repo.')
  }
  if (!relative.startsWith('tmp/')) {
    throw new Error('--output doit pointer sous tmp/ pour eviter de committer des preuves sandbox par accident.')
  }

  await mkdir(resolve(repoRoot, relative, '..'), { recursive: true })
  await writeFile(resolved, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.error(`Preuve de verification sandbox ecrite dans ${relative}`)
}

if (dryRun) {
  const payload = {
    mode: sandbox ? 'sandbox' : 'local-emulator',
    userProfilesPath: userProfilesPath ?? null,
    outputPath: outputPath ?? null,
    mutatesData: false,
    note: 'Dry-run uniquement: aucune lecture Data Connect executee.',
  }
  await writeOutputIfRequested(payload)
  console.log(JSON.stringify(payload, null, 2))
  process.exit(0)
}

if (!sandbox || !yesSandbox || process.env.ALLOW_SANDBOX_DATACONNECT_READ !== 'true') {
  console.error(
    'Verification sandbox bloquee.\n' +
      'Cette commande lit une base distante reelle. Relancer apres validation avec:\n' +
      'ALLOW_SANDBOX_DATACONNECT_READ=true npm run verify:previsionnel:sandbox-source -- --sandbox --yes-sandbox'
  )
  process.exit(1)
}

if (!userProfilesPath || userProfilesPath.endsWith('user_profiles.example.json')) {
  console.error('Verification sandbox bloquee: --user-profiles doit pointer vers un fichier local avec de vrais UID sandbox.')
  process.exit(1)
}

if (!outputPath) {
  console.error('Verification sandbox bloquee: --output sous tmp/ est obligatoire.')
  process.exit(1)
}

if (getApps().length === 0) {
  initializeApp({ projectId: 'sosson-sandbox' })
}

const currentSource = readFileSync(CURRENT_SHEET_PATH, 'utf8')
const currentSheet = extractJsonConst(currentSource, 'currentPrevisionnelSheet', CURRENT_SHEET_PATH)
const expectedCells = sourceEditableCells(currentSheet)
const expectedCellsByRef = new Map(expectedCells.map(cell => [cell.cellRef, cell]))
const workbookCells = await readWorkbookSummaryCells()
const workbookHash = createHash('sha256').update(readFileSync(WORKBOOK_PATH)).digest('hex')
const knownProfiles = await loadKnownProfiles()

if (knownProfiles.length === 0) {
  console.error('Verification sandbox bloquee: aucun profil UID exploitable dans --user-profiles.')
  process.exit(1)
}

const dc = getDataConnect(connectorConfig)
const userChecks = []

for (const profile of knownProfiles) {
  const response = await getCurrentUser(dc, {
    impersonate: {
      authClaims: {
        sub: profile.uid,
        uid: profile.uid,
        email: profile.email,
        email_verified: true,
      },
    },
  })
  userChecks.push({
    uidFingerprint: fingerprintUid(profile.uid),
    emailDomain: emailDomain(profile.email),
    expectedRole: profile.expectedRole,
    exists: Boolean(response.data.user),
    role: response.data.user?.role ?? null,
    roleMatches: profile.expectedRole ? response.data.user?.role === profile.expectedRole : null,
  })
}

const invalidProfiles = userChecks.filter(check => !check.exists || check.roleMatches === false)
if (invalidProfiles.length > 0) {
  console.error('Verification sandbox bloquee: profils SQL User attendus absents ou roles incoherents.')
  for (const check of invalidProfiles) {
    console.error(
      `- uidFingerprint=${check.uidFingerprint} domain=${check.emailDomain ?? 'inconnu'} ` +
        `exists=${check.exists} role=${check.role ?? 'absent'} expectedRole=${check.expectedRole ?? 'non-renseigne'}`
    )
  }
  process.exit(1)
}

const [exercisesResponse, cellEditsResponse] = await Promise.all([
  listPrevisionnelExercises(dc),
  listPrevisionnelCellEdits(dc, { sourceSheet: SHEET }),
])

const exercises = exercisesResponse.data.previsionnelExercises
const exercise = exercises.find(item => item.sheet === SHEET)
const sqlCells = cellEditsResponse.data.previsionnelCellEdits
const sqlCellsByRef = new Map(sqlCells.map(cell => [cell.cellRef, cell]))
const failures = []

if (exercises.length !== 13) failures.push(`Exercices sandbox: attendu 13, obtenu ${exercises.length}`)
if (!exercise) failures.push(`Exercice sandbox ${SHEET} absent.`)

if (exercise) {
  if (exercise.batch.workbookHash !== workbookHash) {
    failures.push(`Hash workbook sandbox: attendu ${workbookHash}, obtenu ${exercise.batch.workbookHash ?? 'null'}`)
  }

  const checks = [
    {
      ref: 'D171',
      formula: 'SUM(D8:D170)',
      sourceValue: sumRange(currentSheet, 'D', 8, 170),
      sandboxField: 'caPrevision',
      sandboxValue: exercise.caPrevision,
    },
    {
      ref: 'E171',
      formula: 'SUM(E32:E170)',
      sourceValue: sumRange(currentSheet, 'E', 32, 170),
      sandboxField: 'caContrat',
      sandboxValue: exercise.caContrat,
    },
    {
      ref: 'F171',
      formula: 'SUM(F32:F132)',
      sourceValue: sumRange(currentSheet, 'F', 32, 132),
      sandboxField: 'plannedTotal',
      sandboxValue: exercise.plannedTotal,
    },
  ]

  for (const check of checks) {
    const workbookCell = workbookCells[check.ref]
    if (workbookCell.formula !== check.formula) {
      failures.push(`${check.ref}: formule Excel attendue ${check.formula}, obtenue ${workbookCell.formula}`)
    }
    assertNear(failures, `${check.ref} workbook vs feuille TS`, workbookCell.value, check.sourceValue)
    assertNear(failures, `${check.ref} sandbox ${check.sandboxField}`, check.sandboxValue, workbookCell.value)
  }

  assertNear(failures, 'realizedTotal sandbox', exercise.realizedTotal, realizedTotal(currentSheet))
}

if (sqlCells.length !== expectedCells.length) {
  failures.push(`Cellules exactes sandbox: attendu ${expectedCells.length}, obtenu ${sqlCells.length}`)
}

for (const expectedCell of expectedCells) {
  const sqlCell = sqlCellsByRef.get(expectedCell.cellRef)
  if (!sqlCell) {
    failures.push(`Cellule source ${expectedCell.cellRef} absente de PrevisionnelCellEdit sandbox`)
    continue
  }

  if (sqlCell.id !== expectedCell.id) {
    failures.push(`Cellule ${expectedCell.cellRef}: id sandbox attendu ${expectedCell.id}, obtenu ${sqlCell.id}`)
  }

  if ((sqlCell.valueText ?? null) !== expectedCell.valueText) {
    failures.push(
      `Cellule ${expectedCell.cellRef}: texte attendu ${expectedCell.valueText ?? 'null'}, ` +
        `obtenu ${sqlCell.valueText ?? 'null'}`
    )
  }

  if (sqlCell.numericValue !== null || expectedCell.numericValue !== null) {
    assertNear(
      failures,
      `Cellule ${expectedCell.cellRef}: valeur numerique`,
      sqlCell.numericValue ?? 0,
      expectedCell.numericValue ?? 0,
    )
  }
}

const unexpectedSqlCells = sqlCells.filter(cell => !expectedCellsByRef.has(cell.cellRef))
if (unexpectedSqlCells.length > 0) {
  failures.push(`Cellules sandbox inattendues: ${unexpectedSqlCells.slice(0, 10).map(cell => cell.cellRef).join(', ')}`)
}

if (failures.length) {
  console.error('Verification sandbox previsionnel en echec:')
  for (const failure of failures.slice(0, 100)) console.error(`- ${failure}`)
  if (failures.length > 100) console.error(`- ... ${failures.length - 100} autres erreurs`)
  process.exit(1)
}

const payload = {
  mode: 'sandbox',
  generatedAt: new Date().toISOString(),
  sheet: SHEET,
  workbookHash,
  exercises: exercises.length,
  sourceCells: expectedCells.length,
  sandboxCells: sqlCells.length,
  sqlUserProfiles: userChecks,
  checks: {
    D171: {
      formula: workbookCells.D171.formula,
      value: round2(workbookCells.D171.value),
      sandboxField: 'caPrevision',
      sandboxValue: round2(exercise.caPrevision),
    },
    E171: {
      formula: workbookCells.E171.formula,
      value: round2(workbookCells.E171.value),
      sandboxField: 'caContrat',
      sandboxValue: round2(exercise.caContrat),
      rawE8E170: sumRange(currentSheet, 'E', 8, 170),
      excludedE8E31: sumRange(currentSheet, 'E', 8, 31),
    },
    F171: {
      formula: workbookCells.F171.formula,
      value: round2(workbookCells.F171.value),
      sandboxField: 'plannedTotal',
      sandboxValue: round2(exercise.plannedTotal),
    },
    realizedTotal: {
      value: realizedTotal(currentSheet),
      sandboxValue: round2(exercise.realizedTotal),
    },
  },
}

await writeOutputIfRequested(payload)

console.log('Verification sandbox previsionnel OK.')
console.log(`- Workbook hash: ${workbookHash}`)
console.log(`- Exercices sandbox: ${exercises.length}`)
console.log(`- D171 ${workbookCells.D171.formula}: ${formatEuro(workbookCells.D171.value)} -> sandbox.caPrevision`)
console.log(`- E171 ${workbookCells.E171.formula}: ${formatEuro(workbookCells.E171.value)} -> sandbox.caContrat`)
console.log(`- F171 ${workbookCells.F171.formula}: ${formatEuro(workbookCells.F171.value)} -> sandbox.plannedTotal`)
console.log(`- Cellules exactes sandbox ${SHEET}: ${sqlCells.length}`)
