# 20 - Versionnement Excel previsionnel SQL + Storage

> Statut: local, non deployee production  
> Derniere revision: 2026-05-22  
> Portee: source Excel originale, edits SQL et versions Excel generees cote serveur.

## Objectif

Le previsionnel garde SQL Connect comme source de verite metier pour les edits faits depuis le site, et Cloud Storage comme stockage des fichiers Excel.

Le navigateur ne genere jamais le fichier Excel final officiel. Il peut encore produire un export local de confort, mais seul le flux serveur ecrit les fichiers Storage.

## Chemins Storage

| Chemin | Regle |
|---|---|
| `previsionnel/source/PREVISIONNEL-original.xlsx` | Fichier original importe une seule fois, jamais ecrase. |
| `previsionnel/current/PREVISIONNEL-current.xlsx` | Derniere version officielle generee par le serveur. |
| `previsionnel/versions/PREVISIONNEL-YYYY-MM-DD-HHmm-<versionId>.xlsx` | Historique immuable des versions generees. |

## Tables SQL Connect

`PrevisionnelImportBatch` conserve maintenant le lien source:
- `sourceStoragePath`
- `sourceSha256`
- `originalFileName`

`PrevisionnelCellEdit` conserve les modifications exactes de cellule:
- onglet
- cellule
- valeur texte ou numerique
- `author`
- date de modification

`PrevisionnelWorkbookVersion` suit chaque export Excel:
- `pending`: version demandee, edits SQL deja conserves
- `generating`: generation serveur en cours
- `generated`: fichier versionne et `current` ecrits, hash SHA-256 stocke
- `failed`: generation echouee, erreur lisible stockee, relance possible

SQL Connect et Storage ne sont pas transactionnels ensemble. C'est volontaire: si SQL reussit mais Storage echoue, les edits restent dans SQL et la version peut etre relancee.

## Cloud Function

La fonction callable `generatePrevisionnelWorkbook`:
1. verifie l'auth Firebase;
2. relit la version SQL;
3. passe la version en `generating`;
4. lit le fichier source ou la derniere version Storage disponible;
5. applique les `PrevisionnelCellEdit` avec `exceljs`;
6. ecrit le fichier historise puis `previsionnel/current/PREVISIONNEL-current.xlsx`;
7. calcule le SHA-256;
8. marque `generated` ou `failed`.

Le retry est idempotent au niveau du `versionId`: relancer une version deja `generated` renvoie l'etat existant au lieu de creer une nouvelle version.

## Scripts utiles

Uploader le fichier original sandbox sans ecraser un fichier different:

```bash
$env:ALLOW_SANDBOX_STORAGE_WRITE="true"
npm run upload:previsionnel-source:sandbox -- --sandbox --yes-sandbox --source="C:\chemin\PREVISIONNEL.xlsx"
```

Preuve locale avec Data Connect emulator et Storage mocke sous `tmp/`:

```bash
npm run verify:previsionnel-workbook:local
```

Le script local cree un edit SQL, cree une version `pending`, genere un `.xlsx`, verifie le hash et simule aussi une generation `failed` sans perdre l'edit SQL.

## Front

Dans le tableur previsionnel, `Sauvegarder SQL + Excel`:
1. enregistre les valeurs SQL comme avant;
2. upsert les `PrevisionnelCellEdit`;
3. cree une `PrevisionnelWorkbookVersion pending`;
4. appelle la fonction serveur;
5. affiche l'etat reel `pending`, `generated` ou `failed`.

Si l'export serveur echoue, le message doit le dire explicitement: SQL peut etre sauvegarde sans que l'Excel Storage soit genere.
