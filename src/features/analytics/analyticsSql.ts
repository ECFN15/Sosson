import {
  createAnalyticsSnapshot,
  getAnalyticsSnapshot,
  listAnalyticsSnapshots,
} from '@dataconnect/generated'
import type {
  CreateAnalyticsSnapshotVariables,
  GetAnalyticsSnapshotVariables,
  ListAnalyticsSnapshotsVariables,
} from '@dataconnect/generated'
import { getSossonDataConnect } from '@/lib/dataconnect'

export async function loadAnalyticsSnapshotsFromSql(input: ListAnalyticsSnapshotsVariables) {
  const dc = getSossonDataConnect()
  const response = await listAnalyticsSnapshots(dc, input)
  return response.data.analyticsSnapshots
}

export async function loadAnalyticsSnapshotFromSql(input: GetAnalyticsSnapshotVariables) {
  const dc = getSossonDataConnect()
  const response = await getAnalyticsSnapshot(dc, input)
  return response.data.analyticsSnapshot
}

export async function createAnalyticsSnapshotInSql(input: CreateAnalyticsSnapshotVariables) {
  const dc = getSossonDataConnect()
  const response = await createAnalyticsSnapshot(dc, input)
  return response.data.analyticsSnapshot_insert.id
}
