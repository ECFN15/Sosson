# Chapitre 05 — Stratégie d'Archivage

> **Statut** : placeholder — cadre posé, détails à compléter lors de l'implémentation du job d'archivage
> **Dernière révision** : 2026-04-22
> **Prérequis** : [03 — Données](03-data-architecture.md)
> **ADRs référencés** : [0004](adr/0004-cold-storage-strategy.md)

---

## 5.1 Périmètre de ce chapitre

Ce chapitre est le **contrat d'archivage** : ce qui est archivé, dans quel format, où, comment on le restaure, et avec quelles garanties d'intégrité.

Le détail d'implémentation du job (code de la Cloud Function) sera produit lors de la phase de build, **sous la contrainte de ce chapitre**. Ce document **figure le format d'archive** avant d'écrire le code, pour que l'archive reste lisible dans 10-20 ans même si le code actuel n'existe plus.

## 5.2 Ce qui est archivé

Au passage d'un Chantier en statut `archive` :

1. **Toutes les données relationnelles** du Chantier et de ce qui lui est rattaché (Devis, Factures clientes, FactureFournisseur, Paiement, CompteRendu, Photo métadonnées).
2. **Les informations du Client** au moment de l'archivage (snapshot, pas lien vivant).
3. **Les informations de l'Entreprise** (minimales : nom, SIRET, pour contexte légal).
4. **Les médias binaires** : photos originales, PDF de factures (fournisseurs et clientes), tout document attaché.

**Ce qui n'est PAS archivé** :
- Les autres chantiers du même Client (restent en base s'ils sont actifs).
- Les Users (vivent au niveau Entreprise, pas Chantier).
- Les données de facturation Sosson (rapport tenant / plan) — hors périmètre métier.

## 5.3 Format de l'archive

### 5.3.1 Structure du dossier

```
/clients_archives/{clientId}/chantiers/{chantierId}/
├── fiche_client.json                  # snapshot relationnel complet
├── MANIFEST.json                      # métadonnées de l'archive (voir §5.4)
├── photos/
│   ├── {photoId}-{slug}.jpg
│   └── ...
└── documents/
    ├── factures-fournisseurs/
    │   └── {factureFournisseurId}-{numero}.pdf
    ├── factures-clientes/
    │   └── {factureId}-{numero}.pdf
    └── devis/
        └── {devisId}-{numero}.pdf
```

**Remarques** :
- Le chemin commence par `{clientId}` pour retrouver toutes les archives d'un client par préfixe (`gsutil ls gs://.../clients_archives/{clientId}/`).
- Un Client peut avoir plusieurs chantiers archivés sous lui → sous-dossier `chantiers/{chantierId}/`.
- Les noms de fichiers portent l'ID (immuable) **et** le nom lisible (confort humain).

### 5.3.2 Schéma de `fiche_client.json` (v1.0.0)

```json
{
  "$schema": "sosson://archive/v1.0.0",
  "archivedAt": "2026-04-22T10:00:00Z",
  "archiveVersion": "1.0.0",
  "entreprise": {
    "id": "uuid",
    "nom": "string",
    "siret": "14 chiffres"
  },
  "client": {
    "id": "uuid",
    "nom": "string",
    "typeClient": "PARTICULIER | PROFESSIONNEL",
    "siret": "string|null",
    "adresse": "string|null",
    "email": "string|null",
    "telephone": "string|null"
  },
  "chantier": {
    "id": "uuid",
    "reference": "string",
    "nom": "string",
    "adresse": "string|null",
    "dateDebutPrevue": "YYYY-MM-DD|null",
    "dateDebutReelle": "YYYY-MM-DD|null",
    "dateCloture": "YYYY-MM-DDTHH:MM:SSZ",
    "chefChantier": { "id": "uuid", "nom": "string" }
  },
  "devis": [
    {
      "id": "uuid", "numero": "string", "statut": "...",
      "dateEmission": "...", "montantHT": "decimal-string",
      "montantTTC": "decimal-string",
      "lignes": [ { "designation": "...", "quantite": "...", "prixUnitaireHT": "...", "tauxTVA": "..." } ],
      "pdfFichier": "documents/devis/{id}-{numero}.pdf"
    }
  ],
  "factures": [
    {
      "id": "uuid", "numero": "string", "statut": "...",
      "dateEmission": "...", "dateEcheance": "...",
      "montantHT": "decimal-string", "montantTTC": "decimal-string",
      "lignes": [ /* ... */ ],
      "paiements": [ { "montant": "...", "date": "...", "moyen": "..." } ],
      "pdfFichier": "documents/factures-clientes/{id}-{numero}.pdf"
    }
  ],
  "facturesFournisseurs": [
    {
      "id": "uuid", "fournisseurNom": "...", "fournisseurSiret": "...",
      "numero": "...", "dateEmission": "...",
      "montantHT": "...", "montantTTC": "...",
      "tvaParTaux": [ /* ... */ ],
      "pdfFichier": "documents/factures-fournisseurs/{id}-{numero}.pdf"
    }
  ],
  "comptesRendus": [
    {
      "id": "uuid", "auteur": { "id": "uuid", "nom": "string" },
      "createdAt": "...",
      "contenuMarkdown": "..."
    }
  ],
  "photos": [
    {
      "id": "uuid", "fichier": "photos/{id}-{slug}.jpg",
      "priseLe": "...", "prisePar": "...",
      "legende": "...|null"
    }
  ]
}
```

### 5.3.3 Règles de sérialisation

- **Decimal → string.** Un `Decimal` JSON-sérialisé en float perd en précision. Les montants sont des strings (`"123.45"`). Le consommateur re-parse en Decimal.
- **UTF-8, indenté 2 espaces.** Lisible à l'œil nu. Le coût de stockage supplémentaire est négligeable sur Archive class.
- **Timestamps UTC ISO 8601** partout.
- **Pas de référence circulaire.** L'archive est un arbre, pas un graphe. Les références entre sous-entités se font par ID, résolubles dans le même fichier.

### 5.3.4 `MANIFEST.json`

Fichier de contrôle à côté de `fiche_client.json` :

```json
{
  "archiveVersion": "1.0.0",
  "createdAt": "2026-04-22T10:00:00Z",
  "createdBy": "cloud-function:archiveChantier@v1.2.0",
  "chantierId": "uuid",
  "clientId": "uuid",
  "entrepriseId": "uuid",
  "files": [
    { "path": "fiche_client.json", "sha256": "...", "sizeBytes": 12345 },
    { "path": "photos/abc-facade.jpg", "sha256": "...", "sizeBytes": 98765 }
  ],
  "totals": {
    "fileCount": 42,
    "totalBytes": 12345678
  }
}
```

Le `MANIFEST.json` permet de **vérifier l'intégrité** de l'archive sans connaître son contenu a priori. Indispensable pour une rétention 10-20 ans.

## 5.4 Versionnage du format d'archive

- `archiveVersion` est inscrit **à la fois dans `fiche_client.json` et dans `MANIFEST.json`** (redondance volontaire).
- Toute évolution du schéma du fichier = bump SemVer :
  - **PATCH** : ajout de champ optionnel sans impact sur les consommateurs.
  - **MINOR** : ajout d'un champ obligatoire → le code de lecture doit gérer `undefined` sur anciennes archives.
  - **MAJOR** : breaking change → **interdit sans plan de re-writing** des archives existantes (et normalement, on ne rewrite pas les archives, donc en pratique : éviter les MAJOR).

Table `ArchiveChantier.versionSchemaArchive` en base permet de savoir quelle version attend quel parser.

## 5.5 Déclenchement du job d'archivage

Deux stratégies possibles, **à arbitrer lors de l'implémentation** :

### 5.5.1 Stratégie A — immédiate à la clôture
Dès que `Chantier.statut` passe à `clos` avec validation explicite de l'utilisateur ("clôturer et archiver maintenant"), une Cloud Function `archiveChantierOnClose` déclenchée par mutation lance le job.

- ✅ Prévisible, transparent pour l'utilisateur.
- ❌ Archive un chantier qu'on voudra peut-être rouvrir dans les 30 jours (opération de restauration = coût Archive class).

### 5.5.2 Stratégie B — différée par scheduler
Les chantiers passent à `clos`. Un job `archiveAgedClosedChantiers` tourne (quotidien) et archive ceux dont `dateCloture < now - N jours` (par ex. N=90).

- ✅ Laisse une fenêtre de marche arrière gratuite.
- ✅ Permet des corrections tardives de facture / avoir.
- ❌ Complexité opérationnelle un peu supérieure.

**Recommandation provisoire** : **Stratégie B avec N=90 jours**, mais validation formelle à faire dans un ADR dédié lors de l'implémentation.

## 5.6 Classe de stockage et lifecycle

- Bucket dédié à l'archivage : `sosson-{env}-archives`, séparé du bucket hot `sosson-{env}-media`.
- **Storage class à l'écriture** : `Archive` directement (on sait que c'est froid).
- **Lifecycle** : pas de transition automatique (déjà en Archive). Versioning d'objet activé **on** (protection contre écrasement accidentel).
- **Rétention minimum** : 10 ans (object retention policy, verrouillée).
- **Région** : même que le projet GCP principal (europe-west*).

## 5.7 Intégrité et désarchivage

### 5.7.1 Vérification post-archivage
Avant de marquer un chantier `archive` et **a fortiori** avant toute purge éventuelle de la base hot :

1. Le job recalcule les SHA-256 depuis le bucket.
2. Les compare avec `MANIFEST.json`.
3. Si divergence : rollback, alerte, chantier reste `clos`.

### 5.7.2 Désarchivage (ré-ouverture)

Si un chantier archivé doit être ré-ouvert (litige, prolongation tardive) :

1. Restauration depuis Archive class (coût + latence).
2. Parsing de `fiche_client.json` → recréation des entités en base avec nouveaux IDs (l'ancien chantier reste tracé dans `ArchiveChantier`, le nouveau est une copie).
3. Nouveau chantier ouvert, lié par métadonnée `reOuvertureDe: {archiveChantierId}`.

**Invariant** : on ne restaure pas avec les anciens IDs. L'archive reste la source de vérité immuable ; la nouvelle activité vit en parallèle.

## 5.8 Ce qui reste à décider (ouvertures)

- Stratégie A vs B (§5.5) → ADR au moment de l'implémentation.
- Délai N exact si B.
- Faut-il chiffrer les archives avec une clé gérée par l'Entreprise (CMEK) ou par Google (par défaut) ? Dépend des exigences clients entreprise (à valider chapitre 06).
- Faut-il produire aussi une version **PDF consolidée** (dossier imprimable) en plus du JSON ? Probable oui à terme, pas en v1.
- Notification à l'Entreprise (email récapitulatif + lien signé) à l'archivage ? À définir.

## 5.9 Ce que ce chapitre **ne couvre pas**

- Implémentation du job : code TS de la Cloud Function → à produire.
- Export en masse à la demande (droit à la portabilité RGPD, résiliation) → chapitre 06 Sécurité.
- Monitoring du job (taux de succès, durée, volumétrie) → chapitre 08 Opérations.

---

**Retour au** [sommaire](../documentation.md#3-sommaire).
