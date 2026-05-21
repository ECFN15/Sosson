import type { Role } from '@/data/users'

export const accessCapabilities = ['view', 'create', 'edit', 'admin'] as const

export type AccessCapability = (typeof accessCapabilities)[number]
export type CapabilitySet = Record<AccessCapability, boolean>

export const appPages = [
  { key: 'dashboard', label: 'Tableau de bord', path: '/dashboard', group: 'Pilotage' },
  { key: 'cowork', label: 'COWORK', path: '/cowork', group: 'Operationnel' },
  { key: 'chantiers', label: 'Chantiers', path: '/chantiers', group: 'Operationnel' },
  { key: 'clients', label: 'Clients', path: '/clients', group: 'Operationnel' },
  { key: 'documents', label: 'Documents', path: '/documents', group: 'Documents' },
  { key: 'factures', label: 'Factures', path: '/factures', group: 'Finance' },
  { key: 'previsionnel', label: 'Previsionnel', path: '/previsionnel', group: 'Finance' },
  { key: 'statistiques', label: 'Statistiques', path: '/statistiques', group: 'Pilotage' },
  { key: 'emails', label: 'Emails', path: '/emails', group: 'Communication' },
  { key: 'planning', label: 'Planning', path: '/planning', group: 'Operationnel' },
  { key: 'rapports', label: 'Rapports', path: '/rapports', group: 'Pilotage' },
  { key: 'moteur', label: 'Moteur live', path: '/moteur-dataflow', group: 'Support' },
  { key: 'documentation', label: 'Documentation', path: '/documentation', group: 'Support' },
  { key: 'equipe', label: 'Equipe', path: '/equipe', group: 'Administration' },
  { key: 'parametres', label: 'Parametres', path: '/parametres', group: 'Administration' },
  { key: 'base-sql-deploiement', label: 'Base SQL & Deploiement', path: '/base-sql-deploiement', group: 'Support' },
] as const

export type PagePermissionKey = (typeof appPages)[number]['key']
export type RoleAccess = Record<PagePermissionKey, CapabilitySet>
export type AccessMatrix = Record<Role, RoleAccess>

export const ACCESS_MATRIX_STORAGE_KEY = 'sosson.accessMatrix.v1'

const allCapabilities = capabilitySet(true, true, true, true)
const readOnly = capabilitySet(true, false, false, false)
const readWrite = capabilitySet(true, true, true, false)
const noAccess = capabilitySet(false, false, false, false)

function capabilitySet(view: boolean, create: boolean, edit: boolean, admin: boolean): CapabilitySet {
  return { view, create, edit, admin }
}

function roleAccess(overrides: Partial<Record<PagePermissionKey, CapabilitySet>>): RoleAccess {
  return Object.fromEntries(
    appPages.map(page => [page.key, overrides[page.key] ?? noAccess])
  ) as RoleAccess
}

export const defaultAccessMatrix: AccessMatrix = {
  gerant: roleAccess(
    Object.fromEntries(appPages.map(page => [page.key, allCapabilities])) as Partial<Record<PagePermissionKey, CapabilitySet>>
  ),
  assistante: roleAccess({
    dashboard: readOnly,
    cowork: readWrite,
    chantiers: readWrite,
    clients: readWrite,
    documents: readWrite,
    factures: readWrite,
    previsionnel: readWrite,
    statistiques: readOnly,
    emails: readWrite,
    planning: readWrite,
    rapports: readOnly,
    moteur: readOnly,
    documentation: readOnly,
    equipe: readOnly,
    parametres: noAccess,
    'base-sql-deploiement': readOnly,
  }),
  chef_chantier: roleAccess({
    cowork: readWrite,
  }),
  ouvrier: roleAccess({
    cowork: readWrite,
  }),
}

export function getDefaultPathForRole(role: Role | undefined, matrix: AccessMatrix = defaultAccessMatrix) {
  if (!role) return '/login'
  return appPages.find(page => canAccessPage(role, page.key, matrix))?.path ?? '/login'
}

export function getPageByPath(pathname: string) {
  const normalized = pathname === '/' ? '/dashboard' : pathname
  return appPages.find(page => normalized === page.path || normalized.startsWith(`${page.path}/`))
}

export function canAccessPage(
  role: Role | undefined,
  pageKey: PagePermissionKey,
  matrix: AccessMatrix,
  capability: AccessCapability = 'view'
) {
  if (!role) return false
  return matrix[role]?.[pageKey]?.[capability] ?? false
}

export function canAccessPath(role: Role | undefined, pathname: string, matrix: AccessMatrix) {
  const page = getPageByPath(pathname)
  if (!page) return true
  return canAccessPage(role, page.key, matrix)
}

export function loadAccessMatrix(): AccessMatrix {
  if (typeof window === 'undefined') return defaultAccessMatrix

  try {
    const raw = window.localStorage.getItem(ACCESS_MATRIX_STORAGE_KEY)
    if (!raw) return defaultAccessMatrix
    return normalizeAccessMatrix(JSON.parse(raw))
  } catch {
    return defaultAccessMatrix
  }
}

export function saveAccessMatrix(matrix: AccessMatrix) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ACCESS_MATRIX_STORAGE_KEY, JSON.stringify(normalizeAccessMatrix(matrix)))
}

export function normalizeAccessMatrix(value: unknown): AccessMatrix {
  const source = value as Partial<Record<Role, Partial<Record<PagePermissionKey, Partial<CapabilitySet>>>>>

  return {
    gerant: normalizeRoleAccess(source.gerant, defaultAccessMatrix.gerant),
    assistante: normalizeRoleAccess(source.assistante, defaultAccessMatrix.assistante),
    chef_chantier: normalizeRoleAccess(source.chef_chantier, defaultAccessMatrix.chef_chantier),
    ouvrier: normalizeRoleAccess(source.ouvrier, defaultAccessMatrix.ouvrier),
  }
}

function normalizeRoleAccess(source: Partial<Record<PagePermissionKey, Partial<CapabilitySet>>> | undefined, fallback: RoleAccess): RoleAccess {
  return Object.fromEntries(
    appPages.map(page => {
      const capabilities = source?.[page.key]
      return [
        page.key,
        {
          view: normalizeCapability(capabilities?.view, fallback[page.key].view),
          create: normalizeCapability(capabilities?.create, fallback[page.key].create),
          edit: normalizeCapability(capabilities?.edit, fallback[page.key].edit),
          admin: normalizeCapability(capabilities?.admin, fallback[page.key].admin),
        },
      ]
    })
  ) as RoleAccess
}

function normalizeCapability(value: boolean | undefined, fallback: boolean) {
  if (value === undefined) return fallback
  return Boolean(value) && fallback
}
