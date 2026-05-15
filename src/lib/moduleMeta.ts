import {
  BarChart2,
  BookOpen,
  Calendar,
  FileText,
  Folder,
  HardHat,
  LayoutDashboard,
  LineChart,
  Mail,
  Settings,
  TableProperties,
  Users,
  UsersRound,
} from 'lucide-react'

export type ModuleKey =
  | 'dashboard'
  | 'chantiers'
  | 'clients'
  | 'documents'
  | 'factures'
  | 'previsionnel'
  | 'statistiques'
  | 'emails'
  | 'planning'
  | 'rapports'
  | 'documentation'
  | 'equipe'
  | 'parametres'

export type ModuleMeta = {
  key: ModuleKey
  label: string
  eyebrow: string
  description: string
  Icon: typeof LayoutDashboard
}

const moduleMetaByKey: Record<ModuleKey, ModuleMeta> = {
  dashboard: {
    key: 'dashboard',
    label: 'Tableau de bord',
    eyebrow: 'Command center',
    description: 'Priorites, marges, factures et risques chantier consolides.',
    Icon: LayoutDashboard,
  },
  chantiers: {
    key: 'chantiers',
    label: 'Chantiers',
    eyebrow: 'Operations',
    description: 'Portefeuille travaux, avancement, budgets et risques marge.',
    Icon: HardHat,
  },
  clients: {
    key: 'clients',
    label: 'Clients',
    eyebrow: 'Relation',
    description: 'Repertoire, historique Excel et dossiers associes.',
    Icon: Users,
  },
  documents: {
    key: 'documents',
    label: 'Documents',
    eyebrow: 'GED',
    description: 'Pieces, medias et documents relies aux chantiers.',
    Icon: Folder,
  },
  factures: {
    key: 'factures',
    label: 'Factures',
    eyebrow: 'Validation',
    description: 'Saisie fournisseur, rattachement chantier et controles.',
    Icon: FileText,
  },
  previsionnel: {
    key: 'previsionnel',
    label: 'Previsionnel',
    eyebrow: 'Pilotage budget',
    description: 'Exercices, cellules modifiees, montants mensuels et lots.',
    Icon: TableProperties,
  },
  statistiques: {
    key: 'statistiques',
    label: 'Statistiques',
    eyebrow: 'Analyse',
    description: 'Lecture des exercices, tendances et performances chantier.',
    Icon: LineChart,
  },
  emails: {
    key: 'emails',
    label: 'Emails',
    eyebrow: 'Communication',
    description: 'Boite dossier, pieces jointes et priorisation des messages.',
    Icon: Mail,
  },
  planning: {
    key: 'planning',
    label: 'Planning',
    eyebrow: 'Ressources',
    description: 'Equipes, jalons et charge operationnelle de la semaine.',
    Icon: Calendar,
  },
  rapports: {
    key: 'rapports',
    label: 'Rapports',
    eyebrow: 'Reporting',
    description: 'Exports et syntheses pour le pilotage de direction.',
    Icon: BarChart2,
  },
  documentation: {
    key: 'documentation',
    label: 'Documentation',
    eyebrow: 'Reference',
    description: 'Notes projet, architecture et procedures de reprise.',
    Icon: BookOpen,
  },
  equipe: {
    key: 'equipe',
    label: 'Equipe',
    eyebrow: 'Organisation',
    description: 'Roles, profils, permissions et activite des collaborateurs.',
    Icon: UsersRound,
  },
  parametres: {
    key: 'parametres',
    label: 'Parametres',
    eyebrow: 'Administration',
    description: "Configuration, acces et preferences de l'espace Sosson.",
    Icon: Settings,
  },
}

export const moduleEntries = Object.values(moduleMetaByKey)

export function getModuleMeta(pathname: string): ModuleMeta {
  const firstSegment = pathname.split('/').filter(Boolean)[0] as ModuleKey | undefined
  if (firstSegment && moduleMetaByKey[firstSegment]) return moduleMetaByKey[firstSegment]
  return moduleMetaByKey.dashboard
}
