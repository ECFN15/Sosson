import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { factures as seedFactures } from '@/data/factures'
import type { Facture, StatutFacture } from '@/data/factures'
import { chantiers as seedChantiers } from '@/data/chantiers'
import type { Chantier } from '@/data/chantiers'
import { clients as seedClients } from '@/data/clients'
import type { Client } from '@/data/clients'
import type { Devis } from '@/data/devis'
import { emails as seedEmails } from '@/data/emails'
import { getCurrentUser, isFirebaseConfigured, onAuthChange } from '@/lib/auth'
import type { AuthSessionStatus } from '@/lib/auth'
import type { User as FirebaseUser } from 'firebase/auth'
import { isDataConnectEnabled } from '@/lib/dataconnect'
import { waitForFirebaseUser } from '@/lib/firebaseAuthState'
import { buildPrevisionnelChantiers, buildPrevisionnelClients } from '@/lib/previsionnelModel'
import type { User } from '@/data/users'
import { loadAccessMatrix, normalizeAccessMatrix, saveAccessMatrix } from '@/lib/accessControl'
import type { AccessMatrix } from '@/lib/accessControl'
import { loadOperationalDataFromSql } from '@/features/operations/operationalAdapters'
import { buildDomainDataState, type DataSourceKind, type DomainDataState } from '@/features/dataState'

type DataSource = Extract<DataSourceKind, 'seed' | 'excel' | 'dataconnect'>

interface OperationalDataset {
  clients: Client[]
  chantiers: Chantier[]
  factures: Facture[]
  devis: Devis[]
}

interface AppState {
  user: User | null
  firebaseUser: FirebaseUser | null
  authStatus: AuthSessionStatus
  clients: Client[]
  chantiers: Chantier[]
  factures: Facture[]
  devis: Devis[]
  dataSource: DataSource
  operationalDataState: DomainDataState<OperationalDataset>
  isDataConnectLoading: boolean
  authInitializing: boolean
  accessMatrix: AccessMatrix
  setUser: (u: User | null) => void
  setAccessMatrix: (matrix: AccessMatrix) => void
  addClient: (client: Client) => void
  updateClient: (id: string, patch: Partial<Client>) => void
  addChantier: (chantier: Chantier) => void
  addFacture: (f: Facture) => void
  updateChantierStatus: (id: string, statut: Chantier['statut'], dateFin?: string | null) => void
  updateFactureStatus: (id: string, statut: StatutFacture) => void
}

const AppContext = createContext<AppState | null>(null)

const excelClients = buildPrevisionnelClients()
const excelChantiers = buildPrevisionnelChantiers()
const initialClients = excelClients.length ? excelClients : seedClients
const initialChantiers = excelChantiers.length ? excelChantiers : seedChantiers
const initialDataSource: DataSource = excelClients.length && excelChantiers.length ? 'excel' : 'seed'
const initialFactures = initialDataSource === 'excel' ? [] : seedFactures
const emails = seedEmails

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getCurrentUser())
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [authStatus, setAuthStatus] = useState<AuthSessionStatus>(() => {
    if (isFirebaseConfigured) return 'loading'
    return getCurrentUser() ? 'ready' : 'signed-out'
  })
  const [authInitializing, setAuthInitializing] = useState(isFirebaseConfigured)
  const [clientsList, setClientsList] = useState<Client[]>(initialClients)
  const [chantiersList, setChantiersList] = useState<Chantier[]>(initialChantiers)
  const [facturesList, setFacturesList] = useState<Facture[]>(initialFactures)
  const [devisList, setDevisList] = useState<Devis[]>([])
  const [dataSource, setDataSource] = useState<DataSource>(initialDataSource)
  const [isDataConnectLoading, setIsDataConnectLoading] = useState(false)
  const [accessMatrix, setAccessMatrixState] = useState<AccessMatrix>(() => loadAccessMatrix())
  const operationalDataState = useMemo(() => {
    const data = {
      clients: clientsList,
      chantiers: chantiersList,
      factures: facturesList,
      devis: devisList,
    }
    const hasData = clientsList.length > 0 || chantiersList.length > 0 || facturesList.length > 0 || devisList.length > 0

    return buildDomainDataState({
      data,
      source: dataSource,
      status: isDataConnectLoading ? 'loading' : hasData ? 'ready' : 'empty',
    })
  }, [chantiersList, clientsList, dataSource, devisList, facturesList, isDataConnectLoading])

  function setAccessMatrix(matrix: AccessMatrix) {
    const normalized = normalizeAccessMatrix(matrix)
    setAccessMatrixState(normalized)
    saveAccessMatrix(normalized)
  }

  useEffect(() => {
    if (!isFirebaseConfigured) return () => {}

    return onAuthChange(state => {
      setUser(state.user)
      setFirebaseUser(state.firebaseUser)
      setAuthStatus(state.status)
      setAuthInitializing(false)
    })
  }, [])

  useEffect(() => {
    if (!isDataConnectEnabled || !user || authInitializing) return

    let isMounted = true

    async function loadDataConnectData() {
      setIsDataConnectLoading(true)
      try {
        const firebaseUser = await waitForFirebaseUser()
        if (!firebaseUser) return

        const loaded = await loadOperationalDataFromSql()
        if (!isMounted || !loaded) return

        setFacturesList(loaded.factures)
        setDevisList(loaded.devis)
        setChantiersList(loaded.chantiers)
        setClientsList(loaded.clients)
        setDataSource('dataconnect')
      } catch (error) {
        console.info('SQL Connect indisponible, utilisation des seeds locaux.', error)
      } finally {
        if (isMounted) setIsDataConnectLoading(false)
      }
    }

    void loadDataConnectData()

    return () => {
      isMounted = false
    }
  }, [authInitializing, user])

  function addClient(client: Client) {
    setClientsList(prev => [...prev, client])
  }

  function updateClient(id: string, patch: Partial<Client>) {
    setClientsList(prev =>
      prev.map(client => (client.id === id ? { ...client, ...patch } : client)),
    )
  }

  function addChantier(chantier: Chantier) {
    setChantiersList(prev => [chantier, ...prev])
    setClientsList(prev =>
      prev.map(client =>
        client.id === chantier.clientId
          ? { ...client, chantierIds: [chantier.id, ...client.chantierIds] }
          : client,
      ),
    )
  }

  function addFacture(f: Facture) {
    setFacturesList(prev => [f, ...prev])
    setChantiersList(prev =>
      prev.map(c => {
        if (c.id === f.chantierId) {
          return {
            ...c,
            depensesEngagees: c.depensesEngagees + f.montantTTC,
            factureIds: [f.id, ...c.factureIds],
            tendance:
              c.depensesEngagees + f.montantTTC > c.budgetPrevisionnel * 1.05
                ? 'rouge'
                : c.depensesEngagees + f.montantTTC > c.budgetPrevisionnel * 0.9
                ? 'orange'
                : 'vert',
          }
        }
        return c
      })
    )
  }

  function updateChantierStatus(id: string, statut: Chantier['statut'], dateFin?: string | null) {
    setChantiersList(prev =>
      prev.map(chantier =>
        chantier.id === id
          ? {
              ...chantier,
              statut,
              dateFin: dateFin === undefined ? chantier.dateFin : dateFin,
            }
          : chantier,
      ),
    )
  }

  function updateFactureStatus(id: string, statut: StatutFacture) {
    setFacturesList(prev =>
      prev.map(facture => (facture.id === id ? { ...facture, statut } : facture))
    )
  }

  return (
    <AppContext.Provider
      value={{
        user,
        firebaseUser,
        authStatus,
        clients: clientsList,
        chantiers: chantiersList,
        factures: facturesList,
        devis: devisList,
        dataSource,
        operationalDataState,
        isDataConnectLoading,
        authInitializing,
        accessMatrix,
        setUser,
        setAccessMatrix,
        addClient,
        updateClient,
        addChantier,
        addFacture,
        updateChantierStatus,
        updateFactureStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

export { emails }
