# ADR 0002 — Persistance relationnelle via Firebase SQL Connect (ex-Data Connect)

> **Statut** : `Superseded by 0009`
> **Date** : 2026-04-22
> **Auteurs** : fondateur
> **Remplace** : —
> **Remplacé par** : [ADR 0009](0009-sql-connect-repivot-justification.md)
>
> **Prérequis de lecture** : [03 — Architecture des Données](../03-data-architecture.md), [ADR 0001](0001-platform-firebase.md)

> ⚠️ **Cet ADR est remplacé par [ADR 0009](0009-sql-connect-repivot-justification.md).** La **décision** (choisir SQL Connect) reste valide. La **motivation** rédigée ci-dessous s'appuie sur deux hypothèses invalidées depuis : fiscalité des factures ([ADR 0007](0007-not-a-billing-tool.md)) et architecture multi-tenant ([ADR 0006](0006-internal-tool-scope.md)). Conservé en l'état pour traçabilité historique. **Ne pas citer comme source de vérité.** Lire l'ADR 0009 pour la motivation en vigueur.

> **Note de renommage (2026-04-22)** : Google a renommé **Firebase Data Connect → Firebase SQL Connect**. Les APIs n'ont pas changé, aucune migration code. Dans la suite de la documentation, on utilise **SQL Connect** (nom actuel) ; les références historiques à « Data Connect » pointent le même produit. La décision de l'ADR reste inchangée.

## Contexte

Sosson manipule un modèle fortement relationnel (Client → Chantier → Devis/Facture → Lignes/Paiements) avec des invariants stricts :
- Numérotation fiscale continue des factures par entreprise.
- Immuabilité d'une facture émise.
- Multi-tenant par construction (`entrepriseId` partout).

Une base NoSQL document (Firestore) est rejetée d'emblée : impossible d'y maintenir ces contraintes sans duplication et scripts de réconciliation permanents.

Reste à choisir le vecteur d'accès à Postgres dans la stack Firebase/GCP (ADR 0001).

## Options envisagées

### 1. Cloud SQL Postgres accédé via Cloud Functions + ORM (Prisma/Drizzle)
- **Pros** : contrôle total, écosystème ORM mature, migrations classiques.
- **Cons** : il faut coder toute la couche API (auth sur chaque endpoint, validation, pagination), pas de SDK typé auto-généré côté client, beaucoup de plomberie à maintenir.

### 2. Firebase Data Connect (GraphQL + Cloud SQL Postgres)
- **Pros** : SDK TS généré automatiquement depuis le schéma GraphQL, intégration native avec Firebase Auth (claims accessibles dans les règles), schéma relationnel déclaratif, mutations transactionnelles, sous le capot c'est du Postgres standard auquel on peut toujours accéder en SQL direct si besoin.
- **Cons** : produit relativement jeune (écosystème d'outils tiers limité), certaines requêtes complexes peuvent demander des workarounds, la couche GraphQL ajoute une indirection.

### 3. Hasura ou PostgREST devant Cloud SQL
- **Pros** : maturité de ces outils, modèle déclaratif proche.
- **Cons** : pas intégrés dans l'écosystème Firebase/GCP (IAM, Auth, facturation séparés), perte de la cohérence plateforme qui justifie l'ADR 0001.

## Décision

**Option retenue : Firebase Data Connect.**

Raison centrale : **le SDK typé auto-généré et l'intégration native avec Firebase Auth** suppriment la plus grosse source d'erreurs dans un SaaS multi-tenant (incohérences entre serveur et client, bugs d'isolation). Sur un projet qui vise 10-20 ans, économiser cette plomberie répétitive est un gain de qualité, pas seulement de vitesse.

Le fait que Data Connect repose sur Cloud SQL Postgres standard est **la clé de la réversibilité** : si on devait s'en séparer, les données sont accessibles en SQL pur. On perd la couche GraphQL, pas les données.

## Conséquences

### Positives
- SDKs TS typés de bout en bout (schéma → serveur → client) sans code additionnel.
- Règles d'autorisation déclaratives par opération GraphQL, évaluées côté serveur avec les claims Firebase Auth.
- Moins de code de plomberie = moins de surface de bugs.
- Accès SQL direct possible pour migrations, analytiques, jobs de maintenance.

### Négatives / Coûts
- **Realtime non natif.** Pour tout besoin de synchronisation push (dashboard partagé, notifications instantanées), il faudra compléter par polling intelligent, Firestore ciblé, ou Pub/Sub. À arbitrer au cas par cas.
- Limites d'expressivité GraphQL sur certaines requêtes complexes (agrégations, pivots). Mitigation : résolveurs custom ou requêtes SQL encapsulées dans Cloud Functions.
- Dépendance à la roadmap Data Connect : nouvelles fonctionnalités Postgres (ex. types avancés, extensions) arrivent avec un décalage.
- Coût socle Cloud SQL (voir ADR 0001).

### Neutres / À surveiller
- Limitation bloquante récurrente de Data Connect qu'on contournerait par plus de 3 Cloud Functions de rustine → signal pour remise en cause.
- Apparition d'un besoin realtime massif (collaboration temps réel sur des dizaines d'entités) non couvrable par solution d'appoint.
- Évolution tarifaire majeure de Cloud SQL ou Data Connect.

## Invariants complémentaires posés par cette décision

- Toute entité métier a un champ `entreprise: Entreprise!` (discriminant tenant) — voir [03 §3.4.3](../03-data-architecture.md).
- Les montants sont `Decimal`, jamais `Float`.
- Les migrations destructives sont en deux étapes (jamais `DROP` direct en prod).

## Questions ouvertes

- **Realtime** : si un besoin de sync temps réel non-trivial apparaît sur des états relationnels (devis partagé édité à deux), trancher entre polling, Firestore adjoint ou listeners Pub/Sub — ADR dédié à ce moment-là.
- **Stratégie de tests** : émulateur Data Connect vs. instance Cloud SQL dev partagée — à décider en chapitre 08 Opérations.
