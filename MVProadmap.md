# Sosson — MVP Démo Roadmap
> **Objectif** : Démo verticale convaincante — lundi 28 avril 2026
> **Durée de démo cible** : 3 minutes chrono
> **Stack démo** : React + TailwindCSS + shadcn/ui — données seedées, zéro infra réelle requise

---

## Parcours de démo (le fil rouge de tout)

```
Login → Dashboard gérant → Liste chantiers → Fiche chantier → Upload facture (drag & drop) → Extraction IA → Catégorisation → Dashboard mis à jour
```

**Ce parcours doit fonctionner parfaitement avant tout le reste.**

---

## Périmètre de données de démo

| Entité | Quantité | Détail |
|---|---|---|
| Clients | 3 | Martin Dupont (particulier), SCI Les Pins (professionnel), Mairie de Valence (public) |
| Chantiers | 4 | 2 en cours, 1 en dérive budget, 1 clôturé propre |
| Factures fournisseurs | 12 | Variées : bois, quincaillerie, sous-traitance, carburant, location matériel |
| Upload "live" | 1 | PDF facture fournisseur → extraction simulée convaincante |
| Emails rattachés | 2 | 1 email client sur le chantier en dérive, 1 demande de devis |
| Comptes utilisateurs | 3 | Gérant (Patrick Sosson), Assistante (Claire), Chef de chantier (Romain) |

### Chantiers seedés

| Nom | Client | Statut | Budget | Dépenses | Tendance |
|---|---|---|---|---|---|
| Rénovation salle de bain | Martin Dupont | En cours | 8 500 € | 9 200 € | 🔴 Dérive +8% |
| Extension garage | SCI Les Pins | En cours | 24 000 € | 14 300 € | 🟢 Dans les clous |
| Toiture mairie annexe | Mairie de Valence | En cours | 31 000 € | 18 700 € | 🟡 À surveiller |
| Terrasse bois | Martin Dupont | Clôturé | 6 200 € | 5 800 € | ✅ Rentable |

---

## Comptes & vues par rôle

### Gérant (Patrick Sosson)
- Dashboard global avec KPIs financiers
- Accès à tous les chantiers, tous les clients
- Alertes visibles en haut de page
- Peut créer/modifier/supprimer tout

### Assistante (Claire)
- Vue sur les factures fournisseurs à traiter
- Upload et validation des factures
- Gestion des fiches clients
- Pas accès aux marges détaillées

### Chef de chantier (Romain)
- Vue limitée à ses chantiers assignés
- Accès aux documents et photos
- Peut ajouter des comptes-rendus
- Pas accès aux données financières sensibles

---

## Architecture technique démo

```
src/
├── app/                    # Pages (React Router ou Next.js App Router)
│   ├── login/              # Page de connexion (mock auth)
│   ├── dashboard/          # Dashboard gérant
│   ├── chantiers/          # Liste + fiche chantier
│   ├── clients/            # Liste + fiche client
│   ├── factures/           # Liste factures + upload
│   └── planning/           # Vue calendrier (visuel uniquement)
├── components/             # Composants réutilisables
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Sidebar, header, nav
│   ├── dashboard/          # Blocs KPI, alertes, graphiques
│   ├── chantier/           # Card chantier, timeline, jauge budget
│   ├── facture/            # Upload drag & drop, carte facture
│   └── client/             # Fiche client, formulaire
├── data/                   # Seed data JSON
│   ├── chantiers.ts
│   ├── clients.ts
│   ├── factures.ts
│   └── users.ts
├── lib/                    # Logique métier simulée
│   ├── extraction.ts       # Simulation extraction IA facture
│   └── auth.ts             # Mock auth par rôle
└── hooks/                  # useDemo, useChantier, etc.
```

**Stack** : React 18 + Vite · TypeScript · TailwindCSS · shadcn/ui · Recharts (graphiques) · React Dropzone (upload) · React Router v6 · Lucide Icons

---

## Plan de travail jour par jour

### Mercredi 23 avril — Fondations & parcours principal
**Objectif** : Le parcours Login → Dashboard → Fiche chantier fonctionne

- [ ] Init repo React + Vite + TailwindCSS + shadcn/ui + React Router
- [ ] Seed data : 3 clients, 4 chantiers, 12 factures (fichiers `.ts`)
- [ ] Mock auth : 3 comptes, redirection par rôle
- [ ] Layout principal : sidebar + header + nav
- [ ] Page Login : formulaire propre avec sélection rôle démo
- [ ] Dashboard gérant : KPIs (4 blocs), liste alertes, graphique dépenses
- [ ] Liste chantiers : cards avec statut, budget, tendance

**Livrable du soir** : On peut naviguer Login → Dashboard → Liste chantiers

---

### Jeudi 24 avril — Fiche chantier & upload
**Objectif** : La fiche chantier est complète + l'upload fonctionne avec l'effet "wow"

- [ ] Fiche chantier : infos client, devis, factures fournisseurs, timeline, documents
- [ ] Jauge budget (dépenses vs prévisionnel, couleur selon dérive)
- [ ] Upload drag & drop (React Dropzone) sur la fiche chantier
- [ ] Simulation extraction IA : délai 2s → résultat pré-rempli (fournisseur, montant, TVA, date)
- [ ] Modal de validation : l'utilisateur confirme ou ajuste la catégorie
- [ ] Après validation : facture apparaît dans la liste + dashboard se met à jour (chiffres bougent)
- [ ] Emails rattachés : 2 emails affichés dans la timeline du chantier en dérive

**Livrable du soir** : Parcours complet upload → extraction → validation → dashboard mis à jour

---

### Vendredi 25 avril — Vues secondaires & gestion clients
**Objectif** : L'app est navigable dans tous les sens sans écran blanc

- [ ] Fiche client : historique chantiers, emails, documents
- [ ] Formulaire création compte client (modal propre)
- [ ] Vue assistante : file d'attente factures à traiter
- [ ] Vue chef de chantier : ses chantiers uniquement, pas les marges
- [ ] Planning : vue calendrier visuelle (données seedées, pas de drag & drop réel)
- [ ] Recherche globale Cmd-K : recherche dans clients, chantiers, factures (filtre local)
- [ ] 404 et états vides : aucun écran blanc cassé

**Livrable du soir** : Toutes les pages existent, toutes les vues rôle fonctionnent

---

### Samedi 26 avril — Polish & cohérence visuelle
**Objectif** : L'app est belle, les données sont crédibles

- [ ] Revue design globale : cohérence couleurs, espacements, typographie
- [ ] Données seedées réalistes : noms, adresses, montants crédibles BTP
- [ ] Transitions et animations légères (page load, upload progress, chiffres qui bougent)
- [ ] Responsive desktop correct (pas mobile, juste pas cassé sur petit laptop)
- [ ] Toast notifications : "Facture validée", "Chantier mis à jour", etc.
- [ ] Badge alertes sur le dashboard (chantier en dérive visible au premier coup d'œil)
- [ ] Logo Sosson + favicon

**Livrable du soir** : L'app est prête à être montrée à quelqu'un d'externe

---

### Dimanche 27 avril — Tests, script démo & buffer
**Objectif** : Répéter le script 5 fois sans bug

- [ ] Répéter le parcours démo complet 5 fois de suite
- [ ] Fixer tous les bugs bloquants trouvés
- [ ] Préparer le script de démo (3 minutes, texte narratif)
- [ ] Préparer l'état de départ exact (reset des données au bon état)
- [ ] Optionnel : déploiement Vercel pour démo sans localhost
- [ ] Buffer pour finitions de dernière minute

---

### Lundi 28 avril — Démo 🎯

---

## Ce qu'on ne fait PAS avant lundi

| ❌ Hors périmètre | Raison |
|---|---|
| Mobile / responsive mobile | Pas le sujet de la démo |
| Offline / PWA | Inutile pour une démo desktop |
| Firebase Auth réel | Mock suffisant |
| Firestore / Cloud SQL réel | Données seedées locales |
| Gmail API live | Email seedé suffit |
| Google Calendar sync | Vue calendrier statique OK |
| Archivage / GCS | Pas visible en démo |
| Tests unitaires | Pas le sujet maintenant |
| Multi-tenant / RBAC complet | 3 rôles mockés suffisent |

---

## Script de démo (3 minutes)

### Minute 1 — Le gérant ouvre son matin
> *"Patrick arrive le matin, il ouvre Sosson."*
- Login en tant que Gérant
- Dashboard : 4 KPIs (chantiers actifs, dépenses du mois, marge moyenne, alertes)
- **Une alerte rouge** : "Chantier Dupont — dérive budget +8%"
- Clic → Fiche chantier Dupont

### Minute 2 — La fiche chantier unifiée
> *"Tout le dossier en un seul endroit."*
- Infos client, devis signé, 5 factures fournisseurs déjà traitées
- Jauge budget en rouge
- Email rattaché : "Bonjour, des nouvelles du chantier ?"
- Timeline des événements

### Minute 3 — L'upload qui impressionne
> *"L'assistante reçoit une facture papier scannée."*
- Drag & drop d'un PDF sur la fiche
- Barre de progression → "Analyse en cours..."
- Résultat pré-rempli : Fournisseur "Matériaux Rhône", 847,20 €, TVA 20%, catégorie "Bois & matériaux"
- Validation en 1 clic
- **Les chiffres du dashboard bougent** en temps réel
- La facture apparaît dans la liste

> *"En moins de 10 secondes, la facture est catégorisée, rattachée au chantier, et le gérant voit l'impact sur sa marge."*

---

## Métriques de succès démo

- [ ] Parcours complet sans bug en < 3 minutes
- [ ] Zéro écran blanc, zéro erreur console visible
- [ ] Upload → résultat IA en < 3 secondes (simulé)
- [ ] Dashboard qui se met à jour après upload (effet "wow" visible)
- [ ] Les 3 rôles sont différentiables en 10 secondes
