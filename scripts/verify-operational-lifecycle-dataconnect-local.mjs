import { mkdir, writeFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import {
  connectorConfig,
  createChantier,
  createClient,
  createDevis,
  createFacture,
  listDevis,
  listFactures,
  listOperationalChantiers,
  listOperationalClients,
  listUsers,
} from '@dataconnect/admin-generated'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399
const repoRoot = process.cwd()
const outputArg = process.argv.find(arg => arg.startsWith('--output='))
const outputPath =
  outputArg?.slice('--output='.length) || 'tmp/checkpoint-002/operational-lifecycle-local.json'

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
  console.error(`Preuve lifecycle operationnel SQL locale ecrite dans ${relative}`)
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
  id: 'operational-lifecycle-local',
  email: 'operational.lifecycle@sosson.local',
  nom: 'Lifecycle',
  prenom: 'Operationnel',
  role: 'assistante',
  avatar: 'LO',
}
const options = impersonate(actor.id, actor.email)
const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)

await dc.upsert('User', actor)

const usersResponse = await listUsers(dc, options)
const actorReadBack = usersResponse.data.users.find(user => user.id === actor.id)
assert(actorReadBack, 'Profil SQL User local autorise cree mais non relu via ListUsers.')
assert(actorReadBack.role === 'assistante', 'Profil SQL User local relu avec un role inattendu.')

const prospectClientInput = {
  type: 'particulier',
  nom: `Lifecycle prospect sans chantier ${stamp}`,
  prenom: 'Camille',
  email: 'prospect.lifecycle@sosson.local',
  telephone: '06 00 00 00 01',
  adresse: '2 rue de la demande locale',
  ville: 'Le Mans',
  codePostal: '72000',
  typeChantierCible: 'extension bois',
  souhaits: 'Premier contact: extension bois, besoin encore a cadrer.',
  notes: 'Prospect cree sans chantier pour verifier le mode fiche seule.',
}

const prospectClientResponse = await createClient(dc, prospectClientInput, options)
const prospectClientId = prospectClientResponse.data.client_insert.id

const prospectDevisInput = {
  clientId: prospectClientId,
  chantierId: null,
  numeroDevis: `DEV-DEMANDE-${stamp}`,
  titre: `Demande de devis extension bois ${stamp}`,
  statut: 'devis_demande',
  montantHT: null,
  tva: null,
  montantTTC: null,
  dateDemande: '2026-05-18',
  dateEnvoi: null,
  dateSignature: null,
  typeChantierCible: 'extension bois',
  description: 'Devis demande sans chantier confirme.',
}

const prospectDevisResponse = await createDevis(dc, prospectDevisInput, options)
const prospectDevisId = prospectDevisResponse.data.devis_insert.id

const clientInput = {
  type: 'professionnel',
  nom: `Lifecycle client operationnel ${stamp}`,
  prenom: null,
  email: 'client.lifecycle@sosson.local',
  telephone: '02 43 00 00 00',
  adresse: '1 rue de la verification locale',
  ville: 'Le Mans',
  codePostal: '72000',
  typeChantierCible: 'renovation charpente',
  souhaits: 'Projet clair: renovation charpente avec budget cible et delai connu.',
  notes: 'Client cree avec chantier, devis signe et factures fournisseur definitives.',
}

const clientResponse = await createClient(dc, clientInput, options)
const clientId = clientResponse.data.client_insert.id

const chantierInput = {
  clientId,
  chefChantierId: null,
  nom: `Lifecycle chantier operationnel ${stamp}`,
  statut: 'en_cours',
  dateDebut: '2026-05-18',
  dateFinPrevue: '2026-06-30',
  budgetPrevisionnel: 12500,
  description: 'Chantier cree en emulateur pour verifier le cycle client -> devis -> chantier -> facture.',
  adresse: '1 rue de la verification locale, 72000 Le Mans',
}

const chantierResponse = await createChantier(dc, chantierInput, options)
const chantierId = chantierResponse.data.chantier_insert.id

const signedDevisInput = {
  clientId,
  chantierId,
  numeroDevis: `DEV-SIGNE-${stamp}`,
  titre: `Devis signe renovation charpente ${stamp}`,
  statut: 'devis_signe',
  montantHT: 10416.67,
  tva: 20,
  montantTTC: 12500,
  dateDemande: '2026-05-18',
  dateEnvoi: '2026-05-19',
  dateSignature: '2026-05-20',
  typeChantierCible: 'renovation charpente',
  description: 'Devis signe rattache au client et au chantier confirme.',
}

const signedDevisResponse = await createDevis(dc, signedDevisInput, options)
const signedDevisId = signedDevisResponse.data.devis_insert.id

const factureInputs = [
  {
    chantierId,
    fournisseur: `Fournisseur bois lifecycle ${stamp}`,
    numeroFacture: `LIFE-BOIS-${stamp}`,
    montantHT: 1000,
    tva: 20,
    montantTTC: 1200,
    date: '2026-05-21',
    categorie: 'bois_materiaux',
    statut: 'validee',
    description: 'Facture fournisseur definitive: bois et materiaux.',
  },
  {
    chantierId,
    fournisseur: `Fournisseur electricite lifecycle ${stamp}`,
    numeroFacture: `LIFE-ELEC-${stamp}`,
    montantHT: 450,
    tva: 10,
    montantTTC: 495,
    date: '2026-05-22',
    categorie: 'electricite',
    statut: 'validee',
    description: 'Facture fournisseur definitive: poste electricite.',
  },
  {
    chantierId,
    fournisseur: `Sous-traitant lifecycle ${stamp}`,
    numeroFacture: `LIFE-ST-${stamp}`,
    montantHT: 800,
    tva: 20,
    montantTTC: 960,
    date: '2026-05-23',
    categorie: 'sous_traitance',
    statut: 'validee',
    description: 'Facture fournisseur definitive: sous-traitance.',
  },
]

const factureIds = []
for (const factureInput of factureInputs) {
  const factureResponse = await createFacture(dc, factureInput, options)
  factureIds.push(factureResponse.data.facture_insert.id)
}

const [clientsResponse, chantiersResponse, devisResponse, facturesResponse, originResponse] = await Promise.all([
  listOperationalClients(dc, options),
  listOperationalChantiers(dc, options),
  listDevis(dc, options),
  listFactures(dc, options),
  dc.executeGraphqlRead(
    `query VerifyOperationalLifecycleOrigins($prospectClientId: UUID!, $clientId: UUID!, $chantierId: UUID!) {
      prospectClient: client(id: $prospectClientId) {
        id
        nom
        origineImport
      }
      createdClient: client(id: $clientId) {
        id
        nom
        origineImport
      }
      createdChantier: chantier(id: $chantierId) {
        id
        nom
        origineImport
        client {
          id
          nom
          origineImport
        }
      }
      previsionnelClients: clients(where: { origineImport: { eq: "previsionnel" } }, limit: 1200) {
        id
        nom
        origineImport
      }
      previsionnelChantiers: chantiers(where: { origineImport: { eq: "previsionnel" } }, limit: 1500) {
        id
        nom
        origineImport
      }
    }`,
    { variables: { prospectClientId, clientId, chantierId } },
  ),
])

const prospectClient = clientsResponse.data.clients.find(client => client.id === prospectClientId)
const operationalClient = clientsResponse.data.clients.find(client => client.id === clientId)
const operationalChantier = chantiersResponse.data.chantiers.find(chantier => chantier.id === chantierId)
const prospectClientChantiers = chantiersResponse.data.chantiers.filter(chantier => chantier.client?.id === prospectClientId)
const lifecycleDevis = devisResponse.data.deviss.filter(devis => [prospectDevisId, signedDevisId].includes(devis.id))
const prospectDevis = lifecycleDevis.find(devis => devis.id === prospectDevisId)
const signedDevis = lifecycleDevis.find(devis => devis.id === signedDevisId)
const lifecycleFactures = facturesResponse.data.factures.filter(facture => factureIds.includes(facture.id))
const createdProspectOrigin = originResponse.data.prospectClient
const createdClientOrigin = originResponse.data.createdClient
const createdChantierOrigin = originResponse.data.createdChantier
const previsionnelClientIds = new Set(originResponse.data.previsionnelClients.map(client => client.id))
const previsionnelChantierIds = new Set(originResponse.data.previsionnelChantiers.map(chantier => chantier.id))
const operationalClientIds = clientsResponse.data.clients.map(client => client.id)
const operationalChantierIds = chantiersResponse.data.chantiers.map(chantier => chantier.id)
const leakedPrevisionnelClientIds = operationalClientIds.filter(id => previsionnelClientIds.has(id))
const leakedPrevisionnelChantierIds = operationalChantierIds.filter(id => previsionnelChantierIds.has(id))
const prefixedOperationalClientIds = operationalClientIds.filter(id => id.startsWith('prev-client-'))
const prefixedOperationalChantierIds = operationalChantierIds.filter(id => id.startsWith('prev-chantier-'))
const facturesLinkedToChantier = lifecycleFactures.filter(facture => facture.chantier?.id === chantierId)

const totalImportedFacturesTtc = lifecycleFactures.reduce((sum, facture) => sum + facture.montantTTC, 0)
const facturesByCategorie = lifecycleFactures.reduce((acc, facture) => {
  acc[facture.categorie] = (acc[facture.categorie] ?? 0) + facture.montantTTC
  return acc
}, {})

const checks = {
  emulatorReachable: true,
  authorizedSqlUserProvisioned: Boolean(actorReadBack) && actorReadBack.role === 'assistante',
  prospectClientCreatedAndReadBack: Boolean(prospectClient),
  prospectClientWithoutChantier: prospectClientChantiers.length === 0,
  prospectDevisCreatedWithoutChantier: Boolean(prospectDevis) && !prospectDevis?.chantier,
  clientCreatedAndReadBack: Boolean(operationalClient),
  chantierCreatedAndReadBack: Boolean(operationalChantier),
  chantierLinkedToClient: operationalChantier?.client?.id === clientId && createdChantierOrigin?.client?.id === clientId,
  devisCreatedAndReadBack: lifecycleDevis.length === 2,
  signedDevisLinkedToClient: signedDevis?.client?.id === clientId,
  signedDevisLinkedToChantier: signedDevis?.chantier?.id === chantierId,
  signedDevisHasExpectedStatus: signedDevis?.statut === 'devis_signe',
  facturesCreatedAndReadBack: lifecycleFactures.length === factureInputs.length,
  facturesLinkedToChantier: facturesLinkedToChantier.length === factureInputs.length,
  facturesAreDefinitiveImported: lifecycleFactures.every(facture => facture.statut === 'validee'),
  dashboardAllImportedFacturesImpact: totalImportedFacturesTtc === factureInputs.reduce((sum, facture) => sum + facture.montantTTC, 0),
  createdProspectIsOperational: createdProspectOrigin?.origineImport === 'operationnel',
  createdClientIsOperational: createdClientOrigin?.origineImport === 'operationnel',
  createdChantierIsOperational: createdChantierOrigin?.origineImport === 'operationnel',
  noPrevisionnelClientInOperationalList: leakedPrevisionnelClientIds.length === 0,
  noPrevisionnelChantierInOperationalList: leakedPrevisionnelChantierIds.length === 0,
  noPrevPrefixedClientInOperationalList: prefixedOperationalClientIds.length === 0,
  noPrevPrefixedChantierInOperationalList: prefixedOperationalChantierIds.length === 0,
}

const failures = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name)

const proof = {
  mode: 'local-emulator',
  sandboxTouched: false,
  productionTouched: false,
  mutatesData: true,
  cleanupStrategy: 'Donnees isolees par noms/numeros horodates; aucune suppression distante ou reelle.',
  generatedAt: new Date().toISOString(),
  scenario: {
    title: 'Client/prospect -> devis -> chantier -> factures fournisseur categorisees',
    noteMetier:
      'Scenario local aligne sur docs/17: fiche prospect sans chantier, devis demande, creation client + chantier quand le projet est clair, devis signe, factures fournisseur definitives et categorisees.',
    workflow:
      'Client / Prospect -> demande -> devis demande/envoye/signe -> chantier confirme -> factures fournisseur definitives et categorisees -> chiffres SQL locaux.',
  },
  actor: {
    uid: actor.id,
    emailDomain: actor.email.split('@').pop(),
    role: actor.role,
    provisionedAndReadable: Boolean(actorReadBack),
  },
  created: {
    prospectClient: {
      id: prospectClientId,
      nom: prospectClientInput.nom,
      prenom: prospectClientInput.prenom,
      typeChantierCible: prospectClientInput.typeChantierCible,
      origineImport: createdProspectOrigin?.origineImport ?? null,
      foundInOperationalList: Boolean(prospectClient),
      chantierCount: prospectClientChantiers.length,
    },
    client: {
      id: clientId,
      nom: clientInput.nom,
      typeChantierCible: clientInput.typeChantierCible,
      origineImport: createdClientOrigin?.origineImport ?? null,
      foundInOperationalList: Boolean(operationalClient),
    },
    chantier: {
      id: chantierId,
      nom: chantierInput.nom,
      statut: chantierInput.statut,
      budgetPrevisionnel: chantierInput.budgetPrevisionnel,
      origineImport: createdChantierOrigin?.origineImport ?? null,
      clientId: operationalChantier?.client?.id ?? null,
      foundInOperationalList: Boolean(operationalChantier),
    },
    devis: lifecycleDevis.map(devis => ({
      id: devis.id,
      numeroDevis: devis.numeroDevis,
      statut: devis.statut,
      montantTTC: devis.montantTTC ?? null,
      clientId: devis.client?.id ?? null,
      chantierId: devis.chantier?.id ?? null,
    })),
    factures: lifecycleFactures.map(facture => ({
      id: facture.id,
      fournisseur: facture.fournisseur,
      numeroFacture: facture.numeroFacture,
      statut: facture.statut,
      categorie: facture.categorie,
      montantTTC: facture.montantTTC,
      chantierId: facture.chantier?.id ?? null,
      clientId: facture.chantier?.client?.id ?? null,
    })),
  },
  readBack: {
    operationalClientsVisible: clientsResponse.data.clients.length,
    operationalChantiersVisible: chantiersResponse.data.chantiers.length,
    devisVisible: devisResponse.data.deviss.length,
    facturesVisible: facturesResponse.data.factures.length,
    previsionnelClientsSampled: originResponse.data.previsionnelClients.length,
    previsionnelChantiersSampled: originResponse.data.previsionnelChantiers.length,
  },
  dashboardInputsFromSql: {
    facturesImpactRule: 'all_imported_supplier_invoices',
    totalImportedFacturesTTC: totalImportedFacturesTtc,
    facturesByCategorie,
    chantierBudgetPrevisionnel: chantierInput.budgetPrevisionnel,
    margeBudgetMoinsFactures: chantierInput.budgetPrevisionnel - totalImportedFacturesTtc,
    currentAdapterBehavior:
      'Les adapters front calculent les depenses chantier depuis toutes les factures SQL visibles; le statut de classement ne doit pas exclure une facture fournisseur importee des chiffres.',
  },
  guardrails: {
    leakedPrevisionnelClientIds,
    leakedPrevisionnelChantierIds,
    prefixedOperationalClientIds,
    prefixedOperationalChantierIds,
  },
  checks,
}

await writeOutput(proof)
console.log(JSON.stringify(proof, null, 2))

if (failures.length > 0) {
  console.error(`Lifecycle operationnel SQL local KO:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
