import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import net from 'node:net'
import { createHash } from 'node:crypto'
import {
  connectorConfig,
  getCurrentUser,
  listDevis,
  listDocumentFolders,
  listDocumentsAttaches,
  listFactures,
  listOperationalChantiers,
  listOperationalClients,
  listPrevisionnelExercises,
  listPrevisionnelLinesByExercise,
} from '@dataconnect/admin-generated'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399
const repoRoot = process.cwd()

const args = new Set(process.argv.slice(2))
const sandbox = args.has('--sandbox')
const yesSandbox = args.has('--yes-sandbox')
const dryRun = args.has('--dry-run')
const userProfilesArg = process.argv.find(arg => arg.startsWith('--user-profiles='))
const userProfilesPath = userProfilesArg?.slice('--user-profiles='.length)
const outputArg = process.argv.find(arg => arg.startsWith('--output='))
const outputPath = outputArg?.slice('--output='.length)

function fingerprintUid(uid) {
  return createHash('sha256').update(uid).digest('hex').slice(0, 12)
}

function emailDomain(email) {
  return email.includes('@') ? email.split('@').pop() : null
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

async function loadKnownProfiles() {
  if (!userProfilesPath) return []
  const content = await readFile(userProfilesPath, 'utf8')
  const parsed = JSON.parse(content)
  if (!Array.isArray(parsed)) throw new Error('Le fichier --user-profiles doit contenir un tableau JSON.')
  return parsed
    .filter(profile => profile && typeof profile.uid === 'string' && typeof profile.email === 'string')
    .map(profile => ({
      uid: profile.uid.trim(),
      email: profile.email.trim(),
      expectedRole: typeof profile.role === 'string' ? profile.role.trim() : null,
    }))
}

async function writeOutputIfRequested(payload) {
  if (!outputPath) return

  const resolved = path.resolve(repoRoot, outputPath)
  const relative = path.relative(repoRoot, resolved)

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('--output doit rester dans le repo.')
  }

  if (!relative.startsWith(`tmp${path.sep}`)) {
    throw new Error('--output doit pointer sous tmp/ pour eviter de committer des preuves sandbox par accident.')
  }

  await mkdir(path.dirname(resolved), { recursive: true })
  await writeFile(resolved, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.error(`Preuve de comptage ecrite dans ${relative}`)
}

if (dryRun) {
  const payload = {
    mode: sandbox ? 'sandbox' : 'local-emulator',
    userProfilesPath: userProfilesPath ?? null,
    outputPath: outputPath ?? null,
    mutatesData: false,
    note: 'Dry-run uniquement: aucune lecture Data Connect executee.',
  }
  await writeOutputIfRequested(payload)
  console.log(JSON.stringify(payload, null, 2))
  process.exit(0)
}

if (sandbox) {
  if (!yesSandbox || process.env.ALLOW_SANDBOX_DATACONNECT_READ !== 'true') {
    console.error(
      'Lecture sandbox bloquee.\n' +
        'Cette commande lit une base distante reelle. Relancer seulement apres validation humaine avec:\n' +
        'ALLOW_SANDBOX_DATACONNECT_READ=true npm run count:dataconnect -- --sandbox --yes-sandbox'
    )
    process.exit(1)
  }

  if (!userProfilesPath) {
    console.error(
      'Comptage sandbox bloque: --user-profiles est obligatoire.\n' +
        'Utiliser dataconnect/user_profiles.local.json pour verifier les vrais profils SQL User du checkpoint.'
    )
    process.exit(1)
  }

  if (userProfilesPath?.endsWith('user_profiles.example.json')) {
    console.error(
      'Comptage sandbox bloque: --user-profiles pointe vers le fichier exemple.\n' +
        'Utiliser dataconnect/user_profiles.local.json avec de vrais UID Firebase Auth sandbox pour produire une preuve exploitable.'
    )
    process.exit(1)
  }

  if (!outputPath) {
    console.error(
      'Comptage sandbox bloque: --output sous tmp/ est obligatoire.\n' +
        'Archiver la preuve avec --output=tmp/checkpoint-002/counts-sandbox.json.'
    )
    process.exit(1)
  }
} else {
  process.env.DATA_CONNECT_EMULATOR_HOST ??= `${EMULATOR_HOST}:${EMULATOR_PORT}`
  if (!(await isPortOpen(EMULATOR_HOST, EMULATOR_PORT))) {
    console.error(
      `SQL Connect emulator is not reachable at ${EMULATOR_HOST}:${EMULATOR_PORT}.\n` +
        'Start it first with: npm run emulators:dataconnect'
    )
    process.exit(1)
  }
}

if (getApps().length === 0) {
  initializeApp({ projectId: 'sosson-sandbox' })
}

const dc = getDataConnect(connectorConfig)
const knownProfiles = await loadKnownProfiles()

if (sandbox && knownProfiles.length === 0) {
  console.error(
    'Comptage sandbox bloque: le fichier --user-profiles ne contient aucun profil exploitable.\n' +
      'Ajouter au moins un vrai UID Firebase Auth sandbox attendu dans SQL User.'
  )
  process.exit(1)
}

const [
  clientsResponse,
  chantiersResponse,
  facturesResponse,
  devisResponse,
  foldersResponse,
  documentsResponse,
  exercisesResponse,
] = await Promise.all([
  listOperationalClients(dc),
  listOperationalChantiers(dc),
  listFactures(dc),
  listDevis(dc),
  listDocumentFolders(dc),
  listDocumentsAttaches(dc),
  listPrevisionnelExercises(dc),
])

const exercises = exercisesResponse.data.previsionnelExercises
const lineResponses = await Promise.all(
  exercises.map(exercise => listPrevisionnelLinesByExercise(dc, { exerciseId: exercise.id })),
)
const loadedPrevisionnelLines = lineResponses.flatMap(response => response.data.previsionnelLines)
const userChecks = []

for (const profile of knownProfiles) {
  const response = await getCurrentUser(dc, {
    impersonate: {
      authClaims: {
        sub: profile.uid,
        uid: profile.uid,
        email: profile.email,
        email_verified: true,
      },
    },
  })
  userChecks.push({
    uidFingerprint: fingerprintUid(profile.uid),
    emailDomain: emailDomain(profile.email),
    expectedRole: profile.expectedRole,
    exists: Boolean(response.data.user),
    role: response.data.user?.role ?? null,
    roleMatches: profile.expectedRole ? response.data.user?.role === profile.expectedRole : null,
  })
}

if (sandbox) {
  const invalidProfiles = userChecks.filter(check => !check.exists || check.roleMatches === false)
  if (invalidProfiles.length > 0) {
    console.error('Comptage sandbox bloque: profils SQL User attendus absents ou roles incoherents.')
    for (const check of invalidProfiles) {
      console.error(
        `- uidFingerprint=${check.uidFingerprint} domain=${check.emailDomain ?? 'inconnu'} ` +
          `exists=${check.exists} role=${check.role ?? 'absent'} expectedRole=${check.expectedRole ?? 'non-renseigne'}`
      )
    }
    process.exit(1)
  }
}

const previsionnelExpectedLines = exercises.reduce((sum, exercise) => sum + exercise.lineCount, 0)
const previsionnelExpectedChantiers = exercises.reduce((sum, exercise) => sum + exercise.chantierCount, 0)
const loadedMonthlyAmounts = loadedPrevisionnelLines.reduce((sum, line) => sum + line.monthly.length, 0)
const loadedLotAmounts = loadedPrevisionnelLines.reduce((sum, line) => sum + line.lots.length, 0)

const counts = {
  mode: sandbox ? 'sandbox' : 'local-emulator',
  generatedAt: new Date().toISOString(),
  operationalTables: {
    clients: clientsResponse.data.clients.length,
    chantiers: chantiersResponse.data.chantiers.length,
    factures: facturesResponse.data.factures.length,
    devis: devisResponse.data.deviss.length,
  },
  documents: {
    folders: foldersResponse.data.documentFolders.length,
    attaches: documentsResponse.data.documentAttaches.length,
  },
  previsionnel: {
    exercises: exercises.length,
    expectedLinesFromExerciseMetadata: previsionnelExpectedLines,
    loadedLinesViaQuery: loadedPrevisionnelLines.length,
    expectedChantiersFromExerciseMetadata: previsionnelExpectedChantiers,
    loadedMonthlyAmountsViaNestedQuery: loadedMonthlyAmounts,
    loadedLotAmountsViaNestedQuery: loadedLotAmounts,
    lineQueryMayBeTruncated: loadedPrevisionnelLines.length < previsionnelExpectedLines,
  },
  knownUserProfiles: userChecks,
}

await writeOutputIfRequested(counts)
console.log(JSON.stringify(counts, null, 2))
