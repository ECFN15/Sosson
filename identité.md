# Identité visuelle Sosson

Statut: draft opérationnel
Dernière mise à jour: 2026-04-23
Source: analyse du dossier `identité visuelle/`

## 1. Décision directrice

L'identité Sosson est désormais unifiée autour d'un univers unique : une identité produit forte, premium, axée sur l'opérationnel. L'ancienne "double identité" (marque verte vs produit orange) a été supprimée au profit d'une cohérence totale sur toute l'application et les points de contact.

La règle clé est l'usage d'un thème clair, net, et structuré :
- Dominante globale : ivoire, blanc, anthracite, et **orange chantier** comme couleur de marque et d'action principale.
- Finitions premium : l'orange est équilibré par des matières nobles (bois subtil, pierre, tons sable) pour éviter l'aspect SaaS générique.

## 2. Corpus analysé

| Fichier | Rôle interprété | Ce qu'il apporte |
|---|---|---|
| `pallette global/ChatGPT Image 22 avr. 2026, 20_20_23.png` | Brand board orange produit | ADN central, orange assumé, identité digitale premium |
| `pallette global/a0f55d29-b33e-4e6c-976f-d1c0d8aa548f.png` | Nouvelle identité orange | Renforcement de l'esthétique chantier/bois unifiée |
| `ChatGPT Image 22 avr. 2026, 20_24_55.png` | Board système produit | Architecture globale de l'app, composants, icônes, patterns |
| `ChatGPT Image 22 avr. 2026, 20_28_17.png` | Board application détaillée | Sidebar, dashboard, mobile, cartes, landing fragment |
| `ChatGPT Image 22 avr. 2026, 20_32_42.png` | Dashboard desktop | Vue KPI et pilotage |
| `ChatGPT Image 22 avr. 2026, 20_34_01.png` | Emails tri intelligent | Master-detail + panneau IA |
| `ChatGPT Image 22 avr. 2026, 20_38_05.png` | Fiche chantier | Vue projet riche en contexte |
| `ChatGPT Image 22 avr. 2026, 20_39_15.png` | Mobile terrain | Compte-rendu, photos, activité, mode hors-ligne |
| `ChatGPT Image 22 avr. 2026, 20_41_25.png` | Facture détaillée | Extraction IA + validation humaine |
| `ChatGPT Image 22 avr. 2026, 20_43_36.png` | Hub factures | Upload, pipeline, tables, panneau droit |
| `ChatGPT Image 22 avr. 2026, 20_47_24.png` | Planning interactif | Vue planning hebdo multi-équipes |

## 3. ADN visuel retenu

### 3.1 Identité Unifiée (Marque & Produit)
- **Interface lumineuse, propre, structurée.**
- **Sidebar sombre et rassurante** (anthracite, pas de noir pur).
- **Orange d'action très visible**, utilisé comme couleur identitaire primaire, accent et signal métier.
- Touches de **bois et de matières réelles** pour la chaleur et le lien avec le monde de la construction bois.
- Données lisibles avant tout. La déco reste secondaire.

### 3.2 Positionnement
Ce n'est ni un site d'architecte de luxe pur, ni un SaaS générique bleu-violet.
Le bon territoire est: **outil opérationnel premium pour entreprise de construction bois**, où l'orange signalétique du BTP rencontre le design d'une application haut de gamme.

## 4. Tokens de base (Aperçu)
*Se référer au fichier `design-tokens.md` pour l'implémentation pixel-perfect.*

| Token | Valeur | Usage |
|---|---|---|
| `product-ink-900` | `#1E1E1E` | Sidebar, texte fort, boutons noirs |
| `product-orange-500` | `#F06B21` | CTA primaire, couleur de marque, onglet actif, accent |
| `wood-600` | `#A97C50` | Touches bois, pont chaleureux |
| `sand-200` | `#EADBC8` | Fonds doux, tags neutres, séparations premium |
| `paper-50` | `#F7F6F2` | Fond global app et pages claires |
| `surface-0` | `#FFFFFF` | Cartes, formulaires, panneaux |

## 5. Règles par famille d'écran

Toutes les interfaces, qu'elles soient publiques (Landing/Login) ou privées (Dashboard, Mobile), partagent la même charte. 
- **Landing / login :** Mise en avant de visuels réels de chantiers ou maisons bois, fond clair ou anthracite, bouton orange dominant.
- **App desktop authentifiée :** Ivoire, blanc, anthracite, orange. Plus dense, plus hiérarchique, très fonctionnel.
- **App mobile terrain :** Blanc, anthracite, orange, tags doux. Très lisible, grands CTA, capture terrain.
- **Images générées / mockups :** Bois, structure, lumière chaude, orange d'action. Toujours relier la tech au chantier réel.

## 6. Composants canoniques

### 6.1 Sidebar
- Fond anthracite (`#1E1E1E`).
- Logo Sosson en haut, utilisateur en bas.
- Item actif en orange ou fond sombre enrichi d'un liseré orange.

### 6.2 Top bar
- Fond clair (`#FFFFFF` ou transparent sur fond `#F7F6F2`).
- Champ de recherche global large, bords très arrondis.
- Notifications compactes.

### 6.3 Cards
- Fond blanc.
- Bordure très légère ou absente.
- Grand rayon (20-24px).
- Titre net, métrique forte.

## 7. Direction iconographique et image

### 7.1 Icônes
- Style contour fin, simple, lisible (ex: Lucide React).
- Univers chantier, document, planning, équipe, photo, mail.

### 7.2 Photographie
À privilégier:
- Maisons ossature bois contemporaines, charpentes, intérieurs bois.
- Lumière dorée ou naturelle.
- Scènes de chantier propres, crédibles.

À éviter:
- Skyline corporate, bureaux abstraits, rendus hyper-tech futuristes, teintes bleutées.

## 8. Priorités d'intégration dans l'app

1. Poser des variables CSS globales pour les couleurs, rayons, ombres et fonds (voir `design-tokens.md`).
2. Assurer que l'ancien thème vert a complètement disparu de l'application.
3. Uniformiser la sidebar, la top bar, les cartes KPI et les badges autour du nouvel univers orange/anthracite.
4. Garder l'orange comme couleur d'action canonique de l'application ET de la marque.

## 9. Résumé exécutable

Si une décision visuelle est hésitante, choisir toujours l'option qui semble:
- plus chantier que startup SaaS tech;
- plus premium discret que luxe démonstratif;
- structurée par le contraste fort entre l'anthracite, le blanc cassé et l'orange.
