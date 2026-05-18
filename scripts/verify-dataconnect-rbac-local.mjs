import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import net from 'node:net'
import {
  connectorConfig,
  createClient,
  createDocumentFolder,
} from '@dataconnect/admin-generated'

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

async function expectSuccess(label, action) {
  const response = await action()
  return {
    label,
    allowed: true,
    id: response?.data ? Object.values(response.data)[0]?.id ?? null : null,
  }
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
const profiles = [
  {
    uid: 'rbac-gerant-local',
    email: 'rbac.gerant@sosson.local',
    nom: 'RBAC',
    prenom: 'Gerant',
    role: 'gerant',
    avatar: 'RG',
  },
  {
    uid: 'rbac-assistante-local',
    email: 'rbac.assistante@sosson.local',
    nom: 'RBAC',
    prenom: 'Assistante',
    role: 'assistante',
    avatar: 'RA',
  },
  {
    uid: 'rbac-chef-local',
    email: 'rbac.chef@sosson.local',
    nom: 'RBAC',
    prenom: 'Chef',
    role: 'chef_chantier',
    avatar: 'RC',
  },
]

for (const profile of profiles) {
  await dc.upsert('User', {
    id: profile.uid,
    email: profile.email,
    nom: profile.nom,
    prenom: profile.prenom,
    role: profile.role,
    avatar: profile.avatar,
  })
}

const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)

const results = []
results.push(
  await expectSuccess('assistante peut creer un client', () =>
    createClient(
      dc,
      {
        type: 'particulier',
        nom: `RBAC Assistante ${stamp}`,
        email: null,
        telephone: null,
        adresse: null,
        ville: null,
        codePostal: null,
      },
      impersonate('rbac-assistante-local', 'rbac.assistante@sosson.local'),
    ),
  ),
)

results.push(
  await expectFailure('chef_chantier ne peut pas creer un client', () =>
    createClient(
      dc,
      {
        type: 'particulier',
        nom: `RBAC Chef ${stamp}`,
        email: null,
        telephone: null,
        adresse: null,
        ville: null,
        codePostal: null,
      },
      impersonate('rbac-chef-local', 'rbac.chef@sosson.local'),
    ),
  ),
)

results.push(
  await expectSuccess('chef_chantier peut creer un dossier document', () =>
    createDocumentFolder(
      dc,
      {
        nom: `RBAC Chef ${stamp}`,
        slug: `rbac-chef-${stamp}`,
        parentId: null,
        clientId: null,
        chantierId: null,
        description: 'Verification locale RBAC Data Connect.',
      },
      impersonate('rbac-chef-local', 'rbac.chef@sosson.local'),
    ),
  ),
)

console.log(JSON.stringify({ results }, null, 2))
