# 20 - Versionnement Excel previsionnel SQL + Storage

> Statut: deploye et valide en sandbox, non deployee production  
> Derniere revision: 2026-05-25  
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

Etat sandbox confirme le 25 mai 2026 dans `sosson-sandbox.firebasestorage.app`:
- original: `previsionnel/source/PREVISIONNEL-original.xlsx`, SHA-256 `95d30a33b56f2d5051592ad258a5cd5e7a18b5ee124bd60fc0c5c95dbf9452f7`, 660500 octets;
- current: `previsionnel/current/PREVISIONNEL-current.xlsx`, SHA-256 `29e575c0ec9aee578c59d68eb55b014556dda666d3027ac0e3afc80462026ecb`, 460115 octets;
- version historisee: `previsionnel/versions/PREVISIONNEL-2026-05-25-1424-pwv-20260525142423-pzqlras2.xlsx`, meme SHA-256 que `current`, 460115 octets.

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
- `label`: libelle metier saisi dans le tableur, complete par date/heure et profil cote front
- `pending`: version demandee, edits SQL deja conserves
- `generating`: generation serveur en cours
- `generated`: fichier versionne et `current` ecrits, hash SHA-256 stocke
- `failed`: generation echouee, erreur lisible stockee, relance possible

SQL Connect et Storage ne sont pas transactionnels ensemble. C'est volontaire: si SQL reussit mais Storage echoue, les edits restent dans SQL et la version peut etre relancee.

## Cloud Function

La fonction callable `generatePrevisionnelWorkbook`:
1. verifie l'auth Firebase;
2. relit la version SQL;
3. verifie les chemins Storage `previsionnel/...`;
4. passe la version en `generating`;
5. lit le fichier source ou la derniere version Storage disponible;
6. applique les `PrevisionnelCellEdit` avec `exceljs`;
7. ecrit le fichier historise puis `previsionnel/current/PREVISIONNEL-current.xlsx`;
8. calcule le SHA-256;
9. marque `generated` ou `failed`.

Le retry est idempotent au niveau du `versionId`: relancer une version deja `generated` renvoie l'etat existant au lieu de creer une nouvelle version.

Le moteur materialise les formules partagees Excel avant d'appliquer les edits SQL. Cette etape evite les erreurs `exceljs` sur les plages historiques ou des cellules d'une formule partagee sont remplacees par des valeurs sauvegardees.

Les mutations worker `MarkPrevisionnelWorkbookVersionGenerating`, `MarkPrevisionnelWorkbookVersionGenerated` et `MarkPrevisionnelWorkbookVersionFailed` exigent le claim impersonne `sosson_worker`. Ce claim est ajoute uniquement par la Cloud Function pendant l'appel Data Connect; un client front autorise ne peut donc pas marquer lui-meme une version comme generee avec un chemin ou hash arbitraire.

La promotion vers `previsionnel/current/PREVISIONNEL-current.xlsx` est protegee contre les generations concurrentes simples: avant d'ecrire `current`, la Function relit l'historique SQL et ne promeut pas une version si une version plus recente est deja `pending`, `generating` ou `generated`. La query `GetLatestGeneratedPrevisionnelWorkbookVersion` trie les versions generees par `dateCreation DESC`, pas par heure de fin, afin qu'une ancienne generation terminee tardivement ne devienne pas la reference logique.

La fonction callable `createPrevisionnelWorkbookDownloadUrl` gere les telechargements:
- `original`: resout le fichier source depuis `PrevisionnelImportBatch`, fallback sur `previsionnel/source/PREVISIONNEL-original.xlsx`;
- `current`: resout la derniere version `generated`;
- `version`: exige un `versionId` `generated`.

Elle verifie Firebase Auth + role SQL `gerant`/`assistante`, refuse les chemins hors `previsionnel/`, puis retourne une URL signee courte duree. `storage.rules` reste ferme (`allow read, write: if false`). Le runtime sandbox a `roles/iam.serviceAccountTokenCreator` pour signer les URLs.

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
3. cree une `PrevisionnelWorkbookVersion pending` avec libelle, date/heure et profil;
4. appelle la fonction serveur;
5. affiche l'etat reel `pending`, `generated` ou `failed`.

Si l'export serveur echoue, le message doit le dire explicitement: SQL peut etre sauvegarde sans que l'Excel Storage soit genere.

La page `/previsionnel/backups` affiche:
- l'original immuable;
- le fichier courant;
- le tableau des checkpoints historises avec date, libelle, auteur, statut, poids, hash, lien console GCS et telechargement via URL signee.

Le tableur conserve les edits locaux en deux couches:
- cellules commitees: `sosson:previsionnel:<sheet>:cell-updates`;
- cellule active en cours de frappe: `sosson:previsionnel:<sheet>:active-draft`.

Si l'utilisateur quitte ou recharge avec des edits non sauvegardes, le navigateur affiche un avertissement. En cas de coupure de courant avant sauvegarde SQL, le brouillon local reste recuperable dans ce navigateur; il n'est pas presente comme une sauvegarde SQL ou Storage.

## Verification sandbox 2026-05-25

- `firebase dataconnect:sql:diff --project sosson-sandbox --service sosson-sandbox-service --location europe-west9 --non-interactive`: schema sandbox matche exactement le schema local.
- Route Hosting `/previsionnel/backups`: HTTP 200.
- Route Hosting `/previsionnel/tableur`: HTTP 200.
- `createPrevisionnelWorkbookDownloadUrl`: smoke avec utilisateur Auth/SQL temporaire `assistante`, telechargement de `previsionnel/current/PREVISIONNEL-current.xlsx`, 460115 octets, puis nettoyage du profil temporaire.
