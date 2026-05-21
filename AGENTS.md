# AGENTS.md - Sosson
## Reference operationnelle du projet

> A lire en priorite avant toute intervention importante sur le repo.
>
> Derniere mise a jour : 16 mai 2026
> Version : 0.4.0

---

## 1. Role de ce document

Ce fichier n'est plus un livre exhaustif ni un journal detaille.
Il sert de **reference de travail** pour repartir vite et proprement.

Il doit rester :
- court
- vrai
- actionnable
- aligne avec l'etat reel du repo

Tout ce qui est purement historique, narratif ou deja depasse doit etre retire au lieu de s'accumuler ici.

---

## 2. Resume executif

### Ce qu'est Sosson

Sosson est un **hub operationnel interne** pour une seule PME francaise du batiment.
Ce n'est **pas** un SaaS multi-tenant.

Le produit vise a centraliser :
- les clients
- les chantiers
- les factures fournisseurs
- les emails et documents lies aux dossiers
- la vision budgetaire et operationnelle

### Etat global au 16 mai 2026

La base du projet est maintenant saine :
- le front React/Vite existe et tourne
- Firebase Auth est branche
- SQL Connect est initialise localement
- le schema SQL Connect Sosson est ecrit
- le deploy sandbox SQL Connect a **reussi**
- la base Postgres `fdcdb` existe
- les tables `user`, `client`, `chantier`, `facture` existent
- le connecteur `sosson` est deploye

Ce qui reste **non termine** :
- le seed sandbox reel reste a valider explicitement sur l'environnement Firebase cible
- le front est encore hybride : SQL Connect est partiellement branche, mais plusieurs pages restent locales ou derivees des seeds/previsionnel
- le profil applicatif utilisateur tente maintenant SQL `GetCurrentUser`, avec Firestore encore en fallback transitoire
- le RBAC serveur SQL Connect est implemente localement sur les mutations sensibles; les lectures RH sensibles (`ListUsers`, demandes onboarding, equipes RH, heures, paie) exigent aussi un `User` SQL courant et un check de role serveur, mais rien n'est encore deploye/verifie sur sandbox
- la production ne doit pas encore etre consideree comme validee

### Decision de cadrage

La phase "demo / MVP express" est terminee et ne pilote plus rien.
Le projet entre dans une phase de **developpement produit propre**.

---

## 3. Decisions figees

Ces points ne doivent plus etre remis en question sans bonne raison :

- **SQL Connect** est la couche de persistance cible.
- **Sandbox d'abord**, production ensuite.
- Le front existant est le bon squelette de travail.
- Les SDKs generes par SQL Connect ne se modifient pas a la main.
- On ne saisit pas les donnees manuellement dans la console Firebase si un fichier du repo doit etre la source de verite.

---

## 4. Architecture actuelle

### Front

- React 19
- Vite 6
- TypeScript 6
- TailwindCSS 4
- React Router 7
- Recharts
- React Dropzone

### Backend / infra

- Firebase Auth
- Firebase Hosting
- Firebase Storage
- Firebase SQL Connect
- Cloud SQL PostgreSQL

### Mode de fonctionnement actuel

L'application est encore dans un **etat hybride** :
- l'auth utilise Firebase si la config est presente
- le profil applicatif tente SQL Connect `GetCurrentUser` dans `src/lib/auth.ts`, avec Firestore encore en fallback transitoire
- les entites metier front (`clients`, `chantiers`, `factures`) peuvent venir de SQL Connect si disponible, sinon des donnees Excel/locales
- SQL Connect est branche partiellement dans le store principal, mais pas encore comme source unique

---

## 5. Environnements

### Projets Firebase

| Environnement | Alias `.firebaserc` | Project ID |
|---|---|---|
| sandbox | `default` | `sosson-sandbox` |
| production | `prod` | `sosson-prod` |

### Fichiers d'environnement

- `.env.sandbox`
- `.env.production`
- `.env.example`

Scripts utiles :

```bash
npm run dev
npm run dev:prod
npm run build:sandbox
npm run build:prod
npm run check:operational-lifecycle-readiness
```

---

## 6. Etat SQL Connect

### Configuration retenue

- region : `europe-west9`
- service sandbox : `sosson-sandbox-service`
- instance sandbox : `sosson-sandbox-instance`
- database sandbox : `fdcdb`

### Etat confirme

Le 23 avril 2026, le deploy suivant a abouti :

```bash
firebase deploy --only dataconnect --project sosson-sandbox
```

Resultat confirme :
- compilation schema/connecteurs OK
- base Postgres `fdcdb` creee
- migrations SQL appliquees
- schema `main` migre
- connecteur `sosson` deploye

### Consequence concrete

La console Firebase peut afficher les tables :
- `User`
- `Client`
- `Chantier`
- `Facture`

Si la console affiche des tables vides avec un bouton "Ajouter des donnees", c'est normal :
le schema existe, mais le seed n'a pas encore ete charge.

---

## 7. Source de verite des donnees

### Fichiers critiques

- `dataconnect/schema/schema.gql`
- `dataconnect/sosson/queries.gql`
- `dataconnect/sosson/mutations.gql`
- `dataconnect/sosson/connector.yaml`
- `dataconnect/seed_data.gql`
- `dataconnect/previsionnel_seed_data.gql`
- `dataconnect/dataconnect.yaml`

### Signification

- `schema.gql` = la structure relationnelle
- `queries.gql` = les lectures autorisees
- `mutations.gql` = les ecritures autorisees
- `seed_data.gql` = les donnees initiales de sandbox
- `previsionnel_seed_data.gql` = seed genere depuis le fichier Excel previsionnel pour alimenter clients/chantiers historiques

### Schema metier courant

Le schema SQL Connect de Sosson modelise 5 entites metier principales :

- `User` : utilisateur interne lie a Firebase Auth
- `Client` : client final ou prospect, avec `origineImport` (`operationnel` ou `previsionnel`)
- `Chantier` : dossier operationnel rattache a un client, avec `origineImport` (`operationnel` ou `previsionnel`)
- `Devis` : devis demande/envoye/signe rattache au client et optionnellement au chantier confirme
- `Facture` : facture fournisseur rattachee a un chantier

Les champs derives comme les depenses agregees, la marge ou la tendance budgetaire ne sont pas stockes en dur dans la base principale : ils se calculent a partir des relations et des donnees de factures.

### Seed courant

Le seed sandbox prevu contient :
- 3 clients
- 4 chantiers
- 12 factures

Le seed **ne cree pas les `User`** car `User.id` doit correspondre a un vrai `auth.uid` Firebase.

Un seed previsionnel complementaire existe maintenant :
- fichier : `dataconnect/previsionnel_seed_data.gql`
- fichiers chunkes executables : `dataconnect/previsionnel_seed/*.gql`
- generation : `npm run seed:previsionnel:generate`
- injection locale : `npm run seed:previsionnel:dataconnect`
- verification locale : `npm run verify:previsionnel:dataconnect`
- contenu courant : 13 exercices, 586 clients, 616 alias, 898 chantiers, 898 lignes previsionnelles, 1577 montants mensuels et 887 montants par lot
- les clients/chantiers crees par ce seed portent `origineImport: "previsionnel"`; les listes operationnelles SQL filtrent `origineImport: "operationnel"`
- les lignes de synthese Excel (`Cumul`, `Total`, etc.) sont exclues
- le jaune Excel signifie facture envoyee (`invoiceSent`), pas facture payee / encaissee

Le schema SQL Connect contient maintenant les tables previsionnelles :
- `PrevisionnelImportBatch`
- `PrevisionnelExercise`
- `ClientAlias`
- `PrevisionnelLine`
- `PrevisionnelMonthlyAmount`
- `PrevisionnelLotAmount`
- `PrevisionnelCellEdit`

Un lot local, non deploye en sandbox, ajoute aussi le flux de premiere connexion equipe :
- `TeamProfileSubmission` collecte les demandes de profil creees apres une connexion Firebase Auth sans `User` SQL actif.
- la mutation self-service `SubmitCurrentTeamProfile` ecrit uniquement la demande bornee a `auth.uid` et ne cree aucun role applicatif.
- la mutation `ConvertTeamProfileSubmission`, reservee au role SQL `gerant`, exige une demande existante encore `pending`, convertit cette demande en vrai `User` SQL actif, conserve `sourceConnexion` (`google` / `email`) et refuse une reconversion.
- le front expose `/complete-profile`, `/profile-pending`, la connexion Google Firebase et une reception des demandes dans `Equipe`.
- ce flux est compile localement, mais n'est pas encore deploye ni valide en sandbox distante.

Un lot local, non deploye en sandbox, ajoute aussi le socle RH equipe :
- `SossonTeam`
- `SossonTeamMember`
- `SossonTeamLeavePeriod`
- `SossonWorkTimeEntry`
- `SossonPayrollPeriod`
- `PlanningJobSheet`

Ces tables servent aux equipes finales, fiches de poste, conges, saisies d'heures, preparation paie et fiches d'intervention issues du planning. Ce n'est pas un module de bulletin legal. La page `Equipe` lit les equipes/membres/conges SQL quand Data Connect est actif, peut creer une equipe finale, une fiche membre, un conge, une ligne d'heures et un brouillon de paie SQL, avec fallback local visible pour les donnees equipe historiques. Elle sait aussi deplacer une fiche membre SQL vers une autre equipe finale SQL via `UpdateSossonTeamMember`; le deplacement vers une equipe locale est refuse quand la fiche vient de SQL. La route detail `/equipe/profils/:memberId` est maintenant SQL-aware : elle relit et modifie une fiche membre SQL, ajoute des conges, saisit des heures et prepare un brouillon de paie quand le membre vient de SQL. La conversion d'une demande onboarding cree aussi une fiche membre SQL quand l'equipe finale selectionnee vient de SQL. La page `Planning` charge maintenant directement les equipes finales SQL via `loadTeamDirectoryFromSql`, renseigne `sossonTeamId` dans `PlanningAssignment`, cree une `PlanningJobSheet` pour les cartes SQL, puis peut rattacher les heures a la fiche, a l'evenement planning, a l'affectation et au chantier. Les champs acteur sensibles (`approvedBy`, `createdBy`, `updatedBy`, `author`) sont maintenant lies serveur via `auth.uid` sur les mutations concernees et audites par `npm run check:dataconnect-auth`. Cette tranche est compilee et prouvee en emulateur local par `npm run verify:team-rh:dataconnect`, mais n'est pas encore deployee ni validee en sandbox distante.

Un premier lot local, non deploye en sandbox, prepare aussi la tracabilite SQL :
- `AuditEvent`
- `CheckpointRun`
- `CheckpointStep`
- `CheckpointArtifact`
- `CheckpointDecision`
- `DataImportRun`
- `DataImportIssue`
- `EntityChangeLog`

Ces tables sont destinees a indexer et historiser les checkpoints, imports, preuves, hashes et changements d'entites. Les gros logs/fichiers restent hors SQL. Leur presence dans le repo ne prouve pas encore leur existence en sandbox distante.

Un deuxieme lot local, non deploye en sandbox, prepare aussi les domaines email, planning, rapports et analytics :
- `EmailThread`
- `EmailMessage`
- `EmailAttachment`
- `PlanningEvent`
- `PlanningAssignment`
- `AnalyticsSnapshot`
- `Rapport`

Les operations Data Connect et adapters front existent pour ces domaines (`src/features/email`, `src/features/planning`, `src/features/reports`, `src/features/analytics`). Emails, Planning, Rapports, Dashboard et Statistiques ont un raccordement SQL partiel avec fallbacks visibles. La page Emails lit l'index SQL et peut indexer un fil/message; la preuve locale cree et relit aussi une piece jointe metadata. La page Planning lit, cree, modifie, deplace et annule maintenant les cartes SQL quand Data Connect est la source active; l'annulation passe par `CancelPlanningEvent` et conserve la ligne SQL avec statut `cancelled`. Les fiches Client et Chantier savent aussi modifier respectivement un client via `UpdateClient` et un statut via `UpdateChantierStatut` quand Data Connect est la source active, avec fallback local explicite sinon. La page Factures sait creer une facture via `CreateFacture` et modifier son statut via `SetFactureStatut`, avec fallback annonce hors source SQL. Le tableur Previsionnel sait modifier un montant mensuel via `UpdatePrevisionnelMonthlyAmount` et sauvegarder une cellule exacte via `UpsertPrevisionnelCellEdit`, avec fallback `localStorage` annonce quand SQL n'est pas disponible. La page Rapports lit/cree des metadonnees SQL et une preuve locale genere un artefact CSV sous `tmp/`, calcule son hash reel, puis marque le rapport comme genere avec ce chemin/hash. La page Equipe lit `ListUsers`, `ListTeamProfileSubmissions` et le repertoire RH SQL via `src/features/team/teamSql.ts`; ces lectures RH sensibles ont maintenant un check de role serveur audite par `npm run check:dataconnect-queries`. La fiche detail membre sait maintenant relire et modifier une fiche SQL, mais les droits applicatifs restent encore en `localStorage`. `AnalyticsSnapshot`, une preuve edition previsionnel, une preuve edition client, une preuve statut chantier, une preuve facture, une preuve email, une preuve planning et une preuve rapport sont crees et relus en emulateur local par `npm run checkpoint:002:emulator`. Rien de cela ne prouve encore leur existence ou leur contenu en sandbox distante.

La page `src/pages/PrevisionnelPage.tsx` charge maintenant les valeurs `2025-26` depuis SQL Connect quand disponible.
Le bouton `Sauvegarder SQL` :
- met a jour les montants mensuels dans `PrevisionnelMonthlyAmount`
- enregistre toutes les cellules modifiees dans `PrevisionnelCellEdit` pour conserver l'export Excel exact
- garde le fallback `localStorage` si SQL Connect n'est pas disponible

La page `src/pages/StatistiquesPage.tsx` tente maintenant de lire les exercices et les lignes courantes depuis SQL Connect.
Si SQL Connect ou l'auth ne repond pas, elle retombe sur les donnees TS nettoyees.

---

## 8. Fichiers generes

Ces repertoires sont auto-generes et ne doivent pas etre modifies a la main :

- `src/dataconnect-generated/`
- `src/dataconnect-admin-generated/`

Si le schema ou les operations changent, il faut regenerer proprement au lieu d'editer ces fichiers.

---

## 9. Structure utile du repo

```text
Sosson/
├── AGENTS.md
├── documentation.md
├── docs/
├── dataconnect/
│   ├── dataconnect.yaml
│   ├── seed_data.gql
│   ├── schema/
│   │   └── schema.gql
│   └── sosson/
│       ├── connector.yaml
│       ├── queries.gql
│       └── mutations.gql
├── deploy/
├── src/
│   ├── data/
│   ├── lib/
│   ├── pages/
│   ├── components/
│   ├── dataconnect-generated/
│   └── dataconnect-admin-generated/
├── firebase.json
├── .firebaserc
├── .env.sandbox
└── .env.production
```

### Reperes front

- `src/lib/firebase.ts` : initialisation Firebase
- `src/lib/auth.ts` : login Firebase + fallback local
- `src/lib/store.tsx` : store React encore alimente par les seeds TS
- `src/data/*` : donnees en memoire actuelles
- `src/pages/*` : pages du produit

---

## 10. Etat front actuel

### Ce qui existe deja

Le front couvre deja les ecrans principaux :
- login
- dashboard
- liste des chantiers
- detail chantier
- clients
- factures
- emails
- planning
- premiere connexion `/complete-profile` et attente `/profile-pending`
- equipe, profils onboarding, fiches membres, conges, heures et preparation paie

### Ce qui est encore provisoire

- le store principal utilise SQL Connect quand disponible, avec fallback Excel/local (`src/data/*`)
- `clients` et `chantiers` utilisent maintenant les donnees Excel previsionnelles nettoyees en fallback local quand SQL Connect n'a pas encore fourni de donnees
- `emails` reste expose depuis les seeds locaux
- `equipe` lit et ecrit maintenant une partie du modele RH SQL quand Data Connect est actif, mais les droits applicatifs et certains fallback restent en `localStorage`
- une app Microsoft Entra de test `Sosson Email Test` a ete creee pour valider le module email Outlook/Graph avec un compte Outlook de developpement
- les URI de redirection configurees sur cette app Microsoft de test sont :
  - `https://sosson-sandbox.web.app/auth/microsoft/callback`
  - `http://localhost:5173/auth/microsoft/callback`
- les identifiants non secrets de cette app sont ranges dans `.env.local`; le `MICROSOFT_CLIENT_SECRET` doit rester uniquement local/serveur et ne jamais etre prefixe par `VITE_`
- l'effet "ajout de facture" met a jour le state React local, pas encore SQL Connect

### Auth actuelle

Dans `src/lib/auth.ts` :
- si Firebase est configure, login via Firebase Auth email/password ou Google
- ensuite tentative de lecture du profil applicatif via SQL Connect `GetCurrentUser`
- si aucun `User` SQL actif n'existe mais qu'une session Firebase existe, le front envoie vers `/complete-profile`; la demande est stockee dans `TeamProfileSubmission`, puis `/profile-pending` attend la conversion par un gerant dans `Equipe`
- si SQL Connect n'est pas disponible, fallback transitoire `users/{uid}` dans Firestore
- si absent, fallback vers les utilisateurs seedes de `src/data/users.ts` seulement en dev local opt-in

Donc aujourd'hui :
- **Auth Firebase est reelle**
- **SQL `User` est la cible du profil applicatif et commence a etre lu**
- **la persistence metier front ne l'est pas encore completement**

---

## 11. Firebase et fichiers de configuration

### `.firebaserc`

```json
{
  "projects": {
    "default": "sosson-sandbox",
    "prod": "sosson-prod"
  }
}
```

### `firebase.json`

Le repo configure actuellement :
- Firestore
- Storage
- Hosting
- Data Connect
- l'emulateur Data Connect

### Point important

La presence de Firestore dans le repo ne veut pas dire que Firestore devient la base metier cible.
Aujourd'hui :
- Firestore reste present pour certains usages annexes ou transitoires
- SQL Connect reste la source de verite cible pour le coeur metier

---

## 12. Regles pour les prochains agents

### A faire

- travailler d'abord sur `sosson-sandbox`
- considerer `dataconnect/schema/schema.gql` comme source de verite des types metier
- garder les changements petits et lisibles
- privilegier l'integration progressive du front vers SQL Connect
- tenir ce fichier a jour si l'etat reel change

### A ne pas faire

- ne pas relancer `firebase init dataconnect`
- ne pas editer a la main les SDKs generes
- ne pas ajouter les donnees a la main dans la console Firebase si un seed repo existe
- ne pas deployer en production tant que la sandbox n'est pas validee fonctionnellement
- ne pas remettre le projet dans une logique "demo jetable"

---

## 13. Priorites immediates

Ordre recommande pour reprendre demain :

1. Valider en sandbox les regles Firestore/Storage durcies.
2. Provisionner et verifier les profils SQL `User` sandbox lus par `GetCurrentUser`.
3. Valider en sandbox les mutations et lectures SQL Connect sensibles durcies par RBAC serveur.
4. Valider en sandbox la separation `origineImport` entre chantiers operationnels et historique previsionnel.
5. Remplacer progressivement les fallbacks locaux par des hooks SQL Connect metier.
6. Executer et valider le seed sandbox reel avec le script garde `seed:sandbox`.
7. Une fois le flux sandbox stable, preparer la suite sur production.

---

## 14. Commandes utiles

### Developpement

```bash
npm run dev
npm run lint
```

### Build

```bash
npm run build:sandbox
npm run build:prod
```

### Dashboard de deploy

```bash
npm run dashboard
```

### SQL Connect

```bash
npm run checkpoint:002:local
npm run check:operational-lifecycle-readiness
npm run check:operational-lifecycle-proof
npm run check:operational-lifecycle-decisions
npm run update:operational-lifecycle-decisions -- --file=tmp/checkpoint-002/answers.json --dry-run
npm run emulators:dataconnect
npm run checkpoint:002:emulator
npm run verify:previsionnel-edits:dataconnect
npm run verify:operational-boundary:dataconnect
npm run verify:operational-lifecycle:dataconnect
npm run verify:team-users:dataconnect
npm run verify:team-rh:dataconnect
npm run verify:chantier-status:dataconnect
npm run verify:client-update:dataconnect
npm run verify:factures:dataconnect
npm run verify:checkpoint-audit:dataconnect
npm run verify:email:dataconnect
npm run verify:documents:dataconnect
npm run verify:planning:dataconnect
npm run verify:reports:dataconnect
npm run snapshot:analytics:dataconnect
npm run reset:dataconnect:local -- --yes-local-reset
npm run seed:sandbox -- --dry-run --kind=all --output=tmp/checkpoint-002/seed-sandbox-dry-run.json
firebase deploy --only dataconnect --project sosson-sandbox
firebase dataconnect:sdk:generate
```

Notes :
- `checkpoint:002:local` ne touche pas la sandbox distante.
- `check:operational-lifecycle-readiness` verifie que la fiche metier `docs/17-operational-lifecycle-scenario.md`, la readiness, le runbook sandbox, l'audit de completion, Moteur live et `ci:sandbox` gardent le verrou metier du cycle client/prospect -> devis -> chantier -> factures.
- `check:operational-lifecycle-proof` relit `tmp/checkpoint-002/operational-lifecycle-local.json` apres `checkpoint:002:emulator` et verifie automatiquement le prospect sans chantier, le devis demande, le client operationnel, le chantier rattache, le devis signe, les factures definitives/categorisees, l'absence d'action sandbox/production et l'absence de fuite previsionnelle operationnelle.
- `check:operational-lifecycle-decisions` verifie les 9 reponses metier de `docs/17-operational-lifecycle-scenario.md`; il sert de gate manuel avant sandbox et n'est pas lance par `ci:sandbox`.
- `update:operational-lifecycle-decisions` applique localement les 9 reponses metier depuis un JSON sous `tmp/`; utiliser `--dry-run` avant modification reelle. Il ne touche ni SQL Connect ni sandbox.
- `checkpoint:002:emulator` demande l'emulateur Data Connect deja lance dans un autre terminal; il enchaine maintenant les seeds, verifications, frontiere operationnel/previsionnel, preuve statut chantier SQL, preuve edition client SQL, preuve profils/onboarding SQL, preuve RH equipe SQL, preuves email/planning/rapport SQL locales, comptage local propre, snapshot analytics SQL local, preuve edition previsionnel SQL locale, preuve factures SQL locale, preuve lifecycle client/devis/chantier/factures SQL locale, preuve documents SQL locale, RBAC local et trace SQL checkpoint/audit locale.
- `verify:previsionnel-edits:dataconnect` modifie puis restaure un montant mensuel previsionnel seed via `UpdatePrevisionnelMonthlyAmount`, puis upsert une cellule de preuve via `UpsertPrevisionnelCellEdit`; il ne touche pas la sandbox.
- `verify:operational-boundary:dataconnect` verifie en emulateur que le seed previsionnel ne remonte pas dans les listes operationnelles.
- `verify:operational-lifecycle:dataconnect` cree en emulateur un profil `User` local autorise, un prospect sans chantier, un devis demande, un client operationnel, un chantier rattache, un devis signe et des factures definitives/categorisees; il relit les listes operationnelles, verifie `origineImport: "operationnel"` et archive `tmp/checkpoint-002/operational-lifecycle-local.json`; il ne touche pas la sandbox.
- `verify:team-users:dataconnect` cree puis relit des profils `User` locaux, cree une demande `TeamProfileSubmission`, verifie l'absence de `User` avant conversion, refuse une conversion hors gerant, puis convertit la demande `pending` en `User` SQL actif via un gerant, conserve `sourceConnexion` et refuse une reconversion; il ne provisionne rien en sandbox.
- `verify:team-rh:dataconnect` cree et relit en emulateur une equipe source `SossonTeam`, une equipe finale destination, une fiche `SossonTeamMember` liee a un `User`, le deplacement de cette fiche vers l'equipe finale, un conge, une ligne d'heures, un brouillon de preparation paie, une carte planning avec `sossonTeamId` final, une `PlanningJobSheet` terminee et une ligne d'heures rattachee a cette fiche; il verifie aussi qu'une assistante ne peut pas creer d'equipe finale. Il ne touche pas la sandbox.
- `verify:chantier-status:dataconnect` modifie puis restaure le statut d'un chantier seed local via `UpdateChantierStatut`; il ne touche pas la sandbox.
- `verify:client-update:dataconnect` modifie puis restaure un client seed local via `UpdateClient`; il ne touche pas la sandbox.
- `verify:factures:dataconnect` cree une facture locale, la relit, modifie son statut via `SetFactureStatut` et la relit par statut; il ne touche pas la sandbox.
- `verify:email:dataconnect` cree puis relit un `EmailThread`, un `EmailMessage` et une `EmailAttachment` locaux; quand un chantier operationnel seed existe, il relit aussi le fil via `ListEmailThreadsByChantier`; il ne touche pas la sandbox.
- `verify:documents:dataconnect` cree puis relit un `DocumentFolder`, un document libre et un document facture local avec `storagePath`, `tailleBytes`, `sha256`, lien facture et relecture `ListDocumentsByChantier`; il ne touche pas la sandbox ni Storage.
- `verify:planning:dataconnect` cree un client, un chantier et une carte planning SQL locale, la modifie via `UpdatePlanningEventDetails`, l'annule via `CancelPlanningEvent`, puis la relit par periode et via `ListPlanningEventsByChantier`; il ne touche pas la sandbox.
- `verify:reports:dataconnect` cree un `AnalyticsSnapshot`, ecrit un payload source et un artefact CSV local sous `tmp/`, cree un `Rapport`, le marque genere avec chemin/hash reel de l'artefact, puis relit la liste et le detail; il ne touche pas la sandbox ni Storage.
- `verify:checkpoint-audit:dataconnect` ecrit puis relit les tables checkpoint/audit/import/change log dans l'emulateur uniquement.
- `snapshot:analytics:dataconnect` cree puis relit un `AnalyticsSnapshot` local et archive `tmp/checkpoint-002/analytics-snapshot-local.json`.
- `reset:dataconnect:local` supprime uniquement `dataconnect/.dataconnect/pgliteData` et sert a repartir d'une base emulateur propre; ne pas confondre avec une action sandbox.
- `seed:sandbox -- --dry-run` archive la liste des seeds sandbox sous `tmp/`; l'execution reelle exige `ALLOW_SANDBOX_DATACONNECT_SEED=true`, `--sandbox` et `--yes-sandbox`.
- `firebase deploy --only dataconnect --project sosson-sandbox` reste une action sandbox reelle a validation humaine.

### Auth / projet actif

```bash
firebase login:list
firebase use
firebase use default
firebase use prod
```

---

## 15. Design et documentation

### 15.1 Identite visuelle Sosson

L'identite est **100% unifiee** autour d'un univers unique : Orange chantier (`#F06B21`) / Anthracite (`#1E1E1E`) / Ivoire (`#FAF6F2`).
L'ancien theme vert forêt a ete **totalement abandonne** et ne doit plus apparaitre nulle part dans le code ou les assets.

Sources canoniques, a lire dans cet ordre avant toute intervention UI :

1. `identité.md` (racine) : decision directrice, corpus, ADN visuel, regles par famille d'ecran, priorites d'integration.
2. `identité visuelle/` : les 11 planches HD qui servent de reference pixel-perfect (brand boards + design system + 7 ecrans produit + 3 ecrans mobile).
3. **Skill `sosson-design-identity`** : `.agents/skills/sosson-design-identity/SKILL.md` + references.

### 15.2 La Bible Pixel-Perfect (design-tokens.md)

Le fichier **`.agents/skills/sosson-design-identity/references/design-tokens.md`** est la **source de verite absolue** pour tout ce qui est UI Sosson.

Version actuelle : **v2, 1419 lignes**, issue d'un audit microscopique des 11 images HD.

Sommaire :
- §0 Philosophie d'execution (6 regles non negociables)
- §1 Palette complete (surfaces, marque, ink, bordures, semantique, series graphiques, couleurs planning par equipe)
- §2 Typographie Inter (echelle desktop + mobile)
- §3 Rayons, espacements, grille, largeurs canoniques, breakpoints
- §4 Iconographie Lucide (stroke, tailles, set canonique)
- §5 7 composants atomiques (boutons, segmented, inputs, tags, upload, carres mobile, avatars)
- §6 16 composants moleculaires (KPI, key-value, stepper, progress, master-detail, Analyse IA, suggestion, tabs, timeline, alertes, tableau, doc card, waveform...)
- §7 8 organismes (sidebar, topbar, page header, panneau IA, mini-calendrier, grille planning, tableau, breadcrumb)
- §8 4 layouts maitres JSX complets (Dashboard, Master-Detail-IA, Fiche detail, Mobile)
- §9 10 blueprints ecran par ecran avec details pixel-perfect
- §10 Motion & interactivite
- §11 Accessibilite (WCAG AA, focus, tailles cible)
- §12 Anti-patterns (14 interdits explicites)
- §13 Checklist de validation (16 points)
- §14 Variables CSS + extension `tailwind.config.ts` prets a coller
- §15 Resume executable

Le fichier contient les **hex exacts** de chaque token, le **JSX copier-coller** pour 30+ composants, les **4 layouts gabarit** et les **10 recettes blueprint** par ecran.

### 15.3 Regles d'or UI Sosson (a ne jamais enfreindre)

- Fond `#FAF6F2` ou `#FFFFFF` uniquement (ou `#1E1E1E` pour sidebar / header mobile focus).
- Toutes les cartes en `rounded-[20px]` + `border border-[#F2E8DC]`.
- Un seul CTA orange par zone visible. Les autres en outline blanc ou anthracite.
- Jamais de couleur Tailwind generique (`blue-500`, `gray-100`, `indigo-*`, `purple-*`, `emerald-*`).
- Jamais de vert foret de l'ancienne identite, jamais de glassmorphism, jamais de degrade neon.
- Typographie **Inter** partout dans l'app (Poppins / PP Neue Montreal reserves a la marque print).
- Icones **Lucide** stroke 1.75 (1.5 sur fond sombre).
- Rayons exclusifs : `[4, 6, 10, 14, 20, 24]` px.

### 15.4 Autres references

Pour les prompts image et mockups : `.agents/skills/sosson-design-identity/references/image-direction.md`.
Pour la cartographie des pages existantes : `.agents/skills/sosson-design-identity/references/page-patterns.md`.

### 15.5 Fond produit / architecture

Pour le fond produit / architecture, voir en priorite :
- `documentation.md`
- `docs/01-vision.md`
- `docs/02-architecture.md`
- `docs/03-data-architecture.md`
- `docs/10-securite.md`

---

## 16. Definition d'un bon prochain step

Un bon prochain step Sosson doit :
- faire avancer la vraie architecture cible
- laisser la sandbox dans un etat plus propre qu'avant
- reduire l'ecart entre le front et SQL Connect
- eviter les bricolages temporaires qui devront etre jetes

---

## 17. Memo final

Au soir du 23 avril 2026, Sosson n'est plus "en train d'etre branche".
La base technique est la :
- environnement Firebase pret
- SQL Connect sandbox deploye
- schema metier en place
- connecteur en place

Le prochain travail n'est plus de debloquer l'infra.
Le prochain travail est de **commencer le vrai developpement produit** sur cette base.
