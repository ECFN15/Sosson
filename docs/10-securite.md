# Chapitre 10 — Sécurité & Autorisations

> **Statut** : stable v0.1 (cadre posé, détails d'implémentation à figer lors du build)
> **Dernière révision** : 2026-04-22
> **Prérequis** : [01 — Vision](01-vision.md), [02 — Architecture](02-architecture.md), [03 — Données](03-data-architecture.md), [06 — Intégrations](06-integrations.md)
> **ADRs référencés** : [0001](adr/0001-platform-firebase.md), [0006](adr/0006-internal-tool-scope.md), [0007](adr/0007-not-a-billing-tool.md), [0008](adr/0008-architecture-postgres-firestore-hybrid.md), [0009](adr/0009-sql-connect-repivot-justification.md)

---

## 10.1 Périmètre de ce chapitre

Ce chapitre est le **contrat de sécurité interne** de Sosson. Il définit :

- **Qui** peut faire quoi (rôles + ACL chantier).
- **Comment** on authentifie (Firebase Auth + OAuth Google pour les intégrations).
- **Comment** on protège les secrets (API keys, OAuth tokens).
- **Comment** on expose des ressources à l'extérieur (liens signés, portail client éventuel).
- **Comment** on journalise et audite (AuditLog, Event, Cloud Logging).
- **Quelles** obligations RGPD s'appliquent et comment on les honore.

**Hors scope** :

- Sécurité physique / infra GCP (Google s'en occupe, voir [ADR 0001](adr/0001-platform-firebase.md)).
- Cryptographie réseau (HTTPS natif Firebase, pas de configuration spécifique à Sosson).
- Pentest applicatif : à programmer séparément après la V1.

## 10.2 Modèle de menace (simple)

Comme Sosson est un **outil interne mono-tenant** (voir [ADR 0006](adr/0006-internal-tool-scope.md)), le modèle de menace est délibérément réduit :

| Acteur | Accès attendu | Risque principal | Contrôle |
|---|---|---|---|
| Gérant (`OWNER`) | Tout | Compromission → accès total | MFA obligatoire, rotation mot de passe, session courte |
| Admin / Assistante (`ADMIN`) | Tout sauf config critique | Même risque que OWNER | MFA obligatoire |
| Opérateur bureau (`OPERATOR`) | Lecture/écriture métier, pas de config | Exfiltration CSV de la base | Rate-limit sur les exports, AuditLog |
| Chef de chantier (`MOBILE`) | Uniquement ses chantiers assignés | Téléphone perdu / volé | Auth Firebase avec révocation immédiate, photos/CR brouillons Firestore effaçables à distance |
| Lecteur (`VIEWER`) | Lecture seule | — | — |
| **Ex-employé** | Doit être coupé immédiatement | Consultation tardive | Révocation Firebase Auth + rotation des secrets partagés si compromis |
| **Attaquant externe** (phishing, token volé) | — | Accès à la boîte email / documents | OAuth scopes minimum, rotation tokens, alerting sur login inhabituel |
| **Client final** (si portail futur) | Lecture de **ses** documents uniquement | Énumération d'IDs d'autres clients | Liens signés GCS courts + ACL stricte côté backend |

Ce qui **n'est pas** dans le modèle de menace :

- Un attaquant étatique avec accès au datacenter Google.
- Des fuites inter-tenants (il n'y a qu'un tenant, voir [ADR 0006](adr/0006-internal-tool-scope.md)).

## 10.3 Authentification

### 10.3.1 Firebase Auth (utilisateurs internes)

- **Firebase Auth classique**, pas Identity Platform (voir [ADR 0006](adr/0006-internal-tool-scope.md) : mono-tenant, pas besoin).
- Providers :
  - **Google Workspace SSO** en priorité (l'entreprise utilise déjà Google : Gmail, Calendar, Drive).
  - **Email + mot de passe** en fallback (pour un employé sans compte Workspace, ou pour un compte de service).
- **MFA obligatoire** pour les rôles `OWNER` et `ADMIN`. Recommandé pour les autres.
- Durée de session : **8 heures** par défaut, renouvelable. Sessions mobiles **30 jours** (cookie refresh long), réinitialisables à distance depuis la console Firebase.
- Tout utilisateur a un enregistrement `User` en base (`firebaseUid` unique, voir [03 §3.4.2](03-data-architecture.md)). La désactivation d'un compte se fait en deux temps :
  1. `User.actif = false` (bloque l'usage côté app).
  2. Firebase Auth : compte désactivé (bloque la connexion).

### 10.3.2 OAuth Google (intégrations Gmail / Calendar)

- **Domain-wide delegation** sur le compte Google Workspace de l'entreprise. Pas d'OAuth par utilisateur : un **compte de service** lit la boîte `contact@entreprise.fr` (ou équivalent). Voir [06 §6.2](06-integrations.md).
- **Scopes minimaux** :
  - `https://www.googleapis.com/auth/gmail.readonly` (ingestion).
  - `https://www.googleapis.com/auth/gmail.modify` (marquer comme lu, optionnel).
  - `https://www.googleapis.com/auth/calendar` (planning bidirectionnel).
- **Refresh tokens** stockés dans Secret Manager (jamais en base, jamais dans le code).
- **Rotation** : le compte de service est recréé annuellement ; rotation manuelle si compromission suspectée.

### 10.3.3 OAuth utilisateur (si portail client futur — hors V1)

- Si un client final (hors entreprise) doit consulter ses documents, on passe par un **magic link** (email avec token signé court) plutôt que par une création de compte. Détails : §10.7.

## 10.4 Autorisation

### 10.4.1 Rôles

Les rôles sont portés par `User.role` (voir [03 §3.4.2](03-data-architecture.md)). Ils sont exposés au client via **custom claims** Firebase Auth :

```json
{ "role": "ADMIN" }
```

| Rôle | Droits |
|---|---|
| `OWNER` | Tout, y compris config (taxonomie catégories, gestion utilisateurs, suppression définitive). 1 seul en pratique. |
| `ADMIN` | Tout sur les données métier + gestion utilisateurs. Pas de suppression définitive hors chantiers archivés. |
| `OPERATOR` | CRUD sur Client, Chantier, Devis, FactureFournisseur, Email, LigneDepense. Pas de suppression hors soft-delete. |
| `MOBILE` | Lecture des chantiers assignés. Écriture de `CompteRendu`, `Photo`, mise à jour d'avancement. Pas d'accès aux factures fournisseurs ni aux emails. |
| `VIEWER` | Lecture seule sur tout sauf AuditLog et config. |

Les rôles sont **cumulatifs en lecture** (un ADMIN voit tout ce qu'un OPERATOR voit) mais **exclusifs en écriture** pour les opérations sensibles.

### 10.4.2 ACL par chantier (MOBILE uniquement)

Un `MOBILE` ne voit **que** les chantiers où il est référencé comme :

- `Chantier.chefChantier`, ou
- `Assignation.user` sur un `Creneau` du chantier, ou
- `MembreEquipe` d'une `Equipe` assignée à un `Creneau` du chantier.

Implémentation : vue SQL `v_chantier_visible_par_mobile` (union des 3 sources). Les règles SQL Connect s'appuient dessus.

### 10.4.3 Règles SQL Connect

Chaque opération GraphQL porte une règle d'autorisation déclarative. Forme canonique :

```graphql
query ChantiersVisibles @auth(expr: "auth.role in ['OWNER', 'ADMIN', 'OPERATOR', 'VIEWER'] || (auth.role == 'MOBILE' && chantierVisibleParMobile(auth.uid, this.id))")
```

**Règle d'or** : aucune opération n'est exposée sans `@auth` explicite. Un `@auth(expr: "true")` est interdit sauf dans une Cloud Function système (ex. webhook Gmail) qui porte sa propre auth.

### 10.4.4 RLS Postgres (défense en profondeur)

En complément des règles SQL Connect, des **Row Level Security** Postgres sont activées sur les tables sensibles :

- `Email`, `EmailRattachement`, `EmailPieceJointe` : invisibles à `MOBILE`.
- `FactureFournisseur`, `LigneDepense` : invisibles à `MOBILE`.
- `AuditLog` : visible uniquement à `OWNER` / `ADMIN`.

Le rôle est lu depuis un paramètre de session Postgres positionné à chaque connexion SQL Connect (`SET LOCAL app.user_role = '...'`). Détail d'implémentation : à préciser en chapitre 08 Opérations.

## 10.5 Firestore : règles de sécurité

Firestore adjoint (voir [ADR 0005](adr/0005-firestore-adjoint-only.md)) porte des données éphémères sensibles (CR brouillons, photos en attente). Règles de sécurité minimales :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    // Brouillons CR : lecture/écriture par l'auteur seulement
    match /cr_brouillons/{brouillonId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == resource.data.auteurUid;
    }
    // File photos en attente : pareil
    match /photos_queue/{photoId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == resource.data.ownerUid;
    }
    // Planning collaboratif : lecture pour tous les authentifiés, écriture OPERATOR+
    match /planning_live/{doc=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.auth.token.role in ['OWNER', 'ADMIN', 'OPERATOR'];
    }
    // Présence : lecture par tous les authentifiés, écriture par soi-même
    match /presence/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Principe** : Firestore ne porte **jamais** de donnée sensible durable (factures, emails, AuditLog). Si cette contrainte est violée, c'est un bug à corriger, pas un trou de sécurité à patcher.

## 10.6 Cloud Storage : liens signés et ACL

### 10.6.1 Bucket `sosson-{env}-media` (hot) — pattern d'upload canonique

- **ACL par défaut** : privé. Aucune lecture publique. Jamais `allUsers`.
- **Pattern d'upload canonique : URL signée V4 émise par Cloud Function.** C'est le **seul** modèle d'upload autorisé, valable pour tous les formats (PDF, photo, Excel, document divers). Il se déroule en 3 étapes :
  1. Le client appelle une mutation GraphQL / Cloud Function `requestUploadUrl({ entityType, entityId, nomFichier, typeMime, tailleBytes })`.
  2. Le backend **vérifie l'auth et l'ACL** (ex. `MOBILE` a-t-il bien accès au chantier cible ?), **valide la requête** (MIME dans whitelist, taille ≤ plafond par type), calcule un chemin normalisé (ex. `chantiers/{chantierId}/factures-fournisseurs/{uuid}.pdf`), et émet une **URL signée V4** `PUT` valide ≤ 5 min, scopée au chemin + content-type exact + taille max.
  3. Le client `PUT` directement son fichier à cette URL → **GCS applique les contraintes** (mauvais content-type ou fichier trop gros = upload rejeté). Une fois l'upload terminé, un trigger Storage `onObjectFinalize` lance la suite (extraction IA, création d'entité, scan antivirus async si besoin).
- **Pourquoi ce pattern et pas un proxy Cloud Function** : avec un proxy, les gros PDF (> 10 Mo) ou les photos mobiles hittent les limites Cloud Functions (mémoire, timeout 540 s, coût du temps de CPU passé à streamer des octets). L'URL signée V4 délègue le transport à GCS tout en gardant **l'autorisation côté backend**.
- **Pourquoi ce n'est pas équivalent à "upload direct client → bucket anonyme"** : l'URL signée n'existe que si la Cloud Function a validé l'auth, l'ACL, le MIME et la taille. Il n'y a aucun moyen pour un client d'écrire un objet arbitraire sans passer par l'étape 1.
- **Lecture mobile** : URL signée `GET` émise par une mutation GraphQL `getSignedUrlForMedia({ entityType, entityId })` qui vérifie l'ACL chantier, durée ≤ 15 min.
- **Cohérence inter-chapitres** : les diagrammes "Upload PDF → Cloud Storage" de [02 §2.4](02-architecture.md) et "Upload .xlsx → Cloud Storage" de [06 §6.6.2](06-integrations.md) sont des vues **logiques** qui masquent cette étape de signature pour ne pas surcharger le diagramme. L'implémentation suit toujours le pattern à 3 étapes ci-dessus.

### 10.6.2 Bucket `sosson-{env}-archives` (cold)

- **ACL** : privé strict. Aucune URL signée de longue durée.
- **Lecture** : via Cloud Function `restoreArchive` réservée aux rôles `OWNER` / `ADMIN`.
- **Écriture** : uniquement par la Cloud Function `archiveChantier` (service account dédié). Aucun utilisateur humain n'a de droit d'écriture direct.
- **Object Versioning** : activé. Empêche l'écrasement accidentel.
- **Object Retention Lock** : **non activé en V1** — incompatible avec le droit RGPD à l'effacement, et non requis puisque Sosson est non fiscal ([ADR 0007](adr/0007-not-a-billing-tool.md)). Position détaillée et procédure `purgeArchive` (réservée `OWNER`) dans [05 §5.6.1](05-archival-strategy.md).
- **Rétention cible** : 10 ans (cible opérationnelle, pas verrou technique). Voir [05 §5.6](05-archival-strategy.md).

### 10.6.3 Liens signés vers des clients externes (si portail futur)

Si un client final doit consulter un PDF sans compte :

- Le backend génère un token HMAC (clé en Secret Manager) incluant : `resourceId`, `clientId`, `expiresAt` (≤ 7 jours).
- Le lien ressemble à `https://app.sosson.fr/c/{token}`.
- Le serveur valide le token, vérifie l'expiration, émet une URL signée GCS courte (5 min), redirige.
- **Pas d'énumération possible** (tokens non devinables, aucune liste).
- Tout accès est loggué dans `Event` (`type: EXTERNAL_VIEW`).

## 10.7 Secrets & configuration

- **Stockage** : **Secret Manager GCP** uniquement. Jamais en base, jamais dans le code, jamais dans les variables d'environnement Cloud Functions en clair (référencées via `secretRef`).
- **Secrets gérés** :
  - OAuth refresh tokens Google (Gmail, Calendar).
  - Clé HMAC pour liens signés.
  - Éventuelle clé webhook du logiciel comptable.
  - Éventuelle clé API de service SMS / Email transactionnel.
- **Rotation** : annuelle pour les secrets opérationnels. Immédiate sur suspicion de compromission. Procédure à documenter en chapitre 08 Opérations.
- **Accès aux secrets** : uniquement via **IAM** GCP, granulé par Cloud Function. Pas de lecture de secret par un utilisateur humain en routine (seul l'`OWNER` de l'infra a l'IAM `Secret Manager Admin`).

## 10.8 Observabilité sécurité

| Événement | Source | Où il est loggué | Rétention |
|---|---|---|---|
| Connexion utilisateur | Firebase Auth | Cloud Logging | 30 jours |
| Connexion OAuth Google (compte de service) | Cloud Function Gmail poller | Cloud Logging | 90 jours |
| Modification d'entité sensible | Trigger base | `AuditLog` | **permanente** (jamais purgée) |
| Action fonctionnelle métier | Application | `Event` | **permanente** |
| Erreur d'autorisation (403) | SQL Connect / Cloud Function | Cloud Logging + alerte si > 10/min | 30 jours |
| Accès à un lien signé externe | Cloud Function | `Event` + Cloud Logging | permanente (`Event`) + 30 jours (log) |

**Alerting** (via Cloud Monitoring) :

- Plus de 10 échecs d'auth sur un même UID en 5 min → alerte email OWNER.
- Connexion depuis un pays inhabituel (hors France / UE) → alerte.
- Volume d'AuditLog anormalement élevé (> 10× la moyenne 7j) → alerte.

## 10.9 RGPD et données personnelles

### 10.9.1 Données personnelles collectées

- **Utilisateurs internes** : nom, email, téléphone, rôle. Base légale : relation contractuelle (contrat de travail).
- **Clients finaux** : nom, email, téléphone, adresse, éventuellement SIRET. Base légale : exécution du contrat / intérêt légitime.
- **Contenu des emails** : expéditeurs externes (fournisseurs, clients). Base légale : intérêt légitime (gestion opérationnelle).
- **Fournisseurs** (extrait des factures) : nom, SIRET. Pas de donnée personnelle au sens strict (entité morale) sauf si particulier.
- **Photos de chantier** : peuvent contenir des personnes (clients, équipe). Base légale : intérêt légitime, mais floutage des visages non-employés recommandé pour les photos publiées hors Sosson.

### 10.9.2 Obligations honorées

| Obligation RGPD | Mise en œuvre Sosson |
|---|---|
| Résidence UE | Région GCP `europe-west1` (Belgique) ou `europe-west9` (Paris). À acter par ADR dédié à la création du projet. |
| Minimisation | Le schéma [03 §3.4.2](03-data-architecture.md) ne collecte que le strict nécessaire. Pas de données sensibles (santé, opinions...). |
| Portabilité | Export JSON complet de la base + médias possible en < 24 h (invariant §5.1 de [documentation.md](../documentation.md)). Format documenté [chap 05](05-archival-strategy.md) par chantier, à étendre en export global au niveau outil. |
| Droit d'accès | Un client final peut demander ses données → export manuel par l'équipe (procédure à figer en chapitre 08). |
| Droit à l'effacement | Soft delete sur `Client` (`deletedAt`), suppression définitive après 3 ans ou sur demande explicite. Archives GCS : suppression possible par procédure `OWNER` uniquement, tracée dans `AuditLog` — voir [05 §5.6.1](05-archival-strategy.md). Pas de Retention Lock en V1, précisément pour garder ce droit opérationnel. |
| Droit de rectification | Modifications possibles en base, tracées dans `AuditLog`. |
| Registre des traitements | À produire hors repo (document RH / juridique). |
| Durée de conservation | Hot : tant que le chantier est actif. Warm : 3 ans post-clôture. Cold : **10 ans cible** (pratique interne, pas verrou technique — voir [05 §5.6.1](05-archival-strategy.md)). |
| Notification de violation | Procédure à figer : détection via alerting §10.8 → notification CNIL sous 72 h si données personnelles compromises. |

### 10.9.3 Sous-traitants

- **Google** (Firebase, GCP, Gemini via Vertex) : contrat DPA signé au niveau de l'entreprise cliente Google Workspace. Les données envoyées à Gemini via l'offre entreprise **ne sont pas utilisées pour entraîner** les modèles (à vérifier contractuellement — voir [04 §4.8](04-intelligence.md)).
- Pas d'autres sous-traitants en V1.

## 10.10 Checklist de sécurité V1 (avant mise en prod)

À cocher avant l'ouverture en production :

- [ ] MFA activée sur les comptes `OWNER` et `ADMIN`.
- [ ] Firebase App Check activé (anti-bot côté frontend).
- [ ] Toutes les règles SQL Connect portent un `@auth` explicite.
- [ ] Toutes les collections Firestore ont des règles de sécurité non-`allow true`.
- [ ] Buckets GCS sans ACL publique.
- [ ] Secrets dans Secret Manager (rien en clair).
- [ ] Cloud Function webhook Gmail vérifie la signature Pub/Sub.
- [ ] Région GCP européenne actée.
- [ ] Alerting Cloud Monitoring configuré (§10.8).
- [ ] Export JSON complet testé (RGPD portabilité).
- [ ] Procédure de désactivation d'un ex-employé testée (révocation Auth + `User.actif=false`).
- [ ] Backup Cloud SQL automatique activé + export hebdomadaire JSON vers GCS Archive.
- [ ] DPA Google Workspace signé et archivé côté juridique.

## 10.11 Questions ouvertes

- **Mobile device management** : faut-il imposer un MDM (Google Endpoint Management) sur les téléphones utilisés pour `MOBILE` ? À arbitrer selon la politique IT de l'entreprise.
- **CMEK** (clés de chiffrement gérées par l'entreprise) : non activées en V1 ([05 §5.8](05-archival-strategy.md)). À revoir si exigence client forte apparaît.
- **Pentest** : à programmer après la V1 (3-6 mois de run), prestataire externe.
- **Chiffrement applicatif au repos** (en plus du chiffrement GCP) : non prévu en V1 (surcomplexité pour un outil interne mono-tenant).
- **Portail client externe** : modalités d'auth précises et ACL fines → ADR dédié le jour où on l'attaque.
- **Gmail : faut-il une boîte dédiée Sosson** (`contact@...`) plutôt que la boîte perso du gérant ? Recommandé — à acter à la mise en place de l'intégration.

## 10.12 Ce que ce chapitre **ne couvre pas**

- Sécurité réseau (HTTPS, TLS) : hérité de Firebase/GCP, pas de spécifique.
- Sécurité physique des terminaux utilisateurs : relève de la politique IT générale de l'entreprise.
- Contrats commerciaux / responsabilités juridiques : hors doc technique.
- Sauvegardes et plan de reprise d'activité : chapitre 08 Opérations.

---

**Retour au** [sommaire](../documentation.md#3-sommaire).

## 10.13 Notes checkpoint 002 - etat reel 2026-05-16

Cette section complete le cadrage cible ci-dessus avec l'etat reel du repo.

- Firebase Auth prouve l'identite et fournit `auth.uid`.
- SQL `User` devient le profil applicatif cible; le login tente maintenant `GetCurrentUser` avant le fallback Firestore transitoire.
- Firestore `users/{uid}` reste seulement une transition a supprimer une fois les profils SQL sandbox provisionnes.
- localStorage peut stocker des brouillons, preferences ou caches, mais ne doit jamais autoriser une action sensible.
- La matrice locale d'acces ne peut maintenant que restreindre l'UX par rapport aux droits par defaut du role; elle ne peut pas elever un role au-dessus de `defaultAccessMatrix`.
- Le fallback auth local est strictement opt-in via `VITE_ENABLE_LOCAL_AUTH_FALLBACK=true`, en dev local uniquement, jamais production.
- `UpsertCurrentUser` n'est plus expose dans le connecteur client; le provisioning des roles passe par script admin avec Admin SDK Data Connect.

Gate securite avant production: aucun utilisateur ne doit pouvoir creer ou modifier son role applicatif depuis le navigateur, meme en bricolant les appels SQL Connect.
