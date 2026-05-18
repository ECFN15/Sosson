export type Role = 'gerant' | 'assistante' | 'chef_chantier'

export interface User {
  id: string
  nom: string
  prenom: string
  email: string
  role: Role
  avatar: string
  password?: string
}

export const roleLabels: Record<Role, string> = {
  gerant: 'Gérant',
  assistante: 'Assistante de gestion',
  chef_chantier: 'Chef de chantier',
}

export const users: User[] = [
  {
    id: 'user-1',
    nom: 'Sosson',
    prenom: 'Patrick',
    email: 'patrick@sosson.fr',
    role: 'gerant',
    avatar: 'PS',
    password: 'demo',
  },
  {
    id: 'user-2',
    nom: 'Morel',
    prenom: 'Claire',
    email: 'claire@sosson.fr',
    role: 'assistante',
    avatar: 'CM',
    password: 'demo',
  },
  {
    id: 'user-3',
    nom: 'Faure',
    prenom: 'Romain',
    email: 'romain@sosson.fr',
    role: 'chef_chantier',
    avatar: 'RF',
    password: 'demo',
  },
]
