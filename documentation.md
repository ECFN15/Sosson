# Sosson - Documentation technique

> Statut: index racine
> Derniere revision: 2026-05-17
> Version: 0.3.0 - checkpoint audit 001

Ce fichier est une porte d'entree. Le detail vit dans `docs/`.

## Lire d'abord

1. [docs/00-index.md](docs/00-index.md) - index maintenable.
2. [docs/11-audit-checkpoint-001.md](docs/11-audit-checkpoint-001.md) - etat reel audite le 2026-05-16.
3. [AGENTS.md](AGENTS.md) - reference operationnelle courte pour agents et developpeurs.

## Etat global

Sosson est un hub operationnel interne mono-entreprise pour une PME francaise du batiment. La cible metier reste SQL Connect / Cloud SQL PostgreSQL. Firebase Auth est actif. Firestore et localStorage sont encore presents pour des usages transitoires ou locaux, mais ne doivent pas devenir source de verite metier.

Le checkpoint 001 confirme:

- Build sandbox OK.
- Lint OK apres correction du callback Microsoft.
- Tests previsionnel OK.
- SQL Connect partiellement branche au front.
- Auth locale seedee desactivee par defaut.
- Regles Firestore/Storage durcies dans le repo, a valider en sandbox avant deploy.
- Production non validee.

## Sommaire utile

| Document | Usage |
|---|---|
| [00 - Index](docs/00-index.md) | Carte de la documentation. |
| [01 - Vision](docs/01-vision.md) | Produit, perimetre, principes. |
| [02 - Architecture](docs/02-architecture.md) | Architecture cible historique, a lire avec le checkpoint. |
| [03 - Data Architecture](docs/03-data-architecture.md) | Modele data cible. Le schema reel est dans `dataconnect/schema/schema.gql`. |
| [04 - Firebase sandbox/prod](docs/04-firebase-sandbox-prod.md) | Environnements et garde-fous. |
| [05 - SQL Connect](docs/05-sql-connect.md) | Etat reel SQL Connect et integration front. |
| [06 - Integrations](docs/06-integrations.md) | Integrations externes; Outlook/Microsoft Graph courant, Gmail historique/alternatif. |
| [07 - Frontend state](docs/07-frontend-state.md) | Sources de donnees par page. |
| [08 - Quality checks](docs/08-quality-checks.md) | Build, lint, tests, smoke checks. |
| [09 - Roadmap](docs/09-roadmap.md) | Roadmap priorisee P0-P5. |
| [10 - Securite](docs/10-securite.md) | Cadrage securite cible. |
| [10 - Runbooks](docs/10-runbooks.md) | Commandes sandbox/local. |
| [11 - Audit checkpoint 001](docs/11-audit-checkpoint-001.md) | Audit officiel courant. |
| [11 - Outlook Graph Email](docs/11-outlook-graph-email.md) | Journal de la preuve Outlook locale. |
| [12 - Roadmap agents IA](docs/12-ai-agent-roadmap.md) | Plan de travail par agent specialise. |
| [13 - Readiness checkpoint 002](docs/13-checkpoint-002-readiness.md) | Checklist de preuves pour declarer la sandbox prete checkpoint 002. |
| [14 - Audit completion objectif global](docs/14-objective-completion-audit.md) | Mapping exigence -> preuve -> manque pour eviter une fausse cloture. |
| [15 - Execution sandbox checkpoint 002](docs/15-checkpoint-002-sandbox-execution.md) | Gabarit d'execution humaine des actions sandbox reelles. |
| [16 - Audit SQL reel et architecture cible](docs/16-sql-architecture-target-audit.md) | Rapport SQL/front/previsionnel/checkpoints et plan de migration durable. |
| [ADR](docs/adr/README.md) | Decisions structurantes. |

## Documentation visible dans l'application

La page React `/documentation` est maintenue dans `src/pages/SossonDocsPage.tsx`.
Elle n'est pas un simple extrait de `docs/05-sql-connect.md`: c'est la documentation produit visible dans l'app, cumulative, avec les anciens contenus reorganises et les ajouts checkpoint 001/002.

Chapitres actuels:

1. Mails, Microsoft Azure et Microsoft Graph.
2. SQL Connect, PostgreSQL et source de verite metier.
3. Securite, Auth, roles et secrets.
4. Previsionnel Excel, clients historiques et statistiques.
5. Documents, factures et Firebase Storage.
6. Frontend React, navigation et etat applicatif.
7. Parcours produit: dashboard, chantiers, clients et operations.
8. Sandbox, checkpoints, seeds et exploitation.
9. Roadmap, agents IA et maintenance du livre.

Regle de maintenance: ajouter ou deplacer un chapitre sans supprimer l'ancien contenu utile. Si un bloc devient historique, le ranger comme historique/alternative plutot que l'effacer.

## Regles de maintenance

- Un changement d'architecture doit mettre a jour la doc concernee ou le checkpoint suivant.
- Les SDKs generes SQL Connect ne se modifient jamais a la main.
- Aucune valeur secrete ne doit etre ajoutee dans la doc.
- Les chapitres anciens qui decrivent une cible doivent rester identifies comme cible, pas comme etat implemente.

## Prochain checkpoint recommande

Lire [docs/11-audit-checkpoint-001.md](docs/11-audit-checkpoint-001.md), puis executer:

```bash
npm run checkpoint:002:local
```

Ce preflight reste local: il lance la CI sandbox, l'audit sources front, le dry-run de comptage, le dry-run seed sandbox archive sous `tmp/` et le dry-run provisioning SQL `User`.

Pour verifier aussi SQL Connect avec l'emulateur local:

```bash
# Terminal 1
npm run emulators:dataconnect

# Terminal 2
npm run checkpoint:002:emulator
```

Si l'etat local pglite est pollue par une verification RBAC precedente, arreter l'emulateur puis lancer `npm run reset:dataconnect:local -- --yes-local-reset`.

Ensuite traiter en priorite:

1. Validation sandbox des profils SQL `User` lus par `GetCurrentUser`.
2. Validation sandbox du RBAC serveur SQL Connect deja implemente localement.
3. Execution et verification du seed sandbox reel via le runbook humain.
4. Validation sandbox de la separation operationnel / historique previsionnel via `origineImport`.
5. Storage documents securise.
6. Smoke tests sandbox.
