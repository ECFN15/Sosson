import { mkdir, writeFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import { connectorConfig, listUsers } from '@dataconnect/admin-generated'

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
  console.error(`Preuve profils SQL User locale ecrite dans ${relative}`)
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
  id: 'team-user-local',
  email: 'team.user@sosson.local',
  nom: 'Utilisateur',
  prenom: 'Equipe',
  role: 'assistante',
  avatar: 'EU',
}
const options = impersonate(actor.id, actor.email)

await dc.upsert('User', actor)

const usersResponse = await listUsers(dc, options)
const readBack = usersResponse.data.users.find(user => user.id === actor.id)

if (!readBack) {
  throw new Error('Profil SQL User cree mais non relu via ListUsers.')
}

const proof = {
  mode: 'local-emulator',
  mutatesData: true,
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
}

await writeOutput(proof)
console.log(JSON.stringify(proof, null, 2))
