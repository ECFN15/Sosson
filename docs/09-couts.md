# Chapitre 09 — Modèle de coûts

> **Statut** : stable v0.1 (estimations à affiner avec 3 mois de prod réelle)
> **Dernière révision** : 2026-04-22
> **Prérequis** : [02 — Architecture](02-architecture.md) ; 08 — Opérations *(à écrire, non bloquant)*
> **ADRs référencés** : [0001](adr/0001-platform-firebase.md), [0008](adr/0008-architecture-postgres-firestore-hybrid.md)

---

## 9.1 Principes

1. **Le coût est une feature** (invariant §5.4 de [documentation.md](../documentation.md)). Toute décision architecturale qui change l'ordre de grandeur du coût est documentée par ADR.
2. **Cible stricte** : < 30 €/mois en régime normal, < 50 €/mois en pic d'activité (fin de mois, grosse ingestion documents). Voir contrainte §1.4 de [01 — Vision](01-vision.md).
3. **Transparence** : le budget est public en interne. Tout le monde peut consulter le dashboard de facturation GCP.
4. **Alerting** : alerte email si dépassement 80 % du cible, arrêt Genkit si dépassement 200 % (voir §9.5).

## 9.1.1 Hypothèse d'environnements chiffrés

**Le chiffrage §9.3 couvre l'environnement de production uniquement.** Les environnements `dev` et `staging` (voir [02 §2.5](02-architecture.md)) sont conçus pour **ne pas** consommer de socle payant :

- **`local`** : 100 % Firebase Emulators Suite + Postgres Docker. Zéro coût cloud.
- **`dev`** (CI, démos internes) : émulateurs en CI ; instance Cloud SQL **stoppée par défaut**, démarrée ponctuellement (< 10 h/mois estimées) via procédure Stop/Start documentée en chapitre 08. Coût marginal (~1-3 €/mois).
- **`staging`** : instance Cloud SQL `db-f1-micro` **tournant uniquement pendant une recette active** (quelques jours par release). Coût amorti ~3-5 €/mois.
- **`prod`** : instance Cloud SQL `db-f1-micro` **24/7**. C'est la ligne "Cloud SQL Postgres" de §9.3.

**Si cette hypothèse est violée** (par exemple dev + staging laissés en 24/7), le coût mensuel peut doubler. Le guardrail §9.5 inclut la surveillance du coût **cumulé tous projets GCP**, pas seulement prod.

## 9.2 Hypothèses de volume (PME BTP Sosson, 30-50 salariés)

À remplacer par des mesures réelles après 3 mois de prod.

| Métrique | Estimation conservative | Estimation haute |
|---|---|---|
| Utilisateurs actifs mensuels | 30 | 50 |
| Utilisateurs connectés simultanément max | 10 | 25 |
| Clients en base (cumul) | 200 | 800 |
| Chantiers actifs simultanés | 30 | 100 |
| Chantiers clôturés / an | 80 | 300 |
| Factures fournisseurs reçues / mois | 500 | 2 000 |
| Factures clientes importées / mois | 50 | 300 |
| Emails reçus / mois | 2 000 | 10 000 |
| Photos terrain / mois | 3 000 | 15 000 |
| Comptes-rendus / mois | 200 | 800 |
| Volume stockage hot cumulé (fin d'année 1) | ~50 Go | ~200 Go |
| Volume stockage archive cumulé (fin d'année 5) | ~500 Go | ~2 To |

## 9.3 Décomposition des coûts mensuels (estimation basse / haute)

Prix de référence GCP europe-west1 ou europe-west9, tarifs 2026 (à re-vérifier au moment de la mise en prod).

| Poste | Détail | Estimation basse | Estimation haute |
|---|---|---|---|
| **Cloud SQL Postgres** `db-f1-micro` 24/7 | 0,6 Go RAM, HA désactivée, backups 7j | **8-10 €** | 15 € (si passage `db-g1-small`) |
| **Cloud SQL storage** | 10 Go SSD → 100 Go SSD | 1 € | 6 € |
| **Firestore** | Reads/writes très sous les quotas gratuits (50k reads/j, 20k writes/j) | **0 €** | 0-2 € |
| **Cloud Storage Standard** (hot) | 50-200 Go | 1 € | 4 € |
| **Cloud Storage Archive** (cold) | 0-2 To (année 5) | 0 € année 1 | 3 € année 5 |
| **Cloud Functions v2** | Invocations : ~10k-50k/mois (factures + emails + cron + triggers) | **0 €** (sous les 2M gratuits) | 0-1 € |
| **Genkit / Gemini Flash** | ~500-2 000 extractions + ~500-2 000 catégorisations + ~2 000-10 000 tris emails + ~200 synthèses CR | **3-6 €** | 15-25 € |
| **Firebase Auth** | < 50 MAU | **0 €** (sous quota gratuit) | 0 € |
| **Egress bandwidth** | Consultation dashboards + uploads mobile | 0,5-1 € | 3 € |
| **Gmail API** | Usage standard | 0 € | 0 € |
| **Google Calendar API** | Usage standard | 0 € | 0 € |
| **Cloud Logging** | < 50 Go/mois | **0 €** (sous quota gratuit) | 0-1 € |
| **Cloud Monitoring** | Standard | 0 € | 0 € |
| **Secret Manager** | ~20 secrets | < 0,5 € | 1 € |
| **TOTAL estimé** |  | **~15-20 €/mois** | **~45-60 €/mois** |

**Conclusion** : en régime normal, on reste **sous 30 €/mois**. En pic (gros traitement batch, expérimentations Gemini Pro), on peut toucher 50-60 €. Toujours très loin de "l'inacceptable" pour un outil interne qui fait gagner des heures par semaine à l'équipe.

## 9.4 Les postes à surveiller en priorité

Par ordre de risque de dérive :

### 9.4.1 Genkit / Gemini (le plus volatile)

- **Risque** : un PDF pathologique qui consomme 200 000 tokens, ou un bug qui boucle un flow.
- **Garde-fous** (cf. [04 §4.6.3](04-intelligence.md)) : plafond dur **par appel** (0,02 € pour `extractFactureFournisseur`, 0,01 € pour `categoriseDepense`, `trieEmail`). Abandon et log critique au-delà.
- **Garde-fou projet** : plafond mensuel Genkit = 50 €. Au-delà : désactivation automatique des flows non critiques.

### 9.4.2 Cloud SQL storage

- **Risque** : l'ingestion email + bodyText stockée en base peut gonfler vite (2 000 mails/mois × 20 Ko → 40 Mo/mois → 480 Mo/an, gérable).
- **Garde-fou** : les HTML volumineux vont sur GCS (§3.4 du schéma), pas en base.
- **Surveillance** : alerte si > 50 Go.

### 9.4.3 Cloud Storage bandwidth (egress)

- **Risque** : un chef de chantier qui consulte 200 photos HD par jour sur la 4G = plusieurs Go/mois.
- **Garde-fou** : génération de thumbnails côté upload (Cloud Function), mobile sert les thumbnails par défaut, HD sur demande.

## 9.5 Alerting et guardrails

Configuration Budget GCP + Alerting :

| Seuil | Action |
|---|---|
| 50 % du budget mensuel | Email info au gérant |
| 80 % | Email warning + revue budget requise |
| 100 % | Email critique + revue forcée |
| 150 % | Désactivation automatique des flows Genkit non-critiques (tri email, synthèse CR). Extraction facture reste active (value critique) |
| 200 % | Désactivation totale Genkit + blocage uploads (préserve uniquement la consultation lecture) |

## 9.6 Projection 3 ans

Hypothèse de croissance **modérée** (Sosson reste interne à une seule PME, pas de multiplication des utilisateurs) :

| Année | Stockage cumulé | Coût mensuel estimé |
|---|---|---|
| Année 1 | 50 Go hot + 0 Go archive | 15-20 € |
| Année 2 | 80 Go hot + 100 Go archive | 18-25 € |
| Année 3 | 100 Go hot + 400 Go archive | 22-30 € |
| Année 5 | 150 Go hot + 1,5 To archive | 30-40 € |

Le coût **augmente lentement** car le stockage hot se stabilise (les chantiers clôturés descendent en Archive class, très peu chère) et les traitements IA sont plafonnés.

## 9.7 Comparaison : combien ça coûtait avant ?

Pour justifier Sosson en interne, voici l'ordre de grandeur des outils actuels (à ajuster avec la réalité) :

| Outil actuel | Coût mensuel PME 30-50 salariés |
|---|---|
| Trello (plan Standard) × utilisateurs | ~30-50 € |
| Dropbox Business équipe | ~50-100 € |
| Logiciel scan factures OCR basique | ~20-40 € |
| WhatsApp Business (si plan payant) | 0-30 € |
| Outils divers (signature électronique, ...) | 20-50 € |
| **Total estimé outils éparpillés** | **~120-270 €/mois** |

Sosson à **15-30 €/mois** remplace fonctionnellement une partie de cela. Le reste (outils éparpillés qui persistent : WhatsApp personnel, Dropbox conservé pour raisons diverses) coexiste jusqu'à décommissionnement progressif.

**ROI principal** n'est pas dans l'économie d'outils — c'est dans le **temps gagné** par l'équipe (saisie factures < 10 s au lieu de 2 min, emails auto-rattachés au lieu de recherche manuelle, dashboards qui évitent des réunions...). Valorisation : 1 heure gagnée par jour × 30 salariés × 30 €/h = 900 €/jour. Sosson est rentabilisé en **quelques heures par mois** d'économie d'équipe.

## 9.8 Ce que ce chapitre **ne couvre pas**

- Coûts de développement (temps humain, pas infra). Hors périmètre doc.
- Coûts d'intégration tiers (Factur-X, PDPs) : hors scope vu [ADR 0007](adr/0007-not-a-billing-tool.md).
- Revue annuelle des tarifs : processus à acter en chapitre 08 Opérations.

---

**Retour au** [sommaire](../documentation.md#3-sommaire).

## 9.9 Notes checkpoint 002 - exploitation sandbox

Production reste explicitement non prete. Avant tout passage prod, il faut verifier les couts et alertes sur le projet reel, pas seulement dans cette estimation.

Minimum attendu pour checkpoint 002:

- Budget GCP sandbox/prod avec alertes 50 %, 80 %, 100 %.
- Suivi Cloud SQL: CPU, connexions, stockage, erreurs.
- Suivi SQL Connect: erreurs de requetes, latence, volumes des listes larges.
- Revue des queries sans pagination stricte (`ListOperationalClients`, `ListOperationalChantiers`, `ListFactures`, previsionnel).
- Backup Cloud SQL documente: frequence, retention, procedure de restore sandbox.
- Rollback documente: revenir au dernier deploy Hosting/Data Connect connu et restaurer un dump si migration data ratee.

Risque cout principal a court terme: instance Cloud SQL laissee active sans monitoring + requetes larges sur previsionnel. Le lot Data checkpoint 002 doit donc preferer des filtres serveur et des limites par page avant d'ouvrir davantage l'analytics.
