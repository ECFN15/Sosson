# 04 - Firebase sandbox / production

> Statut: draft  
> Derniere revision: 2026-05-16  
> Portee: environnements Firebase, garde-fous et risques de confusion.

## Environnements

| Environnement | Alias Firebase | Project ID | Usage |
|---|---|---|---|
| Sandbox | `default` | `sosson-sandbox` | Developpement, validation SQL Connect, tests fonctionnels. |
| Production | `prod` | `sosson-prod` | Non validee fonctionnellement au checkpoint 001. |

La regle de travail reste: sandbox d'abord, production ensuite. Aucun deploy production ne doit etre lance sans validation humaine explicite.

## Fichiers env

- `.env.sandbox`: configuration client Firebase sandbox.
- `.env.production`: configuration client Firebase production.
- `.env.example`: modele sans valeur secrete.
- `.env.local`: local uniquement, ignore par Git via `*.local`.

Les variables `VITE_FIREBASE_*` sont des identifiants client Firebase, pas des secrets serveur. En revanche, aucune variable contenant `SECRET`, `TOKEN`, `REFRESH` ou `PASSWORD` ne doit etre prefixee `VITE_`.

## Garde-fous actuels

- `VITE_ENV=sandbox` ou `VITE_ENV=production` distingue les builds.
- `VITE_ENABLE_LOCAL_AUTH_FALLBACK=false` par defaut empeche l'auth seedee quand Firebase est configure.
- `VITE_ENABLE_LOCAL_AUTH_FALLBACK=true` peut etre pose dans `.env.local` uniquement pour afficher l'acces dev complet sur la page login.
- `npm run dev` lance Vite en mode sandbox.
- `npm run build:sandbox` construit la sandbox.
- `npm run build:prod` existe mais ne vaut pas validation production.

## Risques ouverts

- `dev:prod` permet de lancer un build local contre la config production.
- Les SDK SQL Connect generes pointent sur le service sandbox dans `dataconnect/sosson/connector.yaml`.
- Les regles Firebase durcies dans le repo doivent etre validees en sandbox avant tout deploiement.

## Garde-fous recommandes

1. Ajouter une verification pre-build qui refuse `production` sans confirmation explicite.
2. Documenter le chemin exact de deploy sandbox.
3. Interdire tout deploy prod dans les runbooks tant que le checkpoint production readiness n'est pas passe.
4. Ajouter des headers Hosting de securite apres validation CSP.
