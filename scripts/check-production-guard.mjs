import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const findings = []

const packageJson = JSON.parse(await readFile('package.json', 'utf8'))
const scripts = packageJson.scripts ?? {}

for (const [name, command] of Object.entries(scripts)) {
  const deploysFirebase = /\bfirebase\s+deploy\b/.test(command)
  const initializesDataConnect = /\bfirebase\s+init\s+dataconnect\b/.test(command)
  const destructiveCommand = /\b(firebase|gcloud)\b[^\n&|;]*\b(delete|destroy)\b|\b(drop|truncate|reset)\b/i.test(command)
  const allowedLocalReset = name === 'reset:dataconnect:local' &&
    command === 'node scripts/reset-dataconnect-emulator-local.mjs'
  const targetsProd = /sosson-prod|--project\s+prod\b|firebase\s+use\s+prod\b/.test(command)
  const isExplicitLocalProdBuild = name === 'build:prod' || name === 'dev:prod'

  if (deploysFirebase) {
    findings.push(`package.json script "${name}" lance firebase deploy; utiliser un runbook humain sandbox.`)
  }

  if (initializesDataConnect) {
    findings.push(`package.json script "${name}" lance firebase init dataconnect; ne jamais reinitialiser Data Connect.`)
  }

  if (destructiveCommand && !allowedLocalReset) {
    findings.push(`package.json script "${name}" contient une commande potentiellement destructive: ${command}`)
  }

  if (targetsProd && !isExplicitLocalProdBuild) {
    findings.push(`package.json script "${name}" cible la production: ${command}`)
  }

  if (name === 'ci:sandbox' && /build:prod|dev:prod|sosson-prod|firebase\s+deploy/.test(command)) {
    findings.push('package.json script "ci:sandbox" ne doit jamais cibler production ni deployer.')
  }
}

async function listFiles(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    const files = await Promise.all(entries.map(entry => {
      const child = path.join(dir, entry.name)
      if (entry.isDirectory()) return listFiles(child)
      return [child]
    }))
    return files.flat()
  } catch {
    return []
  }
}

const workflowFiles = await listFiles('.github/workflows')
let sandboxWorkflowHasLocalCi = false

for (const file of workflowFiles) {
  const content = await readFile(file, 'utf8')
  if (file.replaceAll('\\', '/').endsWith('.github/workflows/sandbox-checks.yml') && /npm\s+run\s+ci:sandbox/.test(content)) {
    sandboxWorkflowHasLocalCi = true
  }
  if (/\bfirebase\s+deploy\b/.test(content)) {
    findings.push(`${file}: workflow ne doit pas deployer Firebase.`)
  }
  if (/\bfirebase\s+init\s+dataconnect\b/.test(content)) {
    findings.push(`${file}: workflow ne doit pas lancer firebase init dataconnect.`)
  }
  if (/\b(firebase|gcloud)\b[^\n&|;]*\b(delete|destroy)\b|\b(drop|truncate|reset)\b/i.test(content)) {
    findings.push(`${file}: workflow contient une commande potentiellement destructive.`)
  }
  if (/sosson-prod|--project\s+prod\b|build:prod|dev:prod/.test(content)) {
    findings.push(`${file}: workflow ne doit pas cibler la production.`)
  }
}

if (!sandboxWorkflowHasLocalCi) {
  findings.push('.github/workflows/sandbox-checks.yml: le workflow sandbox doit executer npm run ci:sandbox pour rester aligne avec la CI locale.')
}

let dashboardContent = ''
try {
  dashboardContent = await readFile('deploy/dashboard.mjs', 'utf8')
} catch {
  dashboardContent = ''
}

if (dashboardContent) {
  if (!dashboardContent.includes('ALLOW_PRODUCTION_DASHBOARD')) {
    findings.push('deploy/dashboard.mjs: les actions production interactives doivent rester bloquees par ALLOW_PRODUCTION_DASHBOARD.')
  }
  if (!/blockProductionDashboardAction/.test(dashboardContent)) {
    findings.push('deploy/dashboard.mjs: garde-fou production interactif manquant.')
  }
}

if (findings.length) {
  console.error('Garde-fous production non respectes:')
  for (const finding of findings) console.error(`- ${finding}`)
  process.exit(1)
}

console.log('Garde-fous production OK: aucun deploy prod automatise, aucun firebase init dataconnect, aucune commande destructive distante automatisee; seul le reset pglite local borne est autorise; dashboard production bloque par defaut.')
