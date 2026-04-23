export type StatutChantier = 'en_cours' | 'cloture' | 'en_attente'
export type TendanceChantier = 'vert' | 'orange' | 'rouge'

export interface Chantier {
  id: string
  nom: string
  clientId: string
  statut: StatutChantier
  dateDebut: string
  dateFin: string | null
  dateFinPrevue: string
  budgetPrevisionnel: number
  depensesEngagees: number
  description: string
  adresse: string
  chefChantier: string
  tendance: TendanceChantier
  factureIds: string[]
  emailIds: string[]
}

export const chantiers: Chantier[] = [
  {
    id: 'chantier-1',
    nom: 'Extension ossature bois',
    clientId: 'client-1',
    statut: 'en_cours',
    dateDebut: '2026-02-10',
    dateFin: null,
    dateFinPrevue: '2026-04-30',
    budgetPrevisionnel: 18500,
    depensesEngagees: 9200,
    description: 'Extension en ossature bois avec bardage vertical, isolation biosourcée, menuiseries et finitions intérieures bois.',
    adresse: '14 rue des Lilas, 26000 Valence',
    chefChantier: 'Romain Faure',
    tendance: 'rouge',
    factureIds: ['facture-1', 'facture-2', 'facture-3', 'facture-4'],
    emailIds: ['email-3', 'email-6', 'email-7', 'email-9'],
  },
  {
    id: 'chantier-2',
    nom: 'Maison ossature bois',
    clientId: 'client-2',
    statut: 'en_cours',
    dateDebut: '2026-01-15',
    dateFin: null,
    dateFinPrevue: '2026-06-30',
    budgetPrevisionnel: 125000,
    depensesEngagees: 14300,
    description: 'Construction d’une maison individuelle en ossature bois : fondations légères, murs préfabriqués, charpente et couverture.',
    adresse: '8 avenue du Rhône, 26100 Romans-sur-Isère',
    chefChantier: 'Romain Faure',
    tendance: 'vert',
    factureIds: ['facture-5', 'facture-6', 'facture-7'],
    emailIds: ['email-1', 'email-4', 'email-5'],
  },
  {
    id: 'chantier-3',
    nom: 'Charpente bois mairie',
    clientId: 'client-3',
    statut: 'en_cours',
    dateDebut: '2026-03-01',
    dateFin: null,
    dateFinPrevue: '2026-07-15',
    budgetPrevisionnel: 31000,
    depensesEngagees: 18700,
    description: 'Remplacement de la charpente et renforcement bois du bâtiment annexe : levage, isolation, écran de sous-toiture et couverture.',
    adresse: 'Bâtiment annexe, 3 rue Championnet, 26000 Valence',
    chefChantier: 'Romain Faure',
    tendance: 'orange',
    factureIds: ['facture-8', 'facture-9', 'facture-10', 'facture-11'],
    emailIds: ['email-2'],
  },
  {
    id: 'chantier-4',
    nom: 'Terrasse bois',
    clientId: 'client-1',
    statut: 'cloture',
    dateDebut: '2025-09-01',
    dateFin: '2025-10-20',
    dateFinPrevue: '2025-10-31',
    budgetPrevisionnel: 6200,
    depensesEngagees: 5800,
    description: 'Création d\'une terrasse en bois exotique (ipé) 40m² avec garde-corps aluminium.',
    adresse: '14 rue des Lilas, 26000 Valence',
    chefChantier: 'Romain Faure',
    tendance: 'vert',
    factureIds: ['facture-12'],
    emailIds: ['email-8'],
  },
]
