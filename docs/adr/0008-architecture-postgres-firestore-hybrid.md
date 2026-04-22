# ADR 0008 — Architecture hybride Postgres + Firestore pour hub opérationnel

> **Statut** : Accepté
> **Date** : 2026-04-22
> **Auteurs** : fondateur + assistant technique
> **Remplace** : —
> **Remplacé par** : —
>
> **Prérequis** : [ADR 0001](0001-platform-firebase.md), [ADR 0002](0002-data-connect-relational.md), [ADR 0005](0005-firestore-adjoint-only.md), [ADR 0006](0006-internal-tool-scope.md), [ADR 0007](0007-not-a-billing-tool.md).

## Contexte

Après les clarifications des ADRs 0006 (mono-tenant) et 0007 (outil opérationnel non fiscal), le profil technique réel de Sosson se révèle :

- **Hub de centralisation** avec ingestion hétérogène : factures (PDF), emails (Gmail), photos (mobile), comptes-rendus (texte).
- **Valeur #1** : dashboards analytiques (coûts par catégorie, productivité, prévisionnels).
- **Valeur #2** : recherche et traçabilité transverse (tout ce qui concerne un client ou un chantier en un endroit).
- **Valeur #3** : catégorisation / enrichissement par IA (Genkit + Gemini).
- **Contrainte terrain** : offline-first mobile pour les chefs de chantier en 4G faible.
- **Échelle** : ~30-50 utilisateurs internes, volumes modestes (quelques milliers d'entités par an).

Trois options d'architecture ont été étudiées :

- **α** : Firestore + BigQuery + GCS + Genkit (tout document, analytics déportées en BigQuery).
- **β** : Postgres (SQL Connect) + Firestore adjoint + GCS + Genkit (hybride).
- **γ** : Postgres seul + GCS + Genkit (pas de Firestore, offline mobile à coder à la main).

## Options envisagées

### Option α — Firestore + BigQuery + GCS

- ✅ Coût quasi nul (~3-8 €/mois), pas de socle incompressible.
- ✅ Offline-first mobile natif, temps réel natif.
- ✅ BigQuery suffit largement pour les dashboards au volume cible (gratuit sous 1 To/mois de requêtes).
- ❌ Pas de full-text search natif → Algolia ou Meilisearch à ajouter (coût + complexité).
- ❌ Deux stores de données (Firestore + BigQuery) → pipeline d'export à maintenir.
- ❌ Requêtes croisées complexes (emails ↔ chantiers ↔ factures ↔ catégories) coûteuses en lectures Firestore.
- ❌ Agrégations live impossibles sans pré-calcul → dashboards "suffisants" mais pas "riches".

### Option β — Postgres via SQL Connect + Firestore adjoint + GCS

- ✅ Postgres excelle sur tout le socle métier :
  - agrégations analytiques natives (`GROUP BY`, window functions) pour dashboards,
  - full-text search natif (`tsvector` + index GIN) pour recherche globale,
  - `JSONB` pour données semi-structurées (sorties IA, métadonnées variables),
  - requêtes relationnelles complexes sans surcoût.
- ✅ Firestore reste disponible pour ce qu'il fait vraiment bien : offline mobile chantier, collaboration temps réel sur planning, présence, notifications live.
- ✅ SDK TS typé auto-généré par SQL Connect.
- ✅ Portabilité : Postgres reste Postgres, exportable partout.
- ✅ Cohérent avec l'ADR 0005 (Firestore adjoint only).
- ❌ ~10 €/mois de socle incompressible (instance Cloud SQL tournant 24/7).
- ❌ Discipline requise : deux modèles mentaux, savoir ce qui va où.

### Option γ — Postgres seul

- ✅ Un seul modèle mental.
- ❌ Offline-first mobile à coder à la main (SQLite local + layer de sync) → 2-4 semaines de dev additionnel pour une fonctionnalité critique (chef de chantier en zone 4G faible).
- ❌ Pas de temps réel collaboratif natif sur le planning → polling ou WebSocket maison.

## Décision

**Option β retenue.** Hybride Postgres + Firestore + GCS + Genkit.

**Répartition des responsabilités** :

| Couche | Contenu | Justification |
|---|---|---|
| **Postgres (via SQL Connect)** | Clients, Chantiers, Devis, Factures (import), Factures fournisseurs, Catégories, Events (timeline), Users, liens email↔entité, métadonnées documents | Analytics, full-text, relations, source de vérité |
| **Firestore** | Photos en attente d'upload (queue mobile), CR brouillons mobile, planning interactif collaboratif (état d'édition en cours), présence, notifications live | Offline-first, temps réel |
| **Cloud Storage** | PDFs (factures fournisseurs, factures clientes importées, devis générés), photos définitives, pièces jointes emails, archives long terme | Stockage de binaires |
| **Genkit + Gemini** | Extraction factures, catégorisation coûts, tri/priorisation emails, synthèse CR, rattachement auto email↔chantier | IA orchestrée |
| **Firebase Auth** (classique, pas Identity Platform) | Comptes utilisateurs internes, sessions, rôles | Auth simple mono-tenant |

**Principe de coexistence** : Firestore reste **adjoint et reconstructible** (règles de l'ADR 0005). Les données "qui doivent survivre" vivent en Postgres. Firestore est un layer opérationnel / collaboratif sur lequel on ne s'appuie jamais pour des dashboards ou des recherches rétrospectives.

## Conséquences

### Positives

- Dashboards riches dès la V1 sans pipeline analytique à construire.
- Recherche globale performante via Postgres tsvector.
- Offline-first mobile résolu out-of-the-box par Firestore.
- Temps réel collaboratif sur planning résolu out-of-the-box par Firestore.
- Pas de troisième store (BigQuery pas nécessaire au volume cible).
- Alignement avec la décision ADR 0005 déjà prise.

### Négatives / Coûts

- **~10-15 €/mois** de socle (Cloud SQL `db-f1-micro` + Genkit + stockage + bande passante). Acceptable pour un outil interne financé par l'entreprise.
- Deux modèles mentaux à maintenir côté développeur. Mitigation : règles claires §"Règle simple" ci-dessous, ADR 0005 comme garde-fou.
- En dev, si l'instance Cloud SQL tourne 24/7, le coût dérive. Mitigation : procédure Stop/Start en dev + émulateur local.

### Neutres / À surveiller

- Si dans 2 ans les besoins analytiques dépassent largement Postgres (jamais attendu à ce volume, mais possible si on ajoute BI avancée), on pourra ajouter BigQuery par ADR additionnel.
- Si SQL Connect reste bloqué par des limitations GraphQL handicapantes, on pourra basculer la couche d'accès vers Hasura / PostgREST / accès SQL direct via Cloud Functions — les données Postgres restent intactes.

## Règle simple pour savoir où ranger une donnée

> *Est-ce que cette donnée doit être filtrée / triée / agrégée / cherchée dans un dashboard ou une fiche ?*

- **Oui** → Postgres.
- **Non, elle est juste "maintenant" / éphémère / collaborative temps réel** → Firestore.
- **C'est un fichier (binaire)** → Cloud Storage.

En cas de doute → **Postgres par défaut**.

## Invariants posés par cette décision

1. **Postgres = source de vérité** pour toute donnée opérationnelle durable (clients, chantiers, factures, emails archivés, catégories, timeline).
2. **Firestore = état éphémère ou collaboratif**, toujours reconstructible depuis Postgres (ou depuis une re-connexion des utilisateurs).
3. **Aucune donnée n'existe uniquement dans Firestore** au-delà de 24-72 h. Une collection Firestore pérenne fait l'objet d'un addendum à [ADR 0005](0005-firestore-adjoint-only.md).
4. **Les adapters Firebase vivent dans des fichiers dédiés** (`adapters/firebase-*.ts`). Le domaine métier (TS pur) ne connaît ni Firestore ni SQL Connect.

## Questions ouvertes

- Taille de l'instance Cloud SQL à l'ouverture : `db-f1-micro` semble suffisant au volume cible (30-50 users), mais il faudra mesurer en conditions réelles. ADR de réajustement si besoin.
- Stratégie de sauvegarde : Cloud SQL gère les backups automatiques (payant), plus un export JSON hebdomadaire de toute la base vers GCS Archive pour **souveraineté long terme** (cohérent avec l'instinct initial du fondateur). Spec dans le chapitre 08 Opérations (à écrire).
- Frontend mobile : Flutter ou React Native ? Choix reporté au chapitre 07 (à écrire). Les deux ont un bon SDK Firestore offline.
