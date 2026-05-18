import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import net from 'node:net'
import { connectorConfig, listPrevisionnelExercises } from '@dataconnect/admin-generated'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399
process.env.DATA_CONNECT_EMULATOR_HOST ??= `${EMULATOR_HOST}:${EMULATOR_PORT}`

function isPortOpen(host, port) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host, port })
    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.once('error', () => resolve(false))
    socket.setTimeout(1000, () => {
      socket.destroy()
      resolve(false)
    })
  })
}

if (!(await isPortOpen(EMULATOR_HOST, EMULATOR_PORT))) {
  console.error(
    `SQL Connect emulator is not reachable at ${EMULATOR_HOST}:${EMULATOR_PORT}.\n` +
      'Start it first with: npm run emulators:dataconnect'
  )
  process.exit(1)
}

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
