import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'

const npmInvocation = process.platform === 'win32'
  ? { command: process.env.ComSpec ?? 'cmd.exe', prefixArgs: ['/d', '/s', '/c', 'npm'] }
  : { command: 'npm', prefixArgs: [] }

const commands = [
  {
    label: 'Seed operationnel Data Connect local',
    args: ['run', 'seed:dataconnect'],
  },
  {
    label: 'Seed previsionnel Data Connect local',
    args: ['run', 'seed:previsionnel:dataconnect'],
  },
  {
    label: 'Verification seed operationnel local',
    args: ['run', 'verify:dataconnect'],
  },
  {
    label: 'Verification seed previsionnel local',
    args: ['run', 'verify:previsionnel:dataconnect'],
  },
  {
    label: 'Verification frontiere operationnel/previsionnel locale',
    args: [
      'run',
      'verify:operational-boundary:dataconnect',
      '--',
      '--output=tmp/checkpoint-002/operational-boundary-local.json',
    ],
  },
  {
    label: 'Verification statut chantier SQL local',
    args: [
      'run',
      'verify:chantier-status:dataconnect',
      '--',
      '--output=tmp/checkpoint-002/chantier-status-local.json',
    ],
  },
  {
    label: 'Verification edition client SQL locale',
    args: [
      'run',
      'verify:client-update:dataconnect',
      '--',
      '--output=tmp/checkpoint-002/client-update-local.json',
    ],
  },
  {
    label: 'Verification profils SQL User et onboarding locaux',
    args: ['run', 'verify:team-users:dataconnect'],
  },
  {
    label: 'Verification RH equipe SQL locale',
    args: ['run', 'verify:team-rh:dataconnect'],
  },
  {
    label: 'Verification email SQL local',
    args: ['run', 'verify:email:dataconnect'],
  },
  {
    label: 'Verification planning SQL local',
    args: ['run', 'verify:planning:dataconnect'],
  },
  {
    label: 'Verification rapports SQL local',
    args: ['run', 'verify:reports:dataconnect'],
  },
  {
    label: 'Comptage Data Connect local propre archivable',
    args: ['run', 'count:dataconnect', '--', '--output=tmp/checkpoint-002/counts-local.json'],
    validateCounts: true,
  },
  {
    label: 'Snapshot analytics SQL local',
    args: ['run', 'snapshot:analytics:dataconnect'],
  },
  {
    label: 'Verification edition previsionnel SQL locale',
    args: [
      'run',
      'verify:previsionnel-edits:dataconnect',
      '--',
      '--output=tmp/checkpoint-002/previsionnel-edits-local.json',
    ],
  },
  {
    label: 'Verification factures SQL locale',
    args: [
      'run',
      'verify:factures:dataconnect',
      '--',
      '--output=tmp/checkpoint-002/factures-local.json',
    ],
  },
  {
    label: 'Verification cycle operationnel client chantier facture SQL local',
    args: [
      'run',
      'verify:operational-lifecycle:dataconnect',
      '--',
      '--output=tmp/checkpoint-002/operational-lifecycle-local.json',
    ],
  },
  {
    label: 'Verification documents SQL local',
    args: ['run', 'verify:documents:dataconnect'],
  },
  {
    label: 'Verification RBAC Data Connect local',
    args: ['run', 'verify:dataconnect:rbac'],
  },
  {
    label: 'Trace SQL checkpoint/audit locale',
    args: ['run', 'verify:checkpoint-audit:dataconnect'],
  },
]

function runCommand({ label, args }) {
  return new Promise((resolve, reject) => {
    const fullArgs = [...npmInvocation.prefixArgs, ...args]
    console.log(`\n== ${label}`)
    console.log(`$ npm ${args.join(' ')}`)

    const child = spawn(npmInvocation.command, fullArgs, { stdio: 'inherit' })

    child.on('error', reject)
    child.on('exit', code => {
      if (code === 0) resolve()
      else reject(new Error(`${label} a echoue avec le code ${code}.`))
    })
  })
}

async function validateCleanLocalCounts() {
  const raw = await readFile('tmp/checkpoint-002/counts-local.json', 'utf8')
  const counts = JSON.parse(raw)
  const actual = {
    clients: counts.operationalTables?.clients,
    chantiers: counts.operationalTables?.chantiers,
    factures: counts.operationalTables?.factures,
    devis: counts.operationalTables?.devis,
    documentFolders: counts.documents?.folders,
    documentAttaches: counts.documents?.attaches,
    previsionnelExercises: counts.previsionnel?.exercises,
    previsionnelLines: counts.previsionnel?.loadedLinesViaQuery,
    lineQueryMayBeTruncated: counts.previsionnel?.lineQueryMayBeTruncated,
  }
  const expected = {
    clients: 3,
    chantiers: 4,
    factures: 12,
    devis: 0,
    documentFolders: 0,
    documentAttaches: 0,
    previsionnelExercises: 13,
    previsionnelLines: 898,
    lineQueryMayBeTruncated: false,
  }

  const mismatches = Object.entries(expected)
    .filter(([key, value]) => actual[key] !== value)
    .map(([key, value]) => `${key}: attendu ${value}, obtenu ${actual[key]}`)

  if (mismatches.length > 0) {
    console.error('\nComptage local non propre avant verification RBAC.')
    console.error('L emulateur Data Connect local contient probablement des lignes creees par une verification RBAC precedente.')
    console.error('Arreter l emulateur, lancer npm run reset:dataconnect:local -- --yes-local-reset, puis relancer npm run checkpoint:002:emulator.')
    console.error(`Ecarts:\n- ${mismatches.join('\n- ')}`)
    process.exit(1)
  }
}

console.log('Verification checkpoint 002 avec emulateur SQL Connect local.')
console.log('Cette commande ne touche pas a la sandbox distante.')
console.log('Pre-requis: lancer npm run emulators:dataconnect dans un autre terminal.')

for (const item of commands) {
  await runCommand(item)
  if (item.validateCounts) {
    await validateCleanLocalCounts()
  }
}

console.log('\nVerification checkpoint 002 emulateur OK.')
console.log('Preuves locales ecrites dans tmp/checkpoint-002/counts-local.json, tmp/checkpoint-002/operational-boundary-local.json, tmp/checkpoint-002/chantier-status-local.json, tmp/checkpoint-002/client-update-local.json, tmp/checkpoint-002/team-users-local.json, tmp/checkpoint-002/team-rh-local.json, tmp/checkpoint-002/email-local.json, tmp/checkpoint-002/previsionnel-edits-local.json, tmp/checkpoint-002/factures-local.json, tmp/checkpoint-002/operational-lifecycle-local.json, tmp/checkpoint-002/documents-local.json, tmp/checkpoint-002/planning-local.json, tmp/checkpoint-002/report-local.json, tmp/checkpoint-002/analytics-snapshot-local.json et tmp/checkpoint-002/checkpoint-audit-local.json. La preuve team-users couvre aussi SubmitCurrentTeamProfile -> profile-pending -> ConvertTeamProfileSubmission -> User SQL; la preuve team-rh couvre equipes finales, fiches membres, conges, heures, preparation paie, affectation planning sossonTeamId, fiche intervention PlanningJobSheet et heures rattachees.')
