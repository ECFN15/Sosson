import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const queriesPath = path.join(repoRoot, 'dataconnect/sosson/queries.gql')
const source = fs.readFileSync(queriesPath, 'utf8')

const failures = []

function getQuery(name) {
  const match = source.match(new RegExp(`query\\s+${name}\\b[\\s\\S]*?(?=\\nquery\\s+\\w+\\b|\\n# ----------|$)`))
  return match?.[0] ?? ''
}

function requireQuery(name) {
  const query = getQuery(name)
  if (!query) failures.push(`Query manquante: ${name}`)
  return query
}

function requireAuth(name) {
  const query = requireQuery(name)
  if (query && !query.includes('@auth(')) failures.push(`${name}: @auth manquant`)
}

function requireLimit(name, max) {
  const query = requireQuery(name)
  const match = query.match(/limit:\s*(\d+)/)
  if (!match) {
    failures.push(`${name}: limit serveur manquant`)
    return
  }

  const value = Number(match[1])
  if (!Number.isFinite(value) || value > max) {
    failures.push(`${name}: limit ${value} superieur au plafond attendu ${max}`)
  }
}

function requirePattern(name, pattern, label) {
  const query = requireQuery(name)
  if (query && !pattern.test(query)) failures.push(`${name}: ${label}`)
}

function requireSqlUserRoleCheck(name, roles) {
  const query = requireQuery(name)
  if (!query) return

  if (!/currentUser:\s*user\(key:\s*\{\s*id_expr:\s*"auth\.uid"\s*\}/.test(query)) {
    failures.push(`${name}: lecture RBAC du User SQL courant manquante`)
  }

  if (!/role\s+@check\(expr:\s*"this in \[/.test(query)) {
    failures.push(`${name}: check role serveur manquant`)
    return
  }

  for (const role of roles) {
    if (!query.includes(`'${role}'`)) failures.push(`${name}: role ${role} absent du check serveur`)
  }
}

const queryNames = Array.from(source.matchAll(/\bquery\s+([A-Za-z0-9_]+)/g), match => match[1])
for (const name of queryNames) requireAuth(name)

const broadListLimits = new Map([
  ['ListUsers', 100],
  ['ListOperationalClients', 1000],
  ['ListOperationalChantiers', 1200],
  ['ListDevis', 1000],
  ['ListFactures', 1000],
  ['ListDocumentFolders', 500],
  ['ListDocumentsAttaches', 1000],
  ['ListPrevisionnelLinesByExercise', 300],
  ['ListPrevisionnelCellEdits', 10000],
  ['ListPlanningJobSheetsByEvent', 50],
])

for (const [name, max] of broadListLimits) requireLimit(name, max)

requirePattern('ListPrevisionnelLinesByExercise', /where:\s*\{\s*exerciseId:\s*\{\s*eq:\s*\$exerciseId\s*\}/, 'filtre exerciseId serveur manquant')
requirePattern('ListDocumentsByChantier', /where:\s*\{\s*chantierId:\s*\{\s*eq:\s*\$chantierId\s*\}/, 'filtre chantierId serveur manquant')
requirePattern('GetCurrentUser', /id_expr:\s*"auth\.uid"/, 'lecture utilisateur courant non bornee a auth.uid')
requirePattern('ListOperationalClients', /where:\s*\{\s*origineImport:\s*\{\s*eq:\s*"operationnel"\s*\}/, 'filtre origineImport operationnel manquant')
requirePattern('ListOperationalChantiers', /where:\s*\{\s*origineImport:\s*\{\s*eq:\s*"operationnel"\s*\}/, 'filtre origineImport operationnel manquant')

requireSqlUserRoleCheck('ListUsers', ['gerant', 'assistante', 'chef_chantier'])
requireSqlUserRoleCheck('ListTeamProfileSubmissions', ['gerant'])
requireSqlUserRoleCheck('ListSossonTeams', ['gerant', 'assistante', 'chef_chantier'])
requireSqlUserRoleCheck('ListSossonWorkTimeEntries', ['gerant', 'assistante', 'chef_chantier'])
requireSqlUserRoleCheck('ListSossonPayrollPeriods', ['gerant', 'assistante'])
requireSqlUserRoleCheck('ListPlanningEventsByPeriod', ['gerant', 'assistante', 'chef_chantier'])
requireSqlUserRoleCheck('ListPlanningEventsByChantier', ['gerant', 'assistante', 'chef_chantier'])
requireSqlUserRoleCheck('ListPlanningJobSheetsByEvent', ['gerant', 'assistante', 'chef_chantier'])

if (failures.length > 0) {
  console.error('Garde-fou queries SQL Connect KO:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Garde-fous queries SQL Connect OK: ${queryNames.length} query(s) auditee(s).`)
