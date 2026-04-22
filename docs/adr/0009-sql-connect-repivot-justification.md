# ADR 0009 — Re-justification de Firebase SQL Connect après repivot mono-tenant non fiscal

> **Statut** : Accepté
> **Date** : 2026-04-22
> **Auteurs** : fondateur
> **Remplace** : [0002](0002-data-connect-relational.md) (repivot mono-tenant non fiscal)
> **Remplacé par** : —
>
> **Prérequis de lecture** : [ADR 0002](0002-data-connect-relational.md) (historique), [ADR 0006](0006-internal-tool-scope.md), [ADR 0007](0007-not-a-billing-tool.md), [ADR 0008](0008-architecture-postgres-firestore-hybrid.md).

## Contexte

L'[ADR 0002](0002-data-connect-relational.md) a acté le choix de **Firebase SQL Connect** (ex-Data Connect) comme couche de persistance relationnelle. Sa motivation centrale, telle que rédigée à l'époque, reposait sur deux piliers aujourd'hui caducs :

1. **"Numérotation fiscale continue, immuabilité des factures, multi-tenant par construction"** — invalidé par [ADR 0007](0007-not-a-billing-tool.md) (Sosson n'est pas un outil fiscal) et [ADR 0006](0006-internal-tool-scope.md) (Sosson est mono-tenant).
2. **"Le SDK typé supprime la plus grosse source d'erreurs dans un SaaS multi-tenant (bugs d'isolation)"** — invalidé par le repivot : il n'y a plus de tenants à isoler.

La **décision** de l'ADR 0002 (choisir SQL Connect) reste la bonne, mais son **pourquoi** est devenu obsolète. Laisser l'ADR 0002 en statut `Accepté` avec ces justifications expose un futur dev (humain ou IA) à suivre un raisonnement invalidé. Cet ADR **remplace** 0002 avec une justification à jour.

## Options envisagées

### Option A — Éditer l'ADR 0002 en place

- ✅ Un seul document à lire.
- ❌ **Viole la règle d'immuabilité des ADRs** (voir [adr/README.md §3](README.md)). Un ADR accepté ne s'édite pas sur le fond ; on le remplace.
- ❌ Perd la trace historique du raisonnement initial.

### Option B — Écrire un ADR 0009 qui supersede 0002

- ✅ Respecte la règle d'immuabilité.
- ✅ Préserve la traçabilité historique ("voici ce qu'on croyait en v0.1, voici ce qu'on acte en v0.2").
- ✅ Force le lecteur à comprendre le pivot.
- ❌ Deux documents à lire si on veut l'historique complet.

### Option C — Changer de couche de persistance

- Abandonner SQL Connect au profit de Postgres + Hasura / PostgREST / Cloud Functions + ORM.
- ✅ Plus flexible, écosystème plus mature.
- ❌ **Perd tous les bénéfices techniques qui restent valides** (voir §Décision).
- ❌ Aucune raison objective dictée par le repivot.
- ❌ Rejeté — la décision de techno reste la bonne.

## Décision

**Option B retenue.** SQL Connect reste la couche de persistance relationnelle de Sosson. La motivation est **réécrite ci-dessous** pour refléter le produit réel.

### Nouvelle motivation (valide post-repivot)

Sosson manipule un modèle **fortement relationnel mono-tenant** :

- Client → Chantier → Devis / FactureCliente (import) / FactureFournisseur → LigneDepense → Categorie.
- Email ↔ (Client, Chantier) via `EmailRattachement` many-to-many.
- Creneau / Assignation / Equipe pour le planning.
- Event + AuditLog transverses.

Postgres est la bonne base pour ce profil — voir [ADR 0008](0008-architecture-postgres-firestore-hybrid.md). Reste le choix du **vecteur d'accès**.

**Firebase SQL Connect** est retenu pour les raisons suivantes, toutes toujours valides après le repivot :

1. **SDK TypeScript généré automatiquement** depuis le schéma GraphQL. Évite la rédaction manuelle de types, de requêtes, et de code de plomberie CRUD.
2. **Intégration native avec Firebase Auth** : les claims (rôle utilisateur) sont accessibles dans les règles d'autorisation GraphQL, **sans middleware custom**. C'est ce qui remplace l'ancienne justification "multi-tenant" : aujourd'hui les règles portent sur les **rôles** (`OWNER`/`ADMIN`/`OPERATOR`/`MOBILE`/`VIEWER`), pas sur un discriminant tenant.
3. **Postgres standard en dessous.** La donnée reste accessible en SQL direct pour migrations, analytics, jobs de maintenance, ou en cas de changement de couche d'accès.
4. **Full-text search natif** (`tsvector` + GIN) et agrégations analytiques (`GROUP BY`, window functions) — clef des dashboards Sosson (voir [ADR 0008](0008-architecture-postgres-firestore-hybrid.md)).
5. **Mutations transactionnelles** : les chaînes `FactureFournisseur` → N × `LigneDepense` → `Event` s'écrivent en une transaction, pas en chaînage best-effort.
6. **Cohérence plateforme** avec [ADR 0001](0001-platform-firebase.md) (Firebase unifié) et [ADR 0008](0008-architecture-postgres-firestore-hybrid.md) (hybride Postgres + Firestore).

## Invariants (remplacent ceux de ADR 0002 §"Invariants complémentaires")

- **Toute entité métier existe sans discriminant tenant.** Aucun champ `entreprise`, `entrepriseId`, ou équivalent. Voir [ADR 0006](0006-internal-tool-scope.md).
- **Les montants sont `Decimal`, jamais `Float`.** (inchangé)
- **Les migrations destructives sont en deux étapes** (jamais `DROP` direct en prod). (inchangé)
- **Les contrôles d'autorisation portent sur le rôle utilisateur**, pas sur un lien tenant. Détail : [chapitre 10 — Sécurité](../10-securite.md).
- **Modifications tracées, pas interdites.** La base n'interdit pas l'édition d'un devis envoyé ou d'une facture importée ; elle l'enregistre dans `AuditLog`. Voir [ADR 0007](0007-not-a-billing-tool.md).

## Conséquences

### Positives

- Motivation alignée avec le produit réel (hub opérationnel mono-tenant non fiscal).
- Un lecteur futur (dev, IA) lit l'ADR 0009 et comprend immédiatement pourquoi SQL Connect, sans être induit en erreur par des notions fiscales ou multi-tenant caduques.
- La traçabilité historique reste intacte via le lien `Remplace: 0002`.

### Négatives / Coûts

- **Dette cognitive mineure** : deux ADRs à parcourir si on veut l'historique complet. Mitigation : l'ADR 0002 porte en tête `Superseded by 0009`, donc un lecteur pressé sait immédiatement où aller.
- Les limitations techniques de SQL Connect identifiées dans l'ADR 0002 restent valides (realtime non natif, expressivité GraphQL) ; elles sont documentées ci-dessous pour mémoire.

### Neutres / À surveiller (hérité de 0002, toujours pertinent)

- **Realtime non natif.** Pour tout besoin de sync push (dashboard partagé, notifications instantanées), Firestore adjoint ou Pub/Sub. Voir [ADR 0005](0005-firestore-adjoint-only.md).
- **Limites d'expressivité GraphQL** sur agrégations complexes ou pivots. Mitigation : résolveurs custom ou SQL direct via Cloud Functions.
- **Dépendance à la roadmap SQL Connect.** Si plus de 3 Cloud Functions de rustine contournent des limitations bloquantes → signal de remise en cause (critère d'exit documenté dans [ADR 0002 §Neutres](0002-data-connect-relational.md)).
- **Évolution tarifaire** de Cloud SQL ou SQL Connect.

## Questions ouvertes

- **Stratégie de tests** : émulateur SQL Connect vs. instance Cloud SQL dev partagée. À décider en chapitre 08 Opérations.
- **Realtime sur état relationnel partagé** (ex. devis édité à plusieurs) : si le besoin apparaît, ADR dédié pour trancher entre polling, Firestore adjoint ou listeners Pub/Sub.
