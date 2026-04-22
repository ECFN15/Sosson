# Chapitre 99 — Glossaire

> **Statut** : stable (évolutif — à mettre à jour à chaque ajout de vocabulaire métier ou technique)
> **Dernière révision** : 2026-04-22

Référence canonique du vocabulaire du projet. **Tout terme métier utilisé dans la documentation doit apparaître ici.** En cas de conflit de sens entre un chapitre et le glossaire, le glossaire fait foi — et le chapitre doit être corrigé.

---

## A

### Adapter
(technique, Hexagonal) Composant qui relie le **domaine** à une infrastructure externe (Data Connect, Storage, Genkit). Les adapters sont remplaçables ; le domaine ne l'est pas. Voir [02 §2.1](02-architecture.md).

### ADR (Architecture Decision Record)
Document immuable qui trace une décision structurante. Voir [docs/adr/](adr/README.md).

### Archive (au sens Sosson)
État terminal d'un chantier clôturé dont les données relationnelles ont été sérialisées en `fiche_client.json` et déplacées en Cloud Storage Archive class. Le fichier d'archive sur GCS bénéficie d'**Object Versioning** (anti-écrasement). **Pas de Retention Lock en V1** : la suppression reste possible via procédure `purgeArchive` réservée `OWNER`, tracée dans `AuditLog`, pour honorer le droit RGPD à l'effacement. Voir [05 §5.6.1](05-archival-strategy.md). Les modifications en base d'une donnée vivante restent autorisées et **tracées via `AuditLog`** (voir [ADR 0007](adr/0007-not-a-billing-tool.md)).

### Archive class (Cloud Storage)
Classe de stockage GCS la moins chère (~0,004 $/Go/mois), destinée aux données rarement accédées. Latence de récupération de quelques secondes à minutes. Voir [ADR 0004](adr/0004-cold-storage-strategy.md).

## B

### Bounded context
(DDD) Frontière logique d'un sous-domaine métier avec son propre vocabulaire et ses propres invariants. Sosson en compte **12** (v0.2) — voir [02 §2.3](02-architecture.md).

## C

### Chantier
Unité de travail livrable pour un client. Pivot du modèle : tout (devis, factures, photos, comptes-rendus, factures fournisseurs) s'y rattache. Statuts : `PROSPECT`, `EN_COURS`, `SUSPENDU`, `CLOS`, `ARCHIVE`.

### Chef de chantier
Rôle métier : utilisateur responsable de l'exécution d'un ou plusieurs Chantiers. Utilisateur principal du frontend mobile.

### Client
Client final de l'entreprise. Un Client peut être particulier ou professionnel. Sert de pivot pour regrouper chantiers, emails, documents et factures.

### Cloud SQL
Service GCP de Postgres managé. Sous-jacent à Firebase SQL Connect. Voir [ADR 0009](adr/0009-sql-connect-repivot-justification.md).

### Cloud Functions (v2)
Fonctions serverless Node.js/TS sur GCP. Utilisées pour : orchestration (archivage, génération PDF), triggers d'événements, webhooks, appel de flows Genkit.

### CMEK (Customer-Managed Encryption Key)
Clé de chiffrement gérée par le client (vs. gérée par Google). Envisagée pour exigences entreprise — non activée en v1.

### Cold storage
Synonyme d'Archive class en pratique. Voir §5.2 de [03 — Données](03-data-architecture.md).

### Compte-rendu
Note texte rédigée par un utilisateur sur un Chantier, en Markdown, éventuellement avec photos associées. Souvent rédigé depuis mobile par un chef de chantier, parfois en offline. Enrichi par le flow `synthetiseCR` (mots-clés pour recherche).

## D

### Data Connect (Firebase)
Ancien nom de **SQL Connect**. Renommé par Google en 2026. Voir **SQL Connect**.

### SQL Connect (Firebase, ex-Data Connect)
Service Firebase exposant une base PostgreSQL (Cloud SQL) derrière une couche GraphQL typée avec SDKs auto-générés (JS, Kotlin, Swift, Flutter). Source de vérité relationnelle de Sosson. Supporte recherche vectorielle et full-text search natifs. Voir [ADR 0009](adr/0009-sql-connect-repivot-justification.md) *(ADR 0002 remplacé par 0009)*.

### Devis
Proposition commerciale chiffrée adressée au Client. Statuts : `BROUILLON`, `ENVOYE`, `ACCEPTE`, `REFUSE`, `EXPIRE`. **Modifications après envoi tracées dans `AuditLog`, pas interdites** ([ADR 0007](adr/0007-not-a-billing-tool.md) : Sosson n'est pas un outil fiscal). Un Devis ne se convertit pas en Facture dans Sosson : la FactureCliente est **importée** depuis le logiciel comptable externe (voir [03 §3.4.2](03-data-architecture.md)).

## E

### ~~Entreprise~~ *(déprécié v0.2)*
Entité supprimée du modèle depuis la refonte mono-tenant ([ADR 0006](adr/0006-internal-tool-scope.md)). Sosson est désormais un outil interne à **une seule entreprise** — aucun champ `entrepriseId` ni type `Entreprise` ne doit apparaître dans le code ou le schéma.

### Eval (dataset d'évaluation)
Ensemble de cas réels anonymisés utilisé pour mesurer la qualité d'un flow Genkit avant mise en prod. Seuil minimum : 50 cas. Voir [04 §4.7.2](04-intelligence.md).

### Firestore
Base NoSQL document de Firebase (tiroirs indépendants, JSON par document). **Pas source de vérité dans Sosson** — voir [ADR 0005](adr/0005-firestore-adjoint-only.md). Utilisée uniquement comme **adjoint temps réel optionnel** (présence, notifications live, feeds éphémères).

## F

### FactureCliente
**Import** de la facture émise ailleurs (logiciel comptable externe). Pas émise depuis Sosson. Sert uniquement à la traçabilité opérationnelle ("qu'a-t-on facturé sur ce chantier"). Voir [ADR 0007](adr/0007-not-a-billing-tool.md).

### FactureFournisseur
Document de facturation **reçu** d'un tiers (matériel, sous-traitant, location). Cible #1 des flows IA `extractFactureFournisseur` + `categoriseDepense`. Voir [04 §4.4](04-intelligence.md). Déclinée en **LigneDepense** pour alimenter les dashboards.

### `fiche_client.json`
Fichier JSON auto-suffisant produit lors de l'archivage d'un Chantier. Contient toutes les données relationnelles du dossier. Schéma versionné en SemVer. Voir [05 §5.3](05-archival-strategy.md).

### Flow (Genkit)
Fonction TypeScript typée orchestrant un appel d'IA (prompt, modèle, validation Zod, post-processing). Unité de base de la couche Intelligence. Voir [04 §4.3](04-intelligence.md).

## G

### Gemini
Famille de modèles LLM multimodaux de Google. Modèle par défaut de Sosson : Gemini Flash (2.x). Pro utilisé ponctuellement pour génération longue.

### Genkit (Firebase)
Framework d'orchestration IA de Firebase. Fournit : définition typée de flows, validation Zod, observabilité native (traces, coûts), portabilité entre modèles. Voir [ADR 0003](adr/0003-genkit-ai-layer.md).

### GCS (Google Cloud Storage)
Service de stockage objet de GCP. Utilisé en deux buckets : `sosson-{env}-media` (hot, Standard class) et `sosson-{env}-archives` (cold, Archive class).

## H

### Hexagonal (architecture)
Pattern ports-and-adapters. Le cœur métier (domaine) est isolé des infrastructures par des interfaces (ports). Les infrastructures l'entourent (adapters). Voir [02 §2.1](02-architecture.md).

### Hot / Warm / Cold
Phases du cycle de vie d'un dossier chantier. Hot = actif (lecture/écriture). Warm = clôturé mais en base (lecture seule logique). Cold = archivé en GCS Archive. Voir [03 §3.2](03-data-architecture.md).

## I

### Identity Platform
Version enterprise de Firebase Auth. **Non utilisée dans Sosson** depuis la refonte mono-tenant ([ADR 0006](adr/0006-internal-tool-scope.md)) : Firebase Auth classique suffit. Voir [chapitre 10 — Sécurité §10.3.1](10-securite.md).

### Invariant
Règle architecturale non-négociable. Traverse toute l'application. Un changement d'invariant requiert un ADR. Liste : §5 de [documentation.md](../documentation.md).

## L

### LigneDepense
Ligne de détail d'une `FactureFournisseur`, catégorisée par le flow IA `categoriseDepense`. Clef de voûte des dashboards prévisionnels par catégorie. Exemple : facture Leroy Merlin de 1 200 € → `bois: 800 €`, `quincaillerie: 300 €`, `divers: 100 €`.

## M

### `MANIFEST.json`
Fichier compagnon de `fiche_client.json` dans chaque archive. Liste les fichiers, leur taille, leur SHA-256. Permet la vérification d'intégrité. Voir [05 §5.3.4](05-archival-strategy.md).

### Mono-tenant
Sosson sert **une seule entreprise** (celle qui l'a développé). Aucune structure n'anticipe le multi-tenancy. Voir [ADR 0006](adr/0006-internal-tool-scope.md). *(Remplace le concept "multi-tenant" de la v0.1.)*

## P

### PME
Petite et Moyenne Entreprise. Cible client de Sosson (5-50 salariés typiquement).

### Prompt
Texte d'instruction envoyé à un LLM. Dans Sosson : `const` TypeScript versionnée dans `src/ai/prompts/`, jamais dynamique à 90 %. Voir [04 §4.4.3](04-intelligence.md).

## R

### RGPD
Règlement général sur la protection des données (UE). Contraint : résidence, minimisation, portabilité, droit à l'effacement. Impact structurel : région GCP européenne, format d'archive exportable. Voir [ADR 0004](adr/0004-cold-storage-strategy.md) et [chapitre 10 — Sécurité §10.9](10-securite.md).

### RLS (Row Level Security)
Politique Postgres restreignant l'accès aux lignes par règle. Dans Sosson mono-tenant : utilisée en défense en profondeur (au-delà des règles SQL Connect) pour les entités sensibles (Email, FactureFournisseur, AuditLog). Détaillé en [chapitre 10 §10.4.4](10-securite.md).

## S

### ~~SaaS B2B~~ *(déprécié v0.2)*
Concept retiré : Sosson n'est pas un SaaS mais un outil interne à une seule entreprise. Voir [ADR 0006](adr/0006-internal-tool-scope.md).

### Schéma d'archive
Format de `fiche_client.json`. Versionné en SemVer (`archiveVersion`). Pas de MAJOR en pratique — additions uniquement. Voir [05 §5.4](05-archival-strategy.md).

### SemVer
Semantic Versioning : MAJOR.MINOR.PATCH. Utilisé pour le schéma d'archive et la doc racine.

### SIRET
Identifiant unique d'établissement en France (14 chiffres). Stocké optionnellement sur Client (si professionnel) et fournisseur (extrait des factures).

### Score de confiance IA (`scoreConfiance`)
Champ obligatoire en sortie de tout flow d'extraction. Valeur [0,1] auto-évaluée par le modèle. Alimente le workflow de validation humaine.

## T

### ~~Tenant~~ *(déprécié v0.2)*
Concept retiré : Sosson est mono-tenant ([ADR 0006](adr/0006-internal-tool-scope.md)).

### Trace (Genkit)
Enregistrement complet d'une exécution de flow : input, output, durée, tokens, coût, modèle. Stocké en prod via Cloud Logging. Voir [04 §4.7](04-intelligence.md).

### TVA
Taxe sur la valeur ajoutée. Taux fréquents en France : 20 %, 10 %, 5,5 %, 0 %. Stockée en Decimal (ex. `0.20`).

## U

### User
Utilisateur humain interne à l'entreprise. Rôles : `OWNER`, `ADMIN`, `OPERATOR`, `MOBILE` (accès mobile restreint pour chefs de chantier), `VIEWER`. Mappé 1-1 avec Firebase Auth via `firebaseUid`.

## V

### Vertex AI
Service GCP fournissant les modèles Gemini à Sosson via Genkit. Offre entreprise : les données ne sont pas utilisées pour entraîner les modèles (à valider contractuellement).

## Nouveaux termes v0.2

### AuditLog
Trace technique de toute modification sensible (création / édition / suppression). Immuable. Consultable uniquement par `ADMIN`/`OWNER`.

### Categorie
Taxonomie hiérarchique des postes de dépense BTP (Bois > Chevron, Prestations > Sous-traitance...). Enrichie dans le temps par l'équipe. Clef des dashboards analytiques.

### Creneau
Bloc temporel du planning sur un chantier. Peut être de type `TRAVAUX`, `RDV_CLIENT`, `LIVRAISON`, `AUTRE`. Synchronisable avec Google Calendar via `googleCalendarEventId`.

### Email (entité Sosson)
Copie d'un email Gmail ingéré par Sosson. Champs enrichis par IA : `priorite`, `categorie`, `statutRattachement`. Associé à un Client et/ou un Chantier via `EmailRattachement`.

### Event
Trace fonctionnelle d'une action métier (devis envoyé, facture validée, email urgent reçu, chantier clôturé...). Alimente la timeline unifiée d'une fiche client ou chantier.

### Gmail API
API Google pour accéder à la boîte mail de l'entreprise en lecture. Utilisée via OAuth domain-wide delegation. Voir [06 §6.2](06-integrations.md).

### Google Calendar API
API Google pour synchroniser le planning Sosson avec les agendas personnels des utilisateurs. Voir [06 §6.3](06-integrations.md).

### Hub opérationnel
Positionnement de Sosson : outil de centralisation opérationnelle non fiscal. Voir [ADR 0007](adr/0007-not-a-billing-tool.md).

### Rattachement email ↔ chantier
Processus par lequel un Email ingéré est lié automatiquement par IA à un Client et/ou Chantier. Flow : `rattacheEmailAuChantier`. Si score de confiance IA < seuil : passage en file "à confirmer".

### Versionnage (du schéma d'archive)
Voir **Schéma d'archive**.

## Z

### Zod
Bibliothèque TS de validation de schémas à l'exécution. Utilisée pour : valider entrées/sorties de flows Genkit, valider payloads Cloud Functions, générer formulaires typés côté frontend.

---

*Retour* : [documentation.md](../documentation.md).
