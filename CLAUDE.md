# CLAUDE.md — Sosson
## Le livre de bord complet du projet

> **Usage** : Ce document est la référence exhaustive du projet `sosson`.
> Il est structuré comme un livre : chaque chapitre couvre un aspect précis avec
> description, décisions, et code associé. Codex ou tout autre agent IA doit lire
> ce fichier en priorité avant d'intervenir sur le projet.
>
> **Dernière mise à jour** : 23 avril 2026
> **Version** : 0.2.1
>
> **Directive active (2026-04-23)** : la phase "démo/MVP" est abandonnée.
> Les références à une démo, à un MVP, à "avant lundi", ou à une roadmap post-démo
> doivent être lues comme de l'historique. Elles ne doivent plus piloter les priorités
> du projet. La trajectoire active est le développement continu du produit, aligné avec
> `documentation.md` et `docs/`.

> **Note d'audit ajoutée le 2026-04-23 01:42:02 +02:00** :
> depuis la connexion Firebase jusqu'à l'initialisation SQL Connect locale,
> le repo a été rebasculé d'une logique démo vers une logique produit.
> Les environnements `sosson-sandbox` et `sosson-prod` existent, SQL Connect / Data Connect
> est actif dans les deux en `europe-west9`, l'initialisation locale a été faite une seule fois
> avec `sosson-sandbox`, et les dossiers de skills Firebase sont conservés localement mais exclus de Git.

---

## Table des matières

1. [Vision et contexte](#chapitre-1--vision-et-contexte)
2. [Architecture technique](#chapitre-2--architecture-technique)
3. [Structure du projet](#chapitre-3--structure-du-projet)
4. [Stack et dépendances](#chapitre-4--stack-et-dépendances)
5. [Environnements Firebase](#chapitre-5--environnements-firebase)
6. [Données de démonstration (seed)](#chapitre-6--données-de-démonstration-seed)
7. [Authentification](#chapitre-7--authentification)
8. [State global (AppProvider)](#chapitre-8--state-global-appprovider)
9. [Routing et layout](#chapitre-9--routing-et-layout)
10. [Pages — Login](#chapitre-10--pages--login)
11. [Pages — Dashboard gérant](#chapitre-11--pages--dashboard-gérant)
12. [Pages — Liste des chantiers](#chapitre-12--pages--liste-des-chantiers)
13. [Pages — Fiche chantier (pièce maîtresse)](#chapitre-13--pages--fiche-chantier-pièce-maîtresse)
14. [Pages — Clients](#chapitre-14--pages--clients)
15. [Pages — Factures](#chapitre-15--pages--factures)
16. [Pages — Emails](#chapitre-16--pages--emails)
17. [Pages — Planning](#chapitre-17--pages--planning)
18. [Système de déploiement](#chapitre-18--système-de-déploiement)
19. [Archive de la phase démo](#chapitre-19--archive-de-la-phase-démo)
20. [Périmètre historique écarté](#chapitre-20--périmètre-historique-écarté)
21. [Orientation active](#chapitre-21--orientation-active)

---

## Chapitre 1 — Vision et contexte

### 1.1 Qu'est-ce que Sosson ?

Sosson est un **hub opérationnel interne** développé pour une unique PME française
du secteur du bâtiment (30 à 50 salariés). Ce n'est **pas** un SaaS multi-tenant.

**Le problème résolu** : l'équipe est éparpillée sur Excel, Trello, WhatsApp, Gmail,
Dropbox, un logiciel de facturation, un scanner papier. L'information est fragmentée.
Le gérant n'a aucune vision globale. Les chefs de chantier ne savent pas ce que le
bureau a envoyé. Le bureau ne sait pas ce qui se passe sur site.

**La solution** : un seul endroit pour centraliser les dossiers chantiers, les emails,
les documents, les comptes-rendus terrain, le planning, et extraire intelligemment de
la valeur de cette masse (catégorisation des coûts, dashboards prévisionnels, alertes).

### 1.2 Orientation actuelle du projet

Le projet n'est plus cadré comme une démo ni comme un MVP compressé.
La priorité est désormais de construire le produit proprement, en réduisant la dette
de transition et en branchant progressivement les briques réelles de l'architecture
cible (Postgres / SQL Connect, Firebase Auth, Storage, Functions, IA).

### 1.3 Parcours fonctionnel actuellement représenté dans le front

```
Login → Dashboard gérant → Liste chantiers → Fiche chantier (en dérive)
→ Upload facture (drag & drop) → Extraction IA simulée → Validation
→ Dashboard mis à jour (chiffres bougent)
```

Ce parcours reste utile comme colonne vertébrale UX du front, mais il ne constitue
plus une contrainte de démonstration ni une priorisation absolue.

### 1.4 Comptes de travail représentés dans le seed

| Persona | Email | Rôle | Ce qu'il voit |
|---|---|---|---|
| Patrick Sosson | patrick@sosson.fr | Gérant | Tout : KPIs, marges, alertes |
| Claire Morel | claire@sosson.fr | Assistante de gestion | Factures, clients, upload |
| Romain Faure | romain@sosson.fr | Chef de chantier | Ses chantiers uniquement, sans marges |

Mot de passe seed universel actuel : `demo`

---

## Chapitre 2 — Architecture technique

### 2.1 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│                     NAVIGATEUR                          │
│                                                         │
│  React 18 + Vite  ──  React Router v6  ──  TailwindCSS │
│                                                         │
│  AppProvider (Context)                                  │
│  ├── user (User | null)                                 │
│  ├── chantiers (Chantier[])   ← seedés en mémoire       │
│  ├── factures (Facture[])     ← seedées en mémoire      │
│  ├── setUser()                                          │
│  └── addFacture()             ← met à jour chantier     │
│                                                         │
│  Auth : Firebase Auth si configuré, sinon mock seed     │
│  Data : Firestore si configuré, sinon arrays en mémoire │
└─────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│        FIREBASE (socle branché progressivement)         │
│                                                         │
│  sosson-sandbox  ←── npm run dev / build:sandbox        │
│  sosson-prod     ←── npm run dev:prod / build:prod      │
│                                                         │
│  Services utilisés : Auth (Email/Password) + Firestore  │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Principe du fallback seed

L'application fonctionne **même sans Firebase configuré**.
La variable `isFirebaseConfigured` dans `src/lib/auth.ts` vérifie si
`VITE_FIREBASE_API_KEY` est définie dans l'environnement.

- **Sans Firebase** : login sur les comptes seedés (`src/data/users.ts`), données en mémoire.
- **Avec Firebase** : login Firebase Auth, profil lu dans Firestore collection `users/{uid}`,
  fallback sur le seed si le profil n'existe pas encore.

Cela permet de continuer à développer l'interface pendant le branchement progressif
de l'infrastructure réelle. Ce fallback est transitoire et ne définit pas la cible
d'architecture.

---

## Chapitre 3 — Structure du projet

```
Sosson/                         # Racine du projet (tout est ici, pas de sous-dossier app/)
│
├── docs/                       # Documentation produit (vision, architecture, intelligence, ADR)
├── MVProadmap.md               # Archive de la roadmap démo (historique, non directif)
├── documentation.md            # Doc générale
│
├── deploy/                     # Système de déploiement Firebase (npm run dashboard)
│   ├── config.mjs              # Source de vérité : IDs projets, URLs, env files
│   ├── checks.mjs              # Vérifications sécurité (lecture seule)
│   ├── runner.mjs              # Exécution build + firebase deploy
│   └── dashboard.mjs          # UI interactive terminal (chalk + inquirer + ora)
│
├── src/
│   ├── data/                   # Données de démonstration (seed)
│   │   ├── clients.ts          # 3 clients
│   │   ├── chantiers.ts        # 4 chantiers
│   │   ├── factures.ts         # 12 factures fournisseurs
│   │   ├── emails.ts           # 2 emails rattachés
│   │   └── users.ts            # 3 comptes utilisateurs
│   │
│   ├── lib/                    # Logique partagée
│   │   ├── firebase.ts         # Init Firebase (auth + db)
│   │   ├── auth.ts             # Login / logout / getCurrentUser (Firebase + fallback)
│   │   └── store.tsx           # AppProvider : Context React global
│   │
│   ├── components/
│   │   └── layout/
│   │       ├── Sidebar.tsx     # Navigation latérale (liens + user + logout)
│   │       └── AppLayout.tsx   # Layout protégé (redirect si non connecté)
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx       # Page de connexion + accès rapide seed
│   │   ├── DashboardPage.tsx   # Dashboard gérant (KPIs + alertes + graphique)
│   │   ├── ChantiersPage.tsx   # Liste des chantiers
│   │   ├── ChantierDetailPage.tsx  # ⭐ Fiche chantier + upload facture
│   │   ├── ClientsPage.tsx     # Liste clients + modal création
│   │   ├── FacturesPage.tsx    # Liste factures avec filtres
│   │   ├── EmailsPage.tsx      # Emails rattachés aux chantiers
│   │   └── PlanningPage.tsx    # Vue calendrier Gantt visuelle
│   │
│   ├── App.tsx                 # Router principal
│   ├── main.tsx                # Point d'entrée React
│   └── index.css               # TailwindCSS v4 import + reset
│
├── .env.sandbox                # Config Firebase sandbox (à remplir)
├── .env.production             # Config Firebase production (à remplir)
├── .env.example                # Template commenté
├── .firebaserc                 # Alias projets Firebase (à remplir)
├── firebase.json               # Config hosting + Firestore
├── firestore.rules             # Règles Firestore V1 (auth requise)
├── firestore.indexes.json      # Index Firestore (placeholder actuel)
├── vite.config.ts              # Vite + TailwindCSS v4 + chunks + drop console prod
├── tsconfig.app.json           # TypeScript avec alias @/ → src/
├── package.json                # Scripts npm
└── CLAUDE.md                   # CE FICHIER
```

---

## Chapitre 4 — Stack et dépendances

### 4.1 Stack principale

| Technologie | Version | Rôle |
|---|---|---|
| React | 19 | UI |
| Vite | 8 | Bundler + dev server |
| TypeScript | 6 | Typage |
| TailwindCSS | 4 (plugin Vite) | Styling utility-first |
| React Router | 7 | Routing SPA |
| Firebase | 12 | Auth + Firestore |
| Recharts | 3 | Graphiques (dashboard) |
| React Dropzone | 15 | Upload drag & drop |
| Lucide React | 1 | Icônes |

### 4.2 Dépendances de déploiement (devDependencies)

| Package | Rôle |
|---|---|
| chalk | Couleurs terminal dashboard |
| inquirer | Menus interactifs terminal |
| ora | Spinners de chargement |
| firebase-admin | SDK admin pour scripts Node.js |

### 4.3 Scripts npm

```bash
npm run dev           # Dev server en mode sandbox (localhost:5173)
npm run dev:prod      # Dev server en mode production
npm run build:sandbox # Build pour Firebase sandbox
npm run build:prod    # Build pour Firebase production
npm run dashboard     # Dashboard de déploiement interactif
npm run lint          # ESLint
```

### 4.4 Configuration TypeScript

L'alias `@/` est configuré dans `tsconfig.app.json` et `vite.config.ts` :

```json
// tsconfig.app.json
"baseUrl": ".",
"paths": {
  "@/*": ["src/*"]
}
```

```ts
// vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

Tout import dans `src/` utilise `@/` plutôt que des chemins relatifs.
Exemple : `import { useApp } from '@/lib/store'`

---

## Chapitre 5 — Environnements Firebase

### 5.0 État actuel et action à faire maintenant

> **Mise à jour du 2026-04-23** :
> les projets Firebase `sandbox` et `production` existent et sont branchés.
> Les variables d'environnement sont renseignées, `.firebaserc` est en place,
> et SQL Connect / Data Connect est actif dans les deux environnements.
>
> Le travail à faire maintenant n'est plus d'activer Firebase, mais de :
> 1. **aligner la config locale `dataconnect/` avec les vrais services / instances créés dans Firebase**
> 2. **remplacer le schéma SQL Connect d'exemple généré par Firebase**
> 3. **valider les opérations en `sandbox` avant tout déploiement vers `production`**
> 4. **renforcer progressivement Auth / Firestore / Storage côté règles et architecture**

### 5.0.1 Audit clair des actions réalisées et du guidage fourni

**Date et heure de la note** : `2026-04-23 01:42:02 +02:00`

Ce qui a été fait :

1. Le cadrage "démo / MVP" a été explicitement abandonné et reclassé en historique.
2. Les deux environnements Firebase `sosson-sandbox` et `sosson-prod` ont été vérifiés.
3. SQL Connect / Data Connect a été activé côté Firebase dans `sandbox` et `production`.
4. La région retenue pour SQL Connect a été fixée à `europe-west9`.
5. L'initialisation locale SQL Connect a été lancée **une seule fois** dans le repo avec :
   `firebase init dataconnect --project sosson-sandbox`
6. Le guidage fourni a insisté sur le fait de :
   - ne **pas** générer le schéma avec Gemini
   - ne **pas** refaire `firebase init` pour `production`
   - ne **pas** cliquer sur `Deploy to production` tant que le schéma Sosson n'est pas prêt
   - ne **pas** travailler le schéma directement dans la console Firebase
7. Firebase a généré localement :
   - `dataconnect/dataconnect.yaml`
   - `dataconnect/schema/schema.gql`
   - `dataconnect/example/*`
   - `src/dataconnect-generated/*`
   - `src/dataconnect-admin-generated/*`
8. Un point de vigilance a été identifié :
   les IDs générés localement par Firebase peuvent ne pas correspondre aux IDs créés manuellement dans la console.
   Cet alignement reste à faire avant tout déploiement sérieux.
9. Les dossiers de skills Firebase (`.agents`, `.claude`, `.vibe`, `.windsurf`) ont été conservés en local
   parce qu'ils peuvent aider les agents sur la stack Firebase, mais ils ont été exclus de Git.
10. Le dossier `.firebase/`, qui ne servait qu'au debug / tooling local, a été supprimé du workspace.

### 5.1 Deux projets distincts

| Environnement | Alias `.firebaserc` | Usage |
|---|---|---|
| `sandbox` | `default` | Développement / intégration |
| `production` | `prod` | Production |

### 5.2 Fichiers d'environnement

Vite charge automatiquement `.env.[mode]` selon le `--mode` passé au build.

```
.env.sandbox      →  npm run dev  /  npm run build:sandbox
.env.production   →  npm run dev:prod  /  npm run build:prod
```

Structure de chaque fichier `.env.*` :

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_ENV=sandbox   # ou production
```

> ⚠️ Ces fichiers ne sont pas commités (`.gitignore`).
>
> **Mise à jour 2026-04-23** : les fichiers `.env.sandbox` et `.env.production`
> sont maintenant renseignés avec les vraies valeurs Firebase.

### 5.3 Initialisation Firebase (`src/lib/firebase.ts`)

```ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
export const ENV = import.meta.env.VITE_ENV ?? 'sandbox'
```

### 5.4 Règles Firestore (`firestore.rules`)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // V1 actuelle : accès authentifié uniquement
    // À renforcer avec RBAC et règles ciblées par collection / rôle
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5.5 `.firebaserc`

```json
{
  "projects": {
    "default": "sosson-sandbox",
    "prod": "sosson-prod"
  }
}
```

### 5.6 SQL Connect / Data Connect

SQL Connect est désormais initialisé localement dans le repo et visible dans VS Code
via l'extension Firebase SQL Connect.

État validé :
- `firebase init dataconnect --project sosson-sandbox` a déjà été exécuté
- l'initialisation locale ne doit **pas** être relancée pour `production`
- les deux environnements Firebase ont un service SQL Connect actif en `europe-west9`
- `firebase.json` contient maintenant une section `dataconnect` et une config d'émulateur
- `package.json` contient les dépendances locales `@dataconnect/generated` et `@dataconnect/admin-generated`

État provisoire à corriger ensuite :
- `dataconnect/schema/schema.gql` est encore le template d'exemple Firebase
- `dataconnect/example/*` et `seed_data.gql` sont des fichiers générés, non encore alignés avec Sosson
- `dataconnect/dataconnect.yaml` doit être revu pour correspondre aux vrais IDs créés côté Firebase

---

## Chapitre 6 — Données de démonstration (seed)

Les données seed sont des arrays TypeScript statiques dans `src/data/`.
Elles sont chargées dans l'`AppProvider` et mutées uniquement en mémoire.

### 6.1 Clients (`src/data/clients.ts`)

3 clients représentant les 3 types courants en BTP PME :

```ts
export interface Client {
  id: string
  nom: string
  type: 'particulier' | 'professionnel' | 'public'
  email: string
  telephone: string
  adresse: string
  ville: string
  codePostal: string
  dateCreation: string
  chantierIds: string[]
}
```

| ID | Nom | Type | Ville |
|---|---|---|---|
| client-1 | Martin Dupont | particulier | Valence |
| client-2 | SCI Les Pins | professionnel | Romans-sur-Isère |
| client-3 | Mairie de Valence | public | Valence |

### 6.2 Chantiers (`src/data/chantiers.ts`)

4 chantiers couvrant les scénarios clés de la démo :

```ts
export type StatutChantier = 'en_cours' | 'cloture' | 'en_attente'
export type TendanceChantier = 'vert' | 'orange' | 'rouge'

export interface Chantier {
  id: string
  nom: string
  clientId: string
  statut: StatutChantier
  dateDebut: string
  dateFin: string | null
  dateFinPrevue: string
  budgetPrevisionnel: number
  depensesEngagees: number
  description: string
  adresse: string
  chefChantier: string
  tendance: TendanceChantier    // calculée : rouge si > 105% budget
  factureIds: string[]
  emailIds: string[]
}
```

| ID | Nom | Client | Budget | Dépenses | Tendance |
|---|---|---|---|---|---|
| chantier-1 | Rénovation salle de bain | Martin Dupont | 8 500 € | 9 200 € | 🔴 rouge |
| chantier-2 | Extension garage | SCI Les Pins | 24 000 € | 14 300 € | 🟢 vert |
| chantier-3 | Toiture mairie annexe | Mairie Valence | 31 000 € | 18 700 € | 🟡 orange |
| chantier-4 | Terrasse bois | Martin Dupont | 6 200 € | 5 800 € | ✅ clôturé |

**chantier-1** est le chantier pivot de la démo : il est en dérive budget (+8%),
a des emails non lus rattachés, et c'est sur lui qu'on fait l'upload.

### 6.3 Factures (`src/data/factures.ts`)

12 factures fournisseurs réparties sur les 4 chantiers. 8 catégories de dépenses :

```ts
export type CategorieDepense =
  | 'bois_materiaux' | 'quincaillerie' | 'sous_traitance'
  | 'carburant' | 'location_materiel' | 'plomberie'
  | 'electricite' | 'peinture'

export interface Facture {
  id: string
  chantierId: string
  fournisseur: string
  montantHT: number
  tva: number           // taux en % (10 ou 20)
  montantTTC: number
  date: string
  categorie: CategorieDepense
  statut: 'validee' | 'en_attente' | 'rejetee'
  numeroFacture: string
  description: string
}
```

**Données d'extraction simulée pour l'upload démo** (hardcodée dans `ChantierDetailPage`) :
- Fournisseur : Matériaux Rhône
- N° : MR-2026-0287
- Montant HT : 706,00 €
- TVA : 20%
- Montant TTC : **847,20 €**
- Catégorie auto-détectée : Bois & matériaux (confiance 94%)

### 6.4 Emails (`src/data/emails.ts`)

2 emails rattachés au chantier-1 (la dérive) :

| ID | Sujet | Priorité | Lu |
|---|---|---|---|
| email-1 | Avancement salle de bain — inquiétude délai | haute | non |
| email-2 | Choix carrelage — confirmation | normale | oui |

### 6.5 Utilisateurs (`src/data/users.ts`)

```ts
export type Role = 'gerant' | 'assistante' | 'chef_chantier'

export interface User {
  id: string
  nom: string
  prenom: string
  email: string
  role: Role
  avatar: string    // 2 initiales pour l'avatar
  password: string  // 'demo' pour tous en mode seed
}
```

| Email | Rôle | Avatar |
|---|---|---|
| patrick@sosson.fr | gerant | PS |
| claire@sosson.fr | assistante | CM |
| romain@sosson.fr | chef_chantier | RF |

---

## Chapitre 7 — Authentification

### 7.1 Fichier : `src/lib/auth.ts`

Le module gère deux modes selon que Firebase est configuré ou non.

```ts
const isFirebaseConfigured = Boolean(import.meta.env.VITE_FIREBASE_API_KEY)
```

**Mode sans Firebase (démo seed)** :
- `login()` cherche l'email + password dans `src/data/users.ts`
- L'utilisateur est stocké dans `localStorage` sous la clé `sosson_user`
- `getCurrentUser()` lit depuis `localStorage` au chargement de l'app

**Mode avec Firebase** :
- `login()` appelle `signInWithEmailAndPassword(auth, email, password)`
- Le profil est lu dans Firestore `users/{uid}` (fallback sur le seed si absent)
- `logout()` appelle `firebaseSignOut(auth)` + vide localStorage

```ts
export async function login(email: string, password: string): Promise<User | null>
export async function logout(): Promise<void>
export function getCurrentUser(): User | null
export function isAuthenticated(): boolean
export function onAuthChange(callback: (user: User | null) => void)
```

> ⚠️ `login()` et `logout()` sont **async** depuis l'intégration Firebase.
> Tous les appelants (`LoginPage`, `Sidebar`) utilisent `await`.

### 7.2 Protection des routes

`AppLayout` vérifie si l'utilisateur est connecté. Si non, redirect vers `/login` :

```tsx
// src/components/layout/AppLayout.tsx
export function AppLayout() {
  const { user } = useApp()
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
```

---

## Chapitre 8 — State global (AppProvider)

### 8.1 Fichier : `src/lib/store.tsx`

Un Context React simple qui gère l'état mutable de la démo.

**État géré :**
```ts
interface AppState {
  user: User | null
  chantiers: Chantier[]     // mutable (addFacture met à jour les chantiers)
  factures: Facture[]       // mutable (addFacture ajoute une facture)
  setUser: (u: User | null) => void
  addFacture: (f: Facture) => void
}
```

**Logique de `addFacture`** — c'est la mutation clé qui produit l'effet "wow" de la démo :

```ts
function addFacture(f: Facture) {
  // 1. Ajoute la facture en tête de liste
  setFacturesList(prev => [f, ...prev])

  // 2. Met à jour le chantier associé
  setChantiersList(prev =>
    prev.map(c => {
      if (c.id === f.chantierId) {
        const nouvellesDepenses = c.depensesEngagees + f.montantTTC
        return {
          ...c,
          depensesEngagees: nouvellesDepenses,
          factureIds: [f.id, ...c.factureIds],
          tendance:
            nouvellesDepenses > c.budgetPrevisionnel * 1.05 ? 'rouge'
            : nouvellesDepenses > c.budgetPrevisionnel * 0.9 ? 'orange'
            : 'vert',
        }
      }
      return c
    })
  )
}
```

Quand `addFacture` est appelé après validation de l'upload :
- La facture apparaît immédiatement dans la liste
- Les dépenses du chantier augmentent
- La tendance se recalcule
- Le Dashboard (qui lit `chantiers` du Context) se met à jour automatiquement via React

**Exports complémentaires** : `clients` et `emails` sont ré-exportés depuis `store.tsx`
pour simplifier les imports dans les pages.

---

## Chapitre 9 — Routing et layout

### 9.1 Fichier : `src/App.tsx`

Structure complète du router :

```tsx
<AppProvider>                         // Context global
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AppLayout />}>  // Layout protégé (auth guard)
        <Route path="/dashboard"        element={<DashboardPage />} />
        <Route path="/chantiers"        element={<ChantiersPage />} />
        <Route path="/chantiers/:id"    element={<ChantierDetailPage />} />
        <Route path="/clients"          element={<ClientsPage />} />
        <Route path="/factures"         element={<FacturesPage />} />
        <Route path="/emails"           element={<EmailsPage />} />
        <Route path="/planning"         element={<PlanningPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
</AppProvider>
```

**Règle** : toute route non trouvée redirige vers `/dashboard`.
L'accès à `/dashboard` sans session redirige vers `/login` via `AppLayout`.

### 9.2 Sidebar (`src/components/layout/Sidebar.tsx`)

Navigation latérale fixe (sticky, `h-screen`), fond `slate-900`.

- Logo Sosson (icône `Building2` orange)
- `NavLink` avec `isActive` → fond orange si actif, gris sinon
- Section utilisateur en bas avec avatar initiales + nom + rôle + bouton déconnexion
- `handleLogout()` : `await logout()` → `setUser(null)` → `navigate('/login')`

---

## Chapitre 10 — Pages — Login

### Fichier : `src/pages/LoginPage.tsx`

**Design** : fond dégradé `slate-900 → slate-800`, carte blanche centrée, logo orange.

**Deux modes de connexion** :
1. **Formulaire standard** : email + password → `await login(email, password)`
2. **Connexion rapide démo** : accordéon avec les 3 comptes, 1 clic → connexion immédiate

```tsx
// Connexion rapide — clique sur un compte, connecté en 1 clic
async function loginAs(userEmail: string) {
  const user = await login(userEmail, 'demo')
  if (user) {
    setUser(user)
    navigate('/dashboard')
  }
}
```

**Mention** : "Mode démonstration — données fictives" en bas de page.

---

## Chapitre 11 — Pages — Dashboard gérant

### Fichier : `src/pages/DashboardPage.tsx`

**Accès** : tous les rôles. Les KPIs financiers ne s'affichent que pour le gérant.

**Composants affichés :**

```
┌─────────────────────────────────────────────────────────┐
│  Bonjour Patrick 👋 — mardi 22 avril 2026               │
├─────────────────────────────────────────────────────────┤
│  ⚠ ALERTE : Rénovation salle de bain — dérive +8%  →   │
│  ~ ALERTE : Toiture mairie — à surveiller 60%      →   │
├─────────────────────────────────────────────────────────┤
│  [Chantiers actifs: 3] [Dépenses: 62 847€] [Attente: 2] [Alertes: 2]
├──────────────────────────────────┬──────────────────────┤
│  Graphique barres :              │  Chantiers en cours  │
│  Dépenses par catégorie          │  + barres budget     │
│  (Recharts BarChart)             │  (avec tendance)     │
└──────────────────────────────────┴──────────────────────┘
```

**Calculs en temps réel depuis le Context** :

```ts
const chantiersActifs = chantiers.filter(c => c.statut === 'en_cours')
const totalDepenses = factures
  .filter(f => f.statut === 'validee')
  .reduce((sum, f) => sum + f.montantTTC, 0)
const alertes = chantiers.filter(c => c.tendance === 'rouge' || c.tendance === 'orange')
```

**Effet "wow" post-upload** : quand une facture est ajoutée via `addFacture()`,
le `totalDepenses` et les barres se recalculent automatiquement via React Context.

**Graphique catégories** : `BarChart` Recharts avec `Cell` colorée par catégorie.
Chaque catégorie a une couleur fixe définie dans `categorieColors`.

**Alertes** : bandeaux cliquables en haut du dashboard, rouge ou orange selon tendance.
Clic → navigation vers la fiche chantier correspondante.

---

## Chapitre 12 — Pages — Liste des chantiers

### Fichier : `src/pages/ChantiersPage.tsx`

**Contrôle d'accès** : le chef de chantier ne voit que ses chantiers.

```ts
const visibleChantiers =
  user?.role === 'chef_chantier'
    ? chantiers.filter(c => c.chefChantier === `${user.prenom} ${user.nom}`)
    : chantiers
```

**Chaque card chantier affiche** :
- Nom + badges (statut, tendance dérive)
- Client + adresse
- Pour le gérant uniquement : budget / dépenses / marge restante
- Barre de progression budget colorée selon tendance

Clic sur une card → navigation vers `/chantiers/:id`.

---

## Chapitre 13 — Pages — Fiche chantier (pièce maîtresse)

### Fichier : `src/pages/ChantierDetailPage.tsx`

**C'est la page centrale de la démo.** Elle contient l'upload et l'extraction IA.

### 13.1 Structure de la page

```
┌─────────────────────────────────────────────────────────┐
│  ← Retour    Rénovation salle de bain  ⚠ Dérive budget  │
│  Client: Martin Dupont · Valence · Fin: 30 avr. 2026    │
├─────────────────────────────────────┬───────────────────┤
│  [Budget 8500€] [Dépenses 9200€]    │  Info client      │
│  [Marge: -700€ (dépassé)]           │  Emails rattachés │
├─────────────────────────────────────┤  Détails chantier │
│  Zone upload drag & drop            │                   │
│  (visible gérant + assistante)      │                   │
├─────────────────────────────────────┤                   │
│  Liste des factures du chantier     │                   │
│  (avec couleur catégorie + statut)  │                   │
└─────────────────────────────────────┴───────────────────┘
```

### 13.2 Machine à états de l'upload

```ts
type UploadStep = 'idle' | 'uploading' | 'analyzing' | 'result' | 'done'
```

**Transitions :**
```
idle
 │  ← drag & drop ou clic
 ▼
uploading  (1,2s — spinner)
 │
 ▼
analyzing  (1,8s supplémentaires — icône Sparkles animée + barre de progression)
 │
 ▼
result     (formulaire pré-rempli avec données extraites)
 │  ← clic "Valider et rattacher au chantier"
 ▼
done       (2s — confirmation verte)
 │
 ▼
idle       (reset)
```

**Timings** (dans le `onDrop`) :
```ts
onDrop: useCallback((files: File[]) => {
  setFileName(files[0].name)
  setUploadStep('uploading')
  setTimeout(() => setUploadStep('analyzing'), 1200)   // 1.2s
  setTimeout(() => setUploadStep('result'),    3000)   // 1.8s de plus
}, [])
```

### 13.3 Résultat d'extraction simulé

Hardcodé dans la constante `EXTRACTION_RESULT` :

```ts
const EXTRACTION_RESULT = {
  fournisseur: 'Matériaux Rhône',
  numeroFacture: 'MR-2026-0287',
  montantHT: 706.0,
  tva: 20,
  montantTTC: 847.2,
  date: new Date().toISOString().split('T')[0],
  categorie: 'bois_materiaux' as CategorieDepense,
  description: 'Bois de charpente sapin 63m², vis tirefond inox, chevrons 63x75',
  confidence: 94,
}
```

Tous les champs sont **éditables** dans le formulaire de résultat.
Le montant TTC se recalcule automatiquement si HT ou TVA est modifié.
Les catégories sont sélectionnables comme des badges colorés.

### 13.4 Validation et effet "wow"

```ts
function handleValidate() {
  const newFacture: Facture = {
    id: `facture-new-${Date.now()}`,
    chantierId: id!,
    ...extracted,
    statut: 'validee',
  }
  addFacture(newFacture)   // ← met à jour Context → Dashboard se recalcule
  setUploadStep('done')
  setTimeout(() => setUploadStep('idle'), 2000)
}
```

Après validation, si on retourne au Dashboard :
- Le total des dépenses a augmenté de 847,20 €
- La barre du chantier dans "Chantiers en cours" a progressé
- L'alerte "dérive" est toujours visible (la tendance était déjà rouge)

### 13.5 Contrôle d'accès upload

```ts
const canUpload = user?.role === 'gerant' || user?.role === 'assistante'
```

Le chef de chantier voit la liste des factures mais **pas** la zone d'upload.

---

## Chapitre 14 — Pages — Clients

### Fichier : `src/pages/ClientsPage.tsx`

**Liste des clients** avec icône par type (particulier / professionnel / collectivité),
nombre de chantiers, email, téléphone, ville.

**Modal de création** (gérant + assistante uniquement) :
- Formulaire complet : nom, type (3 boutons toggle), email, téléphone, adresse, ville, CP
- Création locale uniquement (pas persistée Firebase pour la démo)
- Confirmation visuelle : bouton vire au vert + texte "Client créé !" pendant 1,2s

```ts
function handleCreate(e: React.FormEvent) {
  const newClient: Client = {
    id: `client-new-${Date.now()}`,
    ...form,
    dateCreation: new Date().toISOString().split('T')[0],
    chantierIds: [],
  }
  setClientsList(prev => [...prev, newClient])
  setSaved(true)
  setTimeout(() => { setSaved(false); setShowModal(false) }, 1200)
}
```

---

## Chapitre 15 — Pages — Factures

### Fichier : `src/pages/FacturesPage.tsx`

**Liste complète** de toutes les factures avec filtres par statut :
`Toutes | En attente | Validées | Rejetées`

Chaque ligne affiche :
- Point coloré (couleur de la catégorie)
- Fournisseur + N° facture
- Catégorie · Chantier · Client
- Date
- Badge statut (vert/orange/rouge)
- Montant TTC (gérant uniquement)

**Contrôle d'accès** :
- Chef de chantier : ne voit que les factures de ses chantiers
- Montants TTC : gérant uniquement

---

## Chapitre 16 — Pages — Emails

### Fichier : `src/pages/EmailsPage.tsx`

Affichage de tous les emails rattachés aux chantiers.

Chaque email affiche :
- Point bleu si non lu, icône mail grise si lu
- Sujet (gras si non lu)
- Badge de tag (client / fournisseur / interne / devis / facture)
- Badge "Urgent" si priorité haute
- Expéditeur + date
- Extrait du corps (2 lignes max)
- Chantier + client rattachés (en orange)

---

## Chapitre 17 — Pages — Planning

### Fichier : `src/pages/PlanningPage.tsx`

**Vue Gantt visuelle** sur 12 mois (2026).

Chaque chantier actif est représenté par une barre colorée s'étalant de son
`dateDebut` à sa `dateFinPrevue`. La barre affiche le nom du chantier sur la
première cellule.

```ts
// Calcul de la position et longueur de la barre
const startMonth = new Date(c.dateDebut).getMonth()   // 0-11
const endMonth = new Date(c.dateFinPrevue).getMonth() // 0-11
// Chaque mois = 1 colonne dans une CSS grid 12 colonnes
```

En dessous du Gantt : cards récapitulatives avec chef de chantier, dates, client.

> Mention explicite : "Vue indicative — synchronisation Google Calendar à venir"

---

## Chapitre 18 — Système de déploiement

### 18.1 Architecture (copiée de SecondeVieAnais, éprouvée en production)

4 fichiers dans `deploy/` avec responsabilités strictement séparées :

```
deploy/config.mjs      → Source de vérité (IDs, URLs, env files)
deploy/checks.mjs      → Vérifications seulement, jamais d'action
deploy/runner.mjs      → Exécution seulement (build + firebase deploy)
deploy/dashboard.mjs   → UI terminal interactive (chalk + inquirer + ora)
```

### 18.2 Remplir avant de déployer (`deploy/config.mjs`)

```js
export const ENVIRONMENTS = {
  sandbox: {
    alias: 'default',
    projectId: 'REMPLACER_PAR_ID_SANDBOX',  // ← à remplir
    envFile: '.env.sandbox',
    buildScript: 'build:sandbox',
    url: 'https://REMPLACER_PAR_ID_SANDBOX.web.app',
    label: 'SANDBOX',
  },
  production: {
    alias: 'prod',
    projectId: 'REMPLACER_PAR_ID_PROD',     // ← à remplir
    envFile: '.env.production',
    buildScript: 'build:prod',
    url: 'https://REMPLACER_PAR_ID_PROD.web.app',
    label: 'PRODUCTION',
  },
}

// IDs interdits dans tout build Sosson (contamination croisée)
export const FORBIDDEN_IDS = ['secondeviesandbox', 'secondevie-a0745']
```

### 18.3 Sécurités du dashboard

1. **Double confirmation prod** : oui/non + frappe manuelle `DEPLOY PROD`
2. **Scan `dist/` post-build** : vérifie que le bon project ID est dans les JS générés,
   bloque si un ID d'un autre projet est trouvé
3. **`--project` forcé** : chaque commande Firebase passe `--project ID` explicitement,
   indépendamment de l'état de `firebase use`
4. **Vérification `.env` ↔ project ID** : le `.env` doit contenir
   `VITE_FIREBASE_PROJECT_ID=<id_exact>` avant tout deploy

### 18.4 Utilisation

```bash
npm run dashboard
```

Menu interactif :
- Déployer en SANDBOX (build + hosting)
- Déployer en PRODUCTION (build + hosting + double confirmation)
- Rules uniquement (Firestore)
- TOUT déployer (hosting + rules)
- Voir l'état complet du système

### 18.5 Prérequis pour déployer

```bash
npm install -g firebase-tools
firebase login
```

Le dashboard vérifie automatiquement que Firebase CLI est installé et qu'un
compte est connecté avant toute action.

---

## Chapitre 19 — Archive de la phase démo

Les anciens scripts, parcours narratifs et contraintes "3 minutes" sont conservés
uniquement pour mémoire. Ils ne doivent plus influencer ni la priorisation, ni les
choix d'architecture, ni le séquencement des travaux.

## Chapitre 20 — Périmètre historique écarté

Les restrictions du type :
- "pas besoin de vraie infra"
- "pas besoin de vrai Auth"
- "Firestore seul suffit pour la démo"
- "pas de tests avant lundi"

... sont désormais **obsolètes**. Elles correspondent à un cadrage passé et ne doivent
plus être reprises dans les prochains arbitrages.

## Chapitre 21 — Orientation active

Priorités de travail actives :
- remettre le socle technique en état de build et de développement continu
- brancher progressivement l'infrastructure réelle au lieu d'étendre le mode seed
- préparer la couche de persistance relationnelle cible autour de Postgres / SQL Connect
- faire converger la documentation produit, la structure de code, et les environnements

---

## Annexe A — Commandes utiles

```bash
# Développement
npm run dev                 # Lance sur localhost:5173 (mode sandbox)

# Build + déploiement
npm run dashboard           # Lance le dashboard de déploiement interactif

# Firebase CLI (si besoin manuel)
firebase use default        # Bascule sur sandbox
firebase use prod           # Bascule sur production
firebase deploy --only hosting --project ID

# Vérifier l'état Firebase
firebase use                # Affiche le projet actif
firebase login:list         # Affiche le compte connecté
```

## Annexe B — Variables d'environnement requises

Copier `.env.example` → `.env.sandbox` (et `.env.production`) et remplir :

```bash
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=sosson-sandbox.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sosson-sandbox
VITE_FIREBASE_STORAGE_BUCKET=sosson-sandbox.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abc123
VITE_ENV=sandbox
```

## Annexe C — Palette de couleurs (TailwindCSS)

| Usage | Classe Tailwind |
|---|---|
| Couleur primaire (orange) | `bg-orange-500` / `text-orange-500` |
| Fond sidebar | `bg-slate-900` |
| Fond app | `bg-slate-50` |
| Alerte rouge | `bg-red-50 border-red-200 text-red-600` |
| Alerte orange | `bg-amber-50 border-amber-200 text-amber-600` |
| Succès vert | `bg-green-100 text-green-700` |
| Texte principal | `text-slate-900` |
| Texte secondaire | `text-slate-500` |
| Texte tertiaire | `text-slate-400` |
| Bordures | `border-slate-100` / `border-slate-200` |
| Cards | `bg-white rounded-2xl shadow-sm border border-slate-100` |
