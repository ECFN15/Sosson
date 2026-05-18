import { mkdir, writeFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import {
  connectorConfig,
  createFacture,
  listFactures,
  listFacturesByStatut,
  listOperationalChantiers,
  setFactureStatut,
} from '@dataconnect/admin-generated'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399
const repoRoot = process.cwd()
const outputArg = process.argv.find(arg => arg.startsWith('--output='))
const outputPath = outputArg?.slice('--output='.length) || 'tmp/checkpoint-002/factures-local.json'

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
  console.error(`Preuve factures SQL locale ecrite dans ${relative}`)
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
  id: 'factures-local',
  email: 'factures@sosson.local',
  nom: 'Factures',
  prenom: 'Local',
  role: 'assistante',
  avatar: 'FL',
}
const options = impersonate(actor.id, actor.email)
const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)

await dc.upsert('User', actor)

const chantiersResponse = await listOperationalChantiers(dc, options)
const chantier = chantiersResponse.data.chantiers[0]
assert(chantier, 'Aucun chantier operationnel seed disponible pour creer une facture locale.')

const factureInput = {
  chantierId: chantier.id,
  fournisseur: `Fournisseur facture locale ${stamp}`,
  numeroFacture: `VERIF-${stamp}`,
  montantHT: 321.5,
  tva: 20,
  montantTTC: 385.8,
  date: '2026-05-17',
  categorie: 'bois_materiaux',
  statut: 'en_attente',
  description: 'Facture creee en emulateur pour verifier CreateFacture et SetFactureStatut.',
}

const createResponse = await createFacture(dc, factureInput, options)
const factureId = createResponse.data.facture_insert.id

const pendingResponse = await listFacturesByStatut(dc, { statut: 'en_attente' }, options)
const pendingReadBack = pendingResponse.data.factures.find(facture => facture.id === factureId)
assert(pendingReadBack, 'Facture creee introuvable via ListFacturesByStatut(en_attente).')

await setFactureStatut(dc, { id: factureId, statut: 'validee' }, options)

const [allResponse, validatedResponse] = await Promise.all([
  listFactures(dc, options),
  listFacturesByStatut(dc, { statut: 'validee' }, options),
])

const fullReadBack = allResponse.data.factures.find(facture => facture.id === factureId)
const validatedReadBack = validatedResponse.data.factures.find(facture => facture.id === factureId)

assert(fullReadBack, 'Facture creee introuvable via ListFactures.')
assert(validatedReadBack, 'Facture validee introuvable via ListFacturesByStatut(validee).')
assert(fullReadBack.statut === 'validee', 'Statut facture non mis a jour via SetFactureStatut.')
assert(fullReadBack.chantier?.id === chantier.id, 'Lien Facture -> Chantier non relu.')
assert(fullReadBack.montantTTC === factureInput.montantTTC, 'Montant TTC facture non relu.')

const proof = {
  mode: 'local-emulator',
  mutatesData: true,
  createsVerificationFacture: true,
  countSafeBecauseRunsAfterCleanCount: true,
  generatedAt: new Date().toISOString(),
  actorUid: actor.id,
  chantierId: chantier.id,
  factureId,
  create: {
    numeroFacture: factureInput.numeroFacture,
    initialStatut: factureInput.statut,
    listedAsPending: Boolean(pendingReadBack),
  },
  update: {
    finalStatut: fullReadBack.statut,
    listedAsValidated: Boolean(validatedReadBack),
  },
  readBack: {
    found: true,
    fournisseur: fullReadBack.fournisseur,
    numeroFacture: fullReadBack.numeroFacture,
    montantTTC: fullReadBack.montantTTC,
    date: fullReadBack.date,
    categorie: fullReadBack.categorie,
    chantierLinked: fullReadBack.chantier?.id === chantier.id,
  },
}

await writeOutput(proof)
console.log(JSON.stringify(proof, null, 2))
