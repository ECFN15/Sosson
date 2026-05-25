import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getApps, initializeApp } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'

const repoRoot = process.cwd()
const destination = 'previsionnel/source/PREVISIONNEL-original.xlsx'
const requiredProject = 'sosson-sandbox'

function argValue(name) {
  const prefix = `--${name}=`
  return process.argv.find(arg => arg.startsWith(prefix))?.slice(prefix.length) ?? null
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`)
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

function parseDotEnv(file) {
  return Object.fromEntries(
    file
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && line.includes('='))
      .map(line => {
        const [key, ...parts] = line.split('=')
        return [key, parts.join('=').replace(/^["']|["']$/g, '')]
      }),
  )
}

if (!hasFlag('sandbox') || !hasFlag('yes-sandbox')) {
  throw new Error('Upload refuse: utiliser --sandbox --yes-sandbox.')
}

if (process.env.ALLOW_SANDBOX_STORAGE_WRITE !== 'true') {
  throw new Error('Upload refuse: definir ALLOW_SANDBOX_STORAGE_WRITE=true.')
}

const projectId = argValue('project') ?? requiredProject
if (projectId !== requiredProject) {
  throw new Error(`Upload refuse: projet attendu ${requiredProject}, recu ${projectId}.`)
}

const sourceArg = argValue('source')
if (!sourceArg) {
  throw new Error('Upload refuse: fournir --source=C:\\chemin\\PREVISIONNEL.xlsx.')
}

const sourcePath = path.resolve(repoRoot, sourceArg)
const env = parseDotEnv(await readFile(path.resolve(repoRoot, '.env.sandbox'), 'utf8'))
const bucketName = argValue('bucket') ?? env.VITE_FIREBASE_STORAGE_BUCKET
if (!bucketName) {
  throw new Error('Bucket Storage introuvable: fournir --bucket=... ou VITE_FIREBASE_STORAGE_BUCKET dans .env.sandbox.')
}

const source = await readFile(sourcePath)
const sourceHash = sha256(source)

if (getApps().length === 0) {
  initializeApp({ projectId, storageBucket: bucketName })
}

const bucket = getStorage().bucket(bucketName)
const file = bucket.file(destination)
const [exists] = await file.exists()

if (exists) {
  const [current] = await file.download()
  const currentHash = sha256(current)
  if (currentHash === sourceHash) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          alreadyUploaded: true,
          projectId,
          bucket: bucketName,
          storagePath: destination,
          sha256: sourceHash,
          message: 'Le fichier source existe deja avec le meme hash; aucun ecrasement effectue.',
        },
        null,
        2,
      ),
    )
    process.exit(0)
  }

  throw new Error(
    `Upload refuse: ${destination} existe deja avec un hash different (${currentHash}). Le source original ne doit pas etre ecrase.`,
  )
}

await file.save(source, {
  resumable: false,
  metadata: {
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    metadata: {
      sha256: sourceHash,
      originalFileName: 'PREVISIONNEL-original.xlsx',
      immutableSource: 'true',
    },
  },
})

console.log(
  JSON.stringify(
    {
      ok: true,
      uploaded: true,
      projectId,
      bucket: bucketName,
      storagePath: destination,
      sha256: sourceHash,
      sizeBytes: source.length,
    },
    null,
    2,
  ),
)
