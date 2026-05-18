import {
  createAuditEvent,
  createCheckpointArtifact,
  createCheckpointDecision,
  createCheckpointRun,
  createCheckpointStep,
  createDataImportIssue,
  createDataImportRun,
  createEntityChangeLog,
  getCheckpointRun,
  getDataImportRun,
  listCheckpointRuns,
  listDataImportRuns,
  listEntityChangeLogs,
  listRecentAuditEvents,
} from '@dataconnect/generated'
import type {
  CreateAuditEventVariables,
  CreateCheckpointArtifactVariables,
  CreateCheckpointDecisionVariables,
  CreateCheckpointRunVariables,
  CreateCheckpointStepVariables,
  CreateDataImportIssueVariables,
  CreateDataImportRunVariables,
  CreateEntityChangeLogVariables,
  GetCheckpointRunVariables,
  GetDataImportRunVariables,
  ListCheckpointRunsVariables,
  ListDataImportRunsVariables,
  ListEntityChangeLogsVariables,
  ListRecentAuditEventsVariables,
} from '@dataconnect/generated'
import { getSossonDataConnect } from '@/lib/dataconnect'

export async function loadRecentAuditEventsFromSql(input: ListRecentAuditEventsVariables) {
  const dc = getSossonDataConnect()
  const response = await listRecentAuditEvents(dc, input)
  return response.data.auditEvents
}

export async function loadEntityChangeLogsFromSql(input: ListEntityChangeLogsVariables) {
  const dc = getSossonDataConnect()
  const response = await listEntityChangeLogs(dc, input)
  return response.data.entityChangeLogs
}

export async function loadCheckpointRunsFromSql(input: ListCheckpointRunsVariables) {
  const dc = getSossonDataConnect()
  const response = await listCheckpointRuns(dc, input)
  return response.data.checkpointRuns
}

export async function loadCheckpointRunFromSql(input: GetCheckpointRunVariables) {
  const dc = getSossonDataConnect()
  const response = await getCheckpointRun(dc, input)
  return response.data.checkpointRun
}

export async function loadDataImportRunsFromSql(input: ListDataImportRunsVariables) {
  const dc = getSossonDataConnect()
  const response = await listDataImportRuns(dc, input)
  return response.data.dataImportRuns
}

export async function loadDataImportRunFromSql(input: GetDataImportRunVariables) {
  const dc = getSossonDataConnect()
  const response = await getDataImportRun(dc, input)
  return response.data.dataImportRun
}

export async function createAuditEventInSql(input: CreateAuditEventVariables) {
  const dc = getSossonDataConnect()
  const response = await createAuditEvent(dc, input)
  return response.data.auditEvent_insert.id
}

export async function createCheckpointRunInSql(input: CreateCheckpointRunVariables) {
  const dc = getSossonDataConnect()
  const response = await createCheckpointRun(dc, input)
  return response.data.checkpointRun_insert.id
}

export async function createCheckpointStepInSql(input: CreateCheckpointStepVariables) {
  const dc = getSossonDataConnect()
  const response = await createCheckpointStep(dc, input)
  return response.data.checkpointStep_insert.id
}

export async function createCheckpointArtifactInSql(input: CreateCheckpointArtifactVariables) {
  const dc = getSossonDataConnect()
  const response = await createCheckpointArtifact(dc, input)
  return response.data.checkpointArtifact_insert.id
}

export async function createCheckpointDecisionInSql(input: CreateCheckpointDecisionVariables) {
  const dc = getSossonDataConnect()
  const response = await createCheckpointDecision(dc, input)
  return response.data.checkpointDecision_insert.id
}

export async function createDataImportRunInSql(input: CreateDataImportRunVariables) {
  const dc = getSossonDataConnect()
  const response = await createDataImportRun(dc, input)
  return response.data.dataImportRun_insert.id
}

export async function createDataImportIssueInSql(input: CreateDataImportIssueVariables) {
  const dc = getSossonDataConnect()
  const response = await createDataImportIssue(dc, input)
  return response.data.dataImportIssue_insert.id
}

export async function createEntityChangeLogInSql(input: CreateEntityChangeLogVariables) {
  const dc = getSossonDataConnect()
  const response = await createEntityChangeLog(dc, input)
  return response.data.entityChangeLog_insert.id
}
