# 09 - Roadmap priorisee

> Statut: draft  
> Derniere revision: 2026-05-16  
> Portee: roadmap actionnable issue du checkpoint 001.

## P0 - Securite / stabilite immediate

| Probleme | Impact | Fichiers | Solution | Complexite | Risque | Validation |
|---|---|---|---|---|---|---|
| Fallback auth seed quand Firebase echoue | Acces local non fiable | `src/lib/auth.ts`, `LoginPage.tsx` | Fallback opt-in seulement | Faible | Peut bloquer comptes sans profil | Login Firebase reel OK, demo cachee par defaut |
| Regles Firestore/Storage trop larges | Tout utilisateur authentifie peut tout lire/ecrire | `firestore.rules`, `storage.rules` | Deny par defaut, lecture profil propre uniquement | Faible | Peut bloquer usages non documentes | Deployer en sandbox et tester login |
| Lint bloquant | CI/qualite instable | `MicrosoftCallbackPage.tsx` | Initialiser l'etat avant effect | Faible | Faible | `npm run lint` OK |

## P1 - Brancher reellement le front a SQL Connect

| Probleme | Impact | Fichiers | Solution | Complexite | Risque | Validation |
|---|---|---|---|---|---|---|
| Profil applicatif encore Firestore | RBAC SQL impossible | `auth.ts`, `queries.gql`, `mutations.gql` | Lire `GetCurrentUser`, provisioning controle | Moyen | Migration comptes | Login + role SQL fonctionnels |
| Store global hybride | Donnees SQL/local melangees | `src/lib/store.tsx`, pages | Hooks metier par domaine | Moyen | Regressions UI | Page source clairement affichee |
| Clients/Chantiers dependants IDs locaux | Vues fausses avec UUID SQL | pages clients/chantiers | Lier previsionnel par relation SQL | Moyen | Moyen | Detail client/chantier coherent SQL |
| Mutations seulement `@auth(USER)` | Ecriture par tout user connecte | `mutations.gql` | Checks serveur par role | Moyen | Generation SDK | Mutations refusees pour roles non autorises |

## P2 - Modele data metier complet

| Probleme | Impact | Fichiers | Solution | Complexite | Risque | Validation |
|---|---|---|---|---|---|---|
| Historique previsionnel dans tables principales | Liste operationnelle polluee | `schema.gql`, seeds, queries | Champ source ou queries separees | Moyen | Migration seed | Listes operationnelles filtrees |
| Documents sans Storage durable | Perte fichiers apres refresh | `DocumentsPage.tsx`, Storage, schema | Upload Storage + metadata SQL | Moyen | Securite fichiers | Fichier retelechargeable apres refresh |
| Planning/equipe local | Produit incomplet | pages equipe/planning | Tables et operations dediees | Elevee | Scope | Donnees persistantes |

## P3 - Qualite produit / UX metier

- Standardiser loading/error/empty.
- Afficher les brouillons non synchronises.
- Ajouter pagination/filtrage serveur.
- Appliquer les droits create/edit/admin aux actions UI.
- Reduire les gros fichiers page par extraction de composants metier.

## P4 - Exploitation / monitoring / couts

- Alertes Cloud SQL/Data Connect.
- Budget alerts GCP/Firebase.
- Logs d'erreur front et backend.
- Runbook seed sandbox.
- Revue des limites queries et taille bundles.

## P5 - Production readiness

- Build prod + lint + smoke complets.
- Regles Firebase deployees en sandbox puis validees.
- RBAC serveur actif.
- Secrets dans Secret Manager.
- Backups Cloud SQL verifies.
- Procedure rollback documentee.
