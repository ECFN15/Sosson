import { describe, expect, it } from 'vitest'

import type { CurrentPrevisionnelSheet } from '@/data/previsionnelCurrentSheet'
import { buildPrevisionnelSqlGridState } from './previsionnelSqlValues'

const sheet = {
  sheet: '2025-26',
  sourceWorkbook: 'unit-test.xlsx',
  columns: [],
  groups: [],
  rows: [],
  monthPairs: [
    { planned: 'AR', realized: 'AS', label: 'Octobre' },
    { planned: 'AT', realized: 'AU', label: 'Novembre' },
  ],
} satisfies CurrentPrevisionnelSheet

describe('previsionnel SQL grid state', () => {
  it('maps structured SQL rows and exact cell values to spreadsheet refs', () => {
    const state = buildPrevisionnelSqlGridState(
      sheet,
      [
        {
          id: 'line-42',
          sourceRow: 42,
          rawName: 'Raw client',
          clientName: 'Client SQL',
          caTce: 1000,
          caPrevision: 2000,
          caContrat: 3000,
          monthly: [
            { id: 'month-1', monthOrder: 1, planned: 400, realized: 500 },
            { id: 'month-2', monthOrder: 2, planned: 600, realized: 700 },
            { id: 'month-out-of-range', monthOrder: 99, planned: 999, realized: 999 },
          ],
        },
      ],
      [
        { cellRef: 'B42', valueText: 'Nom exact Excel', numericValue: null },
        { cellRef: 'G42', valueText: null, numericValue: 1234.56 },
      ],
    )

    expect(state.values).toMatchObject({
      A42: 1000,
      B42: 'Nom exact Excel',
      D42: 2000,
      E42: 3000,
      G42: 1234.56,
      AR42: 400,
      AS42: 500,
      AT42: 600,
      AU42: 700,
    })
    expect(state.values.AV42).toBeUndefined()
    expect(state.cellBindings).toEqual({
      AR42: { monthlyId: 'month-1', field: 'planned' },
      AS42: { monthlyId: 'month-1', field: 'realized' },
      AT42: { monthlyId: 'month-2', field: 'planned' },
      AU42: { monthlyId: 'month-2', field: 'realized' },
    })
    expect(state.lineBindings).toEqual({ 42: { lineId: 'line-42' } })
  })
})
