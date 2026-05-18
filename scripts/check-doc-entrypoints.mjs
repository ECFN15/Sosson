import { readFile } from 'node:fs/promises'

const files = {
  'README.md': {
    required: [
      /Sosson/,
      /docs\/00-index\.md/,
      /npm run checkpoint:002:local/,
      /npm run checkpoint:002:emulator/,
      /npm run reset:dataconnect:local -- --yes-local-reset/,
      /Production non prete/,
    ],
    forbidden: [
      /React \+ TypeScript \+ Vite/,
      /minimal setup to get React working in Vite/i,
    ],
  },
  'documentation.md': {
    required: [
      /docs\/00-index\.md/,
      /AGENTS\.md/,
      /npm run checkpoint:002:local/,
      /npm run checkpoint:002:emulator/,
      /npm run reset:dataconnect:local -- --yes-local-reset/,
      /docs\/06-integrations\.md/,
      /dry-run seed sandbox archive sous `tmp\/`/,
      /Documentation visible dans l'application/,
      /Mails, Microsoft Azure et Microsoft Graph/,
      /ajouter ou deplacer un chapitre sans supprimer l'ancien contenu utile/,
    ],
    forbidden: [],
  },
  'AGENTS.md': {
    required: [
      /profil applicatif tente SQL Connect `GetCurrentUser`/,
      /npm run checkpoint:002:local/,
      /npm run checkpoint:002:emulator/,
      /npm run reset:dataconnect:local -- --yes-local-reset/,
      /npm run seed:sandbox -- --dry-run --kind=all --output=tmp\/checkpoint-002\/seed-sandbox-dry-run\.json/,
      /firebase deploy --only dataconnect --project sosson-sandbox/,
      /validation humaine/,
    ],
    forbidden: [
      /profil utilisateur est encore lu via Firestore/,
    ],
  },
  'docs/00-index.md': {
    required: [
      /05 - SQL Connect/,
      /Documentation visible dans l'app/,
      /Mails, Microsoft Azure et Microsoft Graph/,
      /08 - Quality checks/,
      /10 - Runbooks/,
      /13 - Readiness checkpoint 002/,
      /15 - Execution sandbox checkpoint 002/,
    ],
    forbidden: [],
  },
  'docs/06-integrations.md': {
    required: [
      /6\.1 Carte des integrations/,
      /6\.2 Microsoft Graph, Azure et mails/,
      /6\.3 Gmail historique \/ alternative/,
      /Outlook \/ Microsoft Graph/,
      /Gmail reste une option historique ou alternative/,
      /aucune integration mail hebergee n'est encore prete production/,
    ],
    forbidden: [],
  },
  'docs/15-checkpoint-002-sandbox-execution.md': {
    required: [
      /Phrase de validation recommandee/,
      /Je valide uniquement les actions sandbox suivantes sur le projet sosson-sandbox/,
      /Je confirme que la production sosson-prod est exclue/,
      /Sans cette validation explicite, rester en dry-run\/local/,
    ],
    forbidden: [],
  },
  'src/pages/SossonDocsPage.tsx': {
    required: [
      /id:\s*'mails'/,
      /number:\s*'01'/,
      /title:\s*'Mails, Microsoft Azure et Microsoft Graph'/,
      /Creation du compte Azure et de l App Registration/,
      /Microsoft Graph, OAuth et scopes/,
      /id:\s*'sql-connect'/,
      /title:\s*'SQL Connect, PostgreSQL et source de verite metier'/,
      /id:\s*'securite'/,
      /title:\s*'Securite, Auth, roles et secrets'/,
      /id:\s*'previsionnel'/,
      /title:\s*'Previsionnel Excel, clients historiques et statistiques'/,
      /id:\s*'documents'/,
      /title:\s*'Documents, factures et Firebase Storage'/,
      /id:\s*'front'/,
      /title:\s*'Frontend React, navigation et etat applicatif'/,
      /id:\s*'parcours-produit'/,
      /title:\s*'Parcours produit: dashboard, chantiers, clients et operations'/,
      /title:\s*'Sandbox, checkpoints, seeds et exploitation'/,
      /title:\s*'Roadmap, agents IA et maintenance du livre'/,
      /Tables operationnelles/,
      /Firebase Auth prouve l identite/,
      /Timeline du livre/,
      /Checkpoint 002/,
      /docs\/06-integrations\.md/,
      /docs\/11-outlook-graph-email\.md/,
      /previsionnelDocSnapshot/,
    ],
    forbidden: [
      /Avancement technique Sosson, base client et previsionnel Excel/,
      /from ['"]@\/data\/previsionnel['"]/,
    ],
  },
}

const failures = []

for (const [file, checks] of Object.entries(files)) {
  const content = await readFile(file, 'utf8')

  for (const pattern of checks.required) {
    if (!pattern.test(content)) {
      failures.push(`${file}: motif requis absent (${pattern}).`)
    }
  }

  for (const pattern of checks.forbidden) {
    if (pattern.test(content)) {
      failures.push(`${file}: motif obsolete/interdit detecte (${pattern}).`)
    }
  }
}

if (failures.length) {
  console.error('Points entree documentation non conformes:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Points entree documentation OK: README, documentation.md, AGENTS.md, docs/00-index.md, docs/06-integrations.md, docs/15-checkpoint-002-sandbox-execution.md et page /documentation restent structures.')
