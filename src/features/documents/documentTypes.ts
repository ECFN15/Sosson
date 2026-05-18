export type DocumentKind = 'facture' | 'email_piece_jointe' | 'devis' | 'chantier' | 'import'
export type DocumentStatus = 'a_classer' | 'lie' | 'action_requise'
export type FolderKind = 'all' | 'inbox' | 'factures' | 'devis' | 'plans' | 'photos' | 'imports' | 'custom'

export interface DocumentRecord {
  id: string
  title: string
  kind: DocumentKind
  status: DocumentStatus
  source: 'sql_connect' | 'upload'
  date: string
  folderId?: string
  folderName?: string
  chantierId?: string
  clientId?: string
  factureId?: string
  amount?: number
  detail: string
  sha256?: string | null
  downloadUrl?: string
}

export interface FolderRecord {
  id: string
  name: string
  kind: FolderKind
  description: string
  sqlId?: string
}
