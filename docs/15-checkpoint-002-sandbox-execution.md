# 15 - Execution sandbox checkpoint 002

> Statut: gabarit d'execution humaine
> Derniere revision: 2026-05-18
> Portee: ordre d'execution et preuves a collecter pour valider la sandbox distante.

## Principe

Ce document sert au moment ou une personne autorise les actions sandbox reelles.
Il ne doit pas etre rempli avec des suppositions locales.

Regles:

- ne jamais cibler `sosson-prod`;
- utiliser `--project sosson-sandbox`;
- ne jamais committer de secret, token, UID prive non anonymise ou capture contenant des donnees sensibles;
- archiver les sorties techniques sous `tmp/checkpoint-002/`;
- noter tout ecart au lieu de le corriger directement par suppression de donnees.

## Preflight local obligatoire

Avant toute action distante:

```bash
npm run checkpoint:002:local
```

Gate:

- resultat OK;
- warning Vite chunks accepte temporairement;
- aucune erreur lint, test, secret, auth, rules, Data Connect ou build.

Preuve a noter:

```text
Date/heure:
Commit ou etat git:
Resultat:
Ecart:
Owner:
```

Verification locale avec emulateur, avant toute action distante.

Terminal 1:

```bash
npm run emulators:dataconnect
```

Terminal 2:

```bash
npm run checkpoint:002:emulator
```

Gate:

- seed operationnel local OK;
- seed previsionnel local OK;
- verifications operationnel/previsionnel OK;
- comptage local propre archive sous `tmp/checkpoint-002/counts-local.json` avant les ecritures RBAC;
- verification RBAC OK;
- resultat interprete comme preuve locale uniquement, jamais comme preuve sandbox distante.

Si le comptage local est pollue par une verification RBAC precedente, arreter l'emulateur puis supprimer explicitement l'etat pglite local:

```bash
npm run reset:dataconnect:local -- --yes-local-reset
```

Ne pas confondre ce reset local avec une action sandbox: il ne doit supprimer que `dataconnect/.dataconnect/pgliteData`.

## Preflight metier obligatoire

Avant toute demande de validation sandbox, completer `docs/17-operational-lifecycle-scenario.md`.

Gate:

- les 9 reponses metier du cycle `nouveau client -> chantier -> factures` sont renseignees;
- `npm run check:operational-lifecycle-decisions` retourne OK;
- le script `verify:operational-lifecycle:dataconnect` a ete ajuste si ces reponses changent le parcours;
- `npm run checkpoint:002:emulator` est relance sur base locale propre apres ajustement;
- Dashboard, Statistiques, Clients, Chantiers, Factures et Moteur live ne presentent pas un fallback comme une preuve SQL.

Sans ce preflight metier, rester en local/dry-run meme si les checks techniques sont verts.

## Validation humaine

Avant de continuer, obtenir une validation explicite pour:

1. deploy rules sandbox;
2. deploy Data Connect sandbox;
3. seed Data Connect sandbox;
4. provisioning SQL `User` sandbox;
5. lecture/comptage Data Connect sandbox.

Validation attendue:

```text
Validateur:
Date/heure:
Scope autorise:
Projet confirme: sosson-sandbox
Production explicitement exclue: oui/non
```

Phrase de validation recommandee:

```text
Je valide uniquement les actions sandbox suivantes sur le projet sosson-sandbox:
deploy rules, deploy Data Connect, seed Data Connect, provisioning SQL User, comptage Data Connect.
Je confirme que la production sosson-prod est exclue.
```

Sans cette validation explicite, rester en dry-run/local.

## Etape 1 - Rules Firebase sandbox

Commande:

```bash
firebase deploy --only firestore:rules,storage --project sosson-sandbox
```

Preuves:

```text
Commande executee:
Resultat Firebase CLI:
Erreur:
Action corrective:
```

Smoke apres deploy:

- Firestore ne permet pas l'ecriture client de `users/{uid}`;
- Storage reste ferme par defaut;
- aucune ouverture globale `request.auth != null`.

## Etape 2 - Data Connect sandbox

Commande:

```bash
firebase deploy --only dataconnect --project sosson-sandbox
```

Preuves:

```text
Commande executee:
Resultat Firebase CLI:
Schema migre:
Connecteur deploye:
Erreur:
Action corrective:
```

Gate:

- schema compile;
- migrations appliquees;
- connecteur `sosson` deploye;
- pas de commande production.

## Etape 3 - Seed Data Connect sandbox

Dry-run sans mutation distante:

```bash
npm run seed:sandbox -- --dry-run --kind=all --output=tmp/checkpoint-002/seed-sandbox-dry-run.json
```

Seed sandbox reel, seulement apres validation humaine:

```bash
ALLOW_SANDBOX_DATACONNECT_SEED=true npm run seed:sandbox -- --sandbox --yes-sandbox --kind=all
```

Preuves:

```text
Commande executee:
Kind:
Fichiers executes:
Resultat Firebase CLI:
Erreur:
Action corrective:
```

Gate:

- projet affiche/confirme: `sosson-sandbox`;
- seed operationnel execute depuis `dataconnect/seed_data.gql`;
- seed previsionnel execute depuis `dataconnect/previsionnel_seed/*.gql`;
- aucune commande production;
- si un seed echoue au milieu, ne pas supprimer de donnees: noter le fichier en erreur, corriger le script/schema si necessaire, puis demander validation avant relance.

## Etape 4 - Provisioning SQL User sandbox

Preparation locale:

```bash
cp dataconnect/user_profiles.example.json dataconnect/user_profiles.local.json
```

Remplir `dataconnect/user_profiles.local.json` avec les vrais UID Firebase Auth sandbox.
Ce fichier est ignore par git.
Ne jamais utiliser `dataconnect/user_profiles.example.json` pour une action sandbox reelle: les scripts le refusent.
Ne jamais coller le contenu de `dataconnect/user_profiles.local.json` dans la documentation ou le checkpoint.

Dry-run:

```bash
npm run provision:sql-users -- --file=dataconnect/user_profiles.local.json --dry-run
```

Mutation sandbox, seulement apres validation:

```bash
ALLOW_SANDBOX_USER_PROVISIONING=true npm run provision:sql-users -- --sandbox --yes-sandbox --file=dataconnect/user_profiles.local.json
```

Preuves:

```text
Nombre profils:
Roles provisionnes:
Empreintes UID / domaines email verifies:
Erreur:
Action corrective:
```

Gate:

- aucun role choisi par le navigateur;
- au moins un `gerant` provisionne;
- les roles correspondent a la decision humaine.
- aucun UID placeholder ou fichier exemple n'a ete utilise.

## Etape 5 - Comptage Data Connect sandbox

Commande lecture seule, seulement apres validation:

```bash
ALLOW_SANDBOX_DATACONNECT_READ=true npm run count:dataconnect -- --sandbox --yes-sandbox --user-profiles=dataconnect/user_profiles.local.json --output=tmp/checkpoint-002/counts-sandbox.json
```

Preuve attendue:

```text
Fichier:
generatedAt:
User:
Client:
Chantier:
Facture:
PrevisionnelExercise:
PrevisionnelLine:
Documents folders/attaches:
lineQueryMayBeTruncated:
```

Gate:

- `counts-sandbox.json` existe sous `tmp/checkpoint-002/`;
- les volumes sont expliques;
- `knownUserProfiles` confirme les profils attendus via `uidFingerprint` et domaine email, sans UID/email complet;
- chaque profil attendu existe dans SQL `User` et son `role` correspond au role attendu dans `dataconnect/user_profiles.local.json`;
- `--user-profiles` pointe vers `dataconnect/user_profiles.local.json`, pas vers le fichier exemple;
- `--output=tmp/checkpoint-002/counts-sandbox.json` est present pour archiver la preuve;
- si `lineQueryMayBeTruncated=true`, le checkpoint 002 n'est pas valide.

## Etape 6 - Smoke app sandbox

Tests manuels:

1. login Firebase avec un utilisateur ayant un `User` SQL;
2. verifier que le profil vient de `GetCurrentUser`;
3. verifier qu'un utilisateur sans `User` SQL n'entre pas silencieusement;
4. ouvrir `/dashboard`;
5. ouvrir `/clients`, `/chantiers`, `/factures`;
6. confirmer que les clients/chantiers Excel historiques ne polluent pas les listes operationnelles;
7. tester une action interdite avec un role non autorise;
8. verifier que les documents utilisent un chemin `pending-documents/...`;
9. verifier que l'app n'affiche pas l'acces dev local sur Hosting sandbox.

Preuves:

```text
Compte teste:
Role SQL:
Pages OK:
Action interdite testee:
Resultat:
Erreur:
```

## Etape 7 - Exploitation

Verifier ou planifier:

- budget alert sandbox/prod a 50 %, 80 %, 100 %;
- monitoring Cloud SQL CPU/connexions/stockage;
- suivi erreurs SQL Connect;
- backup Cloud SQL;
- procedure restore sandbox;
- owner humain de chaque alerte.

Preuve:

```text
Budget alerts:
Monitoring:
Backup:
Restore teste:
Owner:
Ecart reporte:
```

## Verdict checkpoint 002

La sandbox est prete checkpoint 002 seulement si:

- preflight local OK;
- deploy rules sandbox OK;
- deploy Data Connect sandbox OK;
- seed sandbox reel OK;
- vrais profils SQL `User` provisionnes;
- comptage sandbox archive;
- smoke app sandbox OK;
- aucun role privilegie ne vient du navigateur;
- production reste exclue;
- les risques restants ont un owner et une sortie.

Verdict:

```text
Checkpoint 002 valide: oui/non
Date:
Validateur:
Risques acceptes:
Bloquants restants:
Prochaine action:
```
