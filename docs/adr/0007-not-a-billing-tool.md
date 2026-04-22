# ADR 0007 — Sosson est un hub opérationnel, pas un outil de facturation légal

> **Statut** : Accepté
> **Date** : 2026-04-22
> **Auteurs** : fondateur
> **Remplace** : —
> **Remplacé par** : —
>
> **Impact** : modifie l'invariant §5.1 du [documentation.md](../../documentation.md). Modifie la portée de plusieurs entités dans [03 — Données](../03-data-architecture.md).

## Contexte

La documentation initiale positionnait Sosson comme un **outil de facturation électronique conforme** à la réglementation française (numérotation continue des factures, immuabilité des factures émises, rétention légale 10 ans au sens fiscal, etc.).

Clarification du fondateur : **ce n'est pas le rôle de Sosson**. L'entreprise a déjà un expert-comptable externe qui utilise son propre logiciel comptable pour tout ce qui est légal. Sosson est un **outil opérationnel de centralisation**, dont les objectifs sont :

- Extraire et **catégoriser** les dépenses (factures fournisseurs) pour alimenter des **dashboards prévisionnels**.
- **Tracer** l'activité autour des chantiers (emails, documents, photos, rapports).
- **Supprimer les asymétries d'information** dans l'équipe.
- **Intégrer** les outils existants (Gmail, Google Calendar) pour en faire la synthèse.

Les factures, devis et documents dans Sosson ont une vocation **opérationnelle** (savoir où on en est, combien ça a coûté, qui a fait quoi), pas **comptable** (produire un document légalement opposable à l'administration fiscale).

## Options envisagées

### Option A — Sosson comme outil de facturation légal (statu quo doc 0.1.0)

- ✅ Remplace à terme le logiciel du comptable.
- ✅ Tout dans un seul outil.
- ❌ Ouvre un chantier énorme : Factur-X, PDP (Plateforme de Dématérialisation Partenaire), certifications, compliance NF203, piste d'audit fiable, etc.
- ❌ Sort largement du périmètre que le fondateur est prêt à porter.
- ❌ Risque fiscal si mal fait.
- ❌ Double emploi avec le comptable existant.

### Option B — Sosson comme hub opérationnel, sans prétention fiscale

- ✅ Scope tenable (un seul développeur junior peut le livrer).
- ✅ Value immédiate pour l'équipe sans toucher au comptable.
- ✅ Permet d'ajouter la brique "compta" plus tard si besoin, par ADR de remplacement.
- ❌ Certaines données saisies dans Sosson (ex : factures fournisseurs catégorisées) ne sont pas l'"original légal" → obligation de rester vigilant sur la notion de source de vérité légale (le PDF stocké reste l'exemplaire officiel).

### Option C — Hybride : non-fiscal pour 90 % des usages, rigueur fiscale sur la facturation cliente si un jour Sosson émet

- ❌ Mi-chemin = pire des deux mondes : on garde la complexité fiscale sans en tirer les bénéfices.
- ❌ Rejeté.

## Décision

**Option B retenue.** Sosson est un **hub opérationnel non fiscal**.

Conséquences concrètes :

1. **Pas de numérotation continue** obligatoire sur les factures ou les devis dans Sosson. On peut numéroter pour lisibilité, mais sans contrainte fiscale de continuité.
2. **Pas d'immuabilité absolue** des factures. Un utilisateur autorisé peut corriger une saisie (avec historisation pour traçabilité, mais pas avec interdiction base).
3. **Pas de format Factur-X / UBL** à produire. Sosson consomme les PDFs reçus, ne génère pas d'e-facture légale.
4. **Pas d'intégration PDP** (plateforme de dématérialisation partenaire). Les factures clients restent émises depuis le logiciel du comptable.
5. **La rétention 10 ans** reste une pratique d'archivage interne (mémoire opérationnelle à long terme), mais **sans statut légal**. Si l'administration fiscale demande un document, c'est le comptable qui répond.
6. **Les factures clientes** dans Sosson sont des **imports** ou des **références** au document émis ailleurs. Champ typique : lien vers le PDF émis + métadonnées utiles à l'opérationnel (chantier associé, statut encaissement, etc.).
7. **Les devis** sont opérationnels. On peut les envoyer depuis Sosson, mais ils ne sont pas des actes commerciaux à valeur légale particulière (un devis signé reste un engagement contractuel, mais ça ne change pas l'architecture).

## Conséquences

### Positives

- Schéma et règles de gestion considérablement simplifiés.
- Pas besoin de gérer la continuité de numérotation (sinon pour lisibilité).
- Pas de Factur-X, pas de PDP, pas de NF203.
- Liberté de faire évoluer le modèle de données sans craindre de casser une obligation légale.
- Meilleure compatibilité avec l'instinct "Firestore + backup JSON" du fondateur (sans que ce soit le choix retenu — voir ADR 0008).
- Scope projet tenable pour un développeur junior.

### Négatives / Coûts

- Double saisie partielle : les factures clientes doivent exister à la fois dans Sosson (opérationnel) et dans le logiciel comptable (légal). Import automatique ou ressaisie — à traiter dans le chapitre Intégrations.
- Si dans 5 ans le fondateur veut internaliser la compta, il faudra ouvrir un chantier "compliance" dédié.

### Neutres / À surveiller

- Surveiller que la pratique ne dérive pas vers un usage fiscal implicite (ex : quelqu'un finit par imprimer une facture générée par Sosson et la soumet à un client → on bascule dans le fiscal sans l'avoir voulu). Règle : tout document généré par Sosson mentionne visiblement qu'il s'agit d'un document opérationnel.
- Si l'administration fiscale demande quelque chose, répondre via le comptable externe, pas via Sosson.

## Invariants annulés ou modifiés

- **Invariant §5.1** "Souveraineté des données métier" : reformulé → *"Aucune donnée opérationnelle ne doit être irrécupérable. Un export complet (JSON + médias) doit toujours être possible en < 24 h."* (retrait de la connotation légale.)
- **Invariant "une facture émise ne peut pas être supprimée"** (qui figurait dans §1.3 de 02-architecture.md et §3.3.2 de 03-data-architecture.md) → **annulé**. Remplacé par : *"les modifications sur une facture sont historisées (audit log), pas interdites."*
- Le chapitre [05 — Archivage](../05-archival-strategy.md) garde son utilité opérationnelle (mémoire long terme) mais **perd son caractère de contrainte légale**. Les 10 ans deviennent une pratique interne, pas une obligation.

## Questions ouvertes

- Les comptes-rendus d'intervention signés électroniquement par un client final (cas classique BTP) ont-ils une valeur juridique qui mériterait un traitement particulier ? À traiter si/quand on ajoute la signature électronique dans une V2.
- Comment éviter la divergence entre Sosson et le logiciel comptable ? Réponse provisoire : Sosson reste **en aval** (il importe). Si le comptable émet une facture, un mécanisme d'import la récupère. Spec complète dans le chapitre Intégrations.
