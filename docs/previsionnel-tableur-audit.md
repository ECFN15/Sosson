# Audit tableur previsionnel 2025-26

Date : 15 mai 2026

## Perimetre teste

- Page : `/previsionnel/tableur`
- Feuille : `2025-26`
- Classeur source : `C:\Users\pcpor\OneDrive\Bureau\prévisionnelsosson\PREVISIONNEL.xlsx`
- Checkpoint : `C:\Users\pcpor\OneDrive\Bureau\prévisionnelsosson\backups\PREVISIONNEL-2025-26-checkpoint.xlsx`

## Bugs rencontres

1. Une cellule numerique videe au clavier affichait `0` au lieu de rester vide.
2. Les messages de statut du tableur etaient mis a jour dans le code mais jamais affiches a l'utilisateur.
3. En mode utilisateur local, le chargement declenchait des appels SQL Connect non authentifies et une rafale d'erreurs 401.
4. Il n'existait pas de bouton permettant de revenir au dernier etat Excel stable apres des modifications locales.
5. Le seed previsionnel referencait un chemin sans accent (`previsionnelsosson`) alors que le fichier reel est dans `prévisionnelsosson`.

## Correctifs appliques

- Affichage preserve des cellules numeriques explicitement videes.
- Barre de statut visible dans le tableur plein ecran.
- Attente d'un utilisateur Firebase reel avant les lectures SQL Connect.
- Virtualisation verticale des lignes visibles pour eviter de garder toutes les cellules montees dans le DOM.
- Manifeste applicatif de reference immuable :
  - source absolue : `C:\Users\pcpor\OneDrive\Bureau\prévisionnelsosson\PREVISIONNEL.xlsx`
  - hash SHA256 : `95d30a33b56f2d5051592ad258a5cd5e7a18b5ee124bd60fc0c5c95dbf9452f7`
  - backup stable : `C:\Users\pcpor\OneDrive\Bureau\prévisionnelsosson\backups\PREVISIONNEL-2025-26-checkpoint.xlsx`
  - ce checkpoint de base n'est pas modifiable depuis l'interface.
- Bouton `Créer checkpoint` :
  - cree un snapshot applicatif date de l'etat courant du tableur ;
  - stocke le snapshot dans le navigateur avec le hash de la reference de base ;
  - ajoute un checksum SHA256 du contenu du snapshot.
- Bouton `Revenir checkpoint` :
  - si la reference immuable est selectionnee, il revient au template Excel propre ;
  - si un checkpoint utilisateur est selectionne, il restaure ce snapshot ;
  - en mode SQL pret, il prepare les valeurs du checkpoint pour sauvegarde SQL.
- Chemin d'import du seed corrige vers `C:/Users/pcpor/OneDrive/Bureau/prévisionnelsosson/PREVISIONNEL.xlsx`.
- Backup stable et backup date crees dans `prévisionnelsosson/backups`.

## Verifications

- Saisie directe dans une cellule : OK.
- Navigation `Enter` et `Tab` : OK.
- Suppression d'une cellule numerique : OK, la cellule reste vide visuellement.
- Collage multi-cellules 2x2 : OK.
- Creation d'un checkpoint utilisateur puis restauration : OK.
- Bouton `Revenir checkpoint` : OK.
- Console navigateur apres test : aucune erreur.
- Mesure navigateur apres virtualisation : 1610 inputs montes au lieu de 7268, rendu initial autour de 2,4 s en dev local, frappe stabilisee autour de 0,66 s en dev local.
- Hash SHA256 identique pour source Excel, template app et backups : `95D30A33B56F2D5051592AD258A5CD5E7A18B5EE124BD60FC0C5C95DBF9452F7`.
- `npm run test:previsionnel` : OK.
- `npm run lint` : OK.
- `npm run build:sandbox` : OK.
- `npm run verify:previsionnel:clients` : OK.
- `npm run verify:previsionnel:dataconnect` : OK sur l'emulateur local.

## Limite explicite

Le tableur a maintenant les controles attendus pour la saisie operationnelle, le collage, la navigation clavier, la sauvegarde SQL et le retour checkpoint. Il ne pretend pas remplacer toute la surface fonctionnelle d'Excel, comme les formules libres, macros, graphiques natifs ou tableaux croises.
