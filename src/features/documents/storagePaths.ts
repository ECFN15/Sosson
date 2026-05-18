export const MAX_DOCUMENT_BYTES = 30 * 1024 * 1024

export const documentDropzoneAccept = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/heic': ['.heic'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
} as const

const allowedMimeTypes = new Set(Object.keys(documentDropzoneAccept))
const allowedExtensions = new Set<string>(Object.values(documentDropzoneAccept).flat())

const pendingStoragePathPattern =
  /^pending-documents\/(?:inbox|chantiers\/[a-zA-Z0-9_-]+)\/[0-9a-fA-F-]{36}-[a-z0-9][a-z0-9.-]{0,159}$/

function slugifyFileName(fileName: string) {
  const extension = fileName.includes('.') ? fileName.split('.').pop() : ''
  const baseName = fileName.replace(/\.[^.]+$/, '')
  const slug = baseName
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

  return `${slug || 'document'}${extension ? `.${extension.toLowerCase()}` : ''}`
}

export function validateDocumentUploadFile(file: File): string | null {
  if (file.size > MAX_DOCUMENT_BYTES) return 'Fichier trop volumineux: limite 30 Mo.'
  if (file.type && !allowedMimeTypes.has(file.type)) return 'Type de fichier non autorise.'
  if (!file.type) {
    const extension = file.name.includes('.') ? `.${file.name.split('.').pop()?.toLowerCase()}` : ''
    if (!allowedExtensions.has(extension)) return 'Type de fichier non autorise.'
  }
  return null
}

export async function hashDocumentFile(file: File) {
  const buffer = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function buildPendingDocumentStoragePath(file: File, chantierId?: string) {
  const scope = chantierId ? `chantiers/${chantierId}` : 'inbox'
  const safeName = slugifyFileName(file.name)
  const uniqueId = crypto.randomUUID()
  return `pending-documents/${scope}/${uniqueId}-${safeName}`
}

export function validatePendingDocumentStoragePath(storagePath: string): string | null {
  if (!pendingStoragePathPattern.test(storagePath)) {
    return 'Chemin Storage document non canonique.'
  }

  if (storagePath.includes('..') || storagePath.includes('//')) {
    return 'Chemin Storage document invalide.'
  }

  return null
}
