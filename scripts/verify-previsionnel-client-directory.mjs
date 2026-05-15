import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SOURCE_PATH = resolve('src/data/previsionnel.ts')

const expectedTotals = {
  chantierLines: 898,
  uniqueClients: 586,
  groups: 29,
}

const expectedMaison202526 = {
  exercise: '2025-26',
  category: 'maison',
  chantierLines: 18,
  uniqueClients: 16,
  duplicateClientKey: 'guillot',
  duplicateCount: 3,
  rawNames: [
    'CHARLET',
    'LEPROVOT',
    'BRIERE',
    'DUTRIPON R',
    'HUCHET',
    'CRUCHON  LEGUEVASQUES',
    'CAMPAGNILE',
    'GAUDIN',
    'RAVENEL',
    'SEEGERS',
    'BRETEAU',
    'HERMILLY CARREAU',
    'GUILLOT 1',
    'GUILLOT 2',
    'GUILLOT 18',
    'SIMONET',
    'MORIVAL (abris cloture)',
    'DUFOUR G',
  ],
}

const allowedCategories = new Set(['maison', 'extension', 'charpente', 'couverture', 'divers', 'renovation', 'non_classe'])
const allowedLineTypes = new Set(['chantier', 'commission', 'avoir', 'remboursement', 'facturation'])

const syntheticLinePatterns = [
  /\bcumul\b/i,
  /\btotal\b/i,
  /\btotaux\b/i,
  /\bsous[-\s]?total\b/i,
  /\bca\s+r[eé]alis[eé]\b/i,
  /\breste\s+[aà]\s+facturer\b/i,
  /\bfacturation\s+globale\b/i,
]

function extractConst(source, name, nextName) {
  const match = source.match(new RegExp(`export const ${name}[^=]*= ([\\s\\S]*?)\\nexport const ${nextName}`))
  if (!match) throw new Error(`Impossible de lire ${name} dans ${SOURCE_PATH}`)
  return JSON.parse(match[1].replace(/ as const\s*$/, ''))
}

function normalizeId(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
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
  const parsed = Number(String(exercise).slice(0, 4))
  return Number.isFinite(parsed) ? parsed : null
}

function groupKey(line) {
  return `${line.exercise}|||${line.category}`
}

function groupLabel({ exercise, category }) {
  return `${exercise} / ${category}`
}

function lineClientKey(line) {
  return normalizeId(line.clientKey || line.clientName)
}

function chantierId(line) {
  return `prev-chantier-${line.id.replace(/^prev-/, '')}`
}

function summarizeGroup(lines) {
  const first = lines[0]
  const clients = new Map()

  lines.forEach(line => {
    const clientKey = lineClientKey(line)
    const rows = clients.get(clientKey) ?? []
    rows.push({
      sourceSheet: line.sourceSheet,
      sourceRow: line.sourceRow,
      rawName: line.rawName,
      clientName: line.clientName,
    })
    clients.set(clientKey, rows)
  })

  const duplicates = Array.from(clients.entries())
    .filter(([clientKey, rows]) => clientKey && rows.length > 1)
    .map(([clientKey, rows]) => ({
      clientKey,
      count: rows.length,
      rows,
    }))
    .sort((a, b) => b.count - a.count || a.clientKey.localeCompare(b.clientKey))

  const chantierLines = lines.length
  const uniqueClients = clients.size
  const duplicateExtraCount = duplicates.reduce((sum, duplicate) => sum + duplicate.count - 1, 0)

  return {
    exercise: first.exercise,
    category: first.category,
    chantierLines,
    uniqueClients,
    duplicateExtraCount,
    gap: chantierLines - uniqueClients,
    duplicates,
    rawNames: lines.map(line => line.rawName),
  }
}

function buildClientDirectory(lines) {
  const grouped = new Map()

  lines.forEach(line => {
    const key = lineClientKey(line)
    if (!key) return
    const existing = grouped.get(key)
    if (existing) {
      existing.lines.push(line)
      if (line.exercise < existing.firstExercise) existing.firstExercise = line.exercise
      return
    }
    grouped.set(key, {
      key,
      nom: line.clientName || line.rawName || key,
      firstExercise: line.exercise,
      lines: [line],
    })
  })

  return Array.from(grouped.values()).map(client => ({
    id: `prev-client-${client.key}`,
    key: client.key,
    nom: client.nom,
    type: 'particulier',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    codePostal: '',
    dateCreation: `${exerciseStartYear(client.firstExercise)}-10-01`,
    chantierIds: client.lines.map(chantierId),
    sourceLineIds: client.lines.map(line => line.id),
    exercises: new Set(client.lines.map(line => line.exercise)),
    categories: new Set(client.lines.map(line => line.category)),
  }))
}

function assertCondition(condition, message, failures) {
  if (!condition) failures.push(message)
}

function validateLineFields(lines, failures) {
  const ids = new Set()

  lines.forEach(line => {
    const prefix = `${line.id || 'ligne sans id'}`
    assertCondition(typeof line.id === 'string' && line.id.length > 0, `${prefix}: id manquant`, failures)
    assertCondition(!ids.has(line.id), `${prefix}: id duplique`, failures)
    ids.add(line.id)

    assertCondition(typeof line.sourceSheet === 'string' && line.sourceSheet.length > 0, `${prefix}: sourceSheet manquant`, failures)
    assertCondition(Number.isInteger(line.sourceRow) && line.sourceRow > 0, `${prefix}: sourceRow invalide`, failures)
    assertCondition(/^\d{4}-\d{2}$/.test(line.exercise), `${prefix}: exercise invalide`, failures)
    assertCondition(typeof line.rawName === 'string' && line.rawName.trim().length > 0, `${prefix}: rawName manquant`, failures)
    assertCondition(typeof line.clientName === 'string' && line.clientName.trim().length > 0, `${prefix}: clientName manquant`, failures)
    assertCondition(typeof line.clientKey === 'string' && lineClientKey(line).length > 0, `${prefix}: clientKey manquant`, failures)
    assertCondition(allowedCategories.has(line.category), `${prefix}: category invalide ${line.category}`, failures)
    assertCondition(allowedLineTypes.has(line.lineType), `${prefix}: lineType invalide ${line.lineType}`, failures)

    ;['caTce', 'caPrevision', 'caContrat', 'plannedTotal', 'realizedTotal', 'invoicedTotal'].forEach(field => {
      assertCondition(isFiniteNumber(line[field]), `${prefix}: montant ${field} invalide`, failures)
    })

    assertCondition(line.lots && typeof line.lots === 'object' && !Array.isArray(line.lots), `${prefix}: lots invalide`, failures)
    Object.entries(line.lots ?? {}).forEach(([lot, value]) => {
      assertCondition(typeof lot === 'string' && lot.length > 0, `${prefix}: nom de lot invalide`, failures)
      assertCondition(isFiniteNumber(value), `${prefix}: montant lot ${lot} invalide`, failures)
    })

    assertCondition(Array.isArray(line.monthly), `${prefix}: monthly invalide`, failures)
    ;(line.monthly ?? []).forEach((month, index) => {
      const monthPrefix = `${prefix}: monthly[${index}]`
      assertCondition(typeof month.month === 'string' && month.month.length > 0, `${monthPrefix}: month manquant`, failures)
      assertCondition(typeof month.label === 'string' && month.label.length > 0, `${monthPrefix}: label manquant`, failures)
      assertCondition(Number.isInteger(month.order) && month.order >= 1 && month.order <= 12, `${monthPrefix}: order invalide`, failures)
      assertCondition(isFiniteNumber(month.planned), `${monthPrefix}: planned invalide`, failures)
      assertCondition(isFiniteNumber(month.realized), `${monthPrefix}: realized invalide`, failures)
      assertCondition(
        month.invoiceSent === undefined || typeof month.invoiceSent === 'boolean',
        `${monthPrefix}: invoiceSent doit etre booleen si present`,
        failures,
      )
    })
  })
}

function validateClientDirectory(clients, operationalLines, failures) {
  const operationalLineIds = new Set(operationalLines.map(line => line.id))
  const clientIds = new Set()

  clients.forEach(client => {
    const prefix = `client ${client.id}`
    assertCondition(!clientIds.has(client.id), `${prefix}: id client duplique`, failures)
    clientIds.add(client.id)
    assertCondition(client.id === `prev-client-${client.key}`, `${prefix}: id ne correspond pas a la cle`, failures)
    assertCondition(client.nom.trim().length > 0, `${prefix}: nom manquant`, failures)
    assertCondition(client.type === 'particulier', `${prefix}: type attendu particulier dans le modele front actuel`, failures)
    assertCondition(/^\d{4}-10-01$/.test(client.dateCreation), `${prefix}: dateCreation invalide`, failures)
    assertCondition(client.chantierIds.length === client.sourceLineIds.length, `${prefix}: chantierIds/sourceLineIds incoherents`, failures)
    client.sourceLineIds.forEach(lineId => {
      assertCondition(operationalLineIds.has(lineId), `${prefix}: sourceLineId ${lineId} absent des lignes operationnelles`, failures)
    })
    client.chantierIds.forEach(id => {
      assertCondition(/^prev-chantier-\d{4}-\d{2}-\d+$/.test(id), `${prefix}: chantierId invalide ${id}`, failures)
    })
    assertCondition(client.exercises.size > 0, `${prefix}: aucun exercice rattache`, failures)
    assertCondition(client.categories.size > 0, `${prefix}: aucune categorie rattachee`, failures)
  })
}

const source = readFileSync(SOURCE_PATH, 'utf8')
const allLines = extractConst(source, 'previsionnelLines', 'previsionnelExercises')
const operationalLines = allLines.filter(isOperationalLine)
const groups = new Map()
const failures = []

validateLineFields(operationalLines, failures)

operationalLines.forEach(line => {
  const key = groupKey(line)
  const lines = groups.get(key) ?? []
  lines.push(line)
  groups.set(key, lines)
})

const summaries = Array.from(groups.values())
  .map(summarizeGroup)
  .sort((a, b) => a.exercise.localeCompare(b.exercise) || a.category.localeCompare(b.category))

const allClientKeys = new Set(operationalLines.map(lineClientKey))
const clients = buildClientDirectory(operationalLines)

validateClientDirectory(clients, operationalLines, failures)

assertCondition(
  operationalLines.length === expectedTotals.chantierLines,
  `Total lignes chantier attendu ${expectedTotals.chantierLines}, obtenu ${operationalLines.length}`,
  failures,
)
assertCondition(
  allClientKeys.size === expectedTotals.uniqueClients,
  `Total clients uniques attendu ${expectedTotals.uniqueClients}, obtenu ${allClientKeys.size}`,
  failures,
)
assertCondition(
  summaries.length === expectedTotals.groups,
  `Total groupes exercice/categorie attendu ${expectedTotals.groups}, obtenu ${summaries.length}`,
  failures,
)

summaries.forEach(summary => {
  assertCondition(
    summary.gap === summary.duplicateExtraCount,
    `${groupLabel(summary)}: ecart ${summary.gap} mais doublons clientKey expliquent ${summary.duplicateExtraCount}`,
    failures,
  )
})

const maison202526 = summaries.find(summary =>
  summary.exercise === expectedMaison202526.exercise &&
  summary.category === expectedMaison202526.category
)
const guillot = maison202526?.duplicates.find(duplicate => duplicate.clientKey === expectedMaison202526.duplicateClientKey)

assertCondition(Boolean(maison202526), 'Groupe 2025-26 / maison introuvable', failures)
if (maison202526) {
  assertCondition(
    maison202526.chantierLines === expectedMaison202526.chantierLines,
    `Maison 2025-26 lignes attendu ${expectedMaison202526.chantierLines}, obtenu ${maison202526.chantierLines}`,
    failures,
  )
  assertCondition(
    maison202526.uniqueClients === expectedMaison202526.uniqueClients,
    `Maison 2025-26 clients uniques attendu ${expectedMaison202526.uniqueClients}, obtenu ${maison202526.uniqueClients}`,
    failures,
  )
  assertCondition(
    guillot?.count === expectedMaison202526.duplicateCount,
    `Maison 2025-26 GUILLOT attendu x${expectedMaison202526.duplicateCount}, obtenu x${guillot?.count ?? 0}`,
    failures,
  )
  assertCondition(
    JSON.stringify(maison202526.rawNames) === JSON.stringify(expectedMaison202526.rawNames),
    'Maison 2025-26: ordre ou noms differents de la liste Excel attendue',
    failures,
  )
}

const report = {
  source: SOURCE_PATH,
  totals: {
    sourceLines: allLines.length,
    chantierLines: operationalLines.length,
    uniqueClients: allClientKeys.size,
    groups: summaries.length,
    derivedClients: clients.length,
  },
  validatedFields: {
    excelLine: [
      'id',
      'sourceSheet',
      'sourceRow',
      'exercise',
      'rawName',
      'clientKey',
      'clientName',
      'category',
      'lineType',
      'caTce',
      'caPrevision',
      'caContrat',
      'plannedTotal',
      'realizedTotal',
      'invoicedTotal',
      'lots',
      'monthly',
      'monthly.invoiceSent',
    ],
    clientDirectory: [
      'id',
      'nom',
      'type',
      'email',
      'telephone',
      'adresse',
      'ville',
      'codePostal',
      'dateCreation',
      'chantierIds',
      'exercises',
      'categories',
    ],
  },
  groups: summaries.map(summary => ({
    exercise: summary.exercise,
    category: summary.category,
    chantierLines: summary.chantierLines,
    uniqueClients: summary.uniqueClients,
    gap: summary.gap,
    duplicateExtraCount: summary.duplicateExtraCount,
    duplicates: summary.duplicates,
  })),
}

console.log(JSON.stringify(report, null, 2))

if (failures.length > 0) {
  console.error('\nVerification echouee:')
  failures.forEach(failure => console.error(`- ${failure}`))
  process.exitCode = 1
} else {
  console.log('\nVerification OK: champs client/Excel controles, compteurs explicites, ecarts expliques par les doublons clientKey.')
}
