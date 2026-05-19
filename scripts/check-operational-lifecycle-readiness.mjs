import { readFile } from 'node:fs/promises'

const files = {
  scenario: 'docs/17-operational-lifecycle-scenario.md',
  readiness: 'docs/13-checkpoint-002-readiness.md',
  audit: 'docs/14-objective-completion-audit.md',
  sandboxRunbook: 'docs/15-checkpoint-002-sandbox-execution.md',
  engineRoom: 'src/pages/SossonEngineRoomPage.tsx',
  packageJson: 'package.json',
}

const contents = Object.fromEntries(
  await Promise.all(
    Object.entries(files).map(async ([key, file]) => [key, await readFile(file, 'utf8')]),
  ),
)
const packageJson = JSON.parse(contents.packageJson)

const checks = [
  {
    label: 'la fiche scenario metier existe et documente la preuve locale',
    content: contents.scenario,
    required: [
      /# 17 - Scenario nouveau client operationnel/,
      /npm run verify:operational-lifecycle:dataconnect -- --output=tmp\/checkpoint-002\/operational-lifecycle-local\.json/,
      /tmp\/checkpoint-002\/operational-lifecycle-local\.json/,
      /Critere de passage a la sandbox/,
      /npm run update:operational-lifecycle-decisions -- --text-template/,
      /npm run update:operational-lifecycle-decisions -- --text-template --output=tmp\/checkpoint-002\/answers\.template\.txt/,
      /npm run update:operational-lifecycle-decisions -- --text-file=tmp\/checkpoint-002\/answers\.txt --dry-run/,
      /l'agent principal doit maintenir les scripts\/checks et relancer la validation locale/,
      /preuve JSON contient aussi le prospect sans chantier, le domaine Devis et la regle factures importees impactantes/,
    ],
  },
  {
    label: 'les 9 decisions metier restent visibles',
    content: contents.scenario,
    required: Array.from({ length: 9 }, (_, index) => new RegExp(`\\| ${index + 1} \\|`)),
  },
  {
    label: 'la readiness checkpoint 002 bloque la sandbox sans metier',
    content: contents.readiness,
    required: [
      /docs\/17-operational-lifecycle-scenario\.md/,
      /les 9 reponses metier/,
      /npm run update:operational-lifecycle-decisions -- --text-template/,
      /npm run update:operational-lifecycle-decisions -- --text-template --output=tmp\/checkpoint-002\/answers\.template\.txt/,
      /npm run update:operational-lifecycle-decisions -- --text-file=tmp\/checkpoint-002\/answers\.txt --dry-run/,
      /preuve JSON lifecycle contenant Devis et prospect sans chantier/,
    ],
  },
  {
    label: 'le runbook sandbox exige le preflight metier',
    content: contents.sandboxRunbook,
    required: [
      /Preflight metier obligatoire/,
      /docs\/17-operational-lifecycle-scenario\.md/,
      /Sans ce preflight metier, rester en local\/dry-run/,
    ],
  },
  {
    label: 'l audit de completion couvre le cycle lifecycle',
    content: contents.audit,
    required: [
      /Audit objectif 2026-05-18 - cycle nouveau client operationnel/,
      /verify:operational-lifecycle:dataconnect/,
      /docs\/17-operational-lifecycle-scenario\.md/,
      /validation sandbox/,
    ],
  },
  {
    label: 'Moteur live expose le lien de decision metier',
    content: contents.engineRoom,
    required: [
      /docs\/17-operational-lifecycle-scenario\.md/,
      /operational-lifecycle-local\.json/,
      /className="engine-page-link"/,
      /lifecycleDecisionQuestions/,
      /Decisions qui cadrent la sandbox/,
      /check:operational-lifecycle-decisions attendu OK/,
      /Fiche client\/prospect au premier contact/,
      /Client possible sans chantier/,
      /Domaine Devis separe/,
      /Toute facture fournisseur importee est definitive/,
      /Moteur live: visualisation base \+ diagramme metier \+ explorateur client\/chantier\/facture\/devis/,
    ],
  },
]

const failures = []

for (const check of checks) {
  for (const pattern of check.required) {
    if (!pattern.test(check.content)) {
      failures.push(`${check.label}: motif requis absent (${pattern}).`)
    }
  }
}

if (packageJson.scripts?.['check:operational-lifecycle-readiness'] !== 'node scripts/check-operational-lifecycle-readiness.mjs') {
  failures.push('package.json: script check:operational-lifecycle-readiness absent ou inattendu.')
}

if (packageJson.scripts?.['check:operational-lifecycle-decisions'] !== 'node scripts/check-operational-lifecycle-decisions.mjs') {
  failures.push('package.json: script check:operational-lifecycle-decisions absent ou inattendu.')
}

if (packageJson.scripts?.['update:operational-lifecycle-decisions'] !== 'node scripts/update-operational-lifecycle-decisions.mjs') {
  failures.push('package.json: script update:operational-lifecycle-decisions absent ou inattendu.')
}

if (!packageJson.scripts?.['ci:sandbox']?.includes('npm run check:operational-lifecycle-readiness')) {
  failures.push('package.json: ci:sandbox ne lance pas check:operational-lifecycle-readiness.')
}

if (packageJson.scripts?.['ci:sandbox']?.includes('npm run check:operational-lifecycle-decisions')) {
  failures.push('package.json: ci:sandbox ne doit pas lancer check:operational-lifecycle-decisions tant que la fiche metier reste a completer.')
}

if (packageJson.scripts?.['ci:sandbox']?.includes('npm run update:operational-lifecycle-decisions')) {
  failures.push('package.json: ci:sandbox ne doit pas lancer update:operational-lifecycle-decisions.')
}

if (failures.length > 0) {
  console.error('Readiness lifecycle operationnel non conforme:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Readiness lifecycle operationnel OK: fiche metier, preuves locales, Moteur live et preflight sandbox restent relies.')
