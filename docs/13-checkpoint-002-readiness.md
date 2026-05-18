# 13 - Readiness checkpoint 002

> Statut: document de passage  
> Derniere revision: 2026-05-17  
> Portee: preuves attendues pour declarer la sandbox prete au checkpoint 002.

## Objectif

Le checkpoint 002 doit prouver que la sandbox Sosson est techniquement saine, documentee, verifiable et non dangereuse avant toute preparation production.

Ce document ne remplace pas les runbooks. Il sert de checklist preuve par preuve.

## Etat court

| Domaine | Etat actuel | Verdict |
|---|---|---|
| QA locale | `checkpoint:002:local` vert le 2026-05-17 14:44 +02:00. | Pret localement, hors validation sandbox distante. |
| Secrets front | Check automatise vert. | Pret localement. |
| Auth safety | Checks automatises verts: fallback local desactive en sandbox/prod, acces dev masque hors flag, pas d'appel front `UpsertCurrentUser`, invariants auth SQL Connect audites. | Pret localement. |
| RBAC serveur SQL Connect | Mutations sensibles avec `@transaction`, lecture SQL `User(id=auth.uid)` et `@check` role; verify RBAC local OK. | A valider sandbox. |
| Surface client Data Connect | Check statique vert: `UpsertCurrentUser` absent des SDKs generes et du front. | Pret localement. |
| Frontiere Firestore | Check statique vert: Firestore borne a l'initialisation Firebase et au fallback profil transitoire. | Pret localement. |
| LocalStorage autorisations | Test unitaire vert: la matrice locale ne peut que restreindre, pas elever un role. | Pret localement. |
| UI capability gates | Check statique vert: pages sensibles gardees par `canAccessPage` sur les actions create/edit/admin principales. | Pret localement. |
| Frontiere Documents/Storage | Check statique vert: mutation SQL document, metadata `storagePath`/`sha256` et chemins `pending-documents/` centralises. | Pret localement. |
| Firebase rules | Check statique vert: Firestore/Storage restent en deny par defaut dans le repo. | Pret localement. |
| Production guard | Check statique vert: aucun deploy production automatise, aucun `firebase init dataconnect`, aucune commande destructive distante automatisee; seule l'exception locale bornee `reset:dataconnect:local` est autorisee; dashboard production bloque par defaut. | Pret localement. |
| Sandbox guardrails | Check statique/negatif vert: les scripts sandbox refusent le fichier exemple de profils avant toute lecture/mutation distante et les artefacts locaux sensibles restent ignores par git. | Pret localement. |
| Query SQL Connect safety | Check statique vert: queries authentifiees, listes larges bornees, filtres serveur conserves sur previsionnel/documents contextualises. | Pret localement. |
| SDKs generes | Garde-fou automatise vert. | Pret localement. |
| Auth profil SQL | Lecture `GetCurrentUser` branchee; provisioning prepare. | A valider sandbox. |
| RBAC serveur | Implemente localement sur mutations sensibles; non deploye/verifie sandbox. | Bloquant production. |
| Seed sandbox reel | Non confirme. | Bloquant checkpoint 002. |
| Comptage base distante | Script prepare, non execute sur sandbox. | Bloquant checkpoint 002. |
| Storage produit | Chemins pending prepares; upload signe non implemente. | Bloquant production. |
| Monitoring/couts/backups | Runbook budget, monitoring, backup et rollback prepare; pas configure/verifie sur GCP. | Bloquant production. |

## Checklist preuve par preuve

| Exigence | Artefact actuel | Preuve actuelle | Preuve manquante checkpoint 002 |
|---|---|---|---|
| Lire les docs de depart | `AGENTS.md`, `documentation.md`, `docs/00-index.md`, `docs/11-audit-checkpoint-001.md`, `docs/12-ai-agent-roadmap.md`, `docs/05-sql-connect.md` | Lues avant patchs. | Aucune. |
| Ne pas modifier les SDKs generes | `npm run check:generated-clean`, `firebase dataconnect:sdk:generate` | OK: SDKs regeneres apres changement schema/query, pas modifies a la main. | Garder le check vert en CI et committer les sorties generees avec les sources Data Connect. |
| Ne pas deployer prod | Aucun script lance vers prod. | Recherches et docs ciblent sandbox/local. | Gate humain avant toute commande prod future. |
| Ne pas exposer de secret front | `scripts/check-front-secrets.mjs` | OK. | Garder le check CI. |
| Ne pas permettre au navigateur de choisir son role | `scripts/check-auth-safety.mjs`, `scripts/check-dataconnect-auth-invariants.mjs`, `scripts/check-dataconnect-client-surface.mjs`, `scripts/provision-sql-users.mjs`, SDKs regeneres | `UpsertCurrentUser` absent des SDKs generes et controle par CI; provisioning admin via `dc.upsert('User', ...)`; aucun role fourni par le navigateur. | Valider sur sandbox avec vrais UID Firebase Auth. |
| Cloturer checkpoint 001 | `docs/11-audit-checkpoint-001.md`, `docs/12-ai-agent-roadmap.md` | Section cloture + owners + gates + plan. | Reporter les preuves sandbox reelles. |
| Seed sandbox reel | `scripts/seed-dataconnect-sandbox.mjs`, `dataconnect/seed_data.gql`, `dataconnect/previsionnel_seed/*.gql` | Dry-run possible; ecriture sandbox bloquee sans `ALLOW_SANDBOX_DATACONNECT_SEED=true`, `--sandbox` et `--yes-sandbox`. | Seed distant execute et verifie par comptage sandbox archive. |
| Comptage base distante | `scripts/count-dataconnect.mjs` | Dry-run possible; lecture sandbox bloquee sans validation humaine; `--user-profiles` et `--output` sont obligatoires en sandbox; le fichier exemple de profils est refuse. | Sortie JSON sandbox avec volumes par table, profils connus via `uidFingerprint` + domaine email, et roles SQL conformes au fichier valide humainement. |
| Profil applicatif SQL | `src/features/auth/sqlUserProfile.ts`, `src/lib/auth.ts`, `scripts/check-firestore-boundary.mjs` | `GetCurrentUser` tente avant Firestore; aucun nouvel usage Firestore n'est autorise hors fallback transitoire. | Creer un vrai `User` SQL sandbox et tester login. |
| Navigateur ne choisit pas son role | `scripts/provision-sql-users.mjs`, `dataconnect/user_profiles.example.json` | Provisioning admin direct prepare et verifie localement; front ne peut plus appeler `UpsertCurrentUser` car l'operation n'est plus exposee; les scripts sandbox refusent le fichier exemple et les UID placeholders. | Executer sur sandbox apres validation humaine avec `dataconnect/user_profiles.local.json`. |
| Fallback dev local seulement local | `.env.*`, `src/lib/auth.ts`, `LoginPage.tsx`, `scripts/check-auth-safety.mjs` | Fallback opt-in strict `VITE_ENABLE_LOCAL_AUTH_FALLBACK=true` + dev/local; acces dev masque hors flag. | Tester le comportement avec un vrai deploiement sandbox. |
| localStorage jamais source d'autorisation | `src/lib/accessControl.ts`, `src/lib/accessControl.test.ts`, `scripts/check-ui-capability-gates.mjs`, `dataconnect/sosson/mutations.gql`, `scripts/verify-dataconnect-rbac-local.mjs` | Les overrides locaux sont clamps par `defaultAccessMatrix`; pas d'elevation possible via localStorage; les principales actions front passent par `canAccessPage`; les mutations sensibles ont maintenant un check role serveur localement verifie. | Deployer/verifier le RBAC sur sandbox avec vrais comptes. |
| Firestore/Storage non ouverts globalement | `firestore.rules`, `storage.rules`, `scripts/check-firebase-rules.mjs` | Deny par defaut verifie statiquement. | Deployer/tester les rules sur `sosson-sandbox`. |
| Pas de production automatisee | `scripts/check-production-guard.mjs`, `.github/workflows/sandbox-checks.yml`, `package.json`, `deploy/dashboard.mjs` | Aucun workflow ou script CI ne deploie ni ne cible `sosson-prod`; le dashboard bloque les actions production hors `ALLOW_PRODUCTION_DASHBOARD=true`. | Garder gate humain avant tout chemin production. |
| Operations sandbox gardees | `scripts/check-sandbox-guardrails.mjs`, `scripts/seed-dataconnect-sandbox.mjs`, `scripts/provision-sql-users.mjs`, `scripts/count-dataconnect.mjs`, `.gitignore` | Les scenarios negatifs avec fichier exemple echouent avant lecture/mutation distante; le seed sandbox bloque sans validation explicite; les preuves sandbox hors `tmp/` sont refusees; `.env.local`, profils locaux et preuves `tmp/` restent ignores; les sorties masquent UID/emails complets et le check bloque les regressions vers des sorties brutes. | Utiliser uniquement les commandes sandbox avec validation humaine et vrais profils. |
| Separation operationnel/previsionnel | `dataconnect/schema/schema.gql`, `dataconnect/sosson/queries.gql`, `scripts/generate-previsionnel-seed.mjs`, SDKs regeneres, `docs/05-sql-connect.md` | `origineImport` applique localement; `ListOperationalClients` et `ListOperationalChantiers` filtrent `operationnel`; seed previsionnel marque `previsionnel`; verify local OK. | Deployer/verifier la migration sur sandbox. |
| Hooks/adapters front | `src/features/auth`, `src/features/operations`, `src/features/factures`, `src/features/documents`, `src/features/previsionnel` | Premiers adapters crees; aucun import direct `@dataconnect/generated` dans `src/pages`; le store ne charge plus directement clients/chantiers/factures via le SDK genere. | Extraire les aggregats analytics restants hors pages et reduire les imports seeds/localStorage. |
| Documents/Storage | `src/features/documents/storagePaths.ts`, `src/features/documents/documentSql.ts`, `src/pages/DocumentsPage.tsx`, `scripts/check-document-storage-boundary.mjs`, `scripts/verify-documents-dataconnect-local.mjs`, `docs/10-runbooks.md` | Validation MIME/extension/taille + hash SHA-256 + messages de rejet dropzone + chemins pending + refus front des `storagePath` non canoniques; preuve emulateur `documents-local.json`; actions create/edit bloquees par la matrice d'acces UI; check statique empeche les nouveaux chemins arbitraires dans le front. | Upload Storage signe + rules testees + contrainte serveur sur metadata coherente. |
| QA/CI | `.github/workflows/sandbox-checks.yml`, `package.json` | `ci:sandbox` vert localement le 2026-05-17 14:35 +02:00 et inclut les tests data-state + garde-fous documentation/secrets. | CI distante verte sur PR/push. |
| Documentation junior SQL | `docs/05-sql-connect.md`, `src/pages/SossonDocsPage.tsx`, `scripts/check-doc-entrypoints.mjs`, `scripts/check-doc-links.mjs` | Chapitre detaille avec flux, tables, Excel, auth, provisioning; page `/documentation` structuree en 8 chapitres sans importer le gros seed previsionnel; liens Markdown locaux verifies; garde-fous automatises. | Actualiser apres validation sandbox. |
| Exploitation/couts | `docs/09-couts.md`, `docs/10-runbooks.md` | Runbooks budget, monitoring, backup et rollback documentes. | Budget alerts, monitoring et backup verifies sur GCP. |

## Commandes locales deja executees

```bash
npm run lint
npm run test:previsionnel
npm run test:documents
npm run build:sandbox
npm run check:front-secrets
npm run check:auth-safety
npm run check:firestore-boundary
npm run check:ui-capabilities
npm run check:document-storage
npm run check:dataconnect-auth
npm run check:dataconnect-queries
npm run check:dataconnect-client-surface
npm run check:firebase-rules
npm run check:production-guard
npm run check:sandbox-guardrails
npm run check:doc-entrypoints
npm run check:doc-links
npm run check:page-dataconnect-imports
npm run check:generated-clean
npm run audit:frontend-sources -- --output=tmp/checkpoint-002/frontend-sources.json
npm run checkpoint:002:local
npm run ci:sandbox
npm run count:dataconnect -- --dry-run
npm run seed:sandbox -- --dry-run --kind=all --output=tmp/checkpoint-002/seed-sandbox-dry-run.json
npm run provision:sql-users -- --file=dataconnect/user_profiles.example.json --dry-run
npm run seed:dataconnect
npm run seed:previsionnel:dataconnect
npm run verify:dataconnect
npm run verify:previsionnel:dataconnect
npm run verify:dataconnect:rbac
npm run count:dataconnect -- --output=tmp/checkpoint-002/counts-local.json
```

Resultat: commandes locales OK. Le build sandbox garde un warning non bloquant sur les gros chunks.

## Verification SQL Connect locale avec emulateur

Terminal 1:

```bash
npm run emulators:dataconnect
```

Terminal 2:

```bash
npm run checkpoint:002:emulator
```

La commande `checkpoint:002:emulator` orchestre:

```bash
npm run seed:dataconnect
npm run seed:previsionnel:dataconnect
npm run verify:dataconnect
npm run verify:previsionnel:dataconnect
npm run verify:operational-boundary:dataconnect -- --output=tmp/checkpoint-002/operational-boundary-local.json
npm run verify:team-users:dataconnect
npm run verify:email:dataconnect
npm run verify:planning:dataconnect
npm run verify:reports:dataconnect
npm run count:dataconnect -- --output=tmp/checkpoint-002/counts-local.json
npm run verify:documents:dataconnect
npm run snapshot:analytics:dataconnect
npm run verify:dataconnect:rbac
npm run verify:checkpoint-audit:dataconnect
```

Resultat observe le 16 mai 2026 apres renommage des listes operationnelles:

- `verify:dataconnect`: seed canonique present (`missingSeedIds` vide);
- `verify:previsionnel:dataconnect`: `exercises=13`, `chantiers=898`, `latestExerciseChantiers=101`;
- `count:dataconnect` avant RBAC: operationnel `3/4/12`, documents `0/0`, previsionnel `898` lignes chargees, `lineQueryMayBeTruncated=false`;
- `verify:dataconnect:rbac`: assistante autorisee a creer un client, chef de chantier refuse sur creation client, chef de chantier autorise sur dossier document;
- `verify:checkpoint-audit:dataconnect`: ecriture/relecture locale des tables checkpoint, audit, import et change log.

Resultat observe le 17 mai 2026 apres ajout audit/checkpoints/imports:

- `checkpoint:002:emulator`: OK sur base pglite locale resetee;
- `count:dataconnect`: operationnel `3/4/12`, documents `0/0`, previsionnel `898` lignes, `1577` montants mensuels, `887` montants par lot;
- `verify:email:dataconnect`: creation/relecture locale d'un `EmailThread`, `EmailMessage` et `EmailAttachment`, puis classement du fil en `traite`;
- `verify:documents:dataconnect`: creation/relecture locale d'un `DocumentFolder` et d'un `DocumentAttache` avec `storagePath`, `tailleBytes` et `sha256`;
- `verify:planning:dataconnect`: creation/relecture locale d'une carte `PlanningEvent` + `PlanningAssignment`, modification via `UpdatePlanningEventDetails`, puis annulation soft via `CancelPlanningEvent`;
- `verify:reports:dataconnect`: creation/relecture locale d'un `Rapport`, generation d'un artefact CSV local sous `tmp/`, puis marquage genere avec chemin/hash reel via `MarkRapportGenerated`;
- `verify:checkpoint-audit:dataconnect`: 1 `CheckpointRun`, 1 `CheckpointStep`, 1 `CheckpointArtifact`, 1 `CheckpointDecision`, 1 `DataImportRun`, 1 `DataImportIssue`, 1 `AuditEvent` et 1 `EntityChangeLog` ecrits puis relus;
- preuves locales: `tmp/checkpoint-002/counts-local.json`, `tmp/checkpoint-002/operational-boundary-local.json`, `tmp/checkpoint-002/team-users-local.json`, `tmp/checkpoint-002/email-local.json`, `tmp/checkpoint-002/documents-local.json`, `tmp/checkpoint-002/planning-local.json`, `tmp/checkpoint-002/report-local.json`, `tmp/checkpoint-002/analytics-snapshot-local.json` et `tmp/checkpoint-002/checkpoint-audit-local.json`.

Si l'emulateur contient deja des lignes RBAC locales, `checkpoint:002:emulator` echoue avant de relancer RBAC et demande une base locale propre. Comme l'etat pglite peut persister sous `dataconnect/.dataconnect/pgliteData`, le reset propre est explicite:

```bash
npm run reset:dataconnect:local -- --yes-local-reset
```

Les compteurs locaux restent une preuve emulateur, pas une preuve sandbox.

Preuves locales ecrites dans `tmp/checkpoint-002/counts-local.json`, `tmp/checkpoint-002/operational-boundary-local.json`, `tmp/checkpoint-002/team-users-local.json`, `tmp/checkpoint-002/email-local.json`, `tmp/checkpoint-002/documents-local.json`, `tmp/checkpoint-002/planning-local.json`, `tmp/checkpoint-002/report-local.json`, `tmp/checkpoint-002/analytics-snapshot-local.json` et `tmp/checkpoint-002/checkpoint-audit-local.json`.

## Actions sandbox a validation humaine

Ne pas executer sans validation humaine explicite.

Le gabarit d'execution complet est dans `docs/15-checkpoint-002-sandbox-execution.md`.

```bash
firebase deploy --only firestore:rules,storage --project sosson-sandbox
firebase deploy --only dataconnect --project sosson-sandbox
ALLOW_SANDBOX_DATACONNECT_SEED=true npm run seed:sandbox -- --sandbox --yes-sandbox --kind=all
ALLOW_SANDBOX_USER_PROVISIONING=true npm run provision:sql-users -- --sandbox --yes-sandbox --file=dataconnect/user_profiles.local.json
ALLOW_SANDBOX_DATACONNECT_READ=true npm run count:dataconnect -- --sandbox --yes-sandbox --user-profiles=dataconnect/user_profiles.local.json --output=tmp/checkpoint-002/counts-sandbox.json
```

## Definition de checkpoint 002 valide

Le checkpoint 002 est valide seulement si:

- les commandes locales restent vertes;
- les verify SQL Connect passent avec emulateur local;
- la sandbox distante a des volumes mesures par table;
- au moins un utilisateur Firebase Auth reel charge un profil SQL `User`;
- les roles SQL mesures correspondent aux roles attendus dans `dataconnect/user_profiles.local.json`;
- un utilisateur sans profil SQL n'a pas d'acces silencieux;
- les regles Firestore/Storage durcies sont testees en sandbox;
- les risques restants sont limites a des items explicitement hors production.

Tant qu'un de ces points manque, la production reste bloquee.
