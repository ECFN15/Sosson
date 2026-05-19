import {
  createChantier,
  createClient,
  createDevis,
  listDevis,
  listFactures,
  listOperationalChantiers,
  listOperationalClients,
  updateChantierStatut,
  updateClient,
  updateDevisStatut,
} from '@dataconnect/generated'
import type {
  CreateChantierVariables,
  CreateClientVariables,
  CreateDevisVariables,
  ListDevisData,
  ListFacturesData,
  ListOperationalChantiersData,
  ListOperationalClientsData,
  UpdateChantierStatutVariables,
  UpdateClientVariables,
  UpdateDevisStatutVariables,
} from '@dataconnect/generated'
import type { CategorieDepense, Facture, StatutFacture } from '@/data/factures'
import type { Chantier, StatutChantier, TendanceChantier } from '@/data/chantiers'
import type { Client } from '@/data/clients'
import type { Devis, StatutDevis } from '@/data/devis'
import { getSossonDataConnect } from '@/lib/dataconnect'

const clientTypes: Client['type'][] = ['particulier', 'professionnel', 'public']
const chantierStatuses: StatutChantier[] = [
  'prospect',
  'devis_a_faire',
  'devis_envoye',
  'signe',
  'en_preparation',
  'en_cours',
  'en_pause',
  'termine',
  'cloture',
  'annule',
]
const devisStatuses: StatutDevis[] = ['devis_demande', 'devis_envoye', 'devis_signe']
const factureStatuses: StatutFacture[] = ['validee', 'en_attente', 'rejetee']
const factureCategories: CategorieDepense[] = [
  'bois_materiaux',
  'materiaux',
  'quincaillerie',
  'sous_traitance',
  'carburant',
  'location_materiel',
  'plomberie',
  'electricite',
  'peinture',
  'autre',
]

function asClientType(value: string): Client['type'] {
  return clientTypes.includes(value as Client['type']) ? (value as Client['type']) : 'particulier'
}

function asStatutChantier(value: string): StatutChantier {
  return chantierStatuses.includes(value as StatutChantier) ? (value as StatutChantier) : 'prospect'
}

function asStatutDevis(value: string): StatutDevis {
  return devisStatuses.includes(value as StatutDevis) ? (value as StatutDevis) : 'devis_demande'
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

export function mapFacturesFromSql(rows: ListFacturesData['factures']): Facture[] {
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

export function mapDevisFromSql(rows: ListDevisData['deviss']): Devis[] {
  return rows.map(row => ({
    id: row.id,
    clientId: row.client.id,
    chantierId: row.chantier?.id ?? null,
    numeroDevis: row.numeroDevis,
    titre: row.titre,
    statut: asStatutDevis(row.statut),
    montantHT: row.montantHT ?? null,
    tva: row.tva ?? null,
    montantTTC: row.montantTTC ?? null,
    dateDemande: row.dateDemande,
    dateEnvoi: row.dateEnvoi ?? null,
    dateSignature: row.dateSignature ?? null,
    typeChantierCible: row.typeChantierCible ?? null,
    description: row.description ?? '',
    dateCreation: compactDate(row.dateCreation),
  }))
}

export function mapChantiersFromSql(rows: ListOperationalChantiersData['chantiers'], factures: Facture[]): Chantier[] {
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

export function mapClientsFromSql(rows: ListOperationalClientsData['clients'], chantiers: Chantier[]): Client[] {
  return rows.map(row => ({
    id: row.id,
    nom: row.nom,
    prenom: row.prenom ?? '',
    type: asClientType(row.type),
    email: row.email ?? '',
    telephone: row.telephone ?? '',
    adresse: row.adresse ?? '',
    ville: row.ville ?? '',
    codePostal: row.codePostal ?? '',
    typeChantierCible: row.typeChantierCible ?? '',
    souhaits: row.souhaits ?? '',
    notes: row.notes ?? '',
    dateCreation: compactDate(row.dateCreation),
    chantierIds: chantiers.filter(chantier => chantier.clientId === row.id).map(chantier => chantier.id),
  }))
}

export async function loadOperationalDataFromSql() {
  const dc = getSossonDataConnect()
  const [clientsResponse, chantiersResponse, facturesResponse, devisResponse] = await Promise.all([
    listOperationalClients(dc),
    listOperationalChantiers(dc),
    listFactures(dc),
    listDevis(dc),
  ])

  const hasData =
    clientsResponse.data.clients.length > 0 ||
    chantiersResponse.data.chantiers.length > 0 ||
    facturesResponse.data.factures.length > 0 ||
    devisResponse.data.deviss.length > 0

  if (!hasData) return null

  const factures = mapFacturesFromSql(facturesResponse.data.factures)
  const devis = mapDevisFromSql(devisResponse.data.deviss)
  const chantiers = mapChantiersFromSql(chantiersResponse.data.chantiers, factures)
  const clients = mapClientsFromSql(clientsResponse.data.clients, chantiers)

  return { clients, chantiers, factures, devis }
}

export async function createClientInSql(input: CreateClientVariables) {
  const dc = getSossonDataConnect()
  const response = await createClient(dc, input)
  return response.data.client_insert.id
}

export async function updateClientInSql(input: UpdateClientVariables) {
  const dc = getSossonDataConnect()
  const response = await updateClient(dc, input)
  return response.data.client_update?.id ?? input.id
}

export async function createChantierInSql(input: CreateChantierVariables) {
  const dc = getSossonDataConnect()
  const response = await createChantier(dc, input)
  return response.data.chantier_insert.id
}

export async function updateChantierStatutInSql(input: UpdateChantierStatutVariables) {
  const dc = getSossonDataConnect()
  const response = await updateChantierStatut(dc, input)
  return response.data.chantier_update?.id ?? input.id
}

export async function createDevisInSql(input: CreateDevisVariables) {
  const dc = getSossonDataConnect()
  const response = await createDevis(dc, input)
  return response.data.devis_insert.id
}

export async function updateDevisStatutInSql(input: UpdateDevisStatutVariables) {
  const dc = getSossonDataConnect()
  const response = await updateDevisStatut(dc, input)
  return response.data.devis_update?.id ?? input.id
}
