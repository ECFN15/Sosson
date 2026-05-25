# 19 - Roadmap migration emulateur -> sandbox SQL Connect

> Statut: plan de reprise sandbox, aucune action distante mutante lancee.
> Redige le: 2026-05-22
> Date de reprise prevue: 2026-05-23
> Projet cible: `sosson-sandbox`
> Hors scope: `sosson-prod`, production, donnees reelles critiques

## 1. Objectif simple

Faire passer Sosson de l'etat "valide avec l'emulateur local" vers une sandbox Firebase SQL Connect utilisable, sans action dangereuse et sans confusion entre local, sandbox et production.

Le but n'est pas encore de dire "pret production". Le but est de repondre a une question plus concrete:

> Est-ce que le comportement prouve localement peut etre reproduit en sandbox, avec un vrai projet Firebase, une vraie base Cloud SQL et de vrais comptes Firebase Auth?

## 2. Etat prouve aujourd'hui

### Preuve locale validee

Commande passee:

```bash
npm run check:operational-lifecycle-proof
```

Resultat:

- preuve locale OK;
- cycle SQL local relu correctement;
- prospect sans chantier cree;
- client operationnel cree;
- chantier operationnel rattache;
- devis relus;
- factures definitives rattachees;
- `sandboxTouched=false`;
- `productionTouched=false`;
- aucune fuite previsionnelle dans les listes operationnelles.

Fichier de preuve:

```text
tmp/checkpoint-002/operational-lifecycle-local.json
```

### Diff sandbox lu sans mutation

Commande passee:

```bash
firebase dataconnect:sql:diff --project sosson-sandbox --service sosson-sandbox-service --location europe-west9 --non-interactive
```

Resultat resume:

- la sandbox ne correspond pas encore au schema local;
- 23 tables seraient creees;
- 4 tables seraient modifiees;
- 50 index seraient crees;
- aucun deploy lance;
- aucun seed sandbox lance;
- aucune production touchee.

Fichier archive:

```text
tmp/checkpoint-002/sql-diff-sandbox-2026-05-22.txt
```

Tables creees par le diff:

- `analytics_snapshot`
- `checkpoint_run`
- `checkpoint_step`
- `checkpoint_artifact`
- `checkpoint_decision`
- `data_import_run`
- `data_import_issue`
- `devis`
- `email_thread`
- `email_message`
- `email_attachment`
- `audit_event`
- `entity_change_log`
- `planning_event`
- `sosson_team`
- `planning_assignment`
- `sosson_team_member`
- `planning_job_sheet`
- `rapport`
- `sosson_payroll_period`
- `sosson_team_leave_period`
- `sosson_work_time_entry`
- `team_profile_submission`

Tables modifiees par le diff:

- `user`
- `chantier`
- `client`
- `document_attache`

## 3. Pourquoi la sandbox vide est normale

La sandbox peut etre vide ou ancienne. Ce n'est pas une erreur.

L'emulateur local a servi a construire et prouver le modele. La sandbox sert maintenant a verifier le meme modele dans un environnement plus proche du reel:

- vrai projet Firebase;
- vrai service SQL Connect;
- vraie base Cloud SQL PostgreSQL;
- vrais UID Firebase Auth;
- vraie configuration `.env.sandbox`;
- vrais appels reseau depuis le front.

Donc une sandbox vide signifie simplement: "le schema et les donnees doivent maintenant etre poses proprement".

## 4. Seuil de stabilite avant deploy sandbox

On peut envisager le deploy sandbox quand ces points sont vrais:

- `npm run check:operational-lifecycle-proof` passe;
- `npm run ci:sandbox` passe ou les echecs sont compris et non bloquants;
- le diff SQL sandbox a ete lu et compris;
- le diff ne contient pas de suppression non voulue;
- les changements sur `user`, `client`, `chantier`, `document_attache` sont acceptes;
- on sait quels vrais UID Firebase Auth doivent devenir des `User` SQL;
- on accepte que la sandbox soit modifiee;
- on a separe les commandes en lecture seule des commandes mutantes.

Decision actuelle: **partiel**.

La preuve locale est assez bonne pour preparer le passage. La validation humaine du diff et des profils `User` SQL reste necessaire avant deploy et seed.

## 5. A rallumer le 2026-05-23

### Pour verifier localement

Si on veut refaire une preuve complete locale, il faut rallumer l'emulateur Data Connect.

Terminal 1:

```bash
npm run emulators:dataconnect
```

Terminal 2:

```bash
npm run checkpoint:002:emulator
npm run check:operational-lifecycle-proof
```

Note importante: le deploy sandbox ne depend pas de l'emulateur. L'emulateur sert seulement a prouver localement.

### Pour tester le front local en mode sandbox

Apres deploy sandbox, on pourra lancer:

```bash
npm run dev
```

Puis ouvrir l'URL Vite locale et verifier que `.env.sandbox` est bien utilise.

## 6. Roadmap du 2026-05-23

### Etape 1 - Recontrole local rapide

But: s'assurer qu'on ne repart pas d'une preuve cassee.

Commandes:

```bash
git status --short
npm run check:operational-lifecycle-proof
npm run check:generated-clean
npm run check:sandbox-guardrails
```

Critere OK:

- pas de generated SDK modifie a la main;
- preuve lifecycle OK;
- garde-fous sandbox OK;
- aucune action production.

Si KO:

- corriger localement avant toute action sandbox;
- ne pas deployer.

### Etape 2 - CI sandbox locale

But: verifier que le front, les checks et le build sandbox tiennent ensemble.

Commande:

```bash
npm run ci:sandbox
```

Critere OK:

- lint OK;
- tests OK;
- checks securite/front OK;
- build sandbox OK.

Si KO:

- documenter l'erreur;
- corriger uniquement si le patch est petit et sur;
- relancer le check cible;
- ne pas deployer tant que l'erreur bloque le comportement sandbox.

### Etape 3 - Relire le diff sandbox

But: confirmer ce que le deploy Data Connect appliquerait.

Commande lecture seule:

```bash
firebase dataconnect:sql:diff --project sosson-sandbox --service sosson-sandbox-service --location europe-west9 --non-interactive
```

Verifier:

- tables creees;
- colonnes ajoutees;
- contraintes ajoutees;
- index ajoutes;
- absence de suppression inattendue;
- impact sur donnees sandbox existantes.

Point d'arret humain:

> Valider ou refuser le diff avant deploy.

### Etape 4 - Lire l'etat sandbox

But: savoir ou on deploye, sans rien modifier.

Commandes lecture seule:

```bash
firebase login:list
firebase use
firebase dataconnect:services:list --project sosson-sandbox
gcloud config get-value project
gcloud sql instances describe sosson-sandbox-instance --project sosson-sandbox --format=json
```

Verifier:

- compte Firebase connecte;
- projet actif;
- service `sosson-sandbox-service`;
- region `europe-west9`;
- base `fdcdb`;
- instance `sosson-sandbox-instance`;
- backups actives ou non;
- auto-resize;
- deletion protection;
- tier;
- version PostgreSQL.

Decision:

- si la config sandbox est incoherente, stopper;
- si elle est coherente, passer au point de validation deploy.

### Etape 5 - Validation humaine deploy sandbox

Commande a ne pas lancer sans accord explicite:

```bash
firebase deploy --only dataconnect --project sosson-sandbox
```

Ce que ca fait:

- applique le schema SQL Connect local sur la sandbox;
- cree les tables manquantes;
- modifie les tables existantes selon le diff;
- redeploie le connecteur Data Connect.

Ce que ca ne fait pas:

- ne seed pas automatiquement les donnees metier;
- ne cree pas automatiquement les vrais `User` SQL;
- ne touche pas production.

Phrase de validation attendue avant lancement:

```text
oui lance le deploy dataconnect sandbox
```

### Etape 6 - Verification post-deploy sans seed massif

But: confirmer que le schema est pose.

Commandes possibles:

```bash
firebase dataconnect:sql:diff --project sosson-sandbox --service sosson-sandbox-service --location europe-west9 --non-interactive
firebase dataconnect:services:list --project sosson-sandbox
```

Critere OK:

- le diff ne propose plus les memes creations massives;
- le service et le connecteur existent toujours;
- aucune erreur de migration.

Si KO:

- capturer l'erreur;
- ne pas seed;
- analyser migration/connecteur.

### Etape 7 - Provision des profils SQL User

But: creer en sandbox les profils applicatifs lies aux vrais UID Firebase Auth.

Pourquoi c'est obligatoire:

- Firebase Auth prouve l'identite;
- la table SQL `User` donne le role metier;
- les checks RBAC SQL Connect dependent du `User` SQL courant.

Preparation:

- lister les vrais utilisateurs Firebase Auth sandbox;
- recuperer leurs UID;
- preparer un fichier de provisionnement controle;
- definir les roles: `gerant`, `admin`, `conducteur`, `assistant`, etc.

Dry-run local:

```bash
npm run provision:sql-users -- --file=dataconnect/user_profiles.local.json --dry-run
```

Commande a ne pas lancer sans accord explicite:

```bash
$env:ALLOW_SANDBOX_USER_PROVISIONING='true'
npm run provision:sql-users -- --sandbox --yes-sandbox --file=dataconnect/user_profiles.local.json
```

Critere OK:

- chaque personne qui doit tester a un `User.id` egal a son `auth.uid`;
- au moins un profil `gerant` existe;
- `GetCurrentUser` relit le bon profil.

### Etape 8 - Seed sandbox controle

But: charger des donnees de test sandbox, pas des donnees production.

Dry-run d'abord:

```bash
npm run seed:sandbox -- --dry-run --kind=previsionnel --output=tmp/checkpoint-002/seed-sandbox-dry-run.json
```

Commande mutante a ne pas lancer sans accord explicite:

```bash
$env:ALLOW_SANDBOX_DATACONNECT_SEED='true'
npm run seed:sandbox -- --sandbox --yes-sandbox --kind=previsionnel
```

Ne pas utiliser `--kind=all` pour la sandbox reelle. Cette option incluait historiquement `dataconnect/seed_data.gql`, un jeu demo fictif. Utiliser `--kind=previsionnel` pour importer seulement la base Excel; le seed demo exige maintenant `--include-demo-operational-seed`.

Critere OK:

- previsionnel Excel seede;
- listes operationnelles vides tant qu'aucun vrai client/chantier/facture n'est cree depuis l'app;
- previsionnel separe de l'operationnel;
- pas de creation de `User` sans UID reel.

### Etape 9 - Comptage sandbox

But: verifier que la sandbox contient bien les donnees attendues.

Commande de lecture sandbox a ne pas lancer sans accord explicite:

```bash
$env:ALLOW_SANDBOX_DATACONNECT_READ='true'
npm run count:dataconnect -- --sandbox --yes-sandbox --user-profiles=dataconnect/user_profiles.local.json --output=tmp/checkpoint-002/counts-sandbox.json
```

Verifier:

- nombre de `User`;
- nombre de clients operationnels;
- nombre de clients previsionnels;
- nombre de chantiers operationnels;
- nombre de chantiers previsionnels;
- nombre de devis;
- nombre de factures;
- emails/planning/rapports si seedes.

### Etape 10 - Verification front sandbox

But: prouver que le site utilise vraiment SQL Connect sandbox.

Commande:

```bash
npm run dev
```

Verifier dans le navigateur:

- login Firebase sandbox;
- `GetCurrentUser` renvoie le profil SQL;
- dashboard charge les donnees SQL ou affiche un fallback explicitement;
- creation/modification client si active;
- creation/modification chantier si active;
- factures via mutation SQL si active;
- planning via mutation SQL si active;
- emails index SQL si actif;
- rapports metadata SQL si actif;
- aucune UI ne pretend sauvegarder en SQL si elle utilise un fallback local.

## 7. Risques a surveiller

### Risque 1 - Sandbox pas sauvegardee

Si les backups Cloud SQL sont desactives, ce n'est pas bloquant pour un premier test sandbox, mais c'est risque pour conserver les donnees sandbox.

Mitigation:

- verifier `backupConfiguration.enabled`;
- decider si on active backup/PITR avant seed important.

### Risque 2 - `User` SQL absents

Sans `User` SQL, l'utilisateur peut etre connecte Firebase mais ne pas avoir de role applicatif.

Impact:

- `GetCurrentUser` peut echouer;
- mutations sensibles refusees;
- front peut basculer sur fallback.

Mitigation:

- provisionner les vrais UID Firebase Auth sandbox.

### Risque 3 - Fallback local encore present

Certaines pages peuvent encore utiliser seeds locaux, localStorage ou donnees derivees si SQL Connect n'est pas disponible.

Impact:

- illusion de persistence;
- test sandbox faussement positif.

Mitigation:

- tester chaque workflow avec lecture apres ecriture SQL;
- afficher clairement les fallbacks;
- ne pas confondre "visible dans l'UI" et "sauvegarde SQL".

### Risque 4 - Diff modifie des tables existantes

Le diff ajoute des colonnes sur `user`, `client`, `chantier`, `document_attache`.

Impact:

- migration a verifier;
- donnees sandbox existantes possiblement impactees si anciennes.

Mitigation:

- relire le diff complet;
- confirmer qu'il n'y a pas de suppression;
- accepter explicitement le deploy.

## 8. Commandes interdites sans validation

Ne pas lancer sans accord humain explicite:

```bash
firebase deploy --only dataconnect --project sosson-sandbox
firebase dataconnect:sdk:generate
$env:ALLOW_SANDBOX_DATACONNECT_SEED='true'
npm run seed:sandbox -- --sandbox --yes-sandbox --kind=previsionnel
$env:ALLOW_SANDBOX_USER_PROVISIONING='true'
npm run provision:sql-users -- --sandbox --yes-sandbox --file=dataconnect/user_profiles.local.json
$env:ALLOW_SANDBOX_DATACONNECT_READ='true'
npm run count:dataconnect -- --sandbox --yes-sandbox --user-profiles=dataconnect/user_profiles.local.json --output=tmp/checkpoint-002/counts-sandbox.json
```

Ne jamais lancer:

```bash
firebase deploy --project sosson-prod
firebase use prod
firebase init dataconnect
```

## 9. Go / No-Go le 2026-05-23

### Go pour deploy Data Connect sandbox si:

- preuve locale OK;
- `ci:sandbox` OK ou ecart non bloquant explique;
- diff relu;
- aucune suppression inattendue;
- validation humaine explicite donnee;
- on accepte que la sandbox soit modifiee.

### No-Go si:

- preuve locale cassee;
- build sandbox casse sans explication;
- diff contient une suppression non comprise;
- projet actif ambigu;
- commande pointe vers prod;
- profils `User` SQL non planifies pour les tests;
- on n'a pas decide quoi faire des backups sandbox avant seed important.

## 10. Resume pour le 2026-05-23 matin

Ordre recommande:

1. Reprendre ce fichier.
2. Lancer les checks locaux rapides.
3. Lancer `npm run ci:sandbox`.
4. Relire le diff sandbox.
5. Lire l'etat Cloud SQL sandbox.
6. Decider humainement du deploy Data Connect sandbox.
7. Si deploy valide, lancer uniquement le deploy Data Connect.
8. Verifier le diff post-deploy.
9. Provisionner les `User` SQL sandbox.
10. Seed sandbox seulement apres validation.
11. Tester le front en `.env.sandbox`.

Phrase cle:

> La sandbox vide n'est pas le probleme. Le vrai test est de prouver que le meme workflow qui passe dans l'emulateur passe aussi avec Firebase Auth + SQL Connect + Cloud SQL sandbox.

## 11. Avancement execute le 2026-05-22

Actions lancees apres redaction de cette roadmap. Toutes les commandes ci-dessous sont locales ou en lecture seule distante. Aucun deploy, aucun seed reel, aucune mutation sandbox et aucune action production n'ont ete lances.

### Controles locaux rapides

Commandes:

```bash
git status --short
npm run check:operational-lifecycle-proof
npm run check:generated-clean
npm run check:sandbox-guardrails
```

Resultat:

- preuve lifecycle locale OK sur `tmp/checkpoint-002/operational-lifecycle-local.json`;
- `sandboxTouched=false`;
- `productionTouched=false`;
- aucune fuite previsionnelle operationnelle;
- SDKs SQL Connect generes inchanges;
- garde-fous sandbox OK;
- worktree modifie uniquement par la documentation de reprise et le brouillon racine `migrationtosandbox.md`.

### CI sandbox locale

Commande:

```bash
npm run ci:sandbox
```

Resultat:

- lint OK;
- tests Vitest OK;
- checks secrets/auth/Firestore/UI/documents/Data Connect/Firebase rules/production/sandbox/docs OK;
- `npm run build:sandbox` OK;
- warning Vite de chunks > 500 kB toujours present, non bloquant pour ce passage sandbox.

### Etat sandbox lu sans mutation

Commandes:

```bash
firebase login:list
firebase use
firebase dataconnect:services:list --project sosson-sandbox
gcloud config get-value project
gcloud sql instances describe sosson-sandbox-instance --project sosson-sandbox --format=json
```

Resultat:

- login Firebase: `matthis.fradin2@gmail.com`;
- alias Firebase courant: `sosson-sandbox`;
- projet gcloud courant: `tatmadeinnormandie`, donc continuer a passer explicitement `--project sosson-sandbox`;
- service Data Connect: `sosson-sandbox-service`;
- region: `europe-west9`;
- base: `fdcdb`;
- connecteur: `sosson`;
- schema/connector sandbox encore dates du 2026-05-14;
- Cloud SQL `sosson-sandbox-instance` en etat `RUNNABLE`;
- PostgreSQL `POSTGRES_18`;
- tier `db-f1-micro`;
- availability `ZONAL`;
- backups desactives (`backupConfiguration.enabled=false`);
- auto-resize desactive;
- deletion protection desactive.

### Diff sandbox relu

Commande:

```bash
firebase dataconnect:sql:diff --project sosson-sandbox --service sosson-sandbox-service --location europe-west9 --non-interactive
```

Fichier archive:

```text
tmp/checkpoint-002/sql-diff-sandbox-2026-05-22-recheck.txt
```

Resultat:

- la sandbox ne matche toujours pas le schema SQL Connect local;
- le diff confirme les creations/modifications deja listees dans cette roadmap;
- la commande retourne OK, mais indique bien qu'un deploy appliquerait une vraie migration.

### Dry-runs sans mutation

Commandes:

```bash
npm run seed:sandbox -- --dry-run --kind=previsionnel --output=tmp/checkpoint-002/seed-sandbox-dry-run.json
npm run count:dataconnect -- --dry-run --output=tmp/checkpoint-002/counts-dry-run.json
npm run provision:sql-users -- --file=dataconnect/user_profiles.local.json --dry-run
```

Resultat:

- seed sandbox dry-run OK, 113 fichiers listes, `mutatesData=false`;
- comptage dry-run OK, aucune lecture Data Connect executee, `mutatesData=false`;
- provisioning SQL User dry-run OK, 1 profil local masque charge avec role `gerant`, aucune mutation executee.

### Verdict courant

Etat avant validation humaine: **preparation sandbox avancee, deploy non autorise**.

Go technique partiel:

- preuve locale OK;
- CI sandbox locale OK;
- diff sandbox relu et archive;
- etat Cloud SQL sandbox relu;
- dry-runs seed/comptage/provisioning OK.

No-Go operationnel tant que ces validations humaines manquent:

- accepter explicitement le diff SQL;
- confirmer quoi faire des backups, auto-resize et deletion protection avant seed reel;
- confirmer le ou les vrais profils SQL `User` sandbox a provisionner;
- donner la phrase explicite avant `firebase deploy --only dataconnect --project sosson-sandbox`.

## 12. Execution sandbox apres validation du 2026-05-22

Validation utilisateur recue dans le fil: "ta ma validation".

Portee appliquee:

- projet cible: `sosson-sandbox`;
- production `sosson-prod` exclue;
- Data Connect sandbox migre et redeploye;
- profil SQL `User` sandbox provisionne;
- seed sandbox `kind=all` execute puis corrige: le jeu operationnel demo a ete supprime, le previsionnel Excel est conserve;
- comptage sandbox execute;
- aucune commande production lancee.

### Preflight final

Commandes:

```bash
git status --short
npm run check:operational-lifecycle-proof
npm run check:sandbox-guardrails
firebase use
```

Resultat:

- preuve lifecycle locale OK;
- `sandboxTouched=false`;
- `productionTouched=false`;
- garde-fous sandbox OK;
- alias Firebase courant: `sosson-sandbox`.

### Deploy Data Connect sandbox

Premiere tentative:

```bash
firebase deploy --only dataconnect --project sosson-sandbox
```

Fichier archive:

```text
tmp/checkpoint-002/dataconnect-deploy-sandbox-2026-05-22.txt
```

Resultat:

- deploy stoppe avant migration;
- Firebase CLI a demande un acquittement explicite des operations supprimees `ListChantiers`, `ListClients`, `UpsertCurrentUser`.

Deuxieme tentative:

```bash
firebase deploy --only dataconnect --project sosson-sandbox --force
```

Fichier archive:

```text
tmp/checkpoint-002/dataconnect-deploy-sandbox-2026-05-22-force.txt
```

Resultat:

- acquittement des operations breaking OK;
- compilation schema/connecteurs OK;
- deploy stoppe car Cloud SQL devait d'abord etre migre via `dataconnect:sql:migrate`.

Migration SQL:

```bash
firebase dataconnect:sql:migrate --project sosson-sandbox --service sosson-sandbox-service --location europe-west9 --force
```

Fichier archive:

```text
tmp/checkpoint-002/dataconnect-sql-migrate-sandbox-2026-05-22.txt
```

Resultat:

- migration Cloud SQL sandbox OK;
- tables et index du diff appliques.

Deploy final:

```bash
firebase deploy --only dataconnect --project sosson-sandbox --force
```

Fichier archive:

```text
tmp/checkpoint-002/dataconnect-deploy-sandbox-2026-05-22-after-migrate.txt
```

Resultat:

- schema Cloud SQL `sosson-sandbox-instance:fdcdb` compatible avec SQL Connect;
- schema `main` migre;
- connecteur `sosson` deploye;
- deploy complete.

### Verification post-deploy

Commandes:

```bash
firebase dataconnect:services:list --project sosson-sandbox
firebase dataconnect:sql:diff --project sosson-sandbox --service sosson-sandbox-service --location europe-west9 --non-interactive
npm run check:generated-clean
npm run check:dataconnect-client-surface
```

Fichier archive:

```text
tmp/checkpoint-002/sql-diff-sandbox-2026-05-22-post-deploy.txt
```

Resultat:

- service `sosson-sandbox-service` en `europe-west9`;
- schema last updated: `2026-05-22T10:01:16.877088356Z`;
- connector `sosson` last updated: `2026-05-22T10:01:18.926922486Z`;
- Cloud SQL matche exactement le schema SQL Connect local;
- SDKs generes inchanges;
- `UpsertCurrentUser` absent des SDKs et du front applicatif.

### Provisioning SQL User sandbox

Commande:

```bash
$env:ALLOW_SANDBOX_USER_PROVISIONING='true'
npm run provision:sql-users -- --sandbox --yes-sandbox --file=dataconnect/user_profiles.local.json
```

Fichier archive:

```text
tmp/checkpoint-002/provision-sql-users-sandbox-2026-05-22.txt
```

Resultat:

- 1 profil SQL `User` charge depuis `dataconnect/user_profiles.local.json`;
- UID et email masques dans la sortie;
- role `gerant`;
- upsert sandbox OK.

### Seed sandbox reel

Commande:

```bash
$env:ALLOW_SANDBOX_DATACONNECT_SEED='true'
npm run seed:sandbox -- --sandbox --yes-sandbox --kind=all --output=tmp/checkpoint-002/seed-sandbox-real.json
```

Correction ulterieure: cette commande a importe par erreur le jeu operationnel demo historique en plus du previsionnel Excel. Les lignes demo ont ensuite ete supprimees. La commande sandbox cible doit maintenant etre `--kind=previsionnel`.

Fichier archive:

```text
tmp/checkpoint-002/seed-sandbox-real-2026-05-22.txt
```

Resultat:

- 114 fichiers executes;
- seed operationnel demo execute depuis `dataconnect/seed_data.gql` par erreur;
- seed previsionnel execute depuis `dataconnect/previsionnel_seed/*.gql`;
- commande terminee avec code OK.

Note: la sortie PowerShell contient du bruit `NativeCommandError` lie aux flux stderr/coloration, mais le code de sortie de la commande est OK et tous les fichiers ont ete executes.

### Comptage sandbox

Commande:

```bash
$env:ALLOW_SANDBOX_DATACONNECT_READ='true'
npm run count:dataconnect -- --sandbox --yes-sandbox --user-profiles=dataconnect/user_profiles.local.json --output=tmp/checkpoint-002/counts-sandbox.json
```

Fichiers archives:

```text
tmp/checkpoint-002/counts-sandbox.json
tmp/checkpoint-002/counts-sandbox-2026-05-22.txt
```

Resultat:

```json
{
  "operationalTables": {
    "clients": 3,
    "chantiers": 4,
    "factures": 12,
    "devis": 0
  },
  "documents": {
    "folders": 0,
    "attaches": 0
  },
  "previsionnel": {
    "exercises": 13,
    "expectedLinesFromExerciseMetadata": 898,
    "loadedLinesViaQuery": 898,
    "expectedChantiersFromExerciseMetadata": 898,
    "loadedMonthlyAmountsViaNestedQuery": 1577,
    "loadedLotAmountsViaNestedQuery": 887,
    "lineQueryMayBeTruncated": false
  },
  "knownUserProfiles": [
    {
      "emailDomain": "gmail.com",
      "expectedRole": "gerant",
      "exists": true,
      "role": "gerant",
      "roleMatches": true
    }
  ]
}
```

### Verification post-seed

Commande:

```bash
firebase dataconnect:sql:diff --project sosson-sandbox --service sosson-sandbox-service --location europe-west9 --non-interactive
```

Fichier archive:

```text
tmp/checkpoint-002/sql-diff-sandbox-2026-05-22-post-seed.txt
```

Resultat:

- Cloud SQL `sosson-sandbox-instance:fdcdb` matche toujours exactement le schema SQL Connect.

### Correction seed demo operationnel

Constat utilisateur:

- les 3 clients, 4 chantiers et 12 factures operationnels venaient de `dataconnect/seed_data.gql`;
- ce fichier est un jeu demo fictif historique, pas une reprise de la base Excel;
- la base Excel etait bien presente dans le seed previsionnel, mais separee par `origineImport: "previsionnel"`.

Nettoyage sandbox:

```bash
firebase dataconnect:execute tmp/checkpoint-002/delete-demo-operational-seed-sandbox.gql --service sosson-sandbox-service --location europe-west9 --project sosson-sandbox --non-interactive
```

Fichier archive:

```text
tmp/checkpoint-002/delete-demo-operational-seed-sandbox-2026-05-22.txt
```

Resultat:

- suppression ciblee des 12 factures demo `cccccccc-*`;
- suppression ciblee des 4 chantiers demo `bbbbbbbb-*`;
- suppression ciblee des 3 clients demo `aaaaaaaa-*`;
- aucune suppression du previsionnel Excel.

Comptage apres nettoyage:

```bash
$env:ALLOW_SANDBOX_DATACONNECT_READ='true'
npm run count:dataconnect -- --sandbox --yes-sandbox --user-profiles=dataconnect/user_profiles.local.json --output=tmp/checkpoint-002/counts-sandbox-after-demo-cleanup.json
```

Fichiers archives:

```text
tmp/checkpoint-002/counts-sandbox-after-demo-cleanup.json
tmp/checkpoint-002/counts-sandbox-after-demo-cleanup-2026-05-22.txt
```

Resultat corrige:

```json
{
  "operationalTables": {
    "clients": 0,
    "chantiers": 0,
    "factures": 0,
    "devis": 0
  },
  "previsionnel": {
    "exercises": 13,
    "expectedLinesFromExerciseMetadata": 898,
    "loadedLinesViaQuery": 898,
    "expectedChantiersFromExerciseMetadata": 898,
    "loadedMonthlyAmountsViaNestedQuery": 1577,
    "loadedLotAmountsViaNestedQuery": 887,
    "lineQueryMayBeTruncated": false
  }
}
```

Verrou ajoute:

- `scripts/seed-dataconnect-sandbox.mjs` utilise maintenant `--kind=previsionnel` par defaut;
- `--kind=operational` et `--kind=all` sont bloques sans `--include-demo-operational-seed`;
- les docs et checks doivent pointer vers `--kind=previsionnel` pour les reprises sandbox.

### Etat reel apres execution

Fait:

- migration schema sandbox reelle appliquee;
- connecteur sandbox redeploye;
- profil SQL `gerant` provisionne;
- previsionnel Excel charge;
- seed operationnel demo nettoye apres erreur d'import;
- comptage corrige: 0 client operationnel, 0 chantier operationnel, 0 facture operationnelle; 898 lignes previsionnelles Excel conservees;
- comptage sandbox archive et coherent;
- production non touchee.

Reste a faire:

- smoke front sandbox avec vrai login Firebase;
- verifier que `GetCurrentUser` renvoie le profil SQL provisionne;
- tester une lecture/ecriture SQL puis refresh depuis l'UI;
- verifier les refus RBAC avec au moins un role non-gerant;
- verifier les domaines non seedes par `seed:sandbox`: documents, emails, planning, rapports, analytics, audit/checkpoints;
- decider backups, auto-resize et deletion protection Cloud SQL sandbox si les donnees sandbox doivent etre conservees.
