import { createHash, randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import {
  connectorConfig,
  createChantier,
  createClient,
  createDocumentAttache,
  createDocumentFolder,
  createFacture,
  listDocumentFolders,
  listDocumentsAttaches,
} from '@dataconnect/admin-generated'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399
const repoRoot = process.cwd()
const outputArg = process.argv.find(arg => arg.startsWith('--output='))
const outputPath = outputArg?.slice('--output='.length) || 'tmp/checkpoint-002/documents-local.json'

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
  console.error(`Preuve documents SQL locale ecrite dans ${relative}`)
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
  id: 'documents-local',
  email: 'documents@sosson.local',
  nom: 'Documents',
  prenom: 'Local',
  role: 'assistante',
  avatar: 'DL',
}
const options = impersonate(actor.id, actor.email)
const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
const content = `preuve-document-local:${stamp}`
const contentHash = sha256(content)
const storagePath = `pending-documents/inbox/${randomUUID()}-preuve-document-local.pdf`
const invoiceContent = `preuve-facture-document-local:${stamp}`
const invoiceContentHash = sha256(invoiceContent)

await dc.upsert('User', actor)

const clientResponse = await createClient(
  dc,
  {
    type: 'professionnel',
    nom: `Client document local ${stamp}`,
    email: 'client-document@sosson.local',
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
    nom: `Chantier document local ${stamp}`,
    statut: 'en_cours',
    dateDebut: '2026-05-17',
    dateFinPrevue: '2026-06-17',
    budgetPrevisionnel: 12000,
    description: 'Prerequis local pour verifier DocumentAttache liee a Facture.',
    adresse: 'Local',
  },
  options,
)
const chantierId = chantierResponse.data.chantier_insert.id

const factureResponse = await createFacture(
  dc,
  {
    chantierId,
    fournisseur: `Fournisseur document local ${stamp}`,
    numeroFacture: `DOC-${stamp}`,
    montantHT: 1000,
    tva: 20,
    montantTTC: 1200,
    date: '2026-05-17',
    categorie: 'bois_materiaux',
    statut: 'en_attente',
    description: 'Facture locale pour verifier le lien DocumentAttache.facture.',
  },
  options,
)
const factureId = factureResponse.data.facture_insert.id

const folderResponse = await createDocumentFolder(
  dc,
  {
    nom: `Dossier local ${stamp}`,
    slug: `dossier-local-${stamp}`,
    parentId: null,
    clientId: null,
    chantierId: null,
    description: 'Dossier local de verification Documents/Storage.',
  },
  options,
)
const folderId = folderResponse.data.documentFolder_insert.id

const documentResponse = await createDocumentAttache(
  dc,
  {
    folderId,
    clientId: null,
    chantierId: null,
    factureId: null,
    nomFichier: `preuve-document-local-${stamp}.pdf`,
    storagePath,
    mimeType: 'application/pdf',
    tailleBytes: Buffer.byteLength(content, 'utf8'),
    sha256: contentHash,
    typeDocument: 'import',
    statut: 'a_classer',
    source: 'upload',
    description: 'Metadata document locale avec hash SHA-256 reel du contenu de preuve.',
    dateDocument: '2026-05-17',
  },
  options,
)
const documentId = documentResponse.data.documentAttache_insert.id

const invoiceStoragePath = `pending-documents/chantiers/${chantierId}/${randomUUID()}-facture-document-local.pdf`
const invoiceDocumentResponse = await createDocumentAttache(
  dc,
  {
    folderId: null,
    clientId,
    chantierId,
    factureId,
    nomFichier: `facture-document-local-${stamp}.pdf`,
    storagePath: invoiceStoragePath,
    mimeType: 'application/pdf',
    tailleBytes: Buffer.byteLength(invoiceContent, 'utf8'),
    sha256: invoiceContentHash,
    typeDocument: 'facture',
    statut: 'lie',
    source: 'upload',
    description: 'Metadata document facture locale avec hash SHA-256 reel du contenu de preuve.',
    dateDocument: '2026-05-17',
  },
  options,
)
const invoiceDocumentId = invoiceDocumentResponse.data.documentAttache_insert.id

const [documentsRead, foldersRead] = await Promise.all([
  listDocumentsAttaches(dc, options),
  listDocumentFolders(dc, options),
])

const readBack = documentsRead.data.documentAttaches.find(document => document.id === documentId)
const invoiceReadBack = documentsRead.data.documentAttaches.find(document => document.id === invoiceDocumentId)
const folderBack = foldersRead.data.documentFolders.find(folder => folder.id === folderId)

assert(folderBack, 'DocumentFolder cree introuvable via ListDocumentFolders.')
assert(readBack, 'DocumentAttache cree introuvable via ListDocumentsAttaches.')
assert(invoiceReadBack, 'DocumentAttache facture cree introuvable via ListDocumentsAttaches.')
assert(readBack.folder?.id === folderId, 'Lien DocumentAttache -> DocumentFolder non relu.')
assert(readBack.storagePath === storagePath, 'storagePath document non relu.')
assert(readBack.sha256 === contentHash, 'sha256 document non relu.')
assert(readBack.tailleBytes === Buffer.byteLength(content, 'utf8'), 'tailleBytes document non relue.')
assert(readBack.statut === 'a_classer', 'statut document non relu.')
assert(invoiceReadBack.facture?.id === factureId, 'Lien DocumentAttache -> Facture non relu.')
assert(invoiceReadBack.chantier?.id === chantierId || invoiceReadBack.facture?.chantier?.id === chantierId, 'Lien DocumentAttache -> Chantier non relu.')
assert(invoiceReadBack.storagePath === invoiceStoragePath, 'storagePath document facture non relu.')
assert(invoiceReadBack.sha256 === invoiceContentHash, 'sha256 document facture non relu.')
assert(invoiceReadBack.typeDocument === 'facture', 'typeDocument facture non relu.')
assert(invoiceReadBack.statut === 'lie', 'statut document facture non relu.')

const proof = {
  mode: 'local-emulator',
  mutatesData: true,
  generatedAt: new Date().toISOString(),
  clientId,
  chantierId,
  factureId,
  folderId,
  documentId,
  invoiceDocumentId,
  readBack: {
    found: true,
    folderLinked: readBack.folder?.id === folderId,
    storagePath: readBack.storagePath,
    sha256: readBack.sha256,
    tailleBytes: readBack.tailleBytes,
    statut: readBack.statut,
    typeDocument: readBack.typeDocument,
    source: readBack.source,
  },
  invoiceReadBack: {
    found: true,
    factureLinked: invoiceReadBack.facture?.id === factureId,
    chantierLinked: invoiceReadBack.chantier?.id === chantierId || invoiceReadBack.facture?.chantier?.id === chantierId,
    storagePath: invoiceReadBack.storagePath,
    sha256: invoiceReadBack.sha256,
    tailleBytes: invoiceReadBack.tailleBytes,
    statut: invoiceReadBack.statut,
    typeDocument: invoiceReadBack.typeDocument,
    source: invoiceReadBack.source,
  },
}

await writeOutput(proof)
console.log(JSON.stringify(proof, null, 2))
