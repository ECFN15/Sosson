import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import { getStorage } from 'firebase-admin/storage'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import {
  connectorConfig,
  getLatestGeneratedPrevisionnelWorkbookVersion,
  getPrevisionnelWorkbookVersion,
  listPrevisionnelExercises,
  listPrevisionnelWorkbookVersions,
  listPrevisionnelCellEdits,
  markPrevisionnelWorkbookVersionFailed,
  markPrevisionnelWorkbookVersionGenerated,
  markPrevisionnelWorkbookVersionGenerating,
} from './dataconnect-admin-generated/esm/index.esm.js'
import {
  generatePrevisionnelWorkbookVersion,
  PREVISIONNEL_CURRENT_STORAGE_PATH,
  PREVISIONNEL_MIME_TYPE,
  PREVISIONNEL_SOURCE_STORAGE_PATH,
} from './src/previsionnelWorkbookCore.mjs'

if (getApps().length === 0) {
  initializeApp()
}

function impersonate(auth) {
  return {
    impersonate: {
      authClaims: {
        sub: auth.uid,
        uid: auth.uid,
        email: auth.token.email ?? null,
        email_verified: Boolean(auth.token.email_verified),
        sosson_worker: true,
      },
    },
  }
}

function publicVersion(version) {
  return {
    id: version.id,
    sourceSheet: version.sourceSheet,
    label: version.label ?? null,
    status: version.status,
    storagePath: version.storagePath,
    currentStoragePath: version.currentStoragePath,
    sha256: version.sha256 ?? null,
    sizeBytes: version.sizeBytes ?? null,
    editCount: version.editCount,
    retryCount: version.retryCount,
    generatedAt: version.generatedAt ?? null,
    failedAt: version.failedAt ?? null,
    errorMessage: version.errorMessage ?? null,
  }
}

const SIGNED_DOWNLOAD_TTL_MS = 10 * 60 * 1000
const SAFE_SOURCE_SHEET = '2025-26'

function assertSafePrevisionnelStoragePath(path, kind) {
  if (typeof path !== 'string' || path.length === 0) {
    throw new HttpsError('failed-precondition', 'Chemin Storage introuvable.')
  }
  if (path.includes('..') || path.includes('\\') || path.includes('//') || path.startsWith('/')) {
    throw new HttpsError('permission-denied', 'Chemin Storage invalide.')
  }
  if (!path.startsWith('previsionnel/')) {
    throw new HttpsError('permission-denied', 'Chemin Storage hors perimetre previsionnel.')
  }
  if (kind === 'original' && !path.startsWith('previsionnel/source/')) {
    throw new HttpsError('permission-denied', 'Original previsionnel hors dossier source.')
  }
  if (kind === 'current' && path !== PREVISIONNEL_CURRENT_STORAGE_PATH) {
    throw new HttpsError('permission-denied', 'Chemin courant previsionnel invalide.')
  }
  if (kind === 'version' && !/^previsionnel\/versions\/PREVISIONNEL-\d{4}-\d{2}-\d{2}-\d{4}-pwv-[a-zA-Z0-9-]+\.xlsx$/.test(path)) {
    throw new HttpsError('permission-denied', 'Chemin version previsionnel invalide.')
  }
}

function assertGenerationPaths(version) {
  assertSafePrevisionnelStoragePath(version.storagePath, 'version')
  assertSafePrevisionnelStoragePath(version.currentStoragePath, 'current')
  if (!version.storagePath.includes(`${version.id}.xlsx`)) {
    throw new HttpsError('failed-precondition', 'Chemin version incoherent avec l identifiant SQL.')
  }
  if (version.baseStoragePath) {
    if (version.baseStoragePath === PREVISIONNEL_CURRENT_STORAGE_PATH) assertSafePrevisionnelStoragePath(version.baseStoragePath, 'current')
    else if (version.baseStoragePath.startsWith('previsionnel/versions/')) assertSafePrevisionnelStoragePath(version.baseStoragePath, 'version')
    else assertSafePrevisionnelStoragePath(version.baseStoragePath, 'original')
  }
}

function safeDownloadFileName(path, fallback) {
  const fileName = String(path.split('/').pop() ?? fallback)
    .replace(/["\r\n]/g, '')
    .replace(/[\\/:*?<>|]/g, '-')
    .trim()
  return fileName || fallback
}

async function resolveOriginalPrevisionnelPath(dc, options, sourceSheet) {
  await getLatestGeneratedPrevisionnelWorkbookVersion(dc, { sourceSheet }, options)
  const exercisesResponse = await listPrevisionnelExercises(dc, options)
  const exercise = exercisesResponse.data.previsionnelExercises.find(item => item.sheet === sourceSheet)
  return exercise?.batch?.sourceStoragePath ?? PREVISIONNEL_SOURCE_STORAGE_PATH
}

async function resolveCurrentPrevisionnelVersion(dc, options, sourceSheet) {
  const response = await getLatestGeneratedPrevisionnelWorkbookVersion(dc, { sourceSheet }, options)
  const version = response.data.previsionnelWorkbookVersions[0]
  if (!version) {
    throw new HttpsError('not-found', `Aucune version courante generee pour ${sourceSheet}.`)
  }
  return version
}

async function shouldPromoteWorkbookCurrent(dc, options, version) {
  const response = await listPrevisionnelWorkbookVersions(dc, { sourceSheet: version.sourceSheet }, options)
  const versionCreatedAt = new Date(version.dateCreation ?? 0).getTime()
  const blockingNewerVersion = response.data.previsionnelWorkbookVersions.find(candidate => {
    if (candidate.id === version.id) return false
    if (!['pending', 'generating', 'generated'].includes(candidate.status)) return false
    const candidateCreatedAt = new Date(candidate.dateCreation ?? 0).getTime()
    return Number.isFinite(candidateCreatedAt) && candidateCreatedAt > versionCreatedAt
  })
  return !blockingNewerVersion
}

async function createSignedWorkbookDownload(bucket, path, fileName) {
  const file = bucket.file(path)
  const [exists] = await file.exists()
  if (!exists) {
    throw new HttpsError('not-found', `Fichier Storage introuvable: ${path}`)
  }

  const expiresAt = new Date(Date.now() + SIGNED_DOWNLOAD_TTL_MS)
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: expiresAt,
    responseDisposition: `attachment; filename="${fileName}"`,
    responseType: PREVISIONNEL_MIME_TYPE,
  })

  return { url, expiresAt: expiresAt.toISOString() }
}

function storageAdapter(bucket) {
  return {
    async read(path) {
      const [buffer] = await bucket.file(path).download()
      return buffer
    },
    async write(path, buffer, metadata) {
      await bucket.file(path).save(buffer, {
        resumable: false,
        metadata,
      })
    },
    isNotFound(error) {
      return Number(error?.code) === 404
    },
  }
}

export const generatePrevisionnelWorkbook = onCall(
  {
    region: 'europe-west9',
    timeoutSeconds: 540,
    memory: '1GiB',
  },
  async request => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Connexion Firebase requise.')
    }

    const versionId = String(request.data?.versionId ?? '').trim()
    if (!versionId) {
      throw new HttpsError('invalid-argument', 'versionId est obligatoire.')
    }

    const dc = getDataConnect(connectorConfig)
    const options = impersonate(request.auth)
    const versionResponse = await getPrevisionnelWorkbookVersion(dc, { id: versionId }, options)
    const version = versionResponse.data.previsionnelWorkbookVersion

    if (!version) {
      throw new HttpsError('not-found', `Version previsionnel introuvable: ${versionId}`)
    }

    assertGenerationPaths(version)

    if (version.status === 'generated') {
      return {
        ok: true,
        status: 'generated',
        versionId: version.id,
        storagePath: version.storagePath,
        currentStoragePath: version.currentStoragePath,
        sha256: version.sha256 ?? null,
        sizeBytes: version.sizeBytes ?? null,
        editCount: version.editCount,
        version: publicVersion(version),
        idempotent: true,
      }
    }

    try {
      await markPrevisionnelWorkbookVersionGenerating(
        dc,
        {
          id: version.id,
          retryCount: version.retryCount + 1,
        },
        options,
      )

      const [cellEditsResponse, latestResponse] = await Promise.all([
        listPrevisionnelCellEdits(dc, { sourceSheet: version.sourceSheet }, options),
        getLatestGeneratedPrevisionnelWorkbookVersion(dc, { sourceSheet: version.sourceSheet }, options),
      ])
      const latestGeneratedVersion = latestResponse.data.previsionnelWorkbookVersions[0] ?? null

      const result = await generatePrevisionnelWorkbookVersion({
        version: {
          ...version,
          currentStoragePath: version.currentStoragePath || PREVISIONNEL_CURRENT_STORAGE_PATH,
        },
        latestGeneratedVersion,
        cellEdits: cellEditsResponse.data.previsionnelCellEdits,
        storage: storageAdapter(getStorage().bucket()),
        shouldPromoteCurrent: () => shouldPromoteWorkbookCurrent(dc, options, version),
      })

      await markPrevisionnelWorkbookVersionGenerated(
        dc,
        {
          id: version.id,
          storagePath: result.storagePath,
          currentStoragePath: result.currentStoragePath,
          sha256: result.sha256,
          sizeBytes: result.sizeBytes,
          editCount: result.appliedEditCount,
        },
        options,
      )

      const generatedResponse = await getPrevisionnelWorkbookVersion(dc, { id: version.id }, options)
      const generatedVersion =
        generatedResponse.data.previsionnelWorkbookVersion ??
        ({
          ...version,
          status: 'generated',
          storagePath: result.storagePath,
          currentStoragePath: result.currentStoragePath,
          sha256: result.sha256,
          sizeBytes: result.sizeBytes,
          editCount: result.appliedEditCount,
        })
      return {
        ok: true,
        status: 'generated',
        versionId: version.id,
        storagePath: result.storagePath,
        currentStoragePath: result.currentStoragePath,
        sha256: result.sha256,
        sizeBytes: result.sizeBytes,
        editCount: result.appliedEditCount,
        currentPromoted: result.currentPromoted,
        version: publicVersion(generatedVersion),
        skippedCellRefs: result.skippedCellRefs,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue'
      await markPrevisionnelWorkbookVersionFailed(dc, { id: version.id, errorMessage: message.slice(0, 2000) }, options)
      return {
        ok: false,
        status: 'failed',
        versionId: version.id,
        errorMessage: message,
        version: {
          ...publicVersion(version),
          status: 'failed',
          errorMessage: message,
        },
      }
    }
  },
)

export const createPrevisionnelWorkbookDownloadUrl = onCall(
  {
    region: 'europe-west9',
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async request => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Connexion Firebase requise.')
    }

    const kind = String(request.data?.kind ?? '').trim()
    const sourceSheet = String(request.data?.sourceSheet ?? SAFE_SOURCE_SHEET).trim() || SAFE_SOURCE_SHEET
    const versionId = String(request.data?.versionId ?? '').trim()

    if (!['original', 'current', 'version'].includes(kind)) {
      throw new HttpsError('invalid-argument', 'kind doit valoir original, current ou version.')
    }
    if (sourceSheet !== SAFE_SOURCE_SHEET) {
      throw new HttpsError('invalid-argument', 'Seule la feuille previsionnelle courante est telechargeable pour le moment.')
    }

    const dc = getDataConnect(connectorConfig)
    const options = impersonate(request.auth)
    let path
    let label = null
    let version = null

    if (kind === 'original') {
      path = await resolveOriginalPrevisionnelPath(dc, options, sourceSheet)
      assertSafePrevisionnelStoragePath(path, 'original')
      label = 'Original'
    } else if (kind === 'current') {
      version = await resolveCurrentPrevisionnelVersion(dc, options, sourceSheet)
      path = version.currentStoragePath || PREVISIONNEL_CURRENT_STORAGE_PATH
      assertSafePrevisionnelStoragePath(path, 'current')
      label = version.label ?? 'Courant'
    } else {
      if (!versionId) {
        throw new HttpsError('invalid-argument', 'versionId est obligatoire pour telecharger une version historisee.')
      }
      const response = await getPrevisionnelWorkbookVersion(dc, { id: versionId }, options)
      version = response.data.previsionnelWorkbookVersion
      if (!version) {
        throw new HttpsError('not-found', `Version previsionnel introuvable: ${versionId}`)
      }
      if (version.status !== 'generated') {
        throw new HttpsError('failed-precondition', 'Seules les versions generees peuvent etre telechargees.')
      }
      path = version.storagePath
      assertSafePrevisionnelStoragePath(path, 'version')
      label = version.label ?? 'Version historisee'
    }

    const fileName = safeDownloadFileName(path, `PREVISIONNEL-${kind}.xlsx`)
    const signed = await createSignedWorkbookDownload(getStorage().bucket(), path, fileName)

    return {
      ok: true,
      kind,
      sourceSheet,
      label,
      storagePath: path,
      fileName,
      url: signed.url,
      expiresAt: signed.expiresAt,
      version: version ? publicVersion(version) : null,
    }
  },
)
