import {
  listPrevisionnelCellEdits,
  listPrevisionnelExercises,
  listPrevisionnelLinesByExercise,
  updatePrevisionnelLineAmounts,
  updatePrevisionnelMonthlyAmount,
  upsertPrevisionnelCellEdit,
} from '@dataconnect/generated'
import type {
  ListPrevisionnelCellEditsData,
  ListPrevisionnelExercisesData,
  ListPrevisionnelLinesByExerciseData,
  UpdatePrevisionnelLineAmountsVariables,
  UpdatePrevisionnelMonthlyAmountVariables,
  UpsertPrevisionnelCellEditVariables,
} from '@dataconnect/generated'
import { getSossonDataConnect } from '@/lib/dataconnect'

export type SqlPrevisionnelExercise = ListPrevisionnelExercisesData['previsionnelExercises'][number]
export type SqlPrevisionnelLine = ListPrevisionnelLinesByExerciseData['previsionnelLines'][number]
export type SqlPrevisionnelCellEdit = ListPrevisionnelCellEditsData['previsionnelCellEdits'][number]

export async function listPrevisionnelExercisesFromSql() {
  const dc = getSossonDataConnect()
  const response = await listPrevisionnelExercises(dc)
  return response.data.previsionnelExercises
}

export async function listPrevisionnelLinesByExerciseFromSql(exerciseId: string) {
  const dc = getSossonDataConnect()
  const response = await listPrevisionnelLinesByExercise(dc, { exerciseId })
  return response.data.previsionnelLines
}

export async function loadLatestPrevisionnelFromSql() {
  const exercises = await listPrevisionnelExercisesFromSql()
  const latest = exercises[exercises.length - 1]
  const lines = latest ? await listPrevisionnelLinesByExerciseFromSql(latest.id) : []

  return { exercises, latest, lines }
}

export async function loadPrevisionnelSheetFromSql(sourceSheet: string) {
  const exercises = await listPrevisionnelExercisesFromSql()
  const exercise = exercises.find(item => item.sheet === sourceSheet)

  if (!exercise) return { exercise: null, lines: [], cellEdits: [] }

  const dc = getSossonDataConnect()
  const [linesResponse, cellEditsResponse] = await Promise.all([
    listPrevisionnelLinesByExercise(dc, { exerciseId: exercise.id }),
    listPrevisionnelCellEdits(dc, { sourceSheet }),
  ])

  return {
    exercise,
    lines: linesResponse.data.previsionnelLines,
    cellEdits: cellEditsResponse.data.previsionnelCellEdits,
  }
}

export async function updatePrevisionnelMonthlyAmountInSql(input: UpdatePrevisionnelMonthlyAmountVariables) {
  const dc = getSossonDataConnect()
  await updatePrevisionnelMonthlyAmount(dc, input)
}

export async function updatePrevisionnelLineAmountsInSql(input: UpdatePrevisionnelLineAmountsVariables) {
  const dc = getSossonDataConnect()
  await updatePrevisionnelLineAmounts(dc, input)
}

export async function upsertPrevisionnelCellEditInSql(input: UpsertPrevisionnelCellEditVariables) {
  const dc = getSossonDataConnect()
  await upsertPrevisionnelCellEdit(dc, input)
}
