import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const rgBaseArgs = [
  '-n',
  '--glob',
  '!src/dataconnect-generated/**',
  '--glob',
  '!src/dataconnect-admin-generated/**',
]

const allow = {
  directGeneratedMutation: new Set(['src/features/documents/documentSql.ts']),
  documentSqlAdapter: new Set(['src/features/documents/documentSql.ts', 'src/pages/DocumentsPage.tsx', 'src/pages/FacturesPage.tsx']),
  storagePathMetadata: new Set([
    'src/features/documents/documentSql.ts',
    'src/features/documents/storagePaths.ts',
    'src/features/previsionnel/previsionnelWorkbookExport.ts',
    'src/pages/DocumentsPage.tsx',
    'src/pages/FacturesPage.tsx',
    'src/pages/PrevisionnelSpreadsheetPage.tsx',
  ]),
  pathBuilder: new Set([
    'src/features/documents/storagePaths.ts',
    'src/features/documents/storagePaths.test.ts',
    'src/pages/DocumentsPage.tsx',
    'src/pages/FacturesPage.tsx',
  ]),
  pathValidator: new Set([
    'src/features/documents/documentSql.ts',
    'src/features/documents/storagePaths.ts',
    'src/features/documents/storagePaths.test.ts',
  ]),
}

function normalizePath(value) {
  return value.replaceAll('\\', '/')
}

function rg(pattern, paths = ['src']) {
  try {
    const output = execFileSync('rg', [...rgBaseArgs, pattern, ...paths], { encoding: 'utf8' }).trim()
    if (!output) return []
    return output.split('\n').map((line) => {
      const [file, lineNumber, ...rest] = line.split(':')
      return {
        file: normalizePath(file),
        lineNumber,
        text: rest.join(':'),
        raw: line,
      }
    })
  } catch (error) {
    if (error.status === 1) return []
    throw error
  }
}

function rejectUnexpected(matches, allowedFiles, label) {
  const unexpected = matches.filter((match) => !allowedFiles.has(match.file))
  if (unexpected.length === 0) return []
  return [`${label}:`, ...unexpected.map((match) => `- ${match.raw}`)]
}

const failures = []

function requireSourcePattern(file, pattern, label) {
  const source = readFileSync(file, 'utf8')
  if (!pattern.test(source)) failures.push(`${file}: ${label}`)
}

requireSourcePattern('dataconnect/schema/schema.gql', /\btype\s+DocumentFolder\s+@table\b/, 'type DocumentFolder manquant')
requireSourcePattern('dataconnect/schema/schema.gql', /\btype\s+DocumentAttache\s+@table\b/, 'type DocumentAttache manquant')
requireSourcePattern('dataconnect/schema/schema.gql', /\bstoragePath:\s+String!\s+@col\(dataType:\s*"varchar\(500\)"\)/, 'DocumentAttache.storagePath requis ou type inattendu')
requireSourcePattern('dataconnect/schema/schema.gql', /\bsha256:\s+String\s+@col\(dataType:\s*"varchar\(64\)"\)/, 'DocumentAttache.sha256 manquant ou type inattendu')
requireSourcePattern('dataconnect/sosson/mutations.gql', /\bmutation\s+CreateDocumentFolder\b[\s\S]*?@transaction[\s\S]*?documentFolder_insert/, 'mutation CreateDocumentFolder transactionnelle manquante')
requireSourcePattern('dataconnect/sosson/mutations.gql', /\bmutation\s+CreateDocumentAttache\b[\s\S]*?@transaction[\s\S]*?documentAttache_insert[\s\S]*?storagePath:\s+\$storagePath/, 'mutation CreateDocumentAttache transactionnelle avec storagePath manquante')
requireSourcePattern('dataconnect/sosson/mutations.gql', /\bmutation\s+CreateDocumentAttache\b[\s\S]*?documentAttache_insert[\s\S]*?sha256:\s+\$sha256/, 'mutation CreateDocumentAttache avec sha256 manquant')
requireSourcePattern('dataconnect/sosson/queries.gql', /\bquery\s+ListDocumentFolders\b[\s\S]*?documentFolders/, 'query ListDocumentFolders manquante')
requireSourcePattern('dataconnect/sosson/queries.gql', /\bquery\s+ListDocumentsAttaches\b[\s\S]*?documentAttaches[\s\S]*?storagePath/, 'query ListDocumentsAttaches avec storagePath manquante')
requireSourcePattern('dataconnect/sosson/queries.gql', /\bquery\s+ListDocumentsAttaches\b[\s\S]*?documentAttaches[\s\S]*?sha256/, 'query ListDocumentsAttaches avec sha256 manquant')
requireSourcePattern('dataconnect/sosson/queries.gql', /\bquery\s+ListDocumentsByChantier\b[\s\S]*?where:\s*\{\s*chantierId:\s*\{\s*eq:\s*\$chantierId\s*\}/, 'query ListDocumentsByChantier sans filtre chantierId')
requireSourcePattern(
  'src/pages/DocumentsPage.tsx',
  /if\s*\(\s*document\.id\.startsWith\('sql-'\)\s*\)\s*\{[\s\S]*?if\s*\(\s*!canEditDocumentSql\s*\)\s*\{[\s\S]*?Aucun fallback local[\s\S]*?return[\s\S]*?updateDocumentAttacheLinksInSql/,
  'les documents SQL doivent refuser le classement local quand l ecriture SQL est indisponible',
)
requireSourcePattern(
  'src/pages/FacturesPage.tsx',
  /createDocumentAttacheInSql\(\{[\s\S]*?factureId:\s*facture\.id[\s\S]*?storagePath:\s*buildPendingDocumentStoragePath\(file,\s*facture\.chantierId\)[\s\S]*?sha256,[\s\S]*?typeDocument:\s*'facture'/,
  'la creation facture SQL avec fichier doit ecrire une metadata DocumentAttache liee a la facture avec storagePath pending et sha256',
)

failures.push(
  ...rejectUnexpected(
    rg('\\bcreateDocumentAttache\\b'),
    allow.directGeneratedMutation,
    'Mutation generee createDocumentAttache utilisee hors adapter documentSql',
  ),
)

failures.push(
  ...rejectUnexpected(
    rg('\\bcreateDocumentAttacheInSql\\b'),
    allow.documentSqlAdapter,
    'Adapter createDocumentAttacheInSql utilise depuis un emplacement non attendu',
  ),
)

failures.push(
  ...rejectUnexpected(
    rg('\\bstoragePath\\s*:'),
    allow.storagePathMetadata,
    'Metadata storagePath construite hors flux document controle',
  ),
)

failures.push(
  ...rejectUnexpected(
    rg('\\bbuildPendingDocumentStoragePath\\b'),
    allow.pathBuilder,
    'Builder de chemin Storage utilise hors flux document controle',
  ),
)

failures.push(
  ...rejectUnexpected(
    rg('\\bvalidatePendingDocumentStoragePath\\b'),
    allow.pathValidator,
    'Validateur de chemin Storage utilise hors adapter/tests attendus',
  ),
)

const legacyPendingPaths = rg('["\']pending/')
if (legacyPendingPaths.length > 0) {
  failures.push('Ancien prefixe Storage "pending/" detecte:', ...legacyPendingPaths.map((match) => `- ${match.raw}`))
}

if (failures.length > 0) {
  console.error('Frontiere Documents/Storage KO:')
  for (const failure of failures) console.error(failure)
  process.exit(1)
}

console.log('Frontiere Documents/Storage OK: mutation SQL, metadata storagePath/sha256 et chemins pending centralises.')
