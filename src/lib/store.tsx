import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { listChantiers, listClients, listFactures } from '@dataconnect/generated'
import type { ListChantiersData, ListClientsData, ListFacturesData } from '@dataconnect/generated'
import { factures as seedFactures } from '@/data/factures'
import type { CategorieDepense, Facture, StatutFacture } from '@/data/factures'
import { chantiers as seedChantiers } from '@/data/chantiers'
import type { Chantier, StatutChantier, TendanceChantier } from '@/data/chantiers'
import { clients as seedClients } from '@/data/clients'
import type { Client } from '@/data/clients'
import { emails as seedEmails } from '@/data/emails'
import { getCurrentUser } from '@/lib/auth'
import { getSossonDataConnect, isDataConnectEnabled } from '@/lib/dataconnect'
import { buildPrevisionnelChantiers, buildPrevisionnelClients } from '@/lib/previsionnelModel'
import type { User } from '@/data/users'
import { loadAccessMatrix, saveAccessMatrix } from '@/lib/accessControl'
import type { AccessMatrix } from '@/lib/accessControl'

type DataSource = 'seed' | 'excel' | 'dataconnect'

interface AppState {
  user: User | null
  clients: Client[]
  chantiers: Chantier[]
  factures: Facture[]
  dataSource: DataSource
  isDataConnectLoading: boolean
  accessMatrix: AccessMatrix
  setUser: (u: User | null) => void
  setAccessMatrix: (matrix: AccessMatrix) => void
  addClient: (client: Client) => void
  addFacture: (f: Facture) => void
  updateFactureStatus: (id: string, statut: StatutFacture) => void
}

const AppContext = createContext<AppState | null>(null)

const clientTypes: Client['type'][] = ['particulier', 'professionnel', 'public']
const chantierStatuses: StatutChantier[] = ['en_cours', 'cloture', 'en_attente']
const factureStatuses: StatutFacture[] = ['validee', 'en_attente', 'rejetee']
const factureCategories: CategorieDepense[] = [
  'bois_materiaux',
  'quincaillerie',
  'sous_traitance',
  'carburant',
  'location_materiel',
  'plomberie',
  'electricite',
  'peinture',
]

const excelClients = buildPrevisionnelClients()
const excelChantiers = buildPrevisionnelChantiers()
const initialClients = excelClients.length ? excelClients : seedClients
const initialChantiers = excelChantiers.length ? excelChantiers : seedChantiers
const initialDataSource: DataSource = excelClients.length && excelChantiers.length ? 'excel' : 'seed'
const initialFactures = initialDataSource === 'excel' ? [] : seedFactures
const emails = initialDataSource === 'excel' ? [] : seedEmails

function asClientType(value: string): Client['type'] {
  return clientTypes.includes(value as Client['type']) ? (value as Client['type']) : 'particulier'
}

function asStatutChantier(value: string): StatutChantier {
  return chantierStatuses.includes(value as StatutChantier) ? (value as StatutChantier) : 'en_attente'
}

function asStatutFacture(value: string): StatutFacture {
  return factureStatuses.includes(value as StatutFacture) ? (value as StatutFacture) : 'en_attente'
}

function asCategorieDepense(value: string): CategorieDepense {
  return factureCategories.includes(value as CategorieDepense)
    ? (value as CategorieDepense)
    : 'bois_materiaux'
}

function compactDate(value?: string | null) {
  return value ? value.slice(0, 10) : ''
}

function computeTendance(depenses: number, budget: number): TendanceChantier {
  if (budget <= 0 || depenses > budget * 1.05) return 'rouge'
  if (depenses > budget * 0.9) return 'orange'
  return 'vert'
}

function mapFactures(rows: ListFacturesData['factures']): Facture[] {
  return rows.map(row => ({
    id: row.id,
    chantierId: row.chantier.id,
    fournisseur: row.fournisseur,
    montantHT: row.montantHT,
    tva: row.tva,
    montantTTC: row.montantTTC,
    date: row.date,
    categorie: asCategorieDepense(row.categorie),
    statut: asStatutFacture(row.statut),
    numeroFacture: row.numeroFacture,
    description: row.description ?? '',
  }))
}

function mapChantiers(rows: ListChantiersData['chantiers'], factures: Facture[]): Chantier[] {
  return rows.map(row => {
    const chantierFactures = factures.filter(facture => facture.chantierId === row.id)
    const depensesEngagees = chantierFactures.reduce((sum, facture) => sum + facture.montantTTC, 0)

    return {
      id: row.id,
      nom: row.nom,
      clientId: row.client.id,
      statut: asStatutChantier(row.statut),
      dateDebut: row.dateDebut,
      dateFin: row.dateFin ?? null,
      dateFinPrevue: row.dateFinPrevue,
      budgetPrevisionnel: row.budgetPrevisionnel,
      depensesEngagees,
      description: '',
      adresse: row.adresse ?? '',
      chefChantier: row.chefChantier ? `${row.chefChantier.prenom} ${row.chefChantier.nom}` : '',
      tendance: computeTendance(depensesEngagees, row.budgetPrevisionnel),
      factureIds: chantierFactures.map(facture => facture.id),
      emailIds: [],
    }
  })
}

function mapClients(rows: ListClientsData['clients'], chantiers: Chantier[]): Client[] {
  return rows.map(row => ({
    id: row.id,
    nom: row.nom,
    type: asClientType(row.type),
    email: row.email ?? '',
    telephone: row.telephone ?? '',
    adresse: '',
    ville: row.ville ?? '',
    codePostal: row.codePostal ?? '',
    dateCreation: compactDate(row.dateCreation),
    chantierIds: chantiers.filter(chantier => chantier.clientId === row.id).map(chantier => chantier.id),
  }))
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getCurrentUser())
  const [clientsList, setClientsList] = useState<Client[]>(initialClients)
  const [chantiersList, setChantiersList] = useState<Chantier[]>(initialChantiers)
  const [facturesList, setFacturesList] = useState<Facture[]>(initialFactures)
  const [dataSource, setDataSource] = useState<DataSource>(initialDataSource)
  const [isDataConnectLoading, setIsDataConnectLoading] = useState(false)
  const [accessMatrix, setAccessMatrixState] = useState<AccessMatrix>(() => loadAccessMatrix())

  function setAccessMatrix(matrix: AccessMatrix) {
    setAccessMatrixState(matrix)
    saveAccessMatrix(matrix)
  }

  useEffect(() => {
    if (!isDataConnectEnabled || !user) return

    let isMounted = true

    async function loadDataConnectData() {
      setIsDataConnectLoading(true)
      try {
        const dc = getSossonDataConnect()
        const [clientsResponse, chantiersResponse, facturesResponse] = await Promise.all([
          listClients(dc),
          listChantiers(dc),
          listFactures(dc),
        ])

        const hasData =
          clientsResponse.data.clients.length > 0 ||
          chantiersResponse.data.chantiers.length > 0 ||
          facturesResponse.data.factures.length > 0

        if (!isMounted || !hasData) return

        const loadedFactures = mapFactures(facturesResponse.data.factures)
        const loadedChantiers = mapChantiers(chantiersResponse.data.chantiers, loadedFactures)
        const loadedClients = mapClients(clientsResponse.data.clients, loadedChantiers)

        setFacturesList(loadedFactures)
        setChantiersList(loadedChantiers)
        setClientsList(loadedClients)
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
  }, [user])

  function addClient(client: Client) {
    setClientsList(prev => [...prev, client])
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

  function updateFactureStatus(id: string, statut: StatutFacture) {
    setFacturesList(prev =>
      prev.map(facture => (facture.id === id ? { ...facture, statut } : facture))
    )
  }

  return (
    <AppContext.Provider
      value={{
        user,
        clients: clientsList,
        chantiers: chantiersList,
        factures: facturesList,
        dataSource,
        isDataConnectLoading,
        accessMatrix,
        setUser,
        setAccessMatrix,
        addClient,
        addFacture,
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
