# 16 - Audit SQL reel et architecture cible

> Statut: audit et recommandation  
> Derniere revision: 2026-05-17  
> Portee: schema SQL reel, front hybride, cible SQL durable, checkpoints et migration checkpoint 002.

## Verdict court

Sosson a maintenant une base technique serieuse, mais le site n'est pas encore une application metier entierement pilotee par SQL.

Mise a jour de demarrage du chantier, 2026-05-17: deux tranches locales non deployees sont maintenant preparees dans le repo.

- Priorite 1: socle SQL de tracabilite `AuditEvent`, `CheckpointRun`, `CheckpointStep`, `CheckpointArtifact`, `CheckpointDecision`, `DataImportRun`, `DataImportIssue` et `EntityChangeLog`, avec queries/mutations append-only, SDKs regeneres officiellement, adapter `src/features/audit/auditSql.ts` et verification emulateur prouvee.
- Priorite 2: socle SQL email/planning/rapports/analytics avec `EmailThread`, `EmailMessage`, `EmailAttachment`, `PlanningEvent`, `PlanningAssignment`, `AnalyticsSnapshot`, `Rapport`, operations Data Connect et adapters `src/features/email`, `src/features/planning`, `src/features/reports`, `src/features/analytics`; un fil email, une carte planning modifiee puis annulee, un rapport avec artefact CSV local hashe et un `AnalyticsSnapshot` sont maintenant crees et relus en emulateur local par le checkpoint.

Rien n'a ete deploye en sandbox distante.

Etat a ne pas confondre:

| Niveau | Etat reel |
|---|---|
| Prepare dans le repo | Oui: schema Data Connect, operations, seed operationnel, seed previsionnel, scripts de controle, dry-runs. |
| Valide localement | Partiel mais solide: build, tests, gardes statiques, preflight checkpoint 002 local OK, checkpoint 002 emulateur OK avec comptage, frontiere operationnel/previsionnel, snapshot analytics et trace checkpoint/audit SQL. |
| Valide en sandbox distante | Non prouve par cet audit: seed reel, comptage reel, profils SQL User, RBAC et rules sandbox demandent validation humaine. |
| Valide production | Non. Production exclue. |

Frontiere cible:

- SQL Connect / Cloud SQL = verite metier.
- Firebase Storage = fichiers binaires et artefacts lourds.
- Outlook / Microsoft Graph = source externe email.
- Excel = source d'import initiale et historique previsionnel.
- Front React = affichage, saisie et cache temporaire, jamais source de verite.
- Checkpoints = audit append-only; SQL indexe l'etat, les decisions et les preuves, Storage/fichiers gardent les gros logs.

Note de cadrage: Sosson reste un outil interne mono-entreprise. Quand ce document parle d'architecture "SaaS propre", il faut comprendre architecture produit professionnelle, pas multi-tenant.

## Fichiers lus pour cet audit

- `AGENTS.md`
- `documentation.md`
- `docs/00-index.md`
- `docs/05-sql-connect.md`
- `docs/12-ai-agent-roadmap.md`
- `docs/13-checkpoint-002-readiness.md`
- `dataconnect/schema/schema.gql`
- `dataconnect/sosson/queries.gql`
- `dataconnect/sosson/mutations.gql`
- pages et adaptateurs front sous `src/`

## Tableau global SQL / partiel / fallback

| Domaine | En SQL aujourd'hui | Etat front | Fallback actuel | Priorite |
|---|---:|---|---|---:|
| Utilisateurs applicatifs | Partiel: table `User`, queries `GetCurrentUser` et `ListUsers`, RBAC mutations | Auth Firebase reelle; profil SQL tente puis Firestore fallback; page Equipe lit les profils SQL si disponible | Firestore `users/{uid}` puis users TS dev opt-in; Equipe RH localStorage | P0 |
| Clients operationnels | Oui, table `Client`, query operationnelle | Store charge SQL si disponible | Excel reconstruit / seeds TS | P0 |
| Chantiers operationnels | Oui, table `Chantier`, query operationnelle | Store charge SQL si disponible | Excel reconstruit / seeds TS | P0 |
| Factures | Oui, table `Facture`, create/status SQL disponibles | Page Factures ecrit SQL si source Data Connect | State React local / seeds | P0 |
| Documents metadata | Oui, `DocumentFolder`, `DocumentAttache` avec chemin pending, taille et hash SHA-256 | Page Documents lit/ecrit metadata SQL si possible | localStorage dossiers; object URLs | P1 |
| Fichiers documents | Non SQL par design | Storage cible, upload produit incomplet | object URL navigateur / chemin pending | P1 |
| Previsionnel Excel | Oui, 7 tables previsionnelles | Page tableur lit/sauve SQL si disponible | TS genere + localStorage edits | P0/P1 |
| Dashboard | Donnees de base SQL possibles | Calculs front a la volee | Previsionnel TS et store local | P1 |
| Statistiques | Donnees previsionnelles SQL possibles | Calculs front; fallback TS | TS analytics | P1 |
| Emails | Partiel local: tables + operations + adapter + page en lecture/ecriture SQL limitee, pas sandbox | Page peut lire l'index SQL; preuve emulateur thread/message/piece jointe; Outlook local et seeds restent fallback explicites | SQL si disponible, sinon Graph local ou seed fallback | P1 |
| Planning | Partiel local: tables + operations + adapter + page en lecture/creation/modification/annulation SQL, pas sandbox | Page lit les evenements SQL par periode, les equipes finales SQL, cree/modifie/deplace/annule une carte SQL et bloque les equipes locales quand SQL est la source | SQL si source Data Connect et equipes finales disponibles, sinon localStorage fallback visible | P1 |
| Rapports | Partiel local: `Rapport` + `AnalyticsSnapshot` + page dediee, pas sandbox | Lecture SQL, creation de brouillon SQL et preuve locale `MarkRapportGenerated` avec artefact CSV local hashe | SQL si disponible, fallback local explicite | P2 |
| Equipe | Partiel avance: profils, onboarding et RH equipe SQL locaux | Profils SQL, demandes onboarding, equipes finales, fiches membres, conges, heures et paie lus/ecrits si SQL disponible; droits UX restent locaux | localStorage droits + fallback equipe si SQL indisponible | P1 |
| Checkpoints/audit | Prepare localement et prouve en emulateur | Docs + artefacts `tmp/` | Fichiers locaux / documentation | P0/P1 |

## Mission 1 - Tables SQL existantes

Schema reel: `dataconnect/schema/schema.gql`. Il contient 28 tables.

| Table | Role metier | Relations | Source des donnees | Pages front | Complet | Partiel / manque |
|---|---|---|---|---|---|---|
| `User` | Profil interne lie a Firebase Auth. | `Chantier.chefChantier`; controle RBAC dans mutations; lu par `GetCurrentUser` et `ListUsers`. | Provisioning manuel/script a partir de vrais UID Firebase. Pas de seed automatique. | Login, profil applicatif, RBAC, Equipe. | Base minimale correcte; page Equipe affiche les profils SQL en lecture seule si disponibles. | Pas de `dateModification`, actif/inactif, createdBy, audit de role. Provision sandbox non valide; pas de mutation role depuis le front. |
| `Client` | Client canonique operationnel ou client historique Excel. | 1-n `Chantier`, 1-n `ClientAlias`, 1-n `DocumentAttache`. | Seed previsionnel Excel, mutations futures; seed demo local uniquement. | Clients, Dashboard, Chantiers, Documents, Previsionnel, Statistiques. | `origineImport` separe operationnel/previsionnel. | Pas d'audit, soft delete, fusion/alias operationnels, dedoublonnage durable. |
| `Chantier` | Dossier operationnel ou chantier historique Excel. | n-1 `Client`, n-1 `User`, 1-n `Facture`, `DocumentAttache`, `PrevisionnelLine`. | Seed previsionnel Excel; seed demo local uniquement. | Chantiers, Detail chantier, Dashboard, Factures, Planning cible. | Relations principales presentes. | Pas d'historique statut, pas de planning SQL, pas de dateModification/audit. |
| `Facture` | Facture fournisseur rattachee a un chantier. | n-1 `Chantier`, optional docs via `DocumentAttache.facture`. | Mutations `CreateFacture`, `SetFactureStatut`; seed demo local uniquement. | Factures, Detail chantier, Dashboard/statistiques. | Modele facture de base present. | Pas de fournisseur canonique, pas de piece jointe obligatoire, pas d'historique statut, pas de paiement/echeance. |
| `DocumentFolder` | Dossier documentaire utilisateur. | Parent recursive, optional `Client`, `Chantier`. | Mutation SQL ou fallback localStorage. | Documents cible, Detail chantier cible. | Structure de rangement existe. | Pas de soft delete, droits, ordre, proprietaire, chemin Storage reel. |
| `DocumentAttache` | Metadata SQL d'un fichier Storage. | Optional `folder`, `client`, `chantier`, `facture`. | Page Documents mutation SQL avec `storagePath` pending, taille et SHA-256. | Documents, Detail chantier cible, Factures cible, Emails cible. | Bonne separation metadata/fichier; preuve emulateur `documents-local.json` relit `storagePath`, `tailleBytes` et `sha256`. | Upload binaire Storage produit incomplet; pas de scan, version, audit ni chemin Storage definitif. |
| `PrevisionnelImportBatch` | Trace d'un import Excel. | 1-n `PrevisionnelExercise`. | Seed genere depuis `PREVISIONNEL.xlsx`. | Previsionnel, Statistiques, Dashboard. | Contient workbook, sourcePath, hash. | Devrait etre relie a `DataImportRun` et a l'environnement. Sandbox non prouvee. |
| `PrevisionnelExercise` | Exercice/onglet previsionnel. | n-1 batch, 1-n `PrevisionnelLine`. | Seed previsionnel. | Previsionnel, Statistiques, Dashboard. | Agregats d'exercice presents. | Pas de statut de validation/import, pas d'auteur, pas de version utilisateur. |
| `ClientAlias` | Alias Excel vers client canonique. | n-1 `Client`. | Seed previsionnel. | Recherche/rapprochement cible. | Utile pour eviter identite par nom brut. | Pas encore exploite largement en UI, pas de confiance/validation humaine. |
| `PrevisionnelLine` | Ligne source Excel, identifiee par sheet + row. | n-1 exercise, client, optional chantier. | Seed previsionnel. | Previsionnel, Statistiques, Dashboard. | Conserve sourceSheet/sourceRow et montants principaux. | Limites de pagination a surveiller; liens chantier operationnel a clarifier. |
| `PrevisionnelMonthlyAmount` | Montants mensuels d'une ligne. | n-1 `PrevisionnelLine`. | Seed previsionnel; sauvegarde SQL tableur. | Tableur previsionnel, Statistiques, Dashboard. | `invoiceSent` conserve le jaune Excel comme facture envoyee. | Pas d'historique des edits mensuels hors `CellEdit`; pas de verrou de periode. |
| `PrevisionnelLotAmount` | Ventilation par lot/corps d'etat. | n-1 `PrevisionnelLine`. | Seed previsionnel. | Previsionnel cible, rapports cible. | Modele analytique utile. | Peu exploite dans les pages actuelles. |
| `PrevisionnelCellEdit` | Override exact de cellule tableur web. | Identifie sourceSheet + cellRef. | Sauvegarde SQL du tableur. | Previsionnel tableur. | Permet de conserver l'export Excel exact. | Pas d'auteur, pas de version append-only, `id` manuel. |
| `EmailThread` | Index metier d'une conversation Outlook. | Optional `Client`, `Chantier`, `User.assignedTo`; 1-n `EmailMessage`. | Import/indexation Graph cible. | Emails, Detail chantier cible, Dashboard cible. | Modele local prepare avec statut, importance, lien client/chantier; page Emails lit la liste SQL et peut indexer un envoi/brouillon ou changer statut/lien. | Pas de preuve sandbox; pas de sync Graph serveur durable; pas encore de vue detail SQL complete. |
| `EmailMessage` | Metadata de message utile. | n-1 `EmailThread`, 1-n `EmailAttachment`. | Graph cible; corps lourd via Storage. | Emails cible. | Metadata, preview, chemins/hash de corps supportes. | Pas de politique retention, pas de dedoublonnage sync, pas de backend Graph final. |
| `EmailAttachment` | Piece jointe email indexee. | n-1 `EmailMessage`, optional `DocumentAttache`. | Graph + Storage cible. | Emails, Documents cible. | Pont vers document SQL prevu. | Upload Storage, hash obligatoire et classement restent a industrialiser. |
| `PlanningEvent` | Evenement de planning. | Optional `Chantier`, `User.createdBy`, `User.updatedBy`; 1-n `PlanningAssignment`. | Mutations planning cible. | Planning, Detail chantier, Dashboard cible. | Creneau, statut, notes et lien chantier modelises; page Planning lit par periode, cree, modifie, deplace et annule des cartes SQL; preuve emulateur `planning-local.json`. | Pas de gestion conflit, recurrence ni historique dedie par evenement; l'annulation est un statut soft, pas encore un vrai journal d'annulation. |
| `PlanningAssignment` | Affectation utilisateur/equipe a un evenement. | n-1 `PlanningEvent`, optional `User`. | Mutations planning cible. | Planning, Equipe cible. | Role, statut et notes modelises. | Pas d'historique de modification ni contraintes de disponibilite. |
| `AnalyticsSnapshot` | Snapshot analytique reproductible. | Optional `User.createdBy`, 1-n `Rapport`. | Script analytics local, jobs analytiques cible. | Dashboard, Statistiques, Rapports cible. | Totaux et chemin/hash payload prevus; creation/relecture prouvee en emulateur par `snapshot:analytics:dataconnect`. | Pas de preuve sandbox; le job durable serveur reste a creer. |
| `Rapport` | Rapport genere ou en preparation. | Optional `AnalyticsSnapshot`, `User.author`, `Client`, `Chantier`. | Workflow rapports cible. | Rapports, Detail chantier cible. | Statut, periode, format, export Storage/hash prevus; page Rapports lit la liste SQL et cree un brouillon metadata; preuve emulateur `report-local.json` genere un CSV local, stocke son chemin/hash reel, puis relit le rapport. | Generation PDF/XLSX non implementee; fichier Storage reel encore a produire. |
| `AuditEvent` | Journal append-only d'action sensible. | Optional liens via `EntityChangeLog`. | Scripts/checkpoints/admin cible. | Moteur live/documentation technique cible. | Creation/lecture uniquement dans operations exposees. | Pas sandbox; immutabilite depend aussi des pratiques de migration. |
| `CheckpointRun` | Execution d'un checkpoint. | 1-n `CheckpointStep`, `CheckpointArtifact`, `CheckpointDecision`; liens `EntityChangeLog`. | Script checkpoint local/emulateur. | Moteur live cible. | Ecriture/relecture prouvee en emulateur. | Pas de seed/validation sandbox distante. |
| `CheckpointStep` | Etape d'un checkpoint. | n-1 `CheckpointRun`, 1-n artifacts. | Script checkpoint. | Moteur live cible. | Statut, commande, exit code, duree, log hash prevus. | Pas de collecte automatique exhaustive de logs. |
| `CheckpointArtifact` | Preuve indexee. | n-1 `CheckpointRun`, optional `CheckpointStep`. | Scripts/checkpoints. | Moteur live cible. | Chemin, hash, taille, type et Storage path prevus. | Fichier lourd reste hors SQL et doit etre conserve. |
| `CheckpointDecision` | Decision humaine de validation/refus. | n-1 `CheckpointRun`. | Validation humaine cible. | Moteur live cible. | Texte, statut, auteur, hash de phrase prevus. | Doit rester explicite; aucune action sandbox automatique. |
| `DataImportRun` | Execution d'un import de donnees. | 1-n `DataImportIssue`; liens `EntityChangeLog`. | Import Excel/seeds cible. | Previsionnel, Moteur live cible. | Compteurs, source, hash et environnement prevus. | Pas encore rattache au seed previsionnel existant. |
| `DataImportIssue` | Anomalie d'import. | n-1 `DataImportRun`. | Import Excel cible. | Previsionnel/Moteur live cible. | Severite, ligne/colonne, resolution prevues. | Workflow de correction non branche. |
| `EntityChangeLog` | Journal transversal de changement metier. | Optional `AuditEvent`, `CheckpointRun`, `DataImportRun`. | Mutations sensibles cible. | Moteur live cible. | Hash avant/apres et raison prevus. | Pas encore appele par toutes les mutations metier. |

## Mission 1 - Decoupage par domaine

| Domaine | Etat actuel |
|---|---|
| Operationnel vivant | Tables `Client`, `Chantier`, `Facture`, `User`. Les queries operationnelles filtrent `origineImport = "operationnel"`. Le front reste hybride. |
| Historique previsionnel Excel | Tables dediees previsionnelles + clients/chantiers marques `origineImport = "previsionnel"`. Pret en repo et valide localement, pas prouve en sandbox distante. |
| Documents | Metadata SQL existe avec chemin pending, taille et hash SHA-256 local. Les fichiers doivent rester dans Storage. Upload Storage produit et versioning manquent. |
| Emails | Tables et operations SQL preparees localement. La page lit l'index SQL si disponible, conserve Graph local et seed fallback comme sources explicites, ecrit les threads/messages/pieces jointes via adapter quand disponible, et la preuve `email-local.json` relit thread/message/attachment en emulateur. |
| Planning | Tables et operations SQL preparees localement. La page lit les evenements SQL par periode et les equipes finales SQL si disponibles, cree les nouvelles cartes en SQL avec assignment/fiche intervention, modifie/deplace via `UpdatePlanningEventDetails`, et annule via `CancelPlanningEvent` sans suppression physique. En mode SQL, une equipe finale SQL est requise; les templates locaux restent limites au fallback visible. |
| Rapports/statistiques | `AnalyticsSnapshot` et `Rapport` prepares localement. Dashboard/Statistiques lisent les snapshots si presents; Rapports lit/cree des brouillons SQL metadata. Un snapshot `dashboard-global` et un rapport avec artefact CSV local hashe sont crees et relus en emulateur par `checkpoint:002:emulator`. |
| Checkpoints/audit | Tables append-only preparees localement et prouvees en emulateur. Sandbox distante non prouvee. |

## Mission 2 - Mapping complet du site

| Page | Donnees affichees aujourd'hui | Source actuelle | Source cible SQL | Queries necessaires | Mutations necessaires | Risques | Priorite |
|---|---|---|---|---|---|---|---:|
| Dashboard | KPIs clients/chantiers/factures, previsionnel 2025-26, alertes calculees, indicateur snapshot analytics. | Mixte: store SQL si disponible, previsionnel SQL sinon TS; snapshot analytics lu si present. | Tables operationnelles + previsionnel + snapshots. | `GetDashboardSummary`, `GetPrevisionnelVsRealise`, `ListLateChantiers`, `ListFacturesByStatut`, `ListAnalyticsSnapshots`. | Aucune directe, sauf creation snapshot admin. | Faire croire qu'un snapshot existe alors que la page calcule encore front; libelle maintenant explicite. | P1 |
| Clients | Liste, stats, recherche, creation SQL si source Data Connect, sinon fallback local visible. | Mixte: `useOperationalData`, previsionnel TS pour historique, mutation SQL ou fallback local annonce. | `Client` operationnel + alias/liens previsionnels. | `ListOperationalClients`, `GetClient`, `SearchClientAliases`. | `CreateClient`, `UpdateClient`, future merge/soft delete. | Doublons Excel vs clients vivants; fallback local a ne pas presenter comme sandbox. | P0 |
| Detail client | Fiche client, chantiers rattaches, synthese previsionnelle Excel, badges de source, edition client. | Mixte: `useOperationalData` pour client/chantiers; previsionnel TS rattache par ligne; mutation SQL si source Data Connect, fallback visible sinon. | `Client`, `Chantier`, `ClientAlias`, lignes previsionnelles rattachees. | `GetClient`, `ListOperationalChantiers`, future `ListPrevisionnelLinesByClient`. | `UpdateClient`, future merge/alias/soft delete. | Faire croire que le previsionnel Excel rend actifs les chantiers historiques; fallback local a ne pas presenter comme ecriture SQL. | P1 |
| Chantiers | Liste, filtres, budgets, progression, creation SQL si source Data Connect, sinon fallback local visible. | Mixte: SQL operationnel si possible; previsionnel TS en fallback/indicateurs; creation SQL ou fallback local annonce. | `Chantier` operationnel + factures + planning. | `ListOperationalChantiers`, `GetChantier`, `GetChantierFinancials`. | `CreateChantier`, `UpdateChantier`, `UpdateChantierStatut`. | Chantiers `prev-*` visibles comme actifs si filtre casse; fallback local a ne pas presenter comme sandbox. | P0 |
| Detail chantier | Synthese, factures, documents, emails, planning, badges de source par bloc, changement de statut. | `useOperationalData` pour chantier/factures; mutation SQL `UpdateChantierStatut` si source Data Connect active; documents/emails/planning lus par query chantier quand disponible; fallback local explicite sinon. | `Chantier`, `Facture`, `DocumentAttache`, `EmailThread`, `PlanningEvent`, `Rapport`. | `GetChantier`, `ListFactures`, `ListDocumentsByChantier`, `ListEmailThreadsByChantier`, `ListPlanningEventsByChantier`. | `UpdateChantierStatut`, mutations documents/factures/emails liens/planning. | Encore hybride; rapports et agregats chantier restent a brancher, et les modules vides ne prouvent pas la sandbox distante. | P1 |
| Factures | Liste, upload UI, creation/statut, libelles de fichiers non durables. | SQL si `operationalSource = dataconnect`, sinon fallback local explicite; fichiers selectionnes non stockes durablement. | `Facture` + `DocumentAttache` + Storage. | `ListFactures`, `ListFacturesByStatut`, `GetFactureWithDocument`. | `CreateFacture`, `SetFactureStatut`, `CreateDocumentAttache`. | Pas encore de Storage facture; une facture locale est bloquee en modification quand la source SQL est active; preuve emulateur cree et relit une facture apres comptage propre. | P0 |
| Documents | Dossiers, fichiers, classement, liens chantier/client. | SQL metadata si possible avec `storagePath`, `tailleBytes`, `sha256`; localStorage/object URLs seulement quand la source n'est pas SQL. Si SQL est actif et echoue, pas de fallback local silencieux. | `DocumentFolder`, `DocumentAttache`, Storage. | `ListDocumentFolders`, `ListDocumentsAttaches`, `ListDocumentsByChantier`, `ListDocumentsToClassify`. | `CreateDocumentFolder`, `CreateDocumentAttache`, `UpdateDocumentAttacheLinks`, soft delete/archive. | Metadata SQL sans upload Storage final; chemins `pending-documents/` a transformer en vrais fichiers Storage. | P1 |
| Previsionnel | Vue tableur, editions, export, checkpoints navigateur libelles comme locaux. | SQL si disponible; TS genere; localStorage edits/checkpoints navigateur. | Tables previsionnelles + `DataImportRun` + audit edits. | `ListPrevisionnelExercises`, `ListPrevisionnelLinesByExercise`, `ListPrevisionnelCellEdits`. | `UpdatePrevisionnelMonthlyAmount`, `UpdatePrevisionnelLineAmounts`, `UpsertPrevisionnelCellEdit`, future append-only edit event. | Confondre Excel genere, emulateur local et sandbox; checkpoints navigateur a ne pas confondre avec checkpoints SQL/audit; preuve emulateur modifie/restaure un montant et upsert une cellule de preuve. | P0 |
| Statistiques | Analyses previsionnelles, exercices, montants, indicateur snapshot analytics. | SQL si disponible; fallback TS analytics; snapshot analytics lu si present. | Previsionnel + operationnel + snapshots. | `GetPrevisionnelVsRealise`, `ListChantierMargins`, `ListAnalyticsSnapshots`, `GetAnalyticsSnapshot`. | Snapshot admin seulement. | Calculs lourds front et chiffres non reproductibles si source mixte; libelle distingue calcul front et snapshot. | P1 |
| Emails | Boite Outlook locale, filtres, messages, badge de source SQL/Graph/fallback. | SQL partiel si disponible; sinon serveur Graph local `localhost:8787` ou seed fallback. | `EmailThread`, `EmailMessage`, `EmailAttachment`, `DocumentAttache`. | `ListEmailThreads`, `ListEmailThreadsByChantier`, `GetEmailThread`, `ListUnreadEmailThreads`. | `UpdateEmailThreadStatusAndLinks`, `CreateEmailThread`, `CreateEmailMessage`, `CreateEmailAttachment`, future sync Graph serveur. | Sync Graph serveur durable manquante; corps email lourd a garder hors SQL; Storage pieces jointes produit non finalise. | P1 |
| Planning | Calendrier d'interventions avec badge de source SQL/fallback. | SQL partiel si source Data Connect et equipe finale SQL; sinon localStorage + chantiers store en fallback visible. | `PlanningEvent`, `PlanningAssignment`, `PlanningJobSheet`, `SossonTeam`, `SossonTeamMember`, `SossonWorkTimeEntry`. | `ListPlanningEventsByPeriod`, `ListPlanningEventsByChantier`, `ListPlanningJobSheetsByEvent`, `ListSossonTeams`. | `CreatePlanningEvent`, `CreatePlanningAssignment`, `UpdatePlanningEventStatus`, `UpdatePlanningEventDetails`, `CancelPlanningEvent`, `CreatePlanningJobSheet`, `UpdatePlanningJobSheetProgress`, `CompletePlanningJobSheet`, `CreateSossonWorkTimeEntry`. | Conflits de planning non detectes, pas d'historique dedie par evenement, annulation limitee a un statut soft, equipes sandbox non encore prouvees. | P1 |
| Rapports | Liste de rapports, creation de brouillon metadata, lien au dernier snapshot si present. | SQL partiel si disponible; fallback local explicite; preuve CSV locale en emulateur. | `Rapport` + `AnalyticsSnapshot` + Storage exports. | `ListRapports`, `GetRapport`, `ListAnalyticsSnapshots`. | `CreateRapport`, `MarkRapportGenerated`, futures mutations archive/soft delete. | Pas encore de generation PDF/XLSX ni fichier Storage reel; le CSV local reste une preuve emulateur. | P2 |
| Equipe | Profils applicatifs, demandes onboarding, equipes finales, fiches membres, conges, heures, preparation paie, matrice acces UX. | SQL RH quand Data Connect repond; fallback local visible uniquement hors source SQL; droits UX encore localStorage. | `User`, `TeamProfileSubmission`, `SossonTeam`, `SossonTeamMember`, `SossonTeamLeavePeriod`, `SossonWorkTimeEntry`, `SossonPayrollPeriod`. | `ListUsers`, `ListTeamProfileSubmissions`, `ListSossonTeams`, `ListSossonWorkTimeEntries`, `ListSossonPayrollPeriods`. | `ConvertTeamProfileSubmission`, `CreateSossonTeam`, `CreateSossonTeamMember`, `UpdateSossonTeamMember`, `CreateSossonTeamLeavePeriod`, `CreateSossonWorkTimeEntry`, `CreateSossonPayrollPeriod`. | Droits UX localStorage ne prouvent pas le RBAC serveur; suppression/archive RH SQL et rattachement heures chantier/planning restent a finir. | P1 |
| Parametres | Placeholder. | Aucun vrai flux. | Config applicative non secrete, import settings, preferences. | `GetSettings`, `ListIntegrationStatus`. | `UpdateSettings` non secret. | Mettre des secrets en front/docs. | P3 |
| Moteur live / documentation technique | Probes et catalogue des sources. | Mixte: probes SQL quand possibles, docs runtime, localStorage indirect. | Page de supervision lisant checks/audit SQL. | `GetSystemHealth`, `ListCheckpointRuns`, `ListDataImportRuns`. | Aucune mutation front sauf actions admin explicites. | Libelles qui sur-vendent la sandbox si non comptee. | P1 |

## Mission 3 - Architecture SQL cible recommandee

### Tables existantes a conserver

Les tables minimales attendues existent deja:

- `User`
- `Client`
- `Chantier`
- `Facture`
- `DocumentFolder`
- `DocumentAttache`
- `PrevisionnelImportBatch`
- `PrevisionnelExercise`
- `ClientAlias`
- `PrevisionnelLine`
- `PrevisionnelMonthlyAmount`
- `PrevisionnelLotAmount`
- `PrevisionnelCellEdit`

Elles doivent evoluer par ajouts non destructifs:

- `dateModification`
- `createdBy`
- `updatedBy`
- `deletedAt` / `deletedBy` / `deleteReason` quand la suppression fonctionnelle existe
- `version` ou journal append-only pour les entites critiques
- hash ou chemin d'artefact pour les imports et documents

### Tables ajoutees ou a conserver dans la cible

Les tables ci-dessous sont maintenant presentes dans le schema local du repo. Cela veut dire "prepare dans le repo", pas "deja present en sandbox distante".

| Table cible | Recommandation | Raison |
|---|---|---|
| `EmailThread` | Oui | Index metier d'une conversation Outlook liee a client/chantier. |
| `EmailMessage` | Oui | Metadata de message utile; corps complet plutot Storage si lourd/sensible. |
| `EmailAttachment` | Oui | Pont entre Graph, Storage et `DocumentAttache`. |
| `PlanningEvent` | Oui | Planning durable lie aux chantiers. |
| `PlanningAssignment` | Oui | Affectation equipe/utilisateur par creneau. |
| `Rapport` | Oui | Historique des rapports generes, statut et fichier export. |
| `AnalyticsSnapshot` | Oui, mieux que `DashboardSnapshot` seul | Sert au dashboard, statistiques et rapports. |
| `AuditEvent` | Oui | Journal append-only des actions sensibles. |
| `CheckpointRun` | Oui | Etat d'un checkpoint local/sandbox/prod. |
| `CheckpointStep` | Oui | Etapes executees, statut, exit code, duree. |
| `CheckpointArtifact` | Oui | Preuves indexees: chemin, hash, taille, type. |
| `CheckpointDecision` | Oui | Decisions humaines et validations. |
| `DataImportRun` | Oui | Historique des imports Excel/seeds. |
| `DataImportIssue` | Oui | Anomalies d'import, resolution et severite. |
| `EntityChangeLog` | Oui | Historique metier transversal par entite. |

### Decision sur les checkpoints en SQL

Oui, les checkpoints doivent etre en SQL, mais pas les gros fichiers bruts.

SQL doit contenir:

- environnement: local, sandbox, production
- statut: prepare, running, passed, failed, blocked
- auteur ou acteur technique
- date debut / date fin
- commit git ou identifiant de build
- etapes executees et resultats
- decisions humaines
- chemins des preuves
- hash SHA-256 des preuves
- taille et type des artefacts

SQL ne doit pas contenir:

- logs complets tres volumineux
- exports lourds
- fichiers PDF/Excel
- pieces jointes
- dumps bruts

Ces objets doivent aller dans Storage ou rester comme artefacts fichiers, avec uniquement leur index et leur hash en SQL.

## Mission 4 - Strategie base fiable

Regles proposees:

1. Pas de suppression silencieuse: soft delete par defaut sur clients, chantiers, documents, planning, rapports.
2. Audit append-only: `AuditEvent` et `EntityChangeLog` ne se modifient pas depuis le front.
3. Imports Excel historises: chaque import cree un `DataImportRun`, rattache a `PrevisionnelImportBatch`.
4. Donnees critiques versionnees: statut facture, statut chantier, cellule previsionnelle, document classe.
5. Champs de trace partout ou utile: `dateCreation`, `dateModification`, `createdBy`, `updatedBy`.
6. Separation claire des environnements: toute preuve checkpoint/import porte `environment`.
7. Hash systematique des sources et artefacts: Excel, logs, exports, fichiers importes.
8. Mutations sensibles controlees serveur par role SQL, pas par masquage UI.
9. Production bloquee tant que sandbox non comptee et non validee.

Point technique: l'immutabilite stricte doit etre appliquee par discipline de schema, scripts admin et gardes CI. Data Connect seul ne suffit pas a prouver qu'une table append-only ne sera jamais modifiee si une mutation d'update est exposee.

## Mission 5 - Previsionnel Excel

Source utilisateur:

- dossier local: `C:\Users\pcpor\OneDrive\Bureau\prévisionnelsosson`
- fichier source observe dans le repo et les seeds: `PREVISIONNEL.xlsx`
- seed batch courant: hash workbook renseigne dans `dataconnect/previsionnel_seed/0001_importBatch.gql`

Etat par etape:

| Question | Reponse |
|---|---|
| Qu'est-ce qui vient du fichier Excel ? | Exercices, lignes chantier, noms bruts, alias clients, montants mensuels, montants par lot, jaunes Excel interpretes comme `invoiceSent`. |
| Qu'est-ce qui est actuellement local ? | `src/data/previsionnel*`, analytics TS, edits/checkpoints localStorage, fallback front. |
| Qu'est-ce qui est pret a etre seede ? | `dataconnect/previsionnel_seed_data.gql` et chunks `dataconnect/previsionnel_seed/*.gql`; le seed operationnel restant est un jeu demo local/emulateur. |
| Qu'est-ce qui est valide SQL local ? | Les gardes locaux et docs checkpoint 002 indiquent un etat local/emulateur pret; `verify:previsionnel:clients` valide les derivations clients depuis TS. |
| Qu'est-ce qui reste a valider sandbox ? | Seed reel, comptage reel, lecture front sandbox, separation operationnel/previsionnel, edits SQL et RBAC sur vrais profils. |
| Comment eviter les chantiers historiques comme actifs ? | Garder `origineImport = "previsionnel"` sur les imports Excel, filtrer les queries operationnelles, interdire les pages operationnelles d'utiliser `prev-*` comme source active, afficher l'historique comme previsionnel uniquement. |

Comptes prepares par le pipeline:

- 13 exercices
- 586 clients uniques
- 616 alias
- 898 chantiers/lignes previsionnelles
- 1577 montants mensuels
- 887 montants par lot

Ces chiffres prouvent la preparation repo/local, pas la presence en sandbox distante.

## Mission 6 - Requetes rapides, dashboard et statistiques

Queries recommandees:

| Besoin | Query cible | Mode de calcul recommande |
|---|---|---|
| Dashboard global | `GetDashboardSummary` | Agregation SQL logique; snapshot si periode cloturee. |
| Marge par chantier | `ListChantierMargins`, `GetChantierFinancials` | Calcul a la volee sur factures pour volume faible; snapshot mensuel si lent. |
| CA previsionnel vs realise | `GetPrevisionnelVsRealise` | Agregation previsionnel + factures; snapshot pour rapports. |
| Factures par statut | `ListFacturesByStatut`, `GetFactureStatusSummary` | A la volee. |
| Clients actifs | `ListActiveClients` | A la volee, filtre operationnel + chantier actif. |
| Chantiers en retard | `ListLateChantiers` | A la volee, index sur statut/dateFinPrevue. |
| Documents a classer | `ListDocumentsToClassify` | A la volee, filtre statut. |
| Emails non traites | `ListUnreadEmailThreads` | A la volee depuis index SQL email. |
| Planning par periode | `ListPlanningEventsByPeriod` | A la volee, index date. |
| Rapports croises | `GetAnalyticsSnapshot`, `ListRapportSources` | Snapshot analytique et artefacts hashes. |

Decision:

- Calculer a la volee les listes courtes et etats operationnels recents.
- Utiliser des queries agregees pour le dashboard quotidien.
- Creer `AnalyticsSnapshot` pour les periodes, rapports, exports et comparaisons lourdes.
- Eviter de materialiser trop tot si les volumes restent PME; materialiser seulement ce qui devient lent ou doit etre reproductible.

## Mission 7 - Emails / Outlook

Etat actuel:

- Page Emails front existante.
- Preuve Outlook/Graph via serveur local `localhost:8787`.
- Tables SQL email, operations Data Connect et adapter front prepares localement.
- La page lit maintenant `ListEmailThreads` si SQL Connect est disponible, affiche la source, et peut indexer un envoi/brouillon ou mettre a jour statut/liens via les mutations disponibles.
- Pas encore de sync Graph serveur durable ni de preuve sandbox distante.
- Les secrets/tokens ne doivent jamais aller dans le front.

Cible:

- Outlook/Graph reste la source externe.
- Un backend serveur gere OAuth, refresh tokens et appels Graph.
- SQL stocke seulement l'index metier utile: thread, message, statut, liens client/chantier, hash, timestamps.
- Les pieces jointes utiles vont dans Storage.
- `EmailAttachment` relie la piece Graph au `DocumentAttache`.
- Le corps complet d'un email peut rester externe ou etre archive en Storage si necessaire, pas en localStorage.

## Mission 8 - Planning

Etat actuel:

- Page Planning fonctionnelle avec lecture SQL par periode si source Data Connect disponible.
- Lecture des equipes finales SQL via le repertoire RH; si SQL repond vide, les templates locaux ne sont plus utilises pour creer une carte durable.
- Creation SQL de nouvelles cartes avec assignment et fiche intervention; fallback localStorage uniquement quand SQL n'est pas la source active.
- Edition et deplacement SQL branches via `UpdatePlanningEventDetails` avec equipe finale SQL obligatoire; annulation soft branchee via `CancelPlanningEvent`, avec statut `cancelled` et sans suppression physique.
- Chantiers utilises comme options depuis le store.

Modele SQL cible:

- `PlanningEvent`: titre, type, chantier, dateDebut, dateFin, statut, notes, createdBy, updatedBy, deletedAt.
- `PlanningAssignment`: event, user/equipe, role sur intervention, statut, commentaire.
- `PlanningChangeLog` ou `EntityChangeLog`: creation, deplacement, annulation, conflit resolu.

Queries/mutations:

- `ListPlanningEventsByPeriod`
- `ListPlanningEventsByChantier`
- `CreatePlanningEvent`
- `UpdatePlanningEvent`
- `AssignPlanningUser`
- `CancelPlanningEvent`

## Mission 9 - Rapports

Etat actuel:

- Page Rapports dediee: lecture `ListRapports`, relecture du detail selectionne via `GetRapport`, lecture du dernier `AnalyticsSnapshot`, creation d'un brouillon `Rapport` metadata si SQL Connect est disponible.
- Fallback local visible quand SQL n'est pas disponible.
- Aucun export PDF/XLSX ni fichier Storage reel n'est encore genere; un artefact CSV local sous `tmp/` est genere, hashe et reference en SQL emulateur.

Workflow cible:

1. L'utilisateur choisit periode et perimetre.
2. Le backend cree un `Rapport` en statut `preparing`.
3. Les sources SQL sont figees dans un `AnalyticsSnapshot` ou referencees par hash/source watermark.
4. L'export PDF/Excel est genere si necessaire.
5. Le fichier va dans Storage.
6. SQL garde statut, auteur, periode, perimetre, chemin Storage, hash, taille et date.

Tables:

- `Rapport`
- `AnalyticsSnapshot`
- `CheckpointArtifact` ou table d'artefacts commune si les exports doivent etre indexables

## Mission 10 - Plan de migration concret

1. Audit sans modification: lire schema, pages, scripts, docs et separer prepare/local/sandbox/prod.
2. Documentation etat actuel: maintenir ce rapport, `docs/05-sql-connect.md` et `docs/07-frontend-state.md`.
3. Proposition schema cible: valider les tables nouvelles par lots non destructifs.
4. Petits changements schema non destructifs: ajouter metadata/audit/snapshots sans supprimer de colonnes.
5. Generation SDK propre: uniquement `firebase dataconnect:sdk:generate`, jamais edition manuelle.
6. Adapters front: garder les pages loin des SDKs, centraliser dans `src/features/*`.
7. Pages migrees une par une: Clients, Chantiers, Factures, Documents, Previsionnel, Dashboard/Stats, Emails, Planning, Rapports.
8. Tests locaux: lint, unitaires, gardes statiques, build sandbox.
9. Seed local: emulateur Data Connect uniquement.
10. Comptage local: verifier operationnel et previsionnel localement.
11. Validation humaine sandbox: demander la phrase exacte avant action distante.
12. Seed sandbox: uniquement apres validation humaine, avec artefacts.
13. Comptage sandbox: uniquement apres validation humaine, preuves archivees.
14. Decision production: seulement apres sandbox stable, smoke tests et decision explicite.

## Risques principaux

- Confondre seed prepare avec donnees vraiment injectees en sandbox.
- Confondre donnees emulator/local avec sandbox distante.
- Laisser les lignes `prev-client-*` / `prev-chantier-*` apparaitre comme operationnelles.
- Avoir une UI qui ecrit localement alors que l'utilisateur pense ecrire en SQL.
- Stocker des fichiers seulement en object URL navigateur.
- Stocker tokens Graph ou secrets dans le front.
- Modifier les SDKs generes a la main.
- Ajouter des mutations d'audit modifiables qui cassent l'append-only.
- Deployer rules/Data Connect sandbox sans validation humaine.
- Envisager la production avant preuve sandbox.

## Actions interdites sans validation humaine

Phrase attendue avant action sandbox reelle:

```text
Je valide uniquement les actions sandbox suivantes sur le projet sosson-sandbox : deploy rules, deploy Data Connect, seed Data Connect, provisioning SQL User, comptage Data Connect. Je confirme que la production sosson-prod est exclue.
```

Sans cette phrase, il est interdit de:

- lancer un seed sandbox reel;
- deployer Data Connect sandbox;
- deployer Firestore/Storage rules;
- provisionner de vrais profils SQL `User`;
- compter la base sandbox distante;
- toucher `sosson-prod`;
- supprimer des donnees reelles;
- lancer `firebase init dataconnect`.

## Commandes locales lancees pour cet audit

| Commande | Resultat |
|---|---|
| `npm run lint` | OK. |
| `npm run test:previsionnel` | OK, 10 tests. |
| `npm run test:documents` | OK, 5 tests: chemins Storage, validation upload et SHA-256. |
| `npm run test:access-control` | OK, 2 tests. |
| `npm run check:page-dataconnect-imports` | OK, aucun import direct SDK SQL dans `src/pages`. |
| `npm run check:dataconnect-queries` | OK, 14 queries auditees. |
| `npm run check:dataconnect-client-surface` | OK, `UpsertCurrentUser` absent front/SDK. |
| `npm run verify:previsionnel:clients` | OK, 898 lignes chantier et 586 clients derives depuis TS. |
| `npm run audit:frontend-sources -- --output=tmp/checkpoint-002/frontend-sources-current-audit.json` | OK, preuve des fallbacks front hybrides. |
| `npm run check:generated-clean` | OK avec avertissement: SDKs generes modifies avec sources Data Connect modifiees; verifier regeneration officielle. |
| `npm run check:front-secrets` | OK, pas de secret front detecte par le garde. |
| `npm run count:dataconnect -- --dry-run` | OK, aucune lecture Data Connect executee. |
| `npm run build:sandbox` | OK, warning Vite sur gros chunks. |
| `npm run checkpoint:002:local` | OK, preflight local complet. Ne valide pas la sandbox distante. |
| `firebase dataconnect:sdk:generate` | OK, SDKs SQL Connect regeneres localement apres ajout audit/checkpoints/imports. |
| `npm run check:dataconnect-queries` | OK apres changement, 20 queries auditees. |
| `npm run check:dataconnect-auth` | OK apres changement, 22 mutations auditees. |
| `npm run build:sandbox` | OK apres changement, warning Vite sur gros chunks. |
| `npm run checkpoint:002:local` | OK apres changement, preflight local complet. Ne valide pas la sandbox distante. |
| `npm run verify:checkpoint-audit:dataconnect` | OK avec Data Connect emulator: ecriture/relecture checkpoint/audit/import/change log; preuve `tmp/checkpoint-002/checkpoint-audit-local.json`. |
| `npm run verify:operational-boundary:dataconnect -- --output=tmp/checkpoint-002/operational-boundary-local.json` | OK via checkpoint emulateur: les listes operationnelles restent strictement limitees au seed operationnel apres injection du previsionnel. |
| `npm run snapshot:analytics:dataconnect` | OK via emulateur Data Connect: creation/relecture d'un `AnalyticsSnapshot` `dashboard-global`; preuve `tmp/checkpoint-002/analytics-snapshot-local.json`. |
| `npm run checkpoint:002:emulator` | OK apres reset pglite local le 2026-05-17: seed operationnel, seed previsionnel, verifications, frontiere operationnel/previsionnel, statut chantier SQL, comptage propre, preuves email/planning/rapport SQL, snapshot analytics SQL avant RBAC, RBAC et trace SQL checkpoint/audit. Preuves `counts-local.json`, `operational-boundary-local.json`, `chantier-status-local.json`, `email-local.json`, `planning-local.json`, `report-local.json`, `analytics-snapshot-local.json`, `checkpoint-audit-local.json`. |
| `firebase dataconnect:sdk:generate` | OK apres ajout email/planning/analytics/rapports. Premier essai bloque par alias imbriques planning, corrige avant generation finale. |
| `npm run lint` | OK apres ajout des adapters email/planning/analytics/rapports. |
| `npm run check:page-dataconnect-imports` | OK apres ajout des adapters: aucun import direct SDK SQL dans `src/pages`. |
| `npm run check:dataconnect-queries` | OK apres ajout priorite 2, 29 queries auditees. |
| `npm run check:dataconnect-auth` | OK apres ajout priorite 2, 33 mutations auditees. |
| `npm run checkpoint:002:local` | OK apres priorite 2: CI sandbox locale, audit sources, dry-run comptage, dry-run seed sandbox et dry-run provisioning SQL User. Ne valide pas la sandbox distante. |
| `npm run lint` | OK apres migration creation client/chantier vers SQL/fallback explicite. |
| `npm run check:page-dataconnect-imports` | OK: les pages passent par adapters, pas par imports directs SDK. |
| `npm run check:dataconnect-queries` | OK, 29 queries auditees. |
| `npm run check:dataconnect-auth` | OK, 33 mutations auditees. |
| `npm run build:sandbox` | OK apres migration creation client/chantier, warning Vite sur gros chunks. |
| `npm run test:documents` | OK apres durcissement Documents, incluant hash SHA-256. |
| `npm run check:document-storage` | OK: mutation SQL, metadata `storagePath`/`sha256` et chemins pending centralises. |
| `npm run build:sandbox` | OK apres durcissement Documents, warning Vite sur gros chunks. |
| `npm run test:previsionnel` | OK apres clarification des libelles checkpoint navigateur. |
| `npm run build:sandbox` | OK apres clarification previsionnel, warning Vite sur gros chunks. |
| `npm run checkpoint:002:local` | OK apres migrations P3 partielles: Clients, Chantiers, Documents et libelles previsionnel. Ne valide pas la sandbox distante. |
| `npm run lint` | OK apres lecture non bloquante `AnalyticsSnapshot` dans Dashboard/Statistiques. |
| `npm run check:page-dataconnect-imports` | OK: Dashboard/Statistiques passent par adapter analytics, pas par import SDK direct. |
| `npm run build:sandbox` | OK apres Dashboard/Statistiques, warning Vite sur gros chunks. |
| `npm run checkpoint:002:local` | OK apres Dashboard/Statistiques: CI sandbox locale, audit sources, dry-run comptage, dry-run seed sandbox et dry-run provisioning SQL User. Ne valide pas la sandbox distante. |
| `npm run lint` | OK apres raccordement SQL partiel Emails/Planning. |
| `npm run check:page-dataconnect-imports` | OK: Emails/Planning passent par adapters, pas par import SDK direct. |
| `npm run check:dataconnect-queries` | OK, 29 queries auditees. |
| `npm run build:sandbox` | OK apres Emails/Planning, warning Vite sur gros chunks. |
| `npm run check:doc-links` | OK apres mise a jour documentation Emails/Planning. |
| `npm run check:doc-entrypoints` | OK apres mise a jour documentation Emails/Planning. |
| `npm run checkpoint:002:local` | OK apres Emails/Planning: CI sandbox locale, audit sources, dry-run comptage, dry-run seed sandbox et dry-run provisioning SQL User. Ne valide pas la sandbox distante. |
| `npm run lint` | OK apres creation page Rapports SQL partielle. |
| `npm run check:page-dataconnect-imports` | OK: Rapports passe par adapters, pas par import SDK direct. |
| `npm run build:sandbox` | OK apres Rapports, warning Vite sur gros chunks. |
| `npm run check:doc-links` | OK apres mise a jour documentation Rapports. |
| `npm run check:doc-entrypoints` | OK apres mise a jour documentation Rapports. |
| `npm run check:document-storage` | OK apres correction du nom local `exportPath` dans Rapports. |
| `npm run checkpoint:002:local` | OK apres Rapports: CI sandbox locale, audit sources, dry-run comptage, dry-run seed sandbox et dry-run provisioning SQL User. Ne valide pas la sandbox distante. |
| `npm run lint` | OK apres durcissement des libelles/fallbacks Factures. |
| `npm run check:document-storage` | OK: Factures ne construit pas de metadata Storage hors flux Documents. |
| `npm run check:page-dataconnect-imports` | OK: Factures passe par adapters, pas par import SDK direct. |
| `npm run build:sandbox` | OK apres Factures, warning Vite sur gros chunks. |
| `npm run check:doc-links` | OK apres mise a jour documentation Factures. |
| `npm run check:doc-entrypoints` | OK apres mise a jour documentation Factures. |
| `npm run checkpoint:002:local` | OK apres Factures: CI sandbox locale, audit sources, dry-run comptage, dry-run seed sandbox et dry-run provisioning SQL User. Ne valide pas la sandbox distante. |
| `npm run lint` | OK apres badges de source Detail chantier. |
| `npm run check:page-dataconnect-imports` | OK: Detail chantier ne prend pas de dependance SDK directe. |
| `npm run build:sandbox` | OK apres Detail chantier, warning Vite sur gros chunks. |
| `npm run check:doc-links` | OK apres mise a jour documentation Detail chantier. |
| `npm run check:doc-entrypoints` | OK apres mise a jour documentation Detail chantier. |
| `npm run checkpoint:002:local` | OK apres Detail chantier: CI sandbox locale, audit sources, dry-run comptage, dry-run seed sandbox et dry-run provisioning SQL User. Ne valide pas la sandbox distante. |
| `npm run check:ui-capabilities` | OK apres Detail client: garde les libelles source/fallback des fiches client et chantier. |
| `npm run lint` | OK apres Detail client. |
| `npm run checkpoint:002:local` | OK apres Detail client: CI sandbox locale, audit sources, dry-run comptage, dry-run seed sandbox et dry-run provisioning SQL User. Ne valide pas la sandbox distante. |
| `npm run check:ui-capabilities` | OK apres mutation statut chantier: garde `UpdateChantierStatut`, source SQL/fallback et absence de fallback silencieux. |
| `npm run lint` | OK apres mutation statut chantier. |
| `npm run check:page-dataconnect-imports` | OK apres mutation statut chantier: la page passe par `src/features/operations/operationalAdapters.ts`, pas par import SDK direct. |
| `firebase dataconnect:sdk:generate` | OK apres ajout `ListUsers`. SDKs regeneres officiellement, sans edition manuelle. |
| `npm run check:dataconnect-queries` | OK apres `ListUsers`, 30 queries auditees. |
| `npm run check:page-dataconnect-imports` | OK apres branchement Equipe: la page passe par `src/features/team/teamSql.ts`. |
| `npm run lint` | OK apres branchement Equipe / `ListUsers`. |
| `npm run build:sandbox` | OK apres branchement Equipe / `ListUsers`, warning Vite sur gros chunks. |
| `npm run verify:team-users:dataconnect` | Couvre maintenant la creation/relecture de profils SQL `User`, puis le flux local `SubmitCurrentTeamProfile` -> demande pending -> refus conversion hors gerant -> `ConvertTeamProfileSubmission` par gerant -> relecture `GetCurrentUser`; preuve `tmp/checkpoint-002/team-users-local.json`. |
| `firebase dataconnect:sdk:generate` | OK apres ajout `UpdatePlanningEventDetails`. SDKs regeneres officiellement, sans edition manuelle. |
| `firebase dataconnect:sdk:generate` | OK apres ajout `dateModification_expr` sur `UpdateEmailThreadStatusAndLinks`. SDKs regeneres officiellement, sans edition manuelle. |
| `firebase dataconnect:sdk:generate` | OK apres ajout `CancelPlanningEvent`. SDKs regeneres officiellement, sans edition manuelle. |
| `npm run check:dataconnect-auth` | OK apres `CancelPlanningEvent`, 35 mutations auditees. |
| `npm run check:dataconnect-client-surface` | OK apres regeneration SDK: `UpsertCurrentUser` absent du SDK client/front. |
| `npm run check:page-dataconnect-imports` | OK apres branchement Planning details: la page passe par `src/features/planning/planningSql.ts`. |
| `npm run lint` | OK apres modification/deplacement Planning SQL. |
| `npm run build:sandbox` | OK apres modification/deplacement Planning SQL, warning Vite sur gros chunks. |
| `npm run verify:email:dataconnect` | OK via emulateur: creation d'un `EmailThread`, `EmailMessage`, `EmailAttachment`, classement du fil, relecture detail/listes; preuve `tmp/checkpoint-002/email-local.json`. |
| `npm run verify:documents:dataconnect` | OK via emulateur: creation d'un `DocumentFolder`, d'un document libre et d'un document facture lie a un chantier, relecture `storagePath`, `tailleBytes`, `sha256`, lien facture et `ListDocumentsByChantier`; preuve `tmp/checkpoint-002/documents-local.json`. |
| `npm run verify:planning:dataconnect` | OK via emulateur: creation d'un client, d'un chantier, d'un `PlanningEvent` + `PlanningAssignment`, modification via `UpdatePlanningEventDetails`, annulation via `CancelPlanningEvent`, relecture par periode et `ListPlanningEventsByChantier`; preuve `tmp/checkpoint-002/planning-local.json`. |
| `npm run verify:reports:dataconnect` | OK via emulateur: creation d'un `AnalyticsSnapshot`, generation d'un payload JSON + artefact CSV local sous `tmp/checkpoint-002/reports/`, creation d'un `Rapport`, marquage genere via `MarkRapportGenerated`, relecture detail/listes; preuve `tmp/checkpoint-002/report-local.json`. |
| `npm run checkpoint:002:emulator` | OK apres reset pglite local le 2026-05-17: inclut seed operationnel, seed previsionnel, frontiere operationnel/previsionnel, statut chantier SQL via `UpdateChantierStatut`, edition client SQL via `UpdateClient`, profils/onboarding SQL via `team-users-local.json`, preuves email/planning/rapport SQL, comptage propre, snapshot analytics, preuve edition previsionnel via `UpdatePrevisionnelMonthlyAmount`/`UpsertPrevisionnelCellEdit`, preuve factures SQL via `CreateFacture`/`SetFactureStatut`, preuve documents SQL avec hash et lien facture, RBAC et trace checkpoint/audit. Preuves `counts-local.json`, `operational-boundary-local.json`, `chantier-status-local.json`, `client-update-local.json`, `team-users-local.json`, `email-local.json`, `previsionnel-edits-local.json`, `factures-local.json`, `documents-local.json`, `planning-local.json`, `report-local.json`, `analytics-snapshot-local.json`, `checkpoint-audit-local.json`. |
| `npm run check:ui-capabilities` | OK apres edition client: garde `UpdateClient`, mutation SQL disponible et absence de fallback silencieux. |
| `npm run check:page-dataconnect-imports` | OK apres edition client: `ClientDetailPage` passe par l'adapter operations, pas par import SDK direct. |
| `npm run check:dataconnect-client-surface` | OK apres regeneration SDK `ListOperationalClients.adresse`: `UpsertCurrentUser` reste absent du SDK client/front. |
| `npm run lint` | OK apres edition client. |
| `npm run build:sandbox` | OK apres edition client, warning Vite habituel sur gros chunks. |
| `npm run verify:client-update:dataconnect` | OK via emulateur: modification puis restauration d'un client operationnel seed via `UpdateClient`; preuve `tmp/checkpoint-002/client-update-local.json`. |
| `npm run checkpoint:002:emulator` | OK apres reset pglite local le 2026-05-17: la chaine complete produit maintenant aussi `tmp/checkpoint-002/client-update-local.json`. Ne touche pas la sandbox distante. |
| `npm run checkpoint:002:local` | OK apres edition client: CI sandbox locale, audit sources, dry-run comptage, dry-run seed sandbox et dry-run provisioning SQL User. Ne valide pas la sandbox distante. |
| `npm run check:ui-capabilities` | OK apres preuve Factures: verifie maintenant `createFactureInSql` et `setFactureStatutInSql`. |
| `npm run verify:factures:dataconnect` | OK via emulateur: creation d'une facture locale via `CreateFacture`, relecture en attente, modification via `SetFactureStatut`, relecture en validee; preuve `tmp/checkpoint-002/factures-local.json`. |
| `npm run checkpoint:002:emulator` | OK apres reset pglite local le 2026-05-17: la chaine complete produit maintenant aussi `tmp/checkpoint-002/factures-local.json`, apres le comptage propre. Ne touche pas la sandbox distante. |
| `npm run verify:previsionnel-edits:dataconnect` | OK via emulateur: modification puis restauration d'un montant mensuel seed via `UpdatePrevisionnelMonthlyAmount`, puis upsert d'une cellule `ZZ999` via `UpsertPrevisionnelCellEdit`; preuve `tmp/checkpoint-002/previsionnel-edits-local.json`. |
| `npm run checkpoint:002:emulator` | OK apres reset pglite local le 2026-05-17: la chaine complete produit maintenant aussi `tmp/checkpoint-002/previsionnel-edits-local.json`, apres le snapshot analytics. Ne touche pas la sandbox distante. |

## Audit de couverture de la demande

| Mission | Couverture |
|---|---|
| 1. Audit SQL reel du repo | Couvert: tables, relations, sources, usages, manques. |
| 2. Mapping complet du site | Couvert page par page. |
| 3. Architecture cible SQL | Couvert avec tables existantes et tables a ajouter. |
| 4. Immutabilite et tracabilite | Couvert avec strategie append-only/soft delete/audit. |
| 5. Previsionnel Excel | Couvert avec distinction Excel/local/seed/sandbox/prod. |
| 6. Requetes rapides | Couvert avec queries et choix calcul/snapshot. |
| 7. Emails / Outlook | Couvert. |
| 8. Planning | Couvert. |
| 9. Rapports | Couvert. |
| 10. Plan de migration | Couvert en 14 etapes. |
| 11. Travail immediat autorise | Respecte: lectures, checks locaux, documentation, schema local non destructif, generation SDK officielle. |

## Conclusion

La couche d'audit/import/checkpoint non destructive est maintenant prouvee en emulateur local. Le checkpoint 002 local ecrit et relit aussi un `AnalyticsSnapshot` et un `Rapport` marque genere avec un artefact CSV local hashe, ce qui prouve le debut de la chaine "donnees SQL -> snapshot -> rapport -> preuve indexee" en local uniquement. La couche documents sait maintenant calculer un SHA-256 navigateur, ecrire `storagePath`, `tailleBytes` et `sha256` en metadata SQL, puis relire ces champs en emulateur; le fichier binaire Storage reste a finaliser. La couche email/planning/rapports/analytics est preparee dans le schema, les operations et les adapters; Emails, Planning, Rapports, Dashboard et Statistiques ont maintenant un raccordement SQL partiel et des fallbacks visibles. Les fiches client et chantier affichent maintenant si les donnees operationnelles viennent de SQL lu par le front ou d'un fallback, et rappellent que le previsionnel Excel ne prouve pas une donnee sandbox ni un chantier operationnel actif. La fiche client sait modifier les champs canoniques via `UpdateClient` quand Data Connect est la source active, sans fallback local silencieux en cas d'echec SQL; la preuve locale modifie puis restaure un client seed dans l'emulateur. La fiche chantier sait aussi modifier un statut via `UpdateChantierStatut` quand Data Connect est la source active, avec fallback local annonce sinon; la preuve locale modifie puis restaure un chantier seed dans l'emulateur. Le tableur Previsionnel sait ecrire un montant mensuel via `UpdatePrevisionnelMonthlyAmount` et une cellule exacte via `UpsertPrevisionnelCellEdit`; la preuve locale restaure le montant seed puis garde une cellule de preuve SQL locale. La page Factures sait creer une facture via `CreateFacture` et changer son statut via `SetFactureStatut`; la preuve locale cree une facture apres le comptage propre puis la relit par statut dans l'emulateur. Les Emails savent ecrire et relire thread/message/piece jointe metadata en local/emulateur, mais pas encore synchroniser Graph durablement. Le Planning sait lire, creer, modifier, deplacer et annuler une carte SQL en local/emulateur; l'annulation conserve la ligne en statut `cancelled`, sans suppression physique. Rapports sait creer et relire la metadata SQL et hasher un CSV local, mais pas encore produire un vrai PDF/XLSX ni un fichier Storage. La page Equipe lit aussi les profils SQL `User` en lecture seule, tout en gardant les equipes/membres/droits comme localStorage explicite. Rien de cela ne prouve encore la sandbox distante. La prochaine etape logique est de finir les mutations manquantes et les pages metier restantes, puis seulement de valider la sandbox avec seed reel, comptage reel et profils `User` reels, sous validation humaine explicite.
