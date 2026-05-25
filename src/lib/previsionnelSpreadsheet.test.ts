import { describe, expect, it } from 'vitest'

import type {
  CurrentPrevisionnelSheet,
  CurrentSheetCell,
  CurrentSheetLineType,
  CurrentSheetRow,
} from '../data/previsionnelCurrentSheet'
import {
  buildSpreadsheetView,
  checkpointCellUpdates,
  columnNumber,
  editableCellRefs,
  editableSpreadsheetRefAt,
  formatSpreadsheetValue,
  nextEditableSpreadsheetRef,
  normalizeSpreadsheetInput,
  parseSpreadsheetNumber,
  spreadsheetCellPosition,
  spreadsheetCellComparator,
  spreadsheetRef,
} from './previsionnelSpreadsheet'
import type { SpreadsheetCellValue } from './previsionnelSpreadsheet'

function cell(rowNumber: number, col: string, value: SpreadsheetCellValue = null, editable = true): CurrentSheetCell {
  return {
    col,
    ref: `${col}${rowNumber}`,
    value,
    styleId: 0,
    fillId: 0,
    fill: {},
    editable,
  }
}

function row(rowNumber: number, lineType: CurrentSheetLineType, cells: CurrentSheetCell[]): CurrentSheetRow {
  return {
    rowNumber,
    id: `row-${rowNumber}`,
    name: `Row ${rowNumber}`,
    lineType,
    category: 'non_classe',
    cells,
  }
}

function makeSheet(rows: CurrentSheetRow[]): CurrentPrevisionnelSheet {
  return {
    sheet: '2025-26',
    sourceWorkbook: 'unit-test.xlsx',
    columns: [],
    groups: [],
    rows,
    monthPairs: [
      { planned: 'AR', realized: 'AS', label: 'Octobre' },
      { planned: 'AT', realized: 'AU', label: 'Novembre' },
    ],
  }
}

function businessRow(rowNumber: number, values: Partial<Record<string, SpreadsheetCellValue>>): CurrentSheetRow {
  const cols = ['B', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'AQ', 'AR', 'AS', 'AT', 'AU', 'BP']
  return row(
    rowNumber,
    'chantier',
    cols.map(col => cell(rowNumber, col, values[col] ?? null, ['B', 'D', 'E', 'G', 'I', 'AR', 'AS', 'AT', 'AU'].includes(col))),
  )
}

function summaryRow171(): CurrentSheetRow {
  return row(171, 'total', ['D', 'E', 'F'].map(col => cell(171, col, null, false)))
}

function totalRow(rowNumber: number): CurrentSheetRow {
  return row(
    rowNumber,
    'total',
    ['AR', 'AS', 'AT', 'AU'].map(col => cell(rowNumber, col, null, false)),
  )
}

describe('previsionnel spreadsheet parsing and formatting', () => {
  it('parses French spreadsheet numbers and falls back to zero for invalid values', () => {
    expect(parseSpreadsheetNumber(42)).toBe(42)
    expect(parseSpreadsheetNumber(null)).toBe(0)
    expect(parseSpreadsheetNumber('')).toBe(0)
    expect(parseSpreadsheetNumber(' 12 345,67 ')).toBe(12345.67)
    expect(parseSpreadsheetNumber('1\u202f234,5')).toBe(1234.5)
    expect(parseSpreadsheetNumber('not a number')).toBe(0)
    expect(parseSpreadsheetNumber(Number.POSITIVE_INFINITY)).toBe(0)
  })

  it('keeps non numeric text visible when formatting a numeric cell', () => {
    expect(formatSpreadsheetValue('#DIV/0!', true)).toBe('#DIV/0!')
    expect(formatSpreadsheetValue(12345.5, true)).toBe('12\u202f345,5')
    expect(formatSpreadsheetValue('', true)).toBe('')
    expect(formatSpreadsheetValue('Client A', false)).toBe('Client A')
  })

  it('normalizes direct cell input without losing comma decimals or explicit blanks', () => {
    expect(normalizeSpreadsheetInput(' 12 345,67 ', true)).toBe('12345,67')
    expect(normalizeSpreadsheetInput('  Client A  ', false)).toBe('  Client A  ')
    expect(normalizeSpreadsheetInput('', true)).toBe('')
  })
})

describe('previsionnel spreadsheet cell references', () => {
  it('lists editable refs and finds refs by column', () => {
    const sheetRow = row(12, 'chantier', [cell(12, 'B', 'Client', true), cell(12, 'H', 0.5, false), cell(12, 'AR', 100, true)])

    expect(spreadsheetRef(sheetRow, 'AR')).toBe('AR12')
    expect(spreadsheetRef(sheetRow, 'ZZ')).toBeUndefined()
    expect(editableCellRefs([sheetRow])).toEqual(['B12', 'AR12'])
    expect(checkpointCellUpdates(makeSheet([sheetRow]))).toEqual({ B12: 'Client', AR12: 100 })
  })

  it('sorts spreadsheet refs by row first, then by column index', () => {
    expect(columnNumber('A')).toBe(1)
    expect(columnNumber('Z')).toBe(26)
    expect(columnNumber('AA')).toBe(27)
    expect(['AA2', 'B10', 'A2', 'Z2', 'A1'].sort(spreadsheetCellComparator)).toEqual([
      'A1',
      'A2',
      'Z2',
      'AA2',
      'B10',
    ])
    expect(spreadsheetCellComparator('invalid-b', 'invalid-a')).toBeGreaterThan(0)
  })

  it('finds cell positions and navigates to editable refs without landing on protected cells', () => {
    const rows = [
      row(10, 'chantier', [cell(10, 'A', null, true), cell(10, 'B', null, false), cell(10, 'C', null, true)]),
      row(11, 'chantier', [cell(11, 'A', null, false), cell(11, 'B', null, true), cell(11, 'C', null, false)]),
      row(12, 'chantier', [cell(12, 'A', null, true), cell(12, 'B', null, true)]),
    ]

    expect(spreadsheetCellPosition(rows, 'B11')).toEqual({ rowIndex: 1, colIndex: 1 })
    expect(spreadsheetCellPosition(rows, 'ZZ99')).toBeNull()
    expect(editableSpreadsheetRefAt(rows, 0, 1, 0, 1)).toBe('C10')
    expect(editableSpreadsheetRefAt(rows, 0, 1, 1, 0)).toBe('B11')
    expect(nextEditableSpreadsheetRef(rows, 'C10', 0, 1, true)).toBe('B11')
    expect(nextEditableSpreadsheetRef(rows, 'A10', 0, -1)).toBeNull()
    expect(nextEditableSpreadsheetRef(rows, 'missing', 0, 1, true)).toBeNull()
  })
})

describe('previsionnel spreadsheet recalculations', () => {
  it('recomputes ratios, line totals, monthly totals, cumulative totals and KPIs', () => {
    const line6 = businessRow(6, {
      B: 'Client A',
      D: 1000,
      E: 900,
      G: 250,
      I: 300,
      AR: 100,
      AS: 70,
      AT: '200,25',
    })
    const line7 = businessRow(7, {
      B: 'Client B',
      D: 2000,
      E: 1800,
      G: 500,
      AR: '50,5',
      AS: 30,
    })
    const sheet = makeSheet([line6, line7, totalRow(173), totalRow(174), totalRow(178), totalRow(179)])

    const view = buildSpreadsheetView(sheet, {}, {})

    expect(view.values.H6).toBe(0.25)
    expect(view.values.J6).toBe(0.3)
    expect(view.values.AQ6).toBe(0.55)
    expect(view.values.BP6).toBe(300.25)
    expect(view.values.H7).toBe(0.25)
    expect(view.values.AQ7).toBe(0.25)
    expect(view.values.BP7).toBe(50.5)

    expect(view.values.AR173).toBe(150.5)
    expect(view.values.AT173).toBe(200.25)
    expect(view.values.AS174).toBe(100)
    expect(view.values.AU174).toBe(0)
    expect(view.values.AR178).toBe(150.5)
    expect(view.values.AT178).toBe(350.75)
    expect(view.values.AS179).toBe(100)
    expect(view.values.AU179).toBe(100)

    expect(view.kpis).toEqual({
      caPrevision: 3000,
      caContrat: 2700,
      monthlyPlanned: 350.75,
    })
    expect(view.rows[0]?.cells.find(item => item.ref === 'BP6')?.value).toBe(300.25)
  })

  it('uses the official Excel 2025-26 summary formulas for row 171 KPIs', () => {
    const sheet = makeSheet([
      businessRow(23, { D: 1000, E: 100, F: 10 }),
      businessRow(30, { D: 2000, E: 200, F: 20 }),
      businessRow(32, { D: 3000, E: 300, F: 30 }),
      businessRow(132, { D: 4000, E: 400, F: 40 }),
      businessRow(133, { D: 5000, E: 500, F: 50 }),
      summaryRow171(),
    ])

    const view = buildSpreadsheetView(sheet, {}, {})

    expect(view.values.D171).toBe(15000)
    expect(view.values.E171).toBe(1200)
    expect(view.values.F171).toBe(70)
    expect(view.kpis).toEqual({
      caPrevision: 15000,
      caContrat: 1200,
      monthlyPlanned: 70,
    })
  })

  it('gives edited values precedence over SQL values and preserves explicit computed-cell overrides', () => {
    const line6 = businessRow(6, {
      D: 1000,
      E: 800,
      G: 250,
      AR: 100,
    })
    const sheet = makeSheet([line6])

    const view = buildSpreadsheetView(sheet, { D6: 1000, H6: 0.99 }, { D6: 500, AR6: 125 })

    expect(view.values.D6).toBe(500)
    expect(view.values.AR6).toBe(125)
    expect(view.values.H6).toBe(0.99)
    expect(view.values.AQ6).toBe(0.5)
    expect(view.values.BP6).toBe(125)
    expect(view.kpis).toEqual({
      caPrevision: 500,
      caContrat: 800,
      monthlyPlanned: 125,
    })
  })

  it('uses spreadsheet division errors when ratio denominators are zero', () => {
    const line6 = businessRow(6, {
      D: 0,
      G: 250,
    })
    const sheet = makeSheet([line6])

    const view = buildSpreadsheetView(sheet, {}, {})

    expect(view.values.H6).toBe('#DIV/0!')
    expect(view.values.AQ6).toBe('#DIV/0!')
  })

  it('treats an explicitly emptied numeric cell as zero while preserving the visible blank', () => {
    const line6 = businessRow(6, {
      D: 1000,
      E: 800,
      G: 250,
      AR: 100,
    })
    const sheet = makeSheet([line6])

    const view = buildSpreadsheetView(sheet, {}, { D6: '', AR6: '' })

    expect(view.rows[0]?.cells.find(item => item.ref === 'D6')?.value).toBe('')
    expect(view.rows[0]?.cells.find(item => item.ref === 'AR6')?.value).toBe('')
    expect(view.values.H6).toBe('#DIV/0!')
    expect(view.values.AQ6).toBe('#DIV/0!')
    expect(view.values.BP6).toBe(0)
    expect(view.kpis).toEqual({
      caPrevision: 0,
      caContrat: 800,
      monthlyPlanned: 0,
    })
  })
})
