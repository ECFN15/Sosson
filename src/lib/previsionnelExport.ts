import JSZip from 'jszip'
import type { PrevisionnelLine } from '@/data/previsionnel'

const TEMPLATE_URL = '/excel/previsionnel-template.xlsx'
const WORKBOOK_PATH = 'xl/workbook.xml'
const WORKBOOK_RELS_PATH = 'xl/_rels/workbook.xml.rels'
const CONTENT_TYPES_PATH = '[Content_Types].xml'

const REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
const PKG_REL_NS = 'http://schemas.openxmlformats.org/package/2006/relationships'
const SHEET_NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'

const currentYearColumns = {
  caTce: 'A',
  name: 'B',
  caPrevision: 'D',
  caContrat: 'E',
  monthly: [
    ['AR', 'AS'],
    ['AT', 'AU'],
    ['AV', 'AW'],
    ['AX', 'AY'],
    ['AZ', 'BA'],
    ['BB', 'BC'],
    ['BD', 'BE'],
    ['BF', 'BG'],
    ['BH', 'BI'],
    ['BJ', 'BK'],
    ['BL', 'BM'],
    ['BN', 'BO'],
  ],
} as const

function parseXml(text: string) {
  return new DOMParser().parseFromString(text, 'application/xml')
}

function serializeXml(doc: Document) {
  return new XMLSerializer().serializeToString(doc)
}

function normalizeZipPath(target: string) {
  const clean = target.replace(/^\/+/, '')
  return clean.startsWith('xl/') ? clean : `xl/${clean}`
}

function getTextFile(zip: JSZip, path: string) {
  const file = zip.file(path)
  if (!file) throw new Error(`Fichier absent du modèle Excel: ${path}`)
  return file.async('text')
}

function numberValue(value: number) {
  return Number.isFinite(value) ? String(Number(value.toFixed(2))) : '0'
}

export type WorkbookCellUpdates = Record<string, string | number | null>

function removeCellText(cell: Element) {
  Array.from(cell.getElementsByTagNameNS(SHEET_NS, 'is')).forEach(node => node.remove())
}

function setCellValue(sheetDoc: Document, ref: string, value: string | number | null) {
  const cells = Array.from(sheetDoc.getElementsByTagNameNS(SHEET_NS, 'c'))
  const cell = cells.find(item => item.getAttribute('r') === ref)
  if (!cell) return

  Array.from(cell.getElementsByTagNameNS(SHEET_NS, 'f')).forEach(formula => formula.remove())
  removeCellText(cell)

  if (typeof value === 'string' && Number.isNaN(Number(value.replace(',', '.')))) {
    cell.setAttribute('t', 'inlineStr')
    Array.from(cell.getElementsByTagNameNS(SHEET_NS, 'v')).forEach(node => node.remove())
    const inlineString = sheetDoc.createElementNS(SHEET_NS, 'is')
    const textNode = sheetDoc.createElementNS(SHEET_NS, 't')
    textNode.textContent = value
    inlineString.appendChild(textNode)
    cell.appendChild(inlineString)
    return
  }

  let v = Array.from(cell.getElementsByTagNameNS(SHEET_NS, 'v'))[0]
  if (!v) {
    v = sheetDoc.createElementNS(SHEET_NS, 'v')
    cell.appendChild(v)
  }
  cell.removeAttribute('t')
  const numeric = typeof value === 'string' ? Number(value.replace(',', '.')) : value ?? 0
  v.textContent = numberValue(numeric)
}

function freezeFormulasAsDisplayedValues(sheetDoc: Document) {
  Array.from(sheetDoc.getElementsByTagNameNS(SHEET_NS, 'c')).forEach(cell => {
    Array.from(cell.getElementsByTagNameNS(SHEET_NS, 'f')).forEach(formula => formula.remove())
  })
}

function updateCurrentYearSheet(sheetDoc: Document, lines: PrevisionnelLine[]) {
  lines.forEach(line => {
    const row = line.sourceRow
    setCellValue(sheetDoc, `${currentYearColumns.caTce}${row}`, line.caTce)
    setCellValue(sheetDoc, `${currentYearColumns.caPrevision}${row}`, line.caPrevision)
    setCellValue(sheetDoc, `${currentYearColumns.caContrat}${row}`, line.caContrat)

    line.monthly.forEach(month => {
      const pair = currentYearColumns.monthly[month.order - 1]
      if (!pair) return
      setCellValue(sheetDoc, `${pair[0]}${row}`, month.planned)
      setCellValue(sheetDoc, `${pair[1]}${row}`, month.realized)
    })
  })
}

function updateCurrentYearSheetFromCells(sheetDoc: Document, updates: WorkbookCellUpdates) {
  Object.entries(updates).forEach(([ref, value]) => {
    setCellValue(sheetDoc, ref, value)
  })
}

function removeUnusedSheets(zip: JSZip, workbookDoc: Document, relsDoc: Document, contentTypesDoc: Document, keepRid: string) {
  const relationships = Array.from(relsDoc.getElementsByTagNameNS(PKG_REL_NS, 'Relationship'))
  const sheetRelationships = relationships.filter(rel => rel.getAttribute('Type')?.endsWith('/worksheet'))
  const keepRel = sheetRelationships.find(rel => rel.getAttribute('Id') === keepRid)
  if (!keepRel) throw new Error('Relation de feuille courante introuvable dans le modèle Excel.')

  const keepPath = normalizeZipPath(keepRel.getAttribute('Target') ?? '')
  sheetRelationships.forEach(rel => {
    const target = normalizeZipPath(rel.getAttribute('Target') ?? '')
    if (target !== keepPath) {
      zip.remove(target)
      rel.remove()
    }
  })

  Array.from(workbookDoc.getElementsByTagNameNS(SHEET_NS, 'sheet')).forEach(sheet => {
    const rid = sheet.getAttributeNS(REL_NS, 'id')
    if (rid !== keepRid) sheet.remove()
    else sheet.setAttribute('sheetId', '1')
  })

  Array.from(workbookDoc.getElementsByTagNameNS(SHEET_NS, 'definedNames')).forEach(node => node.remove())
  Array.from(workbookDoc.getElementsByTagNameNS(SHEET_NS, 'calcPr')).forEach(node => {
    node.setAttribute('calcMode', 'manual')
  })

  const overrides = Array.from(contentTypesDoc.getElementsByTagName('Override'))
  overrides.forEach(override => {
    const partName = override.getAttribute('PartName') ?? ''
    if (partName.startsWith('/xl/worksheets/') && partName !== `/${keepPath}`) {
      override.remove()
    }
    if (partName === '/xl/calcChain.xml') override.remove()
  })

  relationships.forEach(rel => {
    if (rel.getAttribute('Type')?.endsWith('/calcChain')) rel.remove()
  })
  zip.remove('xl/calcChain.xml')

  return keepPath
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function exportCurrentPrevisionnelWorkbook(lines: PrevisionnelLine[], sheetName: string) {
  const response = await fetch(TEMPLATE_URL)
  if (!response.ok) {
    throw new Error(`Modèle Excel introuvable: ${TEMPLATE_URL}`)
  }

  const zip = await JSZip.loadAsync(await response.arrayBuffer())
  const [workbookXml, relsXml, contentTypesXml] = await Promise.all([
    getTextFile(zip, WORKBOOK_PATH),
    getTextFile(zip, WORKBOOK_RELS_PATH),
    getTextFile(zip, CONTENT_TYPES_PATH),
  ])

  const workbookDoc = parseXml(workbookXml)
  const relsDoc = parseXml(relsXml)
  const contentTypesDoc = parseXml(contentTypesXml)
  const sheet = Array.from(workbookDoc.getElementsByTagNameNS(SHEET_NS, 'sheet')).find(
    item => item.getAttribute('name') === sheetName,
  )
  if (!sheet) throw new Error(`Onglet ${sheetName} introuvable dans le modèle Excel.`)

  const keepRid = sheet.getAttributeNS(REL_NS, 'id')
  if (!keepRid) throw new Error(`Relation Excel absente pour l'onglet ${sheetName}.`)

  const sheetPath = removeUnusedSheets(zip, workbookDoc, relsDoc, contentTypesDoc, keepRid)
  const sheetDoc = parseXml(await getTextFile(zip, sheetPath))

  freezeFormulasAsDisplayedValues(sheetDoc)
  updateCurrentYearSheet(sheetDoc, lines.filter(line => line.sourceSheet === sheetName))

  zip.file(WORKBOOK_PATH, serializeXml(workbookDoc))
  zip.file(WORKBOOK_RELS_PATH, serializeXml(relsDoc))
  zip.file(CONTENT_TYPES_PATH, serializeXml(contentTypesDoc))
  zip.file(sheetPath, serializeXml(sheetDoc))

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    compression: 'DEFLATE',
  })

  downloadBlob(blob, `PREVISIONNEL-${sheetName}-Sosson.xlsx`)
}

export async function exportCurrentPrevisionnelWorkbookFromCells(updates: WorkbookCellUpdates, sheetName: string) {
  const response = await fetch(TEMPLATE_URL)
  if (!response.ok) {
    throw new Error(`Modèle Excel introuvable: ${TEMPLATE_URL}`)
  }

  const zip = await JSZip.loadAsync(await response.arrayBuffer())
  const [workbookXml, relsXml, contentTypesXml] = await Promise.all([
    getTextFile(zip, WORKBOOK_PATH),
    getTextFile(zip, WORKBOOK_RELS_PATH),
    getTextFile(zip, CONTENT_TYPES_PATH),
  ])

  const workbookDoc = parseXml(workbookXml)
  const relsDoc = parseXml(relsXml)
  const contentTypesDoc = parseXml(contentTypesXml)
  const sheet = Array.from(workbookDoc.getElementsByTagNameNS(SHEET_NS, 'sheet')).find(
    item => item.getAttribute('name') === sheetName,
  )
  if (!sheet) throw new Error(`Onglet ${sheetName} introuvable dans le modèle Excel.`)

  const keepRid = sheet.getAttributeNS(REL_NS, 'id')
  if (!keepRid) throw new Error(`Relation Excel absente pour l'onglet ${sheetName}.`)

  const sheetPath = removeUnusedSheets(zip, workbookDoc, relsDoc, contentTypesDoc, keepRid)
  const sheetDoc = parseXml(await getTextFile(zip, sheetPath))

  freezeFormulasAsDisplayedValues(sheetDoc)
  updateCurrentYearSheetFromCells(sheetDoc, updates)

  zip.file(WORKBOOK_PATH, serializeXml(workbookDoc))
  zip.file(WORKBOOK_RELS_PATH, serializeXml(relsDoc))
  zip.file(CONTENT_TYPES_PATH, serializeXml(contentTypesDoc))
  zip.file(sheetPath, serializeXml(sheetDoc))

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    compression: 'DEFLATE',
  })

  downloadBlob(blob, `PREVISIONNEL-${sheetName}-Sosson.xlsx`)
}
