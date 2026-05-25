# Audit pré-sandbox SQL Connect

> Statut: audit local / lecture seule distante  
> Date: 2026-05-21  
> Portée: Firebase SQL Connect, Cloud SQL PostgreSQL, front React, scripts de preuve.  
> Interdits respectés: aucun déploiement, aucune migration, aucune suppression métier, aucune action production.

## Verdict court

Sandbox: **partiellement prête, pas encore prête pour un déploiement sérieux sans validation humaine**.

Production: **non prête**.

Raison principale: le schéma et les scripts locaux sont structurés, les garde-fous statiques passent, mais la preuve émulateur complète n'a pas pu être menée jusqu'au bout à cause du disque `C:` plein. La sandbox distante existe, mais son instance Cloud SQL a les sauvegardes désactivées, pas de haute disponibilité, pas de protection de suppression et pas d'auto-resize.

## Ce qui est prouvé

| Sujet | Preuve | Conclusion |
|---|---|---|
| Projet Firebase courant | `firebase login:list`, `firebase use` | Compte connecté: `matthis.fradin2@gmail.com`; alias courant: `sosson-sandbox`. |
| Service SQL Connect sandbox | `firebase dataconnect:services:list --project sosson-sandbox` | Service `sosson-sandbox-service`, région `europe-west9`, instance `sosson-sandbox-instance`, base `fdcdb`, connecteur `sosson`. |
| Dernier état distant Data Connect | Même commande | Schéma mis à jour le `2026-05-14T17:56:15Z`; connecteur le `2026-05-14T17:56:17Z`. |
| Instance Cloud SQL sandbox | `gcloud sql instances describe sosson-sandbox-instance --project sosson-sandbox --format=json` | Instance `RUNNABLE`, PostgreSQL `POSTGRES_18`, région `europe-west9`, tier `db-f1-micro`. |
| Backups sandbox | Même commande | `settings.backupConfiguration.enabled: false`. |
| HA sandbox | Même commande | `settings.availabilityType: ZONAL`, donc pas HA régionale. |
| Protection suppression | Même commande | `settings.deletionProtectionEnabled: false`. |
| Auto-resize stockage | Même commande | `settings.storageAutoResize: false`, disque 10 Go. |
| Garde-fous SQL mutations | `npm run check:dataconnect-auth` | 49 mutations auditées, invariant OK. |
| Garde-fous SQL queries | `npm run check:dataconnect-queries` | 40 queries auditées, invariant OK selon règles repo. |
| SDK générés | `npm run check:generated-clean` | SDKs générés non modifiés. |
| Front secrets | `npm run check:front-secrets` | Pas de variable front ressemblant à un secret. |
| Auth safety | `npm run check:auth-safety` | Fallback local dev-only, pas d'`UpsertCurrentUser` front. |
| Firestore boundary | `npm run check:firestore-boundary` | Firestore limité à `src/lib/firebase.ts` et `src/lib/auth.ts`. |
| Storage metadata | `npm run check:document-storage` | Chemins Storage centralisés. |
| Rules Firebase repo | `npm run check:firebase-rules` | Firestore/Storage deny-by-default côté repo. |
| Production guard | `npm run check:production-guard` | Pas d'automatisation prod dangereuse détectée. |
| Sandbox guardrails | `npm run check:sandbox-guardrails` | Seeds sandbox réels gardés par flags explicites. |
| Lifecycle readiness | `npm run check:operational-lifecycle-readiness` | Documentation/gates lifecycle cohérents. |
| Décisions lifecycle | `npm run check:operational-lifecycle-decisions` | 9 réponses métier présentes. |
| Sources front | `npm run audit:frontend-sources -- --output=tmp/checkpoint-002/frontend-sources-audit.json` | 55 imports locaux/seeds, 27 usages `localStorage`, 3 usages Firestore, 0 import direct SDK SQL dans pages. |
| Dry-run seed sandbox | `npm run seed:sandbox -- --dry-run --kind=previsionnel --output=tmp/checkpoint-002/seed-sandbox-dry-run-audit.json` | Liste des fichiers seed produite sans mutation distante. |
| Dry-run SQL users | `npm run provision:sql-users -- --file=dataconnect/user_profiles.example.json --dry-run` | Profil exemple masqué, aucune mutation. |
| Checkpoint émulateur complet | `npm run checkpoint:002:emulator` | OK après déplacement temporaire de PGlite sur `E:` et correction de l'ordre du comptage propre. Aucune sandbox touchée. |
| CI sandbox locale | `npm run ci:sandbox` | OK: lint, tests, garde-fous, doc links, generated clean et build sandbox passent. |
| Diff local / sandbox | `firebase dataconnect:sql:diff --project sosson-sandbox --service sosson-sandbox-service --location europe-west9 --non-interactive` | Commande en lecture/diff: la sandbox ne correspond pas au schéma local. Aucune migration appliquée. |

## Preuve émulateur locale

`npm run checkpoint:002:emulator` a été lancé deux fois.

1. Premier lancement: échec attendu car la base PGlite locale était polluée. La preuve `tmp/checkpoint-002/operational-boundary-local.json` montrait 6 clients opérationnels et 7 chantiers opérationnels au lieu des seeds attendus.
2. Reset local effectué via `npm run reset:dataconnect:local -- --yes-local-reset`. Cette commande supprime uniquement `dataconnect/.dataconnect/pgliteData` et ne touche ni sandbox ni production.
3. Deuxième lancement sur base propre: arrêt pendant le seed prévisionnel avec l'erreur PostgreSQL/PGlite `No space left on device`. `Get-PSDrive` a confirmé que `C:` était plein.
4. Contournement local: démarrage de l'émulateur avec une configuration temporaire non versionnée plaçant `dataDir` sur `E:/sosson-audit-tmp/pgliteData`.
5. Troisième lancement: le seed et plusieurs preuves ont avancé, puis un défaut du script `scripts/checkpoint-002-emulator.mjs` a été révélé. Le comptage "base propre" était exécuté après des scripts qui créaient déjà un client et un chantier.
6. Patch local appliqué: le comptage propre a été déplacé juste après le seed et la vérification de frontière opérationnel/prévisionnel, avant les vérifications volontairement mutantes.
7. Quatrième lancement: `npm run checkpoint:002:emulator` est passé.

Conclusion: **la preuve émulateur complète est obtenue localement**, mais avec une condition importante: le chemin standard `firebase.json` pointe encore vers `C:`, qui reste presque plein. Pour rejouer confortablement le checkpoint, il faut libérer de l'espace sur `C:` ou utiliser explicitement une configuration locale temporaire hors repo.

Preuves locales écrites ou relues:

- `tmp/checkpoint-002/counts-local.json`
- `tmp/checkpoint-002/operational-boundary-local.json`
- `tmp/checkpoint-002/chantier-status-local.json`
- `tmp/checkpoint-002/client-update-local.json`
- `tmp/checkpoint-002/team-users-local.json`
- `tmp/checkpoint-002/team-rh-local.json`
- `tmp/checkpoint-002/email-local.json`
- `tmp/checkpoint-002/previsionnel-edits-local.json`
- `tmp/checkpoint-002/factures-local.json`
- `tmp/checkpoint-002/operational-lifecycle-local.json`
- `tmp/checkpoint-002/documents-local.json`
- `tmp/checkpoint-002/planning-local.json`
- `tmp/checkpoint-002/report-local.json`
- `tmp/checkpoint-002/analytics-snapshot-local.json`
- `tmp/checkpoint-002/checkpoint-audit-local.json`

## Diff local / sandbox

La commande de diff SQL Connect a été lancée en mode non interactif, sans migration ni déploiement:

```bash
firebase dataconnect:sql:diff --project sosson-sandbox --service sosson-sandbox-service --location europe-west9 --non-interactive
```

Résultat prouvé: **le schéma PostgreSQL sandbox ne correspond pas au schéma SQL Connect local**.

Le diff proposé par Firebase créerait ou modifierait notamment:

- `user`: ajout de champs profil/RH (`date_activation`, `date_modification`, `equipe_finale_id`, `poste`, `profil_statut`, etc.).
- `client`: ajout `origine_import`, `prenom`, `souhaits`, `notes`, `type_chantier_cible`.
- `chantier`: ajout `origine_import`.
- `devis`: création complète de la table.
- `document_attache`: ajout lien `devis_id` et `sha256`.
- domaines email: `email_thread`, `email_message`, `email_attachment`.
- domaines planning/RH: `sosson_team`, `sosson_team_member`, `sosson_team_leave_period`, `sosson_work_time_entry`, `sosson_payroll_period`, `planning_event`, `planning_assignment`, `planning_job_sheet`.
- domaines analytics/rapports: `analytics_snapshot`, `rapport`.
- domaines audit/import/checkpoint: `audit_event`, `checkpoint_run`, `checkpoint_step`, `checkpoint_artifact`, `checkpoint_decision`, `data_import_run`, `data_import_issue`, `entity_change_log`.

Conclusion: le prochain déploiement sandbox Data Connect est une vraie migration de schéma, pas une simple mise à jour mineure. Il faut une revue humaine du diff, une décision sur backups/PITR sandbox, puis un plan de vérification post-déploiement.

## Cartographie des tables

Classement:

- A: coeur métier indispensable.
- B: support workflow utile.
- C: audit / traçabilité.
- D: import / prévisionnel.
- E: analytics / reporting.
- F: temporaire local ou transitoire.
- G: suspect / test / inutile.

| Table | Classe | Rôle métier | Lectures principales | Écritures principales | Pages / scripts prouvés | Source de vérité | Risque suppression | Décision proposée |
|---|---:|---|---|---|---|---|---|---|
| `User` | A | Profil applicatif lié à Firebase Auth. | `GetCurrentUser`, `ListUsers`. | `ConvertTeamProfileSubmission`, scripts provisioning. | Auth, Équipe, onboarding. | SQL cible. | Critique. | Garder, provisionner sandbox. |
| `TeamProfileSubmission` | B | Demande de profil après première connexion. | `GetMyTeamProfileSubmission`, `ListTeamProfileSubmissions`. | `SubmitCurrentTeamProfile`, `ConvertTeamProfileSubmission`. | `/complete-profile`, `/profile-pending`, Équipe. | SQL cible. | Fort. | Garder, valider sandbox. |
| `SossonTeam` | B | Équipes finales / planning / RH. | `ListSossonTeams`. | `CreateSossonTeam`. | Équipe, Planning. | SQL cible. | Fort. | Garder, RBAC déjà local. |
| `SossonTeamMember` | B | Fiches membres internes. | `ListSossonTeamMembers`, `GetSossonTeamMember`. | `CreateSossonTeamMember`, `UpdateSossonTeamMember`. | Équipe, détail profil. | SQL cible. | Fort. | Garder, valider droits sandbox. |
| `SossonTeamLeavePeriod` | B | Congés / absences. | `ListSossonTeamLeavePeriods`. | `CreateSossonTeamLeavePeriod`. | Équipe, profil. | SQL cible. | Moyen. | Garder. |
| `SossonWorkTimeEntry` | B | Heures terrain / planning / paie préparatoire. | `ListSossonWorkTimeEntries`. | `CreateSossonWorkTimeEntry`. | Équipe, Planning. | SQL cible. | Moyen. | Garder. |
| `SossonPayrollPeriod` | B | Brouillon de préparation paie, pas bulletin légal. | `ListSossonPayrollPeriods`. | `PrepareSossonPayrollPeriod`. | Équipe. | SQL cible. | Moyen. | Garder documenté. |
| `Client` | A | Client/prospect opérationnel ou import prévisionnel. | `ListOperationalClients`, `GetClient`, queries prévisionnel. | `CreateClient`, `UpdateClient`, seeds. | Clients, Chantiers, Store. | SQL cible. | Critique. | Garder; durcir lectures détail. |
| `Chantier` | A | Dossier opérationnel confirmé. | `ListOperationalChantiers`, `GetChantier`. | `CreateChantier`, `UpdateChantierStatut`, seeds. | Chantiers, détail, Planning, Factures. | SQL cible. | Critique. | Garder; durcir origine/import sur détails. |
| `Devis` | A | Passage prospect/client vers chantier. | `ListDevis`, `GetDevis`. | `CreateDevis`, `UpdateDevisStatut`. | Lifecycle scripts, futur front. | SQL cible. | Fort. | Garder; brancher UI dédiée. |
| `Facture` | A | Factures fournisseurs rattachées chantier. | `ListFactures`, `ListFacturesByChantier`. | `CreateFacture`, `SetFactureStatut`. | Factures, détail chantier. | SQL cible. | Critique. | Garder; limiter lectures sensibles. |
| `DocumentFolder` | B | Classement documentaire. | `ListDocumentFolders`. | `CreateDocumentFolder`. | Documents. | SQL metadata cible. | Moyen. | Garder; valider Storage réel. |
| `DocumentAttache` | B | Metadata document / lien Storage / facture. | `ListDocumentsByChantier`, `GetDocumentAttache`. | `CreateDocumentAttache`, `LinkDocumentToFacture`, `MarkDocumentUploaded`. | Documents, Factures. | SQL metadata cible; binaire dans Storage. | Fort. | Garder; preuve Storage manquante. |
| `PrevisionnelImportBatch` | D | Lot d'import Excel prévisionnel. | Queries prévisionnel. | Seeds prévisionnel. | Prévisionnel, Statistiques. | SQL import. | Moyen. | Garder. |
| `PrevisionnelExercise` | D | Exercice Excel. | `ListPrevisionnelExercises`. | Seeds. | Prévisionnel, Stats. | SQL import. | Moyen. | Garder. |
| `ClientAlias` | D | Alias Excel client. | Queries prévisionnel. | Seeds. | Prévisionnel. | SQL import. | Faible à moyen. | Garder. |
| `PrevisionnelLine` | D | Ligne de prévisionnel. | `ListPrevisionnelLines`, sheet queries. | Seeds, update montants. | Prévisionnel/tableur. | SQL import éditable. | Moyen. | Garder. |
| `PrevisionnelMonthlyAmount` | D | Montants mensuels par ligne. | Sheet queries. | `UpdatePrevisionnelMonthlyAmount`, seeds. | Tableur prévisionnel. | SQL import éditable. | Moyen. | Garder; préserver cellule exacte. |
| `PrevisionnelLotAmount` | D | Montants par lot. | Sheet queries. | Seeds. | Prévisionnel. | SQL import. | Moyen. | Garder. |
| `PrevisionnelCellEdit` | D | Édition exacte de cellule Excel. | `ListPrevisionnelCellEdits`. | `UpsertPrevisionnelCellEdit`. | Tableur prévisionnel. | SQL override. | Moyen. | Garder. |
| `EmailThread` | B | Index de fil email. | `ListEmailThreads`, `ListEmailThreadsByChantier`. | `IndexEmailThread`. | Emails, détail chantier. | SQL index, contenu réel externe. | Moyen. | Garder; clarifier Graph vs index. |
| `EmailMessage` | B | Index message email. | `ListEmailMessages`. | `IndexEmailMessage`. | Emails. | SQL index. | Moyen. | Garder. |
| `EmailAttachment` | B | Metadata PJ email. | `ListEmailAttachments`. | `IndexEmailAttachment`. | Emails. | SQL metadata. | Moyen. | Garder. |
| `PlanningEvent` | B | Carte planning opérationnelle. | `ListPlanningEvents`, `ListPlanningEventsByChantier`. | `CreatePlanningEvent`, `UpdatePlanningEventDetails`, `CancelPlanningEvent`. | Planning, détail chantier. | SQL cible. | Fort. | Garder. |
| `PlanningAssignment` | B | Affectation équipe/collaborateur. | Planning queries. | `CreatePlanningAssignment`. | Planning. | SQL cible. | Fort. | Garder. |
| `PlanningJobSheet` | B | Fiche intervention liée planning. | Planning/RH queries. | `CreatePlanningJobSheet`, `CompletePlanningJobSheet`. | Planning, RH. | SQL cible. | Moyen. | Garder. |
| `AnalyticsSnapshot` | E | Photo calculée pour dashboard/stats. | `ListAnalyticsSnapshots`, `GetLatestAnalyticsSnapshot`. | `CreateAnalyticsSnapshot`. | Dashboard, Stats, Rapports. | Snapshot dérivé, pas vérité métier brute. | Moyen. | Garder comme cache daté. |
| `Rapport` | E | Metadata rapport généré. | `ListRapports`, `GetRapport`. | `CreateRapport`, `MarkRapportGenerated`. | Rapports. | SQL metadata; fichier hors SQL. | Moyen. | Garder; preuve UI incomplète. |
| `AuditEvent` | C | Journal d'événement audit. | `ListAuditEvents`. | `CreateAuditEvent`. | Scripts checkpoint. | SQL audit. | Moyen. | Garder; acteur à durcir. |
| `CheckpointRun` | C | Exécution checkpoint. | `ListCheckpointRuns`, `GetCheckpointRun`. | `CreateCheckpointRun`, `CompleteCheckpointRun`. | Scripts checkpoint. | SQL audit local/sandbox. | Moyen. | Garder. |
| `CheckpointStep` | C | Étape checkpoint. | `GetCheckpointRun`. | `UpsertCheckpointStep`. | Scripts checkpoint. | SQL audit. | Faible à moyen. | Garder. |
| `CheckpointArtifact` | C | Artefact/hash checkpoint. | `GetCheckpointRun`. | `CreateCheckpointArtifact`. | Scripts checkpoint. | SQL audit. | Faible à moyen. | Garder. |
| `CheckpointDecision` | C | Décision humaine checkpoint. | `ListCheckpointDecisions`. | `RecordCheckpointDecision`. | Scripts checkpoint. | SQL audit. | Moyen. | Garder. |
| `DataImportRun` | C | Run d'import de données. | `ListDataImportRuns`. | `CreateDataImportRun`, `CompleteDataImportRun`. | Scripts checkpoint/import. | SQL audit. | Moyen. | Garder. |
| `DataImportIssue` | C | Anomalie d'import. | `GetDataImportRun`. | `CreateDataImportIssue`. | Scripts checkpoint/import. | SQL audit. | Faible à moyen. | Garder. |
| `EntityChangeLog` | C | Changement entité. | `ListEntityChangeLogs`. | `CreateEntityChangeLog`. | Scripts checkpoint. | SQL audit. | Moyen. | Garder. |

Aucune table G "test inutile" n'est prouvée. Les tables C/E/D ne sont pas le coeur opérationnel, mais elles servent aux imports, preuves ou snapshots. Suppression déconseillée sans décision humaine.

## Queries et exposition

| Groupe | Opérations | Auth / contrôle | Risque | Action |
|---|---|---|---|---|
| Profil courant | `GetCurrentUser`, `GetMyTeamProfileSubmission` | `@auth(USER)`, borné à `auth.uid`. | Faible. | Garder. |
| RH sensible | `ListUsers`, `ListTeamProfileSubmissions`, `ListSossonTeams`, `ListSossonTeamMembers`, `GetSossonTeamMember`, `ListSossonTeamLeavePeriods`, `ListSossonWorkTimeEntries`, `ListSossonPayrollPeriods` | `@auth(USER)` + check SQL `User` rôle. | Moyen si non validé sandbox. | Valider sandbox avec vrais profils. |
| Opérationnel client/chantier | `ListOperationalClients`, `GetClient`, `ListOperationalChantiers`, `GetChantier` | Listes filtrées `origineImport: operationnel`; détails plus larges. | Moyen: détails non filtrés par origine. | Durcir ou documenter accès détail. |
| Devis/factures | `ListDevis`, `GetDevis`, `ListFactures`, `ListFacturesByChantier` | `@auth(USER)` surtout. | Moyen à fort: données financières visibles à tout utilisateur Firebase authentifié si pas de profil SQL requis. | Ajouter check `User` SQL et rôle serveur. |
| Documents | `ListDocumentFolders`, `ListDocumentsByChantier`, `GetDocumentAttache` | `@auth(USER)`. | Moyen: metadata potentiellement sensibles. | Ajouter check SQL/rôle. |
| Prévisionnel | Exercices, lignes, montants, cellules. | `@auth(USER)`. | Moyen: historique financier lisible trop largement. | Ajouter check SQL/rôle. |
| Emails | Threads, messages, attachments. | `@auth(USER)`. | Fort: métadonnées email sensibles. | Ajouter check SQL/rôle avant sandbox réelle. |
| Planning | `ListPlanningEvents`, `ListPlanningEventsByChantier`, assignments/job sheets | Plusieurs checks SQL rôle. | Moyen. | Valider sandbox. |
| Analytics/rapports | Snapshots, rapports. | `@auth(USER)`. | Moyen. | Ajouter check SQL/rôle si données financières. |
| Audit/import | Checkpoints, imports, change logs. | `@auth(USER)`. | Moyen: fuite d'informations internes. | Réserver aux rôles admin/gerant. |

### Annexe queries, opération par opération

Lecture du tableau:

- `SQL role`: la query exige un profil SQL `User` et un check de rôle serveur.
- `Auth seul`: la query exige Firebase Auth, mais pas encore de rôle SQL serveur dans l'opération.
- `OK local`: forme statique acceptée par les garde-fous repo; cela ne prouve pas la sandbox distante.

| Query | Ligne | Domaine | Contrôle | Risque | Action |
|---|---:|---|---|---|---|
| `GetCurrentUser` | 12 | Auth/profil | Auth borné `auth.uid` | Faible | Garder. |
| `ListUsers` | 29 | RH | SQL role | Moyen | Valider avec vrais users sandbox. |
| `GetCurrentTeamProfileSubmission` | 54 | Onboarding | Auth borné `auth.uid` | Faible | Garder. |
| `ListTeamProfileSubmissions` | 73 | Onboarding admin | SQL role `gerant` | Moyen | Valider sandbox. |
| `ListSossonTeams` | 99 | RH/planning | SQL role | Moyen | Garder. |
| `ListSossonWorkTimeEntries` | 154 | RH/heures | SQL role | Moyen | Garder. |
| `ListSossonPayrollPeriods` | 183 | RH/paie préparatoire | SQL role | Moyen | Garder. |
| `ListOperationalClients` | 212 | Clients | Auth seul + `origineImport=operationnel` | Moyen | Ajouter SQL role avant sandbox sérieuse. |
| `GetClient` | 234 | Clients | Auth seul | Moyen | Ajouter SQL role; décider filtre origine. |
| `ListOperationalChantiers` | 278 | Chantiers | Auth seul + `origineImport=operationnel` | Moyen | Ajouter SQL role. |
| `GetChantier` | 297 | Chantiers | Auth seul | Moyen | Ajouter SQL role; décider filtre origine. |
| `ListDevis` | 358 | Devis | Auth seul | Moyen | Ajouter SQL role. |
| `ListDevisByClient` | 383 | Devis | Auth seul | Moyen | Ajouter SQL role. |
| `ListDevisByChantier` | 406 | Devis | Auth seul | Moyen | Ajouter SQL role. |
| `ListFactures` | 431 | Factures | Auth seul | Fort | Ajouter SQL role. |
| `ListFacturesByStatut` | 455 | Factures | Auth seul | Fort | Ajouter SQL role. |
| `ListDocumentFolders` | 475 | Documents | Auth seul | Moyen | Ajouter SQL role. |
| `ListDocumentsAttaches` | 492 | Documents | Auth seul | Fort | Ajouter SQL role. |
| `ListDocumentsByChantier` | 542 | Documents | Auth seul | Fort | Ajouter SQL role. |
| `ListPrevisionnelExercises` | 571 | Prévisionnel | Auth seul | Moyen | Ajouter SQL role. |
| `ListPrevisionnelLinesByExercise` | 599 | Prévisionnel | Auth seul | Moyen | Ajouter SQL role. |
| `SearchClientAliases` | 640 | Prévisionnel | Auth seul | Moyen | Ajouter SQL role. |
| `ListPrevisionnelCellEdits` | 654 | Prévisionnel | Auth seul | Moyen | Ajouter SQL role. |
| `ListEmailThreads` | 672 | Email index | Auth seul | Fort | Ajouter SQL role avant données réelles. |
| `ListEmailThreadsByChantier` | 695 | Email index | Auth seul | Fort | Ajouter SQL role. |
| `ListUnreadEmailThreads` | 718 | Email index | Auth seul | Fort | Ajouter SQL role. |
| `GetEmailThread` | 740 | Email index/message | Auth seul | Fort | Ajouter SQL role. |
| `ListPlanningEventsByPeriod` | 792 | Planning | SQL role | Moyen | Valider sandbox. |
| `ListPlanningEventsByChantier` | 860 | Planning | SQL role | Moyen | Valider sandbox. |
| `ListPlanningJobSheetsByEvent` | 899 | Planning/RH | SQL role | Moyen | Valider sandbox. |
| `ListAnalyticsSnapshots` | 947 | Analytics | Auth seul | Moyen | Ajouter SQL role. |
| `GetAnalyticsSnapshot` | 973 | Analytics | Auth seul | Moyen | Ajouter SQL role. |
| `ListRapports` | 1009 | Rapports | Auth seul | Moyen | Ajouter SQL role. |
| `GetRapport` | 1033 | Rapports | Auth seul | Moyen | Ajouter SQL role. |
| `ListRecentAuditEvents` | 1073 | Audit | Auth seul | Moyen à fort | Réserver `gerant`. |
| `ListEntityChangeLogs` | 1097 | Audit | Auth seul | Moyen à fort | Réserver `gerant`. |
| `ListCheckpointRuns` | 1129 | Checkpoint | Auth seul | Moyen | Réserver admin/gerant. |
| `GetCheckpointRun` | 1152 | Checkpoint | Auth seul | Moyen | Réserver admin/gerant. |
| `ListDataImportRuns` | 1212 | Import | Auth seul | Moyen | Réserver admin/gerant. |
| `GetDataImportRun` | 1241 | Import | Auth seul | Moyen | Réserver admin/gerant. |

## Mutations et sécurité

Toutes les mutations auditées localement ont `@auth(level: USER)` et `@transaction`. Les mutations métier sensibles relisent un `currentUser: user(key: { id_expr: "auth.uid" }) @check(...) @redact` puis vérifient un rôle SQL.

| Groupe | Mutations | Tables écrites | Preuve locale | Risque résiduel |
|---|---|---|---|---|
| Onboarding | `SubmitCurrentTeamProfile`, `ConvertTeamProfileSubmission` | `TeamProfileSubmission`, `User`, parfois `SossonTeamMember` | `verify:team-users:dataconnect` prévu; garde statique OK. | À valider avec vrais Firebase Auth UIDs sandbox. |
| RH | `CreateSossonTeam`, `CreateSossonTeamMember`, `UpdateSossonTeamMember`, congés, heures, paie. | Tables RH. | `verify:team-rh:dataconnect` prévu; garde statique OK. | UI permissions encore localStorage; serveur prioritaire mais sandbox non prouvée. |
| Clients/chantiers/devis | `CreateClient`, `UpdateClient`, `CreateChantier`, `UpdateChantierStatut`, `CreateDevis`, `UpdateDevisStatut`. | `Client`, `Chantier`, `Devis`. | Vérifications locales prévues; garde statique OK. | Statuts/chaînes libres; à encadrer par enums ou checks métier. |
| Factures/documents | `CreateFacture`, `SetFactureStatut`, `CreateDocumentAttache`, `MarkDocumentUploaded`, liens facture. | `Facture`, `Document*`. | Vérifications locales prévues; garde statique OK. | Storage réel et antivirus/contrôle binaire non prouvés. |
| Prévisionnel | Update montants, cellules. | `Previsionnel*`. | `verify:previsionnel-edits:dataconnect` prévu. | Risque de confusion import historique vs opérationnel si UI floue. |
| Email/planning/rapports | Index emails, planning, rapports, analytics. | Tables support. | Scripts locaux prévus. | Email = index SQL, pas preuve d'envoi/réception Graph sauf module externe. |
| Audit/import | Checkpoint, import, change log. | Tables C. | `verify:checkpoint-audit:dataconnect` prévu. | `actorEmail` et champs texte peuvent être client-supplied; à borner davantage. |

### Annexe mutations, opération par opération

Constat statique: les 49 mutations ont `@auth(USER)` et `@transaction`. 48 relisent un `currentUser` SQL avec `@check` et `@redact`. L'exception est `SubmitCurrentTeamProfile`, volontairement self-service et bornée à `auth.uid`; elle ne crée pas de rôle applicatif.

| Mutation | Ligne | Domaine | Contrôle serveur | Preuve attendue | Risque résiduel |
|---|---:|---|---|---|---|
| `SubmitCurrentTeamProfile` | 12 | Onboarding | Auth self-service, clé `auth.uid` | `verify:team-users` | Pas de rôle créé; OK. |
| `ConvertTeamProfileSubmission` | 34 | Onboarding | SQL `gerant` | `verify:team-users` | Valider vrais UIDs sandbox. |
| `CreateSossonTeam` | 90 | RH | SQL `gerant` | `verify:team-rh` | Sandbox non prouvée. |
| `UpdateSossonTeam` | 122 | RH | SQL `gerant` | `verify:team-rh` ciblé | Sandbox non prouvée. |
| `CreateSossonTeamMember` | 154 | RH | SQL `gerant` | `verify:team-rh` | Données RH sensibles. |
| `UpdateSossonTeamMember` | 202 | RH | SQL `gerant` | `verify:team-rh` | Données RH sensibles. |
| `CreateSossonTeamLeavePeriod` | 246 | RH | SQL `gerant/assistante` | `verify:team-rh` | Dates/statuts à encadrer métier. |
| `CreateSossonWorkTimeEntry` | 275 | RH/planning | SQL `gerant/assistante/chef` | `verify:team-rh` | Heures déclaratives. |
| `CreateSossonPayrollPeriod` | 310 | RH/paie préparatoire | SQL `gerant/assistante` | `verify:team-rh` | Agrégat brouillon, pas bulletin légal. |
| `CreatePlanningJobSheet` | 346 | Planning | SQL `gerant/assistante/chef` | `verify:team-rh`, `verify:planning` | Storage preuve non prouvé. |
| `UpdatePlanningJobSheetProgress` | 389 | Planning | SQL `gerant/assistante/chef` | `verify:team-rh` | Statuts libres. |
| `CompletePlanningJobSheet` | 430 | Planning | SQL `gerant/assistante/chef` | `verify:team-rh` | Heures/preuves à contrôler. |
| `CreateClient` | 465 | Clients | SQL `gerant/assistante` | `verify:client-update`, lifecycle | Origine import à surveiller. |
| `UpdateClient` | 501 | Clients | SQL `gerant/assistante` | `verify:client-update` | Champs libres. |
| `CreateChantier` | 541 | Chantiers | SQL `gerant/assistante` | lifecycle | Origine import à surveiller. |
| `UpdateChantierStatut` | 573 | Chantiers | SQL `gerant/assistante/chef` | `verify:chantier-status` | Statut libre. |
| `CreateDevis` | 595 | Devis | SQL `gerant/assistante` | lifecycle | UI devis à compléter. |
| `UpdateDevisStatut` | 635 | Devis | SQL `gerant/assistante` | lifecycle | Statut libre. |
| `CreateFacture` | 660 | Factures | SQL `gerant/assistante` | `verify:factures` | Données financières. |
| `SetFactureStatut` | 694 | Factures | SQL `gerant/assistante` | `verify:factures` | Statut libre. |
| `CreateDocumentFolder` | 710 | Documents | SQL `gerant/assistante` | `verify:documents` | Storage réel manquant. |
| `CreateDocumentAttache` | 736 | Documents | SQL `gerant/assistante` | `verify:documents` | Metadata sans preuve binaire distante. |
| `UpdateDocumentAttacheLinks` | 780 | Documents | SQL `gerant/assistante` | `verify:documents` | Liens métier à contrôler. |
| `CreatePrevisionnelImportBatch` | 812 | Prévisionnel | SQL `gerant/assistante` | seed/checkpoint | À réserver aux imports maîtrisés. |
| `UpdatePrevisionnelMonthlyAmount` | 834 | Prévisionnel | SQL `gerant/assistante` | `verify:previsionnel-edits` | Édition historique. |
| `UpdatePrevisionnelLineAmounts` | 855 | Prévisionnel | SQL `gerant/assistante` | tableur | Cohérence total/mensuel à vérifier. |
| `LinkPrevisionnelLineToChantier` | 888 | Prévisionnel | SQL `gerant/assistante` | à renforcer | Risque mélange import/opérationnel. |
| `UpsertPrevisionnelCellEdit` | 905 | Prévisionnel | SQL `gerant/assistante` | `verify:previsionnel-edits` | Fallback localStorage à signaler. |
| `CreateEmailThread` | 932 | Email index | SQL `gerant/assistante` | `verify:email` | Index, pas boîte mail source. |
| `UpdateEmailThreadStatusAndLinks` | 970 | Email index | SQL `gerant/assistante` | `verify:email` | Liens chantier/client. |
| `CreateEmailMessage` | 994 | Email index | SQL `gerant/assistante` | `verify:email` | Corps potentiellement hors SQL. |
| `CreateEmailAttachment` | 1038 | Email index | SQL `gerant/assistante` | `verify:email` | Storage/PJ réelle à prouver. |
| `CreatePlanningEvent` | 1070 | Planning | SQL `gerant/assistante/chef` | `verify:planning` | Dates/statuts libres. |
| `UpdatePlanningEventStatus` | 1102 | Planning | SQL `gerant/assistante/chef` | `verify:planning` | Statut libre. |
| `UpdatePlanningEventDetails` | 1121 | Planning | SQL `gerant/assistante/chef` | `verify:planning` | Cohérence affectations. |
| `CancelPlanningEvent` | 1154 | Planning | SQL `gerant/assistante/chef` | `verify:planning` | Annulation conserve ligne. |
| `CreatePlanningAssignment` | 1174 | Planning | SQL `gerant/assistante/chef` | `verify:planning` | Rattachement équipe/user. |
| `UpdatePlanningAssignmentStatus` | 1200 | Planning | SQL `gerant/assistante/chef` | `verify:planning` ciblé | Statut libre. |
| `CreateAnalyticsSnapshot` | 1219 | Analytics | SQL `gerant/assistante` | `snapshot:analytics` | Snapshot dérivé. |
| `CreateRapport` | 1262 | Rapports | SQL `gerant/assistante` | `verify:reports` | Artefact réel à prouver. |
| `MarkRapportGenerated` | 1303 | Rapports | SQL `gerant/assistante` | `verify:reports` | Hash/chemin fichier. |
| `CreateAuditEvent` | 1335 | Audit | SQL `gerant/assistante` | `verify:checkpoint-audit` | `actorEmail` client-supplied. |
| `CreateCheckpointRun` | 1373 | Checkpoint | SQL `gerant/assistante` | `verify:checkpoint-audit` | Audit interne. |
| `CreateCheckpointStep` | 1407 | Checkpoint | SQL `gerant/assistante` | `verify:checkpoint-audit` | Audit interne. |
| `CreateCheckpointArtifact` | 1445 | Checkpoint | SQL `gerant/assistante` | `verify:checkpoint-audit` | Hash/chemin à préserver. |
| `CreateCheckpointDecision` | 1477 | Checkpoint | SQL `gerant/assistante` | `verify:checkpoint-audit` | Décision humaine. |
| `CreateDataImportRun` | 1503 | Import | SQL `gerant/assistante` | `verify:checkpoint-audit` | Imports à gouverner. |
| `CreateDataImportIssue` | 1549 | Import | SQL `gerant/assistante` | `verify:checkpoint-audit` | Audit import. |
| `CreateEntityChangeLog` | 1581 | Audit | SQL `gerant/assistante` | `verify:checkpoint-audit` | `actorEmail` client-supplied. |

## Scripts de preuve et limites

| Script | Mode | But | Écritures | Relectures/preuves | Risque / limite |
|---|---|---|---|---|---|
| `emulators:dataconnect` | Local | Lance Auth + Data Connect emulator. | État PGlite local. | Ports 9099/9399. | Dépend de l'espace disque local. |
| `reset:dataconnect:local` | Local destructif borné | Supprime `dataconnect/.dataconnect/pgliteData`. | Suppression locale uniquement. | Message de confirmation. | Ne pas confondre avec sandbox. |
| `seed:dataconnect` | Local | Seed opérationnel. | Clients/chantiers/factures locaux. | Scripts verify. | Nécessite émulateur. |
| `seed:previsionnel:dataconnect` | Local | Seed prévisionnel chunké. | Tables prévisionnelles locales. | Vérifications prévisionnel. | Lourd; a échoué si `C:` plein. |
| `checkpoint:002:emulator` | Local | Preuve complète workflow. | Beaucoup de tables locales. | Fichiers `tmp/checkpoint-002/*-local.json`. | Non prouvé complet au 2026-05-21. |
| `verify:operational-boundary:dataconnect` | Local | Séparation opérationnel/prévisionnel. | Aucune ou temporaire selon script. | `operational-boundary-local.json`. | Échoue si base locale polluée. |
| `verify:operational-lifecycle:dataconnect` | Local | Prospect/client/devis/chantier/factures. | Tables coeur métier. | `operational-lifecycle-local.json`. | Non relancé après blocage disque. |
| `verify:team-users:dataconnect` | Local | Onboarding et conversion User. | `TeamProfileSubmission`, `User`. | `team-users-local.json`. | Sandbox vrais UIDs manquants. |
| `verify:team-rh:dataconnect` | Local | RH, équipes, congés, heures, paie, job sheet. | Tables RH/planning. | `team-rh-local.json`. | Données sensibles; sandbox à valider. |
| `verify:factures:dataconnect` | Local | Création/statut facture. | `Facture`. | `factures-local.json`. | Lecture factures à durcir. |
| `verify:email:dataconnect` | Local | Index email. | `Email*`. | `email-local.json`. | Ne prouve pas Outlook complet. |
| `verify:documents:dataconnect` | Local | Metadata documents. | `Document*`. | `documents-local.json`. | Ne touche pas Storage distant. |
| `verify:planning:dataconnect` | Local | Planning create/update/cancel. | `Planning*`. | `planning-local.json`. | À relire après migration sandbox. |
| `verify:reports:dataconnect` | Local | Rapport + artefact local hashé. | `Rapport`, `AnalyticsSnapshot`. | `report-local.json`. | Artefact local, pas Storage. |
| `snapshot:analytics:dataconnect` | Local | Snapshot analytics. | `AnalyticsSnapshot`. | `analytics-snapshot-local.json`. | Snapshot dérivé. |
| `verify:checkpoint-audit:dataconnect` | Local | Audit/checkpoint/import/change log. | Tables audit. | `checkpoint-audit-local.json`. | Lectures audit à réserver. |
| `seed:sandbox -- --dry-run` | Dry-run distant | Liste actions seed sandbox. | Aucune. | JSON sous `tmp`. | Ne prouve pas seed réel. |
| `provision:sql-users -- --dry-run` | Dry-run | Vérifie format profils. | Aucune. | Sortie masquée. | Ne crée aucun `User`. |
| `count:dataconnect -- --dry-run` | Dry-run | Vérifie commande de comptage. | Aucune. | JSON dry-run. | Ne lit pas la sandbox. |

## Front et fallbacks

| Page | Source réelle aujourd'hui | Écritures SQL | Fallbacks / illusion possible | Décision |
|---|---|---|---|---|
| Auth | Firebase Auth, puis SQL `GetCurrentUser`, Firestore fallback, seed dev opt-in. | Soumission profil SQL. | Firestore transitoire; seed local en dev. | Garder mais retirer Firestore quand profils SQL sandbox OK. |
| Dashboard | Store SQL si disponible, analytics/prévisionnel SQL sinon données TS. | Aucune. | Peut afficher données locales sans persistance. | Afficher clairement source active. |
| Clients | SQL si Data Connect actif, sinon store local. | `CreateClient`, `UpdateClient`. | Store local peut donner impression de sauvegarde. | Garder temporaire, signaler fallback. |
| Chantiers | SQL si actif, sinon local. | `CreateChantier`, `UpdateChantierStatut`. | Même risque. | Garder temporaire, migrer source unique. |
| Devis | Modèle SQL présent; UI dédiée non prouvée. | Mutations SQL présentes. | Workflow incomplet côté écran. | Priorité avant prod. |
| Factures | SQL mutations disponibles. | `CreateFacture`, `SetFactureStatut`. | Fallback local annoncé selon page. | Garder; durcir lectures. |
| Documents | SQL metadata; Storage réel à vérifier. | Document mutations. | Metadata sans binaire uploadé peut tromper. | Exiger preuve Storage. |
| Emails | Index SQL + seeds locaux + Graph local. | Index thread/message/PJ. | SQL n'est pas la boîte mail; c'est un index. | Clarifier UI et runbook. |
| Planning | SQL si source active, sinon localStorage. | Planning/RH mutations. | LocalStorage persistant navigateur seulement. | Garder temporaire, signaler source. |
| Prévisionnel | SQL si dispo, sinon TS/localStorage. | Montants/cell edits SQL. | Fallback localStorage pour éditions. | Garder mais bannir silence fallback. |
| Statistiques | SQL snapshots/prévisionnel, sinon TS/store. | Snapshot via scripts/adapters. | Snapshots dérivés pas vérité brute. | Garder comme analytics. |
| Rapports | SQL metadata partielle, rapports hardcodés fallback. | Création/mark generated selon adapter. | UI peut afficher rapports non générés réellement. | Brancher preuve bout en bout. |
| Équipe | SQL RH + droits UI localStorage. | RH/onboarding SQL. | Permissions UI locales ne remplacent pas RBAC serveur. | Garder; serveur prime. |
| Paramètres | Placeholder / local. | Aucune. | Aucun effet durable. | Documenter comme non métier. |
| COWORK | localStorage/store. | Non prouvé SQL. | Forte illusion possible. | Migrer ou marquer local. |

## Risques bloquants avant sandbox sérieuse

1. Backups Cloud SQL sandbox désactivés.
2. Diff local/sandbox important: beaucoup de tables/champs locaux ne sont pas encore en base sandbox.
3. Certaines lectures sensibles restent protégées seulement par Firebase Auth, pas par un profil SQL `User` et un rôle serveur.
4. Profils `User` sandbox non prouvés avec de vrais `auth.uid`.
5. Storage documents distant non prouvé de bout en bout.
6. Disque `C:` local presque plein: le checkpoint ne se rejoue pas confortablement avec le `dataDir` standard.

## Risques bloquants avant production

1. Production non déployée/validée.
2. Pas de preuve de backup restore.
3. Pas de PITR prouvé.
4. Pas de HA Cloud SQL prouvée.
5. Pas de RPO/RTO métier validés.
6. Fallbacks front encore nombreux.
7. RBAC de lecture à compléter sur email, documents, finance, audit, analytics.
8. Runbook rollback/restauration non testé.

## Explication junior-friendly

Une base de données PostgreSQL est le classeur central qui garde les vraies données. SQL Connect est la porte contrôlée entre l'app React/Firebase et ce classeur. L'émulateur est une copie locale jetable pour tester sans risque. La sandbox est le vrai environnement de test dans Google Cloud. La production sera l'environnement utilisé pour le vrai travail.

Un fallback local est une roue de secours dans le navigateur ou dans des fichiers de seed. Il peut aider à développer, mais il ne prouve pas que les données sont sauvées dans la base. Pour dire "c'est sauvegardé", il faut une écriture SQL réussie puis une relecture SQL qui retrouve la donnée.

Un backup est une photo de la base à un moment donné. Le PITR permet de revenir à une minute précise. La HA réduit l'arrêt de service si une zone Google Cloud tombe. Un restore test prouve qu'un backup est vraiment récupérable.

## Sources officielles consultées

- Firebase SQL Connect schemas: https://firebase.google.com/docs/sql-connect/schemas-guide
- Firebase SQL Connect deploy/manage: https://firebase.google.com/docs/sql-connect/manage-schemas-and-connectors
- Firebase SQL Connect authorization/security: https://firebase.google.com/docs/sql-connect/authorization-and-security
- Firebase SQL Connect emulator/CI: https://firebase.google.com/docs/sql-connect/data-connect-emulator-suite
- Cloud SQL PostgreSQL backups: https://docs.cloud.google.com/sql/docs/postgres/backup-recovery/backups
- Cloud SQL PostgreSQL PITR: https://docs.cloud.google.com/sql/docs/postgres/backup-recovery/configure-pitr
- Cloud SQL PostgreSQL HA: https://docs.cloud.google.com/sql/docs/postgres/high-availability
