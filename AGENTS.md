# AGENTS.md - Sosson
## Reference operationnelle du projet

> A lire en priorite avant toute intervention importante sur le repo.
>
> Derniere mise a jour : 23 avril 2026
> Version : 0.3.0

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

### Etat global au 23 avril 2026

La base du projet est maintenant saine :
- le front React/Vite existe et tourne
- Firebase Auth est branche
- SQL Connect est initialise localement
- le schema SQL Connect Sosson est ecrit
- le deploy sandbox SQL Connect a **reussi**
- la base Postgres `fdcdb` existe
- les tables `user`, `client`, `chantier`, `facture` existent
- le connecteur `sosson` est deploye

Ce qui n'est **pas encore fait** :
- le seed n'a pas encore ete injecte en sandbox
- le front lit encore majoritairement les donnees en memoire depuis `src/data/*`
- SQL Connect n'est pas encore branche dans le store React
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
- Vite 8
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
- le profil utilisateur est encore lu via Firestore dans `src/lib/auth.ts`
- les entites metier front (`clients`, `chantiers`, `factures`) viennent encore du seed TypeScript local
- SQL Connect est pret cote backend mais pas encore branche dans le store principal

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
- `dataconnect/dataconnect.yaml`

### Signification

- `schema.gql` = la structure relationnelle
- `queries.gql` = les lectures autorisees
- `mutations.gql` = les ecritures autorisees
- `seed_data.gql` = les donnees initiales de sandbox

### Schema metier courant

Le schema SQL Connect de Sosson modelise 4 entites :

- `User` : utilisateur interne lie a Firebase Auth
- `Client` : client final
- `Chantier` : dossier operationnel rattache a un client
- `Facture` : facture fournisseur rattachee a un chantier

Les champs derives comme les depenses agregees, la marge ou la tendance budgetaire ne sont pas stockes en dur dans la base principale : ils se calculent a partir des relations et des donnees de factures.

### Seed courant

Le seed sandbox prevu contient :
- 3 clients
- 4 chantiers
- 12 factures

Le seed **ne cree pas les `User`** car `User.id` doit correspondre a un vrai `auth.uid` Firebase.

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

### Ce qui est encore provisoire

- le store principal utilise encore `src/data/chantiers.ts` et `src/data/factures.ts`
- `clients` et `emails` sont encore exposes depuis les seeds locaux
- l'effet "ajout de facture" met a jour le state React local, pas encore SQL Connect

### Auth actuelle

Dans `src/lib/auth.ts` :
- si Firebase est configure, login via Firebase Auth
- ensuite lecture d'un profil `users/{uid}` dans Firestore
- si absent, fallback vers les utilisateurs seedes de `src/data/users.ts`

Donc aujourd'hui :
- **Auth Firebase est reelle**
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

1. Injecter le seed sandbox.
2. Creer `src/lib/dataconnect.ts` pour initialiser le SDK client SQL Connect.
3. Remplacer progressivement le store memoire par des lectures SQL Connect.
4. Brancher en premier les `clients`, puis les `chantiers`, puis les `factures`.
5. Definir proprement la strategie de creation / synchronisation du `User` applicatif avec Firebase Auth.
6. Une fois le flux sandbox stable, preparer la suite sur production.

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
firebase deploy --only dataconnect --project sosson-sandbox
firebase dataconnect:sdk:generate
```

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
