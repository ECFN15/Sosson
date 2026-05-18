# 10 - Runbooks

> Statut: draft  
> Derniere revision: 2026-05-17  
> Portee: operations locales et sandbox. Production exclue sans validation humaine.

## Developpement front sandbox

```bash
npm run dev
```

Ouvre l'app en mode sandbox. Le fallback auth local reste desactive sauf si `VITE_ENABLE_LOCAL_AUTH_FALLBACK=true` est explicitement defini localement.

## Build et QA

```bash
npm run lint
npm run test:previsionnel
npm run test:documents
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
npm run build:sandbox
```

Le build sandbox peut emettre un warning de chunks > 500 kB. Ce n'est pas bloquant au checkpoint 002 local, mais c'est a traiter avant production readiness.

Preflight local complet pour checkpoint 002:

```bash
npm run checkpoint:002:local
```

Cette commande ne deploie rien et n'accede pas a la sandbox distante. Elle produit une preuve dry-run sous `tmp/checkpoint-002/`.

## Garde-fous rules Firebase

```bash
npm run check:firebase-rules
```

Ce check statique verifie que:

- Firestore garde `users/{userId}` lisible uniquement par l'utilisateur lui-meme;
- Firestore interdit l'ecriture client sur `users/{userId}`;
- Firestore garde un catch-all `allow read, write: if false`;
- Storage garde un catch-all `allow read, write: if false`;
- aucune ouverture globale simple du type `allow read, write: if request.auth != null` n'est introduite.

Ce check ne remplace pas les tests rules en sandbox apres deploy, mais il evite une regression locale evidente.

## Garde-fou production

```bash
npm run check:production-guard
```

Ce check verifie que:

- `package.json` ne contient aucun script automatisant `firebase deploy`;
- `ci:sandbox` ne cible ni `build:prod`, ni `dev:prod`, ni `sosson-prod`;
- le workflow GitHub sandbox execute `npm run ci:sandbox` pour rester aligne avec la CI locale;
- les workflows GitHub ne ciblent pas la production et ne deployent pas Firebase.
- aucun script `package.json` ou workflow ne lance `firebase init dataconnect`.
- aucun script `package.json` ou workflow ne contient de commande destructive evidente (`firebase/gcloud delete`, `destroy`, `drop`, `truncate`, `reset`), sauf `reset:dataconnect:local` strictement borne a l'etat pglite local de l'emulateur.
- `npm run dashboard` bloque les actions production par defaut et exige `ALLOW_PRODUCTION_DASHBOARD=true` en plus des confirmations interactives.

Les outils interactifs de `deploy/` peuvent encore connaitre la production, mais ils ne doivent pas etre appeles par la CI tant que la production readiness n'est pas validee.

## Garde-fous operations sandbox

```bash
npm run check:sandbox-guardrails
```

Ce check lance des scenarios negatifs sans reseau:

- provisioning sandbox avec `dataconnect/user_profiles.example.json` et variable d'autorisation presente: doit echouer avant mutation;
- seed sandbox sans `ALLOW_SANDBOX_DATACONNECT_SEED=true`: doit echouer avant ecriture distante;
- comptage sandbox avec `dataconnect/user_profiles.example.json` et variable d'autorisation presente: doit echouer avant lecture distante;
- reset local Data Connect sans `--yes-local-reset`: doit echouer avant suppression;
- aucune preuve JSON ne doit etre ecrite pour ce scenario refuse.
- `.env.local`, `dataconnect/user_profiles.local.json`, `dataconnect/.dataconnect/pgliteData` et les preuves `tmp/checkpoint-002/*.json` doivent rester ignores par git.

## SQL Connect local

Lancer l'emulateur dans un premier terminal:

```bash
npm run emulators:dataconnect
```

Dans un second terminal, rejouer la verification locale complete checkpoint 002:

```bash
npm run checkpoint:002:emulator
```

Cette commande enchaine seed operationnel, seed previsionnel, verifications operationnel/previsionnel, garde frontiere operationnel/previsionnel archive sous `tmp/checkpoint-002/operational-boundary-local.json`, preuve statut chantier `UpdateChantierStatut` archivee sous `tmp/checkpoint-002/chantier-status-local.json`, preuve edition client `UpdateClient` archivee sous `tmp/checkpoint-002/client-update-local.json`, verification locale `ListUsers` archivee sous `tmp/checkpoint-002/team-users-local.json`, preuve email SQL archivee sous `tmp/checkpoint-002/email-local.json`, preuve planning SQL archivee sous `tmp/checkpoint-002/planning-local.json`, preuve rapport SQL archivee sous `tmp/checkpoint-002/report-local.json`, comptage local propre archive sous `tmp/checkpoint-002/counts-local.json`, snapshot analytics SQL archive sous `tmp/checkpoint-002/analytics-snapshot-local.json`, preuve edition previsionnel `UpdatePrevisionnelMonthlyAmount`/`UpsertPrevisionnelCellEdit` archivee sous `tmp/checkpoint-002/previsionnel-edits-local.json`, preuve factures `CreateFacture`/`SetFactureStatut` archivee sous `tmp/checkpoint-002/factures-local.json`, preuve documents SQL archivee sous `tmp/checkpoint-002/documents-local.json`, verification RBAC, puis trace SQL checkpoint/audit locale. Elle ne touche pas a la sandbox distante. Si l'emulateur contient deja des lignes creees par une verification RBAC precedente, elle echoue avant RBAC pour eviter une preuve de comptage polluee.

La trace checkpoint/audit locale peut aussi etre lancee seule:

```bash
npm run verify:checkpoint-audit:dataconnect
```

Elle ecrit puis relit les tables `CheckpointRun`, `CheckpointStep`, `CheckpointArtifact`, `CheckpointDecision`, `DataImportRun`, `DataImportIssue`, `AuditEvent` et `EntityChangeLog` dans l'emulateur, puis archive la preuve sous `tmp/checkpoint-002/checkpoint-audit-local.json`.

Le snapshot analytics local est produit par:

```bash
npm run snapshot:analytics:dataconnect
```

Il cree puis relit un `AnalyticsSnapshot` `dashboard-global` dans l'emulateur uniquement.

Si la commande signale un comptage local pollue, l'etat pglite de l'emulateur doit etre supprime explicitement. Arreter d'abord `npm run emulators:dataconnect`, puis lancer:

```bash
npm run reset:dataconnect:local -- --yes-local-reset
```

Ce reset supprime uniquement `dataconnect/.dataconnect/pgliteData`, ignore par git. Il refuse de s'executer si l'emulateur ecoute encore sur `127.0.0.1:9399`.

Injecter le seed simple local:

```bash
npm run seed:dataconnect
npm run verify:dataconnect
npm run verify:dataconnect:rbac
```

Provisionner les profils applicatifs SQL `User` en local:

```bash
cp dataconnect/user_profiles.example.json dataconnect/user_profiles.local.json
# Remplir dataconnect/user_profiles.local.json avec les UID Firebase Auth reels.
npm run provision:sql-users -- --dry-run
npm run provision:sql-users
```

Le fichier `dataconnect/user_profiles.local.json` est ignore par git. Il ne doit contenir aucun mot de passe ni secret: uniquement UID Firebase Auth, email, nom, prenom, role et avatar.
En mode sandbox reel, les scripts refusent volontairement `dataconnect/user_profiles.example.json` et les profils placeholders.
Les sorties console masquent les UID/emails; le script de comptage archive des `uidFingerprint` et domaines email plutot que les identifiants complets.

Generer et injecter le seed previsionnel local:

```bash
npm run seed:previsionnel:generate
npm run seed:previsionnel:dataconnect
npm run verify:previsionnel:dataconnect
```

Attention: les verifications `verify:dataconnect` et `verify:previsionnel:dataconnect` n'attendent pas les memes volumes. Ne pas les interpreter comme un `verify:all` cumulatif.

Verifier le RBAC serveur local:

```bash
npm run verify:dataconnect:rbac
```

Cette commande provisionne des profils locaux `gerant`, `assistante` et `chef_chantier` dans l'emulateur, puis verifie qu'une mutation autorisee passe et qu'une mutation interdite echoue.

Compter les donnees Data Connect locales:

```bash
npm run count:dataconnect
```

Avec verification de profils connus:

```bash
npm run count:dataconnect -- --user-profiles=dataconnect/user_profiles.local.json
```

Pour archiver une preuve locale ou sandbox sans risque de commit accidentel, utiliser `--output` sous `tmp/`:

```bash
npm run count:dataconnect -- --output=tmp/checkpoint-002/counts-local.json
```

Le script refuse volontairement `--output` hors de `tmp/`.

## Sandbox Firebase

Commande de deploy SQL Connect sandbox connue:

```bash
firebase deploy --only dataconnect --project sosson-sandbox
```

Ne pas deployer production depuis ce runbook.

### Action risquee: deploy sandbox

Un deploy sandbox modifie un environnement Firebase reel. Avant execution:

1. annoncer exactement le scope (`firestore:rules`, `storage`, `dataconnect`, `hosting`);
2. confirmer le projet actif avec `firebase use` ou `--project sosson-sandbox`;
3. verifier qu'aucune commande ne cible `sosson-prod`;
4. demander validation humaine.

Commandes preparees, a executer seulement apres validation:

```bash
firebase deploy --only firestore:rules,storage --project sosson-sandbox
firebase deploy --only dataconnect --project sosson-sandbox
```

### Action risquee: seed Data Connect sandbox

Le seed sandbox ecrit dans une base distante reelle. Il est prepare par script garde, mais ne doit etre execute qu'apres validation humaine.

Dry-run sans mutation:

```bash
npm run seed:sandbox -- --dry-run --kind=all --output=tmp/checkpoint-002/seed-sandbox-dry-run.json
```

Execution reelle sandbox, uniquement apres validation:

```bash
ALLOW_SANDBOX_DATACONNECT_SEED=true npm run seed:sandbox -- --sandbox --yes-sandbox --kind=all
```

Le script execute `dataconnect/seed_data.gql`, puis les chunks `dataconnect/previsionnel_seed/*.gql`. En cas d'echec partiel, ne pas supprimer de donnees: noter le fichier en erreur et corriger avant relance validee.

### Action risquee: provisioning `User` SQL sandbox

Le provisioning `User` SQL modifie la base distante et fixe les roles applicatifs. Il remplace l'idee dangereuse d'un navigateur qui choisirait son propre role.

Avant execution:

1. creer ou verifier les comptes Firebase Auth sandbox;
2. relever les UID Firebase Auth reels;
3. remplir `dataconnect/user_profiles.local.json` localement;
4. executer `npm run provision:sql-users -- --dry-run`;
5. demander validation humaine avant la mutation distante.

Le script bloque la mutation sandbox si le fichier exemple ou un UID placeholder est detecte.

Commande preparee, a executer seulement apres validation:

```bash
ALLOW_SANDBOX_USER_PROVISIONING=true npm run provision:sql-users -- --sandbox --yes-sandbox --file=dataconnect/user_profiles.local.json
```

Cette commande n'est pas un seed public: elle affecte des roles applicatifs et doit rester tracee dans le checkpoint.

### Comptage sandbox attendu checkpoint 002

Le checkpoint 002 doit produire un tableau de comptage distant, par exemple:

| Table | Attendu seed simple | Attendu previsionnel | Reel sandbox |
|---|---:|---:|---:|
| User | 0 via seed simple | 0 via seed previsionnel | a mesurer |
| Client | 3 | 586 environ | a mesurer |
| Chantier | 4 | 898 environ | a mesurer |
| Facture | 12 | 0 | a mesurer |
| PrevisionnelExercise | 0 | 13 | a mesurer |
| PrevisionnelLine | 0 | 898 | a mesurer |

Ces chiffres ne doivent pas etre recopies comme preuve distante: ils servent seulement de reference pour comparer apres verification.

Commande de comptage distante preparee, lecture seule mais a executer seulement apres validation humaine car elle interroge une base reelle:

```bash
ALLOW_SANDBOX_DATACONNECT_READ=true npm run count:dataconnect -- --sandbox --yes-sandbox --user-profiles=dataconnect/user_profiles.local.json --output=tmp/checkpoint-002/counts-sandbox.json
```

La sortie JSON doit etre copiee dans le checkpoint 002. Si `lineQueryMayBeTruncated` vaut `true`, il faut ajouter une query paginee ou un vrai comptage serveur avant de considerer les volumes previsionnels comme totalement prouves.
Le comptage sandbox refuse aussi `dataconnect/user_profiles.example.json`, car une preuve checkpoint avec des UID placeholders serait inutilisable.
En mode sandbox, `--user-profiles` et `--output` sont obligatoires: un comptage distant sans profils attendus ni archive JSON ne valide pas checkpoint 002.
La section `knownUserProfiles` doit contenir des empreintes (`uidFingerprint`), domaines email et roles attendus, pas les UID/emails complets. Le script echoue si un profil attendu est absent de SQL `User` ou si le role SQL ne correspond pas au role du fichier valide humainement.

## Garde-fous documentation

```bash
npm run check:doc-entrypoints
npm run check:doc-links
```

Ces checks verifient que:

- `README.md` ne revient pas au template Vite generique;
- `README.md`, `documentation.md` et `AGENTS.md` pointent vers les commandes checkpoint 002;
- `docs/00-index.md` garde les chapitres actifs essentiels;
- `docs/06-integrations.md` garde la clarification Outlook/Microsoft Graph vs Gmail historique;
- les liens Markdown locaux vers des fichiers `.md` existent toujours;
- chaque fichier Markdown direct de `docs/` reste reference dans `docs/00-index.md`.

## Exploitation sandbox: budget, monitoring, backup

Ces actions preparent l'exploitation. Elles ne prouvent rien tant qu'elles ne sont pas configurees dans le projet Firebase/GCP reel.

### Budget alerts

Minimum checkpoint 002:

1. budget GCP explicite pour `sosson-sandbox`;
2. alerte email a 50 %, 80 % et 100 %;
3. owner humain des alertes identifie;
4. capture ou note de configuration ajoutee au checkpoint.

Ne jamais mettre l'adresse email personnelle ou un identifiant sensible dans le repo. Documenter seulement le fait que l'alerte existe et son owner role (`gerant`, `admin GCP`, etc.).

### Monitoring minimal Cloud SQL / SQL Connect

Tableau attendu dans le checkpoint 002:

| Signal | Pourquoi | Seuil de revue |
|---|---|---|
| Cloud SQL CPU | Detecter une requete large ou un import abusif. | > 60 % soutenu pendant 15 min. |
| Cloud SQL connexions | Detecter fuite de connexions ou client boucle. | Croissance continue sans retour a la normale. |
| Cloud SQL stockage | Eviter une facture surprise et verifier les imports. | > 50 % du stockage alloue. |
| SQL Connect erreurs | Detecter RBAC casse, schema non deploye, requetes invalides. | Toute hausse apres deploy. |
| Latence listes larges | Detecter besoin de pagination. | Pages metier lentes ou timeouts. |

Le checkpoint doit noter le lien console ou la capture interne, mais pas de token ni secret.

### Backup Cloud SQL

Etat cible avant production:

1. sauvegardes automatiques Cloud SQL activees;
2. retention documentee;
3. procedure de restore testee sur sandbox ou instance jetable;
4. point de restauration note avant toute migration Data Connect risquee.

Avant une migration schema/Data Connect en sandbox, noter dans le checkpoint:

```text
Date/heure:
Projet:
Instance:
Database:
Migration prevue:
Backup/restore point disponible:
Owner validation:
```

### Rollback

Rollback applicatif:

1. revenir au dernier commit/deploy Hosting connu;
2. redeployer seulement sandbox;
3. verifier login + dashboard + listes operationnelles.

Rollback Data Connect:

1. ne pas improviser de suppression de donnees;
2. identifier la migration fautive;
3. restaurer depuis backup si les donnees sont corrompues;
4. sinon deployer un correctif schema/queries/mutations;
5. regenerer les SDKs et relancer `npm run ci:sandbox`.

Production reste bloquee tant qu'un restore sandbox n'a pas ete teste ou formellement reporte avec owner et date.

## Outlook local

Le flux Outlook actuel est une preuve locale:

```bash
npm run outlook:local
```

Le secret Microsoft reste uniquement local ou serveur. Il ne doit jamais etre prefixe `VITE_`.

## Verification secrets

```bash
npm run check:front-secrets
npm run check:auth-safety
rg -n "VITE_.*(SECRET|TOKEN|REFRESH|PASSWORD)" .
rg -n "MICROSOFT_CLIENT_SECRET|CLIENT_SECRET" src docs scripts .env.example
```

Ne pas afficher ni recopier les valeurs reelles de `.env.local`.

## Garde-fous auth

```bash
npm run check:auth-safety
npm run check:firestore-boundary
npm run check:ui-capabilities
npm run check:document-storage
npm run check:dataconnect-auth
npm run check:dataconnect-queries
npm run check:dataconnect-client-surface
```

`check:auth-safety` verifie deux invariants checkpoint 002:

- `.env.sandbox` et `.env.production` gardent `VITE_ENABLE_LOCAL_AUTH_FALLBACK=false`;
- `src/lib/auth.ts` limite le fallback a `import.meta.env.DEV`, hors production, avec flag explicite;
- `src/pages/LoginPage.tsx` masque l'acces dev tant que `isLocalAuthFallbackEnabled` est faux;
- le front applicatif n'appelle pas `UpsertCurrentUser` / `useUpsertCurrentUser`.

`check:dataconnect-auth` verifie les invariants transitoires du connecteur:

- toutes les mutations portent un `@auth` explicite;
- les mutations sensibles portent `@transaction`;
- les mutations sensibles lisent `User(id = auth.uid)` et appliquent un `@check` sur `role`;
- les mutations partagees gardent un `insecureReason` tant que la sandbox n'a pas prouve le RBAC bout en bout;
- les `insecureReason` ne doivent plus annoncer que le RBAC sera ajoute plus tard si la mutation contient deja un check de role;
- `UpsertCurrentUser` n'est plus expose dans le connecteur client.

Le provisioning des roles applicatifs passe par `npm run provision:sql-users`, pas par une page React.

## Garde-fou surface client Data Connect

```bash
npm run check:dataconnect-client-surface
```

Ce script verifie que:

- `UpsertCurrentUser`, `upsertCurrentUser` et `useUpsertCurrentUser` sont absents des SDKs generes;
- le front applicatif n'utilise pas cette operation;
- le role utilisateur reste donc hors de la surface navigateur.

Il complete `check:dataconnect-auth`, qui verifie les invariants des mutations encore exposees.

## Garde-fou frontiere Firestore

```bash
npm run check:firestore-boundary
```

Ce script verifie que Firestore reste borne aux fichiers transitoires:

- `src/lib/firebase.ts` pour l'initialisation;
- `src/lib/auth.ts` pour le fallback profil `users/{uid}`.

Tout nouvel usage Firestore dans une page, un store metier ou un adapter `src/features/*` doit echouer. SQL Connect reste la cible metier.

## Garde-fou UI capacites

```bash
npm run check:ui-capabilities
```

Ce script verifie que les pages sensibles gardent des appels `canAccessPage` sur les principales actions locales:

- `clients.create`;
- `chantiers.create`;
- `factures.create` et `factures.edit`;
- `documents.create` et `documents.edit`;
- `equipe.create`, `equipe.edit` et `equipe.admin`.

Ce garde-fou ne securise pas le serveur. Il evite seulement qu'une regression front retire les gardes d'interface avant que le RBAC SQL Connect/backend soit en place.

## Garde-fou Documents/Storage

```bash
npm run check:document-storage
```

Ce script verifie que:

- le schema SQL Connect contient `DocumentFolder`, `DocumentAttache`, `DocumentAttache.storagePath` et `DocumentAttache.sha256`;
- les operations Data Connect documentaires (`CreateDocumentFolder`, `CreateDocumentAttache`, `ListDocumentFolders`, `ListDocumentsAttaches`, `ListDocumentsByChantier`) restent presentes et filtrees quand necessaire;
- la mutation generee `createDocumentAttache` reste appelee seulement depuis `src/features/documents/documentSql.ts`;
- les pages passent par l'adapter `createDocumentAttacheInSql`;
- les champs `storagePath`/`sha256` et les chemins `pending-documents/` restent construits dans le flux document controle;
- l'ancien prefixe libre `pending/` ne revient pas.

Ce garde-fou ne remplace pas les rules Storage ni une contrainte serveur, mais il evite qu'une page recommence a pousser un chemin arbitraire dans la metadata SQL.

## Garde-fou queries Data Connect

```bash
npm run check:dataconnect-queries
```

Ce script verifie que:

- chaque query du connecteur `sosson` porte un `@auth` explicite;
- les listes larges existantes (`ListOperationalClients`, `ListOperationalChantiers`, `ListFactures`, documents, previsionnel) restent bornees par un `limit`;
- `GetCurrentUser` reste borne a `auth.uid`;
- `ListPrevisionnelLinesByExercise` et `ListDocumentsByChantier` gardent leur filtre serveur.

Il ne remplace pas la validation sandbox, mais il evite qu'une regression locale retire les filtres `origineImport` sur les listes operationnelles ou ouvre une lecture trop large pendant la phase hybride.

## Garde-fou adapters Data Connect

```bash
npm run check:page-dataconnect-imports
```

Ce script echoue si une page dans `src/pages` importe directement `@dataconnect/generated`. Les appels SQL Connect doivent passer par un adapter dans `src/features/*` pour garder les pages testables et limiter la dependance aux SDKs generes.

## Audit sources front hybrides

```bash
npm run audit:frontend-sources
npm run audit:frontend-sources -- --output=tmp/checkpoint-002/frontend-sources.json
```

Ce script liste les imports de seeds, usages `localStorage`, usages Firestore et imports directs `@dataconnect/generated` dans les pages. Il est non bloquant: son role est de produire une carte reproductible pour le checkpoint 002.

Avec `--output`, la preuve JSON doit rester sous `tmp/`. Le script refuse volontairement une sortie ailleurs pour eviter de committer par accident une preuve temporaire.

## Documents et chemins Storage

Le front ne doit creer une metadata `DocumentAttache.storagePath` que via `src/features/documents/storagePaths.ts`. Le hash `DocumentAttache.sha256` est calcule depuis les octets du fichier avant la mutation SQL.

Format actuellement accepte par l'adapter:

```text
pending-documents/inbox/{uuid}-{nom-fichier-normalise}
pending-documents/chantiers/{chantierId}/{uuid}-{nom-fichier-normalise}
```

Tout chemin libre, URL arbitraire ou chemin contenant `..` doit etre refuse avant mutation SQL. Cette validation front reduit le risque d'erreur, mais ne remplace pas:

- des rules Storage testees en sandbox;
- une Cloud Function ou endpoint serveur pour generer les chemins definitifs;
- une contrainte serveur sur la coherence `storagePath` / utilisateur / chantier.

## Garde-fou SDK generes

```bash
npm run check:generated-clean
```

Ce script echoue si `src/dataconnect-generated/` ou `src/dataconnect-admin-generated/` contient des modifications git sans changement source Data Connect associe.

Si le schema ou les operations changent, regenerer proprement les SDKs:

```bash
firebase dataconnect:sdk:generate
```

Dans ce cas, le check accepte localement que les SDKs soient modifies avec `dataconnect/schema` ou `dataconnect/sosson`, puis ces fichiers generes doivent etre gardes dans le patch.
