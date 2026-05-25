import { createHash } from 'node:crypto'
import ExcelJS from 'exceljs'

export const PREVISIONNEL_SOURCE_STORAGE_PATH = 'previsionnel/source/PREVISIONNEL-original.xlsx'
export const PREVISIONNEL_CURRENT_STORAGE_PATH = 'previsionnel/current/PREVISIONNEL-current.xlsx'
export const PREVISIONNEL_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

const MAX_CURRENT_SHEET_ROW = 174
const MAX_CURRENT_SHEET_COL = columnToNumber('BP')

export function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

export function versionStoragePath(versionId, createdAt = new Date()) {
  const stamp = formatStorageTimestamp(createdAt)
  return `previsionnel/versions/PREVISIONNEL-${stamp}-${versionId}.xlsx`
}

function formatStorageTimestamp(date) {
  const pad = value => String(value).padStart(2, '0')
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
  ].join('-') + `-${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}`
}

function columnToNumber(column) {
  return [...column].reduce((total, char) => total * 26 + char.charCodeAt(0) - 64, 0)
}

function parseCellRef(ref) {
  const match = /^([A-Z]+)(\d+)$/.exec(ref)
  if (!match) return null
  return { column: match[1], row: Number(match[2]), columnNumber: columnToNumber(match[1]) }
}

function isAllowedCurrentSheetCell(ref) {
  const parsed = parseCellRef(ref)
  return Boolean(parsed && parsed.row >= 1 && parsed.row <= MAX_CURRENT_SHEET_ROW && parsed.columnNumber <= MAX_CURRENT_SHEET_COL)
}

function cellEditValue(edit) {
  if (edit.numericValue !== null && edit.numericValue !== undefined) return Number(edit.numericValue)
  if (edit.valueText !== null && edit.valueText !== undefined) return String(edit.valueText)
  return null
}

function materializeSharedFormulas(worksheet) {
  worksheet.eachRow(row => {
    row.eachCell({ includeEmpty: false }, cell => {
      if (!cell.value || typeof cell.value !== 'object') return
      if (!('sharedFormula' in cell.value) && cell.value.shareType !== 'shared') return

      const formula = cell.formula
      if (!formula) return

      cell.value = {
        formula,
        result: cell.result ?? null,
      }
    })
  })
}

async function readFirstAvailable(storage, paths) {
  const attempted = []
  for (const path of paths.filter(Boolean)) {
    if (attempted.includes(path)) continue
    attempted.push(path)
    try {
      return { path, buffer: await storage.read(path) }
    } catch (error) {
      if (storage.isNotFound?.(error)) continue
      throw error
    }
  }

  throw new Error(`Aucun classeur source disponible dans Storage: ${attempted.join(', ')}`)
}

export async function generatePrevisionnelWorkbookVersion({
  version,
  latestGeneratedVersion,
  cellEdits,
  storage,
  shouldPromoteCurrent = () => true,
  logger = console,
}) {
  const sourceCandidates = [
    version.baseStoragePath,
    latestGeneratedVersion?.storagePath,
    latestGeneratedVersion?.currentStoragePath,
    version.batch?.sourceStoragePath,
    PREVISIONNEL_SOURCE_STORAGE_PATH,
  ]
  const source = await readFirstAvailable(storage, sourceCandidates)
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(source.buffer)

  const worksheet = workbook.getWorksheet(version.sourceSheet)
  if (!worksheet) {
    throw new Error(`Onglet ${version.sourceSheet} introuvable dans le classeur source ${source.path}`)
  }

  materializeSharedFormulas(worksheet)

  const skippedCellRefs = []
  let appliedEditCount = 0

  for (const edit of cellEdits) {
    if (edit.sourceSheet !== version.sourceSheet) continue
    if (!isAllowedCurrentSheetCell(edit.cellRef)) {
      skippedCellRefs.push(edit.cellRef)
      continue
    }
    worksheet.getCell(edit.cellRef).value = cellEditValue(edit)
    appliedEditCount += 1
  }

  workbook.calcProperties = {
    ...(workbook.calcProperties ?? {}),
    fullCalcOnLoad: true,
    forceFullCalc: true,
  }

  const output = Buffer.from(await workbook.xlsx.writeBuffer())
  const outputHash = sha256(output)
  const metadata = {
    contentType: PREVISIONNEL_MIME_TYPE,
    metadata: {
      sha256: outputHash,
      previsionnelVersionId: version.id,
      previsionnelSourceSheet: version.sourceSheet,
      generatedFrom: source.path,
    },
  }

  await storage.write(version.storagePath, output, metadata)
  const currentPromoted = await shouldPromoteCurrent({
    version,
    storagePath: version.storagePath,
    currentStoragePath: version.currentStoragePath,
    sha256: outputHash,
  })
  if (currentPromoted) {
    await storage.write(version.currentStoragePath, output, metadata)
  }

  if (skippedCellRefs.length > 0) {
    logger.warn?.(
      `Cellules previsionnel ignorees hors zone export ${version.sourceSheet}: ${skippedCellRefs.slice(0, 20).join(', ')}`,
    )
  }

  return {
    storagePath: version.storagePath,
    currentStoragePath: version.currentStoragePath,
    sourceStoragePath: source.path,
    sha256: outputHash,
    sizeBytes: output.length,
    appliedEditCount,
    currentPromoted,
    skippedCellRefs,
  }
}
