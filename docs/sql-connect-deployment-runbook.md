# Runbook SQL Connect et déploiement sandbox

> Statut: runbook humain, aucune commande distante mutante ne doit être lancée sans validation.  
> Date: 2026-05-21  
> Environnements: local émulateur, sandbox `sosson-sandbox`, production `sosson-prod`.

## Principe simple

Sosson utilise trois niveaux:

| Niveau | Ce que c'est | Peut perdre les vraies données ? | Usage |
|---|---|---:|---|
| Émulateur local | PostgreSQL/PGlite local piloté par Firebase Emulator. | Non, seulement local. | Tests, seeds, preuves avant sandbox. |
| Sandbox | Projet Firebase/GCP `sosson-sandbox` + Cloud SQL. | Oui pour les données de test sandbox. | Validation réelle avant production. |
| Production | Projet `sosson-prod`. | Oui, données réelles. | Interdit tant que sandbox non validée. |

SQL Connect expose des queries et mutations GraphQL contrôlées. PostgreSQL garde les tables. Firebase Auth donne l'identité technique (`auth.uid`). La table SQL `User` donne le rôle applicatif Sosson.

## Règles anti-perte

1. Ne jamais lancer `firebase deploy --only dataconnect --project sosson-prod`.
2. Ne jamais lancer de seed sandbox réel sans `ALLOW_SANDBOX_DATACONNECT_SEED=true`, `--sandbox` et `--yes-sandbox`.
3. Ne jamais confondre dry-run et exécution réelle.
4. Ne jamais éditer `src/dataconnect-generated/` ou `src/dataconnect-admin-generated/`.
5. Ne jamais masquer un échec SQL par un fallback local silencieux.
6. Ne jamais déclarer la production prête sans backup, PITR, restore test, HA/RTO/RPO validés.

## Avant sandbox

### 1. Vérifier l'état local Git

```bash
git status --short
npm run check:generated-clean
```

Le résultat attendu: SDK générés inchangés. Les modifications locales doivent être comprises et documentées.

### 2. Libérer l'espace local

L'audit du 2026-05-21 a échoué sur l'émulateur car `C:` était plein. Avant de relancer:

```bash
Get-PSDrive -PSProvider FileSystem
```

Prévoir plusieurs Go libres. Si l'émulateur est pollué:

```bash
npm run reset:dataconnect:local -- --yes-local-reset
```

Cette commande supprime seulement l'état local `dataconnect/.dataconnect/pgliteData`.

Pendant l'audit, une preuve complète a été obtenue avec une configuration temporaire non versionnée qui place le `dataDir` PGlite sur `E:`. Ce contournement ne doit pas être commité tel quel dans `firebase.json`: il est propre à cette machine. La solution durable reste de libérer de l'espace sur `C:` ou de décider officiellement un chemin local plus spacieux.

### 3. Lancer l'émulateur

Terminal 1:

```bash
npm run emulators:dataconnect
```

Terminal 2:

```bash
npm run checkpoint:002:emulator
```

Preuve attendue: les scripts de seed, workflow, RBAC, prévisionnel, documents, emails, planning, rapports, analytics et audit s'exécutent, écrivent, relisent et produisent leurs fichiers sous `tmp/checkpoint-002/`.

État observé le 2026-05-21: le checkpoint complet passe après correction de l'ordre du comptage propre dans `scripts/checkpoint-002-emulator.mjs`.

### 4. Lancer les checks statiques

```bash
npm run check:dataconnect-auth
npm run check:dataconnect-queries
npm run check:dataconnect-client-surface
npm run check:front-secrets
npm run check:auth-safety
npm run check:firestore-boundary
npm run check:document-storage
npm run check:firebase-rules
npm run check:production-guard
npm run check:sandbox-guardrails
npm run check:operational-lifecycle-readiness
npm run check:operational-lifecycle-decisions
```

### 5. Dry-runs sans mutation distante

```bash
npm run seed:sandbox -- --dry-run --kind=previsionnel --output=tmp/checkpoint-002/seed-sandbox-dry-run.json
npm run count:dataconnect -- --dry-run --output=tmp/checkpoint-002/counts-dry-run.json
npm run provision:sql-users -- --file=dataconnect/user_profiles.example.json --dry-run
```

Ces commandes ne prouvent pas la sandbox remplie. Elles prouvent seulement la liste des actions prévues.

## Inspection sandbox en lecture seule

Commandes autorisées sans mutation:

```bash
firebase login:list
firebase use
firebase dataconnect:services:list --project sosson-sandbox
gcloud config get-value project
gcloud sql instances describe sosson-sandbox-instance --project sosson-sandbox --format=json
```

Champs à relever:

- `settings.backupConfiguration.enabled`
- `settings.backupConfiguration.startTime`
- `settings.backupConfiguration.transactionLogRetentionDays`
- `settings.availabilityType`
- `settings.deletionProtectionEnabled`
- `databaseVersion`
- `region`
- `settings.tier`
- `settings.storageAutoResize`

État observé le 2026-05-21:

| Champ | Valeur sandbox | Lecture |
|---|---|---|
| Service | `sosson-sandbox-service` | Existe. |
| Région | `europe-west9` | Conforme repo. |
| Instance | `sosson-sandbox-instance` | Existe. |
| Base | `fdcdb` | Existe. |
| Connecteur | `sosson` | Existe. |
| PostgreSQL | `POSTGRES_18` | Actif. |
| Tier | `db-f1-micro` | Petit, sandbox seulement. |
| Backup enabled | `false` | À corriger avant seed réel important. |
| Availability | `ZONAL` | Pas HA. |
| Deletion protection | `false` | Risque suppression. |
| Storage auto resize | `false` | Risque blocage disque. |

## Déploiement sandbox réel

À ne lancer qu'après validation humaine écrite.

### Diff avant déploiement

Commande non destructive à lancer et archiver avant toute migration:

```bash
firebase dataconnect:sql:diff --project sosson-sandbox --service sosson-sandbox-service --location europe-west9 --non-interactive
```

État observé le 2026-05-21: le diff est important. Il prévoit des ajouts de champs sur `user`, `client`, `chantier`, `document_attache`, et la création des domaines `devis`, email, planning, RH, analytics, rapports, audit, checkpoint et import.

Décision requise avant déploiement:

- accepter que le déploiement sandbox soit une migration réelle;
- vérifier qu'aucune donnée sandbox existante ne sera perdue;
- décider backups/PITR sandbox avant migration;
- préparer les smoke tests post-déploiement.

### Commande de déploiement

```bash
firebase deploy --only dataconnect --project sosson-sandbox
```

Puis vérifier:

```bash
firebase dataconnect:services:list --project sosson-sandbox
```

Si le déploiement change le schéma, collecter:

- date/heure,
- commit Git,
- sortie CLI,
- diff attendu,
- tables/champs ajoutés,
- données existantes impactées,
- plan rollback.

## Seed sandbox réel

À ne lancer qu'après validation humaine écrite, sauvegardes sandbox clarifiées, et profils `User` planifiés.

```bash
$env:ALLOW_SANDBOX_DATACONNECT_SEED='true'
npm run seed:sandbox -- --sandbox --yes-sandbox --kind=previsionnel --output=tmp/checkpoint-002/seed-sandbox-real.json
```

Ensuite relire les compteurs sandbox avec la commande prévue par le repo, seulement après vérification des flags de sécurité du script.

## Rollback

Rollback applicatif:

1. Revenir au commit précédent.
2. Redéployer le connecteur précédent uniquement après analyse du diff.
3. Relancer les queries de smoke test.

Rollback données:

1. Ne pas improviser.
2. Vérifier qu'un backup existe.
3. Restaurer dans une instance de test d'abord.
4. Comparer les données.
5. Basculer seulement après validation humaine.

## Backup, PITR, HA, RPO, RTO

Backup: copie de la base à un moment donné.

PITR: point-in-time recovery, retour à un instant précis entre deux backups grâce aux journaux de transaction.

HA: haute disponibilité, configuration Cloud SQL qui réduit l'indisponibilité si une zone tombe.

RPO: perte maximale acceptable. Exemple: "on accepte de perdre au maximum 15 minutes de données".

RTO: temps maximal de reprise. Exemple: "l'app doit être de retour en moins de 2 heures".

Restore test: test réel de restauration. Sans restore test, un backup est une promesse, pas une preuve.

## Checklist production

Production reste interdite tant que ces points ne sont pas prouvés:

- Sandbox déployée et validée fonctionnellement.
- Profils SQL `User` réels provisionnés.
- RBAC lectures/mutations sensibles validé avec plusieurs rôles.
- Fallbacks locaux supprimés ou explicitement signalés.
- Backups activés.
- PITR activé et durée validée.
- Restore test réussi.
- HA ou décision explicite signée si non HA.
- RPO/RTO écrits.
- Storage documents testé: upload, metadata SQL, lecture, droits, suppression/restore.
- Runbook rollback testé.

## Erreurs fréquentes

| Erreur | Sens | Réaction |
|---|---|---|
| `No space left on device` | Disque local ou Cloud SQL plein. | Libérer espace local ou activer auto-resize côté Cloud SQL selon environnement. |
| Violation FK après seed interrompu | Base partiellement seedée. | Reset local si émulateur; ne pas bricoler en sandbox sans plan. |
| Donnée visible malgré échec SQL | Fallback local utilisé. | Afficher la source réelle et corriger le flux. |
| Auth Firebase OK mais profil absent | Pas de `User` SQL actif pour `auth.uid`. | Passer par onboarding/provisioning. |
| Query trop large | `@auth` seul ne suffit pas pour données sensibles. | Ajouter check SQL `User` + rôle. |
