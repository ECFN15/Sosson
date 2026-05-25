# 12 - Roadmap agents IA

> Statut: draft  
> Derniere revision: 2026-05-16  
> Portee: repartition du travail entre agents IA specialises apres l'audit checkpoint 001.

## Principe d'execution

Les agents travaillent sur des lots courts, commitables et verifiables. Aucun agent ne modifie les SDKs generes SQL Connect a la main. Toute evolution de `dataconnect/schema/schema.gql`, `queries.gql` ou `mutations.gql` doit etre suivie d'une generation SDK controlee.

Ordre recommande:

1. Securite/Auth.
2. SQL Connect/Data.
3. Front data hooks.
4. Documents/Storage.
5. QA/CI.
6. Documentation junior.
7. Exploitation/couts.

## Cloture checkpoint 001

Objectif: fermer le checkpoint 001 sans supposer que la sandbox distante est deja validee. Tout item ci-dessous doit avoir un owner explicite et une preuve concrete avant d'etre coche dans le checkpoint 002.

| Item | Etat au 2026-05-16 | Owner responsable | Preuve attendue checkpoint 002 |
|---|---|---|---|
| Validation sandbox reelle | Preparee, non executee dans ce lot sans validation humaine. | Agent QA/CI + humain Firebase | Logs `firebase deploy --only firestore:rules,storage,dataconnect --project sosson-sandbox` ou commande equivalente validee humainement. |
| Etat chiffre base distante | Non confirme. Les chiffres connus de seed sont locaux/generes. | Agent Data / SQL Connect | Comptage sandbox par table: `User`, `Client`, `Chantier`, `Devis`, `Facture`, tables previsionnelles, documents. |
| Seed sandbox reel | Seed repo documente, injection sandbox non confirmee. | Agent Data / SQL Connect | Runbook execute + verification sandbox des volumes attendus. |
| Decisions ouvertes | Liste maintenue dans ce document et checkpoint 001. | Lead produit + Agent Architecture | ADR ou section decision pour operationnel vs previsionnel, Graph email, RBAC. |
| Risques temporairement acceptes | RBAC SQL implemente localement mais non prouve sandbox, Storage produit non branche, Firestore profil transitoire, localStorage brouillons. | Agent Securite | Risques cites avec mitigation et gate de sortie. |
| Gates production | Production explicitement non prete. | Agent Exploitation | Checklist production readiness completee sans exception critique. |
| Plan checkpoint 002 | Ce document devient le plan d'execution. | Tous agents | Chaque phase a un livrable verifiable et des commandes associees. |

### Decisions ouvertes a trancher avant checkpoint 002

1. Provisioning `User` SQL: allowlist repo, script admin local, console Firebase Auth + seed admin, ou Cloud Function admin.
2. Separation `Client`/`Chantier`: `origineImport` et les queries `ListOperationalClients` / `ListOperationalChantiers` sont appliques localement; reste a valider/deployer en sandbox.
3. Documents: upload direct Storage signe par backend ou maintien metadata SQL seule jusqu'au lot Storage.
4. Email: confirmer Microsoft Graph comme integration cible ou limiter le module a une preuve locale.
5. Pagination: seuils serveur par page metier avant d'exposer les gros jeux previsionnels.

### Risques temporairement acceptes

| Risque | Pourquoi accepte temporairement | Sortie attendue |
|---|---|---|
| `@auth(level: USER)` sans RBAC serveur fin | RBAC serveur applique localement sur mutations sensibles, non encore prouve sandbox. | Deploy/test sandbox avec vrais profils SQL. |
| Profil Firestore encore fallback transitoire | Le profil SQL est maintenant tente en premier, mais la sandbox peut ne pas etre seedee. | `User` SQL provisionne et Firestore retire du login. |
| Provisioning SQL `User` non valide sandbox | `UpsertCurrentUser` retire du connecteur client; SDKs regeneres; provisioning par Admin SDK direct prepare; scripts sandbox refusent les fichiers exemples et masquent les sorties profils. | Valider le provisioning sandbox avec vrais UID Firebase Auth et preuves `uidFingerprint` + domaine email. |
| localStorage permissions/equipe | Sert d'UI locale, pas de source d'autorisation serveur. | RBAC SQL / backend + suppression des decisions de securite localStorage. |
| Storage deny par defaut | Evite une ouverture globale avant flux produit. | Chemins canoniques + URLs signees + rules testees. |

### Gates production

- Sandbox deployee et smoke testee.
- Profil applicatif charge depuis SQL `User`.
- Aucun navigateur ne choisit son role.
- RBAC serveur sur clients, chantiers, factures, documents et previsionnel editable.
- Storage documents avec chemins canoniques et validation serveur.
- CI verte: lint, tests previsionnel/documents/access-control, checks secrets/auth/Firestore/UI/Documents/Data Connect/rules/production/sandbox guardrails/doc entrypoints/adapters/SDK, build sandbox.
- Verification secrets: aucune variable `VITE_*SECRET`, `VITE_*TOKEN`, `VITE_*REFRESH`, `VITE_*PASSWORD`.
- `npm run check:generated-clean` vert: aucun SDK SQL Connect genere modifie a la main.
- `npm run check:sandbox-guardrails` vert: fichiers exemples refuses, reset local Data Connect bloque sans confirmation, artefacts locaux ignores, sorties profils masquees.
- `npm run audit:frontend-sources` archive dans le checkpoint 002 pour suivre la sortie du mode hybride.
- `npm run count:dataconnect` execute localement ou sur sandbox validee humainement pour produire les volumes reels.
- Backup/rollback Cloud SQL documente.
- Budget alerts GCP configurees.

### Plan checkpoint 002

1. Executer les verifications locales et noter les echecs lies a l'emulateur.
2. Valider ou refuser humainement les deploys sandbox necessaires.
3. Provisionner au moins un `User` SQL sandbox avec UID Firebase reel.
4. Compter les tables sandbox et rapprocher les volumes du seed attendu, avec preuves profils masquees (`uidFingerprint` + domaine email).
5. Valider la colonne `origineImport`, les queries `ListOperationalClients` / `ListOperationalChantiers` et les SDKs regeneres sur sandbox.
6. Deployer/verifier les checks role des mutations sensibles et le provisioning admin direct des `User`.
7. Brancher les pages principales sur adapters metier avec source explicite.

## Agent 1 - Securite / Auth

### Objectif

Supprimer les fausses garanties de securite cote client et poser un modele d'autorisation serveur.

### Fichiers principaux

- `src/lib/auth.ts`
- `src/lib/store.tsx`
- `src/lib/accessControl.ts`
- `firestore.rules`
- `storage.rules`
- `dataconnect/sosson/mutations.gql`
- `docs/10-securite.md`

### Travail

1. Remplacer le profil applicatif Firestore par SQL Connect `GetCurrentUser`.
2. Garder Firestore seulement comme transitoire documente.
3. Verifier que `UpsertCurrentUser` reste absent des SDKs generes.
4. Ajouter une strategie de provisioning: allowlist, script admin ou mutation admin controlee.
5. Appliquer les droits `create/edit/admin` aux boutons et formulaires sensibles.
6. Documenter que `localStorage` n'est jamais une source d'autorisation.

### Validation

- Login Firebase reel charge un profil SQL.
- Un utilisateur sans profil SQL n'a pas d'acces silencieux.
- Aucun role privilegie n'est defini depuis le navigateur.
- `npm run lint` et `npm run build:sandbox` OK.

## Agent 2 - Data / SQL Connect

### Objectif

Rendre SQL Connect lisible, fiable et aligne avec les usages produit.

### Fichiers principaux

- `dataconnect/schema/schema.gql`
- `dataconnect/sosson/queries.gql`
- `dataconnect/sosson/mutations.gql`
- `dataconnect/seed_data.gql`
- `dataconnect/previsionnel_seed_data.gql`
- `scripts/verify-*.mjs`
- `src/lib/dataconnect.ts`

### Travail

1. Valider que les listes operationnelles restent filtrees sur `origineImport = "operationnel"`.
2. Verifier que le seed previsionnel marque bien les lignes en `origineImport = "previsionnel"`.
3. Maintenir les queries dediees:
   - `ListOperationalClients`
   - `ListOperationalChantiers`
   - `ListPrevisionnelLinesByExercise`
   - `ListDocumentsByChantier`
4. Ajouter pagination ou filtres aux listes larges.
5. Clarifier les scripts de verification:
   - seed simple
   - seed previsionnel
   - verification combinee
6. Preparer la regeneration SDK.

### Validation

- Le store ne charge pas 898 chantiers historiques comme chantiers vivants.
- Les pages clients/chantiers restent coherentes avec UUID SQL.
- Les verify scripts indiquent clairement ce qu'ils verifient.

## Agent 3 - Frontend data hooks

### Objectif

Remplacer le store global hybride par des hooks metier explicites.

### Fichiers principaux

- `src/lib/store.tsx`
- `src/pages/ClientsPage.tsx`
- `src/pages/ChantiersPage.tsx`
- `src/pages/FacturesPage.tsx`
- `src/pages/DashboardPage.tsx`
- `src/pages/StatistiquesPage.tsx`
- `src/pages/PrevisionnelSpreadsheetPage.tsx`

### Travail

1. Creer `src/features/clients/`, `src/features/chantiers/`, `src/features/factures/`, `src/features/previsionnel/`.
2. Extraire les mappings SQL -> modeles UI.
3. Standardiser `loading`, `error`, `empty`, `source`.
4. Rendre les brouillons locaux explicites.
5. Eviter que les pages importent directement `@dataconnect/generated`.

### Etat applique au 16 mai 2026

- `src/features/auth/`, `src/features/operations/`, `src/features/factures/`, `src/features/documents/` et `src/features/previsionnel/` existent.
- Les pages n'importent plus directement `@dataconnect/generated`.
- Le store global reste hybride et doit encore etre reduit par domaine.
- Les aggregats dashboard/statistiques restent majoritairement dans les pages; seule la frontiere SQL est extraite.

### Validation

- Chaque page indique si elle lit SQL ou fallback.
- Les erreurs SQL ne cassent pas le rendu.
- Les actions locales non synchronisees sont visibles comme telles.

## Agent 4 - Documents / Storage

### Objectif

Rendre les documents durables et securises.

### Fichiers principaux

- `src/pages/DocumentsPage.tsx`
- `dataconnect/schema/schema.gql`
- `dataconnect/sosson/mutations.gql`
- `storage.rules`
- `firebase.json`

### Travail

1. Definir les chemins Storage canoniques.
2. Interdire `storagePath` externe ou arbitraire.
3. Ajouter upload Storage reel ou endpoint serveur signe.
4. Lier chaque metadata SQL a un objet Storage confirme.
5. Garder `URL.createObjectURL` uniquement pour preview locale.

### Validation

- Un fichier reste disponible apres refresh.
- Un utilisateur non autorise ne peut pas lire/ecrire un chemin arbitraire.
- La metadata SQL et l'objet Storage restent coherents.

## Agent 5 - QA / CI

### Objectif

Rendre les controles repetables.

### Fichiers principaux

- `package.json`
- `eslint.config.js`
- `.github/workflows/*` si CI ajoutee
- `scripts/*`
- `docs/08-quality-checks.md`

### Travail

1. Ajouter une CI `lint + test:previsionnel + build:sandbox`.
2. Ajouter un smoke script simple si possible.
3. Ajouter un check statique secrets front.
4. Ajouter un check que les SDKs generes ne sont pas modifies manuellement.
5. Verrouiller les garde-fous sandbox: pas de fichier exemple pour les actions distantes, artefacts locaux ignores, sorties profils masquees.

### Etat applique au 16 mai 2026

- `.github/workflows/sandbox-checks.yml` execute `npm run ci:sandbox` apres `npm ci`, pour rester aligne avec la chaine locale.
- `npm run ci:sandbox` regroupe les controles locaux.
- `npm run checkpoint:002:local` ajoute audit front hybride, dry-run comptage et dry-run provisioning.
- `npm run seed:sandbox -- --dry-run --kind=previsionnel --output=tmp/checkpoint-002/seed-sandbox-dry-run.json` prepare et archive la liste des seeds sandbox; l'execution reelle est gardee par `ALLOW_SANDBOX_DATACONNECT_SEED=true`, `--sandbox` et `--yes-sandbox`.
- `npm run check:sandbox-guardrails` couvre les scenarios negatifs sandbox, le refus du reset local sans confirmation, l'ignore git des preuves locales / `pgliteData` et la non-regression vers des UID/emails bruts.
- `npm run check:doc-entrypoints` bloque le retour du README template Vite, verifie les points d'entree checkpoint 002 et garde la page `/documentation` en 8 chapitres separes.
- `npm run check:doc-links` bloque les liens Markdown locaux morts dans `README.md`, `documentation.md`, `AGENTS.md` et `docs/`.

### Validation

- PR bloquee si lint/build/test echoue.
- Les commandes locales et CI donnent les memes resultats.
- Les actions sandbox reelles restent hors CI et demandent validation humaine.

## Agent 6 - Documentation junior

### Objectif

Rendre le backend comprehensible par un developpeur junior.

### Fichiers principaux

- `docs/05-sql-connect.md`
- `docs/00-index.md`
- `docs/10-runbooks.md`
- `docs/11-audit-checkpoint-001.md`

### Travail

1. Expliquer SQL Connect depuis zero.
2. Montrer les fichiers, flux, schemas et commandes.
3. Expliquer ce qui est vraiment en base, ce qui est local, ce qui est seed.
4. Expliquer le tableur Excel/previsionnel et ses tables.
5. Ajouter diagrammes Mermaid, arbres de fichiers, exemples de lecture.

### Validation

- Un junior peut expliquer le trajet: login -> query -> Postgres -> page React.
- Un junior peut dire si une donnee est SQL, Firestore, localStorage ou seed.

## Agent 7 - Exploitation / Couts

### Objectif

Preparer une sandbox exploitable et une production non dangereuse.

### Fichiers principaux

- `docs/04-firebase-sandbox-prod.md`
- `docs/09-couts.md`
- `docs/10-runbooks.md`
- `firebase.json`
- `.firebaserc`

### Travail

1. Ajouter budget alerts et seuils cibles.
2. Documenter logs/monitoring minimum.
3. Executer et prouver le seed sandbox reel apres validation humaine.
4. Ajouter checklist production readiness.
5. Revoir sourcemaps et taille bundles.

### Validation

- Sandbox deployable avec runbook.
- Production bloquee tant que les gates ne sont pas verts.
- Les couts Cloud SQL/Data Connect/Storage sont suivis.
