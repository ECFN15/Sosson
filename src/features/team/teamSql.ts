import {
  createSossonPayrollPeriod,
  createSossonTeam,
  createSossonTeamLeavePeriod,
  createSossonTeamMember,
  createSossonWorkTimeEntry,
  listSossonPayrollPeriods,
  listSossonTeams,
  listSossonWorkTimeEntries,
  listUsers,
  updateSossonTeamMember,
} from '@dataconnect/generated'
import type {
  CreateSossonPayrollPeriodVariables,
  CreateSossonTeamLeavePeriodVariables,
  CreateSossonTeamMemberVariables,
  CreateSossonTeamVariables,
  CreateSossonWorkTimeEntryVariables,
  ListSossonPayrollPeriodsVariables,
  ListSossonTeamsData,
  ListSossonWorkTimeEntriesVariables,
  ListUsersData,
  UpdateSossonTeamMemberVariables,
} from '@dataconnect/generated'
import type { Role } from '@/data/users'
import { getSossonDataConnect } from '@/lib/dataconnect'
import { appPages } from '@/lib/accessControl'
import type { PagePermissionKey } from '@/lib/accessControl'
import type { LeavePeriod, LeaveType, MemberStatus, Team, TeamMember, TeamTheme } from '@/lib/teamDirectory'
export {
  convertTeamProfileSubmissionInSql,
  loadTeamProfileSubmissionsFromSql,
} from '@/features/auth/teamProfileSubmission'
export type { ListedTeamProfileSubmission } from '@/features/auth/teamProfileSubmission'

const knownRoles: Role[] = ['gerant', 'assistante', 'chef_chantier']
const knownThemes: TeamTheme[] = ['charpente', 'couverture', 'menuiserie', 'gros_oeuvre', 'administratif']
const knownMemberStatuses: MemberStatus[] = ['terrain', 'atelier', 'bureau', 'absent']
const knownLeaveTypes: LeaveType[] = ['conges', 'formation', 'maladie', 'recuperation']
const knownPermissions = new Set<PagePermissionKey>(appPages.map(page => page.key))

type SqlTeamRow = ListSossonTeamsData['sossonTeams'][number]
type SqlTeamMemberRow = SqlTeamRow['members'][number]
type SqlTeamLeaveRow = SqlTeamMemberRow['leaves'][number]

export type SqlTeamProfile = {
  id: string
  email: string
  nom: string
  prenom: string
  role: Role | null
  rawRole: string
  profilStatut: string | null
  equipeTypeSouhaite: string | null
  equipeFinaleId: string | null
  poste: string | null
  telephone: string | null
  sourceConnexion: string | null
  avatar: string
  dateCreation: string
}

export type SqlTeamDirectory = {
  teams: Team[]
  members: TeamMember[]
  leaves: LeavePeriod[]
}

function asRole(value: string): Role | null {
  return knownRoles.includes(value as Role) ? (value as Role) : null
}

function asTheme(value: string | null | undefined): TeamTheme {
  return knownThemes.includes(value as TeamTheme) ? (value as TeamTheme) : 'administratif'
}

function asMemberStatus(value: string | null | undefined): MemberStatus {
  return knownMemberStatuses.includes(value as MemberStatus) ? (value as MemberStatus) : 'terrain'
}

function asLeaveType(value: string | null | undefined): LeaveType {
  return knownLeaveTypes.includes(value as LeaveType) ? (value as LeaveType) : 'conges'
}

function splitSqlList(value: string | null | undefined, fallback: string[]) {
  const items = (value ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
  return items.length ? items : fallback
}

function splitSqlPermissions(value: string | null | undefined, fallback: PagePermissionKey[]) {
  const items = splitSqlList(value, [])
    .filter(item => knownPermissions.has(item as PagePermissionKey)) as PagePermissionKey[]
  return items.length ? items : fallback
}

export function listToSqlValue(items: string[]) {
  const value = items.map(item => item.trim()).filter(Boolean).join(', ')
  return value || null
}

export function permissionsToSqlValue(items: PagePermissionKey[]) {
  return listToSqlValue(items)
}

export function makeTeamCode(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || `team-${Date.now()}`
}

export function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function mapSqlUser(row: ListUsersData['users'][number]): SqlTeamProfile {
  return {
    id: row.id,
    email: row.email,
    nom: row.nom,
    prenom: row.prenom,
    role: asRole(row.role),
    rawRole: row.role,
    profilStatut: row.profilStatut ?? null,
    equipeTypeSouhaite: row.equipeTypeSouhaite ?? null,
    equipeFinaleId: row.equipeFinaleId ?? null,
    poste: row.poste ?? null,
    telephone: row.telephone ?? null,
    sourceConnexion: row.sourceConnexion ?? null,
    avatar: row.avatar ?? `${row.prenom[0] ?? ''}${row.nom[0] ?? ''}`.toUpperCase(),
    dateCreation: row.dateCreation,
  }
}

export async function loadTeamProfilesFromSql() {
  const dc = getSossonDataConnect()
  const response = await listUsers(dc)
  return response.data.users.map(mapSqlUser)
}

function mapSqlTeam(row: SqlTeamRow): Team {
  return {
    id: row.id,
    name: row.name,
    theme: asTheme(row.theme),
    lead: row.leadName ?? 'A definir',
    description: row.description ?? 'Equipe operationnelle Sosson.',
    activeSites: splitSqlList(row.activeSites, ['A affecter']),
  }
}

function mapSqlMember(row: SqlTeamMemberRow, teamId: string): TeamMember {
  const site = row.site ?? 'A affecter'
  return {
    id: row.id,
    teamId,
    firstName: row.firstName,
    lastName: row.lastName,
    title: row.title,
    qualification: row.qualification ?? row.title,
    level: row.level ?? row.user?.role ?? 'Membre equipe',
    salaryGrossMonthly: Number(row.salaryGrossMonthly ?? 0),
    contract: row.contract ?? 'A definir',
    coefficient: row.coefficient ?? 'A definir',
    email: row.email ?? row.user?.email ?? '',
    phone: row.phone ?? '',
    status: asMemberStatus(row.status),
    site,
    activeSites: splitSqlList(row.activeSites, [site]),
    responsibilities: splitSqlList(row.responsibilities, ['Fiche de poste a completer']),
    permissions: splitSqlPermissions(row.permissions, ['chantiers', 'documents']),
  }
}

function mapSqlLeave(row: SqlTeamLeaveRow, memberId: string): LeavePeriod {
  return {
    id: row.id,
    memberId,
    type: asLeaveType(row.type),
    month: row.month,
    startDay: row.startDay,
    endDay: row.endDay,
    note: row.note ?? '',
  }
}

export async function loadTeamDirectoryFromSql(): Promise<SqlTeamDirectory> {
  const dc = getSossonDataConnect()
  const response = await listSossonTeams(dc)

  const teams = response.data.sossonTeams.map(mapSqlTeam)
  const members = response.data.sossonTeams.flatMap(team =>
    team.members.map(member => mapSqlMember(member, team.id)),
  )
  const leaves = response.data.sossonTeams.flatMap(team =>
    team.members.flatMap(member => member.leaves.map(leave => mapSqlLeave(leave, member.id))),
  )

  return { teams, members, leaves }
}

export async function createTeamInSql(input: CreateSossonTeamVariables) {
  const dc = getSossonDataConnect()
  const response = await createSossonTeam(dc, input)
  return response.data.sossonTeam_insert.id
}

export async function createTeamMemberInSql(input: CreateSossonTeamMemberVariables) {
  const dc = getSossonDataConnect()
  const response = await createSossonTeamMember(dc, input)
  return response.data.sossonTeamMember_insert.id
}

export async function updateTeamMemberInSql(input: UpdateSossonTeamMemberVariables) {
  const dc = getSossonDataConnect()
  const response = await updateSossonTeamMember(dc, input)
  return response.data.sossonTeamMember_update?.id ?? null
}

export async function createTeamLeavePeriodInSql(input: CreateSossonTeamLeavePeriodVariables) {
  const dc = getSossonDataConnect()
  const response = await createSossonTeamLeavePeriod(dc, input)
  return response.data.sossonTeamLeavePeriod_insert.id
}

export async function createWorkTimeEntryInSql(input: CreateSossonWorkTimeEntryVariables) {
  const dc = getSossonDataConnect()
  const response = await createSossonWorkTimeEntry(dc, input)
  return response.data.sossonWorkTimeEntry_insert.id
}

export async function createPayrollPeriodInSql(input: CreateSossonPayrollPeriodVariables) {
  const dc = getSossonDataConnect()
  const response = await createSossonPayrollPeriod(dc, input)
  return response.data.sossonPayrollPeriod_insert.id
}

export async function loadWorkTimeEntriesFromSql(input: ListSossonWorkTimeEntriesVariables) {
  const dc = getSossonDataConnect()
  const response = await listSossonWorkTimeEntries(dc, input)
  return response.data.sossonWorkTimeEntries
}

export async function loadPayrollPeriodsFromSql(input: ListSossonPayrollPeriodsVariables) {
  const dc = getSossonDataConnect()
  const response = await listSossonPayrollPeriods(dc, input)
  return response.data.sossonPayrollPeriods
}
