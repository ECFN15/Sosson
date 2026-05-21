import { mkdir, writeFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import {
  cancelPlanningEvent,
  connectorConfig,
  createChantier,
  createClient,
  createPlanningAssignment,
  createPlanningEvent,
  listPlanningEventsByChantier,
  listPlanningEventsByPeriod,
  updatePlanningEventDetails,
} from '@dataconnect/admin-generated'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399
const repoRoot = process.cwd()
const outputArg = process.argv.find(arg => arg.startsWith('--output='))
const outputPath = outputArg?.slice('--output='.length) || 'tmp/checkpoint-002/planning-local.json'

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

function impersonate(uid, email) {
  return {
    impersonate: {
      authClaims: {
        sub: uid,
        uid,
        email,
        email_verified: true,
      },
    },
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function sameInstant(actual, expected) {
  return new Date(actual).getTime() === new Date(expected).getTime()
}

async function writeOutput(payload) {
  const resolved = path.resolve(repoRoot, outputPath)
  const relative = path.relative(repoRoot, resolved)

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('--output doit rester dans le repo.')
  }

  if (!relative.startsWith(`tmp${path.sep}`)) {
    throw new Error('--output doit pointer sous tmp/ pour eviter de committer des preuves locales par accident.')
  }

  await mkdir(path.dirname(resolved), { recursive: true })
  await writeFile(resolved, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.error(`Preuve planning SQL locale ecrite dans ${relative}`)
}

if (!(await isPortOpen(EMULATOR_HOST, EMULATOR_PORT))) {
  console.error(
    `SQL Connect emulator is not reachable at ${EMULATOR_HOST}:${EMULATOR_PORT}.\n` +
      'Start it first with: npm run emulators:dataconnect',
  )
  process.exit(1)
}

if (getApps().length === 0) {
  initializeApp({ projectId: 'sosson-sandbox' })
}

const dc = getDataConnect(connectorConfig)
const actor = {
  id: 'planning-local',
  email: 'planning@sosson.local',
  nom: 'Planning',
  prenom: 'Local',
  role: 'assistante',
  avatar: 'PL',
}
const options = impersonate(actor.id, actor.email)
const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
const initialStartAt = '2026-02-03T07:00:00.000Z'
const initialEndAt = '2026-02-03T15:00:00.000Z'
const updatedStartAt = '2026-02-04T08:30:00.000Z'
const updatedEndAt = '2026-02-04T16:30:00.000Z'
const periodStart = '2026-02-04T00:00:00.000Z'
const periodEnd = '2026-02-04T23:59:59.999Z'

await dc.upsert('User', actor)

const clientResponse = await createClient(
  dc,
  {
    type: 'professionnel',
    nom: `Client planning local ${stamp}`,
    email: 'client-planning@sosson.local',
    telephone: null,
    adresse: null,
    ville: 'Local',
    codePostal: '00000',
  },
  options,
)
const clientId = clientResponse.data.client_insert.id

const chantierResponse = await createChantier(
  dc,
  {
    clientId,
    chefChantierId: null,
    nom: `Chantier planning local ${stamp}`,
    statut: 'en_cours',
    dateDebut: '2026-02-01',
    dateFinPrevue: '2026-03-01',
    budgetPrevisionnel: 18000,
    description: 'Prerequis local pour verifier le planning relie au detail chantier.',
    adresse: 'Local',
  },
  options,
)
const chantierId = chantierResponse.data.chantier_insert.id

const createResponse = await createPlanningEvent(
  dc,
  {
    chantierId,
    titre: `Planning local ${stamp}`,
    eventType: 'charpente',
    statut: 'planned',
    startAt: initialStartAt,
    endAt: initialEndAt,
    location: 'Atelier',
    notes: 'Creation locale avant modification.',
  },
  options,
)
const eventId = createResponse.data.planningEvent_insert.id

const assignmentResponse = await createPlanningAssignment(
  dc,
  {
    eventId,
    userId: null,
    assignmentRole: 'charpente',
    statut: 'planned',
    notes: 'Affectation locale de verification.',
  },
  options,
)
const assignmentId = assignmentResponse.data.planningAssignment_insert.id

await updatePlanningEventDetails(
  dc,
  {
    id: eventId,
    chantierId,
    titre: `Planning local modifie ${stamp}`,
    eventType: 'couverture',
    statut: 'blocked',
    startAt: updatedStartAt,
    endAt: updatedEndAt,
    location: 'Chantier test local',
    notes: 'Modification SQL relue via ListPlanningEventsByPeriod.',
  },
  options,
)

const cancellationNotes = 'Annulation SQL locale sans suppression physique.'
await cancelPlanningEvent(
  dc,
  {
    id: eventId,
    notes: cancellationNotes,
  },
  options,
)

const [readResponse, byChantierResponse] = await Promise.all([
  listPlanningEventsByPeriod(
    dc,
    {
      startAt: periodStart,
      endAt: periodEnd,
    },
    options,
  ),
  listPlanningEventsByChantier(dc, { chantierId }, options),
])
const readBack = readResponse.data.planningEvents.find(event => event.id === eventId)
const byChantierBack = byChantierResponse.data.planningEvents.find(event => event.id === eventId)

assert(readBack, 'PlanningEvent cree puis modifie introuvable via ListPlanningEventsByPeriod.')
assert(byChantierBack, 'PlanningEvent cree puis modifie introuvable via ListPlanningEventsByChantier.')
assert(readBack.titre === `Planning local modifie ${stamp}`, 'Titre planning non modifie en SQL.')
assert(readBack.eventType === 'couverture', 'Equipe/type planning non modifie en SQL.')
assert(readBack.statut === 'cancelled', 'Annulation planning non enregistree en SQL.')
assert(byChantierBack.statut === 'cancelled', 'Annulation planning non relue via ListPlanningEventsByChantier.')
assert(readBack.chantier?.id === chantierId, 'Lien PlanningEvent -> Chantier non relu via ListPlanningEventsByPeriod.')
assert(sameInstant(readBack.startAt, updatedStartAt), 'Debut planning non modifie en SQL.')
assert(sameInstant(readBack.endAt, updatedEndAt), 'Fin planning non modifiee en SQL.')
assert(sameInstant(byChantierBack.startAt, updatedStartAt), 'Debut planning non relu via ListPlanningEventsByChantier.')
assert(sameInstant(byChantierBack.endAt, updatedEndAt), 'Fin planning non relue via ListPlanningEventsByChantier.')
assert(readBack.location === 'Chantier test local', 'Lieu planning non modifie en SQL.')
assert(readBack.notes === cancellationNotes, 'Notes d annulation planning non modifiees en SQL.')
assert(readBack.updatedBy?.id === actor.id, 'updatedBy planning non renseigne avec le profil SQL local.')
assert(
  readBack.assignmentsByPeriod.some(assignment => assignment.id === assignmentId && assignment.assignmentRole === 'charpente'),
  'PlanningAssignment creee non relue avec l evenement planning.',
)
assert(
  byChantierBack.assignmentsByChantier.some(assignment => assignment.id === assignmentId && assignment.assignmentRole === 'charpente'),
  'PlanningAssignment creee non relue via ListPlanningEventsByChantier.',
)

const proof = {
  mode: 'local-emulator',
  mutatesData: true,
  generatedAt: new Date().toISOString(),
  clientId,
  chantierId,
  eventId,
  assignmentId,
  planningEventsByChantierCount: byChantierResponse.data.planningEvents.length,
  readBack: {
    found: true,
    listedByChantier: true,
    titre: readBack.titre,
    eventType: readBack.eventType,
    statut: readBack.statut,
    cancelledWithoutDelete: readBack.statut === 'cancelled',
    chantierLinked: readBack.chantier?.id === chantierId,
    startAt: readBack.startAt,
    endAt: readBack.endAt,
    location: readBack.location,
    notes: readBack.notes,
    updatedBy: readBack.updatedBy ? {
      id: readBack.updatedBy.id,
      nom: readBack.updatedBy.nom,
      prenom: readBack.updatedBy.prenom,
      avatar: readBack.updatedBy.avatar,
    } : null,
    assignments: readBack.assignmentsByPeriod.length,
  },
}

await writeOutput(proof)
console.log(JSON.stringify(proof, null, 2))
