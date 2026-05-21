import {
  convertTeamProfileSubmission,
  getCurrentTeamProfileSubmission,
  listTeamProfileSubmissions,
  submitCurrentTeamProfile,
} from '@dataconnect/generated'
import type {
  ConvertTeamProfileSubmissionVariables,
  GetCurrentTeamProfileSubmissionData,
  ListTeamProfileSubmissionsData,
  SubmitCurrentTeamProfileVariables,
} from '@dataconnect/generated'
import type { Role } from '@/data/users'
import { getSossonDataConnect, isDataConnectEnabled } from '@/lib/dataconnect'

export const requestedTeamTypes = ['chantier', 'chantier_bureau', 'administratif', 'gerant'] as const

export type RequestedTeamType = (typeof requestedTeamTypes)[number]
export type TeamProfileSubmission = NonNullable<GetCurrentTeamProfileSubmissionData['teamProfileSubmission']>
export type ListedTeamProfileSubmission = ListTeamProfileSubmissionsData['teamProfileSubmissions'][number]

export const requestedTeamTypeLabels: Record<RequestedTeamType, string> = {
  chantier: 'Chantier',
  chantier_bureau: 'Chantier / bureau',
  administratif: 'Administratif',
  gerant: 'Gerant',
}

export function asRequestedTeamType(value: string | null | undefined): RequestedTeamType | null {
  return requestedTeamTypes.includes(value as RequestedTeamType) ? (value as RequestedTeamType) : null
}

export function labelRequestedTeamType(value: string | null | undefined) {
  const normalized = asRequestedTeamType(value)
  return normalized ? requestedTeamTypeLabels[normalized] : value || 'Non renseigne'
}

export function defaultRoleForRequestedTeamType(value: string | null | undefined): Role {
  const normalized = asRequestedTeamType(value)
  if (normalized === 'administratif') return 'assistante'
  if (normalized === 'gerant') return 'gerant'
  return 'ouvrier'
}

export function defaultPosteForRequestedTeamType(value: string | null | undefined) {
  const normalized = asRequestedTeamType(value)
  if (normalized === 'administratif') return 'Assistant administratif'
  if (normalized === 'gerant') return 'Gerant'
  return 'Ouvrier'
}

export function sourceConnexionFromProvider(providerId: string | null | undefined) {
  if (!providerId) return 'firebase'
  if (providerId === 'google.com') return 'google'
  if (providerId === 'password') return 'email'
  return providerId.slice(0, 32)
}

export function buildInitials(prenom: string, nom: string) {
  return `${prenom.trim()[0] ?? ''}${nom.trim()[0] ?? ''}`.toUpperCase() || '??'
}

export async function fetchCurrentTeamProfileSubmission() {
  if (!isDataConnectEnabled) return null
  const dc = getSossonDataConnect()
  const response = await getCurrentTeamProfileSubmission(dc)
  return response.data.teamProfileSubmission ?? null
}

export async function loadTeamProfileSubmissionsFromSql() {
  const dc = getSossonDataConnect()
  const response = await listTeamProfileSubmissions(dc)
  return response.data.teamProfileSubmissions
}

export async function submitTeamProfileForCurrentUser(input: SubmitCurrentTeamProfileVariables) {
  const dc = getSossonDataConnect()
  return submitCurrentTeamProfile(dc, input)
}

export async function convertTeamProfileSubmissionInSql(input: ConvertTeamProfileSubmissionVariables) {
  const dc = getSossonDataConnect()
  return convertTeamProfileSubmission(dc, input)
}
