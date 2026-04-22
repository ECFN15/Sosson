# Chapitre 06 — Intégrations externes

> **Statut** : placeholder stable (cadre posé, spec détaillée à produire à l'implémentation)
> **Dernière révision** : 2026-04-22
> **Prérequis** : [02 — Architecture](02-architecture.md), [03 — Données](03-data-architecture.md)
> **ADRs référencés** : [0003](adr/0003-genkit-ai-layer.md), [0008](adr/0008-architecture-postgres-firestore-hybrid.md)

---

## 6.1 Périmètre de ce chapitre

Sosson ne vit pas en vase clos. L'entreprise continue d'utiliser Gmail pour la correspondance, Google Calendar pour le planning individuel, un logiciel comptable externe pour la facturation légale. Sosson doit **s'insérer dans cet écosystème sans le casser**.

Ce chapitre documente les **points de contact** entre Sosson et le monde extérieur :

| Intégration | Sens | Priorité | Statut |
|---|---|---|---|
| Gmail (boîte entreprise) | **Entrant** principalement | **Critique V1** | À implémenter |
| Google Calendar | **Bidirectionnel** | Important V2 | À implémenter |
| Logiciel comptable (TBD) | Entrant (imports) + sortant (exports) | Important V2 | À spécifier (dépend du logiciel utilisé) |
| Stockage cloud existant (Dropbox/Drive) | Entrant (migration one-shot) | Important V1 | À planifier |

**Note importante** : les intégrations "legacy" (Trello, WhatsApp, Excel éparpillés) ne sont **pas synchronisées en continu**. Elles sont **vidées** progressivement : l'équipe bascule son usage vers Sosson, les anciens outils sont décommissionnés. Pas de pont permanent.

## 6.2 Intégration Gmail (cœur)

### 6.2.1 Cas d'usage

- Toute la correspondance entreprise transite par la boîte Gmail principale (ex. `contact@sosson-btp.fr`).
- Sosson **aspire en temps réel** les emails entrants, les trie, les rattache automatiquement à un Client / Chantier si possible.
- La timeline de la fiche client agrège les emails ↔ les appels ↔ les devis ↔ les visites chantier.
- L'assistante voit en priorité les emails classés `URGENT` et la file "à confirmer le rattachement".

### 6.2.2 Architecture du flux

```
Gmail Boîte entreprise
        │
        │ (1) Push notification via watch() + Pub/Sub
        ▼
┌────────────────────────────────────────────┐
│  Google Cloud Pub/Sub : topic gmail-events │
└────────────────────┬───────────────────────┘
                     │ push HTTPS
                     ▼
┌────────────────────────────────────────────┐
│  Cloud Function onEmailReceived            │
│  1. Fetch message Gmail API (full payload) │
│  2. Déduplication via gmailId              │
│  3. Stocke pièces jointes sur GCS          │
│  4. Appelle trieEmail (Genkit)             │
│  5. Appelle rattacheEmailAuChantier        │
│  6. Insère Email + EmailRattachement       │
│  7. Event "EMAIL_RECU" si priorité URGENT  │
└────────────────────────────────────────────┘
```

### 6.2.3 Gmail API — méthodes utilisées

| Méthode | Usage |
|---|---|
| `users.watch()` | Souscrit aux notifications push, renouvelé tous les 7 jours (contrainte Gmail) par scheduler |
| `users.history.list(startHistoryId)` | Récupère les événements depuis la dernière notification (plus robuste qu'un fetch direct) |
| `users.messages.get(id, format='FULL')` | Récupère un message complet (headers + body + PJ) |
| `users.messages.attachments.get()` | Télécharge une PJ individuelle |

### 6.2.4 Authentification

**OAuth 2.0 avec compte de service delegation** (domain-wide delegation) :
- Le compte GSuite admin autorise Sosson à lire la boîte entreprise.
- Sosson n'utilise **pas** l'auth Gmail de chaque utilisateur — c'est un accès au nom de l'entreprise.
- Scopes minimaux : `gmail.readonly` + `gmail.metadata` (pas d'envoi depuis Sosson en V1).
- Credentials stockés dans Secret Manager, jamais en clair ni en base.

### 6.2.5 Cas limites à gérer explicitement

| Cas | Comportement |
|---|---|
| Notification Pub/Sub reçue en double | Déduplication via `Email.gmailId` (unique) |
| Email très long ou avec images inline énormes | Body tronqué à N caractères en SQL, HTML complet sur GCS |
| Pièce jointe > 25 Mo | Stockée en streaming direct Gmail → GCS, pas en mémoire Function |
| Email chiffré S/MIME | Non traité : statut `REJETE_CRYPTE`, notif admin |
| Watch expiré (non renouvelé) | Scheduler quotidien vérifie et renouvelle. Alerte si expiré |
| Quota Gmail API dépassé | Retry exponentiel + queue d'attente (Cloud Tasks) |

### 6.2.6 Envoi depuis Sosson (V2, non V1)

Pas en V1. Si besoin futur : envoi via Gmail API avec la même auth, en mode "au nom de l'entreprise". Spec dans un ADR dédié quand on l'attaquera.

## 6.3 Intégration Google Calendar

### 6.3.1 Cas d'usage

- Le planning Sosson (entité `Creneau`) est synchronisé avec l'agenda Google de chaque chef de chantier.
- Créer un `Creneau` dans Sosson → apparaît sur l'agenda Google de l'utilisateur assigné.
- Modifier un événement dans Google Agenda → se répercute dans Sosson (attention aux boucles de sync).

### 6.3.2 Modèle de sync

**Source de vérité** : Sosson (SQL Connect, entité `Creneau`). Google Calendar est un **miroir** pour la consultation mobile native.

- Clé de réconciliation : `Creneau.googleCalendarEventId`.
- À la création dans Sosson : appel `events.insert` → récupération de l'ID Google → stockage.
- À la modification dans Sosson : appel `events.update`.
- À la modification dans Google Calendar : webhook Calendar → Cloud Function → `onCalendarEventUpdated` → merge intelligent (conflict resolution last-write-wins avec warning utilisateur si modif concurrente).

### 6.3.3 Cas limites

| Cas | Comportement |
|---|---|
| Utilisateur supprime un événement dans Google Calendar | Sosson reçoit le webhook, passe `Creneau.statut=ANNULE` (soft), notifie le chef de chantier |
| Utilisateur modifie l'horaire dans Google Calendar | Sosson met à jour le `Creneau.debut/fin` et propage aux assignations |
| Conflit concurrent (édition dans les deux en parallèle) | Gagne la dernière write ; historique complet dans `AuditLog` + `Event` |
| Webhook Calendar non reçu | Scheduler horaire qui `events.list` sur les dernières 24h pour réconcilier |

## 6.4 Intégration logiciel comptable

Sosson est **non fiscal** ([ADR 0007](adr/0007-not-a-billing-tool.md)), donc la compta reste chez le comptable. L'intégration a deux sens :

### 6.4.1 Entrant : import des factures clientes émises par le comptable

Le comptable émet les factures clientes dans son outil. Sosson les récupère pour les afficher dans la fiche chantier.

**Option A — Import manuel** (V1) : l'assistante uploade le PDF de chaque facture émise, Sosson parse (extraction IA) pour récupérer numéro / montants / dates, rattache au chantier.

**Option B — Import automatique via API** (V2) : si le logiciel comptable expose une API (Sage, EBP, Pennylane, Axonaut...), scheduler journalier qui liste les factures émises et les crée dans Sosson. Spec dépendante du logiciel retenu par l'entreprise → ADR dédié.

### 6.4.2 Sortant : export des dépenses catégorisées vers la compta

À la fin du mois, Sosson exporte les `FactureFournisseur` validées avec leur catégorisation pour aider le comptable :

- Format : **FEC** (Fichier des Écritures Comptables, format réglementaire français) si on va loin, sinon **CSV** enrichi en V1.
- Livraison : email mensuel au comptable, ou drop dans un bucket GCS partagé.
- **Réconciliation manuelle côté comptable** : Sosson ne **remplace** pas la saisie comptable, il la **facilite** en fournissant des données pré-catégorisées.

## 6.5 Migration one-shot du stockage existant

Situation actuelle : photos chantier sur WhatsApp / Dropbox, factures sur Drive / papier, devis dans un dossier Excel.

### 6.5.1 Stratégie

- Dump des dossiers Drive / Dropbox existants vers un bucket temporaire GCS (outil : `rclone`).
- Cloud Function batch qui parcourt le bucket, classifie (type de document, chantier probable via nom de fichier ou IA), et propose un rattachement à un `Chantier` existant.
- Validation humaine en masse via une UI dédiée "import legacy".
- Import terminé = bucket temporaire archivé puis purgé.

### 6.5.2 Ce qui ne sera PAS migré

- Les WhatsApp des 3 dernières années : trop bruité, ROI faible. On démarre Sosson et on regarde de l'avant.
- Les Excel éclatés sans structure : l'équipe ressaisit progressivement ce qui compte encore.

## 6.6 Excel : premier citoyen de l'ingestion

Excel est **omniprésent** dans les PMEs BTP. Sosson doit savoir l'avaler sans broncher.

### 6.6.1 Cas d'usage couverts

| Type de fichier Excel | Usage Sosson |
|---|---|
| Métré / devis chantier | Import en tant que `DevisLigne` si rattachement à un Chantier |
| Tableau de suivi fournisseurs (prix, disponibilité) | Alimente une table `ReferentielPrixFournisseur` (hors V1, déjà prévu V2) |
| Planning exporté d'un autre outil | Import en tant que `Creneau` |
| Relevé de dépenses carte bancaire pro | Import en tant que `FactureFournisseur` en lot (même extraction IA par ligne) |

### 6.6.2 Flow technique

```
Upload .xlsx
     │
     ▼
Cloud Storage
     │
     ▼ trigger
Cloud Function onExcelUploaded
     │
     ├─► Parse avec `xlsx` ou `exceljs` (TS)
     ├─► Détecte structure (entêtes, colonnes)
     ├─► Appelle Genkit flow `classifieExcel` → type probable
     ├─► Extrait lignes → proposition de rattachement
     └─► Crée DocumentAttache + propositions à valider par humain
```

La détection de structure est volontairement **permissive** : même un Excel malformé doit produire quelque chose d'exploitable (au pire, le fichier reste `DocumentAttache` brut avec un résumé IA).

## 6.7 Ce que ce chapitre **ne couvre pas**

- Choix précis du logiciel comptable cible → dépend du comptable de l'entreprise, à préciser au moment de l'intégration.
- Spécification complète du portail client séparé (consultation lecture par les clients finaux) → ADR dédié quand on l'attaquera.
- Notifications sortantes (FCM push mobile, emails) → chapitre 07 Frontend ou chapitre 08 Opérations selon où c'est le plus clair.
- Intégration SMS pour les clients finaux (rappel RDV) → V2+, non spécifié.

---

**Chapitre suivant** : [07 — Frontend](07-frontend.md) *(à écrire)*.
