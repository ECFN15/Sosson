import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import { connectorConfig, listPrevisionnelExercises } from '@dataconnect/admin-generated'

process.env.DATA_CONNECT_EMULATOR_HOST ??= '127.0.0.1:9399'

if (getApps().length === 0) {
  initializeApp({ projectId: 'sosson-sandbox' })
}

const dc = getDataConnect(connectorConfig)
const exercisesResponse = await listPrevisionnelExercises(dc)
const exercises = exercisesResponse.data.previsionnelExercises
const latest = exercises.find(exercise => exercise.exercise === '2025-26')

const counts = {
  exercises: exercises.length,
  chantiers: exercises.reduce((sum, exercise) => sum + exercise.chantierCount, 0),
  latestExerciseChantiers: latest?.chantierCount ?? 0,
}

console.log(JSON.stringify(counts, null, 2))

if (counts.exercises !== 13 || counts.chantiers !== 898 || counts.latestExerciseChantiers !== 101) {
  process.exitCode = 1
}
