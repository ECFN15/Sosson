# ADR 0003 — Couche IA : Firebase Genkit + Gemini

> **Statut** : Accepté
> **Date** : 2026-04-22
> **Auteurs** : fondateur
> **Remplace** : —
> **Remplacé par** : —
>
> **Prérequis de lecture** : [04 — Couche Intelligence](../04-intelligence.md), [ADR 0001](0001-platform-firebase.md)

## Contexte

Le cas d'usage IA fondateur de Sosson est **l'extraction de factures fournisseurs PDF** en données structurées (fournisseur, SIRET, montants, TVA par taux, dates). Cas d'usage multimodal, à haute fréquence (plusieurs dizaines de factures/mois/tenant), avec exigence de fiabilité (données comptables).

D'autres flows viendront (synthèse de compte-rendu, classification de dépenses, suggestion de rattachement). Il faut donc un **framework d'orchestration IA**, pas juste un SDK de modèle.

## Options envisagées

### Option A — SDK modèle direct (`@google/genai` ou `openai` dans Cloud Functions)
- ✅ Simple, pas d'abstraction, moins de dépendances.
- ❌ Pas d'observabilité (traces, coûts, latence) — à recoder pour chaque flow.
- ❌ Validation de sortie à écrire à la main.
- ❌ Pas de composition de flows, standard à recréer à chaque feature IA.

### Option B — Firebase Genkit + Gemini (Vertex AI)
- ✅ Observabilité native (traces par flow, tokens, coût, durée, input/output).
- ✅ Schémas Zod intégrés pour la validation et la génération structurée.
- ✅ Composition de flows, plugins, contexte unifié.
- ✅ Genkit UI en dev pour debug/replay ; export Cloud Logging en prod.
- ✅ Portable : changer de modèle = changer de plugin, pas les flows.
- ❌ Couche d'abstraction supplémentaire à maintenir.
- ❌ Produit encore jeune, API susceptible d'évoluer.

### Option C — LangChain (ou LlamaIndex) + modèle au choix
- ✅ Communauté large, nombreux connecteurs, patterns éprouvés.
- ❌ Surdimensionné pour le besoin actuel (agents, chaînes, RAG complexes non nécessaires en v1).
- ❌ DX moins fluide sur TS pur (l'écosystème est Python-first pour LangChain).
- ❌ Intégration GCP moins naturelle, observabilité à compléter par outils tiers.

## Décision

**Firebase Genkit** comme couche d'orchestration IA, avec **Gemini** comme modèle par défaut (Flash pour la majorité des tâches, Pro uniquement pour génération longue lorsque la qualité rédactionnelle l'exige).

Facteur décisif : **observabilité et validation structurée de sortie sont des exigences non-négociables** (invariants §5.3 et §5.4 de la doc racine). Genkit les fournit par défaut. Écrire la même chose à la main sur le SDK nu serait refaire Genkit en moins bien.

## Conséquences

### Positives
- Traces de flow automatiques avec durée, tokens, coût, input/output — utilisables en dev (Genkit UI) et en prod (export Cloud Logging).
- Schémas Zod utilisés comme **contrat** et comme **guide de génération structurée** (Gemini supporte le structured output natif).
- Un flow Genkit est une fonction TS typée, composable, testable hors Firebase (tests unitaires avec mocks).
- Portabilité modèle : changer Gemini → Claude → modèle open source = changer le plugin Genkit, pas les flows.

### Négatives / Coûts
- Une dépendance de plus à maintenir.
- Genkit évolue : changements mineurs d'API à absorber dans le temps.
- Courbe d'apprentissage Genkit (defineFlow, plugins, context) — modérée mais réelle pour tout nouveau contributeur.

### Neutres / À surveiller
- Stagnation ou dépréciation de Genkit sur 12 mois → signal de remise en cause.
- Gemini Flash perdant son avantage qualité/prix face à une alternative sur le dataset d'eval.
- Émergence d'un besoin RAG massif → envisager un framework spécialisé (LlamaIndex).

## Invariants complémentaires posés par cette décision

- Tout flow en production a un schéma Zod d'entrée et de sortie (voir [04 §4.4.2](../04-intelligence.md)).
- Tout flow a un plafond de coût par appel (guardrail) inscrit en dur.
- Tout flow a un dataset d'eval > 50 cas avant mise en prod (voir [04 §4.7.2](../04-intelligence.md)).
- Les prompts sont des `const` versionnées dans `src/ai/prompts/`, jamais chaînes dynamiques à 90 %.
- Les artefacts intellectuels (prompts, schémas, validateurs) vivent dans le repo, pas dans Genkit — si Genkit disparaît, ils restent exploitables.

## Questions ouvertes

- **Déploiement des flows** : Cloud Functions v2 direct vs. Cloud Run dédié pour les flows longs ? À trancher au premier flow dépassant 60 s d'exécution.
- **Région Vertex AI** : cohérente avec la région du projet (europe-west*). Figer lors du setup GCP.
- **Contrat Vertex AI** : vérifier que les données transmises à Gemini ne sont pas utilisées pour entraîner les modèles (offre entreprise). À documenter en ADR dédié à la signature.
