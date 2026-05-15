import type { WorkbookCellUpdates } from '@/lib/previsionnelExport'

export const PREVISIONNEL_BASELINE_CHECKPOINT = {
  id: 'baseline-2025-26-previsionnel-xlsx',
  label: 'Reference absolue PREVISIONNEL.xlsx 2025-26',
  sheet: '2025-26',
  sourcePath: 'C:\\Users\\pcpor\\OneDrive\\Bureau\\prévisionnelsosson\\PREVISIONNEL.xlsx',
  templatePath: 'public/excel/previsionnel-template.xlsx',
  stableBackupPath: 'C:\\Users\\pcpor\\OneDrive\\Bureau\\prévisionnelsosson\\backups\\PREVISIONNEL-2025-26-checkpoint.xlsx',
  datedBackupPath: 'C:\\Users\\pcpor\\OneDrive\\Bureau\\prévisionnelsosson\\backups\\PREVISIONNEL-2025-26-checkpoint-20260515.xlsx',
  sha256: '95d30a33b56f2d5051592ad258a5cd5e7a18b5ee124bd60fc0c5c95dbf9452f7',
  createdAt: '2026-05-15T14:32:00.000Z',
  immutable: true,
} as const

export interface PrevisionnelUserCheckpoint {
  id: string
  label: string
  sheet: string
  createdAt: string
  baseCheckpointId: typeof PREVISIONNEL_BASELINE_CHECKPOINT.id
  baseSha256: typeof PREVISIONNEL_BASELINE_CHECKPOINT.sha256
  values: WorkbookCellUpdates
  valueCount: number
  checksum: string
}

export function userCheckpointStorageKey(sheet: string) {
  return `sosson:previsionnel:${sheet}:user-checkpoints`
}

export function readUserCheckpoints(sheet: string): PrevisionnelUserCheckpoint[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(userCheckpointStorageKey(sheet)) ?? '[]') as PrevisionnelUserCheckpoint[]
    return Array.isArray(parsed) ? parsed.filter(item => item.baseSha256 === PREVISIONNEL_BASELINE_CHECKPOINT.sha256) : []
  } catch {
    return []
  }
}

export function writeUserCheckpoints(sheet: string, checkpoints: PrevisionnelUserCheckpoint[]) {
  localStorage.setItem(userCheckpointStorageKey(sheet), JSON.stringify(checkpoints))
}

export function stableCheckpointPayload(values: WorkbookCellUpdates) {
  return Object.keys(values)
    .sort()
    .map(key => [key, values[key]])
}

export async function checkpointChecksum(values: WorkbookCellUpdates) {
  const encoded = new TextEncoder().encode(JSON.stringify(stableCheckpointPayload(values)))
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}
