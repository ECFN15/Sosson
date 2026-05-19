export interface Client {
  id: string
  nom: string
  prenom?: string
  type: 'particulier' | 'professionnel' | 'public'
  email: string
  telephone: string
  adresse: string
  ville: string
  codePostal: string
  typeChantierCible?: string
  souhaits?: string
  notes?: string
  dateCreation: string
  chantierIds: string[]
}

export const clients: Client[] = [
  {
    id: 'client-1',
    nom: 'Martin Dupont',
    type: 'particulier',
    email: 'martin.dupont@gmail.com',
    telephone: '06 12 34 56 78',
    adresse: '14 rue des Lilas',
    ville: 'Valence',
    codePostal: '26000',
    dateCreation: '2024-03-10',
    chantierIds: ['chantier-1', 'chantier-4'],
  },
  {
    id: 'client-2',
    nom: 'SCI Les Pins',
    type: 'professionnel',
    email: 'contact@sci-les-pins.fr',
    telephone: '04 75 23 45 67',
    adresse: '8 avenue du Rhône',
    ville: 'Romans-sur-Isère',
    codePostal: '26100',
    dateCreation: '2024-06-15',
    chantierIds: ['chantier-2'],
  },
  {
    id: 'client-3',
    nom: 'Mairie de Valence',
    type: 'public',
    email: 'travaux@mairie-valence.fr',
    telephone: '04 75 79 20 00',
    adresse: '1 place de la Liberté',
    ville: 'Valence',
    codePostal: '26000',
    dateCreation: '2025-01-08',
    chantierIds: ['chantier-3'],
  },
]
