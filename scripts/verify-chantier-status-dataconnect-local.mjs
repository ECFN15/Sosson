import { mkdir, writeFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import {
  connectorConfig,
  listOperationalChantiers,
  updateChantierStatut,
} from '@dataconnect/admin-generated'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399
const repoRoot = process.cwd()
const outputArg = process.argv.find(arg => arg.startsWith('--output='))
const outputPath = outputArg?.slice('--output='.length)
const targetChantierSeedId = 'bbbbbbbb-0000-0000-0000-000000000001'

process.env.DATA_CONNECT_EMULATOR_HOST ??= `${EMULATOR_HOST}:${EMULATOR_PORT}`

function normalizeUuid(value) {
  return value.replaceAll('-', '').toLowerCase()
}

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

async function writeOutputIfRequested(payload) {
  if (!outputPath) return

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
  console.error(`Preuve statut chantier SQL locale ecrite dans ${relative}`)
}

async function getTargetChantier(dc) {
  const response = await listOperationalChantiers(dc)
  return response.data.chantiers.find(chantier =>
    normalizeUuid(chantier.id) === normalizeUuid(targetChantierSeedId)
  )
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
const profile = {
  id: 'chantier-status-local',
  email: 'chantier.status@sosson.local',
  nom: 'Chantier',
  prenom: 'Statut',
  role: 'chef_chantier',
  avatar: 'CS',
}
const auth = impersonate(profile.id, profile.email)

await dc.upsert('User', profile)

const before = await getTargetChantier(dc)
if (!before) {
  throw new Error(`Chantier operationnel local introuvable: ${targetChantierSeedId}`)
}

const nextStatus = before.statut === 'cloture' ? 'en_cours' : 'cloture'
const nextDateFin = nextStatus === 'cloture' ? new Date().toISOString().slice(0, 10) : null

await updateChantierStatut(
  dc,
  {
    id: before.id,
    statut: nextStatus,
    dateFin: nextDateFin,
  },
  auth,
)

const afterUpdate = await getTargetChantier(dc)

await updateChantierStatut(
  dc,
  {
    id: before.id,
    statut: before.statut,
    dateFin: before.dateFin ?? null,
  },
  auth,
)

const afterRevert = await getTargetChantier(dc)

const proof = {
  mode: 'local-emulator',
  mutatesData: true,
  revertsSeedState: true,
  generatedAt: new Date().toISOString(),
  chantierId: before.id,
  actorUid: profile.id,
  before: {
    statut: before.statut,
    dateFin: before.dateFin ?? null,
  },
  afterUpdate: {
    statut: afterUpdate?.statut ?? null,
    dateFin: afterUpdate?.dateFin ?? null,
  },
  afterRevert: {
    statut: afterRevert?.statut ?? null,
    dateFin: afterRevert?.dateFin ?? null,
  },
  checks: {
    targetFound: Boolean(before),
    updateApplied: afterUpdate?.statut === nextStatus,
    dateFinApplied: nextStatus !== 'cloture' || Boolean(afterUpdate?.dateFin),
    seedStateReverted: afterRevert?.statut === before.statut && (afterRevert?.dateFin ?? null) === (before.dateFin ?? null),
  },
}

const failures = Object.entries(proof.checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name)

await writeOutputIfRequested(proof)
console.log(JSON.stringify(proof, null, 2))

if (failures.length > 0) {
  console.error(`Verification statut chantier SQL KO:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
