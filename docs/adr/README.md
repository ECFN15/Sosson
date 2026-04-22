# Architecture Decision Records (ADRs)

> **Qu'est-ce qu'un ADR ?** Un document immuable qui trace **une** décision structurante : le contexte, les options envisagées, la décision prise, et ses conséquences. C'est le journal légal de l'architecture.

## Règles

1. **Un ADR = une décision.** Pas deux.
2. **Numérotation strictement croissante**, jamais recyclée. `0001`, `0002`, ... Même si un ADR est abandonné, son numéro reste mort.
3. **Un ADR accepté est immuable sur le fond.** On corrige les typos, pas le raisonnement. Pour changer de décision : **nouveau ADR qui supersede l'ancien** (`Supersedes: 0002`), et l'ancien passe en statut `Superseded by 00XX`.
4. **Le statut est en tête du fichier.** Jamais enfoui.
5. **La date est la date de la décision**, pas de la dernière édition.
6. **Le langage est honnête.** On écrit *pourquoi* on a choisi, *aussi* ce que la décision coûte. Un ADR qui ne liste aucun inconvénient est suspect.

## Statuts possibles

| Statut | Signification |
|---|---|
| `Proposé` | Écrit, en discussion, pas encore engagé |
| `Accepté` | Décision en vigueur |
| `Rejeté` | Proposé puis écarté — conservé pour traçabilité |
| `Déprécié` | Plus en vigueur, mais pas remplacé par un autre ADR |
| `Superseded by NNNN` | Remplacé par l'ADR NNNN |

## Gabarit

Tout nouvel ADR est écrit avec le gabarit suivant :

```markdown
# ADR NNNN — Titre court

> **Statut** : Proposé | Accepté | Rejeté | Déprécié | Superseded by NNNN
> **Date** : YYYY-MM-DD
> **Auteurs** : noms
> **Remplace** : (lien ADR remplacé, ou —)
> **Remplacé par** : (lien ADR successeur, ou —)

## Contexte

Quelle situation / contrainte motive cette décision ? Pourquoi le statu quo n'est pas tenable ?

## Options envisagées

- **Option A — Nom court** : description + pour/contre
- **Option B** : ...
- **Option C** : ...

## Décision

Une ou deux phrases qui énoncent **la** décision.

## Conséquences

### Positives
- ...

### Négatives / Coûts
- ... (honnêtes, lister ce qu'on perd)

### Neutres / À surveiller
- ... (ce qu'il faudra réévaluer dans X temps)

## Questions ouvertes

Points qu'on laisse explicitement non tranchés, à revoir dans un futur ADR si besoin.
```

## Registre des ADRs

| # | Titre | Statut | Date |
|---|---|---|---|
| [0001](0001-platform-firebase.md) | Plateforme : Firebase/GCP plutôt que Supabase | Accepté | 2026-04-22 |
| [0002](0002-data-connect-relational.md) | Persistance relationnelle via Firebase Data Connect | `Superseded by 0009` | 2026-04-22 |
| [0003](0003-genkit-ai-layer.md) | Firebase Genkit comme couche d'orchestration IA | Accepté | 2026-04-22 |
| [0004](0004-cold-storage-strategy.md) | Archivage en Cloud Storage Archive class | Accepté | 2026-04-22 |
| [0005](0005-firestore-adjoint-only.md) | Firestore adjoint uniquement, jamais source de vérité | Accepté | 2026-04-22 |
| [0006](0006-internal-tool-scope.md) | Outil interne mono-tenant (pas un SaaS) | Accepté | 2026-04-22 |
| [0007](0007-not-a-billing-tool.md) | Hub opérationnel, pas un outil de facturation légal | Accepté | 2026-04-22 |
| [0008](0008-architecture-postgres-firestore-hybrid.md) | Architecture hybride Postgres + Firestore (Option β) | Accepté | 2026-04-22 |
| [0009](0009-sql-connect-repivot-justification.md) | Re-justification de SQL Connect après repivot mono-tenant non fiscal (remplace 0002) | Accepté | 2026-04-22 |
