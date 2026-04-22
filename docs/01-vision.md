# Chapitre 01 — Vision & Contexte

> **Statut** : stable
> **Dernière révision** : 2026-04-22
> **Responsable** : fondateur
> **Prérequis de lecture** : [documentation.md](../documentation.md)

---

## 1.1 Raison d'être

Sosson est un **outil interne** développé pour une **unique PME française du secteur du bâtiment et des services techniques** (30 à 50 salariés). Ce n'est **pas** un SaaS vendu à plusieurs entreprises.

Le problème que Sosson résout : l'équipe est aujourd'hui éparpillée sur une dizaine d'outils (Excel, Trello, WhatsApp, Gmail, Dropbox, logiciel de facturation, scanner de factures papier). L'information est fragmentée, les décisions se prennent à l'aveugle, les chefs de chantier ne savent pas ce que le bureau a envoyé, le bureau ne sait pas ce qui se passe sur site, et le gérant n'a **aucune vision unifiée** de l'activité.

Sosson est le **hub opérationnel unique** de l'entreprise : un seul endroit pour centraliser les dossiers chantiers, les emails, les documents, les comptes-rendus terrain, le planning, et pour **extraire intelligemment** de la valeur de cette masse (catégorisation des coûts, dashboards prévisionnels, alertes).

L'objectif ultime : **supprimer les asymétries d'information** dans l'entreprise et **donner au gérant une vision globale en temps réel**.

## 1.2 Utilisateurs cibles (internes)

| Persona | Rôle | Contexte d'usage |
|---|---|---|
| **Gérant** | Vision globale : trésorerie prévisionnelle, marge par chantier, productivité équipe, alertes | Desktop principalement, dashboards |
| **Conducteur de travaux / chef de chantier** | Suit l'exécution, prend photos, écrit comptes-rendus, consulte planning | **Mobile first**, zone 4G parfois faible |
| **Assistante de gestion** | Ingère factures fournisseurs, trie emails, met à jour fiches clients, envoie devis | Desktop, pic fin de mois |
| **Chef d'équipe terrain** | Consulte son planning, pointe son équipe, remonte l'avancement | Mobile |
| **Client final** *(optionnel, lecture seule)* | Consulte l'avancement de son chantier, ses devis, ses rapports | Lien public tokenisé, pas de compte |

L'application n'est **pas** destinée à être utilisée par d'autres entreprises que Sosson. Toute fonctionnalité "multi-tenant" est explicitement hors périmètre — voir [ADR 0006](adr/0006-internal-tool-scope.md).

## 1.3 Cas d'usage fondateurs

Ce sont les fonctionnalités qui **justifient à elles seules** l'existence de l'outil. Si une seule d'entre elles ne peut pas être livrée, le projet perd son sens.

### 1.3.1 Ingestion intelligente de documents

- **Factures fournisseurs reçues** (PDF, papier scanné, image) → extraction automatique par IA (fournisseur, montants, TVA, date) + **catégorisation par poste de dépense** (bois, quincaillerie, sous-traitance, carburant, location matériel...).
- **Factures clientes émises** ailleurs (par le logiciel de compta du comptable) → importées pour **traçabilité** dans le dossier chantier.
- **Devis** : rédigés dans Sosson ou importés, liés au chantier.
- **Fichiers Excel** (pricing fournisseurs, plannings existants, tableaux de suivi chantier, métrés) → upload d'un `.xlsx` → Sosson parse, détecte la structure, propose un rattachement à un chantier / client, et extrait les données exploitables (lignes de coût, durées, surfaces...). **Point critique** : en BTP PME, Excel est **omniprésent**. Si Sosson ne sait pas l'avaler, l'outil meurt.
- **Documents divers** (bons de commande, attestations, plans, photos de plans) → attachés au chantier avec OCR + extraction de métadonnées quand pertinent.

### 1.3.2 Dashboards et prévisionnels

- **Vision financière** : dépenses engagées par chantier, marge prévisionnelle, saisonnalité des coûts par catégorie.
- **Vision productivité** : temps passé par chantier, par équipe, comparé au prévisionnel.
- **Alertes** : chantier qui dérive budget, facture fournisseur non rattachée, email client sans réponse depuis N jours.

### 1.3.3 Ingestion et tri des emails

- Connexion à la **boîte mail de l'entreprise** (Gmail API).
- Tri automatique par **priorité** (IA) : urgence client, demande de devis, facture, interne, spam.
- **Rattachement automatique** d'un email à un client / chantier existant (IA + règles).
- Tous les emails liés à un client apparaissent dans sa **fiche** — fin des "j'ai pas vu passer le mail".

### 1.3.4 Fiche client / fiche chantier unifiées

- Une seule page par client → tout l'historique : chantiers, emails, devis, factures, documents, rapports, photos.
- Une seule page par chantier → devis, factures fournisseurs catégorisées, photos terrain, comptes-rendus, planning associé, documents.
- **Recherche globale** (Cmd-K) : retrouve n'importe quoi en mots-clés à travers tout le corpus.

### 1.3.5 Planning interactif

- Vue calendrier : chantiers × équipes × dates.
- Drag-and-drop pour réassigner.
- Temps réel collaboratif (plusieurs personnes peuvent éditer).
- Synchronisation Google Calendar dans les deux sens.

### 1.3.6 Comptes-rendus terrain mobile

- Application mobile pour chefs de chantier.
- Prise de photo + dictée vocale + texte → synthèse IA propre.
- **Fonctionne offline**, sync automatique au retour du réseau.

## 1.4 Contraintes structurantes

1. **Non légal / non fiscal.** Sosson **n'émet pas** de factures à valeur comptable. Le comptable conserve son propre logiciel et ses propres archives fiscales. Sosson sert de **mémoire opérationnelle**, pas de registre comptable. Voir [ADR 0007](adr/0007-not-a-billing-tool.md).
2. **Terrain** : connectivité dégradée sur chantier. Les chefs de chantier uploadent des photos depuis le 4G ; la compression client et l'offline-first mobile sont des conditions d'adoption.
3. **Économique** : l'outil est financé par l'entreprise elle-même, pas par un abonnement récurrent d'utilisateurs externes. Cible : **coût infrastructure < 30 €/mois** en régime normal. Voir [chapitre 09](#3-sommaire) (à venir).
4. **Temporelle** : horizon **10-20 ans**. L'outil doit survivre à plusieurs migrations techniques. Les données opérationnelles doivent rester **exportables** à tout moment (souveraineté).
5. **Intégrations** : Sosson doit cohabiter avec les outils existants (Gmail, Google Calendar, logiciel de compta). Pas de remplacement brutal de tout, plutôt un **aspirateur intelligent** qui en fait la synthèse.

## 1.5 Métriques de succès

- **Temps de saisie d'une facture fournisseur** : < 10 secondes (upload → validation humaine d'un résultat IA pré-rempli).
- **Taux de rattachement automatique email ↔ client/chantier** : > 80 %.
- **Taux d'adoption mobile terrain** : > 90 % des chefs de chantier remontent leur compte-rendu dans l'outil.
- **Coût infra** : < 30 €/mois en régime normal.
- **Temps de réponse dashboard gérant** : < 2 s sur une vue de 1 an d'historique.
- **Délai de restitution d'un dossier chantier complet** (toutes infos agrégées) : < 5 s.

## 1.6 Ce que Sosson **n'est pas** (non-objectifs explicites)

- ❌ **Pas un SaaS.** Une seule entreprise l'utilise. Aucune notion de "tenant", "plan d'abonnement", "client de Sosson" au sens business.
- ❌ **Pas un outil de comptabilité.** Pas d'émission de factures légales, pas de tenue de livres, pas de déclaration TVA. Le comptable externe conserve ses outils.
- ❌ **Pas un CRM commercial avancé.** Pas de pipeline, pas de scoring, pas de marketing automation.
- ❌ **Pas un outil de paie / RH.** Pas de gestion salaires, congés, contrats.
- ⚠️ **Le cœur Sosson n'est pas client-facing.** L'application principale est destinée à l'équipe interne. **Toutefois**, un **portail client séparé** (application web dédiée, adossée à Sosson via une API lecture filtrée) est une extension envisagée à moyen terme. Il permettrait au client final de consulter en lecture l'avancement de son chantier, ses devis, les plans 3D, les photos et rapports diffusés. Ce portail est **un module additionnel**, pas un enjeu V1 — il sera spécifié dans un ADR dédié quand on l'attaquera. V1 : simple lien tokenisé de consultation ponctuelle si besoin.
- ❌ **Pas de remplacement brutal des outils existants.** Sosson coexiste avec Gmail, Google Calendar, le logiciel de compta. Il les **enrichit** plutôt qu'il ne les **remplace**.

## 1.7 Lexique initial (voir [99 — Glossaire](99-glossary.md) pour la version canonique)

- **Chantier** = unité de travail pour un client. Pivot du domaine.
- **Client** = client final de l'entreprise (particulier ou professionnel).
- **Devis** = proposition chiffrée. Opérationnelle dans Sosson, pas fiscale.
- **Facture fournisseur** = document reçu d'un tiers, **extrait et catégorisé** par IA.
- **Facture cliente** = document émis ailleurs (logiciel comptable), **importé pour traçabilité**.
- **Catégorie de dépense** = taxonomie maison (bois, quincaillerie, sous-traitance...) apprise/affinée dans le temps.
- **Event** = trace d'activité dans le système (email reçu, devis envoyé, facture validée, chantier clôturé). Alimente la timeline et les dashboards.

---

**Chapitre suivant** : [02 — Architecture Globale](02-architecture.md).
