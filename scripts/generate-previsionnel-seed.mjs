import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const SOURCE_PATH = resolve('src/data/previsionnel.ts')
const CURRENT_SHEET_PATH = resolve('src/data/previsionnelCurrentSheet.ts')
const OUTPUT_PATH = resolve('dataconnect/previsionnel_seed_data.gql')
const OUTPUT_DIR = resolve('dataconnect/previsionnel_seed')
const TEMPLATE_PATH = resolve('public/excel/previsionnel-template.xlsx')
const SOURCE_STORAGE_PATH = 'previsionnel/source/PREVISIONNEL-original.xlsx'
const ORIGINAL_FILE_NAME = 'PREVISIONNEL-original.xlsx'
const CHUNK_SIZE = 50
const BATCH_ID = uuidFrom('previsionnel-import:PREVISIONNEL.xlsx:2013-14-2025-26')

const lotLabels = {
  etude: 'Etude',
  suivi: 'Suivi',
  ossature: 'Ossature',
  charpente: 'Charpente',
  menuiserie: 'Menuiserie',
  bardage: 'Bardage',
  isolation: 'Isolation',
  platrerie: 'Platrerie',
  terrasse: 'Terrasse',
  vmc: 'VMC',
  divers: 'Divers',
  couverture: 'Couverture',
  echafaudage: 'Echafaudage',
  tri_dechets: 'Tri dechets',
  etancheite: 'Etancheite',
}

const syntheticLinePatterns = [
  /\bcumul\b/i,
  /\btotal\b/i,
  /\btotaux\b/i,
  /\bsous[-\s]?total\b/i,
  /\bca\s+r[ée]alis[ée]\b/i,
  /\breste\s+[aà]\s+facturer\b/i,
  /\bfacturation\s+globale\b/i,
]
const editableSourceLineTypes = new Set(['chantier', 'commission', 'avoir', 'remboursement', 'facturation', 'example'])

function extractJsonConst(source, name, filePath = SOURCE_PATH) {
  const marker = `export const ${name}`
  const start = source.indexOf(marker)
  if (start < 0) throw new Error(`Impossible de lire ${name} dans ${filePath}`)

  const equals = source.indexOf('=', start)
  let index = equals + 1
  while (/\s/.test(source[index])) index += 1

  const open = source[index]
  const close = open === '[' ? ']' : open === '{' ? '}' : null
  if (!close) throw new Error(`Constante ${name} non JSON dans ${filePath}`)

  let depth = 0
  let inString = false
  let escaped = false

  for (let cursor = index; cursor < source.length; cursor += 1) {
    const char = source[cursor]

    if (inString) {
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') {
      inString = true
      continue
    }

    if (char === open) depth += 1
    if (char === close) {
      depth -= 1
      if (depth === 0) return JSON.parse(source.slice(index, cursor + 1))
    }
  }

  throw new Error(`Fin JSON introuvable pour ${name} dans ${filePath}`)
}

function normalizeId(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function uuidFrom(value) {
  const bytes = createHash('sha1').update(value).digest()
  bytes[6] = (bytes[6] & 0x0f) | 0x50
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = bytes.subarray(0, 16).toString('hex')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

function isOperationalLine(line) {
  if (line.lineType !== 'chantier') return false
  const name = `${line.rawName} ${line.clientName}`.trim()
  if (!name) return false
  if (syntheticLinePatterns.some(pattern => pattern.test(name))) return false
  return Math.max(line.caPrevision, line.caContrat, line.plannedTotal, line.realizedTotal) > 0 ||
    line.monthly.some(month => month.planned || month.realized)
}

function exerciseStartYear(exercise) {
  const parsed = Number(exercise.slice(0, 4))
  return Number.isFinite(parsed) ? parsed : new Date().getFullYear()
}

function monthStartDate(exercise, monthOrder) {
  const startYear = exerciseStartYear(exercise)
  const monthByOrder = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]
  const month = monthByOrder[Math.max(0, Math.min(monthOrder - 1, 11))]
  const year = month >= 9 ? startYear : startYear + 1
  return new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10)
}

function addMonths(date, months) {
  const current = new Date(`${date}T00:00:00.000Z`)
  current.setUTCMonth(current.getUTCMonth() + months)
  return current.toISOString().slice(0, 10)
}

function inferClientType(name) {
  if (/\b(mairie|commune|lyc[ée]e|college|coll[èe]ge|ecole|école|departement|département)\b/i.test(name)) return 'public'
  if (/\b(sarl|sas|sci|eurl|selarl|sa|snc|entreprise|garage|menuiserie|pharmacie|association)\b/i.test(name)) return 'professionnel'
  return 'particulier'
}

function gqlString(value) {
  return JSON.stringify(value ?? '')
}

function gqlNumber(value) {
  return Number.isFinite(value) ? Number(value.toFixed(2)) : 0
}

function workbookHash() {
  if (!existsSync(TEMPLATE_PATH)) return null
  return createHash('sha256').update(readFileSync(TEMPLATE_PATH)).digest('hex')
}

function chunks(items) {
  const result = []
  for (let index = 0; index < items.length; index += CHUNK_SIZE) {
    result.push(items.slice(index, index + CHUNK_SIZE))
  }
  return result
}

function cellNumber(row, col) {
  const value = row?.cells?.find(cell => cell.col === col)?.value
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function sumCurrentSheetRange(sheet, col, start, end) {
  return sheet.rows.reduce((sum, row) => {
    if (row.rowNumber < start || row.rowNumber > end) return sum
    return sum + cellNumber(row, col)
  }, 0)
}

function currentSheetRealizedTotal(sheet) {
  const realizedColumns = sheet.monthPairs.map(pair => pair.realized)
  return realizedColumns.reduce((sum, col) => sum + cellNumber(sheet.rows.find(row => row.rowNumber === 174), col), 0)
}

function loadCurrentSheetExerciseOverrides() {
  const sheet = loadCurrentSheet()
  if (!sheet) return new Map()

  const summaryRow = sheet.rows.find(row => row.rowNumber === 171)
  if (!summaryRow) return new Map()

  return new Map([
    [
      sheet.sheet,
      {
        caPrevision: sumCurrentSheetRange(sheet, 'D', 8, 170),
        caContrat: sumCurrentSheetRange(sheet, 'E', 32, 170),
        plannedTotal: sumCurrentSheetRange(sheet, 'F', 32, 132),
        realizedTotal: currentSheetRealizedTotal(sheet),
      },
    ],
  ])
}

function loadCurrentSheet() {
  if (!existsSync(CURRENT_SHEET_PATH)) return null
  const currentSource = readFileSync(CURRENT_SHEET_PATH, 'utf8')
  const sheet = extractJsonConst(currentSource, 'currentPrevisionnelSheet', CURRENT_SHEET_PATH)
  return sheet?.sheet ? sheet : null
}

function currentSheetCellValueRows() {
  const sheet = loadCurrentSheet()
  if (!sheet) return []

  return sheet.rows.flatMap(row =>
    row.cells
      .filter(cell => {
        if (!editableSourceLineTypes.has(row.lineType)) return false
        if (!cell.editable) return false
        if (cell.value === null || cell.value === undefined) return false
        if (typeof cell.value === 'string' && cell.value === '') return false
        return true
      })
      .map(cell => {
        if (typeof cell.value === 'string' && cell.value.length > 255) {
          throw new Error(`Cellule ${cell.ref} trop longue pour PrevisionnelCellEdit.valueText`)
        }

        return {
          id: `${sheet.sheet}:${cell.ref}`,
          sourceSheet: sheet.sheet,
          cellRef: cell.ref,
          valueText: typeof cell.value === 'string' ? cell.value : null,
          numericValue: typeof cell.value === 'number' && Number.isFinite(cell.value) ? cell.value : null,
        }
      }),
  )
}

const source = readFileSync(SOURCE_PATH, 'utf8')
const allLines = extractJsonConst(source, 'previsionnelLines')
const lines = allLines.filter(isOperationalLine)
const exerciseOverrides = loadCurrentSheetExerciseOverrides()
const clientsByKey = new Map()
const exercisesByName = new Map()
const aliasesByKey = new Map()

lines.forEach(line => {
  const key = normalizeId(line.clientKey || line.clientName)
  if (!key) return
  const existing = clientsByKey.get(key)
  if (existing) {
    existing.lineCount += 1
    if (line.exercise < existing.firstExercise) existing.firstExercise = line.exercise
    return
  }
  clientsByKey.set(key, {
    key,
    id: uuidFrom(`client:${key}`),
    nom: line.clientName || line.rawName || key,
    type: inferClientType(`${line.clientName} ${line.rawName}`),
    firstExercise: line.exercise,
    lineCount: 1,
  })
})

lines.forEach(line => {
  const existing = exercisesByName.get(line.exercise) ?? {
    id: uuidFrom(`previsionnel-exercise:${line.exercise}`),
    sheet: line.sourceSheet,
    exercise: line.exercise,
    startYear: exerciseStartYear(line.exercise),
    endYear: exerciseStartYear(line.exercise) + 1,
    lineCount: 0,
    chantierCount: 0,
    caPrevision: 0,
    caContrat: 0,
    plannedTotal: 0,
    realizedTotal: 0,
    invoicedTotal: 0,
  }
  existing.lineCount += 1
  existing.chantierCount += line.lineType === 'chantier' ? 1 : 0
  existing.caPrevision += line.caPrevision
  existing.caContrat += line.caContrat
  existing.plannedTotal += line.plannedTotal
  existing.realizedTotal += line.realizedTotal
  existing.invoicedTotal += line.invoicedTotal
  exercisesByName.set(line.exercise, existing)

  const clientKey = normalizeId(line.clientKey || line.clientName)
  const alias = (line.rawName || line.clientName || '').trim()
  if (clientKey && alias) {
    aliasesByKey.set(`${clientKey}:${normalizeId(alias)}`, {
      id: uuidFrom(`client-alias:${clientKey}:${normalizeId(alias)}`),
      clientId: clientsByKey.get(clientKey)?.id,
      alias,
      normalizedKey: clientKey,
      source: 'excel',
    })
  }
})

const clientRows = Array.from(clientsByKey.values()).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
const exerciseRows = Array.from(exercisesByName.values())
  .map(exercise => ({ ...exercise, ...exerciseOverrides.get(exercise.sheet) }))
  .sort((a, b) => a.exercise.localeCompare(b.exercise))
const aliasRows = Array.from(aliasesByKey.values())
  .filter(alias => alias.clientId)
  .sort((a, b) => a.alias.localeCompare(b.alias, 'fr'))

const chantierByLineId = new Map()
const chantierRows = lines
  .map(line => {
    const clientKey = normalizeId(line.clientKey || line.clientName)
    const start = monthStartDate(line.exercise, [...line.monthly].sort((a, b) => a.order - b.order).find(month => month.planned || month.realized)?.order ?? 1)
    const budget = line.caPrevision || line.caContrat || line.plannedTotal || line.realizedTotal
    const row = {
      id: uuidFrom(`chantier:${line.sourceSheet}:${line.sourceRow}:${line.rawName}`),
      clientId: clientsByKey.get(clientKey)?.id,
      nom: `${line.clientName || line.rawName} (${line.exercise})`,
      statut: line.exercise === '2025-26' ? (line.realizedTotal > 0 ? 'en_cours' : 'en_attente') : 'cloture',
      dateDebut: start,
      dateFinPrevue: addMonths(start, Math.max(line.monthly.length, 1)),
      dateFin: line.exercise === '2025-26' ? null : addMonths(start, Math.max(line.monthly.length, 1)),
      budgetPrevisionnel: budget,
      description: `Import PREVISIONNEL.xlsx - onglet ${line.sourceSheet}, ligne ${line.sourceRow}, categorie ${line.category}.`,
      adresse: '',
    }
    chantierByLineId.set(line.id, row.id)
    return row
  })
  .filter(row => row.clientId)
  .sort((a, b) => b.dateDebut.localeCompare(a.dateDebut))

const previsionnelLineRows = lines
  .map(line => {
    const clientKey = normalizeId(line.clientKey || line.clientName)
    const invoiceSentTotal = line.monthly.reduce((sum, month) => sum + (month.invoiceSent ? month.realized : 0), 0)
    return {
      id: uuidFrom(`previsionnel-line:${line.sourceSheet}:${line.sourceRow}:${line.rawName}`),
      exerciseId: exercisesByName.get(line.exercise)?.id,
      clientId: clientsByKey.get(clientKey)?.id,
      chantierId: chantierByLineId.get(line.id),
      sourceSheet: line.sourceSheet,
      sourceRow: line.sourceRow,
      rawName: line.rawName,
      clientKey: line.clientKey,
      clientName: line.clientName,
      category: line.category,
      lineType: line.lineType,
      caTce: line.caTce,
      caPrevision: line.caPrevision,
      caContrat: line.caContrat,
      plannedTotal: line.plannedTotal,
      realizedTotal: line.realizedTotal,
      invoicedTotal: line.invoicedTotal,
      invoiceSentTotal,
      sourceLine: line,
    }
  })
  .filter(row => row.clientId && row.exerciseId && row.chantierId)
  .sort((a, b) => a.sourceSheet.localeCompare(b.sourceSheet) || a.sourceRow - b.sourceRow)

const monthlyRows = previsionnelLineRows.flatMap(row =>
  row.sourceLine.monthly.map(month => ({
    id: uuidFrom(`previsionnel-month:${row.id}:${month.month}:${month.order}`),
    lineId: row.id,
    month: month.month,
    label: month.label,
    monthOrder: month.order,
    planned: month.planned,
    realized: month.realized,
    invoiceSent: Boolean(month.invoiceSent),
  })),
)

const lotRows = previsionnelLineRows.flatMap(row =>
  Object.entries(row.sourceLine.lots).map(([lotKey, amount]) => ({
    id: uuidFrom(`previsionnel-lot:${row.id}:${lotKey}`),
    lineId: row.id,
    lotKey,
    label: lotLabels[lotKey] ?? lotKey,
    amount,
  })),
)
const cellEditRows = currentSheetCellValueRows().sort((a, b) => a.cellRef.localeCompare(b.cellRef, 'fr', { numeric: true }))

const output = [
  '# =============================================================================',
  '# Seed previsionnel Sosson - genere depuis src/data/previsionnel.ts',
  '# =============================================================================',
  '# Source: PREVISIONNEL.xlsx, onglets 2013-14 a 2025-26.',
  '# Jaune Excel = facture envoyee, pas facture payee/encaissee.',
  `# Batch: 1`,
  `# Exercices: ${exerciseRows.length}`,
  `# Clients: ${clientRows.length}`,
  `# Alias clients: ${aliasRows.length}`,
  `# Chantiers: ${chantierRows.length}`,
  `# Lignes previsionnelles: ${previsionnelLineRows.length}`,
  `# Montants mensuels: ${monthlyRows.length}`,
  `# Montants par lot: ${lotRows.length}`,
  `# Cellules exactes 2025-26: ${cellEditRows.length}`,
  `# Lignes source operationnelles: ${lines.length}`,
  '#',
  '# Execution locale:',
  '#   firebase dataconnect:execute dataconnect/previsionnel_seed_data.gql --service sosson-sandbox-service --location europe-west9',
  '# =============================================================================',
  '',
  'mutation @transaction {',
  '  importBatch: previsionnelImportBatch_upsertMany(data: [',
  '    {',
  `      id: ${gqlString(BATCH_ID)},`,
  '      workbook: "PREVISIONNEL.xlsx",',
  '      sourcePath: "C:/Users/pcpor/OneDrive/Bureau/prévisionnelsosson/PREVISIONNEL.xlsx",',
  `      workbookHash: ${workbookHash() ? gqlString(workbookHash()) : 'null'},`,
  `      sourceStoragePath: ${gqlString(SOURCE_STORAGE_PATH)},`,
  `      sourceSha256: ${workbookHash() ? gqlString(workbookHash()) : 'null'},`,
  `      originalFileName: ${gqlString(ORIGINAL_FILE_NAME)},`,
  '      notes: "Import genere depuis src/data/previsionnel.ts. Jaune Excel = facture envoyee, pas paiement."',
  '    }',
  '  ])',
  '',
]

chunks(exerciseRows).forEach((chunk, index) => {
  output.push(`  exercises${String(index + 1).padStart(3, '0')}: previsionnelExercise_upsertMany(data: [`)
  chunk.forEach((exercise, itemIndex) => {
    output.push(
      '    {',
      `      id: ${gqlString(exercise.id)},`,
      `      batchId: ${gqlString(BATCH_ID)},`,
      `      sheet: ${gqlString(exercise.sheet)},`,
      `      exercise: ${gqlString(exercise.exercise)},`,
      `      startYear: ${exercise.startYear},`,
      `      endYear: ${exercise.endYear},`,
      `      lineCount: ${exercise.lineCount},`,
      `      chantierCount: ${exercise.chantierCount},`,
      `      caPrevision: ${gqlNumber(exercise.caPrevision)},`,
      `      caContrat: ${gqlNumber(exercise.caContrat)},`,
      `      plannedTotal: ${gqlNumber(exercise.plannedTotal)},`,
      `      realizedTotal: ${gqlNumber(exercise.realizedTotal)},`,
      `      invoicedTotal: ${gqlNumber(exercise.invoicedTotal)}`,
      `    }${itemIndex === chunk.length - 1 ? '' : ','}`,
    )
  })
  output.push('  ])', '')
})

chunks(clientRows).forEach((chunk, index) => {
  output.push(`  clients${String(index + 1).padStart(3, '0')}: client_upsertMany(data: [`)
  chunk.forEach((client, itemIndex) => {
    output.push(
      '    {',
      `      id: ${gqlString(client.id)},`,
      '      origineImport: "previsionnel",',
      `      type: ${gqlString(client.type)},`,
      `      nom: ${gqlString(client.nom)},`,
      '      email: null,',
      '      telephone: null,',
      '      adresse: null,',
      '      ville: null,',
      '      codePostal: null',
      `    }${itemIndex === chunk.length - 1 ? '' : ','}`,
    )
  })
  output.push(`  ])${index === chunks(clientRows).length - 1 && chantierRows.length === 0 ? '' : ''}`, '')
})

chunks(aliasRows).forEach((chunk, index) => {
  output.push(`  aliases${String(index + 1).padStart(3, '0')}: clientAlias_upsertMany(data: [`)
  chunk.forEach((alias, itemIndex) => {
    output.push(
      '    {',
      `      id: ${gqlString(alias.id)},`,
      `      clientId: ${gqlString(alias.clientId)},`,
      `      alias: ${gqlString(alias.alias)},`,
      `      normalizedKey: ${gqlString(alias.normalizedKey)},`,
      `      source: ${gqlString(alias.source)}`,
      `    }${itemIndex === chunk.length - 1 ? '' : ','}`,
    )
  })
  output.push('  ])', '')
})

chunks(chantierRows).forEach((chunk, chunkIndex) => {
  output.push(`  chantiers${String(chunkIndex + 1).padStart(3, '0')}: chantier_upsertMany(data: [`)
  chunk.forEach((chantier, index) => {
    output.push(
      '    {',
      `      id: ${gqlString(chantier.id)},`,
      '      origineImport: "previsionnel",',
      `      clientId: ${gqlString(chantier.clientId)},`,
      `      nom: ${gqlString(chantier.nom)},`,
      `      statut: ${gqlString(chantier.statut)},`,
      `      dateDebut: ${gqlString(chantier.dateDebut)},`,
      `      dateFinPrevue: ${gqlString(chantier.dateFinPrevue)},`,
      `      dateFin: ${chantier.dateFin ? gqlString(chantier.dateFin) : 'null'},`,
      `      budgetPrevisionnel: ${gqlNumber(chantier.budgetPrevisionnel)},`,
      `      description: ${gqlString(chantier.description)},`,
      '      adresse: null',
      `    }${index === chunk.length - 1 ? '' : ','}`,
    )
  })
  output.push('  ])', '')
})

chunks(previsionnelLineRows).forEach((chunk, chunkIndex) => {
  output.push(`  lines${String(chunkIndex + 1).padStart(3, '0')}: previsionnelLine_upsertMany(data: [`)
  chunk.forEach((line, index) => {
    output.push(
      '    {',
      `      id: ${gqlString(line.id)},`,
      `      exerciseId: ${gqlString(line.exerciseId)},`,
      `      clientId: ${gqlString(line.clientId)},`,
      `      chantierId: ${gqlString(line.chantierId)},`,
      `      sourceSheet: ${gqlString(line.sourceSheet)},`,
      `      sourceRow: ${line.sourceRow},`,
      `      rawName: ${gqlString(line.rawName)},`,
      `      clientKey: ${gqlString(line.clientKey)},`,
      `      clientName: ${gqlString(line.clientName)},`,
      `      category: ${gqlString(line.category)},`,
      `      lineType: ${gqlString(line.lineType)},`,
      `      caTce: ${gqlNumber(line.caTce)},`,
      `      caPrevision: ${gqlNumber(line.caPrevision)},`,
      `      caContrat: ${gqlNumber(line.caContrat)},`,
      `      plannedTotal: ${gqlNumber(line.plannedTotal)},`,
      `      realizedTotal: ${gqlNumber(line.realizedTotal)},`,
      `      invoicedTotal: ${gqlNumber(line.invoicedTotal)},`,
      `      invoiceSentTotal: ${gqlNumber(line.invoiceSentTotal)}`,
      `    }${index === chunk.length - 1 ? '' : ','}`,
    )
  })
  output.push('  ])', '')
})

chunks(monthlyRows).forEach((chunk, chunkIndex) => {
  output.push(`  monthly${String(chunkIndex + 1).padStart(3, '0')}: previsionnelMonthlyAmount_upsertMany(data: [`)
  chunk.forEach((month, index) => {
    output.push(
      '    {',
      `      id: ${gqlString(month.id)},`,
      `      lineId: ${gqlString(month.lineId)},`,
      `      month: ${gqlString(month.month)},`,
      `      label: ${gqlString(month.label)},`,
      `      monthOrder: ${month.monthOrder},`,
      `      planned: ${gqlNumber(month.planned)},`,
      `      realized: ${gqlNumber(month.realized)},`,
      `      invoiceSent: ${month.invoiceSent ? 'true' : 'false'}`,
      `    }${index === chunk.length - 1 ? '' : ','}`,
    )
  })
  output.push('  ])', '')
})

chunks(lotRows).forEach((chunk, chunkIndex) => {
  output.push(`  lots${String(chunkIndex + 1).padStart(3, '0')}: previsionnelLotAmount_upsertMany(data: [`)
  chunk.forEach((lot, index) => {
    output.push(
      '    {',
      `      id: ${gqlString(lot.id)},`,
      `      lineId: ${gqlString(lot.lineId)},`,
      `      lotKey: ${gqlString(lot.lotKey)},`,
      `      label: ${gqlString(lot.label)},`,
      `      amount: ${gqlNumber(lot.amount)}`,
      `    }${index === chunk.length - 1 ? '' : ','}`,
    )
  })
  output.push('  ])', '')
})

chunks(cellEditRows).forEach((chunk, chunkIndex) => {
  output.push(`  cellEdits${String(chunkIndex + 1).padStart(3, '0')}: previsionnelCellEdit_upsertMany(data: [`)
  chunk.forEach((cell, index) => {
    output.push(
      '    {',
      `      id: ${gqlString(cell.id)},`,
      `      sourceSheet: ${gqlString(cell.sourceSheet)},`,
      `      cellRef: ${gqlString(cell.cellRef)},`,
      `      valueText: ${cell.valueText === null ? 'null' : gqlString(cell.valueText)},`,
      `      numericValue: ${cell.numericValue === null ? 'null' : gqlNumber(cell.numericValue)}`,
      `    }${index === chunk.length - 1 ? '' : ','}`,
    )
  })
  output.push('  ])', '')
})

output.push('}', '')

mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
writeFileSync(OUTPUT_PATH, output.join('\n'), 'utf8')

if (existsSync(OUTPUT_DIR)) {
  rmSync(OUTPUT_DIR, { recursive: true, force: true })
}
mkdirSync(OUTPUT_DIR, { recursive: true })

const blockPattern = /^  [a-zA-Z][a-zA-Z0-9_]*: /gm
const text = output.join('\n')
const matches = Array.from(text.matchAll(blockPattern))
matches.forEach((match, index) => {
  const start = match.index ?? 0
  const next = matches[index + 1]?.index ?? text.indexOf('\n}', start)
  const block = text.slice(start, next).trimEnd()
  const operation = ['mutation @transaction {', block, '}', ''].join('\n')
  const alias = match[0].trim().split(':')[0]
  const fileName = `${String(index + 1).padStart(4, '0')}_${alias}.gql`
  writeFileSync(resolve(OUTPUT_DIR, fileName), operation, 'utf8')
})

console.log(`Generated ${OUTPUT_PATH}`)
console.log(`Generated ${readdirSync(OUTPUT_DIR).length} chunked seed files in ${OUTPUT_DIR}`)
console.log(`${clientRows.length} clients, ${chantierRows.length} chantiers, ${previsionnelLineRows.length} previsionnel lines`)
console.log(`${monthlyRows.length} monthly amounts, ${lotRows.length} lot amounts, ${aliasRows.length} aliases`)
console.log(`${cellEditRows.length} exact current-sheet cell values`)
