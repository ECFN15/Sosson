# ADR 0004 — Archivage en Cloud Storage Archive class

> **Statut** : Accepté
> **Date** : 2026-04-22
> **Auteurs** : fondateur
> **Remplace** : —
> **Remplacé par** : —
>
> **Prérequis de lecture** : [05 — Stratégie d'Archivage](../05-archival-strategy.md), [ADR 0001](0001-platform-firebase.md)

## Contexte

Les factures en France doivent être conservées **10 ans** (Code de commerce). Sosson gère par PME plusieurs dizaines à centaines de chantiers/an. À horizon 10 ans, le volume de données inactives dépasse largement celui des données actives — et payer du stockage base de données (Cloud SQL) pour des dossiers clôturés depuis 5 ans est économiquement absurde.

La stratégie doit être :
1. **Économique** sur 10+ ans (invariant §5.4 de la doc racine : coût unitaire par tenant < 3 €/mois).
2. **Auditable** : un dossier archivé doit pouvoir être retrouvé et lu sans Sosson en cas de contrôle.
3. **Compatible** avec une sortie de plateforme (portabilité RGPD).

## Options envisagées

### Option A — Tout garder en base (Cloud SQL) avec flag `archived`
- ✅ Simplicité maximale, accès instantané.
- ❌ Coût stockage base de données sur 10 ans disproportionné.
- ❌ La base grossit indéfiniment, impact sur index et performances.
- ❌ Sauvegardes Cloud SQL de plus en plus lourdes.

### Option B — Partitionnement Postgres (tables par année)
- ✅ Garde les données en base, partitions détachables.
- ❌ Résout le problème d'index/performance mais **pas** le problème de coût : la donnée reste facturée au prix Cloud SQL.

### Option C — Export vers Cloud Storage (JSON + médias) en classe Archive
- ✅ Coût ~0,004 $/Go/mois en Archive class, ~250× moins cher que Cloud SQL.
- ✅ Format JSON lisible indépendamment de Sosson.
- ✅ Séparation nette hot/cold, alignée sur la vie métier du dossier (actif vs. clôturé).
- ✅ Immuabilité native (object retention policy).
- ❌ Latence de lecture (restauration depuis Archive).
- ❌ Coût de lecture non-négligeable (à rendre rare).
- ❌ Logique d'archivage à écrire et à valider soigneusement (intégrité).

### Option D — Export vers BigQuery
- ✅ Requêtable en SQL, bon pour agrégats analytiques long terme.
- ❌ Pas conçu pour stocker PDF/images (blobs binaires).
- ❌ Coût non optimisé pour stockage passif.

## Décision

**Option C** : export vers **Cloud Storage Archive class** avec un format d'archive auto-suffisant (`fiche_client.json` + `MANIFEST.json` + médias).

Facteur décisif : **l'archivage est un cas d'usage froid par nature**, et Archive class est conçu exactement pour ça. Le format de sortie rend la donnée lisible **indépendamment de Sosson**, satisfaisant coût, portabilité RGPD et traçabilité légale d'un seul coup.

Le format exact est figé dans [05 — Stratégie d'Archivage](../05-archival-strategy.md) et versionné en SemVer (`archiveVersion`).

## Conséquences

### Positives
- Coût stockage long terme quasi-nul comparé à la base.
- Archive auto-suffisante : reconstitution du dossier chantier possible dans n'importe quel autre outil.
- Immuabilité via object retention policy (protection contre suppression accidentelle).
- Satisfait la portabilité RGPD : on livre l'archive à un client qui quitte Sosson sans développement spécifique.

### Négatives / Coûts
- Latence d'accès (restauration depuis Archive, secondes à minutes).
- Coût de lecture/restauration élevé → la restauration doit rester un événement rare.
- Le job d'archivage doit être à toute épreuve : une archive corrompue 5 ans après est un désastre. D'où `MANIFEST.json` + SHA-256 + vérification post-archivage systématique.
- Versionnage du schéma d'archive critique : un MAJOR breaking serait inapplicable rétroactivement. En pratique : additions uniquement (PATCH/MINOR).

### Neutres / À surveiller
- Changement disruptif de tarification Archive class par Google.
- Exigence client imposant un stockage hors GCS (souveraineté stricte, multi-cloud).
- Explosion de la volumétrie médias qui nécessiterait de repenser la compression (hot) et le format (archive).

## Invariants complémentaires posés par cette décision

- Les archives sont immuables (invariant §5.6 doc racine).
- Une archive est **atomique** : tout est écrit et vérifié, ou rien n'est considéré comme archivé.
- La base conserve toujours une ligne `ArchiveChantier` pointant vers l'URI de l'archive (retrouvabilité par recherche client sans parcourir GCS).
- La région du bucket d'archive est la même que celle du projet principal (pas de donnée hors UE sans ADR dédié).
- Le schéma d'archive évolue en PATCH/MINOR uniquement ; jamais de MAJOR.

## Questions ouvertes

- **Stratégie de déclenchement** (immédiate à la clôture vs. différée par scheduler) — §5.5 du chapitre 05, ADR dédié lors de l'implémentation.
- **Chiffrement CMEK** (clé gérée par le client) vs. chiffrement Google par défaut — à trancher selon exigences de clients entreprise.
- **PDF consolidé imprimable** en complément du JSON — probablement oui à terme, pas en v1.
