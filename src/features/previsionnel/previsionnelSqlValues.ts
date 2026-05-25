import type { CurrentPrevisionnelSheet } from '@/data/previsionnelCurrentSheet'
import type { SpreadsheetCellUpdates } from '@/lib/previsionnelSpreadsheet'

export type PrevisionnelSqlMonthlyAmount = {
  id: string
  monthOrder: number
  planned: number
  realized: number
}

export type PrevisionnelSqlLineForGrid = {
  id: string
  sourceRow: number
  rawName: string
  clientName: string
  caTce: number
  caPrevision: number
  caContrat: number
  monthly: PrevisionnelSqlMonthlyAmount[]
}

export type PrevisionnelSqlCellEditForGrid = {
  cellRef: string
  valueText?: string | null
  numericValue?: number | null
}

export type PrevisionnelSqlCellBinding = {
  monthlyId: string
  field: 'planned' | 'realized'
}

export type PrevisionnelSqlLineBinding = {
  lineId: string
}

export function buildPrevisionnelSqlGridState(
  sheet: CurrentPrevisionnelSheet,
  lines: PrevisionnelSqlLineForGrid[],
  cellEdits: PrevisionnelSqlCellEditForGrid[],
) {
  const values: SpreadsheetCellUpdates = {}
  const cellBindings: Record<string, PrevisionnelSqlCellBinding> = {}
  const lineBindings: Record<number, PrevisionnelSqlLineBinding> = {}

  lines.forEach(line => {
    lineBindings[line.sourceRow] = { lineId: line.id }
    values[`A${line.sourceRow}`] = line.caTce
    values[`B${line.sourceRow}`] = line.clientName || line.rawName
    values[`D${line.sourceRow}`] = line.caPrevision
    values[`E${line.sourceRow}`] = line.caContrat

    line.monthly.forEach(month => {
      const pair = sheet.monthPairs[month.monthOrder - 1]
      if (!pair) return

      const plannedRef = `${pair.planned}${line.sourceRow}`
      const realizedRef = `${pair.realized}${line.sourceRow}`
      values[plannedRef] = month.planned
      values[realizedRef] = month.realized
      cellBindings[plannedRef] = { monthlyId: month.id, field: 'planned' }
      cellBindings[realizedRef] = { monthlyId: month.id, field: 'realized' }
    })
  })

  cellEdits.forEach(cell => {
    values[cell.cellRef] = cell.numericValue ?? cell.valueText ?? ''
  })

  return { values, cellBindings, lineBindings }
}
