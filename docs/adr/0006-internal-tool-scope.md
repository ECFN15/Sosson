# ADR 0006 — Outil interne mono-tenant (pas un SaaS)

> **Statut** : Accepté
> **Date** : 2026-04-22
> **Auteurs** : fondateur
> **Remplace** : —
> **Remplacé par** : —
>
> **Impact** : annule l'invariant §5.5 "Multi-tenant dès le jour 1" du [documentation.md](../../documentation.md).

## Contexte

La documentation initiale (version 0.1.0) a été rédigée sous l'hypothèse que Sosson serait un **SaaS B2B** vendu à plusieurs PMEs. Cette hypothèse est **incorrecte** et a été corrigée lors d'une clarification explicite du périmètre.

Sosson est en réalité un **outil interne**, développé pour **une seule entreprise** (la PME à laquelle appartient le fondateur, 30-50 salariés, secteur BTP). L'application n'a pas vocation à être vendue ni utilisée par des tiers.

Cette confusion a généré dans la doc initiale :
- Un invariant "multi-tenant dès le jour 1" (§5.5).
- Un discriminant `entreprise: Entreprise!` sur **toute** entité métier du schéma Data Connect.
- Une entité racine `Entreprise` dans le modèle de domaine.
- Des scénarios de coûts en fonction du nombre de tenants (25, 100, ...).
- Une tentation d'utiliser Firebase Identity Platform pour le multi-tenancy fort.

Aucune de ces complexités n'est justifiée par le vrai périmètre.

## Options envisagées

### Option A — Rester "multi-tenant ready" par précaution (statu quo de la doc 0.1.0)

- ✅ Si un jour on vendait Sosson à d'autres PMEs, rien à refaire.
- ❌ Sur-ingénierie systématique pendant 10 ans pour un cas hypothétique.
- ❌ Coût cognitif permanent (comprendre pourquoi on passe `entrepriseId` partout).
- ❌ Contredit l'engagement explicite : **l'outil ne sera pas vendu**.

### Option B — Assumer pleinement le mono-tenant

- ✅ Simplification massive du schéma, du code, de l'auth, du déploiement.
- ✅ Alignement avec la réalité du projet.
- ✅ Si un jour la décision change, un ADR de remplacement ajoutera le multi-tenant en V2 (travail estimé : 2-4 semaines, pas rédhibitoire pour un pivot hypothétique).
- ❌ Si cette clarification s'avère fausse dans 5 ans, il faudra migrer. Risque jugé **très faible** vu la clarté de l'engagement.

## Décision

**Option B retenue.** Sosson est un outil **mono-tenant** par construction. Aucune fonctionnalité ni structure de données ne doit anticiper le multi-tenancy.

Conséquences concrètes à appliquer dans toute la doc et tout le code futur :

1. L'entité `Entreprise` est **supprimée** du modèle (ou ramenée à un singleton de configuration si nécessaire pour des champs globaux).
2. Le discriminant `entreprise: Entreprise!` est **supprimé** de toutes les tables.
3. **Firebase Auth classique** suffit (pas d'Identity Platform).
4. Les **règles d'autorisation** portent uniquement sur le rôle de l'utilisateur (`OWNER`, `ADMIN`, `OPERATOR`, `VIEWER`), pas sur un lien tenant.
5. Les scénarios de coûts se calibrent sur **un seul jeu de données** (30-50 users, volumes réels de l'entreprise), pas sur des multiples de 100 tenants.
6. Les exports RGPD / portabilité restent triviaux (un seul périmètre de données).

## Conséquences

### Positives

- Schéma Data Connect considérablement simplifié : ~30 % de champs en moins.
- Règles d'autorisation plus lisibles (juste des rôles).
- Moins de bugs possibles sur l'isolation (puisqu'il n'y a qu'un seul "locataire").
- Onboarding d'un nouveau contributeur plus rapide : pas à expliquer le multi-tenancy.
- Coûts divisés (pas d'Identity Platform facturé au MAU ≥ 50 k).

### Négatives / Coûts

- **Si le périmètre change** (décision future de vendre l'outil à d'autres PMEs), il faudra rétrofitter le multi-tenant. Estimation : 2-4 semaines de travail incluant migration de données (préfixage `entreprise_id` sur toutes les lignes existantes, activation Identity Platform, mise à jour des règles).
- Cette simplification **engage**. Revenir en arrière coûte non-zéro.

### Neutres / À surveiller

- Si dans 3 ans le fondateur change d'avis sur le modèle commercial, écrire un ADR de remplacement explicite.
- Documenter toute décision de conception qui **pourrait** faciliter un futur passage multi-tenant, pour info, sans l'implémenter (ex : "on aurait pu préfixer les buckets par un tenantId, on ne le fait pas, mais on le note ici").

## Invariants annulés ou modifiés

- **Invariant §5.5** "Multi-tenant dès le jour 1" → **annulé**.
- **Invariant §5.1** "Souveraineté des données métier" → **conservé mais reformulé** : l'export complet reste garanti, mais sans notion de "par tenant".

## Questions ouvertes

- Faut-il prévoir explicitement un "champ de sortie" dans le schéma qui permettrait d'ajouter `entreprise_id` plus tard sans tout refaire ? **Décision** : non. On le ferait par migration si le cas se présente, pas en anticipation silencieuse.
