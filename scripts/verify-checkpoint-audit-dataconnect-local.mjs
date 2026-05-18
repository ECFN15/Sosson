import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import {
  connectorConfig,
  createAuditEvent,
  createCheckpointArtifact,
  createCheckpointDecision,
  createCheckpointRun,
  createCheckpointStep,
  createDataImportIssue,
  createDataImportRun,
  createEntityChangeLog,
  getCheckpointRun,
  getDataImportRun,
  listEntityChangeLogs,
  listRecentAuditEvents,
} from '@dataconnect/admin-generated'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399
const repoRoot = process.cwd()
const outputArg = process.argv.find(arg => arg.startsWith('--output='))
const outputPath = outputArg?.slice('--output='.length) || 'tmp/checkpoint-002/checkpoint-audit-local.json'

process.env.DATA_CONNECT_EMULATOR_HOST ??= `${EMULATOR_HOST}:${EMULATOR_PORT}`

function isPortOpen(host, port) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host, port })
    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.once('error', () => resolve(false))
    socket.setTimeout(1000, () => {
      socket.destroy()
      resolve(false)
    })
  })
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function impersonate(uid, email) {
  return {
    impersonate: {
      authClaims: {
        sub: uid,
        uid,
        email,
        email_verified: true,
      },
    },
  }
}

async function writeOutput(payload) {
  const resolved = path.resolve(repoRoot, outputPath)
  const relative = path.relative(repoRoot, resolved)

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('--output doit rester dans le repo.')
  }

  if (!relative.startsWith(`tmp${path.sep}`)) {
    throw new Error('--output doit pointer sous tmp/ pour eviter de committer des preuves locales par accident.')
  }

  await mkdir(path.dirname(resolved), { recursive: true })
  await writeFile(resolved, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.error(`Preuve checkpoint/audit locale ecrite dans ${relative}`)
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

if (!(await isPortOpen(EMULATOR_HOST, EMULATOR_PORT))) {
  console.error(
    `SQL Connect emulator is not reachable at ${EMULATOR_HOST}:${EMULATOR_PORT}.\n` +
      'Start it first with: npm run emulators:dataconnect',
  )
  process.exit(1)
}

if (getApps().length === 0) {
  initializeApp({ projectId: 'sosson-sandbox' })
}

const dc = getDataConnect(connectorConfig)
const actor = {
  id: 'checkpoint-audit-local',
  email: 'checkpoint.audit@sosson.local',
  nom: 'Checkpoint',
  prenom: 'Audit',
  role: 'gerant',
  avatar: 'CA',
}
const options = impersonate(actor.id, actor.email)
const startedAt = new Date()
const stamp = startedAt.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
const evidencePath = `tmp/checkpoint-002/checkpoint-audit-local-${stamp}.json`
const evidenceHash = sha256(`checkpoint-audit-local:${stamp}`)

await dc.upsert('User', actor)

const runResponse = await createCheckpointRun(
  dc,
  {
    environment: 'local-emulator',
    checkpointKey: `checkpoint-audit-local-${stamp}`,
    title: 'Verification locale SQL checkpoint/audit',
    status: 'passed',
    finishedAt: new Date().toISOString(),
    commitSha: null,
    sourceBranch: null,
    command: 'npm run verify:checkpoint-audit:dataconnect',
    actorEmail: actor.email,
    summary: 'Ecriture puis relecture locale des tables checkpoint/audit/import.',
  },
  options,
)
const runId = runResponse.data.checkpointRun_insert.id

const stepResponse = await createCheckpointStep(
  dc,
  {
    runId,
    stepKey: 'write-read-checkpoint-audit',
    label: 'Ecrire et relire la trace checkpoint/audit',
    status: 'passed',
    command: 'npm run verify:checkpoint-audit:dataconnect',
    exitCode: 0,
    durationMs: 1,
    startedAt: startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
    logPath: evidencePath,
    logHash: evidenceHash,
    message: 'Trace creee par verification locale Data Connect emulator.',
  },
  options,
)
const stepId = stepResponse.data.checkpointStep_insert.id

const artifactResponse = await createCheckpointArtifact(
  dc,
  {
    runId,
    stepId,
    artifactType: 'json-proof',
    path: evidencePath,
    storagePath: null,
    sha256: evidenceHash,
    sizeBytes: null,
    mimeType: 'application/json',
    description: 'Preuve locale ecrite sous tmp/, pas un artefact sandbox.',
  },
  options,
)
const artifactId = artifactResponse.data.checkpointArtifact_insert.id

const decisionResponse = await createCheckpointDecision(
  dc,
  {
    runId,
    decisionType: 'local-verification',
    status: 'recorded',
    decidedByEmail: actor.email,
    decisionText: 'Validation locale technique uniquement; aucune validation sandbox.',
    validationPhraseHash: null,
  },
  options,
)
const decisionId = decisionResponse.data.checkpointDecision_insert.id

const importRunResponse = await createDataImportRun(
  dc,
  {
    environment: 'local-emulator',
    importKind: 'checkpoint-audit-proof',
    sourceName: 'verify-checkpoint-audit-dataconnect-local.mjs',
    sourcePath: 'scripts/verify-checkpoint-audit-dataconnect-local.mjs',
    sourceHash: sha256('scripts/verify-checkpoint-audit-dataconnect-local.mjs'),
    status: 'passed',
    finishedAt: new Date().toISOString(),
    rowCount: 1,
    insertedCount: 1,
    updatedCount: 0,
    skippedCount: 0,
    artifactPath: evidencePath,
    artifactHash: evidenceHash,
    actorEmail: actor.email,
    notes: 'Trace locale pour prouver le modele DataImportRun/DataImportIssue.',
    previsionnelBatchId: null,
  },
  options,
)
const importRunId = importRunResponse.data.dataImportRun_insert.id

const importIssueResponse = await createDataImportIssue(
  dc,
  {
    runId: importRunId,
    severity: 'info',
    code: 'LOCAL_TRACE_CREATED',
    entityType: 'CheckpointRun',
    entityKey: runId,
    sourceSheet: null,
    sourceRow: null,
    message: 'Anomalie informative pour valider la table DataImportIssue.',
    resolutionStatus: 'not_applicable',
  },
  options,
)
const importIssueId = importIssueResponse.data.dataImportIssue_insert.id

const auditResponse = await createAuditEvent(
  dc,
  {
    environment: 'local-emulator',
    eventType: 'checkpoint_verification',
    severity: 'info',
    entityType: 'CheckpointRun',
    entityId: runId,
    action: 'create_and_read',
    status: 'passed',
    actorEmail: actor.email,
    source: 'verify-checkpoint-audit-dataconnect-local',
    message: 'Verification locale des tables checkpoint/audit/import.',
    evidencePath,
    evidenceHash,
  },
  options,
)
const auditEventId = auditResponse.data.auditEvent_insert.id

const changeLogResponse = await createEntityChangeLog(
  dc,
  {
    environment: 'local-emulator',
    entityType: 'CheckpointRun',
    entityId: runId,
    action: 'create',
    source: 'verify-checkpoint-audit-dataconnect-local',
    actorEmail: actor.email,
    beforeHash: null,
    afterHash: evidenceHash,
    reason: 'Verification locale de tracabilite SQL.',
    auditEventId,
    checkpointRunId: runId,
    dataImportRunId: importRunId,
  },
  options,
)
const changeLogId = changeLogResponse.data.entityChangeLog_insert.id

const [checkpointRead, importRead, recentAudits, changeLogs] = await Promise.all([
  getCheckpointRun(dc, { id: runId }, options),
  getDataImportRun(dc, { id: importRunId }, options),
  listRecentAuditEvents(dc, { environment: 'local-emulator' }, options),
  listEntityChangeLogs(
    dc,
    {
      environment: 'local-emulator',
      entityType: 'CheckpointRun',
      entityId: runId,
    },
    options,
  ),
])

const checkpoint = checkpointRead.data.checkpointRun
const dataImport = importRead.data.dataImportRun

assert(checkpoint?.id === runId, 'CheckpointRun relu introuvable.')
assert(checkpoint.steps.some(step => step.id === stepId), 'CheckpointStep relu introuvable.')
assert(checkpoint.artifacts.some(artifact => artifact.id === artifactId), 'CheckpointArtifact relu introuvable.')
assert(checkpoint.decisions.some(decision => decision.id === decisionId), 'CheckpointDecision relue introuvable.')
assert(dataImport?.id === importRunId, 'DataImportRun relu introuvable.')
assert(dataImport.issues.some(issue => issue.id === importIssueId), 'DataImportIssue relue introuvable.')
assert(recentAudits.data.auditEvents.some(event => event.id === auditEventId), 'AuditEvent relu introuvable.')
assert(changeLogs.data.entityChangeLogs.some(change => change.id === changeLogId), 'EntityChangeLog relu introuvable.')

const payload = {
  mode: 'local-emulator',
  mutatesData: true,
  generatedAt: new Date().toISOString(),
  runId,
  stepId,
  artifactId,
  decisionId,
  importRunId,
  importIssueId,
  auditEventId,
  changeLogId,
  readBack: {
    checkpointSteps: checkpoint.steps.length,
    checkpointArtifacts: checkpoint.artifacts.length,
    checkpointDecisions: checkpoint.decisions.length,
    dataImportIssues: dataImport.issues.length,
    recentAuditEvents: recentAudits.data.auditEvents.length,
    entityChangeLogsForRun: changeLogs.data.entityChangeLogs.length,
  },
}

await writeOutput(payload)
console.log(JSON.stringify(payload, null, 2))
