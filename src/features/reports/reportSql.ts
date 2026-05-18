import {
  createRapport,
  getRapport,
  listRapports,
  markRapportGenerated,
} from '@dataconnect/generated'
import type {
  CreateRapportVariables,
  GetRapportVariables,
  MarkRapportGeneratedVariables,
} from '@dataconnect/generated'
import { getSossonDataConnect } from '@/lib/dataconnect'

export async function loadRapportsFromSql() {
  const dc = getSossonDataConnect()
  const response = await listRapports(dc)
  return response.data.rapports
}

export async function loadRapportFromSql(input: GetRapportVariables) {
  const dc = getSossonDataConnect()
  const response = await getRapport(dc, input)
  return response.data.rapport
}

export async function createRapportInSql(input: CreateRapportVariables) {
  const dc = getSossonDataConnect()
  const response = await createRapport(dc, input)
  return response.data.rapport_insert.id
}

export async function markRapportGeneratedInSql(input: MarkRapportGeneratedVariables) {
  const dc = getSossonDataConnect()
  const response = await markRapportGenerated(dc, input)
  return response.data.rapport_update?.id ?? null
}
