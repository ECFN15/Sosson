# Chapitre 04 — Couche Intelligence

> **Statut** : stable (cadre posé, flows détaillés à prototyper)
> **Dernière révision** : 2026-04-22
> **Prérequis** : [02 — Architecture](02-architecture.md), [03 — Données](03-data-architecture.md)
> **ADRs référencés** : [0003](adr/0003-genkit-ai-layer.md)

---

## 4.1 Positionnement de l'IA dans Sosson

L'IA dans Sosson est un **outil de productivité ciblé**, pas un paradigme UI. L'utilisateur ne parle pas à Sosson comme à un chatbot ; Sosson utilise l'IA pour :

1. **Lire ce qu'un humain n'a pas envie de lire** (facture fournisseur PDF → données structurées).
2. **Écrire ce qu'un humain écrirait à moitié** (compte-rendu chantier court → version structurée et formatée).
3. **Suggérer ce qu'un humain oublierait** (détection d'une facture fournisseur non rattachée à un chantier, détection d'un chantier clôturable).

Cas d'usage **explicitement hors scope initial** :
- ❌ Chatbot client général.
- ❌ Génération libre de devis (risque juridique et d'erreur trop élevé).
- ❌ Recommandation d'actions critiques sans validation humaine.

**Principe** : toute sortie IA qui atterrit en base passe par un **état intermédiaire `à valider`** et un clic humain. Voir invariant §5.3 du [documentation.md](../documentation.md) racine.

## 4.2 Genkit : ce qu'on en attend

Genkit joue trois rôles :

1. **Orchestration** : un flow = une fonction TS typée, composable, tracée. On appelle des modèles, on enchaîne des étapes, on valide la sortie.
2. **Observabilité native** : chaque exécution produit une trace avec durée, tokens, coût, inputs/outputs. Indispensable pour le FinOps (invariant §5.4 racine).
3. **Portabilité** : un flow Genkit n'est pas couplé à un modèle précis. Changer Gemini → Claude → Llama se fait en changeant le plugin, pas le flow.

**Ce qu'on n'attend pas de Genkit** :
- Ce n'est **pas un ORM ni un cache**. Les données persistent via Data Connect, les caches éventuels via Redis/Memorystore.
- Ce n'est **pas un système d'autorisation**. L'auth est faite en amont (Cloud Function ou Data Connect), Genkit reçoit déjà un contexte de confiance.

## 4.3 Taxonomie des flows

On classe les flows par **forme de sortie**, pas par fonctionnalité. C'est ce qui détermine la stratégie de prompt, le modèle, la validation, et le coût.

| Famille | Forme de sortie | Modèle par défaut | Exemple |
|---|---|---|---|
| **Extraction** | JSON structuré strict (schéma Zod figé) | Gemini Flash (multimodal) | `extractFactureFournisseur` |
| **Synthèse** | Texte court structuré (Markdown cadré) | Gemini Flash | `synthetiseCompteRendu` |
| **Classification** | Enum / labels | Gemini Flash | `categoriseDepenseFournisseur` |
| **Suggestion** | Liste d'actions ou d'items candidats | Gemini Flash/Pro selon complexité | `suggereRattachementChantier` |
| **Génération longue** | Rédaction complète (email, courrier) | Gemini Pro | `redigeRelanceFactureImpayee` (futur) |

**Règle** : un nouveau flow doit être classé dans une famille existante. Créer une nouvelle famille = ADR.

## 4.4 Flow fondateur : `extractFactureFournisseur`

C'est le flow **prioritaire** du projet. Il détermine les conventions pour tous les suivants.

### 4.4.1 Responsabilité

Entrée : URI Cloud Storage d'un PDF (facture fournisseur).
Sortie : objet JSON conforme à `FactureFournisseurExtraite`, ou erreur explicite.

Le flow **ne persiste pas**. Il retourne. C'est l'appelant (Cloud Function `onPdfUploaded`) qui insère en base.

### 4.4.2 Schéma de sortie (contrat)

Le schéma de sortie est **versionné dans le repo**, pas dans Genkit. Fichier cible : `src/ai/schemas/facture-fournisseur.ts`.

```ts
// Vue d'intention — la forme exacte sera figée en implémentation
export const FactureFournisseurExtraiteSchema = z.object({
  fournisseur: z.object({
    nom: z.string().min(1),
    siret: z.string().regex(/^\d{14}$/).nullable(),
    adresse: z.string().nullable(),
  }),
  document: z.object({
    numero: z.string().nullable(),
    dateEmission: z.string().date().nullable(),       // YYYY-MM-DD
    dateEcheance: z.string().date().nullable(),
  }),
  montants: z.object({
    devise: z.enum(['EUR', 'USD', 'GBP', 'CHF']).default('EUR'),
    montantHT: z.number().nonnegative().nullable(),
    montantTTC: z.number().nonnegative().nullable(),
    tvaParTaux: z.array(z.object({
      taux: z.number().min(0).max(1),                  // 0.20, 0.10, 0.055
      base: z.number().nonnegative(),
      montant: z.number().nonnegative(),
    })),
  }),
  meta: z.object({
    scoreConfiance: z.number().min(0).max(1),
    champsIncertains: z.array(z.string()),             // chemins JSON des champs à revoir
    langueDetectee: z.string().length(2).nullable(),
  }),
});
```

**Conventions critiques** :
- **Tout champ pouvant être absent est `nullable()`, pas omis.** Facilite la validation, évite les ambiguïtés.
- **Les dates sont des strings ISO**, pas des `Date()`. Sérialisables en JSON, pas de fuseau horaire implicite.
- **`scoreConfiance` et `champsIncertains` sont obligatoires.** Pas de sortie IA sans auto-évaluation. Alimente le workflow humain de validation.

### 4.4.3 Prompt — principes

Le prompt complet est versionné dans `src/ai/prompts/extract-facture-fournisseur.prompt.ts`. Squelette :

```
SYSTEM:
Tu es un extracteur de données comptables. Tu analyses des factures fournisseurs
françaises (et occasionnellement anglophones) reçues par une PME du BTP.

Ta sortie DOIT être un JSON STRICT conforme au schéma fourni.
Tu NE DOIS PAS inventer de valeur. Si un champ n'est pas lisible, mets null et
ajoute son chemin dans `meta.champsIncertains`.

Tu produis un `scoreConfiance` global dans [0,1] basé sur :
- lisibilité du document (OCR propre ? scan penché ? manuscrit ?)
- cohérence arithmétique (HT + TVA = TTC à 0.01 près ?)
- présence des champs légaux obligatoires (SIRET, numéro, date).

USER:
[document PDF ou image en entrée multimodale]
Extrais les données selon le schéma.
```

**Règles de prompt engineering pour Sosson** :
1. **Pas de "few-shot" en prompt système.** Si on veut des exemples, on passe par des evals/datasets Genkit, pas par le prompt (évite la dérive et l'inflation de tokens).
2. **Contraintes avant instructions.** Les règles dures ("tu ne dois pas inventer") en haut.
3. **Format de sortie délégué à Genkit** : on utilise `output: { schema: ... }` de Genkit, qui injecte la bonne grammaire selon le modèle. On ne re-décrit pas le schéma en texte.
4. **Langue** : français pour les prompts métier (on cible des PME françaises, les factures sont en FR).

### 4.4.4 Cohérence arithmétique côté code

Le modèle peut produire un JSON formellement valide mais **numériquement incohérent** (somme HT + TVA ≠ TTC). Le flow effectue une **validation post-IA** en TS pur :

```ts
// Intention — pas l'implémentation finale
function verifieCoherenceArithmetique(ext: FactureFournisseurExtraite): ValidationResult {
  const totalTva = ext.montants.tvaParTaux.reduce((s, t) => s + t.montant, 0);
  const diff = Math.abs((ext.montants.montantHT ?? 0) + totalTva - (ext.montants.montantTTC ?? 0));
  if (diff > 0.02) return { ok: false, raison: 'HT+TVA ≠ TTC', ecart: diff };
  return { ok: true };
}
```

Si l'incohérence est forte : on baisse `scoreConfiance`, on ajoute les champs concernés à `champsIncertains`, et on retourne quand même — l'humain tranchera. **On ne re-prompte pas le modèle** pour corriger : c'est coûteux et peu fiable. On confie à l'humain.

### 4.4.5 Erreurs gérées explicitement

| Cas | Comportement |
|---|---|
| PDF illisible / OCR vide | Flow retourne `{ statutExtraction: 'REJETE', raison: 'pdf_illisible' }` |
| Modèle timeout (> 60s) | Retry 1 fois avec Gemini Flash, sinon erreur explicite |
| JSON non conforme au schéma | Retry 1 fois avec reminder "respect schéma", sinon échec |
| Coût au-dessus d'un plafond (guard rail) | Abandon, log, notification admin |
| Document clairement pas une facture | `REJETE` + raison `pas_une_facture` (classification rapide en pré-étape) |

Ces comportements sont **implémentés dans le flow**, pas laissés au caller. Un flow est responsable de ses propres modes d'échec.

## 4.5 Structure d'un flow Genkit (convention projet)

Tout flow respecte cette structure de fichier :

```
src/ai/flows/<nom-kebab>/
├── index.ts           # défini et export le flow Genkit (ai.defineFlow)
├── schema.ts          # schémas Zod d'entrée et sortie
├── prompt.ts          # prompt(s) versionné(s)
├── validators.ts      # validations post-IA en TS pur
└── flow.test.ts       # tests unitaires avec fixtures
```

**Règles** :
- Un flow = un dossier. Pas de fichier unique monolithique.
- Les schémas Zod sont **exportés**, réutilisables par le frontend pour afficher des formulaires typés.
- Le prompt est une **const stringifiée**, pas dynamique à 90 %. Si on a trop de conditionnels dans un prompt, c'est probablement **deux flows déguisés**.

## 4.6 Gouvernance des modèles

### 4.6.1 Choix par défaut

| Tâche | Modèle | Raison |
|---|---|---|
| Extraction facture (multimodal, PDF/image) | **Gemini 2.x Flash** | Rapport qualité/prix/latence imbattable sur ce cas. Pro uniquement si Flash échoue de manière répétée sur un type de document. |
| Synthèse compte-rendu | Gemini 2.x Flash | Court, cadré, rapide |
| Génération de courrier long | Gemini 2.x Pro | Qualité rédactionnelle |
| Classification simple | Gemini 2.x Flash | Sur-dimensionné, mais cohérent |

### 4.6.2 Règle de montée en gamme

On ne passe pas à un modèle plus cher **parce que c'est plus joli**. On y passe si :
- Le taux d'erreur de validation Zod dépasse 5 % sur le dataset d'eval.
- Le taux de `champsIncertains` non vide dépasse 30 %.
- Un nouveau type de document casse le Flash et pas le Pro.

### 4.6.3 Plafonds de coût (guardrails)

Inscrits en dur dans chaque flow :

| Flow | Budget par appel (cible) | Budget par appel (plafond dur) |
|---|---|---|
| `extractFactureFournisseur` | 0,005 € | 0,02 € |
| `synthetiseCompteRendu` | 0,002 € | 0,01 € |

Au-delà du plafond dur → abandon, log critique, alerte. Évite le scénario "un PDF pathologique consomme 200 000 tokens".

## 4.7 Observabilité & évaluations

### 4.7.1 Traces

Chaque exécution de flow en production enregistre :
- Flow name, version
- Input (**hashé** si il contient données personnelles — voir §4.8)
- Output
- Tokens in/out, coût estimé
- Durée
- Modèle utilisé

Accessible via Genkit UI en dev, et exporté vers Cloud Logging en prod.

### 4.7.2 Dataset d'évaluation

**Exigence projet** : avant qu'un flow passe en prod, il doit avoir :
- Un dataset d'au moins **50 cas réels anonymisés**.
- Une métrique définie (ex. pour `extractFactureFournisseur` : précision champ-par-champ, score de confiance vs. correction humaine).
- Un seuil minimum (ex. précision > 95 % sur les champs légaux obligatoires).

Ce dataset vit dans `src/ai/evals/<flow>/` et est ré-exécuté à chaque changement de prompt ou modèle.

### 4.7.3 Registre des régressions

Un changement de modèle ou de prompt qui fait baisser un score sur le dataset d'eval est **bloquant** pour le déploiement. Règle à imposer au niveau CI (à définir chapitre 08).

## 4.8 Données personnelles & IA

Les factures fournisseurs peuvent contenir des données personnelles (nom, adresse du client de la PME si c'est un particulier qui reçoit un service). Conséquences :

1. **Contrat Google Cloud Vertex AI** : les données envoyées à Gemini via Genkit/Vertex **ne sont pas utilisées pour entraîner** les modèles dans le cadre de l'offre entreprise. À vérifier et documenter en ADR dédié quand on signe.
2. **Résidence** : choix de région à figer (probablement `europe-west1` ou `europe-west9`). À acter en [chapitre 10 — Sécurité §10.9.2](10-securite.md).
3. **Aucune mémoire persistante côté modèle.** Pas de fine-tuning avec données clients dans la fondation (simplification des obligations RGPD).
4. **Hash des inputs dans les traces** si ils contiennent du texte libre utilisateur. Les inputs de `extractFactureFournisseur` (URI PDF) sont neutres et peuvent être loggués tels quels.

## 4.9 Extension future

Lorsqu'on ajoute un nouveau flow, checklist :

- [ ] Classé dans une famille §4.3 existante
- [ ] Schéma Zod d'entrée + sortie écrit et testé
- [ ] Prompt versionné comme const, revu par au moins une autre personne
- [ ] Validateurs post-IA écrits pour les invariants métier
- [ ] Plafond de coût fixé
- [ ] Dataset d'eval > 50 cas
- [ ] Métrique et seuil définis
- [ ] Trace loggée avec tous les champs §4.7.1
- [ ] Documentation ajoutée dans ce chapitre (sous-section §4.10+)

## 4.10 Ce que ce chapitre **ne couvre pas**

- Implémentation exacte des flows → à venir en fichiers source + tests.
- RAG / base vectorielle → **pas nécessaire en v1**. Si besoin futur (recherche sémantique sur archives), addition par ADR.
- Fine-tuning → hors scope fondation.
- Prompt injection mitigation pour inputs utilisateur arbitraires → à traiter si/quand on ouvre des flows acceptant du texte libre utilisateur (actuellement aucun).

---

**Chapitre suivant** : [05 — Stratégie d'Archivage](05-archival-strategy.md) *(à écrire)*.
