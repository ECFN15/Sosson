# ADR 0001 — Plateforme : Firebase/GCP plutôt que Supabase

> **Statut** : Accepté
> **Date** : 2026-04-22
> **Auteurs** : fondateur
> **Remplace** : —
> **Remplacé par** : —

## Contexte

Sosson démarre. Un premier prototype a été entamé sur **Supabase** (PostgreSQL, Auth, Storage, Edge Functions). Le projet comporte une composante IA forte : extraction de données structurées depuis des PDF de factures fournisseurs, avec possibilité d'étendre à d'autres tâches (synthèse de comptes-rendus, classification, suggestion).

Le choix de plateforme SaaS engage sur 10-20 ans la majorité de l'infrastructure. Il impacte :
- le coût infrastructure par tenant (invariant §5.4 de la doc racine),
- la productivité de développement (DX, typage, intégrations),
- la qualité des intégrations IA (extraction multimodale),
- le risque de lock-in vendor.

## Options envisagées

### Option A — Supabase (statu quo du prototype)
- ✅ PostgreSQL natif, accès complet SQL, extensions libres.
- ✅ Row Level Security mature, modèle d'autorisation élégant.
- ✅ Realtime DB out-of-the-box (listener sur tables).
- ✅ Open-source, self-hostable si besoin.
- ✅ Coût d'entrée faible (free tier exploitable, puis ~25 $/mois).
- ❌ IA : pas d'intégration native. Chaque appel modèle est à câbler manuellement (SDK OpenAI/Vertex + schéma maison + observabilité maison).
- ❌ Cold storage : Storage Supabase ne propose pas de classes équivalentes à Nearline/Coldline/Archive de GCS. Il faudrait externaliser vers S3/GCS pour l'archivage.
- ❌ Ecosystème IA européen moins riche.

### Option B — Firebase / Google Cloud
- ✅ **Genkit + Gemini** : meilleure combinaison du marché pour du multimodal structuré (extraction PDF/image → JSON), avec observabilité native (traces, coûts, evals).
- ✅ **Cloud Storage classes** (Standard / Nearline / Coldline / Archive) : stratégie d'archivage long terme simple, économique, avec lifecycle rules déclaratives.
- ✅ **Firebase Data Connect** (GA) : PostgreSQL managé (Cloud SQL) derrière une couche GraphQL typée, SDKs générés.
- ✅ Firebase Auth (Identity Platform) : multi-tenant, battle-tested.
- ✅ IAM et billing unifiés avec le reste de GCP (utile pour futures extensions).
- ❌ Coût minimum plus élevé : Cloud SQL a un socle incompressible (~10-50 $/mois) même à très faible trafic. Supabase est plus doux en dessous de 100 clients.
- ❌ Data Connect est plus jeune que l'écosystème Supabase : moins de ressources communautaires, API encore en évolution.
- ❌ Lock-in plus marqué, surtout sur la couche GraphQL Data Connect (le Postgres sous-jacent, lui, reste portable).
- ❌ Realtime non natif sur Data Connect (Firestore le fait, mais on ne l'utilise pas pour la source de vérité relationnelle).

### Option C — Architecture hybride (Supabase pour la DB + GCP pour l'IA et le stockage)
- ✅ Meilleur du DB Supabase + meilleur de l'IA Google.
- ❌ Double plateforme = double compte, double billing, double IAM, double incident à diagnostiquer.
- ❌ Aucune synergie (pas d'auth partagée, pas de triggers cross-plateforme natifs).
- ❌ Coût cognitif de maintenance sur 10-20 ans : chaque nouveau développeur doit apprendre deux écosystèmes.

## Décision

**Firebase / Google Cloud** (Option B) pour l'ensemble de la plateforme : Auth, persistance relationnelle (Data Connect), Functions, Storage, IA (Genkit).

Le facteur décisif est la **combinaison Genkit + Gemini + Cloud Storage Archive**, qui cible précisément les deux fonctionnalités différenciantes du produit : extraction IA de factures et archivage long terme économique.

## Conséquences

### Positives
- Intégration IA de premier niveau, productivité maximale sur les flows Genkit.
- Stratégie d'archivage long terme (10-20 ans) résolue par les classes de stockage natives.
- Une seule plateforme à apprendre, un seul billing, un seul IAM.
- Data Connect = vraie Postgres sous le capot, donc la donnée reste portable même si on quitte Firebase un jour.

### Négatives / Coûts
- **Socle de coût** : on paie Cloud SQL dès le jour 1 (~10-30 $/mois sur une db-f1-micro / db-g1-small). Acceptable sachant le prix cible d'abonnement PME.
- **Lock-in GraphQL** : la couche Data Connect est propriétaire. Si on quitte, on refait cette couche (mais on garde les données Postgres).
- **Courbe d'apprentissage Data Connect** : techno récente, documentation encore en maturation, moins d'exemples communautaires que Supabase.
- **Pas de realtime gratuit** sur la donnée relationnelle. À compenser si le besoin émerge (Pub/Sub, listeners custom, ou Firestore pour états éphémères).

### Neutres / À surveiller
- Revue annuelle du coût d'infrastructure réel vs. l'estimé (chapitre 09 de la doc, à écrire). Si le coût dérape, alternatives possibles : réduire l'empreinte Cloud SQL (instances plus petites), ou, cas extrême, migration.
- Surveillance de la roadmap Data Connect : si des fonctionnalités attendues (par ex. realtime natif) n'arrivent pas, ré-évaluer.
- Le prototype Supabase existant est **abandonné** — migration à faire vers Firebase. Pas de dual-run.

## Questions ouvertes

- **Région GCP** : à acter (probablement `europe-west1` Belgique ou `europe-west9` Paris pour la résidence RGPD). Traité en ADR dédié lors de la création du projet GCP.
- **Identity Platform vs Firebase Auth "classique"** : Identity Platform est nécessaire si on veut du multi-tenancy fort. À acter à la mise en place de l'auth (chapitre 06, à écrire).
