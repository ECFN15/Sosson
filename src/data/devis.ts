export type StatutDevis = 'devis_demande' | 'devis_envoye' | 'devis_signe'

export interface Devis {
  id: string
  clientId: string
  chantierId?: string | null
  numeroDevis: string
  titre: string
  statut: StatutDevis
  montantHT: number | null
  tva: number | null
  montantTTC: number | null
  dateDemande: string
  dateEnvoi?: string | null
  dateSignature?: string | null
  typeChantierCible?: string | null
  description?: string
  dateCreation: string
}

export const devisStatutLabels: Record<StatutDevis, string> = {
  devis_demande: 'Devis demande',
  devis_envoye: 'Devis envoye',
  devis_signe: 'Devis signe',
}
