import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { posix, resolve } from 'node:path'
import JSZip from 'jszip'

const SHEET = '2025-26'
const WORKBOOK_PATH = resolve('public/excel/previsionnel-template.xlsx')
const CURRENT_SHEET_PATH = resolve('src/data/previsionnelCurrentSheet.ts')
const SEED_PATH = resolve('dataconnect/previsionnel_seed_data.gql')
const editableSourceLineTypes = new Set(['chantier', 'commission', 'avoir', 'remboursement', 'facturation', 'example'])

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

function extractSeedExercise(seedSource) {
  const blocks = seedSource.match(/    \{[\s\S]*?\n    \}/g) ?? []
  const block = blocks.find(item => /sheet:\s*"2025-26"/.test(item))
  if (!block) throw new Error(`Exercice ${SHEET} absent de ${SEED_PATH}`)
  return block
}

function extractSeedImportBatch(seedSource) {
  const block = (seedSource.match(/    \{[\s\S]*?\n    \}/g) ?? []).find(item => /workbook:\s*"PREVISIONNEL.xlsx"/.test(item))
  if (!block) throw new Error(`Batch import PREVISIONNEL.xlsx absent de ${SEED_PATH}`)
  return block
}

function seedNumber(block, field) {
  const match = new RegExp(`${field}:\\s*(-?\\d+(?:\\.\\d+)?)`).exec(block)
  if (!match) throw new Error(`Champ ${field} absent du seed ${SHEET}`)
  return Number(match[1])
}

function seedStringOrNull(block, field) {
  const match = new RegExp(`${field}:\\s*((?:"(?:\\\\.|[^"])*")|null)`).exec(block)
  if (!match) throw new Error(`Champ ${field} absent du seed ${SHEET}`)
  return match[1] === 'null' ? null : JSON.parse(match[1])
}

function seedNumberOrNull(block, field) {
  const match = new RegExp(`${field}:\\s*(-?\\d+(?:\\.\\d+)?|null)`).exec(block)
  if (!match) throw new Error(`Champ ${field} absent du seed ${SHEET}`)
  return match[1] === 'null' ? null : Number(match[1])
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

function extractSeedCellEdits(seedSource) {
  const blocks = seedSource.match(/    \{[\s\S]*?\n    \}/g) ?? []
  return blocks
    .filter(block => /cellRef:/.test(block) && /sourceSheet:\s*"2025-26"/.test(block))
    .map(block => ({
      id: seedStringOrNull(block, 'id'),
      sourceSheet: seedStringOrNull(block, 'sourceSheet'),
      cellRef: seedStringOrNull(block, 'cellRef'),
      valueText: seedStringOrNull(block, 'valueText'),
      numericValue: seedNumberOrNull(block, 'numericValue'),
    }))
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

const currentSource = readFileSync(CURRENT_SHEET_PATH, 'utf8')
const currentSheet = extractJsonConst(currentSource, 'currentPrevisionnelSheet', CURRENT_SHEET_PATH)
const seedSource = readFileSync(SEED_PATH, 'utf8')
const seedImportBatch = extractSeedImportBatch(seedSource)
const seedExercise = extractSeedExercise(seedSource)
const expectedCells = sourceEditableCells(currentSheet)
const seedCells = extractSeedCellEdits(seedSource)
const seedCellsByRef = new Map(seedCells.map(cell => [cell.cellRef, cell]))
const workbookCells = await readWorkbookSummaryCells()

const checks = [
  {
    ref: 'D171',
    formula: 'SUM(D8:D170)',
    sourceValue: sumRange(currentSheet, 'D', 8, 170),
    seedField: 'caPrevision',
  },
  {
    ref: 'E171',
    formula: 'SUM(E32:E170)',
    sourceValue: sumRange(currentSheet, 'E', 32, 170),
    seedField: 'caContrat',
  },
  {
    ref: 'F171',
    formula: 'SUM(F32:F132)',
    sourceValue: sumRange(currentSheet, 'F', 32, 132),
    seedField: 'plannedTotal',
  },
]

const failures = []
const workbookHash = createHash('sha256').update(readFileSync(WORKBOOK_PATH)).digest('hex')
const seedWorkbookHash = seedStringOrNull(seedImportBatch, 'workbookHash')

if (seedWorkbookHash !== workbookHash) {
  failures.push(`Hash workbook: attendu ${workbookHash}, obtenu ${seedWorkbookHash ?? 'null'}`)
}

for (const check of checks) {
  const workbookCell = workbookCells[check.ref]
  const seedValue = seedNumber(seedExercise, check.seedField)

  if (workbookCell.formula !== check.formula) {
    failures.push(`${check.ref}: formule Excel attendue ${check.formula}, obtenue ${workbookCell.formula}`)
  }

  assertNear(failures, `${check.ref} workbook vs feuille TS`, workbookCell.value, check.sourceValue)
  assertNear(failures, `${check.ref} seed ${check.seedField}`, seedValue, workbookCell.value)
}

if (seedCells.length !== expectedCells.length) {
  failures.push(`Cellules exactes SQL: attendu ${expectedCells.length}, obtenu ${seedCells.length}`)
}

for (const expectedCell of expectedCells) {
  const seedCell = seedCellsByRef.get(expectedCell.cellRef)
  if (!seedCell) {
    failures.push(`Cellule source ${expectedCell.cellRef} absente du seed PrevisionnelCellEdit`)
    continue
  }

  if (seedCell.id !== expectedCell.id) {
    failures.push(`Cellule ${expectedCell.cellRef}: id seed attendu ${expectedCell.id}, obtenu ${seedCell.id}`)
  }

  if (seedCell.valueText !== expectedCell.valueText) {
    failures.push(`Cellule ${expectedCell.cellRef}: texte attendu ${expectedCell.valueText ?? 'null'}, obtenu ${seedCell.valueText ?? 'null'}`)
  }

  if (seedCell.numericValue !== null || expectedCell.numericValue !== null) {
    assertNear(
      failures,
      `Cellule ${expectedCell.cellRef}: valeur numerique`,
      seedCell.numericValue ?? 0,
      expectedCell.numericValue ?? 0,
    )
  }
}

if (failures.length) {
  console.error('Verification source Excel previsionnel en echec:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

const rawContrat = sumRange(currentSheet, 'E', 8, 170)
const excludedContrat = sumRange(currentSheet, 'E', 8, 31)
const officialContrat = sumRange(currentSheet, 'E', 32, 170)

console.log('Verification source Excel previsionnel OK.')
console.log(`- Workbook hash: ${workbookHash}`)
for (const check of checks) {
  const workbookCell = workbookCells[check.ref]
  console.log(`- ${check.ref} ${workbookCell.formula}: ${formatEuro(workbookCell.value)} -> seed.${check.seedField}`)
}
console.log(`- Contrat brut E8:E170: ${formatEuro(rawContrat)}`)
console.log(`- Contrat exclu E8:E31: ${formatEuro(excludedContrat)}`)
console.log(`- Contrat officiel E32:E170: ${formatEuro(officialContrat)}`)
console.log(`- Cellules exactes editables seedees: ${seedCells.length}`)
