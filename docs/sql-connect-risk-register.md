# Registre des risques SQL Connect

> Statut: registre pré-sandbox  
> Date: 2026-05-21  
> Portée: local, sandbox, future production.

| ID | Risque | Sévérité | Probabilité | Preuve | Impact | Mitigation | Statut | Décision humaine |
|---|---|---:|---:|---|---|---|---|---|
| R-001 | Backups Cloud SQL sandbox désactivés. | Haute | Haute | `backupConfiguration.enabled: false`. | Perte des données sandbox si seed réel ou test important. | Activer backups avant seed réel significatif, puis tester restauration. | Ouvert | Oui. |
| R-002 | PITR non prouvé. | Haute | Moyenne | Pas de champ PITR actif observé; backup désactivé. | Impossible de revenir à une minute précise. | Activer backups/PITR, définir rétention, tester restore. | Ouvert | Oui. |
| R-003 | HA Cloud SQL absente. | Moyenne sandbox, haute prod | Haute | `availabilityType: ZONAL`. | Coupure si zone indisponible. | Décider HA avant production; sandbox peut rester zonal si accepté. | Ouvert | Oui. |
| R-004 | Deletion protection désactivée. | Haute | Moyenne | `deletionProtectionEnabled: false`. | Suppression accidentelle plus facile. | Activer avant données importantes. | Ouvert | Oui. |
| R-005 | Storage auto-resize désactivé. | Moyenne | Moyenne | `storageAutoResize: false`, disque 10 Go. | Blocage écriture si disque plein. | Activer auto-resize ou surveiller stockage. | Ouvert | Oui. |
| R-006 | Émulateur complet fragile sur `C:` plein. | Moyenne | Haute tant que disque plein | Premier échec `No space left on device`; preuve complète obtenue ensuite avec PGlite temporaire sur `E:` et patch du checkpoint. | Rejouer le checkpoint standard peut échouer sur la machine actuelle. | Libérer plusieurs Go sur `C:` ou formaliser un chemin local plus spacieux. | Partiellement mitigé | Oui pour choix durable. |
| R-007 | Lectures sensibles protégées par `@auth` seul. | Haute | Moyenne | Audit `queries.gql`: emails, factures, documents, analytics, audit/import principalement `@auth(USER)`. | Utilisateur Firebase authentifié mais non autorisé pourrait lire trop large si connecteur exposé. | Ajouter `currentUser` SQL + checks de rôle serveur. | Ouvert | Oui pour portée RBAC. |
| R-008 | Détails client/chantier moins filtrés que listes opérationnelles. | Moyenne | Moyenne | Listes filtrées `origineImport: operationnel`; `GetClient`/`GetChantier` plus larges. | Mélange opérationnel/prévisionnel possible par accès direct ID. | Ajouter filtre ou décision explicite. | Ouvert | Oui. |
| R-009 | Profils SQL `User` sandbox non prouvés. | Haute | Haute | `seed_data.gql` ne crée pas les users; provisioning réel non lancé. | RBAC serveur impossible à valider avec vrais rôles. | Provisionner UIDs Firebase réels en sandbox après validation. | Ouvert | Oui. |
| R-010 | Front encore hybride. | Haute | Haute | Audit sources front: 55 imports locaux/seeds, 27 `localStorage`, 3 Firestore. | Illusion de persistance SQL. | Afficher source active, migrer page par page, supprimer fallback silencieux. | Ouvert | Oui. |
| R-011 | COWORK non raccordé SQL prouvé. | Moyenne | Haute | Cartographie front: localStorage/store. | Données terrain possiblement locales seulement. | Définir modèle SQL ou marquer local explicitement. | Ouvert | Oui. |
| R-012 | Documents: metadata SQL sans preuve binaire Storage complète. | Haute | Moyenne | Script `verify:documents` local ne touche pas Storage distant. | Fausse impression qu'un document est sauvegardé. | Tester upload Storage + metadata SQL + droits + restore. | Ouvert | Oui. |
| R-013 | Rapports UI partiellement hardcodés. | Moyenne | Moyenne | Page rapports lit/affiche encore des rapports locaux selon audit. | Rapport affiché sans artefact généré réel. | Brancher `MarkRapportGenerated` depuis UI et afficher source. | Ouvert | Oui. |
| R-014 | Statuts et types en chaînes libres. | Moyenne | Moyenne | Plusieurs champs statut/type en `String`; mutations acceptent valeurs libres. | Incohérences métier et analytics faussées. | Introduire enums SQL Connect ou checks métier ciblés. | Ouvert | Oui. |
| R-015 | Champs audit acteur partiellement client-supplied. | Moyenne | Moyenne | `actorEmail`, `author` et champs similaires peuvent venir du client selon opérations. | Journal moins fiable. | Dériver plus de champs depuis `auth.uid`/`User` serveur. | Ouvert | Oui. |
| R-016 | GCP CLI projet courant différent de sandbox. | Moyenne | Moyenne | `gcloud config get-value project` retourne `tatmadeinnormandie`. | Commandes sans `--project` risquées. | Toujours passer `--project sosson-sandbox` ou `sosson-prod`. | Ouvert | Oui. |
| R-017 | Production guard repo OK mais validation prod absente. | Critique | Haute | Aucun déploiement prod demandé ni prouvé. | Perte données / downtime si prod lancée trop tôt. | Garder production bloquée jusqu'à checklist. | Ouvert | Oui. |
| R-018 | Diff local/sandbox important. | Haute | Haute | `firebase dataconnect:sql:diff ...` indique que PostgreSQL sandbox ne correspond pas au schéma local. | Déploiement sandbox créerait/altérerait beaucoup de tables/champs. | Archiver le diff, le revoir humainement, décider backups/PITR puis smoke tests. | Ouvert | Oui. |
| R-019 | Base sandbox petite (`db-f1-micro`). | Moyenne | Moyenne | `tier: db-f1-micro`. | Tests lourds ou imports prévisionnel peuvent être lents/fragiles. | Accepter pour sandbox ou monter tier temporairement. | Ouvert | Oui. |
| R-020 | Fallback Firestore profil encore présent. | Moyenne | Moyenne | `src/lib/auth.ts`, `check:firestore-boundary` confirme usage limité. | Deux sources de profil pendant transition. | Retirer après validation SQL `User`. | Ouvert | Oui. |
| R-021 | Migration sandbox large avant seed réel. | Haute | Haute | Diff attendu: `devis`, email, planning/RH, analytics, rapports, audit/checkpoint/import, champs `origine_import`. | Risque d'impact sur données sandbox existantes et sur connecteur si non relu après déploiement. | Déployer uniquement après validation humaine, backup strategy, puis vérifier chaque workflow. | Ouvert | Oui. |
| R-022 | Ordre de checkpoint local pouvait invalider le comptage propre. | Moyenne | Corrigée localement | Le comptage attendait 3 clients/4 chantiers après `verify:planning`, qui crée un client et un chantier. | Faux échec de checkpoint, confusion sur pollution locale. | Comptage déplacé avant les vérifications mutantes. | Mitigé localement | Non, sauf revue code. |

## Décisions immédiates recommandées

1. Décider si la sandbox doit avoir backups/PITR avant tout seed réel.
2. Décider si les lectures email/facture/document/audit doivent être durcies avant le prochain déploiement sandbox.
3. Décider où libérer de l'espace local pour rejouer l'émulateur complet.
4. Décider quels utilisateurs Firebase réels deviendront `User` SQL sandbox.
5. Décider la politique de fallback visible dans l'UI: jamais silencieux, toujours indiqué.
