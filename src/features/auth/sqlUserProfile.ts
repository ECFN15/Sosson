import { getCurrentUser as getSqlCurrentUser } from '@dataconnect/generated'
import type { GetCurrentUserData } from '@dataconnect/generated'
import type { Role, User } from '@/data/users'
import { getSossonDataConnect, isDataConnectEnabled } from '@/lib/dataconnect'

const validRoles: Role[] = ['gerant', 'assistante', 'chef_chantier', 'ouvrier']

function asRole(value: string): Role | null {
  return validRoles.includes(value as Role) ? (value as Role) : null
}

function mapSqlUser(row: NonNullable<GetCurrentUserData['user']>): User | null {
  const role = asRole(row.role)
  if (!role) return null

  return {
    id: row.id,
    email: row.email,
    nom: row.nom,
    prenom: row.prenom,
    role,
    profilStatut: row.profilStatut,
    equipeTypeSouhaite: row.equipeTypeSouhaite,
    equipeFinaleId: row.equipeFinaleId,
    poste: row.poste,
    telephone: row.telephone,
    sourceConnexion: row.sourceConnexion,
    avatar: row.avatar ?? `${row.prenom[0] ?? ''}${row.nom[0] ?? ''}`.toUpperCase(),
  }
}

export async function fetchCurrentSqlUserProfile(): Promise<User | null> {
  if (!isDataConnectEnabled) return null

  const dc = getSossonDataConnect()
  const response = await getSqlCurrentUser(dc)
  const row = response.data.user
  return row ? mapSqlUser(row) : null
}
