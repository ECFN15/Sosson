import { mkdir, writeFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import {
  connectorConfig,
  convertTeamProfileSubmission,
  getCurrentTeamProfileSubmission,
  getCurrentUser,
  listTeamProfileSubmissions,
  listUsers,
  submitCurrentTeamProfile,
} from '@dataconnect/admin-generated'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399
const repoRoot = process.cwd()
const outputArg = process.argv.find(arg => arg.startsWith('--output='))
const outputPath = outputArg?.slice('--output='.length) || 'tmp/checkpoint-002/team-users-local.json'

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

async function expectFailure(label, action) {
  try {
    await action()
  } catch (error) {
    return {
      label,
      allowed: false,
      message: error instanceof Error ? error.message.split('\n')[0] : String(error),
    }
  }

  throw new Error(`${label}: mutation autorisee alors qu'elle devait etre refusee.`)
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
  console.error(`Preuve profils SQL User et onboarding locale ecrite dans ${relative}`)
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
const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
const reader = {
  id: 'team-user-local',
  email: 'team.user@sosson.local',
  nom: 'AEquipeUtilisateur',
  prenom: 'Equipe',
  role: 'assistante',
  avatar: 'EU',
}
const manager = {
  id: 'team-manager-local',
  email: 'team.manager@sosson.local',
  nom: 'AEquipeManager',
  prenom: 'Equipe',
  role: 'gerant',
  avatar: 'ME',
}
const nonManager = {
  id: 'team-non-manager-local',
  email: 'team.non.manager@sosson.local',
  nom: 'AEquipeNonmanager',
  prenom: 'Equipe',
  role: 'assistante',
  avatar: 'NE',
}
const applicant = {
  id: `team-submission-local-${stamp}`,
  email: `team.submission.${stamp}@sosson.local`,
  nom: `AEquipeDemande ${stamp}`,
  prenom: 'Profil',
  requestedTeamType: 'chantier_bureau',
  sourceConnexion: 'email',
}
const converted = {
  role: 'chef_chantier',
  avatar: 'PD',
  equipeFinaleId: `team-chantier-bureau-${stamp}`,
  poste: 'Conducteur travaux',
  telephone: '06 00 00 00 02',
  convertedMemberId: `member-${stamp}`,
  reviewNote: 'Conversion locale de verification Data Connect.',
}
const readerOptions = impersonate(reader.id, reader.email)
const managerOptions = impersonate(manager.id, manager.email)
const nonManagerOptions = impersonate(nonManager.id, nonManager.email)
const applicantOptions = impersonate(applicant.id, applicant.email)

await dc.upsert('User', reader)
await dc.upsert('User', manager)
await dc.upsert('User', nonManager)

await submitCurrentTeamProfile(
  dc,
  {
    email: applicant.email,
    nom: applicant.nom,
    prenom: applicant.prenom,
    requestedTeamType: applicant.requestedTeamType,
    sourceConnexion: applicant.sourceConnexion,
  },
  applicantOptions,
)

const pendingSubmissionResponse = await getCurrentTeamProfileSubmission(dc, applicantOptions)
const pendingSubmission = pendingSubmissionResponse.data.teamProfileSubmission
const applicantUserBeforeConversionResponse = await getCurrentUser(dc, applicantOptions)

assert(pendingSubmission, 'Demande TeamProfileSubmission creee mais non relue par le demandeur.')
assert(pendingSubmission.id === applicant.id, 'Demande TeamProfileSubmission relue avec un id inattendu.')
assert(pendingSubmission.status === 'pending', 'Demande TeamProfileSubmission non relue au statut pending.')
assert(
  applicantUserBeforeConversionResponse.data.user === null,
  'Le demandeur a obtenu un User SQL avant conversion gerant.',
)

const submissionsBeforeConversionResponse = await listTeamProfileSubmissions(dc, managerOptions)
const listedPendingSubmission = submissionsBeforeConversionResponse.data.teamProfileSubmissions.find(
  submission => submission.id === applicant.id,
)

assert(listedPendingSubmission, 'Demande TeamProfileSubmission non visible dans ListTeamProfileSubmissions.')
assert(listedPendingSubmission.status === 'pending', 'Demande listee avec un statut inattendu avant conversion.')

const nonManagerConversionAttempt = await expectFailure('assistante ne peut pas convertir une demande profil', () =>
  convertTeamProfileSubmission(
    dc,
    {
      id: applicant.id,
      email: applicant.email,
      nom: applicant.nom,
      prenom: applicant.prenom,
      role: converted.role,
      avatar: converted.avatar,
      equipeTypeSouhaite: applicant.requestedTeamType,
      equipeFinaleId: converted.equipeFinaleId,
      poste: converted.poste,
      telephone: converted.telephone,
      sourceConnexion: applicant.sourceConnexion,
      convertedMemberId: converted.convertedMemberId,
      reviewNote: converted.reviewNote,
    },
    nonManagerOptions,
  ),
)

await convertTeamProfileSubmission(
  dc,
  {
    id: applicant.id,
    email: applicant.email,
    nom: applicant.nom,
    prenom: applicant.prenom,
    role: converted.role,
    avatar: converted.avatar,
    equipeTypeSouhaite: applicant.requestedTeamType,
    equipeFinaleId: converted.equipeFinaleId,
    poste: converted.poste,
    telephone: converted.telephone,
    sourceConnexion: applicant.sourceConnexion,
    convertedMemberId: converted.convertedMemberId,
    reviewNote: converted.reviewNote,
  },
  managerOptions,
)

const repeatedManagerConversionAttempt = await expectFailure('gerant ne peut pas reconvertir une demande deja traitee', () =>
  convertTeamProfileSubmission(
    dc,
    {
      id: applicant.id,
      email: applicant.email,
      nom: applicant.nom,
      prenom: applicant.prenom,
      role: converted.role,
      avatar: converted.avatar,
      equipeTypeSouhaite: applicant.requestedTeamType,
      equipeFinaleId: converted.equipeFinaleId,
      poste: converted.poste,
      telephone: converted.telephone,
      sourceConnexion: applicant.sourceConnexion,
      convertedMemberId: converted.convertedMemberId,
      reviewNote: 'Tentative de reconversion refusee.',
    },
    managerOptions,
  ),
)

const [usersResponse, applicantUserResponse, convertedSubmissionResponse, submissionsAfterConversionResponse] =
  await Promise.all([
    listUsers(dc, readerOptions),
    getCurrentUser(dc, applicantOptions),
    getCurrentTeamProfileSubmission(dc, applicantOptions),
    listTeamProfileSubmissions(dc, managerOptions),
  ])

const readBack = usersResponse.data.users.find(user => user.id === reader.id)
const managerReadBack = usersResponse.data.users.find(user => user.id === manager.id)
const convertedUser = applicantUserResponse.data.user
const convertedSubmission = convertedSubmissionResponse.data.teamProfileSubmission
const listedConvertedSubmission = submissionsAfterConversionResponse.data.teamProfileSubmissions.find(
  submission => submission.id === applicant.id,
)

if (!readBack) {
  throw new Error('Profil SQL User cree mais non relu via ListUsers.')
}

const checks = {
  emulatorReachable: true,
  readerUserCreatedAndListed: Boolean(readBack) && readBack.role === reader.role,
  managerUserCreatedAndListed: Boolean(managerReadBack) && managerReadBack.role === 'gerant',
  submissionCreatedByCurrentAuthUid: pendingSubmission.id === applicant.id,
  applicantHasNoUserBeforeConversion: applicantUserBeforeConversionResponse.data.user === null,
  submissionListedBeforeConversion: Boolean(listedPendingSubmission) && listedPendingSubmission.status === 'pending',
  nonManagerConversionRejected: nonManagerConversionAttempt.allowed === false,
  applicantUserCreatedAfterManagerConversion: Boolean(convertedUser),
  convertedUserHasExpectedRole: convertedUser?.role === converted.role,
  convertedUserKeepsRequestedTeamType: convertedUser?.equipeTypeSouhaite === applicant.requestedTeamType,
  convertedUserKeepsFinalTeam: convertedUser?.equipeFinaleId === converted.equipeFinaleId,
  convertedUserKeepsSourceConnexion: convertedUser?.sourceConnexion === applicant.sourceConnexion,
  submissionStatusConverted: convertedSubmission?.status === 'converted',
  submissionReviewLinkedToManager: convertedSubmission?.reviewedBy?.id === manager.id,
  submissionListedAfterConversion:
    Boolean(listedConvertedSubmission) && listedConvertedSubmission.status === 'converted',
  duplicateConversionRejected: repeatedManagerConversionAttempt.allowed === false,
}

const failures = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name)

const proof = {
  mode: 'local-emulator',
  sandboxTouched: false,
  productionTouched: false,
  mutatesData: true,
  cleanupStrategy: 'Donnees isolees par uid horodate pour le demandeur; aucune suppression distante ou reelle.',
  generatedAt: new Date().toISOString(),
  listedUsers: usersResponse.data.users.length,
  profileFound: true,
  profile: {
    id: readBack.id,
    emailDomain: readBack.email.split('@').pop() ?? null,
    nom: readBack.nom,
    prenom: readBack.prenom,
    role: readBack.role,
    avatar: readBack.avatar,
  },
  onboardingFlow: {
    workflow: 'SubmitCurrentTeamProfile -> profile-pending -> ConvertTeamProfileSubmission -> User SQL',
    applicant: {
      uid: applicant.id,
      emailDomain: applicant.email.split('@').pop() ?? null,
      requestedTeamType: applicant.requestedTeamType,
      sourceConnexion: applicant.sourceConnexion,
    },
    beforeConversion: {
      submissionStatus: pendingSubmission.status,
      listedByManager: Boolean(listedPendingSubmission),
      currentUserExistsForApplicant: Boolean(applicantUserBeforeConversionResponse.data.user),
    },
    rbac: {
      managerUid: manager.id,
      managerRole: manager.role,
      nonManagerUid: nonManager.id,
      nonManagerRole: nonManager.role,
      nonManagerConversionAttempt,
      repeatedManagerConversionAttempt,
    },
    afterConversion: {
      user: convertedUser
        ? {
            id: convertedUser.id,
            emailDomain: convertedUser.email.split('@').pop() ?? null,
            role: convertedUser.role,
            profilStatut: convertedUser.profilStatut ?? null,
            equipeTypeSouhaite: convertedUser.equipeTypeSouhaite ?? null,
            equipeFinaleId: convertedUser.equipeFinaleId ?? null,
            poste: convertedUser.poste ?? null,
            sourceConnexion: convertedUser.sourceConnexion ?? null,
          }
        : null,
      submission: convertedSubmission
        ? {
            id: convertedSubmission.id,
            status: convertedSubmission.status,
            convertedTeamId: convertedSubmission.convertedTeamId ?? null,
            convertedMemberId: convertedSubmission.convertedMemberId ?? null,
            reviewedById: convertedSubmission.reviewedBy?.id ?? null,
            reviewedAt: convertedSubmission.reviewedAt ?? null,
          }
        : null,
      listedByManager: Boolean(listedConvertedSubmission),
    },
  },
  checks,
}

await writeOutput(proof)
console.log(JSON.stringify(proof, null, 2))

if (failures.length > 0) {
  console.error(`Preuve profils/onboarding SQL locale KO:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
