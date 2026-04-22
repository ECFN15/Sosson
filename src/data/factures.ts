export type StatutFacture = 'validee' | 'en_attente' | 'rejetee'
export type CategorieDepense =
  | 'bois_materiaux'
  | 'quincaillerie'
  | 'sous_traitance'
  | 'carburant'
  | 'location_materiel'
  | 'plomberie'
  | 'electricite'
  | 'peinture'

export const categorieLabels: Record<CategorieDepense, string> = {
  bois_materiaux: 'Bois & matériaux',
  quincaillerie: 'Quincaillerie',
  sous_traitance: 'Sous-traitance',
  carburant: 'Carburant',
  location_materiel: 'Location matériel',
  plomberie: 'Plomberie',
  electricite: 'Électricité',
  peinture: 'Peinture',
}

export const categorieColors: Record<CategorieDepense, string> = {
  bois_materiaux: '#3b82f6',
  quincaillerie: '#8b5cf6',
  sous_traitance: '#f59e0b',
  carburant: '#ef4444',
  location_materiel: '#06b6d4',
  plomberie: '#10b981',
  electricite: '#f97316',
  peinture: '#ec4899',
}

export interface Facture {
  id: string
  chantierId: string
  fournisseur: string
  montantHT: number
  tva: number
  montantTTC: number
  date: string
  categorie: CategorieDepense
  statut: StatutFacture
  numeroFacture: string
  description: string
}

export const factures: Facture[] = [
  {
    id: 'facture-1',
    chantierId: 'chantier-1',
    fournisseur: 'Carrelages Provence',
    montantHT: 1420.00,
    tva: 20,
    montantTTC: 1704.00,
    date: '2026-02-18',
    categorie: 'bois_materiaux',
    statut: 'validee',
    numeroFacture: 'CP-2026-0312',
    description: 'Carrelage grès cérame 45m², colle et joints',
  },
  {
    id: 'facture-2',
    chantierId: 'chantier-1',
    fournisseur: 'Sanitaires du Rhône',
    montantHT: 2350.00,
    tva: 20,
    montantTTC: 2820.00,
    date: '2026-03-05',
    categorie: 'plomberie',
    statut: 'validee',
    numeroFacture: 'SR-2026-0089',
    description: 'Douche à l\'italienne, WC suspendu, lavabo, robinetterie',
  },
  {
    id: 'facture-3',
    chantierId: 'chantier-1',
    fournisseur: 'Élec Pro 26',
    montantHT: 890.00,
    tva: 10,
    montantTTC: 979.00,
    date: '2026-03-22',
    categorie: 'electricite',
    statut: 'validee',
    numeroFacture: 'EP-2026-0156',
    description: 'Mise aux normes tableau électrique, VMC salle de bain',
  },
  {
    id: 'facture-4',
    chantierId: 'chantier-1',
    fournisseur: 'Couleurs & Finitions',
    montantHT: 680.00,
    tva: 10,
    montantTTC: 748.00,
    date: '2026-04-10',
    categorie: 'peinture',
    statut: 'en_attente',
    numeroFacture: 'CF-2026-0044',
    description: 'Peinture murale 2 couches, peinture plafond, résine douche',
  },
  {
    id: 'facture-5',
    chantierId: 'chantier-2',
    fournisseur: 'Béton & Coffrages Drôme',
    montantHT: 3200.00,
    tva: 20,
    montantTTC: 3840.00,
    date: '2026-01-28',
    categorie: 'bois_materiaux',
    statut: 'validee',
    numeroFacture: 'BCD-2026-0022',
    description: 'Béton prêt à l\'emploi 8m³, ferraillage, coffrages fondations',
  },
  {
    id: 'facture-6',
    chantierId: 'chantier-2',
    fournisseur: 'Matériaux Rhône',
    montantHT: 4750.00,
    tva: 20,
    montantTTC: 5700.00,
    date: '2026-02-14',
    categorie: 'bois_materiaux',
    statut: 'validee',
    numeroFacture: 'MR-2026-0198',
    description: 'Parpaings 20cm x800, linteaux, mortier maçonnerie',
  },
  {
    id: 'facture-7',
    chantierId: 'chantier-2',
    fournisseur: 'Charpentes Isère',
    montantHT: 5200.00,
    tva: 20,
    montantTTC: 6240.00,
    date: '2026-03-10',
    categorie: 'sous_traitance',
    statut: 'validee',
    numeroFacture: 'CI-2026-0067',
    description: 'Charpente fermette sapin traité, pose et couverture tuiles mécaniques',
  },
  {
    id: 'facture-8',
    chantierId: 'chantier-3',
    fournisseur: 'Isolation Pro Rhône-Alpes',
    montantHT: 3890.00,
    tva: 10,
    montantTTC: 4279.00,
    date: '2026-03-15',
    categorie: 'bois_materiaux',
    statut: 'validee',
    numeroFacture: 'IPRA-2026-0034',
    description: 'Laine de roche 200mm, pare-vapeur, fixations',
  },
  {
    id: 'facture-9',
    chantierId: 'chantier-3',
    fournisseur: 'Tuiles & Zinguerie Valence',
    montantHT: 6200.00,
    tva: 20,
    montantTTC: 7440.00,
    date: '2026-03-28',
    categorie: 'bois_materiaux',
    statut: 'validee',
    numeroFacture: 'TZV-2026-0091',
    description: 'Tuiles terre cuite 280m², faîtières, noques, gouttières zinc',
  },
  {
    id: 'facture-10',
    chantierId: 'chantier-3',
    fournisseur: 'Location Materiel Sud',
    montantHT: 1450.00,
    tva: 20,
    montantTTC: 1740.00,
    date: '2026-04-05',
    categorie: 'location_materiel',
    statut: 'validee',
    numeroFacture: 'LMS-2026-0178',
    description: 'Nacelle élévatrice 12m x 5 jours, livraison/reprise',
  },
  {
    id: 'facture-11',
    chantierId: 'chantier-3',
    fournisseur: 'Transport Brun & Fils',
    montantHT: 380.00,
    tva: 20,
    montantTTC: 456.00,
    date: '2026-04-12',
    categorie: 'carburant',
    statut: 'en_attente',
    numeroFacture: 'TBF-2026-0302',
    description: 'Livraison matériaux chantier, benne déchets',
  },
  {
    id: 'facture-12',
    chantierId: 'chantier-4',
    fournisseur: 'Bois Exotiques Provence',
    montantHT: 4833.33,
    tva: 20,
    montantTTC: 5800.00,
    date: '2025-09-20',
    categorie: 'bois_materiaux',
    statut: 'validee',
    numeroFacture: 'BEP-2025-0445',
    description: 'Lames ipé 140x21mm 42m², lambourdes, visserie inox, huile de finition',
  },
]
