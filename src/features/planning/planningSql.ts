import {
  cancelPlanningEvent,
  completePlanningJobSheet,
  createPlanningAssignment,
  createPlanningEvent,
  createPlanningJobSheet,
  listPlanningJobSheetsByEvent,
  listPlanningEventsByChantier,
  listPlanningEventsByPeriod,
  updatePlanningJobSheetProgress,
  updatePlanningEventDetails,
  updatePlanningAssignmentStatus,
  updatePlanningEventStatus,
} from '@dataconnect/generated'
import type {
  CancelPlanningEventVariables,
  CompletePlanningJobSheetVariables,
  CreatePlanningAssignmentVariables,
  CreatePlanningEventVariables,
  CreatePlanningJobSheetVariables,
  ListPlanningJobSheetsByEventVariables,
  ListPlanningEventsByChantierVariables,
  ListPlanningEventsByPeriodVariables,
  UpdatePlanningEventDetailsVariables,
  UpdatePlanningAssignmentStatusVariables,
  UpdatePlanningEventStatusVariables,
  UpdatePlanningJobSheetProgressVariables,
} from '@dataconnect/generated'
import { getSossonDataConnect } from '@/lib/dataconnect'

export async function loadPlanningEventsByPeriodFromSql(input: ListPlanningEventsByPeriodVariables) {
  const dc = getSossonDataConnect()
  const response = await listPlanningEventsByPeriod(dc, input)
  return response.data.planningEvents
}

export async function loadPlanningEventsByChantierFromSql(input: ListPlanningEventsByChantierVariables) {
  const dc = getSossonDataConnect()
  const response = await listPlanningEventsByChantier(dc, input)
  return response.data.planningEvents
}

export async function loadPlanningJobSheetsByEventFromSql(input: ListPlanningJobSheetsByEventVariables) {
  const dc = getSossonDataConnect()
  const response = await listPlanningJobSheetsByEvent(dc, input)
  return response.data.planningJobSheets
}

export async function createPlanningEventInSql(input: CreatePlanningEventVariables) {
  const dc = getSossonDataConnect()
  const response = await createPlanningEvent(dc, input)
  return response.data.planningEvent_insert.id
}

export async function updatePlanningEventStatusInSql(input: UpdatePlanningEventStatusVariables) {
  const dc = getSossonDataConnect()
  const response = await updatePlanningEventStatus(dc, input)
  return response.data.planningEvent_update?.id ?? null
}

export async function updatePlanningEventDetailsInSql(input: UpdatePlanningEventDetailsVariables) {
  const dc = getSossonDataConnect()
  const response = await updatePlanningEventDetails(dc, input)
  return response.data.planningEvent_update?.id ?? null
}

export async function cancelPlanningEventInSql(input: CancelPlanningEventVariables) {
  const dc = getSossonDataConnect()
  const response = await cancelPlanningEvent(dc, input)
  return response.data.planningEvent_update?.id ?? null
}

export async function createPlanningAssignmentInSql(input: CreatePlanningAssignmentVariables) {
  const dc = getSossonDataConnect()
  const response = await createPlanningAssignment(dc, input)
  return response.data.planningAssignment_insert.id
}

export async function updatePlanningAssignmentStatusInSql(input: UpdatePlanningAssignmentStatusVariables) {
  const dc = getSossonDataConnect()
  const response = await updatePlanningAssignmentStatus(dc, input)
  return response.data.planningAssignment_update?.id ?? null
}

export async function createPlanningJobSheetInSql(input: CreatePlanningJobSheetVariables) {
  const dc = getSossonDataConnect()
  const response = await createPlanningJobSheet(dc, input)
  return response.data.planningJobSheet_insert.id
}

export async function updatePlanningJobSheetProgressInSql(input: UpdatePlanningJobSheetProgressVariables) {
  const dc = getSossonDataConnect()
  const response = await updatePlanningJobSheetProgress(dc, input)
  return response.data.planningJobSheet_update?.id ?? null
}

export async function completePlanningJobSheetInSql(input: CompletePlanningJobSheetVariables) {
  const dc = getSossonDataConnect()
  const response = await completePlanningJobSheet(dc, input)
  return response.data.planningJobSheet_update?.id ?? null
}
