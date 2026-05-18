import { createFacture, setFactureStatut } from '@dataconnect/generated'
import { getSossonDataConnect } from '@/lib/dataconnect'
import type { Facture, StatutFacture } from '@/data/factures'

export async function createFactureInSql(facture: Facture) {
  const dc = getSossonDataConnect()
  const response = await createFacture(dc, {
    chantierId: facture.chantierId,
    fournisseur: facture.fournisseur,
    numeroFacture: facture.numeroFacture,
    montantHT: facture.montantHT,
    tva: facture.tva,
    montantTTC: facture.montantTTC,
    date: facture.date,
    categorie: facture.categorie,
    statut: facture.statut,
    description: facture.description || null,
  })

  return response.data.facture_insert.id
}

export async function setFactureStatutInSql(id: string, statut: StatutFacture) {
  const dc = getSossonDataConnect()
  await setFactureStatut(dc, { id, statut })
}
