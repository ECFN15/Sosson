# 00 - Index documentation Sosson

> Statut: stable  
> Derniere revision: 2026-05-18
> Portee: point d'entree maintenable pour la documentation projet.

## Lecture rapide

Sosson est un hub operationnel interne mono-entreprise pour une PME francaise du batiment. La cible de persistance metier est Firebase SQL Connect / Cloud SQL PostgreSQL. Firebase Auth est actif. Firestore et localStorage restent transitoires ou adjoints.

## Chapitres actifs

| Chapitre | Role |
|---|---|
| [01 - Vision](01-vision.md) | Contexte produit et perimetre mono-tenant. |
| [02 - Architecture](02-architecture.md) | Architecture cible et decisions structurantes. A rapprocher de l'etat reel audite. |
| [03 - Data Architecture](03-data-architecture.md) | Modele donnees cible. Le schema reel est dans `dataconnect/schema/schema.gql`. |
| [04 - Firebase sandbox/prod](04-firebase-sandbox-prod.md) | Environnements, garde-fous, confusion sandbox/prod. |
| [05 - SQL Connect](05-sql-connect.md) | Schema reel, operations, seeds, integration front. |
| [06 - Integrations](06-integrations.md) | Integrations externes historiques et cibles; Outlook/Microsoft Graph est la preuve mail courante, Gmail reste une hypothese historique. |
| [07 - Frontend state](07-frontend-state.md) | Routes, stores, sources de donnees, etat local vs SQL. |
| [08 - Quality checks](08-quality-checks.md) | Build, lint, tests, smoke checks, verification statique. |
| [09 - Roadmap](09-roadmap.md) | Roadmap priorisee P0-P5 issue du checkpoint. |
| [09 - Couts](09-couts.md) | Modele couts Firebase / Cloud SQL existant. |
| [10 - Securite](10-securite.md) | Cadrage securite cible. |
| [10 - Runbooks](10-runbooks.md) | Commandes d'exploitation sandbox et local. |
| [11 - Audit checkpoint 001](11-audit-checkpoint-001.md) | Premier audit officiel de sante reelle. |
| [11 - Outlook Graph Email](11-outlook-graph-email.md) | Journal technique de la preuve locale Outlook/Graph. |
| [12 - Roadmap agents IA](12-ai-agent-roadmap.md) | Repartition des lots par agent specialise. |
| [13 - Readiness checkpoint 002](13-checkpoint-002-readiness.md) | Checklist preuves attendues pour valider la sandbox checkpoint 002. |
| [14 - Audit completion objectif global](14-objective-completion-audit.md) | Mapping exigence -> artefact -> preuve -> manque pour eviter une fausse cloture. |
| [15 - Execution sandbox checkpoint 002](15-checkpoint-002-sandbox-execution.md) | Gabarit d'execution humaine des actions sandbox reelles et preuves a collecter. |
| [16 - Audit SQL reel et architecture cible](16-sql-architecture-target-audit.md) | Audit du schema reel, mapping front, cible SQL durable, checkpoints et migration. |
| [17 - Scenario nouveau client operationnel](17-operational-lifecycle-scenario.md) | Decisions metier et criteres avant validation sandbox du cycle client/prospect -> devis -> chantier -> factures. |
| [18 - Audit front et remapping SQL Connect](18-front-sql-remapping-audit.md) | Cartographie page par page des sources front, fallbacks et remapping vers les workflows SQL Connect. |
| [Audit pre-sandbox SQL Connect](sql-connect-pre-sandbox-audit.md) | Verdict pre-sandbox, preuves locales/distantes, tables, operations, front, risques et limites. |
| [Passage emulateur vers sandbox SQL Connect](sql-connect-emulator-to-sandbox-plan.md) | Plan concret pour passer de l'emulateur local a la sandbox sans action production. |
| [Runbook SQL Connect et deploiement sandbox](sql-connect-deployment-runbook.md) | Procedure humaine locale/sandbox/prod, rollback, backups, PITR, HA et commandes utiles. |
| [Registre des risques SQL Connect](sql-connect-risk-register.md) | Risques, severite, preuves, mitigations et decisions humaines avant passage sandbox. |
| [99 - Glossaire](99-glossary.md) | Vocabulaire partage. |

## Documentation visible dans l'app

La page `/documentation` est implementee dans `src/pages/SossonDocsPage.tsx`.
Elle sert de documentation produit lisible depuis l'application et doit rester cumulative.

La page `/base-sql-deploiement` est implementee dans `src/pages/SqlDeploymentPage.tsx`.
Elle vulgarise l'etat SQL Connect/PostgreSQL, les environnements, les sauvegardes et les regles anti-perte.

Chapitres visibles:

1. Mails, Microsoft Azure et Microsoft Graph.
2. SQL Connect, PostgreSQL et source de verite metier.
3. Securite, Auth, roles et secrets.
4. Previsionnel Excel, clients historiques et statistiques.
5. Documents, factures et Firebase Storage.
6. Frontend React, navigation et etat applicatif.
7. Parcours produit: dashboard, chantiers, clients et operations.
8. Sandbox, checkpoints, seeds et exploitation.
9. Roadmap, agents IA et maintenance du livre.

Le garde-fou `npm run check:doc-entrypoints` verifie cette structure et empeche de remplacer la page par un resume incomplet.

## Annexes et historiques

Ces documents restent indexes pour conserver la trace produit/architecture sans allonger les titres des chapitres actifs.

| Document | Role |
|---|---|
| [04 - Intelligence](04-intelligence.md) | Cadre historique IA/Genkit, prompts, couts et validation humaine. |
| [05 - Archival strategy](05-archival-strategy.md) | Strategie historique d'archivage long terme et format d'archive. |
| [Changelog](CHANGELOG.md) | Historique des decisions documentaires et corrections de coherence. |
| [Kit Outlook / Microsoft Graph](outlook-mail-kit.md) | Specification de reprise pour la boite mail Outlook entreprise. |
| [Audit tableur previsionnel](previsionnel-tableur-audit.md) | Audit fonctionnel du tableur previsionnel et de ses limites Excel. |

## Sources de verite techniques

- Etat operationnel court: `AGENTS.md`.
- Schema relationnel reel: `dataconnect/schema/schema.gql`.
- Operations SQL Connect: `dataconnect/sosson/queries.gql` et `dataconnect/sosson/mutations.gql`.
- Scripts disponibles: `package.json`.
- Checkpoint courant: [11 - Audit checkpoint 001](11-audit-checkpoint-001.md).
