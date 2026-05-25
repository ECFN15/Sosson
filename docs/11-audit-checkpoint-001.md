# 11 - Audit checkpoint 001

> Date: 2026-05-16  
> Auditeur: Codex CLI  
> Portee: sante technique, produit, securite, base de donnees, documentation, exploitation.

## Contexte

Sosson est un hub operationnel interne pour une seule PME francaise du batiment. Le projet n'est pas un SaaS multi-tenant. La cible de persistance metier est SQL Connect / Cloud SQL PostgreSQL, avec Firebase Auth, Hosting, Storage et Firestore adjoint/transitoire.

## Methodologie

- Lecture de `AGENTS.md`, `documentation.md`, `docs/`, `firebase.json`, `.firebaserc`, `dataconnect/`, `src/lib/`, `src/pages/`, `package.json`.
- Recherche statique des imports seeds, usages Firestore, localStorage, variables `VITE_`, Microsoft/Outlook.
- Execution de `npm run lint`, `npm run test:previsionnel`, `npm run build:sandbox`.
- Audits paralleles architecture, securite, data SQL Connect, frontend, documentation, QA/couts.
- Patchs limites aux corrections non destructives.

## Resume executif

La base technique est exploitable en sandbox, mais l'application reste hybride. SQL Connect est present et partiellement utilise, surtout pour le store principal, les factures, documents metadata, dashboard/statistiques previsionnel et tableur previsionnel. Plusieurs zones restent locales ou de preuve: emails, planning, equipe, permissions, documents binaires.

Le risque principal n'est pas un crash global: c'est l'ambiguite entre donnees reelles SQL, seeds locaux, historique previsionnel et controles d'acces encore applicatifs. Avant production, il faut valider en sandbox le RBAC serveur et le profil utilisateur SQL, terminer Storage produit, et prouver les queries metier separees.

## Cloture checkpoint 001

Statut de cloture: checkpoint 001 ferme comme audit local/documentaire, mais pas comme validation sandbox distante. Le checkpoint 002 doit prouver l'etat distant avec des commandes et des volumes reels.

| Sujet | Decision checkpoint 001 | Preuve actuelle | Manquant checkpoint 002 |
|---|---|---|---|
| Validation sandbox reelle | Non executee sans validation humaine. | Config `.firebaserc`, `firebase.json`, scripts et docs prets. | Deploy/verification sandbox explicitement approuves et traces. |
| Etat chiffre base distante | Inconnu. | Volumes seeds connus: demo local 3/4/12; previsionnel Excel genere 13/586/616/898/1577/887. | Comptage distant par table sur `sosson-sandbox`. |
| Seed sandbox reel | Non confirme. | Les chunks previsionnels Excel existent; `dataconnect/seed_data.gql` est un jeu demo local, pas le seed sandbox par defaut. | Injection sandbox previsionnelle + verification sandbox, pas seulement locale. |
| Decisions ouvertes | Documentees dans la roadmap agents. | Section "Cloture checkpoint 001" de `docs/12-ai-agent-roadmap.md`. | ADR ou decision ownerisee pour chaque point. |
| Risques acceptes | Acceptes uniquement en sandbox/local. | RBAC durci localement mais non prouve sandbox, Storage deny par defaut, profil Firestore fallback, localStorage brouillons. | Gates de sortie fermes avant production. |
| Gates production | Production non prete. | Checklist QA et runbooks ajoutes. | Validation complete checkpoint 002. |

Owners checkpoint 002:

- Securite/Auth: profil SQL, RBAC, suppression du role choisi navigateur.
- Data/SQL Connect: separation operationnel/historique, comptages sandbox, seed reel.
- Front data hooks: adapters metier et sources explicites.
- Documents/Storage: chemins canoniques, metadata coherentes, rules non ouvertes globalement.
- QA/CI: lint, tests, build, secrets, smoke checklist.
- Exploitation/Couts: budget alerts, monitoring minimal, backup/rollback.

## Scores de sante

| Domaine | Statut | Commentaire |
|---|---|---|
| Architecture | Orange | Repo lisible, mais pages tres grosses et couches metier/adapters melangees. |
| Frontend | Orange | Routes principales presentes, etats vides souvent prevus, mais store hybride et localStorage structurant. |
| Data / SQL Connect | Orange | Schema reel riche, integration partielle, RBAC serveur implemente localement mais non deploye/verifie sandbox. |
| Securite | Rouge/Orange | Pas de secret front trouve, mais regles Firebase initiales trop larges et autorisations surtout UI. |
| Documentation | Orange | Documentation abondante mais decalee; nouveau checkpoint et index ajoutes. |
| Exploitation Firebase | Orange | Scripts utiles, sandbox/prod identifies, production non prete. |
| Tests / QA | Orange | Lint/build/tests previsionnel OK apres patch, mais peu de tests produit. |
| Couts / scalabilite | Orange | Cloud SQL/Data Connect a surveiller; listes larges sans pagination fine. |

## Etat reel de l'app

Ce qui est vivant avec SQL Connect:

- Store global: `ListOperationalClients`, `ListOperationalChantiers`, `ListFactures`.
- Factures: creation et statut SQL si source SQL active.
- Documents: dossiers/documents metadata SQL partiels.
- Dashboard et Statistiques: previsionnel SQL si disponible.
- Tableur previsionnel: lecture/sauvegarde SQL des montants et cell edits.

Ce qui reste local/mock/hybride:

- Login profil: Firebase Auth reel, tentative SQL `GetCurrentUser`, fallback Firestore transitoire, fallback seed seulement opt-in apres patch.
- Clients/chantiers: affichage encore lie au previsionnel local.
- Emails: seeds + serveur Outlook local.
- Planning: donnees locales.
- Equipe/permissions: localStorage.
- Documents binaires: pas encore Storage produit.

## Tableau page -> source -> cible

| Page | Source actuelle | Cible |
|---|---|---|
| Dashboard | Store + previsionnel SQL/TS | Hooks SQL communs + aggregats fiables. |
| Clients | Store SQL/local + previsionnel local | `Client` SQL + alias/lignes SQL. |
| Chantiers | Store SQL/local + previsionnel local | `Chantier` SQL filtre operationnel. |
| Factures | SQL conditionnel + local | SQL par defaut, brouillon local explicite. |
| Documents | SQL metadata + memoire | Storage + metadata SQL. |
| Emails | Outlook local + seeds | Backend Graph securise + SQL. |
| Planning | Local | Modele persistant. |
| Previsionnel | SQL partiel + localStorage | SQL source principale, localStorage brouillon. |
| Statistiques | SQL previsionnel ou TS | Couche analytics partagee. |
| Equipe | LocalStorage | RBAC/profils serveur. |

## Risques securite

- SQL Connect mutations sensibles maintenant durcies localement par lecture SQL `User(id=auth.uid)` et check `role`, mais non deployees/verifiees sandbox.
- `UpsertCurrentUser` a ete retire du connecteur client; le provisioning SQL `User` passe par Admin SDK `dc.upsert('User', ...)`.
- Controle d'acces UI et matrice localStorage falsifiables; le serveur SQL Connect ne doit pas dependre de ces valeurs.
- Firestore profil encore transitoire; SQL `User` est tente au login mais pas encore prouve avec vrais profils sandbox.
- Outlook/Graph est local et ne doit pas etre deploye tel quel.
- Metadata documents: l'adapter front refuse maintenant les chemins non canoniques `pending-documents/...`, mais la contrainte doit encore etre imposee cote serveur/rules.

## Risques couts / scalabilite

- Cloud SQL est le poste cout principal, pas Hosting.
- Queries globales avec limites hautes et peu de pagination.
- Previsionnel peut charger de gros ensembles analytiques.
- Storage documents/factures deviendra significatif avec photos/PDF.
- Absence d'observabilite minimale: erreurs front, logs backend, budget alerts, alertes Cloud SQL.

## Problemes detectes

### P0

- Lint bloquant sur `MicrosoftCallbackPage`.
- Auth seedee accessible par fallback implicite quand Firebase echouait.
- Regles Firebase versionnees trop permissives.

### P1

- Profil applicatif SQL demarre via `GetCurrentUser`, a valider sandbox puis finaliser en supprimant le fallback Firestore.
- RBAC serveur SQL Connect implemente localement, a deployer/verifier sandbox.
- Separation operationnel/previsionnel appliquee localement via `origineImport`, a deployer/verifier sandbox.
- Mutations factures/documents encore conditionnelles et parfois locales.
- Documents binaires non durables.

### P2

- Fichiers page tres gros.
- Duplication des lectures previsionnel.
- localStorage utilise pour permissions/equipe/documents/brouillons.
- Pas de pagination serveur systematique.

## Patchs appliques

- `src/lib/auth.ts`: fallback local opt-in via `VITE_ENABLE_LOCAL_AUTH_FALLBACK`, jamais production.
- `src/features/auth/sqlUserProfile.ts` + `src/lib/auth.ts`: lecture SQL `GetCurrentUser` tentee avant Firestore.
- `src/features/operations/operationalAdapters.ts`: extraction des mappings SQL clients/chantiers/factures hors store global.
- `src/lib/store.tsx`: suppression des appels directs `listOperationalClients/listOperationalChantiers/listFactures`; le store consomme maintenant `loadOperationalDataFromSql`.
- `src/lib/accessControl.ts`: la matrice locale peut restreindre un role mais ne peut plus l'elever au-dessus de `defaultAccessMatrix`.
- `src/features/factures/factureSql.ts` + `src/pages/FacturesPage.tsx`: extraction des mutations factures SQL hors page.
- `src/features/documents/documentSql.ts` + `src/features/documents/documentTypes.ts`: extraction des lectures/mutations documents SQL hors page.
- `src/features/previsionnel/previsionnelSql.ts`: extraction des lectures/mutations previsionnel SQL hors pages Dashboard, Statistiques et tableur.
- `src/features/documents/storagePaths.ts` + `src/pages/DocumentsPage.tsx`: validation front simple, chemins metadata `pending-documents/...` et refus adapter des chemins non canoniques.
- `scripts/provision-sql-users.mjs` + `dataconnect/user_profiles.example.json`: preparation d'un provisioning SQL `User` admin/local, avec dry-run et garde-fou sandbox.
- `src/lib/store.tsx`: branchement `onAuthChange`, ajout `authInitializing`.
- `src/components/layout/AppLayout.tsx` et `src/App.tsx`: attente de rehydratation auth avant redirection.
- `src/pages/LoginPage.tsx`: connexion demo cachee si fallback desactive.
- `src/pages/MicrosoftCallbackPage.tsx`: correction lint sans changer le flux OAuth local.
- `src/pages/ChantierDetailPage.tsx`: protection division par zero sur pourcentages budget.
- `firestore.rules`: deny par defaut; lecture `users/{uid}` seulement par soi; ecriture client interdite.
- `storage.rules`: deny par defaut tant que Storage produit n'est pas branche.
- `firebase.json`: ajout de headers Hosting defensifs (`nosniff`, referrer policy, frame deny, permissions policy).
- `scripts/verify-dataconnect-local.mjs` et `scripts/verify-previsionnel-dataconnect-local.mjs`: echec propre si l'emulateur SQL Connect local est absent.
- `scripts/check-dataconnect-auth-invariants.mjs`: garde-fou sur les invariants auth des mutations SQL Connect pendant la phase RBAC transitoire.
- `scripts/check-firebase-rules.mjs`: garde-fou statique Firestore/Storage deny par defaut.
- `scripts/check-production-guard.mjs`: garde-fou contre les deploys production automatises dans les scripts/workflows.
- `scripts/checkpoint-002-local.mjs`: preflight local non destructif pour regrouper les preuves checkpoint 002.
- `.env.example`, `.env.sandbox`, `.env.production`: ajout `VITE_ENABLE_LOCAL_AUTH_FALLBACK=false`.
- `.env.local`: acces dev local active via `VITE_ENABLE_LOCAL_AUTH_FALLBACK=true` sans l'ajouter aux fichiers versionnes.
- Documentation: index, SQL Connect detaille, frontend state, quality checks, roadmap agents, runbooks, checkpoint.

## Patchs non appliques

- RBAC SQL Connect serveur: implemente et verifie localement sur les mutations sensibles; reste a deployer/verifier en sandbox avec vrais comptes Firebase Auth.
- Bascule profil vers SQL `GetCurrentUser`: demarree dans `src/features/auth/sqlUserProfile.ts`, a valider avec vrais `User` sandbox et a finir en retirant le fallback Firestore.
- Separation operationnel/previsionnel: appliquee localement via `origineImport` sur `Client` / `Chantier`, seed previsionnel regenere et SDKs regeneres; reste a deployer/verifier en sandbox.
- Storage produit: necessite design des chemins, rules, upload, URLs signees.
- Headers CSP Hosting: a valider avec Firebase/Graph/Data Connect pour eviter de casser le front.

## Commandes executees

| Commande | Resultat |
|---|---|
| `git status --short` | Initialement vide. |
| `npm run lint` | KO avant patch sur `MicrosoftCallbackPage`, OK apres patch. |
| `npm run test:previsionnel` | OK, 10 tests passes. |
| `npm run test:documents` | OK, 4 tests passent sur chemins Storage documents et validation MIME/extension/taille. |
| `npm run test:access-control` | OK, 2 tests passent sur la non-elevation des droits via localStorage. |
| `npm run test:data-state` | OK, 4 tests passent sur la convention front `source/status/error/hasUnsyncedLocalChanges`. |
| `npm run build:sandbox` | OK, warning chunks > 500 kB. |
| `npm run check:front-secrets` | OK, aucune variable front secret/token/refresh ni identifiant de test sensible detecte. |
| `npm run check:auth-safety` | OK, fallback local strictement dev/local, acces dev login masque hors flag, aucun `UpsertCurrentUser` dans le front applicatif. |
| `npm run check:dataconnect-auth` | OK, 14 mutations auditees avec `@auth`, `@transaction`, lecture SQL `User`, check `role`; `UpsertCurrentUser` absent du connecteur client. |
| `npm run check:firebase-rules` | OK, Firestore/Storage restent en deny par defaut dans le repo. |
| `npm run check:production-guard` | OK, aucun deploy production automatise, aucun `firebase init dataconnect`, aucune commande destructive distante evidente dans `package.json` ou workflows; seule l'exception locale bornee `reset:dataconnect:local` est autorisee; dashboard production bloque par defaut. |
| `npm run check:sandbox-guardrails` | OK, fichiers exemples refuses avant lecture/mutation distante, seed sandbox bloque sans validation, reset local Data Connect bloque sans confirmation, artefacts locaux ignores par git, sorties profils masquees. |
| `npm run check:doc-entrypoints` | OK, points d'entree README/documentation/AGENTS/index docs orientes checkpoint 002, page `/documentation` structuree en 8 chapitres, et absence de retour au template Vite. |
| `npm run check:doc-links` | OK, 38 fichiers Markdown verifies, aucun lien local `.md` mort et index `docs/00-index.md` couvert. |
| `npm run check:page-dataconnect-imports` | OK, aucun import direct `@dataconnect/generated` dans `src/pages`. |
| `npm run check:generated-clean` | OK, SDKs SQL Connect regeneres avec les sources Data Connect modifiees. |
| `npm run audit:frontend-sources` | OK non bloquant: 46 imports data locaux/seeds, 23 usages applicatifs localStorage, 3 usages Firestore, 0 import SQL direct dans les pages. |
| `npm run count:dataconnect -- --dry-run` | OK, prepare le comptage local/sandbox sans lecture ni mutation. |
| `npm run count:dataconnect -- --dry-run --output=tmp/checkpoint-002/counts-dry-run.json` | OK, ecrit une preuve locale ignoree par git. |
| `npm run count:dataconnect -- --dry-run --output=docs/counts.json` | KO attendu, le script refuse une preuve de comptage hors `tmp/`. |
| `npm run seed:sandbox -- --dry-run --kind=previsionnel --output=tmp/checkpoint-002/seed-sandbox-dry-run.json` | OK, archive la liste de 113 fichiers seed sandbox sans mutation distante. |
| `npm run provision:sql-users -- --file=dataconnect/user_profiles.example.json --dry-run` | OK, valide le format de provisioning sans mutation et masque UID/email dans la sortie. |
| `npm run checkpoint:002:local` | OK le 2026-05-17 14:44 +02:00, enchaine CI sandbox locale, audit front, dry-run comptage archive sous `tmp/`, dry-run seed sandbox archive sous `tmp/` et dry-run provisioning. |
| `npm run checkpoint:002:emulator` | OK avec emulateur local propre, orchestre seeds, verifies, comptage pre-RBAC et verification RBAC. |
| `npm run ci:sandbox` | OK le 2026-05-17 14:35 +02:00, enchaine lint, tests, checks statiques et build sandbox. |
| `npm run verify:dataconnect` | OK avec emulateur local: 3 clients operationnels, 4 chantiers operationnels, 12 factures. |
| `npm run verify:previsionnel:dataconnect` | OK avec emulateur local: 13 exercices, 898 chantiers previsionnels, 101 chantiers pour `2025-26`. |
| Recherches `rg` | Imports seeds, localStorage, Firestore, VITE, Outlook cartographies. |

## Roadmap priorisee

Voir [09 - Roadmap](09-roadmap.md). Ordre recommande:

1. Valider les regles Firebase durcies en sandbox.
2. Provisionner/verifier les profils applicatifs SQL `GetCurrentUser` en sandbox.
3. Valider en sandbox le provisioning admin `User` et les mutations sensibles durcies.
4. Deployer et valider en sandbox la separation `origineImport` entre operationnel et historique previsionnel.
5. Creer hooks metier SQL par domaine.
6. Brancher Storage documents.
7. Ajouter smoke tests et observabilite minimale.

## Checklist prochain checkpoint

- [ ] `npm run lint`, `npm run test:previsionnel`, `npm run build:sandbox` OK.
- [ ] Regles Firestore/Storage deployees et testees en sandbox.
- [ ] Profil utilisateur SQL Connect actif apres login Firebase.
- [ ] Aucun fallback auth local hors flag explicite.
- [ ] Tableau page/source mis a jour.
- [ ] Decision documentee sur Outlook vs Gmail.
- [x] Decision locale documentee sur historique previsionnel dans tables principales: `origineImport`.
- [ ] Runbook seed sandbox valide sur environnement reel.
