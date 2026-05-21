import {
  createDocumentAttache,
  createDocumentFolder,
  listDocumentFolders,
  listDocumentsAttaches,
  listDocumentsByChantier,
  updateDocumentAttacheLinks,
} from '@dataconnect/generated'
import type {
  CreateDocumentAttacheVariables,
  CreateDocumentFolderVariables,
  ListDocumentFoldersData,
  ListDocumentsAttachesData,
  ListDocumentsByChantierData,
  ListDocumentsByChantierVariables,
  UpdateDocumentAttacheLinksVariables,
} from '@dataconnect/generated'
import { getSossonDataConnect } from '@/lib/dataconnect'
import type { DocumentKind, DocumentRecord, DocumentStatus, FolderRecord } from '@/features/documents/documentTypes'
import { validatePendingDocumentStoragePath } from '@/features/documents/storagePaths'

function asDocumentKind(value: string): DocumentKind {
  if (value === 'facture') return 'facture'
  if (value === 'email_piece_jointe') return 'email_piece_jointe'
  if (value === 'devis') return 'devis'
  if (value === 'chantier' || value === 'plan' || value === 'photo') return 'chantier'
  return 'import'
}

function asDocumentStatus(value: string): DocumentStatus {
  if (value === 'lie') return 'lie'
  if (value === 'action_requise' || value === 'archive') return 'action_requise'
  return 'a_classer'
}

type SqlDocumentRow =
  | ListDocumentsAttachesData['documentAttaches'][number]
  | ListDocumentsByChantierData['documentAttaches'][number]

function factureChantier(row: SqlDocumentRow) {
  const facture = row.facture
  return facture && 'chantier' in facture ? facture.chantier : null
}

function documentFromSql(row: SqlDocumentRow): DocumentRecord {
  const chantier = row.chantier ?? factureChantier(row)
  const client = row.client ?? chantier?.client ?? null

  return {
    id: `sql-${row.id}`,
    title: row.nomFichier,
    kind: asDocumentKind(row.typeDocument),
    status: asDocumentStatus(row.statut),
    source: 'sql_connect',
    date: row.dateDocument ?? row.dateCreation.slice(0, 10),
    folderId: row.folder?.id,
    folderName: row.folder?.nom,
    chantierId: chantier?.id,
    clientId: client?.id,
    factureId: row.facture?.id,
    amount: row.facture?.montantTTC,
    detail: row.description || row.storagePath,
    sha256: row.sha256,
    downloadUrl: row.storagePath.startsWith('http') ? row.storagePath : undefined,
  }
}

function folderFromSql(row: ListDocumentFoldersData['documentFolders'][number]): FolderRecord {
  return {
    id: `folder-${row.id}`,
    sqlId: row.id,
    name: row.nom,
    kind: 'custom',
    description: row.description || 'Dossier partage',
  }
}

export async function loadDocumentsSqlData() {
  const dc = getSossonDataConnect()
  const [documentsResponse, foldersResponse] = await Promise.all([
    listDocumentsAttaches(dc),
    listDocumentFolders(dc),
  ])

  return {
    documents: documentsResponse.data.documentAttaches.map(documentFromSql),
    folders: foldersResponse.data.documentFolders.map(folderFromSql),
  }
}

export async function loadDocumentsByChantierFromSql(input: ListDocumentsByChantierVariables) {
  const dc = getSossonDataConnect()
  const response = await listDocumentsByChantier(dc, input)
  return response.data.documentAttaches.map(documentFromSql)
}

export async function createDocumentFolderInSql(input: CreateDocumentFolderVariables) {
  const dc = getSossonDataConnect()
  const response = await createDocumentFolder(dc, input)
  return response.data.documentFolder_insert.id
}

export async function createDocumentAttacheInSql(input: CreateDocumentAttacheVariables) {
  const storagePathError = validatePendingDocumentStoragePath(input.storagePath)
  if (storagePathError) {
    throw new Error(storagePathError)
  }

  const dc = getSossonDataConnect()
  const response = await createDocumentAttache(dc, input)
  return response.data.documentAttache_insert.id
}

export async function updateDocumentAttacheLinksInSql(input: UpdateDocumentAttacheLinksVariables) {
  const dc = getSossonDataConnect()
  await updateDocumentAttacheLinks(dc, input)
}
