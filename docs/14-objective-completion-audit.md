# 14 - Audit de completion objectif global

> Statut: vivant  
> Derniere revision: 2026-05-18
> Portee: mapping exigence utilisateur -> artefact -> preuve -> manque.

## Objectif audite

Appliquer la roadmap post-audit checkpoint 001 jusqu'a obtenir une sandbox techniquement saine, documentee, verifiable et prete pour le checkpoint 002.

## Verdict courant

Objectif **non complet**.

Les patchs locaux, la documentation et les checks statiques sont largement en place. La sandbox distante n'est pas encore prouvee: seed reel, comptage distant, profils SQL `User`, rules deployees/testees, RBAC serveur deja durci localement, Storage produit et monitoring restent a valider ou implementer.

## Audit objectif 2026-05-18 - cycle nouveau client operationnel

Objectif audite: amener Sosson plus pres d'un vrai outil metier SQL en validant localement le scenario `client/prospect -> devis -> chantier -> factures`, en clarifiant Dashboard/Statistiques/fallbacks et en preparant la visualisation Moteur live. Toute action sandbox reelle et production est exclue.

Verdict: **non complet pour validation sandbox metier**.

Le parcours SQL local est prouve techniquement, mais les 9 reponses metier restent manquantes. La decision correcte est donc: pret techniquement en local, pas encore pret a demander validation sandbox.

### Audit strict de reprise - 2026-05-18

Controle de completion effectue apres reprise de contexte:

| Point controle | Preuve inspectee | Resultat |
|---|---|---|
| Artefact lifecycle local existe | `tmp/checkpoint-002/operational-lifecycle-local.json` | OK: `mode: "local-emulator"`, `sandboxTouched: false`, `productionTouched: false`, liens client/chantier/factures valides. |
| Artefact lifecycle local valide automatiquement | `npm run check:operational-lifecycle-proof` | OK attendu apres `checkpoint:002:emulator`: le check relit la preuve JSON, bloque une preuve sans client/chantier/factures SQL locaux, une fuite previsionnelle ou un marqueur sandbox/production. |
| Audit completion local machine-readable | `npm run audit:operational-lifecycle-completion`, `tmp/checkpoint-002/operational-lifecycle-completion-audit.json` | Produit un verdict non bloquant `not-ready` tant que les 9 decisions metier ne sont pas renseignees. |
| SDKs generes non modifies | `git status --short src/dataconnect-generated src/dataconnect-admin-generated`, `npm run check:generated-clean` | OK: aucun diff dans les SDKs generes; check vert. |
| Check de readiness lifecycle | `npm run check:operational-lifecycle-readiness` | OK: docs, preuve locale, Moteur live et preflight sandbox relies. |
| Preflight local apres evolutions UI | `npm run checkpoint:002:local` | OK: CI sandbox locale, audit sources front, dry-run comptage Data Connect, dry-run seed sandbox et dry-run provisioning SQL User. Aucune action sandbox reelle. |
| Decisions metier obligatoires | `npm run check:operational-lifecycle-decisions`, `docs/17-operational-lifecycle-scenario.md` | Les 9 decisions sont renseignees: prospect sans chantier, domaine Devis, factures definitives impactantes, statuts chantier et Moteur live type Access. |
| Application controlee des reponses metier | `npm run update:operational-lifecycle-decisions -- --template`, `npm run update:operational-lifecycle-decisions -- --file=tmp/checkpoint-002/answers.json --dry-run` | Outil local disponible pour appliquer les 9 reponses dans `docs/17-operational-lifecycle-scenario.md` sans toucher SQL Connect ni sandbox. |
| Panneau decisions dans Moteur live | `scripts/check-operational-lifecycle-readiness.mjs`, `src/pages/SossonEngineRoomPage.tsx` | OK: le check verrouille `lifecycleDecisionQuestions`, `Decisions qui cadrent la sandbox` et le rappel `check:operational-lifecycle-decisions attendu OK`. |
| Checkpoint emulateur complet apres lot UI/docs | `npm run reset:dataconnect:local -- --yes-local-reset`, `npm run checkpoint:002:emulator`, preuves `tmp/checkpoint-002/*.json` | OK: base pglite locale resetee, seed operationnel + previsionnel, verifications boundary/statut/client/team/email/planning/reports/counts/analytics/previsionnel/factures/lifecycle/documents/RBAC/audit vertes. Premier essai seed a echoue en 503 pendant la configuration initiale de l emulateur, relance OK apres configuration. |
| Couverture par proxy | `checkpoint:002:emulator`, `ci:sandbox`, `checkpoint:002:local` | Utile mais insuffisant pour completion: ces commandes prouvent le local technique, pas les decisions metier reelles. |

Conclusion d'audit: les 9 reponses metier sont renseignees; ne pas demander validation sandbox tant que le lifecycle local avec Devis, prospect sans chantier et factures definitives/categorisees n'a pas ete relance et valide par `checkpoint:002:emulator`.

| Exigence utilisateur | Artefacts / preuves actuelles | Etat | Manque |
|---|---|---|---|
| Lire les docs obligatoires | `AGENTS.md`, `documentation.md`, `docs/00-index.md`, `docs/05-sql-connect.md`, `docs/12-ai-agent-roadmap.md`, `docs/13-checkpoint-002-readiness.md`. | OK | Aucune. |
| Ne travailler que local/emulateur/dry-run | `tmp/checkpoint-002/operational-lifecycle-local.json` indique `mode: "local-emulator"`, `sandboxTouched: false`, `productionTouched: false`; aucune commande sandbox reelle lancee. | OK local | Validation humaine requise avant toute action sandbox. |
| Poser les questions workflow metier avant codage | Decisions conservees dans `docs/17-operational-lifecycle-scenario.md` et referencees dans `docs/13-checkpoint-002-readiness.md`. | OK | Relancer les preuves locales apres changement metier. |
| Verifier que les decisions metier sont renseignees avant sandbox | `npm run check:operational-lifecycle-decisions` valide `docs/17`; ce check est volontairement hors `ci:sandbox`. | OK attendu | Relancer le checkpoint emulateur avec le parcours Devis. |
| Script local lifecycle | `scripts/verify-operational-lifecycle-dataconnect-local.mjs`, script npm `verify:operational-lifecycle:dataconnect`, integration `scripts/checkpoint-002-emulator.mjs`. | OK local | Adapter le scenario si les reponses metier changent le flux. |
| Preuve JSON lisible | `tmp/checkpoint-002/operational-lifecycle-local.json`: user local autorise, prospect sans chantier, devis demande, client `operationnel`, chantier rattache, devis signe, factures definitives/categorisees, checks tous vrais. | OK apres relance emulateur | Preuve sandbox interdite tant que validation humaine absente. |
| Separation operationnel / previsionnel | Preuve lifecycle + `tmp/checkpoint-002/operational-boundary-local.json`: aucun `prev-client-*` / `prev-chantier-*` dans les listes operationnelles. | OK local | Verification sandbox apres validation humaine. |
| Dashboard / Statistiques ne masquent pas les fallbacks | `src/pages/DashboardPage.tsx` et `src/pages/StatistiquesPage.tsx` affichent source SQL Connect ou fallback local/Excel. | OK local | Regle metier des statuts de factures impactants a confirmer. |
| Front creation client / chantier / facture sans fallback silencieux | `ClientsPage`, `ChantiersPage`, `FacturesPage`: libelles `hors SQL`; erreur SQL = aucune creation locale silencieuse en mode SQL. | OK local | Confirmer UX finale apres decisions metier. |
| Fiche client: liens chantiers/factures lisibles | `ClientDetailPage`: chantiers du client badges `Operationnel SQL` / `Operationnel local` / `Previsionnel Excel`, bloc factures rattachees via les chantiers charges avec source SQL/fallback visible. | OK local | Rattachements documents/emails/planning par client a enrichir plus tard dans Moteur live ou fiches detaillees. |
| Fiche chantier: factures rattachees lisibles | `ChantierDetailPage`: bloc factures rattachees au chantier avec source SQL/fallback, nombre, total TTC visible, total valide et alerte sur les factures en attente. | OK local | Regle definitive des factures impactant les KPI dashboard/statistiques toujours a confirmer. |
| Moteur live utile non purement technique | `SossonEngineRoomPage`: catalogue tables/relations, filtres, badges source, liens `Ouvrir`, explorateur client -> devis -> chantiers -> factures avec KPI et navigation vers les fiches, panneau visible des 9 decisions metier validees, mention de la preuve lifecycle et de la fiche metier. | OK maquette fonctionnelle | Documents/emails/planning/rapports/audit a relier plus finement dans l'inspecteur. |
| Validation locale generale | `lint`, `check:operational-lifecycle-readiness`, `check:operational-lifecycle-proof`, `check:doc-entrypoints`, `check:doc-links`, `check:generated-clean`, `check:ui-capabilities`, `check:page-dataconnect-imports`, `check:dataconnect-client-surface`, `build:sandbox`, `checkpoint:002:local`, `checkpoint:002:emulator` executes OK; build garde le warning chunks connu. | OK local | A relancer apres toute reponse metier qui modifie le flux. |
| Aucun SDK genere modifie a la main | `npm run check:generated-clean` OK. | OK | A maintenir si schema/operations changent. |
| Livrable decision finale | Docs 13, 14 et 17 convergent: pas encore pret a demander validation sandbox metier. | OK | Reponses metier puis nouvelle validation locale. |

## Checklist prompt -> artefacts

| Exigence | Artefacts / preuves actuelles | Etat | Manque pour completion |
|---|---|---|---|
| Lire `AGENTS.md`, `documentation.md`, `docs/00-index.md`, `docs/11-audit-checkpoint-001.md`, `docs/12-ai-agent-roadmap.md`, `docs/05-sql-connect.md` | Lecture effectuee avant patchs; fichiers cites dans `docs/13-checkpoint-002-readiness.md`. | OK local | Aucune preuve externe requise. |
| Ne pas modifier les SDKs generes | `firebase dataconnect:sdk:generate` execute; `npm run check:generated-clean` accepte les SDKs modifies car les sources Data Connect changent dans le meme patch. | OK local | Garder les fichiers generes dans le patch et verifier la CI sur checkout propre. |
| Ne pas lancer `firebase init dataconnect` | Aucune commande de ce type executee; `npm run check:production-guard` refuse maintenant cette commande dans `package.json` et workflows. | OK local | Aucune. |
| Ne pas deployer production | Aucun deploy prod execute; `npm run check:production-guard` verifie qu'aucun script/workflow n'automatise la production et que le dashboard interactif bloque la production par defaut. | OK local | Gate humain avant toute commande prod future. |
| Travailler sandbox/local | Tous les scripts dangereux distants sont en dry-run ou gardes par variables `ALLOW_SANDBOX_*`; `check:sandbox-guardrails` prouve que les fichiers exemples sont refuses avant lecture/mutation sandbox, que le seed sandbox bloque sans validation, que les preuves sandbox hors `tmp/` sont refusees, que le comptage sandbox exige `--user-profiles` + `--output`, que le reset local Data Connect refuse sans confirmation, et que les artefacts locaux sensibles restent ignores par git. | OK local | Validation humaine pour toute lecture/mutation sandbox distante. |
| Ne jamais mettre de secret front/doc | `npm run check:front-secrets` OK; le check couvre `AGENTS.md`, `README.md`, `documentation.md`, `src`, `docs`, `scripts`, workflows et env publics. | OK local | Garder le check CI. |
| Ne pas supprimer de donnees reelles | Aucun script destructif distant execute; `npm run check:production-guard` refuse les commandes destructives evidentes dans `package.json` et workflows, sauf le reset local borne de l'emulateur `reset:dataconnect:local`. | OK local | Validation humaine avant action distante. |
| Patchs lisibles/testables | `npm run checkpoint:002:local` OK le 2026-05-18, incluant `npm run ci:sandbox` OK avec `check:operational-lifecycle-readiness`. | OK local | Review humaine recommandee vu le volume. |
| Documenter actions risquees | `docs/10-runbooks.md`, `docs/13-checkpoint-002-readiness.md`, `docs/15-checkpoint-002-sandbox-execution.md`. | OK local | Ajouter sorties reelles apres execution sandbox. |
| Demander validation pour deploy/mutation sandbox | Commandes sandbox reelles listees comme "validation humaine" dans `docs/13` et detaillees dans le gabarit `docs/15`. | OK local | Validation humaine effective. |

## Phases roadmap

| Phase | Exigence | Artefacts / preuves actuelles | Etat | Manque |
|---|---|---|---|---|
| 1 | Cloturer checkpoint 001 | `docs/11-audit-checkpoint-001.md`, `docs/12-ai-agent-roadmap.md`. | Partiel | Remplacer inconnues par preuves sandbox reelles. |
| 1 | Etat chiffre base distante | `scripts/count-dataconnect.mjs` dry-run OK. | Non complet | Executer sur sandbox avec validation humaine. |
| 1 | Seed sandbox reel | Runbooks et scripts existants. | Non complet | Charger/verifier seed reel sandbox. |
| 1 | Decisions/risques/gates/checkpoint 002 | Docs 11/12/13. | OK doc | A confirmer apres sandbox. |
| 2 | Profil applicatif SQL `GetCurrentUser` | `src/features/auth/sqlUserProfile.ts`, `src/lib/auth.ts`, `check:firestore-boundary`. | Partiel | Provisionner vrais `User` SQL sandbox et retirer fallback Firestore ensuite. |
| 2 | Navigateur ne choisit pas son role | `UpsertCurrentUser` retire du connecteur client; SDKs regeneres; `provision:sql-users` utilise Admin SDK `dc.upsert('User', ...)`; `check:dataconnect-client-surface` verrouille l'absence dans les SDKs/front. | OK local | Provisionner/verifier sandbox avec vrais UID. |
| 2 | Fallback dev local seulement local | `.env.*`, `LoginPage`, `check:auth-safety`. | OK local | Test comportement sur Hosting sandbox. |
| 2 | localStorage jamais source d'autorisation | `accessControl.ts` clamp les overrides locaux; `test:access-control` OK; pages sensibles gardees; mutations sensibles verifient le role SQL cote serveur. | OK local | Deployer/verifier sur sandbox. |
| 3 | Audit schema/queries/mutations | Docs 05/11/12, `check:dataconnect-auth`, `check:dataconnect-queries`, `verify:dataconnect:rbac`. | Partiel | Validation sandbox et pagination serveur complete restent a faire. |
| 3 | Separation operationnel/previsionnel | `origineImport` ajoute a `Client` / `Chantier`; `ListOperationalClients` et `ListOperationalChantiers` filtrent `operationnel`; seed previsionnel regenere en `previsionnel`; SDKs regeneres; verify local OK. | OK local | Deployer/verifier la migration en sandbox. |
| 3 | Regeneration SDK si schema change | `firebase dataconnect:sdk:generate` execute apres changement schema/query. | OK local | Garder les SDKs generes dans le patch. |
| 4 | Adapters/hooks metier | `src/features/auth`, `operations`, `factures`, `documents`, `previsionnel`; `src/features/operations/useOperationalData.ts` expose le premier hook metier standardise et `DashboardPage` / `FacturesPage` / `ClientsPage` / `ChantiersPage` le consomment pour leurs lectures. | Partiel | Hooks par domaine, aggregats hors pages, suppression progressive imports seeds/localStorage. |
| 4 | Standardiser loading/error/empty/source | `dataSource`, statuts SQL pages. | Partiel | Standard commun par domaine. |
| 5 | Flux Storage + metadata SQL | `storagePaths.ts`, `documentSql.ts`, `check:document-storage`, docs 10/13. Le check verifie aussi `DocumentFolder`, `DocumentAttache`, `storagePath` et les operations Data Connect documents. | Partiel | Upload signe, rules testees, contrainte serveur `storagePath`. |
| 6 | QA/CI | `ci:sandbox`, workflow GitHub, tests unitaires previsionnel/documents/access-control/data-state, checks statiques secrets/auth/rules/SDK/documents/sandbox guardrails/doc entrypoints/doc links. `check:doc-entrypoints` verifie aussi que la page applicative `/documentation` reste structuree en 8 chapitres; `check:doc-links` verifie les liens Markdown locaux. | OK local | CI distante verte sur PR/push. |
| 6 | Smoke checklist | `docs/08-quality-checks.md`, `docs/13`. | OK doc | Executer smoke sandbox reel. |
| 7 | Doc SQL Connect junior | `docs/05-sql-connect.md`, `src/pages/SossonDocsPage.tsx`, `scripts/check-doc-entrypoints.mjs` et `scripts/check-doc-links.mjs` pour la documentation visible dans l'app et les liens Markdown locaux. La page `/documentation` garde 8 chapitres et utilise un snapshot documentaire au lieu de recharger le gros seed previsionnel. | OK doc | Actualiser avec sorties sandbox. |
| 8 | Exploitation/couts | `docs/09-couts.md`, `docs/10-runbooks.md`. | Partiel | Runbooks budget/monitoring/backup/rollback prepares; configuration GCP et restore sandbox restent a verifier. |
| 9 | Validation finale commandes | `ci:sandbox` OK; `checkpoint:002:local` OK; emulateur SQL Connect lance; seeds simple + previsionnel injectes; `verify:*` OK; `verify:dataconnect:rbac` OK; comptage local archive sous `tmp/`; seed sandbox reel prepare par script garde. | Partiel | Validation sandbox distante. |

## Commandes localement probantes

Dernier etat observe:

```bash
npm run checkpoint:002:local
```

OK le 2026-05-18. Ce preflight regroupe la CI locale sandbox, l'audit des sources front hybrides, le comptage Data Connect en dry-run, le seed sandbox en dry-run archive sous `tmp/checkpoint-002/seed-sandbox-dry-run.json` et le provisioning SQL `User` en dry-run. Il ne valide pas la sandbox distante.

### Commandes et recherches explicitement demandees

| Demande du prompt | Preuve locale | Etat | Limite |
|---|---|---|---|
| `npm run lint` | Inclus dans `npm run ci:sandbox`, lui-meme inclus dans `npm run checkpoint:002:local`. | OK | A relancer sur checkout propre de PR. |
| `npm run test:previsionnel` | Inclus dans `ci:sandbox`. | OK | Couvre le tableur previsionnel, pas le smoke UI manuel. |
| `npm run build:sandbox` | Inclus dans `ci:sandbox`. | OK | Build vert avec warning chunks > 500 kB accepte temporairement. |
| `npm run check:sandbox-guardrails` | Inclus dans `ci:sandbox`; verifie que les scripts sandbox refusent le fichier exemple avant toute lecture/mutation distante, que le seed sandbox bloque sans validation, que le reset local Data Connect refuse sans confirmation, que `.env.local`, les profils locaux, `dataconnect/.dataconnect/pgliteData` et preuves `tmp/` sont ignores, que les sorties profils sont masquees et que les scripts ne regressent pas vers des UID/emails bruts. | OK local | Ne remplace pas une validation humaine avec vrais UID sandbox. |
| `npm run verify:dataconnect` | Execute avec emulateur SQL Connect et seed local. | OK local | Ne remplace pas `counts-sandbox.json` distant. |
| `npm run verify:previsionnel:dataconnect` | Execute avec emulateur SQL Connect et seed previsionnel local. | OK local | Ne prouve pas le seed sandbox reel. |
| Seed sandbox distant | `npm run seed:sandbox -- --dry-run --kind=all --output=tmp/checkpoint-002/seed-sandbox-dry-run.json` prepare et archive la liste de 113 fichiers; l'execution reelle exige `ALLOW_SANDBOX_DATACONNECT_SEED=true`, `--sandbox` et `--yes-sandbox`. | Prepare, non execute | Necessite validation humaine et sera prouve par comptage sandbox. |
| Recherche `VITE_.*SECRET` | `npm run check:front-secrets` verifie les affectations et lectures `import.meta.env` interdites, et bloque aussi l'adresse Outlook personnelle de test deja masquee. La recherche explicite ne remonte que les regles/checks et mentions documentaires, pas d'usage applicatif `src`. | OK | Les mentions documentaires non affectees restent autorisees si elles ne contiennent pas de valeur sensible. |
| Recherche `VITE_.*TOKEN` | `npm run check:front-secrets`; recherche explicite limitee aux regles/checks et mentions documentaires. | OK | Meme limite. |
| Recherche `VITE_.*REFRESH` | `npm run check:front-secrets`; recherche explicite limitee aux regles/checks et mentions documentaires. | OK | Meme limite. |
| Recherche `VITE_MICROSOFT_CLIENT_SECRET` | `npm run check:front-secrets`; recherche explicite limitee au check et aux docs d'interdiction. | OK | Le secret serveur ne doit jamais etre prefixe `VITE_`. |
| Recherche imports seeds/localStorage/Firestore | `npm run audit:frontend-sources -- --output=tmp/checkpoint-002/frontend-sources.json`: 46 imports locaux/seeds, 23 usages applicatifs `localStorage`, 3 usages Firestore, 0 import direct SQL Connect dans les pages. | OK cartographie | Ce script documente l'hybride et ne bloque pas encore la CI. |
| `npm run verify:dataconnect` sans emulateur | Comportement documente: echoue proprement si `127.0.0.1:9399` absent. | Attendu | Relancer apres demarrage emulateur. |
| Comptage sandbox distant | `npm run count:dataconnect -- --dry-run` prepare le format; le mode sandbox exige un fichier de profils connus, une preuve `tmp/`, et echoue si un role SQL ne correspond pas au role attendu. | Non execute | Necessite validation humaine et `ALLOW_SANDBOX_DATACONNECT_READ=true`. |
| Provisioning SQL `User` sandbox | `npm run provision:sql-users -- --file=dataconnect/user_profiles.example.json --dry-run`. | Non mutate | Necessite vrais UID, validation humaine et `ALLOW_SANDBOX_USER_PROVISIONING=true`. |

```bash
npm run ci:sandbox
```

OK avec:

- `npm run lint`
- `npm run test:previsionnel`
- `npm run test:documents`
- `npm run test:access-control`
- `npm run test:data-state`
- `npm run check:front-secrets`
- `npm run check:auth-safety`
- `npm run check:firestore-boundary`
- `npm run check:ui-capabilities`
- `npm run check:document-storage`
- `npm run check:dataconnect-auth`
- `npm run check:dataconnect-queries`
- `npm run check:dataconnect-client-surface`
- `npm run check:firebase-rules`
- `npm run check:production-guard`
- `npm run check:sandbox-guardrails`
- `npm run check:operational-lifecycle-readiness`
- `npm run check:doc-entrypoints`
- `npm run check:doc-links`
- `npm run check:page-dataconnect-imports`
- `npm run check:generated-clean`
- `npm run build:sandbox`

Autres checks:

```bash
npm run audit:frontend-sources -- --output=tmp/checkpoint-002/frontend-sources.json
npm run checkpoint:002:local
npm run count:dataconnect -- --dry-run
npm run count:dataconnect -- --dry-run --output=tmp/checkpoint-002/counts-dry-run.json
npm run seed:sandbox -- --dry-run --kind=all --output=tmp/checkpoint-002/seed-sandbox-dry-run.json
npm run provision:sql-users -- --file=dataconnect/user_profiles.example.json --dry-run
npm run checkpoint:002:emulator
npm run seed:dataconnect
npm run seed:previsionnel:dataconnect
npm run verify:dataconnect
npm run verify:previsionnel:dataconnect
npm run verify:dataconnect:rbac
npm run count:dataconnect -- --output=tmp/checkpoint-002/counts-local.json
```

Les scripts `verify:dataconnect` et `verify:previsionnel:dataconnect` echouent proprement si l'emulateur SQL Connect n'ecoute pas sur `127.0.0.1:9399`; avec emulateur et seeds charges, ils sont maintenant OK localement.
`verify:dataconnect` verifie la presence des IDs du seed canonique plutot qu'un total strict. `checkpoint:002:emulator` archive maintenant le comptage local avant les ecritures RBAC et refuse une base locale deja polluee par une verification RBAC precedente. Derniere execution locale apres renommage des queries operationnelles:

- `verify:dataconnect`: `missingSeedIds` vide;
- `verify:previsionnel:dataconnect`: `exercises=13`, `chantiers=898`, `latestExerciseChantiers=101`;
- `verify:dataconnect:rbac`: assistante autorisee a creer un client, chef de chantier refuse sur creation client, chef de chantier autorise sur dossier document;
- `count:dataconnect` avant RBAC: operationnel `3/4/12`, documents `0/0`, previsionnel `898` lignes chargees, `lineQueryMayBeTruncated=false`.

Ces compteurs sont une preuve locale emulateur, pas une preuve sandbox. Si l'etat local pglite est pollue, `npm run reset:dataconnect:local -- --yes-local-reset` supprime uniquement `dataconnect/.dataconnect/pgliteData` apres arret de l'emulateur.

## Gates non satisfaits

Production reste bloquee tant que:

- le seed sandbox reel n'est pas confirme;
- le comptage distant sandbox n'est pas archive;
- au moins un vrai utilisateur Firebase Auth ne charge pas son profil SQL `User`;
- le provisioning admin direct des `User` n'est pas encore execute/verifie sur sandbox;
- les mutations sensibles durcies localement ne sont pas encore deployees/testees sur sandbox;
- Firestore fallback n'est pas retire ou strictement borne;
- Storage document n'a pas son upload signe, ses rules testees et sa coherence metadata;
- monitoring, budget alerts et backup/rollback ne sont pas valides sur GCP malgre les runbooks locaux prepares.
