import { describe, expect, it } from 'vitest'
import { buildDomainDataState, dataSourceLabels, toDataErrorMessage } from './dataState'

describe('dataState', () => {
  it('marks non-SQL sources as unsynced by default', () => {
    const state = buildDomainDataState({
      data: { count: 1 },
      source: 'excel',
      status: 'ready',
    })

    expect(state).toMatchObject({
      data: { count: 1 },
      source: 'excel',
      status: 'ready',
      error: null,
      hasUnsyncedLocalChanges: true,
    })
  })

  it('does not mark SQL Connect data as unsynced by default', () => {
    const state = buildDomainDataState({
      data: [],
      source: 'dataconnect',
      status: 'empty',
    })

    expect(state.hasUnsyncedLocalChanges).toBe(false)
  })

  it('normalizes unknown errors without losing explicit overrides', () => {
    const state = buildDomainDataState({
      data: null,
      source: 'local',
      status: 'error',
      error: new Error('SQL indisponible'),
      hasUnsyncedLocalChanges: false,
    })

    expect(state.error).toBe('SQL indisponible')
    expect(state.hasUnsyncedLocalChanges).toBe(false)
    expect(toDataErrorMessage('erreur brute')).toBe('erreur brute')
  })

  it('keeps stable source labels for UI badges', () => {
    expect(dataSourceLabels).toEqual({
      dataconnect: 'SQL Connect',
      excel: 'Excel local',
      seed: 'Seed local',
      local: 'Brouillon local',
    })
  })
})
