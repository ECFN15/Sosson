import { listUsers } from '@dataconnect/generated'
import type { ListUsersData } from '@dataconnect/generated'
import type { Role } from '@/data/users'
import { getSossonDataConnect } from '@/lib/dataconnect'

const knownRoles: Role[] = ['gerant', 'assistante', 'chef_chantier']

export type SqlTeamProfile = {
  id: string
  email: string
  nom: string
  prenom: string
  role: Role | null
  rawRole: string
  avatar: string
  dateCreation: string
}

function asRole(value: string): Role | null {
  return knownRoles.includes(value as Role) ? (value as Role) : null
}

function mapSqlUser(row: ListUsersData['users'][number]): SqlTeamProfile {
  return {
    id: row.id,
    email: row.email,
    nom: row.nom,
    prenom: row.prenom,
    role: asRole(row.role),
    rawRole: row.role,
    avatar: row.avatar ?? `${row.prenom[0] ?? ''}${row.nom[0] ?? ''}`.toUpperCase(),
    dateCreation: row.dateCreation,
  }
}

export async function loadTeamProfilesFromSql() {
  const dc = getSossonDataConnect()
  const response = await listUsers(dc)
  return response.data.users.map(mapSqlUser)
}
