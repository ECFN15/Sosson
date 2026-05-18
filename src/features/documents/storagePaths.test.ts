import { describe, expect, it } from 'vitest'
import {
  buildPendingDocumentStoragePath,
  hashDocumentFile,
  validateDocumentUploadFile,
  validatePendingDocumentStoragePath,
} from '@/features/documents/storagePaths'

describe('document storage paths', () => {
  it('builds canonical pending inbox paths with normalized filenames', () => {
    const file = new File(['test'], 'Facture Été 2026.PDF', { type: 'application/pdf' })
    const storagePath = buildPendingDocumentStoragePath(file)

    expect(storagePath).toMatch(
      /^pending-documents\/inbox\/[0-9a-f-]{36}-facture-ete-2026\.pdf$/,
    )
    expect(validatePendingDocumentStoragePath(storagePath)).toBeNull()
  })

  it('builds canonical pending chantier paths', () => {
    const file = new File(['test'], 'Plan toiture.png', { type: 'image/png' })
    const storagePath = buildPendingDocumentStoragePath(file, 'chantier_123')

    expect(storagePath).toMatch(
      /^pending-documents\/chantiers\/chantier_123\/[0-9a-f-]{36}-plan-toiture\.png$/,
    )
    expect(validatePendingDocumentStoragePath(storagePath)).toBeNull()
  })

  it('rejects arbitrary or unsafe storage paths', () => {
    expect(validatePendingDocumentStoragePath('https://example.com/file.pdf')).not.toBeNull()
    expect(validatePendingDocumentStoragePath('documents/private/file.pdf')).not.toBeNull()
    expect(validatePendingDocumentStoragePath('pending-documents/inbox/../../secret.pdf')).not.toBeNull()
    expect(validatePendingDocumentStoragePath('pending-documents//inbox/id-file.pdf')).not.toBeNull()
  })

  it('validates upload size and MIME type', () => {
    expect(validateDocumentUploadFile({ size: 30 * 1024 * 1024 + 1, type: 'application/pdf' } as File)).toMatch(
      /trop volumineux/,
    )
    expect(validateDocumentUploadFile({ size: 1, type: 'application/x-msdownload' } as File)).toMatch(
      /non autorise/,
    )
    expect(validateDocumentUploadFile({ name: 'setup.exe', size: 1, type: '' } as File)).toMatch(
      /non autorise/,
    )
    expect(validateDocumentUploadFile({ name: 'facture.pdf', size: 1, type: '' } as File)).toBeNull()
    expect(validateDocumentUploadFile({ size: 1, type: 'application/pdf' } as File)).toBeNull()
  })

  it('hashes uploaded file bytes with SHA-256', async () => {
    const file = new File(['sosson-document'], 'preuve.pdf', { type: 'application/pdf' })

    await expect(hashDocumentFile(file)).resolves.toBe(
      '22fc8f096c657f0b4167955334cd0e8476bf3e12a91659d64fa68ccb20805c1c',
    )
  })
})
