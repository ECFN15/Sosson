# Sosson

Hub operationnel interne mono-entreprise pour une PME francaise du batiment.

La cible metier est Firebase SQL Connect / Cloud SQL PostgreSQL. Firebase Auth porte l'identite. Firestore et localStorage restent transitoires ou locaux et ne doivent pas devenir source d'autorisation ou de verite metier.

## Lire d'abord

1. `AGENTS.md` - reference operationnelle courte.
2. `documentation.md` - porte d'entree documentation.
3. `docs/00-index.md` - index maintenable.
4. `docs/13-checkpoint-002-readiness.md` - preuves attendues checkpoint 002.
5. `docs/15-checkpoint-002-sandbox-execution.md` - runbook humain pour actions sandbox reelles.

## Commandes locales

```bash
npm run dev
npm run checkpoint:002:local
```

`checkpoint:002:local` ne deploie rien et ne lit pas la sandbox distante. Il enchaine la CI locale, l'audit des sources front hybrides, un dry-run de comptage Data Connect, un dry-run de seed sandbox archive sous `tmp/` et un dry-run de provisioning SQL `User`.

## SQL Connect local

Terminal 1:

```bash
npm run emulators:dataconnect
```

Terminal 2:

```bash
npm run checkpoint:002:emulator
```

Cette commande ne touche pas la sandbox distante. Elle archive notamment `tmp/checkpoint-002/counts-local.json`, `tmp/checkpoint-002/operational-boundary-local.json`, `tmp/checkpoint-002/team-users-local.json`, `tmp/checkpoint-002/email-local.json`, `tmp/checkpoint-002/documents-local.json`, `tmp/checkpoint-002/planning-local.json`, `tmp/checkpoint-002/report-local.json`, `tmp/checkpoint-002/analytics-snapshot-local.json` et `tmp/checkpoint-002/checkpoint-audit-local.json`.

Si l'etat local pglite est pollue par une verification RBAC precedente:

```bash
npm run reset:dataconnect:local -- --yes-local-reset
```

Ce reset supprime uniquement `dataconnect/.dataconnect/pgliteData` et refuse de s'executer si l'emulateur tourne encore.

## Regles importantes

- Ne jamais lancer `firebase init dataconnect`.
- Ne jamais modifier a la main `src/dataconnect-generated/` ou `src/dataconnect-admin-generated/`.
- Ne jamais deployer production tant que la sandbox n'est pas validee.
- Ne jamais committer de secret, UID prive non anonymise, token ou preuve sandbox sensible.
- Les actions sandbox reelles (`firebase deploy`, seed sandbox, provisioning SQL `User`, comptage distant) demandent une validation humaine explicite.

## Etat production

Production non prete. Les blocages principaux sont la validation sandbox reelle, les vrais profils SQL `User`, le comptage distant archive, les rules deployees/testees, le RBAC serveur verifie en sandbox, Storage produit et monitoring/backups.
