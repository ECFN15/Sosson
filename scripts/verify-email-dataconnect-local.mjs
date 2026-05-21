import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import {
  connectorConfig,
  createEmailAttachment,
  createEmailMessage,
  createEmailThread,
  getEmailThread,
  listEmailThreads,
  listEmailThreadsByChantier,
  listOperationalChantiers,
  listUnreadEmailThreads,
  updateEmailThreadStatusAndLinks,
} from '@dataconnect/admin-generated'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399
const repoRoot = process.cwd()
const outputArg = process.argv.find(arg => arg.startsWith('--output='))
const outputPath = outputArg?.slice('--output='.length) || 'tmp/checkpoint-002/email-local.json'

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

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
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
  console.error(`Preuve email SQL locale ecrite dans ${relative}`)
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
  id: 'email-local',
  email: 'email@sosson.local',
  nom: 'Email',
  prenom: 'Local',
  role: 'assistante',
  avatar: 'EL',
}
const options = impersonate(actor.id, actor.email)
const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
const receivedAt = '2026-03-10T09:15:00.000Z'
const bodyHash = sha256(`email-local-body-${stamp}`)
const attachmentHash = sha256(`email-local-attachment-${stamp}`)

await dc.upsert('User', actor)

const chantiersResponse = await listOperationalChantiers(dc, options)
const linkedChantier = chantiersResponse.data.chantiers[0] ?? null

const threadResponse = await createEmailThread(
  dc,
  {
    provider: 'outlook-local',
    externalThreadId: `local-thread-${stamp}`,
    subject: `Demande chantier local ${stamp}`,
    statut: 'a_traiter',
    importance: 'haute',
    clientId: linkedChantier?.client.id ?? null,
    chantierId: linkedChantier?.id ?? null,
    assignedToId: actor.id,
    lastMessageAt: receivedAt,
    participantsSummary: 'client@sosson.local -> email@sosson.local',
    messageCount: 1,
    hasAttachments: true,
  },
  options,
)
const threadId = threadResponse.data.emailThread_insert.id

const messageResponse = await createEmailMessage(
  dc,
  {
    threadId,
    externalMessageId: `local-message-${stamp}`,
    direction: 'inbound',
    fromEmail: 'client@sosson.local',
    fromName: 'Client Local',
    toSummary: actor.email,
    ccSummary: null,
    subject: `Demande chantier local ${stamp}`,
    bodyPreview: 'Bonjour, voici la piece jointe utile au dossier.',
    bodyStoragePath: `pending-email/body-${stamp}.txt`,
    bodyHash,
    sentAt: receivedAt,
    receivedAt,
    isRead: false,
    hasAttachments: true,
  },
  options,
)
const messageId = messageResponse.data.emailMessage_insert.id

const attachmentResponse = await createEmailAttachment(
  dc,
  {
    messageId,
    documentId: null,
    externalAttachmentId: `local-attachment-${stamp}`,
    nomFichier: `piece-jointe-${stamp}.pdf`,
    storagePath: `pending-email/attachments/piece-jointe-${stamp}.pdf`,
    mimeType: 'application/pdf',
    tailleBytes: 12345,
    sha256: attachmentHash,
    statut: 'a_classer',
  },
  options,
)
const attachmentId = attachmentResponse.data.emailAttachment_insert.id

await updateEmailThreadStatusAndLinks(
  dc,
  {
    id: threadId,
    statut: 'traite',
    clientId: linkedChantier?.client.id ?? null,
    chantierId: linkedChantier?.id ?? null,
    assignedToId: actor.id,
  },
  options,
)

const [threadRead, threadsRead, unreadRead, chantierThreadsRead] = await Promise.all([
  getEmailThread(dc, { id: threadId }, options),
  listEmailThreads(dc, options),
  listUnreadEmailThreads(dc, options),
  linkedChantier ? listEmailThreadsByChantier(dc, { chantierId: linkedChantier.id }, options) : Promise.resolve(null),
])

const thread = threadRead.data.emailThread
const message = thread?.messages.find(item => item.id === messageId)
const attachment = message?.attachments.find(item => item.id === attachmentId)

assert(thread?.id === threadId, 'EmailThread cree puis modifie introuvable via GetEmailThread.')
assert(thread.statut === 'traite', 'Statut du fil email non modifie en SQL.')
assert(thread.assignedTo?.id === actor.id, 'assignedTo du fil email non relu.')
assert(message?.externalMessageId === `local-message-${stamp}`, 'EmailMessage cree non relu sous le fil.')
assert(message.bodyHash === bodyHash, 'Hash du corps email non relu.')
assert(attachment?.sha256 === attachmentHash, 'EmailAttachment creee non relue sous le message.')
assert(threadsRead.data.emailThreads.some(item => item.id === threadId), 'EmailThread absent de ListEmailThreads.')
assert(!unreadRead.data.emailThreads.some(item => item.id === threadId), 'EmailThread traite encore present dans ListUnreadEmailThreads.')
if (linkedChantier) {
  assert(
    chantierThreadsRead?.data.emailThreads.some(item => item.id === threadId),
    'EmailThread rattache absent de ListEmailThreadsByChantier.',
  )
}

const proof = {
  mode: 'local-emulator',
  mutatesData: true,
  generatedAt: new Date().toISOString(),
  threadId,
  messageId,
  attachmentId,
  readBack: {
    found: true,
    statut: thread.statut,
    assignedTo: thread.assignedTo ? {
      id: thread.assignedTo.id,
      nom: thread.assignedTo.nom,
      prenom: thread.assignedTo.prenom,
      avatar: thread.assignedTo.avatar,
    } : null,
    messages: thread.messages.length,
    attachmentsOnMessage: message?.attachments.length ?? 0,
    listedInAllThreads: true,
    listedInUnreadThreads: false,
    linkedChantier: linkedChantier
      ? {
          id: linkedChantier.id,
          nom: linkedChantier.nom,
          clientId: linkedChantier.client.id,
        }
      : null,
    listedByChantier: linkedChantier ? true : 'skipped-no-seed-chantier',
  },
}

await writeOutput(proof)
console.log(JSON.stringify(proof, null, 2))
