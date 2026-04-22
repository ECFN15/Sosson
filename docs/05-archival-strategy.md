# Chapitre 05 — Stratégie d'Archivage

> **Statut** : placeholder v0.2 — cadre posé et aligné modèle de données actuel, implémentation du job à produire
> **Dernière révision** : 2026-04-22
> **Prérequis** : [03 — Données](03-data-architecture.md)
> **ADRs référencés** : [0004](adr/0004-cold-storage-strategy.md), [0006](adr/0006-internal-tool-scope.md), [0007](adr/0007-not-a-billing-tool.md), [0008](adr/0008-architecture-postgres-firestore-hybrid.md)

---

## 5.1 Périmètre de ce chapitre

Ce chapitre est le **contrat d'archivage** : ce qui est archivé, dans quel format, où, comment on le restaure, et avec quelles garanties d'intégrité.

L'archivage a une valeur **opérationnelle** (mémoire long terme consultable pour l'équipe), pas fiscale (voir [ADR 0007](adr/0007-not-a-billing-tool.md) : Sosson n'a pas de contrainte légale de rétention). La rétention 10 ans est une **pratique interne**, pas une obligation. Le comptable externe conserve les obligations fiscales de son côté.

Le détail d'implémentation du job (code de la Cloud Function) sera produit lors de la phase de build, **sous la contrainte de ce chapitre**. Ce document **figure le format d'archive** avant d'écrire le code, pour que l'archive reste lisible dans 10-20 ans même si le code actuel n'existe plus.

## 5.2 Ce qui est archivé

Au passage d'un Chantier en statut `ARCHIVE` (transition `CLOS → ARCHIVE`) :

1. **Le Chantier lui-même** (tous ses champs).
2. **Le Client associé** (snapshot à la date d'archivage, pas lien vivant).
3. **Les entités rattachées** :
   - `Devis` + `DevisLigne`,
   - `FactureCliente` importée (numéro externe, montants, lien PDF),
   - `FactureFournisseur` + `LigneDepense` + leur `Categorie` (dénormalisée pour rester lisible même si la taxonomie change),
   - `CompteRendu` (avec mots-clés IA),
   - `Photo` (métadonnées),
   - `DocumentAttache` (métadonnées),
   - `Email` rattachés au chantier (via `EmailRattachement`) + leurs `EmailPieceJointe`,
   - `Creneau` + `Assignation` (planning historique du chantier),
   - `Event` de la timeline du chantier,
   - `AuditLog` filtré sur les entités ci-dessus (sous-ensemble concerné par ce chantier).
4. **Les Users référencés** en snapshot minimal (id, nom, rôle à la date d'archivage) — utile pour lire l'archive sans dépendance à la table `User` vivante.
5. **Les médias binaires** : photos originales, PDF des factures (fournisseurs et clientes) et devis, pièces jointes email, documents attachés.

**Ce qui n'est PAS archivé** :
- Les autres chantiers du même Client (restent en base s'ils sont actifs).
- La table `User` complète (seuls les Users référencés sont snapshotés).
- Les `Categorie` non utilisées (seules celles référencées par des `LigneDepense` du chantier sont dénormalisées dans l'archive).
- Les `Email` non rattachés au chantier (ils vivent au niveau Client, sans sens d'archivage par chantier).
- Firestore (éphémère par construction, non archivable — voir [ADR 0005](adr/0005-firestore-adjoint-only.md)).

## 5.3 Format de l'archive

### 5.3.1 Structure du dossier

```
/clients_archives/{clientId}/chantiers/{chantierId}/
├── fiche_client.json                  # snapshot relationnel complet
├── MANIFEST.json                      # métadonnées de l'archive (voir §5.3.4)
├── photos/
│   ├── {photoId}-{slug}.jpg
│   └── ...
├── documents/
│   ├── factures-fournisseurs/
│   │   └── {factureFournisseurId}-{numero}.pdf
│   ├── factures-clientes/
│   │   └── {factureId}-{numero}.pdf
│   ├── devis/
│   │   └── {devisId}-{numero}.pdf
│   └── autres/
│       └── {documentAttacheId}-{slug}.{ext}
└── emails/
    ├── {emailId}.json                  # email + métadonnées + body
    └── pieces-jointes/
        └── {pieceJointeId}-{nomFichier}
```

**Remarques** :
- Le chemin commence par `{clientId}` pour retrouver toutes les archives d'un client par préfixe (`gsutil ls gs://.../clients_archives/{clientId}/`).
- Un Client peut avoir plusieurs chantiers archivés sous lui → sous-dossier `chantiers/{chantierId}/`.
- Les noms de fichiers portent l'ID (immuable) **et** le nom lisible (confort humain).
- `emails/` est un nouveau sous-dossier par rapport à la v1.0.0 : il capture les emails rattachés au chantier et leurs pièces jointes.

### 5.3.2 Schéma de `fiche_client.json` (v1.1.0)

> **Bump v1.0.0 → v1.1.0** (MINOR) : retrait du bloc `entreprise` (mono-tenant, [ADR 0006](adr/0006-internal-tool-scope.md)) et du sous-objet `paiements` dans `factures` (non fiscal, [ADR 0007](adr/0007-not-a-billing-tool.md)). Ajout des blocs `emails`, `events`, `auditLog`, `creneaux`, `documentsAttaches`, `users` (snapshot minimal), et enrichissement de `facturesFournisseurs` avec `lignesDepense` catégorisées. Les archives v1.0.0 restent lisibles (les lecteurs doivent gérer `undefined` sur les nouveaux champs).

```json
{
  "$schema": "sosson://archive/v1.1.0",
  "archivedAt": "2026-04-22T10:00:00Z",
  "archiveVersion": "1.1.0",
  "client": {
    "id": "uuid",
    "nom": "string",
    "typeClient": "PARTICULIER | PROFESSIONNEL",
    "siret": "string|null",
    "adresse": "string|null",
    "email": "string|null",
    "telephone": "string|null",
    "notesInternes": "string|null"
  },
  "chantier": {
    "id": "uuid",
    "reference": "string",
    "nom": "string",
    "description": "string|null",
    "adresse": "string|null",
    "statut": "ARCHIVE",
    "budgetPrevisionnelHT": "decimal-string|null",
    "dateDebutPrevue": "YYYY-MM-DD|null",
    "dateFinPrevue": "YYYY-MM-DD|null",
    "dateDebutReelle": "YYYY-MM-DD|null",
    "dateCloture": "YYYY-MM-DDTHH:MM:SSZ",
    "chefChantier": { "id": "uuid", "nom": "string" }
  },
  "users": [
    { "id": "uuid", "nom": "string", "email": "string", "role": "OWNER|ADMIN|OPERATOR|MOBILE|VIEWER" }
  ],
  "devis": [
    {
      "id": "uuid", "numero": "string", "statut": "...",
      "dateEmission": "...", "dateValidite": "...|null",
      "montantHT": "decimal-string", "montantTTC": "decimal-string",
      "conditions": "string|null",
      "lignes": [
        { "ordre": 1, "designation": "...", "quantite": "...", "prixUnitaireHT": "...", "tauxTVA": "..." }
      ],
      "pdfFichier": "documents/devis/{id}-{numero}.pdf|null"
    }
  ],
  "facturesClientes": [
    {
      "id": "uuid", "numeroExterne": "string",
      "dateEmission": "...", "dateEcheance": "...|null",
      "montantHT": "decimal-string", "montantTTC": "decimal-string",
      "statutEncaissement": "EN_ATTENTE|PARTIEL|PAYE|EN_RETARD",
      "sourceImport": "MANUEL|EMAIL|API_COMPTABLE",
      "pdfFichier": "documents/factures-clientes/{id}-{numero}.pdf|null"
    }
  ],
  "facturesFournisseurs": [
    {
      "id": "uuid",
      "fournisseurNom": "...", "fournisseurSiret": "...|null",
      "numeroFournisseur": "...|null",
      "dateEmission": "...|null", "dateEcheance": "...|null",
      "montantHT": "...|null", "montantTTC": "...|null",
      "devise": "EUR",
      "tvaDetail": { "0.20": "decimal-string", "0.10": "decimal-string" },
      "statutExtraction": "BRUT|EXTRAIT_IA|VALIDE_HUMAIN|REJETE",
      "scoreConfianceIA": 0.0,
      "lignesDepense": [
        {
          "ordre": 1,
          "designation": "...",
          "quantite": "...|null",
          "montantHT": "...", "montantTTC": "...",
          "categorie": { "nom": "Bois", "cheminComplet": "Matériaux > Bois > Chevron" },
          "scoreConfianceCategorisation": 0.0,
          "categorieValideeParHumain": true
        }
      ],
      "pdfFichier": "documents/factures-fournisseurs/{id}-{numero}.pdf"
    }
  ],
  "comptesRendus": [
    {
      "id": "uuid", "auteur": { "id": "uuid", "nom": "string" },
      "createdAt": "...", "updatedAt": "...",
      "contenuMarkdown": "...",
      "motsClesIA": ["string"]
    }
  ],
  "photos": [
    {
      "id": "uuid", "fichier": "photos/{id}-{slug}.jpg",
      "priseLe": "...", "prisePar": { "id": "uuid", "nom": "string" },
      "legende": "...|null",
      "latitude": 0.0, "longitude": 0.0
    }
  ],
  "documentsAttaches": [
    {
      "id": "uuid", "nomFichier": "string", "typeDetecte": "PDF|EXCEL|IMAGE|PLAN|AUTRE",
      "tailleBytes": 0,
      "fichier": "documents/autres/{id}-{slug}.{ext}",
      "resumeIA": "...|null",
      "ajoutePar": { "id": "uuid", "nom": "string" }
    }
  ],
  "emails": [
    {
      "id": "uuid", "gmailId": "string", "threadId": "string",
      "fromAdresse": "...", "fromNom": "...|null",
      "toAdresses": ["..."], "ccAdresses": ["..."],
      "sujet": "...", "receivedAt": "...",
      "priorite": "URGENT|NORMAL|FAIBLE|SPAM",
      "categorie": "CLIENT_DEMANDE|...",
      "bodyFichier": "emails/{emailId}.json",
      "piecesJointes": [
        { "id": "uuid", "nomFichier": "...", "typeMime": "...", "tailleBytes": 0, "fichier": "emails/pieces-jointes/{id}-{nom}" }
      ]
    }
  ],
  "creneaux": [
    {
      "id": "uuid", "debut": "...", "fin": "...",
      "type": "TRAVAUX|RDV_CLIENT|LIVRAISON|AUTRE",
      "description": "...|null",
      "assignations": [
        { "equipeNom": "string|null", "user": { "id": "uuid", "nom": "string" } }
      ]
    }
  ],
  "events": [
    {
      "id": "uuid", "type": "DEVIS_ENVOYE|FACTURE_VALIDEE|...",
      "entityType": "Chantier|Devis|...", "entityId": "uuid",
      "auteur": { "id": "uuid", "nom": "string" },
      "payload": { "...": "..." },
      "createdAt": "..."
    }
  ],
  "auditLog": [
    {
      "id": "uuid", "entityType": "...", "entityId": "uuid",
      "operation": "CREATE|UPDATE|DELETE|RESTORE",
      "user": { "id": "uuid", "nom": "string" },
      "raison": "...|null",
      "createdAt": "..."
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
  "archiveVersion": "1.1.0",
  "createdAt": "2026-04-22T10:00:00Z",
  "createdBy": "cloud-function:archiveChantier@v1.2.0",
  "chantierId": "uuid",
  "clientId": "uuid",
  "files": [
    { "path": "fiche_client.json", "sha256": "...", "sizeBytes": 12345 },
    { "path": "photos/abc-facade.jpg", "sha256": "...", "sizeBytes": 98765 },
    { "path": "emails/xyz.json", "sha256": "...", "sizeBytes": 4321 }
  ],
  "totals": {
    "fileCount": 42,
    "totalBytes": 12345678,
    "emailCount": 18,
    "photoCount": 120,
    "factureFournisseurCount": 15
  }
}
```

**Mono-tenant** : plus de champ `entrepriseId` (voir [ADR 0006](adr/0006-internal-tool-scope.md)). Les compteurs par type d'entité (`emailCount`, `photoCount`, etc.) simplifient les vérifications a posteriori sans ouvrir `fiche_client.json`.

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
- **Lifecycle** : pas de transition automatique (déjà en Archive). **Object Versioning** activé (protection contre écrasement accidentel).
- **Rétention cible** : **10 ans** (cible opérationnelle interne, **pas** un verrou technique). Voir §5.6.1 ci-dessous.
- **Région** : même que le projet GCP principal (europe-west*).

### 5.6.1 Rétention vs droit à l'effacement : position

Sosson étant un outil **non fiscal** ([ADR 0007](adr/0007-not-a-billing-tool.md)) et devant honorer le droit RGPD à l'effacement ([10 §10.9.2](10-securite.md)), il y a un arbitrage entre "conserver longtemps" et "pouvoir effacer sur demande". La position est la suivante :

| Mécanisme | État en V1 | Raison |
|---|---|---|
| **Object Versioning** | **Activé** | Anti-écrasement accidentel (bug, mauvaise manip). Coût négligeable. |
| **Object Retention Lock GCS** | **Non activé** | Un lock verrouille la suppression : incompatible avec le droit RGPD à l'effacement sur demande. Aucune obligation légale ne l'impose (ADR 0007). |
| **10 ans** | **Cible interne** | Pratique d'entreprise, pas verrou. Le comptable externe garde ses obligations fiscales (10 ans légaux) de son côté. |
| **Suppression définitive** | **Possible** | Procédure réservée `OWNER` uniquement, tracée dans `AuditLog` (entité `ArchiveChantier`, opération `DELETE`, raison obligatoire). |

**Conséquence concrète** : en V1, une archive peut être supprimée par l'`OWNER` via une Cloud Function dédiée `purgeArchive(archiveChantierId, raison)`. Aucun utilisateur `ADMIN` ou inférieur ne peut supprimer une archive. Chaque suppression laisse une trace permanente dans `AuditLog`.

Si un jour l'entreprise veut activer un **Retention Lock** (ex. obligation contractuelle client pour une branche d'activité précise), ce sera une évolution **post-V1** actée par ADR dédié — et il faudra alors documenter comment concilier avec le droit à l'effacement (probablement : lock uniquement sur les archives sans données personnelles, ou anonymisation pré-lock).

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
- Faut-il chiffrer les archives avec une clé gérée par l'entreprise (CMEK) ou par Google (par défaut) ? Décision reportée au [chapitre 10 — Sécurité](10-securite.md). Par défaut, chiffrement Google (suffisant pour un outil interne non fiscal).
- Faut-il produire aussi une version **PDF consolidée** (dossier imprimable) en plus du JSON ? Probable oui à terme, pas en v1.
- Notification à l'équipe (email récapitulatif + lien signé GCS) à l'archivage ? À définir — probablement oui en v1 (Cloud Function envoie un email au gérant).
- Politique de **rétention des AuditLog transverses** (non attachés à un chantier archivé) : hors scope de ce chapitre, à traiter en [chapitre 08 Opérations](../documentation.md#3-sommaire).

## 5.9 Ce que ce chapitre **ne couvre pas**

- Implémentation du job : code TS de la Cloud Function → à produire.
- Export en masse à la demande (droit à la portabilité RGPD, résiliation) → [chapitre 10 — Sécurité](10-securite.md).
- Monitoring du job (taux de succès, durée, volumétrie) → chapitre 08 Opérations (à écrire).

---

**Retour au** [sommaire](../documentation.md#3-sommaire).
