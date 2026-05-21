import { readFile } from 'node:fs/promises'
import net from 'node:net'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import { connectorConfig } from '@dataconnect/admin-generated'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399
const validRoles = new Set(['gerant', 'assistante', 'chef_chantier', 'ouvrier'])

const args = new Set(process.argv.slice(2))
const fileArg = process.argv.find(arg => arg.startsWith('--file='))
const filePath = fileArg?.slice('--file='.length) || 'dataconnect/user_profiles.local.json'
const dryRun = args.has('--dry-run')
const sandbox = args.has('--sandbox')
const yesSandbox = args.has('--yes-sandbox')
const defaultLocalProfiles = [
  {
    uid: 'user-1',
    email: 'patrick@sosson.fr',
    nom: 'Sosson',
    prenom: 'Patrick',
    role: 'gerant',
    avatar: 'PS',
  },
  {
    uid: 'user-2',
    email: 'claire@sosson.fr',
    nom: 'Morel',
    prenom: 'Claire',
    role: 'assistante',
    avatar: 'CM',
  },
  {
    uid: 'user-3',
    email: 'romain@sosson.fr',
    nom: 'Faure',
    prenom: 'Romain',
    role: 'chef_chantier',
    avatar: 'RF',
  },
]

function isPlaceholderProfile(profile) {
  return (
    /replace|example|firebase-auth-uid/i.test(profile.uid) ||
    /prenom\.nom|example/i.test(profile.email)
  )
}

function maskUid(uid) {
  if (uid.length <= 8) return `${uid.slice(0, 2)}***`
  return `${uid.slice(0, 4)}...${uid.slice(-4)}`
}

function maskEmail(email) {
  const [localPart, domain] = email.split('@')
  if (!domain) return 'email-masque'
  return `${localPart.slice(0, 2)}***@${domain}`
}

function formatProfileForLog(profile) {
  return `${maskUid(profile.uid)} ${maskEmail(profile.email)} ${profile.role}`
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

function assertProfile(value, index) {
  const prefix = `Profil #${index + 1}`
  if (!value || typeof value !== 'object') throw new Error(`${prefix}: objet attendu.`)
  for (const field of ['uid', 'email', 'nom', 'prenom', 'role']) {
    if (typeof value[field] !== 'string' || !value[field].trim()) {
      throw new Error(`${prefix}: champ ${field} manquant ou invalide.`)
    }
  }
  if (!validRoles.has(value.role)) {
    throw new Error(`${prefix}: role invalide "${value.role}". Roles valides: ${[...validRoles].join(', ')}.`)
  }
  if (value.avatar !== undefined && typeof value.avatar !== 'string') {
    throw new Error(`${prefix}: avatar doit etre une chaine si fourni.`)
  }

  return {
    uid: value.uid.trim(),
    email: value.email.trim(),
    nom: value.nom.trim(),
    prenom: value.prenom.trim(),
    role: value.role,
    avatar: value.avatar?.trim() || null,
  }
}

async function loadProfiles() {
  let content
  try {
    content = await readFile(filePath, 'utf8')
  } catch (error) {
    if (!sandbox && error?.code === 'ENOENT') {
      console.log(`Fichier ${filePath} absent: utilisation des profils dev locaux par defaut.`)
      return defaultLocalProfiles.map(assertProfile)
    }
    throw error
  }
  const parsed = JSON.parse(content)
  if (!Array.isArray(parsed)) throw new Error('Le fichier de profils doit contenir un tableau JSON.')
  return parsed.map(assertProfile)
}

const profiles = await loadProfiles()

console.log(`Profils SQL User charges depuis ${filePath}: ${profiles.length}`)
for (const profile of profiles) {
  console.log(`- ${formatProfileForLog(profile)}`)
}

if (dryRun) {
  console.log('Dry-run uniquement: aucune mutation SQL Connect executee.')
  process.exit(0)
}

if (sandbox) {
  if (!yesSandbox || process.env.ALLOW_SANDBOX_USER_PROVISIONING !== 'true') {
    console.error(
      'Provisioning sandbox bloque.\n' +
        'Cette action modifie une base distante reelle. Relancer seulement apres validation humaine avec:\n' +
        'ALLOW_SANDBOX_USER_PROVISIONING=true npm run provision:sql-users -- --sandbox --yes-sandbox'
    )
    process.exit(1)
  }

  const placeholderProfiles = profiles.filter(isPlaceholderProfile)
  if (placeholderProfiles.length > 0 || filePath.endsWith('user_profiles.example.json')) {
    console.error(
      'Provisioning sandbox bloque: fichier/profil exemple detecte.\n' +
        'Creer dataconnect/user_profiles.local.json avec de vrais UID Firebase Auth sandbox avant toute mutation distante.'
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

for (const profile of profiles) {
  await dc.upsert('User', {
    id: profile.uid,
    email: profile.email,
    nom: profile.nom,
    prenom: profile.prenom,
    role: profile.role,
    avatar: profile.avatar,
  })
  console.log(`Profil SQL User upsert: ${maskUid(profile.uid)}`)
}

console.log('Provisioning SQL User termine.')
