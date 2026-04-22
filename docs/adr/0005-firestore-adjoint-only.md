# ADR 0005 — Firestore adjoint uniquement, jamais source de vérité

> **Statut** : Accepté
> **Date** : 2026-04-22
> **Auteurs** : fondateur
> **Remplace** : —
> **Remplacé par** : —
>
> **Prérequis de lecture** : [02 — Architecture §2.7](../02-architecture.md), [ADR 0002](0002-data-connect-relational.md)

## Contexte

Firebase bundle inclut trois bases : **SQL Connect** (relationnel, choisi en ADR 0002 comme source de vérité), **Firestore** (NoSQL documents temps réel), **Realtime Database** (NoSQL arbre, historique).

Deux tentations naturelles existent et doivent être cadrées **avant** qu'elles ne s'installent silencieusement dans le code :

1. « Firestore a du realtime gratuit, mettons-y quelques trucs pour gagner du temps » → dérive inévitable vers des données critiques hébergées sans contrat relationnel.
2. « Utilisons les trois bases selon ce qui est le plus simple au cas par cas » → chaos à 2 ans, impossible à raisonner à 10.

Cet ADR fige la politique **avant que le premier fichier ne soit écrit**, pour éviter d'avoir à arbitrer au cas par cas sous pression produit.

## Options envisagées

### Option A — Firestore interdit totalement
- ✅ Aucune ambiguïté, un seul endroit où chercher la vérité.
- ❌ Perte du realtime natif Firebase pour des cas d'usage pourtant légitimes (présence, notifications live, feeds).
- ❌ Obligerait à coder en Cloud Functions ou polling ce que Firestore offre gratuitement.

### Option B — Firestore comme adjoint optionnel, strictement encadré
- ✅ Récupère le bénéfice realtime quand il apporte de la valeur utilisateur.
- ✅ Sépare clairement source de vérité (SQL Connect) et canaux temps réel (Firestore).
- ❌ Nécessite une discipline : chaque usage doit être explicitement justifié et tracé.
- ❌ Pas de transaction atomique cross-base → modèle de cohérence "eventuellement synchrone" pour la partie Firestore.

### Option C — Libre choix base par base selon cas
- ❌ Rejeté sans débat. C'est exactement ce qu'on veut empêcher.

## Décision

**Option B** : Firestore est autorisé **uniquement** comme **adjoint temps réel optionnel et additif**. Jamais source de vérité. Jamais contenant d'une donnée non reconstructible depuis SQL Connect.

Realtime Database (l'ancienne base NoSQL arbre JSON) est **interdite** — obsolète, aucun avantage sur Firestore.

## Conséquences

### Positives
- Un seul endroit pour chercher la vérité métier : SQL Connect.
- Possibilité de construire des UX temps réel (présence, feeds live) quand le besoin apparaît.
- Si Firestore disparaît demain, aucune perte critique — seulement dégradation de l'UX temps réel.
- Facturation et observabilité maîtrisées (Firestore a une courbe de coût par read/write qui explose si mal utilisé).

### Négatives / Coûts
- Discipline requise : tout usage Firestore doit être instruit (voir §Invariants ci-dessous).
- Duplication partielle de certaines données (ex. un événement "devis créé" apparaît dans les deux bases). Acceptable tant que SQL est **la référence** et Firestore **le miroir éphémère**.
- Pas de transaction cross-base : il faut gérer les cas où l'écriture SQL réussit et l'écho Firestore échoue (ou l'inverse). Pattern : on écrit toujours SQL d'abord, l'écho Firestore est best-effort, reconstructible si besoin.

### Neutres / À surveiller
- Si un cas d'usage réel justifie Firestore comme source de vérité (impossible à voir aujourd'hui), écrire un ADR de remplacement.
- Si Google fait évoluer SQL Connect vers un modèle temps réel natif (listeners sur requêtes), réévaluer la nécessité même de Firestore.

## Invariants complémentaires posés par cette décision

**Règles d'or applicables à tout usage Firestore dans Sosson** :

1. **Reconstructibilité.** Toute donnée présente dans Firestore doit être reconstructible depuis SQL Connect (directement ou par rejouage d'événements). Si on supprime Firestore, seule l'UX temps réel est dégradée.
2. **Jamais de financier, légal, contractuel** en Firestore. Factures, devis, paiements, clients, chantiers → SQL Connect exclusivement.
3. **TTL par défaut.** Les collections Firestore ont une politique d'expiration (`ttl` Firestore natif ou job de purge). Pas de rétention indéfinie.
4. **Un document Firestore pointe toujours sur l'ID SQL**, pas l'inverse. La référence va du système éphémère vers le système stable.
5. **Addendum obligatoire à cet ADR** pour chaque collection Firestore créée :
   - Quoi : nom de la collection, schéma des documents.
   - Pourquoi : quel besoin utilisateur justifie le temps réel.
   - TTL : durée de rétention.
   - Reconstruction : comment on reconstruit si on perd la collection.

Exemple de premier addendum envisageable (non acté — à écrire quand le besoin arrive) : `presence/{chantierId}/users/{userId}` pour montrer qui est actif sur un chantier. TTL 2 min. Reconstruction triviale : les users se reconnectent, la collection se repeuple.

## Questions ouvertes

- **Frontière mobile terrain** : les chefs de chantier en zone 4G faible ont besoin d'offline-first sur les photos/compte-rendus. Firestore a un offline-first excellent ; SQL Connect moins évident à mon sens. À arbitrer en chapitre 07 Frontend : soit Firestore pour la zone offline puis sync vers SQL quand connecté, soit couche de cache applicatif personnalisée. À trancher par ADR quand on attaque le mobile.
- **Notifications push** : probablement via Firebase Cloud Messaging (FCM), indépendamment de Firestore. À préciser.
