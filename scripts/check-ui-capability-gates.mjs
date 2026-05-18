import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()

const expectations = [
  {
    file: 'src/pages/ClientsPage.tsx',
    page: 'clients',
    capabilities: ['create'],
    sqlWriteBoundary: {
      adapter: 'createClientInSql',
      fallbackWarning: 'Ce fallback ne prouve pas une ecriture SQL.',
      sqlFailure: "Aucun client local n'a ete cree.",
    },
  },
  {
    file: 'src/pages/ChantiersPage.tsx',
    page: 'chantiers',
    capabilities: ['create'],
    sqlWriteBoundary: {
      adapter: 'createChantierInSql',
      fallbackWarning: 'Ce fallback ne prouve pas une ecriture SQL.',
      sqlFailure: "Aucun chantier local n'a ete cree.",
    },
  },
  {
    file: 'src/pages/FacturesPage.tsx',
    page: 'factures',
    capabilities: ['create', 'edit'],
    sqlWriteBoundary: {
      adapter: 'createFactureInSql',
      additionalAdapters: ['setFactureStatutInSql'],
      fallbackWarning: 'fallback local',
      sqlFailure: "Aucune facture n'a ete creee.",
    },
  },
  {
    file: 'src/pages/DocumentsPage.tsx',
    page: 'documents',
    capabilities: ['create', 'edit'],
  },
  {
    file: 'src/pages/EquipePage.tsx',
    page: 'equipe',
    capabilities: ['create', 'edit', 'admin'],
  },
]

const failures = []

for (const expectation of expectations) {
  const absolutePath = path.join(repoRoot, expectation.file)
  const source = fs.readFileSync(absolutePath, 'utf8')

  if (!source.includes('canAccessPage')) {
    failures.push(`${expectation.file}: canAccessPage absent`)
    continue
  }

  for (const capability of expectation.capabilities) {
    const pattern = new RegExp(`canAccessPage\\([^\\n]+['"]${expectation.page}['"][^\\n]+['"]${capability}['"]`)
    if (!pattern.test(source)) {
      failures.push(`${expectation.file}: garde ${expectation.page}.${capability} absent`)
    }
  }

  if (expectation.sqlWriteBoundary) {
    const canWriteSqlPattern = /canWriteSql\s*=\s*operationalSource\s*===\s*['"]dataconnect['"][^\n]*isDataConnectEnabled[^\n]*Boolean\(user\)/
    if (!canWriteSqlPattern.test(source)) {
      failures.push(`${expectation.file}: canWriteSql doit exiger source SQL, Data Connect actif et utilisateur connecte`)
    }

    if (!source.includes(expectation.sqlWriteBoundary.adapter)) {
      failures.push(`${expectation.file}: adapter SQL ${expectation.sqlWriteBoundary.adapter} absent`)
    }

    for (const adapter of expectation.sqlWriteBoundary.additionalAdapters ?? []) {
      if (!source.includes(adapter)) {
        failures.push(`${expectation.file}: adapter SQL ${adapter} absent`)
      }
    }

    if (!source.includes(expectation.sqlWriteBoundary.fallbackWarning)) {
      failures.push(`${expectation.file}: libelle fallback explicite absent`)
    }

    if (!source.includes(expectation.sqlWriteBoundary.sqlFailure)) {
      failures.push(`${expectation.file}: message d echec SQL sans creation locale absent`)
    }
  }
}

const engineRoomSource = fs.readFileSync(path.join(repoRoot, 'src/pages/SossonEngineRoomPage.tsx'), 'utf8')
if (engineRoomSource.includes('SQL Connect pilote le flux affiche')) {
  failures.push('src/pages/SossonEngineRoomPage.tsx: libelle trop affirmatif "SQL Connect pilote le flux affiche"')
}
if (!engineRoomSource.includes('cela ne prouve pas une sandbox distante seedee')) {
  failures.push('src/pages/SossonEngineRoomPage.tsx: avertissement sandbox distante seedee absent')
}
if (!engineRoomSource.includes('Ce n est pas un comptage sandbox distant')) {
  failures.push('src/pages/SossonEngineRoomPage.tsx: avertissement comptage sandbox distant absent')
}

const chantierDetailSource = fs.readFileSync(path.join(repoRoot, 'src/pages/ChantierDetailPage.tsx'), 'utf8')
const chantierDetailExpectations = [
  'useOperationalData',
  'updateChantierStatutInSql',
  'SQL lu par le front',
  'Fallback non verite SQL',
  'Mutation SQL disponible',
  'UpdateChantierStatut',
  'Aucun fallback local silencieux',
  "Ce n'est pas un comptage sandbox distant",
  'Cela ne prouve aucune donnee presente en SQL sandbox',
  'Documents: exemples locaux',
  'Planning: apercu statique',
]

for (const expected of chantierDetailExpectations) {
  if (!chantierDetailSource.includes(expected)) {
    failures.push(`src/pages/ChantierDetailPage.tsx: garde source manquant "${expected}"`)
  }
}

const clientDetailSource = fs.readFileSync(path.join(repoRoot, 'src/pages/ClientDetailPage.tsx'), 'utf8')
const clientDetailExpectations = [
  'useOperationalData',
  'updateClientInSql',
  'SQL lu par le front',
  'Fallback non verite SQL',
  'Mutation SQL disponible',
  'Aucun fallback local silencieux',
  "Ce n'est pas un comptage sandbox distant",
  'Cela ne prouve aucune donnee presente en SQL sandbox',
  'Previsionnel Excel rattache',
  'ne transforment pas les chantiers historiques en chantiers operationnels actifs',
]

for (const expected of clientDetailExpectations) {
  if (!clientDetailSource.includes(expected)) {
    failures.push(`src/pages/ClientDetailPage.tsx: garde source manquant "${expected}"`)
  }
}

if (failures.length > 0) {
  console.error('Garde-fous UI capacites KO:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Garde-fous UI capacites OK: ${expectations.length} page(s) auditee(s) + fiches client/chantier.`)
