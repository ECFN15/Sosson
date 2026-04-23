# SQL Connect Sosson - mode local, sandbox et couts

Derniere mise a jour : 24 avril 2026

Ce document explique ce qui a ete mis en place pour pouvoir continuer a developper Sosson meme quand les instances Cloud SQL de Google Cloud sont arretees.

L'objectif est simple : travailler en local comme si le serveur SQL tournait tout le temps, sans payer inutilement une base cloud pendant les phases de developpement.

## 1. L'image mentale

Avant, on avait surtout ceci :

```text
Sosson dans le navigateur
  -> fichiers TypeScript dans src/data/*
  -> donnees en memoire dans React
```

Maintenant, le chemin cible commence a exister :

```text
Sosson dans le navigateur
  -> Firebase Auth
  -> SDK SQL Connect genere
  -> connecteur sosson
  -> PostgreSQL
```

Pour le developpement quotidien, PostgreSQL n'est pas forcement celui de Google Cloud. Il peut etre remplace par l'emulateur local :

```text
Sosson dans le navigateur
  -> SDK SQL Connect
  -> emulateur SQL Connect sur ton PC
  -> petite base PostgreSQL locale
```

Image simple : Cloud SQL, c'est l'entrepot officiel dans le cloud. L'emulateur local, c'est une maquette de l'entrepot sur ton bureau. On peut y tester les rayons, les etiquettes, les flux et les produits sans ouvrir l'entrepot officiel.

## 2. Ce que j'ai mis en place

J'ai ajoute une couche SQL Connect cote front dans `src/lib/dataconnect.ts`.

Elle fait trois choses :

- elle initialise le SDK SQL Connect genere par Firebase ;
- elle connecte automatiquement le front a l'emulateur local en mode developpement sandbox ;
- elle garde la possibilite de pointer plus tard vers le vrai Cloud SQL quand on sera en integration ou production.

J'ai aussi branche le store React principal dans `src/lib/store.tsx`.

Le comportement actuel est volontairement prudent :

```text
Si SQL Connect local repond et contient des donnees
  -> Sosson lit clients, chantiers et factures depuis SQL Connect.

Si SQL Connect est eteint, vide ou inaccessible
  -> Sosson retombe sur les seeds TypeScript locaux.
```

Donc on avance vers la vraie architecture sans casser le front existant.

## 3. Les commandes importantes

### Lancer le developpement avec SQL local

```bash
npm run dev:sql
```

Cette commande lance :

- l'emulateur SQL Connect local si le port `9399` n'est pas deja utilise ;
- le serveur Vite de Sosson.

En clair : c'est la commande a utiliser au quotidien pour developper avec la base locale.

### Injecter les donnees de depart

```bash
npm run seed:dataconnect
```

Cette commande envoie `dataconnect/seed_data.gql` dans l'emulateur local.

Le seed contient actuellement :

- 3 clients ;
- 4 chantiers ;
- 12 factures.

J'ai transforme le seed en `upsertMany`. Ca veut dire : "si la ligne existe deja, mets-la a jour ; sinon, cree-la". On peut donc relancer le seed plusieurs fois sans casser la base ni creer des doublons.

### Verifier que la base locale est bien remplie

```bash
npm run verify:dataconnect
```

La verification attend :

```json
{
  "clients": 3,
  "chantiers": 4,
  "factures": 12
}
```

Si ces chiffres sortent, la base locale contient bien le jeu de donnees attendu.

### Faire un build sandbox

```bash
npm run build:sandbox
```

Cette commande verifie que TypeScript et Vite acceptent le projet complet.

## 4. Pourquoi le Cloud SQL peut rester arrete

Tu as arrete les instances Cloud SQL dans Google Cloud. C'est une bonne decision pour le developpement courant.

Techniquement, quand une instance Cloud SQL est arretee :

- elle ne repond plus aux connexions ;
- ses donnees restent sur disque ;
- les frais de calcul de l'instance sont suspendus ;
- le stockage et certaines ressources comme les adresses IP peuvent continuer a etre factures.

Donc "arreter" n'est pas "supprimer". C'est plutot mettre la base cloud en veille.

Pour le dev quotidien, on n'a pas besoin de la reveiller. L'emulateur local suffit pour tester les requetes, les mutations, le mapping front et le comportement de l'application.

## 5. Ce qui reste en local et ce qui reste dans le cloud

### En local

L'emulateur SQL Connect tourne sur :

```text
127.0.0.1:9399
```

La base locale utilise une base integree de type PGLite geree par l'emulateur. Dans ce repo, ses donnees sont stockees ici :

```text
dataconnect/.dataconnect/pgliteData
```

Ca permet de garder les donnees locales entre deux lancements de l'emulateur.

### Dans le cloud

Le projet sandbox reste :

```text
sosson-sandbox
```

Le service SQL Connect reste :

```text
sosson-sandbox-service
```

L'instance Cloud SQL sandbox reste :

```text
sosson-sandbox-instance
```

Quand on voudra tester le vrai cloud, il faudra :

1. redemarrer l'instance Cloud SQL dans Google Cloud ;
2. attendre le redemarrage ;
3. lancer les commandes Firebase contre `sosson-sandbox` ;
4. tester ;
5. arreter l'instance ensuite si ce n'est plus necessaire.

## 6. Authentification : point important

Les operations SQL Connect de Sosson sont protegees par :

```text
@auth(level: USER)
```

Ca veut dire : SQL Connect accepte les requetes seulement si l'utilisateur Firebase est authentifie.

Aujourd'hui, le front Sosson a encore un mode hybride :

- Firebase Auth est branche ;
- le store local peut encore fonctionner avec les seeds ;
- SQL Connect est essaye apres la presence d'un utilisateur applicatif ;
- si l'auth ou SQL Connect ne repond pas, le front reste utilisable grace au fallback local.

Ce n'est pas encore l'etat final de production, mais c'est le bon entre-deux pour avancer proprement.

## 7. Fichiers modifies

Les principaux fichiers ajoutes ou modifies sont :

- `src/lib/dataconnect.ts` : initialisation du SDK SQL Connect cote front ;
- `src/lib/store.tsx` : lecture progressive des clients, chantiers et factures depuis SQL Connect ;
- `src/main.tsx` : ajout du provider React Query ;
- `dataconnect/seed_data.gql` : seed rendu relancable avec `upsertMany` ;
- `scripts/dev-sql-local.mjs` : lance l'environnement local SQL + Vite ;
- `scripts/seed-dataconnect-local.mjs` : injecte le seed dans l'emulateur ;
- `scripts/verify-dataconnect-local.mjs` : verifie le contenu de la base locale ;
- `package.json` : nouvelles commandes npm ;
- `.env.example` : variables optionnelles SQL Connect.

Je n'ai pas modifie les SDKs generes a la main. C'est important : les dossiers `src/dataconnect-generated/` et `src/dataconnect-admin-generated/` restent des sorties automatiques de Firebase.

## 8. Ce que ca change concretement pour toi

Avant de coder :

```bash
npm run dev:sql
```

Si tu veux remettre les donnees de depart :

```bash
npm run seed:dataconnect
```

Si tu veux verifier que tout est bien charge :

```bash
npm run verify:dataconnect
```

Et tu peux laisser les instances Cloud SQL arretees tant que tu ne testes pas explicitement le vrai cloud.

## 9. Avis objectif sur les couts

### Ce que dit la doc officielle

Firebase SQL Connect a deux blocs de facturation :

- le service SQL Connect ;
- l'instance Cloud SQL PostgreSQL qui stocke les donnees.

La doc Firebase indique aussi que les operations client sont gratuites jusqu'a 250 000 operations par mois, puis facturees au-dela. Pour une petite application interne, ce seuil est confortable au debut.

Pour Cloud SQL, Google indique que l'arret d'une instance suspend les frais d'instance, mais que les donnees restent conservees et que le stockage continue a etre facture.

### Ton cas precis

Sur ta capture, on voit environ `0,34 €` cote Cloud SQL sur la periode affichee, compense par `-0,34 €` de remises, donc `0,00 €` net sur cette vue.

Ce n'est pas alarmant. Par contre, laisser tourner une instance juste pour "ne rien faire" reste inutile si l'emulateur local couvre le developpement.

### Comparaison avec un serveur classique

Un serveur classique avec PostgreSQL installe dessus peut couter moins cher en pur prix mensuel. Par exemple, un petit VPS peut souvent etre dans une logique de quelques euros par mois.

Mais ce prix bas cache du travail :

- installer PostgreSQL ;
- faire les sauvegardes ;
- gerer les mises a jour ;
- surveiller le disque ;
- securiser les acces ;
- restaurer en cas de probleme ;
- gerer les pannes.

Cloud SQL coute plus cher qu'un PostgreSQL installe a la main sur un petit serveur, mais il achete surtout de la tranquillite operationnelle.

Mon avis objectif pour Sosson :

- pour le dev : ne laisse pas Cloud SQL tourner h24, l'emulateur local est la bonne solution ;
- pour la sandbox : demarre Cloud SQL seulement quand tu testes le vrai cloud, puis arrete ;
- pour la production future : Cloud SQL est raisonnable si la facture reste dans un ordre de grandeur bas, parce que Sosson est un outil metier important et les donnees clients/chantiers/factures meritent une base geree proprement ;
- si un jour la facture Cloud SQL monte fortement sans trafic reel, il faudra optimiser ou revoir la taille de l'instance.

En clair : pour dev, non, inutile de payer. Pour prod, oui, Cloud SQL peut etre un choix raisonnable si on garde une petite configuration adaptee a Sosson.

## 10. Sources officielles consultees

- Firebase SQL Connect pricing : https://firebase.google.com/docs/sql-connect/pricing
- Emulateur Firebase SQL Connect : https://firebase.google.com/docs/sql-connect/data-connect-emulator-suite
- Arret/redemarrage Cloud SQL PostgreSQL : https://docs.cloud.google.com/sql/docs/postgres/start-stop-restart-instance
