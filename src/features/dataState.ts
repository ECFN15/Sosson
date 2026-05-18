export type DataSourceKind = 'dataconnect' | 'excel' | 'seed' | 'local'

export type DataStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

export interface DomainDataState<TData> {
  data: TData
  source: DataSourceKind
  status: DataStatus
  error: string | null
  hasUnsyncedLocalChanges: boolean
}

export function buildDomainDataState<TData>(input: {
  data: TData
  source: DataSourceKind
  status: DataStatus
  error?: unknown
  hasUnsyncedLocalChanges?: boolean
}): DomainDataState<TData> {
  return {
    data: input.data,
    source: input.source,
    status: input.status,
    error: toDataErrorMessage(input.error),
    hasUnsyncedLocalChanges: input.hasUnsyncedLocalChanges ?? input.source !== 'dataconnect',
  }
}

export function toDataErrorMessage(error: unknown): string | null {
  if (!error) return null
  if (error instanceof Error) return error.message
  return String(error)
}

export const dataSourceLabels: Record<DataSourceKind, string> = {
  dataconnect: 'SQL Connect',
  excel: 'Excel local',
  seed: 'Seed local',
  local: 'Brouillon local',
}
