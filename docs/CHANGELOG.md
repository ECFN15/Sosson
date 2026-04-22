# Changelog — Documentation Sosson

> Ce fichier suit les évolutions de la **documentation**, pas du code.
> Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Version SemVer du document en tête de [documentation.md](../documentation.md).

Les sections possibles : `Ajouté`, `Modifié`, `Déprécié`, `Retiré`, `Corrigé`, `Sécurité`.

---

## [0.2.1] — 2026-04-22 — Stabilisation documentaire post-audit

### Contexte
Audit externe (Codex) sur la base v0.2.0 a relevé 6 points de dette : ADR 0002 invalidé sur le fond mais toujours `Accepté`, chapitre 05 archivage désaligné du modèle, chapitre sécurité fantôme, scope V1 large, coûts optimistes (un seul env chiffré sur 3), glossaire désynchronisé (7 vs 12 bounded contexts). Cette version clôt les 5 points factuels. Le 6ᵉ (scope V1) reste à arbitrer en phase de planification.

### Ajouté
- [ADR 0009](adr/0009-sql-connect-repivot-justification.md) : re-justification de Firebase SQL Connect après repivot. Remplace [ADR 0002](adr/0002-data-connect-relational.md) dont la motivation (fiscalité, multi-tenant) était invalidée par les ADRs 0006/0007.
- **Nouveau chapitre** [10 — Sécurité & Autorisations](10-securite.md) : modèle de menace, rôles et ACL chantier, Firebase Auth + MFA, OAuth Google (Gmail/Calendar, scopes minimums, rotation), règles SQL Connect + RLS Postgres, règles Firestore, Cloud Storage (liens signés, buckets privés), Secret Manager, observabilité sécurité (alerting), RGPD (collecte, droits, sous-traitants), checklist V1.
- §9.1.1 dans [09 — Coûts](09-couts.md) : hypothèse explicite — le chiffrage `< 30 €/mois` couvre prod uniquement ; dev en Stop/Start, staging à la demande, local sur émulateurs.

### Modifié
- `documentation.md` racine : bump **0.2.0 → 0.2.1**. Ajout chap 10 au sommaire. ADR 0002 marqué `Superseded by 0009`. Guide IA enrichi.
- [ADR 0002](adr/0002-data-connect-relational.md) : statut passé à `Superseded by 0009`, bandeau d'avertissement en tête.
- [ADR 0001](adr/0001-platform-firebase.md) : question ouverte "Identity Platform vs Firebase Auth" tranchée (pointeur vers ADR 0006 + chap 10).
- [ADR README](adr/README.md) : registre mis à jour (0002 superseded, 0009 ajouté).
- [05 — Archivage](05-archival-strategy.md) : **refonte v0.2**. Retrait de `Paiement` et du bloc `entreprise` dans l'archive. Ajout de `Email` + pièces jointes, `Event`, `AuditLog` (filtré), `LigneDepense` + `Categorie` dénormalisée, `DocumentAttache`, `Creneau` + `Assignation`, snapshot minimal `users`. Bump `archiveVersion` **1.0.0 → 1.1.0** (MINOR). Structure dossier enrichie d'un répertoire `emails/`. `MANIFEST.json` : retrait `entrepriseId`, ajout compteurs par type. Retrait des mentions "légal"/"immuable absolu" (ADR 0007).
- [99 — Glossaire](99-glossary.md) : "Bounded context" passé de 7 à **12**. Entrée `Archive` reformulée (plus d'immuabilité absolue, tracée via AuditLog). Renvois `Identity Platform`, `RGPD`, `RLS` pointent vers le chapitre 10.
- [02 — Architecture](02-architecture.md), [03 — Données](03-data-architecture.md), [04 — Intelligence](04-intelligence.md), [05 — Archivage](05-archival-strategy.md) : tous les renvois "chapitre 06 Sécurité" redirigés vers [10](10-securite.md).
- [03 — Données](03-data-architecture.md) : en-tête ADRs enrichi avec 0009.

### Corrigé
- Désynchro "7 bounded contexts" vs "12" (glossaire ↔ architecture).
- Chapitre 06 surchargé (Intégrations + Sécurité à la même adresse).
- Chiffrage 09 implicitement mono-environnement.

### À venir (non couvert par cette version)
- **Scope V1 à trancher** : arbitrer une V1 livrable (recommandation audit : V1.0 ingestion+catégorisation+dashboards, V1.1 mobile CR, V1.2 planning+Calendar).
- Chapitre 07 — Frontend (choix Flutter/RN, offline-first).
- Chapitre 08 — Opérations & Observabilité (CI/CD, backups, procédure Stop/Start Cloud SQL dev/staging).
- [04 — Intelligence](04-intelligence.md) : spécs détaillées des flows `categoriseDepense`, `trieEmail`, `rattacheEmailAuChantier`, `synthetiseCR`, `classifieExcel`.
- ADR : déclenchement d'archivage (stratégie A/B), région GCP, choix mobile.

---

## [0.2.0] — 2026-04-22 — Repivot produit (4 vagues)

### Contexte
Clarification fondamentale du périmètre : Sosson est un **outil interne** pour une **unique PME** (30-50 salariés BTP), et un **hub opérationnel non fiscal**, pas un SaaS de facturation. Cette clarification invalide plusieurs hypothèses de la v0.1.x et a déclenché une refonte en 4 vagues, toutes livrées en un seul commit documentaire.

### Ajouté
- [ADR 0006](adr/0006-internal-tool-scope.md) : mono-tenant assumé. Annule l'invariant §5.5 multi-tenant.
- [ADR 0007](adr/0007-not-a-billing-tool.md) : hub opérationnel, pas outil fiscal. Retire les contraintes légales (numérotation continue, immuabilité stricte, Factur-X, PDP).
- [ADR 0008](adr/0008-architecture-postgres-firestore-hybrid.md) : choix d'architecture Option β (Postgres via SQL Connect + Firestore adjoint + GCS + Genkit). Règle simple "où ranger une donnée".
- **Nouveau chapitre** [06 — Intégrations externes](06-integrations.md) : Gmail API + Pub/Sub (cœur V1), Google Calendar (V2), logiciel comptable, Excel first-class, migration legacy.
- **Nouveau chapitre** [09 — Modèle de coûts](09-couts.md) : hypothèses de volume Sosson réelles, décomposition mensuelle par poste, guardrails Genkit, projection 3-5 ans, justification ROI vs outils actuels.

### Modifié
- `documentation.md` racine : bump **0.1.1 → 0.2.0**. Invariants §5 refondus (7 invariants). Sommaire mis à jour avec statuts v0.2.
- [01 — Vision](01-vision.md) : **réécriture complète**. Hub opérationnel interne, 5 personas internes, 6 cas d'usage fondateurs (ingestion documents, dashboards, emails, fiches unifiées, planning, CR mobile). Excel élevé en cas d'usage explicite. Portail client externe positionné comme extension future.
- [02 — Architecture](02-architecture.md) : **refondu v0.2**. Nouveau diagramme incluant Firestore + Gmail + Calendar. 12 bounded contexts (vs 7), dont 5 nouveaux : Catégorisation & Analytics, Ingestion Email, Planning & Équipe, Ingestion Documents Divers, Traçabilité. 5 flux de référence (vs 3), dont 2 nouveaux : ingestion email entrante + CR mobile offline. Règles d'or SQL Connect vs Firestore modernisées. Portabilité étendue aux APIs Google.
- [03 — Données](03-data-architecture.md) : **refondu v0.2**. Suppression entité `Entreprise` et discriminant `entreprise: Entreprise!` sur toutes les tables. Schéma passé de 13 à 23 entités : ajout `Categorie`, `LigneDepense`, `Email`, `EmailRattachement`, `EmailPieceJointe`, `DocumentAttache`, `Equipe`, `MembreEquipe`, `Creneau`, `Assignation`, `Event`, `AuditLog`. `FactureCliente` devient un **import** (plus émise). Suppression `Paiement` (pas fiscal). Numérotation non fiscale. Indexes full-text `tsvector` explicités. Rôle `MOBILE` ajouté.
- [ADR README](adr/README.md) : registre enrichi (0006, 0007, 0008).
- [99 — Glossaire](99-glossary.md) : entrées `Entreprise`, `SaaS B2B`, `Tenant`, `Paiement` dépréciées. Identity Platform recadré. Ajout entrées : `LigneDepense`, `Mono-tenant`, `AuditLog`, `Categorie`, `Creneau`, `Email` (entité), `Event`, `Gmail API`, `Google Calendar API`, `Hub opérationnel`, `Rattachement email ↔ chantier`. Rôle `MOBILE` documenté.

### Retiré (déprécié)
- Entité `Entreprise` du modèle de domaine.
- Entité `Paiement` (hors scope non fiscal).
- Champ `FactureLigne` (FactureCliente étant désormais un import, ses lignes viennent du PDF externe).
- Invariant "Multi-tenant dès le jour 1".
- Invariant "Les archives sont immuables" (remplacé par "les modifications sont tracées via AuditLog").
- Toute référence à Factur-X, PDP, NF203, rétention légale 10 ans, numérotation fiscale continue.

### À venir (non couvert par cette refonte)
- [04 — Intelligence](04-intelligence.md) à compléter : ajouter les spécifications des flows `categoriseDepense`, `trieEmail`, `rattacheEmailAuChantier`, `synthetiseCR`, `classifieExcel`.
- Chapitre 07 — Frontend (web + mobile, offline-first, choix Flutter/RN).
- Chapitre 08 — Opérations & Observabilité (CI/CD, backups, monitoring).
- Chapitre 05 — Archivage : mise à jour du schéma `fiche_client.json` v1.1 pour inclure les nouvelles entités (emails, events).
- ADR de déclenchement d'archivage (stratégie A/B).
- ADR sur le choix mobile (Flutter vs React Native).

---

## [0.1.1] — 2026-04-22

### Modifié
- **Renommage Google : Data Connect → SQL Connect.** APIs inchangées, aucune migration code. Note ajoutée en tête de [ADR 0002](adr/0002-data-connect-relational.md). Glossaire et tableaux de décisions mis à jour. Les mentions historiques à « Data Connect » dans les chapitres restent lisibles (glossaire pointe les deux termes).
- [02 — Architecture](02-architecture.md) : ajout d'une section §2.7 « Coexistence SQL Connect + Firestore (règles d'or) ». Ancienne §2.7 Portabilité devient §2.8.
- Glossaire : ajout des entrées **SQL Connect** et **Firestore**.

### Ajouté
- [ADR 0005](adr/0005-firestore-adjoint-only.md) : politique Firestore adjoint uniquement, jamais source de vérité. Interdit Realtime Database. Fixe 5 règles d'or + mécanisme d'addendum par collection Firestore.

---

## [0.1.0] — 2026-04-22

Première version de la fondation documentaire. Architecture et Intelligence entièrement posées. Domaines transverses (Sécurité, Frontend, Opérations, Coûts) en placeholder.

### Ajouté
- `documentation.md` racine : index, conventions, invariants du projet, cycle de vie du document, guide pour IA arrivant sur le projet.
- `docs/01-vision.md` : raison d'être, personas, contraintes, non-objectifs.
- `docs/02-architecture.md` : principe hexagonal, stack, bounded contexts, flux de référence (création devis, extraction facture fournisseur, archivage chantier), environnements, frontières explicites, stratégie de portabilité.
- `docs/03-data-architecture.md` : cycle de vie hot/warm/cold, modèle de domaine, schéma Data Connect v0.1, règles de numérotation, stratégie d'indexation, gestion des migrations.
- `docs/04-intelligence.md` : positionnement de l'IA, taxonomie des flows, flow fondateur `extractFactureFournisseur` (schéma, prompt, validation), structure de flow, gouvernance des modèles, plafonds de coût, observabilité, dataset d'eval, RGPD IA.
- `docs/05-archival-strategy.md` : format d'archive (`fiche_client.json` + `MANIFEST.json` + médias), versionnage SemVer, déclenchement (stratégies A/B), classe de stockage, intégrité et désarchivage.
- `docs/99-glossary.md` : glossaire initial (~50 entrées).
- `docs/adr/README.md` : règles ADR, gabarit, registre.
- `docs/adr/0001-platform-firebase.md` : Firebase/GCP plutôt que Supabase.
- `docs/adr/0002-data-connect-relational.md` : Data Connect pour la persistance relationnelle.
- `docs/adr/0003-genkit-ai-layer.md` : Genkit + Gemini comme couche IA.
- `docs/adr/0004-cold-storage-strategy.md` : Cloud Storage Archive class pour l'archivage long terme.
- 6 invariants projet posés dans `documentation.md` §5 : souveraineté des données, frontière domaine/infra, observabilité IA, coût comme feature, multi-tenant dès j1, immuabilité des archives.

### À venir (prochains jalons de documentation)
- Chapitre 06 — Sécurité & Auth (tenants, rôles, RLS, RGPD, rotation secrets, résidence).
- Chapitre 07 — Frontend (stack UI web + mobile, temps réel, compression images).
- Chapitre 08 — Opérations & Observabilité (déploiement, CI/CD, logs, métriques, FinOps).
- Chapitre 09 — Modèle de Coûts (estimation par ligne de produit, seuils d'alerte).
- ADR de déclenchement d'archivage (stratégie A immédiate vs. B différée).
- ADR de région GCP et résidence des données.
- ADR sur Identity Platform vs. Firebase Auth standard.

---

*Retour* : [documentation.md](../documentation.md).
