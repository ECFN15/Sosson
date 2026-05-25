# Roadmap migration emulateur -> sandbox SQL Connect

Date de reprise prevue : demain  
Projet cible : `sosson-sandbox`  
Hors scope : `sosson-prod`, production, donnees reelles critiques

## 1. Objectif simple

Faire passer Sosson de l'etat "valide avec l'emulateur local" vers une sandbox Firebase SQL Connect utilisable, sans action dangereuse et sans confusion entre local, sandbox et production.

Le but n'est pas encore de dire "pret production". Le but est de repondre a une question plus concrete :

> Est-ce que le comportement prouve localement peut etre reproduit en sandbox, avec un vrai projet Firebase, une vraie base Cloud SQL et de vrais comptes Firebase Auth ?

## 2. Etat prouve aujourd'hui

### Preuve locale validee

Commande passee :

```bash
npm run check:operational-lifecycle-proof
```

Resultat :

- preuve locale OK ;
- cycle SQL local relu correctement ;
- prospect sans chantier cree ;
- client operationnel cree ;
- chantier operationnel rattache ;
- devis relus ;
- factures definitives rattachees ;
- `sandboxTouched=false` ;
- `productionTouched=false` ;
- aucune fuite previsionnelle dans les listes operationnelles.

Fichier de preuve :

```text
tmp/checkpoint-002/operational-lifecycle-local.json
```

### Diff sandbox lu sans mutation

Commande passee :

```bash
firebase dataconnect:sql:diff --project sosson-sandbox --service sosson-sandbox-service --location europe-west9 --non-interactive
```

Resultat resume :

- la sandbox ne correspond pas encore au schema local ;
- 23 tables seraient creees ;
- 4 tables seraient modifiees ;
- 50 index seraient crees ;
- aucun deploy lance ;
- aucun seed sandbox lance ;
- aucune production touchee.

Fichier archive :

```text
tmp/checkpoint-002/sql-diff-sandbox-2026-05-22.txt
```

Tables creees par le diff :

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

Tables modifiees par le diff :

- `user`
- `chantier`
- `client`
- `document_attache`

## 3. Pourquoi la sandbox vide est normale

La sandbox peut etre vide ou ancienne. Ce n'est pas une erreur.

L'emulateur local a servi a construire et prouver le modele. La sandbox sert maintenant a verifier le meme modele dans un environnement plus proche du reel :

- vrai projet Firebase ;
- vrai service SQL Connect ;
- vraie base Cloud SQL PostgreSQL ;
- vrais UID Firebase Auth ;
- vraie configuration `.env.sandbox` ;
- vrais appels reseau depuis le front.

Donc une sandbox vide signifie simplement : "le schema et les donnees doivent maintenant etre poses proprement".

## 4. Seuil de stabilite avant deploy sandbox

On peut envisager le deploy sandbox quand ces points sont vrais :

- `npm run check:operational-lifecycle-proof` passe ;
- `npm run ci:sandbox` passe ou les echecs sont compris et non bloquants ;
- le diff SQL sandbox a ete lu et compris ;
- le diff ne contient pas de suppression non voulue ;
- les changements sur `user`, `client`, `chantier`, `document_attache` sont acceptes ;
- on sait quels vrais UID Firebase Auth doivent devenir des `User` SQL ;
- on accepte que la sandbox soit modifiee ;
- on a separe les commandes en lecture seule des commandes mutantes.

Decision actuelle : **partiel**.

La preuve locale est assez bonne pour preparer le passage. La validation humaine du diff et des profils `User` SQL reste necessaire avant deploy et seed.

## 5. A rallumer demain

### Pour verifier localement

Si on veut refaire une preuve complete locale, il faut rallumer l'emulateur Data Connect.

Terminal 1 :

```bash
npm run emulators:dataconnect
```

Terminal 2 :

```bash
npm run checkpoint:002:emulator
npm run check:operational-lifecycle-proof
```

Note importante : le deploy sandbox ne depend pas de l'emulateur. L'emulateur sert seulement a prouver localement.

### Pour tester le front local en mode sandbox

Apres deploy sandbox, on pourra lancer :

```bash
npm run dev
```

Puis ouvrir l'URL Vite locale et verifier que `.env.sandbox` est bien utilise.

## 6. Roadmap demain

### Etape 1 - Recontrole local rapide

But : s'assurer qu'on ne repart pas d'une preuve cassee.

Commandes :

```bash
git status --short
npm run check:operational-lifecycle-proof
npm run check:generated-clean
npm run check:sandbox-guardrails
```

Critere OK :

- pas de generated SDK modifie a la main ;
- preuve lifecycle OK ;
- garde-fous sandbox OK ;
- aucune action production.

Si KO :

- corriger localement avant toute action sandbox ;
- ne pas deployer.

### Etape 2 - CI sandbox locale

But : verifier que le front, les checks et le build sandbox tiennent ensemble.

Commande :

```bash
npm run ci:sandbox
```

Critere OK :

- lint OK ;
- tests OK ;
- checks securite/front OK ;
- build sandbox OK.

Si KO :

- documenter l'erreur ;
- corriger uniquement si le patch est petit et sur ;
- relancer le check cible ;
- ne pas deployer tant que l'erreur bloque le comportement sandbox.

### Etape 3 - Relire le diff sandbox

But : confirmer ce que le deploy Data Connect appliquerait.

Commande lecture seule :

```bash
firebase dataconnect:sql:diff --project sosson-sandbox --service sosson-sandbox-service --location europe-west9 --non-interactive
```

Verifier :

- tables creees ;
- colonnes ajoutees ;
- contraintes ajoutees ;
- index ajoutes ;
- absence de suppression inattendue ;
- impact sur donnees sandbox existantes.

Point d'arret humain :

> Valider ou refuser le diff avant deploy.

### Etape 4 - Lire l'etat sandbox

But : savoir ou on deploye, sans rien modifier.

Commandes lecture seule :

```bash
firebase login:list
firebase use
firebase dataconnect:services:list --project sosson-sandbox
gcloud config get-value project
gcloud sql instances describe sosson-sandbox-instance --project sosson-sandbox --format=json
```

Verifier :

- compte Firebase connecte ;
- projet actif ;
- service `sosson-sandbox-service` ;
- region `europe-west9` ;
- base `fdcdb` ;
- instance `sosson-sandbox-instance` ;
- backups actives ou non ;
- auto-resize ;
- deletion protection ;
- tier ;
- version PostgreSQL.

Decision :

- si la config sandbox est incoherente, stopper ;
- si elle est coherente, passer au point de validation deploy.

### Etape 5 - Validation humaine deploy sandbox

Commande a ne pas lancer sans accord explicite :

```bash
firebase deploy --only dataconnect --project sosson-sandbox
```

Ce que ca fait :

- applique le schema SQL Connect local sur la sandbox ;
- cree les tables manquantes ;
- modifie les tables existantes selon le diff ;
- redeploie le connecteur Data Connect.

Ce que ca ne fait pas :

- ne seed pas automatiquement les donnees metier ;
- ne cree pas automatiquement les vrais `User` SQL ;
- ne touche pas production.

Phrase de validation attendue avant lancement :

```text
oui lance le deploy dataconnect sandbox
```

### Etape 6 - Verification post-deploy sans seed massif

But : confirmer que le schema est pose.

Commandes possibles :

```bash
firebase dataconnect:sql:diff --project sosson-sandbox --service sosson-sandbox-service --location europe-west9 --non-interactive
firebase dataconnect:services:list --project sosson-sandbox
```

Critere OK :

- le diff ne propose plus les memes creations massives ;
- le service et le connecteur existent toujours ;
- aucune erreur de migration.

Si KO :

- capturer l'erreur ;
- ne pas seed ;
- analyser migration/connecteur.

### Etape 7 - Provision des profils SQL User

But : creer en sandbox les profils applicatifs lies aux vrais UID Firebase Auth.

Pourquoi c'est obligatoire :

- Firebase Auth prouve l'identite ;
- la table SQL `User` donne le role metier ;
- les checks RBAC SQL Connect dependent du `User` SQL courant.

Preparation :

- lister les vrais utilisateurs Firebase Auth sandbox ;
- recuperer leurs UID ;
- preparer un fichier de provisionnement controle ;
- definir les roles : `gerant`, `admin`, `conducteur`, `assistant`, etc.

Commande a ne pas lancer sans accord explicite :

```bash
npm run provision:sql-users -- --sandbox --yes-sandbox --file=...
```

Critere OK :

- chaque personne qui doit tester a un `User.id` egal a son `auth.uid` ;
- au moins un profil `gerant` existe ;
- `GetCurrentUser` relit le bon profil.

### Etape 8 - Seed sandbox controle

But : charger la base Excel previsionnelle en sandbox, pas des donnees demo inventees.

Dry-run d'abord :

```bash
npm run seed:sandbox -- --dry-run --kind=previsionnel --output=tmp/checkpoint-002/seed-sandbox-dry-run.json
```

Commande mutante a ne pas lancer sans accord explicite :

```bash
npm run seed:sandbox -- --sandbox --yes-sandbox --kind=previsionnel
```

Critere OK :

- clients/chantiers Excel previsionnels seedes ;
- aucune facture demo importee ;
- previsionnel separe de l'operationnel ;
- pas de creation de `User` sans UID reel.

### Etape 9 - Comptage sandbox

But : verifier que la sandbox contient bien les donnees attendues.

Commande a confirmer selon garde-fous du script :

```bash
npm run count:dataconnect -- --sandbox --yes-sandbox
```

Verifier :

- nombre de `User` ;
- nombre de clients operationnels ;
- nombre de clients previsionnels ;
- nombre de chantiers operationnels ;
- nombre de chantiers previsionnels ;
- nombre de devis ;
- nombre de factures ;
- emails/planning/rapports si seedes.

### Etape 10 - Verification front sandbox

But : prouver que le site utilise vraiment SQL Connect sandbox.

Commandes :

```bash
npm run dev
```

Verifier dans le navigateur :

- login Firebase sandbox ;
- `GetCurrentUser` renvoie le profil SQL ;
- dashboard charge les donnees SQL ou affiche un fallback explicitement ;
- creation/modification client si active ;
- creation/modification chantier si active ;
- factures via mutation SQL si active ;
- planning via mutation SQL si active ;
- emails index SQL si actif ;
- rapports metadata SQL si actif ;
- aucune UI ne pretend sauvegarder en SQL si elle utilise un fallback local.

## 7. Risques a surveiller

### Risque 1 - Sandbox pas sauvegardee

Si les backups Cloud SQL sont desactives, ce n'est pas bloquant pour un premier test sandbox, mais c'est risque pour conserver les donnees sandbox.

Mitigation :

- verifier `backupConfiguration.enabled` ;
- decider si on active backup/PITR avant seed important.

### Risque 2 - `User` SQL absents

Sans `User` SQL, l'utilisateur peut etre connecte Firebase mais ne pas avoir de role applicatif.

Impact :

- `GetCurrentUser` peut echouer ;
- mutations sensibles refusees ;
- front peut basculer sur fallback.

Mitigation :

- provisionner les vrais UID Firebase Auth sandbox.

### Risque 3 - Fallback local encore present

Certaines pages peuvent encore utiliser seeds locaux, localStorage ou donnees derivees si SQL Connect n'est pas disponible.

Impact :

- illusion de persistence ;
- test sandbox faussement positif.

Mitigation :

- tester chaque workflow avec lecture apres ecriture SQL ;
- afficher clairement les fallbacks ;
- ne pas confondre "visible dans l'UI" et "sauvegarde SQL".

### Risque 4 - Diff modifie des tables existantes

Le diff ajoute des colonnes sur `user`, `client`, `chantier`, `document_attache`.

Impact :

- migration a verifier ;
- donnees sandbox existantes possiblement impactees si anciennes.

Mitigation :

- relire le diff complet ;
- confirmer qu'il n'y a pas de suppression ;
- accepter explicitement le deploy.

## 8. Commandes interdites sans validation

Ne pas lancer sans accord humain explicite :

```bash
firebase deploy --only dataconnect --project sosson-sandbox
firebase dataconnect:sdk:generate
npm run seed:sandbox -- --sandbox --yes-sandbox --kind=previsionnel
npm run provision:sql-users -- --sandbox --yes-sandbox --file=...
npm run count:dataconnect -- --sandbox --yes-sandbox
```

Ne jamais lancer :

```bash
firebase deploy --project sosson-prod
firebase use prod
firebase init dataconnect
```

## 9. Go / No-Go demain

### Go pour deploy Data Connect sandbox si :

- preuve locale OK ;
- `ci:sandbox` OK ou ecart non bloquant explique ;
- diff relu ;
- aucune suppression inattendue ;
- validation humaine explicite donnee ;
- on accepte que la sandbox soit modifiee.

### No-Go si :

- preuve locale casse ;
- build sandbox casse sans explication ;
- diff contient une suppression non comprise ;
- projet actif ambigu ;
- commande pointe vers prod ;
- profils `User` SQL non planifies pour les tests ;
- on n'a pas decide quoi faire des backups sandbox avant seed important.

## 10. Resume pour demain matin

Ordre recommande :

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

Phrase cle :

> La sandbox vide n'est pas le probleme. Le vrai test est de prouver que le meme workflow qui passe dans l'emulateur passe aussi avec Firebase Auth + SQL Connect + Cloud SQL sandbox.
