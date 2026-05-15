import type {
  CurrentPrevisionnelSheet,
  CurrentSheetColumn,
  CurrentSheetLineType,
  CurrentSheetRow,
} from '@/data/previsionnelCurrentSheet'

export type SpreadsheetCellValue = string | number | null
export type SpreadsheetCellUpdates = Record<string, SpreadsheetCellValue>

export interface SpreadsheetKpis {
  caPrevision: number
  caContrat: number
  monthlyPlanned: number
}

export interface SpreadsheetView {
  rows: CurrentSheetRow[]
  values: SpreadsheetCellUpdates
  kpis: SpreadsheetKpis
}

export interface SpreadsheetCellPosition {
  rowIndex: number
  colIndex: number
}

const businessLineTypes = new Set<CurrentSheetLineType>([
  'chantier',
  'commission',
  'avoir',
  'remboursement',
  'facturation',
])

const lotRatioPairs = [
  ['G', 'H'],
  ['I', 'J'],
  ['K', 'L'],
  ['M', 'N'],
  ['O', 'P'],
  ['Q', 'R'],
  ['S', 'T'],
  ['U', 'V'],
  ['W', 'X'],
  ['Y', 'Z'],
  ['AA', 'AB'],
  ['AC', 'AD'],
  ['AE', 'AF'],
  ['AG', 'AH'],
  ['AI', 'AJ'],
  ['AK', 'AL'],
  ['AM', 'AN'],
  ['AO', 'AP'],
] as const

function round2(value: number) {
  return Number.isFinite(value) ? Number(value.toFixed(2)) : 0
}

export function parseSpreadsheetNumber(value: SpreadsheetCellValue) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (value === null || value === undefined) return 0

  const normalized = String(value)
    .trim()
    .replace(/\s/g, '')
    .replace(/\u202f/g, '')
    .replace(',', '.')

  if (!normalized) return 0
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export function isNumericColumn(column?: CurrentSheetColumn) {
  return column?.kind === 'monthly' || column?.kind === 'ratio' || column?.kind === 'lot' || column?.key === 'D' || column?.key === 'E'
}

export function formatSpreadsheetValue(value: SpreadsheetCellValue, numeric: boolean) {
  if (value === null || value === undefined) return ''
  if (!numeric) return String(value)
  if (typeof value === 'string' && value.trim() !== '' && !Number.isFinite(Number(value.replace(/\s/g, '').replace(',', '.')))) {
    return value
  }

  const parsed = parseSpreadsheetNumber(value)
  if (!Number.isFinite(parsed)) return ''
  return parsed.toLocaleString('fr-FR', {
    maximumFractionDigits: 2,
    useGrouping: Math.abs(parsed) >= 10000,
  })
}

export function normalizeSpreadsheetInput(value: string, numeric: boolean): SpreadsheetCellValue {
  return numeric ? value.replace(/\s/g, '') : value
}

function valueFor(values: SpreadsheetCellUpdates, row: CurrentSheetRow, col: string) {
  const cell = row.cells.find(item => item.col === col)
  if (!cell) return null
  return Object.prototype.hasOwnProperty.call(values, cell.ref) ? values[cell.ref] : cell.value
}

function setComputed(values: SpreadsheetCellUpdates, row: CurrentSheetRow, col: string, value: SpreadsheetCellValue) {
  const cell = row.cells.find(item => item.col === col)
  if (cell && !Object.prototype.hasOwnProperty.call(values, cell.ref)) values[cell.ref] = value
}

function hasUserOverride(edited: SpreadsheetCellUpdates, sqlValues: SpreadsheetCellUpdates, ref: string) {
  return Object.prototype.hasOwnProperty.call(edited, ref) || Object.prototype.hasOwnProperty.call(sqlValues, ref)
}

function isBusinessRow(row: CurrentSheetRow) {
  if (row.rowNumber <= 5) return false
  return businessLineTypes.has(row.lineType)
}

function rowAmount(values: SpreadsheetCellUpdates, row: CurrentSheetRow, col: string) {
  return parseSpreadsheetNumber(valueFor(values, row, col))
}

function recomputeLine(values: SpreadsheetCellUpdates, row: CurrentSheetRow, monthPairs: CurrentPrevisionnelSheet['monthPairs']) {
  if (!isBusinessRow(row)) return

  const caPrevision = rowAmount(values, row, 'D')
  const lotTotal = lotRatioPairs.reduce((sum, [amountCol, ratioCol]) => {
    const amount = rowAmount(values, row, amountCol)
    const ratioCell = row.cells.find(cell => cell.col === ratioCol)
    if (ratioCell && !hasUserOverride({}, values, ratioCell.ref)) {
      values[ratioCell.ref] = caPrevision > 0 ? round2(amount / caPrevision) : '#DIV/0!'
    }
    return sum + amount
  }, 0)

  const plannedTotal = monthPairs.reduce((sum, pair) => sum + rowAmount(values, row, pair.planned), 0)
  setComputed(values, row, 'AQ', caPrevision > 0 ? round2(lotTotal / caPrevision) : '#DIV/0!')
  setComputed(values, row, 'BP', round2(plannedTotal))
}

function sumRows(values: SpreadsheetCellUpdates, rows: CurrentSheetRow[], col: string) {
  return rows.reduce((sum, row) => sum + rowAmount(values, row, col), 0)
}

function recomputeTotalRows(values: SpreadsheetCellUpdates, sheet: CurrentPrevisionnelSheet) {
  const businessRows = sheet.rows.filter(isBusinessRow)
  const byRow = new Map(sheet.rows.map(row => [row.rowNumber, row]))
  const plannedRow = byRow.get(173)
  const realizedRow = byRow.get(174)
  const plannedCumulativeRow = byRow.get(178)
  const realizedCumulativeRow = byRow.get(179)

  let plannedCumulative = 0
  let realizedCumulative = 0

  sheet.monthPairs.forEach(pair => {
    const planned = round2(sumRows(values, businessRows, pair.planned))
    const realized = round2(sumRows(values, businessRows, pair.realized))

    plannedCumulative = round2(plannedCumulative + planned)
    realizedCumulative = round2(realizedCumulative + realized)

    if (plannedRow) setComputed(values, plannedRow, pair.planned, planned)
    if (realizedRow) setComputed(values, realizedRow, pair.realized, realized)
    if (plannedCumulativeRow) setComputed(values, plannedCumulativeRow, pair.planned, plannedCumulative)
    if (realizedCumulativeRow) setComputed(values, realizedCumulativeRow, pair.realized, realizedCumulative)
  })
}

function applyValuesToRows(rows: CurrentSheetRow[], values: SpreadsheetCellUpdates): CurrentSheetRow[] {
  return rows.map(row => ({
    ...row,
    cells: row.cells.map(cell => ({
      ...cell,
      value: Object.prototype.hasOwnProperty.call(values, cell.ref) ? values[cell.ref] : cell.value,
    })),
  }))
}

export function buildSpreadsheetView(
  sheet: CurrentPrevisionnelSheet,
  sqlValues: SpreadsheetCellUpdates,
  edited: SpreadsheetCellUpdates,
): SpreadsheetView {
  const values: SpreadsheetCellUpdates = {}

  sheet.rows.forEach(row => {
    row.cells.forEach(cell => {
      if (Object.prototype.hasOwnProperty.call(sqlValues, cell.ref)) values[cell.ref] = sqlValues[cell.ref]
      if (Object.prototype.hasOwnProperty.call(edited, cell.ref)) values[cell.ref] = edited[cell.ref]
    })
  })

  sheet.rows.forEach(row => recomputeLine(values, row, sheet.monthPairs))
  recomputeTotalRows(values, sheet)

  const businessRows = sheet.rows.filter(isBusinessRow)
  const kpis = {
    caPrevision: round2(sumRows(values, businessRows, 'D')),
    caContrat: round2(sumRows(values, businessRows, 'E')),
    monthlyPlanned: round2(
      businessRows.reduce(
        (sum, row) => sum + sheet.monthPairs.reduce((monthSum, pair) => monthSum + rowAmount(values, row, pair.planned), 0),
        0,
      ),
    ),
  }

  return {
    rows: applyValuesToRows(sheet.rows, values),
    values,
    kpis,
  }
}

export function spreadsheetRef(row: CurrentSheetRow, col: string) {
  return row.cells.find(cell => cell.col === col)?.ref
}

export function editableCellRefs(rows: CurrentSheetRow[]) {
  return rows.flatMap(row => row.cells.filter(cell => cell.editable).map(cell => cell.ref))
}

export function spreadsheetCellPosition(rows: CurrentSheetRow[], ref: string): SpreadsheetCellPosition | null {
  for (const [rowIndex, row] of rows.entries()) {
    const colIndex = row.cells.findIndex(cell => cell.ref === ref)
    if (colIndex >= 0) return { rowIndex, colIndex }
  }
  return null
}

export function editableSpreadsheetRefAt(
  rows: CurrentSheetRow[],
  rowIndex: number,
  colIndex: number,
  rowStep: number,
  colStep: number,
  wrapRows = false,
) {
  if (rowStep !== 0) {
    for (let nextRow = rowIndex; nextRow >= 0 && nextRow < rows.length; nextRow += rowStep) {
      const row = rows[nextRow]
      const boundedCol = Math.max(0, Math.min(colIndex, (row?.cells.length ?? 1) - 1))
      const cell = row?.cells[boundedCol]
      if (cell?.editable) return cell.ref
    }
    return null
  }

  if (colStep !== 0) {
    for (let nextRow = rowIndex; nextRow >= 0 && nextRow < rows.length; nextRow += colStep > 0 ? 1 : -1) {
      const row = rows[nextRow]
      if (!row) return null
      const startCol = nextRow === rowIndex ? colIndex : colStep > 0 ? 0 : row.cells.length - 1

      for (let nextCol = startCol; nextCol >= 0 && nextCol < row.cells.length; nextCol += colStep) {
        const cell = row.cells[nextCol]
        if (cell?.editable) return cell.ref
      }

      if (!wrapRows) return null
    }
  }

  return null
}

export function nextEditableSpreadsheetRef(
  rows: CurrentSheetRow[],
  ref: string,
  rowDelta: number,
  colDelta: number,
  wrapRows = false,
) {
  const position = spreadsheetCellPosition(rows, ref)
  if (!position) return null

  return editableSpreadsheetRefAt(
    rows,
    position.rowIndex + rowDelta,
    position.colIndex + colDelta,
    rowDelta,
    colDelta,
    wrapRows,
  )
}

export function spreadsheetCellComparator(a: string, b: string) {
  const aMatch = /^([A-Z]+)(\d+)$/.exec(a)
  const bMatch = /^([A-Z]+)(\d+)$/.exec(b)
  if (!aMatch || !bMatch) return a.localeCompare(b)
  const rowDelta = Number(aMatch[2]) - Number(bMatch[2])
  if (rowDelta) return rowDelta
  return columnNumber(aMatch[1]) - columnNumber(bMatch[1])
}

export function columnNumber(col: string) {
  return col.split('').reduce((sum, char) => sum * 26 + char.charCodeAt(0) - 64, 0)
}
