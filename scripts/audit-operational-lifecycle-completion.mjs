import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'

const repoRoot = process.cwd()
const execFileAsync = promisify(execFile)
const proofPath = 'tmp/checkpoint-002/operational-lifecycle-local.json'
const scenarioPath = 'docs/17-operational-lifecycle-scenario.md'
const enginePath = 'src/pages/SossonEngineRoomPage.tsx'
const checkpointPath = 'scripts/checkpoint-002-emulator.mjs'
const packagePath = 'package.json'
const outputPath = 'tmp/checkpoint-002/operational-lifecycle-completion-audit.json'
const mandatoryDocPaths = [
  'AGENTS.md',
  'documentation.md',
  'docs/00-index.md',
  'docs/05-sql-connect.md',
  'docs/12-ai-agent-roadmap.md',
  'docs/13-checkpoint-002-readiness.md',
]
const frontPaths = {
  dashboard: 'src/pages/DashboardPage.tsx',
  statistiques: 'src/pages/StatistiquesPage.tsx',
  clients: 'src/pages/ClientsPage.tsx',
  chantiers: 'src/pages/ChantiersPage.tsx',
  factures: 'src/pages/FacturesPage.tsx',
  clientDetail: 'src/pages/ClientDetailPage.tsx',
  chantierDetail: 'src/pages/ChantierDetailPage.tsx',
}

async function readText(filePath) {
  return readFile(filePath, 'utf8')
}

function decisionStatus(content) {
  const rows = content
    .split('\n')
    .filter(line => /^\| [1-9] \|/.test(line))
    .map(line => {
      const [index, decision, answer] = line
        .split('|')
        .slice(1, -1)
        .map(cell => cell.trim())

      return {
        index: Number(index),
        decision,
        answered: Boolean(answer) && !/^A completer$/i.test(answer),
        answer,
      }
    })

  return {
    total: rows.length,
    answered: rows.filter(row => row.answered).length,
    missing: rows.filter(row => !row.answered),
    containsTodoMarker: /A completer/i.test(content),
  }
}

function hasAll(content, patterns) {
  return patterns.every(pattern => content.includes(pattern))
}

function hasNone(content, patterns) {
  return patterns.every(pattern => !content.includes(pattern))
}

function frontStatus(files) {
  return {
    dashboardMarksOperationalSource: hasAll(files.dashboard, [
      'operationalFacturesSourceLabel',
      'source operationnelle SQL',
      'source operationnelle fallback',
    ]),
    statistiquesMarksOperationalSource: hasAll(files.statistiques, [
      'operationalSourceLabel',
      'Operationnel SQL Connect',
      'Operationnel fallback local/Excel',
      'pas une preuve SQL',
    ]),
    clientsAvoidSilentLocalFallback: hasAll(files.clients, [
      'Creation locale hors SQL',
      "Ecriture SQL Connect impossible. Aucun client local n'a ete cree.",
    ]),
    chantiersAvoidSilentLocalFallback: hasAll(files.chantiers, [
      'Creation locale hors SQL',
      "Ecriture SQL Connect impossible. Aucun chantier local n'a ete cree.",
    ]),
    facturesAvoidSilentLocalFallback: hasAll(files.factures, [
      'Fallback local hors SQL',
      "Ecriture SQL Connect impossible. Aucune facture n'a ete creee.",
      'metadata document',
      'fichier Storage a finaliser',
    ]),
    detailPagesShowLinks: hasAll(files.clientDetail, ['Factures rattachees', 'Via chantiers SQL', 'Previsionnel Excel']) &&
      hasAll(files.chantierDetail, ['Factures rattachees au chantier', 'Factures SQL lues', 'fallback']),
  }
}

function proofStatus(proof) {
  const devis = Array.isArray(proof.created?.devis) ? proof.created.devis : []
  const factures = Array.isArray(proof.created?.factures) ? proof.created.factures : []
  const checks = proof.checks ?? {}
  const guardrails = proof.guardrails ?? {}
  const checksPassed = Object.values(checks).every(value => value === true)
  const signedDevis = devis.find(item => item.statut === 'devis_signe')
  const prospectDevis = devis.find(item => item.statut === 'devis_demande')

  return {
    mode: proof.mode,
    sandboxTouched: proof.sandboxTouched,
    productionTouched: proof.productionTouched,
    prospectClientOperational: proof.created?.prospectClient?.origineImport === 'operationnel',
    prospectWithoutChantier: proof.created?.prospectClient?.chantierCount === 0,
    clientOperational: proof.created?.client?.origineImport === 'operationnel',
    chantierOperational: proof.created?.chantier?.origineImport === 'operationnel',
    chantierLinkedToClient: proof.created?.chantier?.clientId === proof.created?.client?.id,
    devisDemandedWithoutChantier:
      Boolean(prospectDevis) &&
      prospectDevis.clientId === proof.created?.prospectClient?.id &&
      !prospectDevis.chantierId,
    devisSignedLinkedToClientAndChantier:
      Boolean(signedDevis) &&
      signedDevis.clientId === proof.created?.client?.id &&
      signedDevis.chantierId === proof.created?.chantier?.id,
    facturesLinkedToChantier: factures.length > 0 && factures.every(facture => facture.chantierId === proof.created?.chantier?.id),
    facturesDefinitiveAndCategorized:
      factures.length > 0 &&
      factures.every(facture => facture.statut === 'validee' && Boolean(facture.categorie)),
    facturesImpactRule: proof.dashboardInputsFromSql?.facturesImpactRule,
    noPrevisionnelLeaks:
      Array.isArray(guardrails.leakedPrevisionnelClientIds) &&
      guardrails.leakedPrevisionnelClientIds.length === 0 &&
      Array.isArray(guardrails.leakedPrevisionnelChantierIds) &&
      guardrails.leakedPrevisionnelChantierIds.length === 0 &&
      Array.isArray(guardrails.prefixedOperationalClientIds) &&
      guardrails.prefixedOperationalClientIds.length === 0 &&
      Array.isArray(guardrails.prefixedOperationalChantierIds) &&
      guardrails.prefixedOperationalChantierIds.length === 0,
    checksPassed,
    devisCount: devis.length,
    facturesCount: factures.length,
    generatedAt: proof.generatedAt,
  }
}

function packageStatus(packageJson) {
  const scripts = packageJson.scripts ?? {}

  return {
    verifyScript: scripts['verify:operational-lifecycle:dataconnect'] ?? null,
    readinessScript: scripts['check:operational-lifecycle-readiness'] ?? null,
    proofScript: scripts['check:operational-lifecycle-proof'] ?? null,
    decisionsScript: scripts['check:operational-lifecycle-decisions'] ?? null,
    updateDecisionsScript: scripts['update:operational-lifecycle-decisions'] ?? null,
    completionAuditScript: scripts['audit:operational-lifecycle-completion'] ?? null,
    ciIncludesReadiness: String(scripts['ci:sandbox'] ?? '').includes('check:operational-lifecycle-readiness'),
    ciExcludesDecisionGate: !String(scripts['ci:sandbox'] ?? '').includes('check:operational-lifecycle-decisions'),
    ciExcludesArtifactProof: !String(scripts['ci:sandbox'] ?? '').includes('check:operational-lifecycle-proof'),
  }
}

async function generatedSdkStatus() {
  try {
    const [{ stdout }, frontSdk, adminSdk] = await Promise.all([
      execFileAsync('git', [
        'status',
        '--short',
        'src/dataconnect-generated',
        'src/dataconnect-admin-generated',
      ]),
      readText('src/dataconnect-generated/index.d.ts'),
      readText('src/dataconnect-admin-generated/index.d.ts'),
    ])

    return {
      clean: stdout.trim().length === 0,
      status: stdout.trim(),
      containsDevisOperations:
        frontSdk.includes('CreateDevis') &&
        frontSdk.includes('ListDevis') &&
        adminSdk.includes('CreateDevis') &&
        adminSdk.includes('ListDevis'),
      error: null,
    }
  } catch (error) {
    return {
      clean: false,
      status: '',
      containsDevisOperations: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

const [proofRaw, scenario, engine, checkpoint, packageRaw, ...docAndFrontContents] = await Promise.all([
  readText(proofPath),
  readText(scenarioPath),
  readText(enginePath),
  readText(checkpointPath),
  readText(packagePath),
  ...mandatoryDocPaths.map(readText),
  ...Object.values(frontPaths).map(readText),
])

const proof = JSON.parse(proofRaw)
const packageJson = JSON.parse(packageRaw)
const decisions = decisionStatus(scenario)
const proofAudit = proofStatus(proof)
const scripts = packageStatus(packageJson)
const mandatoryDocs = Object.fromEntries(
  mandatoryDocPaths.map((filePath, index) => [filePath, docAndFrontContents[index]]),
)
const frontStartIndex = mandatoryDocPaths.length
const frontFiles = Object.fromEntries(
  Object.entries(frontPaths).map(([key, filePath], index) => [key, docAndFrontContents[frontStartIndex + index]]),
)
const front = frontStatus(frontFiles)
const generatedSdk = await generatedSdkStatus()
const packageRawLower = packageRaw.toLowerCase()
const mandatoryDocsPresent = Object.values(mandatoryDocs).every(content => content.trim().length > 100)
const forbiddenCommandsAbsent =
  hasNone(packageRawLower, ['firebase init dataconnect', 'sosson-prod']) &&
  !/deploy[^"]*prod/i.test(packageRaw)

const checklist = [
  {
    requirement: 'Docs obligatoires presentes pour reprise avant codage',
    evidence: mandatoryDocPaths,
    passed: mandatoryDocsPresent,
  },
  {
    requirement: 'Parcours prospect/client -> devis -> chantier -> factures prouve en SQL local',
    evidence: proofPath,
    passed:
      proofAudit.mode === 'local-emulator' &&
      proofAudit.prospectClientOperational &&
      proofAudit.prospectWithoutChantier &&
      proofAudit.clientOperational &&
      proofAudit.chantierOperational &&
      proofAudit.chantierLinkedToClient &&
      proofAudit.devisDemandedWithoutChantier &&
      proofAudit.devisSignedLinkedToClientAndChantier &&
      proofAudit.facturesLinkedToChantier &&
      proofAudit.facturesDefinitiveAndCategorized &&
      proofAudit.facturesImpactRule === 'all_imported_supplier_invoices' &&
      proofAudit.checksPassed,
  },
  {
    requirement: 'Aucune action sandbox ou production',
    evidence: proofPath,
    passed: proofAudit.sandboxTouched === false && proofAudit.productionTouched === false,
  },
  {
    requirement: 'Aucun prev-client-* ou prev-chantier-* traite comme operationnel actif',
    evidence: proofPath,
    passed: proofAudit.noPrevisionnelLeaks,
  },
  {
    requirement: 'Scenario lifecycle integre au checkpoint emulateur',
    evidence: checkpointPath,
    passed: checkpoint.includes('verify:operational-lifecycle:dataconnect'),
  },
  {
    requirement: 'Moteur live expose une visualisation metier et les blocages sandbox',
    evidence: enginePath,
    passed: hasAll(engine, ['Explorateur metier', 'Decisions qui cadrent la sandbox', 'Domaine Devis separe', 'Sandbox distante non prouvee ici']),
  },
  {
    requirement: 'Gate decisions metier present et separe de la CI',
    evidence: packagePath,
    passed: Boolean(scripts.decisionsScript) && scripts.ciExcludesDecisionGate,
  },
  {
    requirement: 'Outil local disponible pour appliquer les 9 reponses metier sans action sandbox',
    evidence: packagePath,
    passed: Boolean(scripts.updateDecisionsScript) && scripts.ciExcludesDecisionGate,
  },
  {
    requirement: 'SDKs Data Connect regeneres par commande officielle apres ajout Devis',
    evidence: 'firebase dataconnect:sdk:generate',
    passed: generatedSdk.containsDevisOperations,
  },
  {
    requirement: 'Scripts interdits absents de package.json',
    evidence: packagePath,
    passed: forbiddenCommandsAbsent,
  },
  {
    requirement: 'Dashboard et Statistiques marquent SQL vs fallback',
    evidence: [frontPaths.dashboard, frontPaths.statistiques],
    passed: front.dashboardMarksOperationalSource && front.statistiquesMarksOperationalSource,
  },
  {
    requirement: 'Clients, Chantiers et Factures evitent une creation locale silencieuse quand SQL echoue',
    evidence: [frontPaths.clients, frontPaths.chantiers, frontPaths.factures],
    passed:
      front.clientsAvoidSilentLocalFallback &&
      front.chantiersAvoidSilentLocalFallback &&
      front.facturesAvoidSilentLocalFallback,
  },
  {
    requirement: 'Details client/chantier affichent les rattachements et sources SQL/fallback/previsionnel',
    evidence: [frontPaths.clientDetail, frontPaths.chantierDetail],
    passed: front.detailPagesShowLinks,
  },
  {
    requirement: 'Les 9 reponses metier sont completees',
    evidence: scenarioPath,
    passed: decisions.total === 9 && decisions.answered === 9 && !decisions.containsTodoMarker,
  },
]

const blockers = checklist.filter(item => !item.passed)
const audit = {
  generatedAt: new Date().toISOString(),
  mode: 'local-audit',
  mutatesData: false,
  sandboxTouched: false,
  productionTouched: false,
  objective:
    'Valider localement le scenario nouveau client operationnel SQL, preparer la visualisation des liens metier et determiner si Sosson est pret a demander validation sandbox.',
  verdict: blockers.length === 0 ? 'ready-to-request-sandbox-validation' : 'not-ready',
  proof: proofAudit,
  decisions,
  scripts,
  generatedSdk,
  front,
  checklist,
  blockers,
  nextRequiredAction:
    blockers.length === 0
      ? 'Demander validation humaine avant toute action sandbox reelle.'
      : 'Completer les 9 reponses metier, relancer check:operational-lifecycle-decisions puis checkpoint:002:emulator si le parcours change.',
}

const resolved = path.resolve(repoRoot, outputPath)
await mkdir(path.dirname(resolved), { recursive: true })
await writeFile(resolved, `${JSON.stringify(audit, null, 2)}\n`, 'utf8')

console.log(`Audit completion lifecycle ecrit dans ${outputPath}`)
console.log(`Verdict: ${audit.verdict}`)
if (blockers.length > 0) {
  console.log('Blocages:')
  for (const blocker of blockers) console.log(`- ${blocker.requirement}`)
}
