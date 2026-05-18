# 07 - Frontend state

> Statut: draft  
> Derniere revision: 2026-05-17  
> Portee: etat du front React, sources de donnees et robustesse.

## Stack reelle

- React 19
- Vite 6
- TypeScript 6
- TailwindCSS 4
- React Router 7
- Recharts
- React Dropzone

## Auth et routing

`AppLayout` protege les routes principales. Le provider ecoute maintenant `onAuthChange` et expose `authInitializing` pour eviter une redirection login pendant la rehydratation Firebase.

Le fallback auth local est desactive par defaut via `VITE_ENABLE_LOCAL_AUTH_FALLBACK=false`. Il ne doit servir qu'au developpement explicite et jamais en production.

## Page -> source actuelle -> cible

| Page | Source actuelle | Cible SQL Connect |
|---|---|---|
| Dashboard | Store chantiers/factures + adapter previsionnel SQL ou TS | Hooks SQL unifies, fallback explicite. |
| Chantiers | Store global + lignes previsionnelles locales | `Chantier` SQL + filtres operationnels. |
| Detail chantier | Store global + factures store + images locales | `GetChantier` SQL + documents/factures SQL. |
| Clients | Store global + modele Excel local | `Client` SQL + alias/previsionnel lie. |
| Detail client | Store global + chantiers locaux | `GetClient` SQL + agregats serveur ou calculs controles. |
| Factures | Store global, adapter mutations SQL conditionnelles | Mutations SQL par defaut, brouillon local explicite si offline. |
| Documents | Adapter SQL metadata partiel + fichiers memoire/localStorage | Firebase Storage + `DocumentAttache` SQL. |
| Emails | Seeds + serveur local Outlook `localhost:8787` | Backend Graph securise, SQL metadata emails. |
| Planning | SQL partiel: lecture par periode, creation, modification et deplacement de cartes si Data Connect est actif; localStorage seulement en fallback visible | Modele planning/equipe persistant avec annulation/suppression et historique. |
| Previsionnel | LocalStorage + adapter SQL dans tableur | SQL source principale, localStorage brouillon. |
| Statistiques | Adapter previsionnel SQL ou TS fallback | Couche analytique commune avec Dashboard. |
| Equipe | Profils applicatifs lus via `ListUsers` si SQL Connect repond; equipes, membres, conges et matrice droits en localStorage | Module equipe/RBAC serveur complet. |

## Risques front

- Les actions `create/edit/admin` sont gardees cote UI sur les pages principales, et les mutations SQL Connect sensibles ont maintenant des checks de role serveur locaux. Le point faible restant est la validation sandbox avec vrais profils SQL `User` et la couverture des modules encore locaux.
- Les permissions en localStorage sont UX seulement, pas une securite. Elles sont maintenant normalisees pour ne pouvoir que restreindre un role, jamais l'elever au-dessus de `defaultAccessMatrix`.
- Les appels SQL Connect sont maintenant regroupes dans `src/features/*`, mais les calculs d'agregats restent encore dans certaines pages.
- Les pages clients/chantiers melangent IDs UUID SQL et IDs locaux issus du previsionnel.
- Les documents importes ne sont pas durables tant que Storage n'est pas branche.

## Fondations a appliquer

1. Creer des hooks metier par domaine: clients, chantiers, factures, previsionnel, documents.
2. Standardiser `loading/error/empty/source`.
3. Afficher clairement les brouillons locaux non synchronises.
4. Appliquer `canAccessPage` sur les boutons et formulaires, pas seulement les routes.
5. Retirer localStorage des donnees metier durables.

## Gardes UI deja poses

- `FacturesPage` bloque la creation et les changements de statut si le role courant n'a pas `factures.create` ou `factures.edit`.
- `DocumentsPage` bloque la creation de dossiers, l'import de fichiers et le classement si le role courant n'a pas `documents.create` ou `documents.edit`.
- `ClientsPage` bloque la creation locale si le role courant n'a pas `clients.create`.
- `ChantiersPage` masque l'action de creation si le role courant n'a pas `chantiers.create`.
- `EquipePage` bloque la creation/suppression d'equipes, membres, conges et modification de la matrice si le role courant n'a pas `equipe.create`, `equipe.edit` ou `equipe.admin`.
- Ces gardes reduisent les erreurs d'interface et les brouillons locaux abusifs. Ils ne remplacent pas les regles serveur SQL Connect/Storage.

## Frontiere SQL Connect actuelle

Les pages ne doivent pas importer directement `@dataconnect/generated`. Les appels SQL passent par:

- `src/features/auth/sqlUserProfile.ts`
- `src/features/operations/operationalAdapters.ts`
- `src/features/operations/useOperationalData.ts`
- `src/features/factures/factureSql.ts`
- `src/features/documents/documentSql.ts`
- `src/features/previsionnel/previsionnelSql.ts`
- `src/features/team/teamSql.ts`

Le garde-fou `npm run check:page-dataconnect-imports` bloque une regression sur `src/pages`.

## Etat de donnees standardise

Le type commun est dans `src/features/dataState.ts`.
Il formalise pour chaque domaine:

- `source`: `dataconnect`, `excel`, `seed` ou `local`;
- `status`: `idle`, `loading`, `ready`, `empty` ou `error`;
- `error`: message normalise ou `null`;
- `hasUnsyncedLocalChanges`: vrai quand la source n'est pas SQL Connect ou quand un brouillon local est en cours.

Le store expose maintenant `operationalDataState` en plus des listes historiques `clients`, `chantiers` et `factures`.
Le premier hook metier `useOperationalData` lit cette forme standardisee pour exposer clients, chantiers, factures, `status`, `source`, `error`, `isLoading`, `isEmpty` et `hasUnsyncedLocalChanges`.
`DashboardPage`, `FacturesPage`, `ClientsPage` et `ChantiersPage` consomment maintenant ce hook pour leur lecture operationnelle; les pages gardent seulement les actions d'ecriture du store pendant la transition.
C'est une etape de transition: les pages peuvent continuer a lire les listes existantes, mais les prochains hooks metier doivent reprendre cette forme pour eviter les variantes locales de `loading/error/empty/source`.
