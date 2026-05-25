import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions'
import { firebaseApp } from '@/lib/firebase'

export const PREVISIONNEL_CURRENT_STORAGE_PATH = 'previsionnel/current/PREVISIONNEL-current.xlsx'
export const PREVISIONNEL_SOURCE_STORAGE_PATH = 'previsionnel/source/PREVISIONNEL-original.xlsx'

export type PrevisionnelWorkbookGenerationStatus = 'pending' | 'generating' | 'generated' | 'failed'

export type PrevisionnelWorkbookGenerationResult = {
  ok: boolean
  status: PrevisionnelWorkbookGenerationStatus
  versionId: string
  storagePath?: string
  currentStoragePath?: string
  sha256?: string
  sizeBytes?: number
  editCount?: number
  currentPromoted?: boolean
  errorMessage?: string
}

export type PrevisionnelWorkbookDownloadKind = 'original' | 'current' | 'version'

export type PrevisionnelWorkbookDownloadResult = {
  ok: boolean
  kind: PrevisionnelWorkbookDownloadKind
  sourceSheet: string
  label?: string | null
  storagePath: string
  fileName: string
  url: string
  expiresAt: string
}

let functionsEmulatorConnected = false

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function storageTimestamp(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}-${pad(date.getUTCHours())}${pad(
    date.getUTCMinutes(),
  )}`
}

function versionIdTimestamp(date: Date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}${pad(date.getUTCHours())}${pad(
    date.getUTCMinutes(),
  )}${pad(date.getUTCSeconds())}`
}

function randomSuffix() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID().slice(0, 8)
  return Math.random().toString(36).slice(2, 10)
}

function getPrevisionnelFunctions() {
  const functions = getFunctions(firebaseApp, 'europe-west9')

  if (import.meta.env.VITE_FUNCTIONS_USE_EMULATOR === 'true' && !functionsEmulatorConnected) {
    const host = import.meta.env.VITE_FUNCTIONS_EMULATOR_HOST ?? '127.0.0.1'
    const port = Number(import.meta.env.VITE_FUNCTIONS_EMULATOR_PORT ?? 5001)
    connectFunctionsEmulator(functions, host, port)
    functionsEmulatorConnected = true
  }

  return functions
}

export function createPrevisionnelWorkbookVersionId(date = new Date()) {
  return `pwv-${versionIdTimestamp(date)}-${randomSuffix()}`
}

export function buildPrevisionnelWorkbookVersionPaths(versionId: string, date = new Date()) {
  return {
    storagePath: `previsionnel/versions/PREVISIONNEL-${storageTimestamp(date)}-${versionId}.xlsx`,
    currentStoragePath: PREVISIONNEL_CURRENT_STORAGE_PATH,
  }
}

export async function triggerPrevisionnelWorkbookGeneration(versionId: string) {
  const callable = httpsCallable<{ versionId: string }, PrevisionnelWorkbookGenerationResult>(
    getPrevisionnelFunctions(),
    'generatePrevisionnelWorkbook',
  )
  const response = await callable({ versionId })
  return response.data
}

export async function getPrevisionnelWorkbookDownloadUrl(input: {
  kind: PrevisionnelWorkbookDownloadKind
  sourceSheet: string
  versionId?: string
}) {
  const callable = httpsCallable<
    { kind: PrevisionnelWorkbookDownloadKind; sourceSheet: string; versionId?: string },
    PrevisionnelWorkbookDownloadResult
  >(getPrevisionnelFunctions(), 'createPrevisionnelWorkbookDownloadUrl')
  const response = await callable(input)
  return response.data
}

export function previsionnelStorageConsoleUrl(storagePath: string) {
  const bucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
  const project = import.meta.env.VITE_FIREBASE_PROJECT_ID
  if (!bucket || !project) return null
  const encodedPath = storagePath
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/')
  return `https://console.cloud.google.com/storage/browser/_details/${bucket}/${encodedPath}?project=${project}`
}
