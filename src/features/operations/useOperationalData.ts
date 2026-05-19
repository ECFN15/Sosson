import { useApp } from '@/lib/store'

export function useOperationalData() {
  const { operationalDataState } = useApp()
  const { data, status, source, error, hasUnsyncedLocalChanges } = operationalDataState

  return {
    clients: data.clients,
    chantiers: data.chantiers,
    factures: data.factures,
    devis: data.devis,
    status,
    source,
    error,
    isLoading: status === 'loading',
    isEmpty: status === 'empty',
    hasUnsyncedLocalChanges,
  }
}
