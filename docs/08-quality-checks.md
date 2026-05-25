# 08 - Quality checks

> Statut: draft  
> Derniere revision: 2026-05-18
> Portee: controles techniques et smoke tests.

## Commandes de base

| Commande | Role | Etat local checkpoint 002 |
|---|---|---|
| `npm run lint` | ESLint complet | OK apres patch Microsoft callback. |
| `npm run build:sandbox` | TypeScript + Vite sandbox | OK, avec warning chunks > 500 kB. |
| `npm run test:previsionnel` | Tests unitaires tableur previsionnel | OK, 10 tests passes. |
| `npm run test:documents` | Tests unitaires chemins Storage documents, validation MIME/extension/taille et hash SHA-256 du fichier. | OK, 5 tests passes. |
| `npm run test:access-control` | Tests unitaires matrice d'acces locale: le localStorage ne peut pas elever un role. | OK, 2 tests passes. |
| `npm run test:data-state` | Tests unitaires convention `source/status/error/hasUnsyncedLocalChanges` pour les adapters/hooks front. | OK, 4 tests passes. |
| `npm run check:front-secrets` | Refuse les variables front `VITE_*SECRET`, `VITE_*TOKEN`, `VITE_*REFRESH`, `VITE_*PASSWORD` dans `AGENTS.md`, `README.md`, `documentation.md`, `src`, `docs`, `scripts`, workflows et env publics, ainsi que l'adresse Outlook personnelle de test deja masquee. | Ajoute post-audit. |
| `npm run check:auth-safety` | Verifie fallback auth local false en sandbox/prod, acces dev masque hors flag, et interdit `UpsertCurrentUser` dans le front applicatif. | Ajoute post-audit. |
| `npm run check:firestore-boundary` | Verifie que Firestore reste limite aux fichiers transitoires `src/lib/firebase.ts` et `src/lib/auth.ts`. | Ajoute post-audit. |
| `npm run check:ui-capabilities` | Verifie que les pages sensibles gardent des gardes `canAccessPage` sur les actions `create/edit/admin` principales. | Ajoute post-audit. |
| `npm run check:document-storage` | Verifie les types/operations Data Connect documents, la mutation `createDocumentAttache`, les champs `storagePath`/`sha256` et les chemins `pending-documents/` centralises dans l'adapter Documents/Storage. | Ajoute post-audit. |
| `npm run check:dataconnect-auth` | Verifie les invariants auth des mutations SQL Connect: `@auth`, `@transaction`, lecture SQL `User`, check `role`, absence de `UpsertCurrentUser` exposee au client et absence de libelles RBAC obsoletes. | Ajoute post-audit. |
| `npm run check:dataconnect-queries` | Verifie que les queries SQL Connect ont `@auth`, que les listes larges restent bornees, et que les lectures contextualisees gardent leur filtre serveur. | Ajoute post-audit. |
| `npm run check:dataconnect-client-surface` | Verifie que `UpsertCurrentUser` reste absent des SDKs generes et du front applicatif. | Ajoute post-audit. |
| `npm run check:firebase-rules` | Verifie que Firestore/Storage restent en deny par defaut et refuse les ouvertures globales simples. | Ajoute post-audit. |
| `npm run check:production-guard` | Verifie que `package.json` et les workflows ne contiennent aucun deploy production automatise, `firebase init dataconnect` ou commande destructive distante evidente; seule l'exception locale bornee `reset:dataconnect:local` est autorisee. | Ajoute post-audit. |
| `npm run check:sandbox-guardrails` | Verifie que les scripts sandbox refusent le fichier exemple de profils avant toute lecture/mutation distante, que le seed sandbox bloque sans validation explicite, que les preuves sandbox hors `tmp/` sont refusees, que le comptage sandbox exige profils connus + preuve archivee, que le reset local Data Connect refuse sans confirmation, que les artefacts locaux sensibles restent ignores par git, que les sorties profils sont masquees et que les scripts ne regressent pas vers des UID/emails bruts. | Ajoute post-audit. |
| `npm run check:operational-lifecycle-readiness` | Verifie que la fiche `docs/17-operational-lifecycle-scenario.md`, la readiness, le runbook sandbox, l'audit de completion, Moteur live et `ci:sandbox` gardent le verrou metier du cycle nouveau client -> chantier -> factures. | Ajoute apres preuve lifecycle locale. |
| `npm run check:operational-lifecycle-proof` | Relit `tmp/checkpoint-002/operational-lifecycle-local.json` et verifie que la preuve emulateur contient un client operationnel, un chantier rattache, des factures rattachees, aucune action sandbox/production et aucune fuite previsionnelle operationnelle. A lancer apres `npm run checkpoint:002:emulator`; volontairement hors `ci:sandbox` car il depend d'un artefact `tmp/`. | Ajoute apres preuve lifecycle locale. |
| `npm run check:operational-lifecycle-decisions` | Echoue volontairement tant que les 9 reponses metier de `docs/17-operational-lifecycle-scenario.md` contiennent encore `A completer`; a lancer avant toute demande de validation sandbox, pas dans `ci:sandbox`. | Ajoute apres preuve lifecycle locale. |
| `npm run update:operational-lifecycle-decisions` | Applique localement les 9 reponses metier depuis un JSON ou un texte numerote fourni sous `tmp/`; accepte `--template`, `--text-template`, `--output=tmp/...` et `--dry-run`. Ne touche ni SQL Connect ni sandbox. | Ajoute pour debloquer proprement la fiche metier. |
| `npm run check:doc-entrypoints` | Verifie que `README.md`, `documentation.md`, `AGENTS.md`, `docs/00-index.md` et `docs/06-integrations.md` restent orientes vers checkpoint 002, que `/documentation` garde ses 8 chapitres structures sans recharger le gros seed previsionnel, et que le README ne revient pas au template Vite generique. | Ajoute post-audit. |
| `npm run check:doc-links` | Verifie que les liens Markdown locaux vers des fichiers `.md` existent dans `README.md`, `documentation.md`, `AGENTS.md` et `docs/`, et que les fichiers Markdown directs de `docs/` restent references dans `docs/00-index.md`. | Ajoute post-audit. |
| `npm run check:page-dataconnect-imports` | Refuse les imports directs `@dataconnect/generated` dans `src/pages`. | Ajoute post-audit. |
| `npm run check:generated-clean` | Echoue si les SDKs SQL Connect generes sont modifies sans regeneration controlee. | Ajoute post-audit. |
| `npm run audit:frontend-sources` | Cartographie imports seeds, usages applicatifs `localStorage`, Firestore et imports SQL directs dans les pages; accepte `--output=tmp/...` pour archiver une preuve JSON. | Ajoute post-audit, non bloquant. |
| `npm run audit:operational-lifecycle-completion` | Produit `tmp/checkpoint-002/operational-lifecycle-completion-audit.json`, un audit non bloquant du mapping objectif -> preuves -> blocages pour le cycle nouveau client operationnel. Le verdict reste `not-ready` tant que les 9 reponses metier sont absentes. | Ajoute apres audit de reprise. |
| `npm run ci:sandbox` | Enchaine lint, tests previsionnel, documents, access-control, data-state, checks secrets/auth/Firestore/UI/Documents/Data Connect/rules/production/sandbox guardrails/lifecycle/doc/adapters/SDK, puis build sandbox. | Ajoute post-audit. |
| `npm run checkpoint:002:local` | Lance `ci:sandbox`, l'audit sources front archivable, le dry-run comptage archivable, le dry-run seed sandbox et le dry-run provisioning SQL User. | Ajoute post-audit. |
| `npm run checkpoint:002:emulator` | Avec l'emulateur Data Connect deja lance, enchaine seed operationnel, seed previsionnel, verifications operationnel/previsionnel, garde frontiere operationnel/previsionnel, preuve statut chantier SQL, preuve edition client SQL, preuve profils/onboarding SQL, preuves email/planning/rapport SQL, comptage local propre, snapshot analytics SQL, preuve edition previsionnel SQL, preuve factures SQL, preuve documents SQL avec hash et lien facture, verification RBAC, puis trace SQL checkpoint/audit locale. | Ajoute post-audit. |
| `npm run verify:operational-boundary:dataconnect` | En emulateur, verifie que les listes `ListOperationalClients` et `ListOperationalChantiers` restent strictement sur le seed operationnel apres injection du previsionnel. | Ajoute post-audit. |
| `npm run verify:previsionnel-edits:dataconnect` | En emulateur, modifie puis restaure un montant mensuel previsionnel seed via `UpdatePrevisionnelMonthlyAmount`, puis ecrit une cellule de preuve via `UpsertPrevisionnelCellEdit`; la preuve est lancee apres snapshot analytics local. | Ajoute apres branchement Previsionnel. |
| `npm run verify:chantier-status:dataconnect` | En emulateur, modifie puis restaure le statut d'un chantier operationnel seed via `UpdateChantierStatut`, avec preuve archivee sous `tmp/` quand appele par le checkpoint. | Ajoute apres branchement Detail chantier. |
| `npm run verify:client-update:dataconnect` | En emulateur, modifie puis restaure un client operationnel seed via `UpdateClient`, avec preuve archivee sous `tmp/` quand appele par le checkpoint. | Ajoute apres branchement Detail client. |
| `npm run verify:factures:dataconnect` | En emulateur, cree une facture locale via `CreateFacture`, la relit, modifie son statut via `SetFactureStatut`, puis la relit par statut; la preuve est lancee apres comptage propre. | Ajoute apres branchement Factures. |
| `npm run verify:team-users:dataconnect` | En emulateur, cree et relit des profils SQL `User`, cree une `TeamProfileSubmission` via `SubmitCurrentTeamProfile`, verifie qu'un demandeur n'a pas de `User` avant conversion, refuse la conversion par une assistante, convertit via un gerant, conserve `sourceConnexion`, refuse une reconversion et relit le `User` SQL final; ne provisionne rien en sandbox. | Etendu apres audit front/remapping SQL. |
| `npm run verify:email:dataconnect` | En emulateur, cree un `EmailThread`, un `EmailMessage` et une `EmailAttachment`, classe le fil, relit le detail, les listes globales et `ListEmailThreadsByChantier` quand un chantier operationnel seed existe. | Etendu apres remapping Detail chantier. |
| `npm run verify:documents:dataconnect` | En emulateur, cree un `DocumentFolder`, un document libre et un document facture lie a un chantier, puis relit `storagePath`, `tailleBytes`, `sha256`, le lien facture et `ListDocumentsByChantier`. | Etendu apres remapping Detail chantier. |
| `npm run verify:planning:dataconnect` | En emulateur, cree un client, un chantier, un `PlanningEvent` et une `PlanningAssignment`, modifie titre/equipe/statut/creneau/notes via `UpdatePlanningEventDetails`, annule via `CancelPlanningEvent`, puis relit la carte par periode et via `ListPlanningEventsByChantier`. | Etendu apres remapping Detail chantier. |
| `npm run verify:team-rh:dataconnect` | En emulateur, cree une equipe source, une equipe finale, une fiche membre SQL liee a un `User`, deplace la fiche vers l'equipe finale, puis verifie conges, heures, paie, planning `sossonTeamId`, `PlanningJobSheet` et heures rattachees. | Ne touche pas la sandbox; couvre le workflow RH equipe final. |
| `npm run verify:reports:dataconnect` | En emulateur, cree un `AnalyticsSnapshot`, ecrit un payload JSON et un artefact CSV local sous `tmp/`, cree un `Rapport`, le marque genere avec le chemin/hash reel via `MarkRapportGenerated`, puis relit detail et listes. | Ajoute apres raccordement Rapports. |
| `npm run verify:dataconnect` | Verification seed simple local et listes operationnelles filtrees. | OK avec emulateur SQL Connect local. |
| `npm run verify:previsionnel:dataconnect` | Verification seed previsionnel local. | OK avec emulateur SQL Connect local. |
| `npm run verify:dataconnect:rbac` | Verification locale des checks role SQL Connect sur mutations sensibles. | OK avec emulateur SQL Connect local. |
| `npm run verify:checkpoint-audit:dataconnect` | Ecrit puis relit `CheckpointRun`, `CheckpointStep`, `CheckpointArtifact`, `CheckpointDecision`, `DataImportRun`, `DataImportIssue`, `AuditEvent` et `EntityChangeLog` dans l'emulateur. | Local uniquement, aucune sandbox. |

Les scripts `verify:*:dataconnect` verifient maintenant que l'emulateur ecoute sur `127.0.0.1:9399` avant d'appeler le SDK admin. Si l'emulateur est absent, l'echec est attendu et indique la commande a lancer.

## Smoke checklist manuelle

1. Login Firebase sandbox avec un utilisateur reel.
2. Refresh navigateur sur `/dashboard`: rester connecte apres rehydratation.
3. Verifier `/clients`, `/chantiers`, `/factures` avec SQL Connect disponible puis indisponible.
4. Creer une facture en mode SQL Connect, verifier son apparition et le statut.
5. Ouvrir un chantier sans factures et avec budget nul: aucune valeur `NaN` ou `Infinity`.
6. Ouvrir `/previsionnel/tableur`, charger l'exercice `2025-26`, modifier une cellule, sauvegarder SQL.
7. Verifier que `/emails` indique clairement le statut local Outlook et ne suppose pas une integration hebergee.
8. Tester un role non gerant sur les pages sensibles.

## Verification statique recommandee

- Rechercher les secrets front: `npm run check:front-secrets` puis `rg -n "VITE_.*(SECRET|TOKEN|REFRESH|PASSWORD)" .`
- Cartographier les sources hybrides: `npm run audit:frontend-sources -- --output=tmp/checkpoint-002/frontend-sources.json`
- Rechercher les imports de seeds dans les pages: `rg -n "from ['\\\"]@/data" src/pages src/lib src/features`
- Rechercher Firestore: `rg -n "firebase/firestore|getDoc|collection|doc\\(" src`
- Rechercher localStorage structurant: `rg -n "localStorage" src`
- Verifier les garde-fous auth: `npm run check:auth-safety`
- Verifier que les SDKs generes n'ont pas ete modifies a la main: `npm run check:generated-clean`
- Verifier les points d'entree et liens de documentation: `npm run check:doc-entrypoints && npm run check:doc-links`

## CI sandbox

Une CI simple existe maintenant dans `.github/workflows/sandbox-checks.yml`.
Elle execute `npm run ci:sandbox` apres `npm ci`, pour rester alignee avec la CI locale. `npm run check:production-guard` verifie aussi cette delegation pour eviter une derive future du workflow. Cette commande regroupe:

```bash
npm run lint
npm run test:previsionnel
npm run test:documents
npm run test:access-control
npm run test:data-state
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
npm run check:operational-lifecycle-readiness
npm run check:doc-entrypoints
npm run check:doc-links
npm run check:page-dataconnect-imports
npm run check:generated-clean
npm run build:sandbox
```

Elle ne deploie rien. Elle ne verifie pas l'emulateur SQL Connect, car ce dernier demande une orchestration locale specifique.

## Preflight checkpoint 002 local

```bash
npm run checkpoint:002:local
```

Cette commande regroupe les preuves locales non destructives:

- `npm run ci:sandbox`;
- `npm run audit:frontend-sources -- --output=tmp/checkpoint-002/frontend-sources.json`;
- `npm run count:dataconnect -- --dry-run --output=tmp/checkpoint-002/counts-dry-run.json`;
- `npm run seed:sandbox -- --dry-run --kind=previsionnel --output=tmp/checkpoint-002/seed-sandbox-dry-run.json`;
- `npm run provision:sql-users -- --file=dataconnect/user_profiles.example.json --dry-run`.

Elle ne valide pas la sandbox distante: emulateur SQL Connect, seed reel, comptage sandbox, vrais profils SQL `User`, deploy/test rules sandbox, RBAC serveur, Storage produit et monitoring restent hors de son perimetre.

## Verification checkpoint 002 avec emulateur

Dans un terminal:

```bash
npm run emulators:dataconnect
```

Dans un second terminal:

```bash
npm run checkpoint:002:emulator
```

Cette commande ne touche pas a la sandbox distante. Elle execute:

- `npm run seed:dataconnect`;
- `npm run seed:previsionnel:dataconnect`;
- `npm run verify:dataconnect`;
- `npm run verify:previsionnel:dataconnect`;
- `npm run count:dataconnect -- --output=tmp/checkpoint-002/counts-local.json`;
- validation des volumes propres avant RBAC;
- `npm run verify:dataconnect:rbac`.

Si l'emulateur n'ecoute pas sur `127.0.0.1:9399`, la commande echoue proprement avec la commande de demarrage attendue. Si l'emulateur contient deja des lignes creees par une verification RBAC precedente, elle echoue avant de relancer RBAC pour eviter d'archiver un comptage local pollue.

L'etat local de l'emulateur peut persister dans `dataconnect/.dataconnect/pgliteData`. Pour repartir d'une base locale propre, arreter l'emulateur puis lancer explicitement:

```bash
npm run reset:dataconnect:local -- --yes-local-reset
```

Cette commande supprime uniquement l'etat pglite local ignore par git; elle refuse de s'executer si l'emulateur ecoute encore sur `127.0.0.1:9399`.

## Smoke checklist checkpoint 002

Avant de declarer la sandbox saine:

1. Se connecter avec un vrai compte Firebase sandbox.
2. Verifier que `GetCurrentUser` retourne un profil SQL `User`.
3. Verifier qu'un compte Firebase sans profil SQL n'entre pas silencieusement dans l'app.
4. Charger clients/chantiers/factures avec SQL Connect actif.
5. Confirmer que les donnees Excel historiques ne polluent pas les listes operationnelles.
6. Importer un document localement et verifier que le chemin metadata commence par `pending-documents/`.
7. Tester les erreurs SQL Connect: l'UI doit afficher un fallback ou un message clair, jamais une page blanche.

## Gates avant production

- Lint et build prod OK.
- Regles Firestore/Storage validees en sandbox.
- SQL Connect RBAC serveur en place pour les mutations sensibles.
- Aucun fallback auth local.
- Aucun secret serveur dans le bundle ou les docs.
- Runbook de rollback et monitoring minimum prets.
