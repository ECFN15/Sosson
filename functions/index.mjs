import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import { getStorage } from 'firebase-admin/storage'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import {
  connectorConfig,
  getLatestGeneratedPrevisionnelWorkbookVersion,
  getPrevisionnelWorkbookVersion,
  listPrevisionnelCellEdits,
  markPrevisionnelWorkbookVersionFailed,
  markPrevisionnelWorkbookVersionGenerated,
  markPrevisionnelWorkbookVersionGenerating,
} from './dataconnect-admin-generated/esm/index.esm.js'
import {
  generatePrevisionnelWorkbookVersion,
  PREVISIONNEL_CURRENT_STORAGE_PATH,
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
      },
    },
  }
}

function publicVersion(version) {
  return {
    id: version.id,
    sourceSheet: version.sourceSheet,
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
