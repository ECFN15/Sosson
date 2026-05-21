# 18 - Audit front et remapping SQL Connect

> Statut: audit courant + premier nettoyage  
> Date: 2026-05-21  
> Portee: pages `src/pages`, store front, adapters `src/features/*`, schema et operations SQL Connect.

## 1. Synthese

Sosson reste dans un etat hybride. La base SQL Connect couvre deja le coeur
operationnel et plusieurs domaines transverses, mais le front garde encore des
sources locales visibles: seeds TS, donnees previsionnelles TS, `localStorage`,
serveur Outlook local, object URLs navigateur et calculs front.

Preuves lues ou lancees pendant cet audit:

- Sources canoniques: `AGENTS.md`, `documentation.md`, `docs/01-vision.md`,
  `docs/02-architecture.md`, `docs/03-data-architecture.md`,
  `docs/10-securite.md`.
- SQL: `dataconnect/schema/schema.gql`, `dataconnect/sosson/queries.gql`,
  `dataconnect/sosson/mutations.gql`.
- Front: `src/lib/store.tsx`, `src/lib/auth.ts`, tous les fichiers de
  `src/pages/`, adapters `src/features/*`.
- Audit statique:
  `npm run audit:frontend-sources -- --output=tmp/mission-sql-connect/frontend-sources-current.json`.
- Build initial:
  `npm run build:sandbox` echouait sur la branche de travail avant nettoyage.
- Build courant apres nettoyage:
  `npm run build:sandbox` passe.

Resultats importants:

- 0 import direct `@dataconnect/generated` dans `src/pages`.
- 54 imports directs de `@/data/*` dans pages/lib/features, majoritairement
  types, labels ou fallbacks encore visibles.
- 24 usages `localStorage`, dont auth session, equipe/RBAC local, planning,
  previsionnel, documents et callback Outlook.
- Firestore reste limite a `src/lib/auth.ts` pour le fallback profil
  `users/{uid}`.
- Le module COWORK (`src/pages/CoworkPage.tsx` +
  `src/features/cowork/coworkRealtime.ts`) reste hors workflows SQL
  prioritaires; sa branche Firestore front a ete neutralisee pour rester en
  fallback local explicite tant qu'aucun modele SQL Connect Cowork dedie n'est
  defini.
- L'audit initial a releve que `src/App.tsx` importait
  `ProfilePendingPage` sans fichier correspondant. Etat courant:
  `src/pages/ProfilePendingPage.tsx` existe.
- L'audit initial a releve que `src/pages/LoginPage.tsx` importait `Chrome`
  depuis `lucide-react`, icone absente de la version installee. Etat courant:
  la page utilise une icone Lucide disponible.

## 2. Cartographie SQL courante

| Workflow | Entites SQL | Queries existantes | Mutations existantes | Manques SQL / produit | Front concerne | Fallbacks a retirer a terme | Tests / checks |
|---|---|---|---|---|---|---|---|
| Auth / profil applicatif | `User`, `TeamProfileSubmission` | `GetCurrentUser`, `ListUsers`, `GetCurrentTeamProfileSubmission`, `ListTeamProfileSubmissions` | `SubmitCurrentTeamProfile`, `ConvertTeamProfileSubmission` | page pending ajoutee, preuve locale onboarding ajoutee, sandbox non prouvee | `LoginPage`, `ProfileCompletionPage`, `ProfilePendingPage`, `EquipePage`, `App.tsx`, `AppLayout.tsx`, `auth.ts` | Firestore `users/{uid}`, users TS dev opt-in | `check:auth-safety`, `check:dataconnect-auth`, `verify:team-users:dataconnect`, `build:sandbox` |
| Clients | `Client`, `ClientAlias`, `PrevisionnelLine` | `ListOperationalClients`, `GetClient`, `SearchClientAliases` | `CreateClient`, `UpdateClient` | merge/dedoublonnage, soft delete, alias operationnels | `ClientsPage`, `ClientDetailPage`, store | client local `local-client-*`, previsionnel TS comme source active | `verify:client-update:dataconnect`, `check:ui-capabilities` |
| Chantiers | `Chantier`, `Facture`, `PlanningEvent`, `DocumentAttache`, `EmailThread` | `ListOperationalChantiers`, `GetChantier`, `ListPlanningEventsByChantier`, `ListDocumentsByChantier`, `ListEmailThreadsByChantier` | `CreateChantier`, `UpdateChantierStatut` | update complet chantier, historique statut, vrais agregats serveur | `ChantiersPage`, `ChantierDetailPage` | chantiers `prev-*` et `local-chantier-*` dans workflows actifs | `verify:chantier-status:dataconnect`, `verify:operational-boundary:dataconnect`, `verify:email:dataconnect`, `verify:documents:dataconnect`, `verify:planning:dataconnect` |
| Devis | `Devis` | `ListDevis`, `ListDevisByClient`, `ListDevisByChantier` | `CreateDevis`, `UpdateDevisStatut` | page ou bloc devis dedie, liaison client -> devis -> chantier plus visible | store, details client/chantier a enrichir | aucun vrai UI local dedie a nettoyer encore | `verify:operational-lifecycle:dataconnect` |
| Factures | `Facture`, `DocumentAttache` | `ListFactures`, `ListFacturesByStatut` | `CreateFacture`, `SetFactureStatut`, `CreateDocumentAttache` | Storage facture reel, statut/historique, pieces jointes obligatoires selon workflow | `FacturesPage`, store, detail chantier | fichier navigateur / metadata pending non Storage | `verify:factures:dataconnect`, `check:document-storage` |
| Documents | `DocumentFolder`, `DocumentAttache` | `ListDocumentFolders`, `ListDocumentsAttaches`, `ListDocumentsByChantier` | `CreateDocumentFolder`, `CreateDocumentAttache`, `UpdateDocumentAttacheLinks` | upload Storage V4, signed URLs, suppression/archive, query par client/facture/devis | `DocumentsPage`, `ChantierDetailPage`, `FacturesPage` | dossiers localStorage, object URLs, chemins pending | `verify:documents:dataconnect`, `test:documents` |
| Emails | `EmailThread`, `EmailMessage`, `EmailAttachment`, `DocumentAttache` | `ListEmailThreads`, `ListEmailThreadsByChantier`, `ListUnreadEmailThreads`, `GetEmailThread` | `CreateEmailThread`, `UpdateEmailThreadStatusAndLinks`, `CreateEmailMessage`, `CreateEmailAttachment` | backend Graph durable, detail SQL complet, attachments -> Storage/documents, rattachement par client et pieces jointes Storage | `EmailsPage`, `ChantierDetailPage` | seed emails, serveur `localhost:8787`, ids `client-1`/`chantier-1` par defaut | `verify:email:dataconnect` |
| Planning | `PlanningEvent`, `PlanningAssignment`, `PlanningJobSheet`, `SossonTeam`, `SossonTeamMember`, `SossonWorkTimeEntry`, `Chantier` | `ListPlanningEventsByPeriod`, `ListPlanningEventsByChantier`, `ListPlanningJobSheetsByEvent`, `ListSossonTeams` | `CreatePlanningEvent`, `UpdatePlanningEventDetails`, `CancelPlanningEvent`, `CreatePlanningAssignment`, `UpdatePlanningAssignmentStatus`, `CreatePlanningJobSheet`, `UpdatePlanningJobSheetProgress`, `CompletePlanningJobSheet`, `CreateSossonWorkTimeEntry` | conflits, recurrence, historique deplacement, disponibilites equipe, sandbox non prouvee | `PlanningPage`, `ChantierDetailPage`, `EquipePage` | localStorage planning hors source SQL; templates equipes locales uniquement fallback visible | `verify:planning:dataconnect`, `verify:team-rh:dataconnect` |
| COWORK terrain | Aucun modele SQL dedie stable; cible future autour de `SossonTeam`, `SossonTeamMember`, `PlanningEvent`, `DocumentAttache`, `Rapport` | aucune query SQL directe | aucune mutation SQL directe | cadrage produit, modele SQL dedie, rattachement documents/rapports/heures, offline mobile | `CoworkPage`, `src/features/cowork/*` | chat, demandes, brouillons, pieces jointes locales; API gasoil externe fallback | `check:firestore-boundary`, `check:document-storage`, `ci:sandbox` |
| Previsionnel | `PrevisionnelImportBatch`, `PrevisionnelExercise`, `PrevisionnelLine`, `PrevisionnelMonthlyAmount`, `PrevisionnelLotAmount`, `PrevisionnelCellEdit` | `ListPrevisionnelExercises`, `ListPrevisionnelLinesByExercise`, `ListPrevisionnelCellEdits` | `UpdatePrevisionnelMonthlyAmount`, `UpdatePrevisionnelLineAmounts`, `UpsertPrevisionnelCellEdit`, `LinkPrevisionnelLineToChantier` | auteur/version d'edition, liens chantier operationnel, workflow de validation | `PrevisionnelPage`, `PrevisionnelSpreadsheetPage`, Dashboard, Statistiques | TS Excel local comme verite, localStorage edits | `verify:previsionnel-edits:dataconnect`, `test:previsionnel` |
| Analytics / rapports | `AnalyticsSnapshot`, `Rapport` | `ListAnalyticsSnapshots`, `GetAnalyticsSnapshot`, `ListRapports`, `GetRapport` | `CreateAnalyticsSnapshot`, `CreateRapport`, `MarkRapportGenerated` | job serveur, PDF/XLSX, Storage, sourceWatermark durable | `DashboardPage`, `StatistiquesPage`, `RapportsPage` | rapports locaux et calculs front non snapshot | `snapshot:analytics:dataconnect`, `verify:reports:dataconnect` |
| Equipe / droits | `User`, `TeamProfileSubmission`, `SossonTeam`, `SossonTeamMember`, `SossonTeamLeavePeriod`, `SossonWorkTimeEntry`, `SossonPayrollPeriod` | `ListUsers`, `ListTeamProfileSubmissions`, `ListSossonTeams`, `ListSossonWorkTimeEntries`, `ListSossonPayrollPeriods` | `ConvertTeamProfileSubmission`, `CreateSossonTeam`, `CreateSossonTeamMember`, `UpdateSossonTeamMember`, `CreateSossonTeamLeavePeriod`, `CreateSossonWorkTimeEntry`, `CreateSossonPayrollPeriod` | droits applicatifs encore localStorage, suppression/archivage RH SQL, audit role | `EquipePage`, `EquipeProfilePage` | `accessMatrix` localStorage; `teamDirectory` uniquement fallback visible | `verify:team-users:dataconnect`, `verify:team-rh:dataconnect`, `test:access-control` |
| Audit / checkpoints | `AuditEvent`, `CheckpointRun`, `CheckpointStep`, `CheckpointArtifact`, `CheckpointDecision`, `DataImportRun`, `DataImportIssue`, `EntityChangeLog` | listes et details audit/checkpoint/import | mutations append-only de creation | branchement UI/EngineRoom incomplet, immutabilite sandbox a verifier | `SossonEngineRoomPage`, docs, scripts | fichiers tmp seuls comme preuve non indexee | `verify:checkpoint-audit:dataconnect`, `checkpoint:002:emulator` |

## 3. Fiches pages

### `src/pages/DashboardPage.tsx`

- Role metier: pilotage quotidien, KPIs chantiers/factures/previsionnel et etat snapshot.
- Donnees lues: `useOperationalData`, `loadLatestPrevisionnelFromSql`, `loadAnalyticsSnapshotsFromSql`, fallback previsionnel TS.
- Donnees ecrites: aucune.
- Source actuelle: mix `dataconnect` operationnel si store SQL charge, previsionnel SQL si disponible, sinon Excel/TS.
- Operations SQL: `ListOperational*` via store, `ListPrevisionnelExercises`, `ListPrevisionnelLinesByExercise`, `ListAnalyticsSnapshots`.
- Fallbacks: calcul front, previsionnel local, source label explicite.
- Risques: KPIs calcules front peuvent ressembler a un snapshot certifie; analytics snapshot est non bloquant.
- Supprimer: aucune suppression immediate; garder les badges source.
- Migrer: agregats dashboard vers query/snapshot partage.
- Conserver: lecture non bloquante snapshot.
- Verification: `build:sandbox`, `snapshot:analytics:dataconnect`.

### `src/pages/ChantiersPage.tsx`

- Role metier: liste et creation de chantiers operationnels.
- Donnees lues: `useOperationalData`, clients, chantiers, lignes previsionnelles TS pour enrichissement.
- Donnees ecrites: `CreateChantier` si source SQL active, sinon ajout store local visible.
- Source actuelle: SQL operationnel ou fallback Excel/seed.
- Operations SQL: `ListOperationalChantiers`, `ListOperationalClients`, `CreateChantier`.
- Fallbacks: `local-chantier-*`, previsionnel TS.
- Risques: melange indicateurs previsionnels et chantiers operationnels; fallback local ne doit jamais prouver sandbox.
- Supprimer: creation locale silencieuse deja evitee; retirer plus tard la creation locale metier.
- Migrer: filtre et badges pour distinguer operationnel/previsionnel.
- Conserver: garde `canWriteSql`.
- Verification: `verify:operational-boundary:dataconnect`, `check:ui-capabilities`.

### `src/pages/ChantierDetailPage.tsx`

- Role metier: fiche chantier unifiee.
- Donnees lues: chantier/factures via `useOperationalData`, documents SQL, emails SQL, planning SQL par chantier, previsionnel TS.
- Donnees ecrites: statut via `UpdateChantierStatut` ou fallback local annonce.
- Source actuelle: SQL operationnel si id compatible + modules SQL; sinon fallback visible.
- Operations SQL: `UpdateChantierStatut`, `ListDocumentsByChantier`, `ListEmailThreadsByChantier`, `ListPlanningEventsByChantier`.
- Fallbacks: previsionnel TS, modules vides si SQL indisponible, statut local hors SQL.
- Risques: les blocs documents/emails/planning sont maintenant lus par chantier, mais restent non bloquants; pas de vrais rapports par chantier.
- Supprimer: blocs statiques residuels si une query SQL les couvre.
- Migrer: ajouter rapports et aggregats chantier dedies; rattacher les pieces jointes email aux documents/Storage.
- Conserver: refus de fallback local silencieux sur echec SQL.
- Verification: `verify:chantier-status:dataconnect`, `verify:documents:dataconnect`, `verify:planning:dataconnect`.

### `src/pages/ClientsPage.tsx`

- Role metier: annuaire clients/prospects et creation client.
- Donnees lues: `useOperationalData`, previsionnel TS.
- Donnees ecrites: `CreateClient` si source SQL active, sinon ajout store local visible.
- Source actuelle: SQL operationnel ou fallback Excel/seed.
- Operations SQL: `ListOperationalClients`, `CreateClient`.
- Fallbacks: `local-client-*`, stats Excel par nom normalise.
- Risques: doublons client vivant / client previsionnel; stats Excel peuvent sembler persistantes.
- Supprimer: creation locale metier quand offline/brouillon n'est pas explicitement demande.
- Migrer: rapprochement `ClientAlias` dans UI.
- Conserver: labels de source et garde permission.
- Verification: `verify:client-update:dataconnect`, `check:ui-capabilities`.

### `src/pages/ClientDetailPage.tsx`

- Role metier: fiche client, chantiers lies, synthese financiere et edition.
- Donnees lues: `useOperationalData`, lignes previsionnelles TS rattachees par id local.
- Donnees ecrites: `UpdateClient` si source SQL active, sinon fallback local annonce.
- Source actuelle: SQL operationnel ou fallback visible.
- Operations SQL: `UpdateClient`; lecture via store `ListOperationalClients`.
- Fallbacks: previsionnel TS, edition locale si source non SQL.
- Risques: la fiche ne lit pas encore `GetClient`; les devis SQL lies au client ne sont pas consommes directement.
- Supprimer: dependance aux id `prev-*` dans une fiche operationnelle.
- Migrer: `GetClient` + `ListDevisByClient` + `ListPrevisionnelLinesByClient`.
- Conserver: refus de fallback silencieux en cas d'echec SQL.
- Verification: `verify:client-update:dataconnect`.

### `src/pages/FacturesPage.tsx`

- Role metier: saisie, classement et suivi de factures fournisseurs.
- Donnees lues: `useOperationalData`, clients/chantiers/factures.
- Donnees ecrites: `CreateFacture`, `SetFactureStatut`, metadata document via `CreateDocumentAttache`.
- Source actuelle: SQL si operationnel Data Connect, sinon fallback local visible.
- Operations SQL: `ListFactures`, `CreateFacture`, `SetFactureStatut`, `CreateDocumentAttache`.
- Fallbacks: fichiers selectionnes en memoire, facture locale, chemin `pending-documents`.
- Risques: fichier non stocke durablement dans Storage; facture peut etre creee SQL meme si metadata document echoue.
- Supprimer: impression d'upload fichier durable hors Storage.
- Migrer: URL signee Storage puis metadata SQL definitive.
- Conserver: hash SHA-256 metadata et messages explicites.
- Verification: `verify:factures:dataconnect`, `check:document-storage`.

### `src/pages/DocumentsPage.tsx`

- Role metier: gestionnaire documentaire et classement.
- Donnees lues: `loadDocumentsSqlData`, chantiers/clients store, dossiers localStorage.
- Donnees ecrites: `CreateDocumentFolder`, `CreateDocumentAttache`, `UpdateDocumentAttacheLinks`, dossiers localStorage fallback.
- Source actuelle: metadata SQL partielle + uploads en memoire/local.
- Operations SQL: `ListDocumentFolders`, `ListDocumentsAttaches`, `CreateDocumentFolder`, `CreateDocumentAttache`, `UpdateDocumentAttacheLinks`.
- Fallbacks: `sosson.documentFolders.v1`, object URLs navigateur, chemin pending.
- Risques: fichier non present dans Storage; classement local de documents non SQL possible.
- Supprimer: dossiers localStorage des workflows durables.
- Migrer: upload Storage V4, signed read URL, query par entite.
- Conserver: validation taille/type/hash.
- Verification: `test:documents`, `verify:documents:dataconnect`.

### `src/pages/EmailsPage.tsx`

- Role metier: boite Outlook/Graph de developpement et index metier emails.
- Donnees lues: `EmailThread` SQL, seed emails, serveur local Outlook `localhost:8787`.
- Donnees ecrites: creation thread/message SQL, update statut/liens SQL, envoi Graph via serveur local si connecte.
- Source actuelle: `sql`, `sql-empty`, `seed-fallback`, `outlook`, `outlook-disconnected`, `outlook-error`.
- Operations SQL: `ListEmailThreads`, `CreateEmailThread`, `CreateEmailMessage`, `UpdateEmailThreadStatusAndLinks`.
- Fallbacks: seed emails, simulation locale, ids `chantier-1` / `client-1`, localStorage retour OAuth.
- Risques: Graph local n'est pas backend durable; brouillons/envois peuvent etre locaux si index SQL echoue; attachments non crees depuis UI.
- Supprimer: seeds comme experience principale quand SQL/Graph backend existe.
- Migrer: backend Graph securise + attachments Storage + detail SQL.
- Conserver: source visible et non-masquage echec SQL.
- Verification: `verify:email:dataconnect`.

### `src/pages/PlanningPage.tsx`

- Role metier: planning chantier semaine, creation/deplacement/annulation.
- Donnees lues: `PlanningEvent` SQL par periode, equipes finales `SossonTeam`, chantiers store, planning localStorage hors source SQL.
- Donnees ecrites: `CreatePlanningEvent`, `CreatePlanningAssignment`, `UpdatePlanningEventDetails`, `CancelPlanningEvent`, fiche intervention SQL, heures chantier SQL.
- Source actuelle: SQL si store operationnel SQL et equipes finales SQL disponibles; sinon localStorage fallback visible.
- Operations SQL: `ListPlanningEventsByPeriod`, `ListSossonTeams`, `CreatePlanningEvent`, `CreatePlanningAssignment`, `UpdatePlanningEventDetails`, `CancelPlanningEvent`, `CreatePlanningJobSheet`, `UpdatePlanningJobSheetProgress`, `CompletePlanningJobSheet`, `CreateSossonWorkTimeEntry`.
- Fallbacks: `sosson.planning.v1` et templates equipes locales uniquement quand la page est en fallback; en mode SQL vide, creation/deplacement bloques avec message explicite.
- Risques: pas de conflit/disponibilite, recurrence ni historique dedie; sandbox distante non prouvee.
- Supprimer: cartes locales comme source metier durable.
- Migrer: detection conflits, disponibilites, historique deplacement et seed/provisionnement equipes sandbox.
- Conserver: annulation soft sans suppression physique, absence de fallback local silencieux en source SQL.
- Verification: `verify:planning:dataconnect`, `verify:team-rh:dataconnect`.

### `src/pages/CoworkPage.tsx`

- Role metier: app terrain provisoire pour messages equipe, note de rapport, pieces jointes locales, demandes live et aide gasoil.
- Donnees lues: chantiers et utilisateur via store, equipes/membres/conges locaux `teamDirectory`, planning local `sosson.planning.items.v1`, messages/demandes/brouillons COWORK localStorage, provider gasoil externe avec fallback.
- Donnees ecrites: messages COWORK locaux, demandes COWORK locales, brouillons de rapport locaux, pieces jointes en preview locale avec hash.
- Source actuelle: fallback local explicite; aucun workflow SQL Connect dedie.
- Operations SQL: aucune.
- Fallbacks: `sosson.cowork.messages.v1`, `sosson.cowork.leaveRequests.v1`, `sosson.cowork.reportDrafts.v1`, planning local, provider gasoil local si API indisponible.
- Risques: peut ressembler a un outil terrain persistant alors que chat/demandes/brouillons ne prouvent rien en SQL; pieces jointes locales ne sont pas des `DocumentAttache` ni des fichiers Storage.
- Supprimer: toute promesse Firestore/front ou `storagePath` pending hors flux Documents controle.
- Migrer: cadrer le modele SQL COWORK ou rattacher aux tables existantes (`PlanningJobSheet`, `SossonWorkTimeEntry`, `DocumentAttache`, `Rapport`) avant toute persistance durable.
- Conserver: libelles fallback local et absence de metadata Storage durable hors Documents.
- Verification: `check:firestore-boundary`, `check:document-storage`, `ci:sandbox`.

### `src/pages/PrevisionnelPage.tsx`

- Role metier: vue resumee du tableur previsionnel.
- Donnees lues: SQL previsionnel par sheet via `loadPrevisionnelSheetFromSql`, `currentPrevisionnelSheet` TS comme template, edits localStorage.
- Donnees ecrites: aucune directe; navigation vers tableur.
- Source actuelle: SQL Connect si Data Connect et auth Firebase repondent, sinon fallback local visible.
- Operations SQL: `ListPrevisionnelExercises`, `ListPrevisionnelLinesByExercise`, `ListPrevisionnelCellEdits`.
- Fallbacks: `sosson.previsionnel.currentSheet.edits.v1`.
- Risques: la synthese reste calculee front depuis les refs Excel; un fallback local ne prouve pas la sandbox distante.
- Supprimer: localStorage comme source durable apres validation SQL.
- Migrer: exposer les versions/auteurs d'edition et relier les lignes previsionnelles aux chantiers operationnels.
- Conserver: avertissement jaune = facture envoyee.
- Verification: `test:previsionnel`, `build:sandbox`, `verify:previsionnel-edits:dataconnect`.

### `src/pages/PrevisionnelSpreadsheetPage.tsx`

- Role metier: edition tableur previsionnel et sauvegarde cellule/montants.
- Donnees lues: SQL previsionnel par sheet, `PrevisionnelCellEdit`, template TS, localStorage.
- Donnees ecrites: `UpdatePrevisionnelMonthlyAmount`, `UpdatePrevisionnelLineAmounts`, `UpsertPrevisionnelCellEdit`, localStorage.
- Source actuelle: SQL si disponible, fallback navigateur explicite.
- Operations SQL: `ListPrevisionnelExercises`, `ListPrevisionnelLinesByExercise`, `ListPrevisionnelCellEdits`, mutations previsionnel.
- Fallbacks: `localStorage` edits et checkpoints navigateur.
- Risques: `CellEdit` non append-only, pas d'auteur/version; certaines cellules hors modele SQL restent seulement override.
- Supprimer: localStorage comme source durable apres validation SQL.
- Migrer: versioning/audit edits, liaison `LinkPrevisionnelLineToChantier`.
- Conserver: sauvegarde cellule exacte pour export Excel.
- Verification: `verify:previsionnel-edits:dataconnect`, `test:previsionnel`.

### `src/pages/StatistiquesPage.tsx`

- Role metier: analytics historique et previsionnel.
- Donnees lues: previsionnel SQL, snapshots analytics SQL, fallback TS, `useOperationalData`.
- Donnees ecrites: aucune.
- Source actuelle: SQL calcul front ou donnees locales.
- Operations SQL: `ListAnalyticsSnapshots`, `ListPrevisionnelExercises`, `ListPrevisionnelLinesByExercise`.
- Fallbacks: `cleanPrevisionnelExercises`, `operationalPrevisionnelLines`.
- Risques: analytics front non reproductibles si pas de snapshot; clients top portfolios restent local TS.
- Supprimer: claims de certitude sans snapshot.
- Migrer: snapshots server-side et payload hash exploite.
- Conserver: detail source operationnelle separe.
- Verification: `snapshot:analytics:dataconnect`.

### `src/pages/RapportsPage.tsx`

- Role metier: index et brouillons de rapports.
- Donnees lues: index `Rapport` SQL, detail `GetRapport` a la selection, `AnalyticsSnapshot` SQL, fallback local.
- Donnees ecrites: `CreateRapport`; `MarkRapportGenerated` existe adapter mais pas utilise par la page.
- Source actuelle: SQL si disponible, sinon local fallback.
- Operations SQL: `ListRapports`, `GetRapport`, `ListAnalyticsSnapshots`, `CreateRapport`.
- Fallbacks: `localReports` en memoire.
- Risques: aucun vrai export PDF/XLSX/Storage depuis la page; snapshot optionnel.
- Supprimer: rapport local durable.
- Migrer: generation asynchrone + `MarkRapportGenerated` + Storage/PDF/XLSX + hash.
- Conserver: metadata SQL `preparing`.
- Verification: `verify:reports:dataconnect`.

### `src/pages/EquipePage.tsx`

- Role metier: reception onboarding, conversion en `User` SQL, gestion equipes finales, fiches membres, conges, heures, preparation paie et droits UX.
- Donnees lues: `ListUsers`, `ListTeamProfileSubmissions`, `ListSossonTeams`; fallback local uniquement si SQL indisponible.
- Donnees ecrites: `ConvertTeamProfileSubmission`, `CreateSossonTeam`, `CreateSossonTeamMember`, `CreateSossonTeamLeavePeriod`, `CreateSossonWorkTimeEntry`, `CreateSossonPayrollPeriod`; matrice de droits encore localStorage.
- Source actuelle: SQL RH quand Data Connect repond; fallback `teamDirectory` visible si SQL absent; `accessMatrix` reste locale.
- Operations SQL: `ListUsers`, `ListTeamProfileSubmissions`, `ListSossonTeams`, mutations RH ci-dessus.
- Fallbacks: `sosson.teamDirectory.v1`, `sosson.teamMembers.v1`, `sosson.teamLeaves.v1` uniquement hors source SQL; `sosson.accessMatrix.v1` reste localStorage.
- Risques: droits applicatifs locaux ne prouvent pas le RBAC serveur; suppression equipe/membre encore locale; sandbox distante non prouvee.
- Supprimer: droits localStorage comme configuration metier durable.
- Migrer: droits applicatifs/audit role, suppression/archive RH SQL, validation sandbox.
- Conserver: la demande onboarding ne donne pas de droits; la conversion exige une equipe finale SQL.
- Verification: `verify:team-users:dataconnect`, `verify:team-rh:dataconnect`, `test:access-control`.

### `src/pages/EquipeProfilePage.tsx`

- Etat courant: route `/equipe/profils/:memberId` active dans `App.tsx`.
- Role metier: fiche RH detaillee d'un membre equipe.
- Donnees lues: repertoire RH via `ListSossonTeams`, heures via `ListSossonWorkTimeEntries`, paie via `ListSossonPayrollPeriods`; fallback local si SQL indisponible.
- Donnees ecrites: `UpdateSossonTeamMember`, `CreateSossonTeamLeavePeriod`, `CreateSossonWorkTimeEntry`, `CreateSossonPayrollPeriod`; conges locaux seulement pour fiche locale.
- Source actuelle: SQL si le membre est un UUID Data Connect; local visible sinon.
- Operations SQL: `UpdateSossonTeamMember`, `CreateSossonTeamLeavePeriod`, `CreateSossonWorkTimeEntry`, `CreateSossonPayrollPeriod`, `ListSossonWorkTimeEntries`, `ListSossonPayrollPeriods`.
- Fallbacks: `teamDirectory` local pour anciennes fiches non SQL.
- Risques: suppression de conges locale non synchronisee SQL; pas encore de detail par chantier/assignment dans les heures depuis cette fiche.
- Supprimer: persistence RH locale durable une fois les equipes sandbox seed/provisionnees.
- Migrer: suppression/archive SQL, rattachement heures aux chantiers/planning depuis l'UI.
- Verification: `verify:team-rh:dataconnect`, `test:access-control`, `build:sandbox`.

### `src/pages/ProfileCompletionPage.tsx`

- Role metier: premiere connexion Firebase sans profil applicatif.
- Donnees lues: `firebaseUser`, etat auth store.
- Donnees ecrites: `SubmitCurrentTeamProfile`.
- Source actuelle: Firebase Auth + SQL Connect submission.
- Operations SQL: `GetCurrentTeamProfileSubmission`, `SubmitCurrentTeamProfile`.
- Fallbacks: aucun fallback metier; redirection login si session absente.
- Risques: email read-only depuis Firebase; le flux pending depend maintenant de
  la lecture SQL de `TeamProfileSubmission`.
- Supprimer: aucun.
- Migrer: tests auth UI et copy explicite "pas de droit".
- Conserver: submission bornee a `auth.uid`.
- Verification: `check:auth-safety`, `check:dataconnect-auth`, `build:sandbox`.

### `src/pages/LoginPage.tsx`

- Role metier: connexion Firebase email/password, Google, fallback dev local opt-in.
- Donnees lues: users TS dev, image locale, `auth.ts`.
- Donnees ecrites: session auth localStorage via `auth.ts`.
- Source actuelle: Firebase Auth si configure, users TS seulement dev opt-in.
- Operations SQL: indirectes via `GetCurrentUser` / `GetCurrentTeamProfileSubmission` apres login.
- Fallbacks: users TS `demo` seulement si `VITE_ENABLE_LOCAL_AUTH_FALLBACK=true`.
- Risques: boutons doivent gerer missing/pending profile; la rupture build
  initiale liee a l'icone `Chrome` est corrigee.
- Supprimer: aucune donnee prod; garder le dev fallback masque.
- Migrer: remplacer icone non exportee, verifier flux Google.
- Verification: `check:auth-safety`, `build:sandbox`.

### `src/pages/MicrosoftCallbackPage.tsx`

- Role metier: retour OAuth du serveur Outlook local.
- Donnees lues/ecrites: `sosson.outlook.returnTo` dans localStorage.
- Source actuelle: locale navigateur.
- Operations SQL: aucune.
- Fallbacks: retour `/emails`.
- Risques: seulement dev Outlook; pas de token stocke front dans ce fichier.
- Supprimer: a remplacer par callback backend produit.
- Migrer: backend Graph securise.
- Verification: `check:front-secrets`.

### `src/pages/SossonEngineRoomPage.tsx`

- Role metier: moteur live / cartographie technique visible.
- Donnees lues: `operationalDataState`, probe SQL documents/previsionnel.
- Donnees ecrites: aucune.
- Source actuelle: store + lectures SQL probe.
- Operations SQL: `ListDocumentsAttaches`, `ListPrevisionnelExercises`, operations listees comme metadata documentaire.
- Fallbacks: pas de lecture sandbox distante; probe local/session.
- Risques: peut donner l'impression de validation SQL globale alors que seules deux familles sont probees directement.
- Supprimer: aucune.
- Migrer: brancher audit/checkpoints SQL reels.
- Verification: `checkpoint:002:local`, `verify:checkpoint-audit:dataconnect`.

### `src/pages/SossonDocsPage.tsx`

- Role metier: documentation produit dans l'app.
- Donnees lues/ecrites: contenu hardcode React.
- Source actuelle: hardcode documentaire.
- Operations SQL: aucune.
- Fallbacks: non applicable.
- Risques: derive documentaire avec l'etat reel si non mise a jour.
- Supprimer: textes obsoletes quand contradictoires.
- Migrer: relier aux docs markdown ou generation.
- Verification: `check:doc-entrypoints`, `check:doc-links`.

### `src/pages/PlaceholderPage.tsx`

- Role metier: page temporaire pour Parametres.
- Donnees lues: image locale.
- Donnees ecrites: aucune.
- Source actuelle: hardcode visuel.
- Operations SQL: aucune.
- Fallbacks: non applicable.
- Risques: parametres reels absents; ne doit pas masquer la non-implementation.
- Supprimer: remplacer des que Parametres existe.
- Migrer: preferences/auth/securite selon besoins.
- Verification: build.

### `src/pages/ProfilePendingPage.tsx`

- Etat initial audite: fichier absent alors que `src/App.tsx` l'importait et
  route `/profile-pending` y pointait.
- Etat courant: page ajoutee sans modifier les SDK generes.
- Role metier: informer qu'une demande `TeamProfileSubmission` existe et que le
  gerant doit la convertir.
- Donnees lues: etat auth store, `GetCurrentTeamProfileSubmission` via adapter
  `fetchCurrentTeamProfileSubmission`.
- Donnees ecrites: aucune, hors deconnexion utilisateur.
- Source actuelle: Firebase Auth + SQL Connect submission.
- Operations SQL: `GetCurrentTeamProfileSubmission`.
- Fallbacks: aucun fallback metier; message d'attente si la demande n'est pas
  encore relue.
- Risque: depend du provisionnement effectif de `TeamProfileSubmission` en
  sandbox.
- Supprimer: aucun.
- Migrer: ajouter une preuve Data Connect dediee au flux
  `SubmitCurrentTeamProfile` -> pending -> conversion.
- Conserver: aucun droit applicatif accorde tant que la demande n'est pas
  convertie.
- Verification: `build:sandbox`, `check:auth-safety`,
  `check:dataconnect-auth`.

## 4. Nettoyages immediats autorises par l'audit

Nettoyages realises:

1. Corriger la rupture build auth/onboarding:
   - remplacer l'icone `Chrome` non exportee;
   - ajouter `ProfilePendingPage`;
   - verifier les imports inutilises de `EquipePage`.
2. Ne pas toucher aux SDK generes manuellement: respecte.
3. Ne pas deployer sandbox ni production: respecte.
4. Verifications lancees apres correction:
   - `npm run build:sandbox`;
   - `npm run lint`;
   - `npm run check:page-dataconnect-imports`;
   - `npm run check:auth-safety`;
   - `npm run check:dataconnect-auth`;
   - `npm run verify:team-users:dataconnect -- --output=tmp/mission-sql-connect/team-users-local.json`.
5. Verifications locales ajoutees pour le detail chantier:
   - `npm run verify:email:dataconnect -- --output=tmp/mission-sql-connect/email-chantier-local.json`;
   - `npm run verify:documents:dataconnect -- --output=tmp/mission-sql-connect/documents-chantier-local.json`;
   - `npm run verify:planning:dataconnect -- --output=tmp/mission-sql-connect/planning-chantier-local.json`.

## 5. Prochain remapping produit

Priorite recommandee apres retour build:

1. Valider en sandbox, avec vrais UID Firebase, le flux auth localement prouve: `missing-profile -> SubmitCurrentTeamProfile -> profile-pending -> ConvertTeamProfileSubmission -> User SQL`.
2. Porter en sandbox, avec donnees reelles, les preuves locales maintenant disponibles pour `ChantierDetailPage` (`ListEmailThreadsByChantier`, `ListDocumentsByChantier`, `ListPlanningEventsByChantier`) sans masquer les blocs vides.
3. Retirer les localStorage RH/planning des workflows durables apres ajout du modele SQL equipe/conges/droits.
4. Ajouter les versions/auteurs d'edition previsionnelle et les liens explicites vers les chantiers operationnels.
