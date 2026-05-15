import type { PagePermissionKey } from '@/lib/accessControl'

export type TeamTheme = 'charpente' | 'couverture' | 'menuiserie' | 'gros_oeuvre' | 'administratif'
export type MemberStatus = 'terrain' | 'atelier' | 'bureau' | 'absent'
export type LeaveType = 'conges' | 'formation' | 'maladie' | 'recuperation'

export type Team = {
  id: string
  name: string
  theme: TeamTheme
  lead: string
  description: string
  activeSites: string[]
}

export type TeamMember = {
  id: string
  teamId: string
  firstName: string
  lastName: string
  title: string
  qualification: string
  level: string
  salaryGrossMonthly: number
  contract: string
  coefficient: string
  email: string
  phone: string
  status: MemberStatus
  site: string
  activeSites: string[]
  responsibilities: string[]
  permissions: PagePermissionKey[]
}

export type LeavePeriod = {
  id: string
  memberId: string
  type: LeaveType
  month: string
  startDay: number
  endDay: number
  note: string
}

export const TEAMS_STORAGE_KEY = 'sosson.teamDirectory.v1'
export const MEMBERS_STORAGE_KEY = 'sosson.teamMembers.v1'
export const LEAVES_STORAGE_KEY = 'sosson.teamLeaves.v1'

export const themeOptions: Record<TeamTheme, { label: string; bg: string; edge: string; text: string }> = {
  charpente: { label: 'Charpente', bg: '#FDE9DB', edge: '#F06B21', text: '#1E1E1E' },
  couverture: { label: 'Couverture', bg: '#DCE9F2', edge: '#6B91B5', text: '#1E1E1E' },
  menuiserie: { label: 'Menuiserie', bg: '#FDEFC2', edge: '#C9A227', text: '#1E1E1E' },
  gros_oeuvre: { label: 'Gros oeuvre', bg: '#E8DCC5', edge: '#A45A2C', text: '#1E1E1E' },
  administratif: { label: 'Bureau', bg: '#FAF6F2', edge: '#1E1E1E', text: '#1E1E1E' },
}

export const leaveTypeLabels: Record<LeaveType, string> = {
  conges: 'Conges payes',
  formation: 'Formation',
  maladie: 'Maladie',
  recuperation: 'Recuperation',
}

export const planningMonths = [
  'Janvier',
  'Fevrier',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Aout',
  'Septembre',
  'Octobre',
  'Novembre',
  'Decembre',
]

export const defaultTeams: Team[] = [
  {
    id: 'team-chantier-alpha',
    name: 'Equipe Chantier Alpha',
    theme: 'charpente',
    lead: 'Antoine Marchand',
    description: 'Equipe mobile pour levage ossature bois, charpente et mise hors d eau sur deux chantiers en parallele.',
    activeSites: ['Maison Dupont', 'Extension Martin'],
  },
  {
    id: 'team-chantier-beta',
    name: 'Equipe Chantier Beta',
    theme: 'gros_oeuvre',
    lead: 'Romain Faure',
    description: 'Equipe second chantier pour terrassement leger, montage murs bois, couverture et finitions exterieures.',
    activeSites: ['Villa des Pins', 'Maison Morel'],
  },
  {
    id: 'team-atelier-bureau',
    name: 'Atelier et Bureau',
    theme: 'administratif',
    lead: 'Claire Morel',
    description: 'Preparation atelier, achats, factures, documents et coordination administrative des equipes terrain.',
    activeSites: ['Atelier Sosson', 'Bureau Sosson'],
  },
]

export const defaultMembers: TeamMember[] = [
  {
    id: 'member-antoine-marchand',
    teamId: 'team-chantier-alpha',
    firstName: 'Antoine',
    lastName: 'Marchand',
    title: "Maitre d'oeuvre execution",
    qualification: 'OPC maison ossature bois',
    level: 'Responsable multi-chantiers',
    salaryGrossMonthly: 4200,
    contract: 'CDI cadre',
    coefficient: 'BTP Cadre C2',
    email: 'antoine.marchand@sosson.fr',
    phone: '06 11 24 72 30',
    status: 'terrain',
    site: 'Maison Dupont',
    activeSites: ['Maison Dupont', 'Extension Martin'],
    responsibilities: ['Sequencer les interventions', 'Controler la conformite ossature', 'Arbitrer les priorites chantier'],
    permissions: ['dashboard', 'chantiers', 'documents', 'planning', 'rapports'],
  },
  {
    id: 'member-nicolas-perrin',
    teamId: 'team-chantier-alpha',
    firstName: 'Nicolas',
    lastName: 'Perrin',
    title: "Chef d'equipe charpente",
    qualification: 'Charpentier bois N4P1',
    level: 'Chef pose ossature',
    salaryGrossMonthly: 3150,
    contract: 'CDI ouvrier qualifie',
    coefficient: 'BTP 250',
    email: 'nicolas.perrin@sosson.fr',
    phone: '06 18 42 55 09',
    status: 'terrain',
    site: 'Extension Martin',
    activeSites: ['Maison Dupont', 'Extension Martin'],
    responsibilities: ['Encadrer deux ouvriers', 'Piloter le levage', 'Valider le calepinage terrain'],
    permissions: ['chantiers', 'documents', 'planning'],
  },
  {
    id: 'member-yanis-bouchet',
    teamId: 'team-chantier-alpha',
    firstName: 'Yanis',
    lastName: 'Bouchet',
    title: 'Ouvrier ossature bois',
    qualification: 'Monteur MOB N2',
    level: 'Compagnon pose',
    salaryGrossMonthly: 2380,
    contract: 'CDI ouvrier',
    coefficient: 'BTP 185',
    email: 'yanis.bouchet@sosson.fr',
    phone: '06 21 77 84 15',
    status: 'terrain',
    site: 'Maison Dupont',
    activeSites: ['Maison Dupont'],
    responsibilities: ['Assembler les murs', 'Preparation quincaillerie', 'Photos avancement'],
    permissions: ['chantiers', 'documents'],
  },
  {
    id: 'member-romain-faure',
    teamId: 'team-chantier-beta',
    firstName: 'Romain',
    lastName: 'Faure',
    title: 'Conducteur de travaux',
    qualification: 'Pilotage travaux bois',
    level: 'Responsable terrain',
    salaryGrossMonthly: 3850,
    contract: 'CDI cadre',
    coefficient: 'BTP Cadre C1',
    email: 'romain@sosson.fr',
    phone: '06 12 45 78 20',
    status: 'terrain',
    site: 'Villa des Pins',
    activeSites: ['Villa des Pins', 'Maison Morel'],
    responsibilities: ['Coordonner sous-traitants', 'Valider les situations', 'Remonter les alertes planning'],
    permissions: ['dashboard', 'chantiers', 'documents', 'factures', 'planning'],
  },
  {
    id: 'member-elodie-ravet',
    teamId: 'team-chantier-beta',
    firstName: 'Elodie',
    lastName: 'Ravet',
    title: 'Couvreuse zingueuse',
    qualification: 'Couverture N3P2',
    level: 'Referente hors d eau',
    salaryGrossMonthly: 2860,
    contract: 'CDI ouvrier qualifie',
    coefficient: 'BTP 230',
    email: 'elodie.ravet@sosson.fr',
    phone: '06 09 31 66 42',
    status: 'terrain',
    site: 'Villa des Pins',
    activeSites: ['Villa des Pins'],
    responsibilities: ['Pose pare-pluie', 'Zinguerie', 'Controle etancheite'],
    permissions: ['chantiers', 'documents', 'planning'],
  },
  {
    id: 'member-baptiste-roux',
    teamId: 'team-chantier-beta',
    firstName: 'Baptiste',
    lastName: 'Roux',
    title: 'Menuisier poseur',
    qualification: 'Menuiserie exterieure N3P1',
    level: 'Pose finitions',
    salaryGrossMonthly: 2740,
    contract: 'CDI ouvrier qualifie',
    coefficient: 'BTP 210',
    email: 'baptiste.roux@sosson.fr',
    phone: '06 58 90 22 18',
    status: 'atelier',
    site: 'Atelier Sosson',
    activeSites: ['Maison Morel'],
    responsibilities: ['Preparations atelier', 'Pose menuiseries', 'Reprises de finition'],
    permissions: ['chantiers', 'documents'],
  },
  {
    id: 'member-claire-morel',
    teamId: 'team-atelier-bureau',
    firstName: 'Claire',
    lastName: 'Morel',
    title: 'Assistante de gestion',
    qualification: 'Administration BTP',
    level: 'Gestion chantier',
    salaryGrossMonthly: 2650,
    contract: 'CDI ETAM',
    coefficient: 'ETAM E',
    email: 'claire@sosson.fr',
    phone: '05 45 22 11 09',
    status: 'bureau',
    site: 'Bureau Sosson',
    activeSites: ['Bureau Sosson'],
    responsibilities: ['Controle factures', 'Classement documents', 'Relances clients'],
    permissions: ['clients', 'factures', 'documents', 'emails', 'previsionnel'],
  },
]

export const defaultLeaves: LeavePeriod[] = [
  {
    id: 'leave-nicolas-aout',
    memberId: 'member-nicolas-perrin',
    type: 'conges',
    month: 'Aout',
    startDay: 5,
    endDay: 16,
    note: 'Conges ete valides',
  },
  {
    id: 'leave-elodie-juin',
    memberId: 'member-elodie-ravet',
    type: 'formation',
    month: 'Juin',
    startDay: 10,
    endDay: 12,
    note: 'Formation etancheite toiture',
  },
]

export function loadCollection<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : fallback
  } catch {
    return fallback
  }
}

export function saveCollection<T>(key: string, value: T[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function loadTeams() {
  return normalizeTeams(loadCollection<Team>(TEAMS_STORAGE_KEY, defaultTeams))
}

export function loadMembers() {
  return normalizeMembers(loadCollection<TeamMember>(MEMBERS_STORAGE_KEY, defaultMembers))
}

export function loadLeaves() {
  return loadCollection<LeavePeriod>(LEAVES_STORAGE_KEY, defaultLeaves)
}

export function createId(prefix: string) {
  const suffix = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())
  return `${prefix}-${suffix}`
}

export function getInitials(member: Pick<TeamMember, 'firstName' | 'lastName'>) {
  return `${member.firstName[0] ?? ''}${member.lastName[0] ?? ''}`.toUpperCase()
}

export function formatSalary(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

function normalizeMembers(members: TeamMember[]): TeamMember[] {
  return members.map(member => ({
    ...member,
    qualification: member.qualification ?? member.level ?? member.title,
    salaryGrossMonthly: Number(member.salaryGrossMonthly ?? 0),
    contract: member.contract ?? 'A definir',
    coefficient: member.coefficient ?? 'A definir',
    activeSites: Array.isArray(member.activeSites) && member.activeSites.length ? member.activeSites : [member.site],
  }))
}

function normalizeTeams(teams: Team[]): Team[] {
  return teams.map(team => ({
    ...team,
    activeSites: Array.isArray(team.activeSites) && team.activeSites.length ? team.activeSites : ['A affecter'],
  }))
}
