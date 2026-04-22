# Sosson — Documentation Technique

> Encyclopédie vivante du projet. Toute décision structurante, tout invariant, toute convention est consignée ici ou dans un chapitre lié depuis ce document.
>
> **Version du document** : 0.2.2 — *Audit de cohérence : rétention archives & pattern upload tranchés*
> **Dernière révision** : 2026-04-22
> **Statut global** : Base documentaire stabilisée. Fondations (vision, architecture, données, IA, archivage, intégrations, sécurité, coûts) cadrées. Reste à écrire : Frontend (chap 07), Opérations (chap 08).

---

## 1. Comment lire cette documentation

Cette documentation est conçue pour être lue par **trois publics** :

1. **Humain nouveau sur le projet** — commence par le chapitre [01 — Vision](docs/01-vision.md) puis [02 — Architecture](docs/02-architecture.md).
2. **Humain qui cherche une réponse précise** — utilise le [Sommaire](#3-sommaire) ci-dessous comme table d'index.
3. **Agent IA qui assiste le développement** — lis d'abord ce fichier racine en entier, puis les chapitres pertinents à ta tâche. Tout chapitre déclare ses invariants et ses frontières dès l'en-tête.

### Principe directeur

> **Un document, une responsabilité.** Ce fichier racine est un **index + charte**. Il ne contient pas de détail implémentation. Le détail vit dans les chapitres. Les décisions vivent dans les [ADRs](docs/adr/).

---

## 2. Conventions d'écriture

Règles non-négociables pour toute contribution à cette documentation.

| Règle | Détail |
|---|---|
| **Langue** | Français technique. Les termes anglais consacrés (schema, flow, tenant, cold storage) restent en anglais. |
| **Dates** | ISO 8601 (`YYYY-MM-DD`). Pas de "hier", "la semaine dernière". |
| **Statut de chapitre** | Chaque chapitre a un en-tête `Statut: draft | stable | obsolete | placeholder`. |
| **Décisions** | Toute décision structurante → un [ADR](docs/adr/). Jamais inline dans un chapitre. |
| **Code dans la doc** | Interdit en bloc implémentation. Autorisé en exemple court et en **schéma d'interface** (GraphQL type, Zod shape, signature TS). |
| **Diagrammes** | Mermaid de préférence (rendu GitHub natif). ASCII accepté pour les flux simples. |
| **Vocabulaire métier** | Tout terme domaine (Chantier, Devis, Facture, Archive) doit exister dans [99 — Glossaire](docs/99-glossary.md) avant d'être utilisé. |
| **Invariants** | Énoncés comme des phrases impératives : "Une Facture émise ne peut pas être supprimée." |
| **Liens** | Relatifs depuis la racine du workspace. Toujours cliquables en Markdown. |

### Ajouter un chapitre

1. Créer un fichier dans `docs/` avec le numéro suivant (`NN-nom-kebab.md`).
2. Copier l'en-tête standard (voir [docs/01-vision.md](docs/01-vision.md)).
3. Ajouter la ligne dans le [Sommaire](#3-sommaire) ci-dessous.
4. Si le chapitre introduit une décision structurante → créer un ADR.

### Ajouter un ADR

Chaque décision structurante produit **un fichier immuable** dans [docs/adr/](docs/adr/).
- Format : `NNNN-titre-kebab.md`, numérotation croissante, jamais recyclée.
- Un ADR peut être **remplacé** (statut `Superseded by NNNN`) mais **jamais édité sur le fond** après validation.
- Voir [docs/adr/README.md](docs/adr/README.md) pour le gabarit.

---

## 3. Sommaire

### Partie I — Fondations

| # | Chapitre | Statut | Sujet |
|---|---|---|---|
| 01 | [Vision & Contexte](docs/01-vision.md) | **stable v0.2** | Outil interne, hub opérationnel, personas, cas d'usage fondateurs |
| 02 | [Architecture Globale](docs/02-architecture.md) | **stable v0.2** | Stack Postgres+Firestore+Genkit, bounded contexts, 5 flux de référence |
| 03 | [Architecture des Données](docs/03-data-architecture.md) | **stable v0.2** | Schéma SQL Connect mono-tenant, 23 entités, indexes |
| 04 | [Couche Intelligence](docs/04-intelligence.md) | stable | Genkit, flows, prompts, gouvernance IA *(à ajuster : ajouter `categoriseDepense`, `trieEmail`, `rattacheEmailAuChantier`)* |
| 05 | [Stratégie d'Archivage](docs/05-archival-strategy.md) | **placeholder v0.2** | Hot/Warm/Cold, déclencheurs, format de l'archive v1.1.0 aligné mono-tenant |

### Partie II — Domaines transverses

| # | Chapitre | Statut | Sujet |
|---|---|---|---|
| 06 | [Intégrations externes](docs/06-integrations.md) | **placeholder v0.2** | Gmail (critique V1), Google Calendar, comptable, Excel, migration legacy |
| 07 | Frontend | placeholder | Stack UI web + mobile, offline-first, compression images |
| 08 | Opérations & Observabilité | placeholder | Déploiement, CI/CD, logs, métriques, alerting, FinOps |
| 09 | [Modèle de Coûts](docs/09-couts.md) | **stable v0.1** | Volumes Sosson, coûts mensuels estimés, guardrails, hypothèse environnements |
| 10 | [Sécurité & Autorisations](docs/10-securite.md) | **stable v0.1** | Rôles, ACL chantier, Firebase Auth, OAuth Google, secrets, RLS, RGPD |

### Partie III — Références

| # | Chapitre | Statut | Sujet |
|---|---|---|---|
| 99 | [Glossaire](docs/99-glossary.md) | stable | Vocabulaire métier et technique partagé |
| — | [Registre ADR](docs/adr/README.md) | stable | Liste de toutes les décisions structurantes |
| — | [Changelog](docs/CHANGELOG.md) | stable | Historique des évolutions de la documentation |

---

## 4. Décisions structurantes en vigueur

Ce tableau est le **point d'entrée canonique** pour comprendre pourquoi le projet est ce qu'il est. Chaque ligne renvoie à un ADR.

| ADR | Décision | Statut |
|---|---|---|
| [0001](docs/adr/0001-platform-firebase.md) | Plateforme : Firebase/GCP plutôt que Supabase | Accepté |
| [0002](docs/adr/0002-data-connect-relational.md) | Persistance relationnelle : Firebase SQL Connect (ex-Data Connect, Cloud SQL Postgres) | `Superseded by 0009` |
| [0003](docs/adr/0003-genkit-ai-layer.md) | Couche IA : Firebase Genkit + Gemini | Accepté |
| [0004](docs/adr/0004-cold-storage-strategy.md) | Archivage : extraction JSON + médias vers Cloud Storage Archive class | Accepté |
| [0005](docs/adr/0005-firestore-adjoint-only.md) | Firestore adjoint uniquement, jamais source de vérité | Accepté |
| [0006](docs/adr/0006-internal-tool-scope.md) | Outil interne mono-tenant (pas un SaaS) | Accepté |
| [0007](docs/adr/0007-not-a-billing-tool.md) | Hub opérationnel, pas un outil de facturation légal | Accepté |
| [0008](docs/adr/0008-architecture-postgres-firestore-hybrid.md) | Architecture hybride Postgres + Firestore (Option β) | Accepté |
| [0009](docs/adr/0009-sql-connect-repivot-justification.md) | Re-justification SQL Connect après repivot (remplace 0002) | Accepté |

---

## 5. Invariants du projet

Principes **non-négociables** qui traversent toute l'architecture. Toute contribution qui les violerait doit produire un ADR qui les remplace explicitement.

1. **Souveraineté des données opérationnelles.** Aucune donnée ne doit être irrécupérable sans dépendance Firebase. Un export complet (JSON + médias) doit toujours être possible en < 24 h. *(Reformulé par [ADR 0007](docs/adr/0007-not-a-billing-tool.md) : retrait de la connotation légale, la rétention n'est plus un impératif fiscal mais une pratique d'archivage opérationnel.)*
2. **Frontière stricte entre domaine et infrastructure.** La logique métier (catégorisation, calcul d'agrégats, règles de rattachement email ↔ chantier) ne doit **jamais** importer le SDK Firebase directement. Elle s'exprime en fonctions pures, testables sans émulateur.
3. **Tout flow IA est observable.** Aucun appel modèle en production sans trace Genkit, coût loggué, et schéma de sortie validé par Zod.
4. **Le coût est une fonctionnalité.** Toute feature nouvelle doit estimer son coût en conditions réelles (volume interne : 30-50 users, volumes documentés en [chapitre 09](#3-sommaire)).
5. **Mono-tenant assumé.** Sosson sert une seule entreprise. Aucune structure de données ni fonctionnalité n'anticipe le multi-tenancy. Voir [ADR 0006](docs/adr/0006-internal-tool-scope.md). *(Remplace l'ancien invariant "multi-tenant dès le jour 1" de la version 0.1.0.)*
6. **Postgres = source de vérité opérationnelle.** Firestore est adjoint optionnel (offline mobile, temps réel collaboratif). Toute donnée qui doit alimenter un dashboard, une recherche ou un historique vit en Postgres. Voir [ADR 0008](docs/adr/0008-architecture-postgres-firestore-hybrid.md).
7. **Non fiscal.** Sosson n'émet pas de documents à valeur comptable. Le comptable externe conserve cette responsabilité. Voir [ADR 0007](docs/adr/0007-not-a-billing-tool.md).

---

## 6. Cycle de vie de cette documentation

| Événement | Conséquence |
|---|---|
| Décision structurante prise | Nouveau ADR + ligne dans le tableau §4 + entrée Changelog |
| Chapitre écrit ou révisé | Mise à jour de son statut + date en en-tête + entrée Changelog |
| Invariant §5 ajouté / modifié | **Jamais silencieux** : ADR obligatoire, revue explicite |
| Chapitre rendu obsolète | Statut passe à `obsolete`, ligne barrée au Sommaire, conservé pour archéologie |
| Version majeure | Bump du numéro de version en tête de ce fichier |

La documentation est **versionnée avec le code** (même repo, même commit). Un changement d'architecture sans mise à jour de doc est un défaut de livraison.

---

## 7. Pour une IA qui débarque sur le projet

Si tu es un agent IA ouvert sur ce projet pour la première fois :

1. Lis **ce fichier** en entier (tu y es).
2. Lis [01 — Vision](docs/01-vision.md) pour le contexte métier.
3. Lis [02 — Architecture](docs/02-architecture.md) pour la topologie technique.
4. Selon la tâche demandée :
   - Tâche sur données / schéma → [03 — Données](docs/03-data-architecture.md)
   - Tâche IA / Genkit / extraction → [04 — Intelligence](docs/04-intelligence.md)
   - Tâche d'archivage → [05 — Archivage](docs/05-archival-strategy.md)
   - Tâche d'intégration (Gmail, Calendar, Excel) → [06 — Intégrations](docs/06-integrations.md)
   - Tâche de sécurité / auth / RGPD → [10 — Sécurité](docs/10-securite.md)
   - Tâche de chiffrage / coût → [09 — Coûts](docs/09-couts.md)
5. Vérifie la table §4 des ADRs avant de remettre en cause une décision existante.
6. Respecte les invariants §5. Si tu proposes de les violer, **explique pourquoi et propose un ADR**, ne le fais pas silencieusement.

---

*Fin du document racine. Point d'entrée : [docs/01-vision.md](docs/01-vision.md).*
