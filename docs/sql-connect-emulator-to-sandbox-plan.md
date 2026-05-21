# Passage émulateur vers sandbox SQL Connect

> Statut: plan d'exécution sandbox, aucune action distante mutante lancée.  
> Date: 2026-05-21  
> Portée: émulateur SQL Connect local -> sandbox Firebase `sosson-sandbox`.  
> Hors scope maintenant: production `sosson-prod`.

## 1. Résumé simple

Oui, le projet peut avancer de l'émulateur vers la sandbox, mais **pas en un clic automatique**.

La bonne lecture est:

1. L'émulateur local prouve que le schéma, les seeds et les workflows savent fonctionner ensemble.
2. La sandbox peut être vide ou ancienne: c'est normal, elle sert justement à recevoir le schéma et les données de test.
3. Le diff local/sandbox est important: un déploiement Data Connect sandbox ferait une vraie migration de schéma.
4. Avant de cliquer sur le déploiement, il faut une validation humaine du diff et une décision sur les sauvegardes minimales sandbox.

Conclusion opérationnelle: **passage émulateur -> sandbox possible, mais avec validation humaine avant deploy et seed réels**.

## 2. Pourquoi la sandbox vide est normale

Une sandbox vide n'est pas une erreur. Elle veut dire que l'environnement réel de test n'a pas encore reçu toutes les migrations, seeds et profils applicatifs issus du développement local.

L'émulateur est une base jetable sur la machine. La sandbox est une vraie base Cloud SQL dans Google Cloud. Les données ne passent pas toutes seules de l'un à l'autre: il faut déployer le schéma, générer les SDK si besoin, provisionner les utilisateurs SQL, puis lancer les seeds contrôlés.

Le bon objectif n'est donc pas "pourquoi la sandbox est vide ?", mais:

- est-ce que le local est prouvé ?
- quel diff va être appliqué à la sandbox ?
- quelles commandes modifient réellement la sandbox ?
- comment vérifier après que le front lit et écrit bien dans la sandbox ?

## 3. Ce qui est prouvé en émulateur

Preuves locales disponibles au moment de ce plan:

| Preuve | Commande / fichier | Résultat |
|---|---|---|
| Checkpoint complet émulateur | `npm run checkpoint:002:emulator` | OK le 2026-05-21 après correction du script de checkpoint. |
| CI sandbox locale | `npm run ci:sandbox` | OK: lint, tests, garde-fous, docs, SDK générés propres, build sandbox. |
| Cycle client/prospect -> devis -> chantier -> factures | `npm run check:operational-lifecycle-proof` | OK, `sandboxTouched=false`, `productionTouched=false`. |
| Comptage local propre après seed | `tmp/checkpoint-002/counts-local.json` | 3 clients opérationnels, 4 chantiers opérationnels, 12 factures, 13 exercices prévisionnels, 898 lignes prévisionnelles. |
| Frontière opérationnel/prévisionnel | `tmp/checkpoint-002/operational-boundary-local.json` | Pas de fuite prévisionnelle dans les listes opérationnelles. |
| Onboarding et profils SQL | `tmp/checkpoint-002/team-users-local.json` | `SubmitCurrentTeamProfile` puis conversion en `User` SQL prouvés localement. |
| RH équipe | `tmp/checkpoint-002/team-rh-local.json` | Équipes, fiches membres, congés, heures, paie préparatoire, planning/job sheet prouvés localement. |
| Documents metadata | `tmp/checkpoint-002/documents-local.json` | Metadata SQL, `storagePath`, `sha256`, lien chantier/facture prouvés localement. |
| Emails indexés | `tmp/checkpoint-002/email-local.json` | Thread, message, attachment et lien chantier prouvés localement. |
| Planning | `tmp/checkpoint-002/planning-local.json` | Création, modification, annulation sans suppression prouvées localement. |
| Rapports | `tmp/checkpoint-002/report-local.json` | Metadata rapport + artefact local hashé prouvés localement. |
| Analytics | `tmp/checkpoint-002/analytics-snapshot-local.json` | Snapshot SQL local prouvé. |
| Audit / checkpoint | `tmp/checkpoint-002/checkpoint-audit-local.json` | Checkpoint, étapes, artefacts, décisions, imports, audit events prouvés localement. |

Limite locale: le disque `C:` reste presque plein. Le checkpoint a été prouvé avec PGlite temporaire sur `E:`. C'est un problème machine, pas une preuve contre la sandbox.

## 4. Ce qui manque en sandbox

| Sujet | État sandbox actuel | Ce qui manque |
|---|---|---|
| Schéma | Service et connecteur existent, mais le diff indique un écart avec le local. | Déploiement Data Connect sandbox après validation humaine. |
| Données métier | Sandbox vide ou ancienne possible. | Seed sandbox réel contrôlé. |
| Profils SQL `User` | Non prouvés avec les vrais `auth.uid` Firebase sandbox. | Fichier de profils réels + provisioning sandbox validé. |
| RBAC serveur | Prouvé localement, pas encore prouvé sandbox. | Vérifier chaque rôle sur sandbox après provisioning. |
| Front sandbox | Build sandbox OK. | Vérifier l'app avec `.env.sandbox`, Firebase Auth et SQL Connect sandbox. |
| Documents Storage | Metadata SQL prouvée localement. | Upload Storage sandbox + metadata SQL + lecture front. |
| Compteurs sandbox | Pas de comptage réel lancé ici. | `count:dataconnect` sandbox après validation humaine. |

## 5. Diff local / sandbox

Commande lancée en lecture seule:

```bash
firebase dataconnect:sql:diff --project sosson-sandbox --service sosson-sandbox-service --location europe-west9 --non-interactive
```

Sortie archivée:

```text
tmp/checkpoint-002/sql-diff-sandbox-2026-05-21.txt
```

Résultat: PostgreSQL sandbox ne correspond pas au schéma SQL Connect local. La commande retourne `0`, mais elle affiche bien que le schéma ne matche pas.

### Tables créées par le diff

23 tables seraient créées:

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

### Tables modifiées par le diff

4 tables seraient modifiées:

- `user`: ajout des champs profil/RH (`date_activation`, `date_modification`, `equipe_finale_id`, `equipe_type_souhaite`, `poste`, `profil_statut`, `source_connexion`, `telephone`).
- `client`: ajout `origine_import`, `prenom`, `souhaits`, `notes`, `type_chantier_cible`.
- `chantier`: ajout `origine_import`.
- `document_attache`: ajout `devis_id`, `sha256` et relation vers `devis`.

Le diff ajoute aussi 50 index.

### Risques du diff

- C'est une vraie migration, pas un simple "refresh".
- Si la sandbox contient déjà des données, les colonnes `NOT NULL` ajoutées doivent être compatibles avec les valeurs par défaut ou les données existantes.
- Les tables audit/RH/email/planning/rapports apparaîtront en sandbox seulement après migration.
- Les SDK générés peuvent devoir être régénérés après déploiement si les opérations changent.

## 6. Plan de migration sandbox

### Étape 1 - Sécurité minimale sandbox

Décider avant deploy si la sandbox doit avoir:

- backups activés;
- PITR activé ou non;
- auto-resize activé ou non;
- deletion protection activée ou non.

Ce sont des décisions sandbox, pas production.

### Étape 2 - Validation humaine du diff

Relire `tmp/checkpoint-002/sql-diff-sandbox-2026-05-21.txt`.

Validation attendue:

- tables créées acceptées;
- champs ajoutés acceptés;
- pas de suppression non comprise;
- impact sur données sandbox existantes accepté.

### Étape 3 - Déploiement Data Connect sandbox

Commande à ne lancer qu'après validation:

```bash
firebase deploy --only dataconnect --project sosson-sandbox
```

Après le deploy, relancer:

```bash
firebase dataconnect:services:list --project sosson-sandbox
firebase dataconnect:sql:diff --project sosson-sandbox --service sosson-sandbox-service --location europe-west9 --non-interactive
```

But: vérifier que le schéma sandbox s'est rapproché du local.

### Étape 4 - Regénération SDK si nécessaire

Si le schéma ou les opérations ont changé:

```bash
firebase dataconnect:sdk:generate
npm run check:generated-clean
npm run build:sandbox
```

Les SDKs générés ne se modifient jamais à la main.

### Étape 5 - Provisionner les vrais profils SQL `User`

Le seed métier ne crée pas les `User`, parce que `User.id` doit correspondre à un vrai `auth.uid` Firebase.

À préparer:

- UID Firebase Auth du gérant;
- email;
- prénom/nom;
- rôle SQL (`gerant`, `assistante`, `chef_chantier`, etc.);
- statut actif;
- équipe finale si applicable.

Commande réelle à ne lancer qu'après validation:

```bash
npm run provision:sql-users -- --sandbox --yes-sandbox --file=dataconnect/user_profiles.local.json
```

Le fichier `dataconnect/user_profiles.local.json` doit rester local et ne doit pas contenir de secret.

### Étape 6 - Seed sandbox contrôlé

Dry-run sans mutation:

```bash
npm run seed:sandbox -- --dry-run --kind=all --output=tmp/checkpoint-002/seed-sandbox-dry-run.json
```

Seed réel, seulement après validation:

```bash
$env:ALLOW_SANDBOX_DATACONNECT_SEED='true'
npm run seed:sandbox -- --sandbox --yes-sandbox --kind=all --output=tmp/checkpoint-002/seed-sandbox-real.json
```

### Étape 7 - Vérifier les compteurs sandbox

Commande réelle de lecture sandbox, seulement après validation des flags du script:

```bash
$env:ALLOW_SANDBOX_DATACONNECT_READ='true'
npm run count:dataconnect -- --sandbox --yes-sandbox --output=tmp/checkpoint-002/counts-sandbox.json
```

Attendu après seed complet:

- clients opérationnels seedés;
- chantiers opérationnels seedés;
- factures seedées;
- exercices/lignes prévisionnels si seed prévisionnel lancé;
- profils `User` présents si provisioning fait.

### Étape 8 - Vérifier les workflows sandbox

À vérifier après migration + provisioning + seed:

| Workflow | Preuve attendue |
|---|---|
| `User` SQL | `GetCurrentUser` retourne le vrai profil lié à Firebase Auth. |
| Client / prospect | Création ou lecture SQL réelle, pas fallback local. |
| Devis | Création et changement de statut visibles en SQL. |
| Chantier | Chantier lié au client, `origineImport: operationnel`. |
| Factures | Création/statut/lien chantier relus depuis SQL. |
| Documents metadata | `storagePath`, `sha256`, lien chantier/facture relus depuis SQL. |
| Emails indexés | Thread/message/PJ indexés et relus. |
| Planning | Carte créée, modifiée, annulée sans suppression physique. |
| Rapports | Rapport créé puis marqué généré avec chemin/hash. |
| Analytics | Snapshot créé ou relu. |
| Audit | Trace checkpoint/import/change log relue. |

### Étape 9 - Vérifier le front avec `.env.sandbox`

Commandes locales:

```bash
npm run build:sandbox
npm run dev
```

À vérifier dans l'app:

- connexion Firebase réelle;
- `GetCurrentUser` SQL OK;
- pas de redirection injustifiée vers fallback dev;
- pages clients/chantiers/factures lisent SQL;
- une écriture test est relue après refresh;
- tout fallback local est clairement indiqué.

## 7. Commandes en lecture seule

Ces commandes peuvent être lancées maintenant sans modifier la sandbox:

```bash
firebase login:list
firebase use
firebase dataconnect:services:list --project sosson-sandbox
gcloud config get-value project
gcloud sql instances describe sosson-sandbox-instance --project sosson-sandbox --format=json
firebase dataconnect:sql:diff --project sosson-sandbox --service sosson-sandbox-service --location europe-west9 --non-interactive
```

État lu le 2026-05-21:

| Élément | Valeur |
|---|---|
| Firebase login | `matthis.fradin2@gmail.com` |
| Alias courant | `sosson-sandbox` |
| Projet gcloud courant | `tatmadeinnormandie` |
| Service SQL Connect | `sosson-sandbox-service` |
| Connecteur | `sosson` |
| Base | `fdcdb` |
| Région | `europe-west9` |
| Instance | `sosson-sandbox-instance` |
| PostgreSQL | `POSTGRES_18` |
| Tier | `db-f1-micro` |
| Backups | désactivés (`enabled: false`) |
| Start time backup | `23:00`, mais backup désactivé |
| Rétention logs | `transactionLogRetentionDays: 7` |
| Auto-resize | désactivé |
| Deletion protection | désactivée |
| Availability | `ZONAL` |

Point important: le projet `gcloud` courant n'est pas `sosson-sandbox`. Il faut donc toujours passer `--project sosson-sandbox` dans les commandes GCP.

## 8. Commandes mutantes à validation humaine

| Commande | Modifie la sandbox ? | Ce qu'elle fait | Vérification après | Stop si erreur |
|---|---:|---|---|---|
| `firebase deploy --only dataconnect --project sosson-sandbox` | Oui | Déploie schéma/connecteur Data Connect. | `services:list`, `sql:diff`, smoke queries. | Ne pas relancer en boucle; lire le diff/erreur. |
| `firebase dataconnect:sdk:generate` | Non distant, oui fichiers locaux générés | Régénère les SDKs locaux. | `npm run check:generated-clean`, build. | Ne jamais éditer les SDKs à la main. |
| `npm run provision:sql-users -- --sandbox --yes-sandbox --file=...` | Oui | Crée/met à jour les profils SQL `User` sandbox. | `GetCurrentUser`, `ListUsers` selon rôle. | Stop si UID Firebase incertain. |
| `npm run seed:sandbox -- --sandbox --yes-sandbox --kind=all` | Oui | Injecte les seeds opérationnels/prévisionnels. | `count:dataconnect --sandbox`. | Stop si erreur partielle; ne pas bricoler console. |
| `npm run count:dataconnect -- --sandbox --yes-sandbox` | Lecture distante | Relit les compteurs sandbox. | JSON sous `tmp`. | Stop si projet/flags incohérents. |

## 9. Checklist avant déploiement sandbox

- `npm run checkpoint:002:emulator` OK ou preuve locale récente vérifiée.
- `npm run ci:sandbox` OK.
- `firebase dataconnect:sql:diff` archivé et relu.
- Décision écrite sur backups sandbox.
- Décision écrite sur auto-resize sandbox.
- Décision écrite sur deletion protection sandbox.
- Fichier `dataconnect/user_profiles.local.json` prêt avec vrais UID Firebase.
- Dry-run seed sandbox archivé.
- Aucun changement manuel dans SDK générés.
- Aucun fallback local présenté comme sauvegarde SQL.

## 10. Checklist après déploiement sandbox

- `firebase dataconnect:services:list --project sosson-sandbox` montre schéma/connecteur mis à jour.
- `firebase dataconnect:sql:diff ...` ne montre plus de migration inattendue.
- `firebase dataconnect:sdk:generate` lancé si nécessaire.
- `npm run build:sandbox` OK.
- Profils SQL `User` créés et `GetCurrentUser` OK.
- Seed sandbox réel exécuté et archivé.
- Compteurs sandbox relus.
- Front lancé en mode sandbox.
- Écriture client/chantier/facture test relue après refresh.
- Documents, emails, planning, rapports et analytics vérifiés au moins en lecture/écriture metadata.

## 11. Erreurs fréquentes

| Erreur | Sens | Action |
|---|---|---|
| Sandbox vide | Normal avant deploy/seed. | Déployer schéma puis seed après validation. |
| `No space left on device` local | Disque machine plein. | Libérer `C:` ou utiliser un `dataDir` local temporaire. |
| `gcloud config get-value project` différent | Projet CLI par défaut non sandbox. | Toujours utiliser `--project sosson-sandbox`. |
| `GetCurrentUser` vide | Pas de `User` SQL avec cet `auth.uid`. | Provisionner le profil SQL sandbox. |
| Donnée visible après échec SQL | Probable fallback local. | Afficher/corriger la source réelle. |
| Seed interrompu | Base partiellement remplie. | Stopper, analyser, ne pas modifier manuellement la console. |

## 12. Décisions humaines à prendre

1. Accepter le diff de migration sandbox actuel.
2. Décider si backups sandbox doivent être activés avant seed réel.
3. Décider si auto-resize et deletion protection sandbox doivent être activés maintenant.
4. Choisir les vrais utilisateurs Firebase Auth à convertir en `User` SQL.
5. Décider si les lectures sensibles `@auth` seul doivent être durcies avant le deploy sandbox ou juste après.
6. Décider quel seed lancer en premier: opérationnel seul ou opérationnel + prévisionnel.
7. Décider qui valide le front sandbox après écriture/relecture réelle.

## Hors scope maintenant

La production n'est pas l'objectif de ce plan. Elle ne doit recevoir aucune commande. Elle reviendra seulement après une sandbox validée fonctionnellement.
