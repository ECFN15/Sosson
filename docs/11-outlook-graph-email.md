# Chapitre 11 - Module email Outlook / Microsoft Graph

> **Statut** : draft valide par test local
> **Derniere revision** : 2026-05-16
> **Contexte** : creation d'un compte Microsoft de developpement, configuration Azure/Entra, validation OAuth Microsoft Graph en lecture et envoi.
> **Prerequis** : [06 - Integrations externes](06-integrations.md), [10 - Securite & Autorisations](10-securite.md), [Kit Outlook](outlook-mail-kit.md)

---

## 11.1 Objectif du chantier

Le but de cette phase etait de valider le chemin le plus rapide et fiable pour tester le module email de Sosson avec une vraie boite Outlook, sans abonnement Microsoft 365 payant.

Le test devait prouver quatre choses :

- un compte Outlook gratuit peut recevoir et envoyer des emails normalement ;
- une application Microsoft Entra peut autoriser Sosson a utiliser Microsoft Graph ;
- Microsoft Graph peut lire les emails de la boite test ;
- Microsoft Graph peut envoyer un email depuis cette boite test.

Ce travail ne correspond pas encore a l'integration finale dans Sosson. Il s'agit d'une preuve technique propre, documentee et reproductible.

## 11.2 Compte Microsoft de developpement

Un compte Microsoft gratuit a ete cree pour les tests email.

Boite utilisee :

```text
matthis.fradinpro14@outlook.fr
```

Le compte a ete valide directement dans Outlook Web :

```text
https://outlook.live.com/mail/
```

Verification realisee avant Azure :

- ouverture de la boite Outlook OK ;
- reception du message de bienvenue Microsoft OK ;
- envoi manuel d'un email depuis Outlook OK ;
- reception d'une reponse externe OK.

Cette verification etait importante : avant de brancher Graph, il fallait confirmer que le probleme n'etait pas la boite elle-meme.

Procedure suivie depuis zero :

1. Ouvrir Outlook Web :

   ```text
   https://outlook.com
   ```

2. Cliquer sur `Creer un compte gratuit`.
3. Creer une adresse Microsoft/Outlook neuve dediee au test.
4. Finaliser les verifications Microsoft demandees pendant l'inscription.
5. Arriver dans la boite Outlook Web.
6. Confirmer qu'un email de bienvenue Microsoft est present.
7. Cliquer sur `Nouveau message`.
8. Envoyer un email vers une autre adresse controlee.
9. Depuis l'autre adresse, repondre au compte Outlook.
10. Verifier dans Outlook que l'envoi et la reception fonctionnent.

Decision :

```text
Avant tout Graph/OAuth, la boite email doit etre validee comme boite normale.
Si Outlook Web ne sait pas envoyer/recevoir, l'integration Graph ne doit pas commencer.
```

## 11.3 Chemins Microsoft refuses ou ecartes

Le chemin Microsoft 365 Developer Program a ete teste depuis :

```text
https://developer.microsoft.com/en-us/microsoft-365/dev-program
```

Conclusion :

- le programme demande une eligibilite entreprise, Visual Studio Professional/Enterprise ou programme qualifiant ;
- ce chemin n'etait pas adapte au test actuel ;
- aucune souscription Microsoft 365 payante n'a ete prise.

Decision :

```text
Ne pas utiliser Microsoft 365 Developer Program pour ce test.
Utiliser un compte Azure/Entra disponible avec le compte Microsoft de developpement.
```

Clarification importante :

```text
Outlook gratuit seul suffit a avoir une boite email.
Outlook gratuit seul ne suffit pas toujours a creer proprement une App Registration Graph.
Pour Microsoft Graph, il faut une application Entra/Azure.
```

Le portail Entra affichait un avertissement indiquant que creer une application hors repertoire etait deconseille. Cet avertissement n'a pas ete retenu comme cible produit, mais il a aide a comprendre que Microsoft pousse aujourd'hui vers un tenant Entra/Azure pour les integrations serieuses.

## 11.4 Compte Azure / Microsoft Entra

Le portail Azure a ete ouvert avec le compte Microsoft de developpement :

```text
https://portal.azure.com/
```

Le compte disposait d'un acces a un tenant Azure visible dans le portail.

Ecran atteint :

```text
Microsoft Azure > Centre de demarrage rapide
```

Le tenant visible en haut a droite etait le repertoire par defaut du compte de developpement.

Important pour reprise :

- dans cette session, le compte Azure existait deja au moment de continuer ;
- aucune souscription Microsoft 365 n'a ete prise ;
- aucune carte bancaire ne doit etre ajoutee pour ce module sans decision explicite ;
- si Azure demande une carte uniquement pour creer un tenant, arreter et documenter le blocage avant de continuer.

Navigation utilisee dans Azure :

1. Ouvrir :

   ```text
   https://portal.azure.com/
   ```

2. Utiliser la barre de recherche du portail.
3. Taper :

   ```text
   Inscriptions d'applications
   ```

4. Ouvrir la page `Inscriptions d'applications`.

Page Azure utilisee :

```text
Inscriptions d'applications
```

URL de contexte :

```text
https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
```

Important :

- la carte bancaire ou Microsoft 365 ne sont pas requis pour la configuration deja realisee ;
- l'experience Azure peut afficher des avertissements sur les applications hors repertoire ou les editeurs non verifies ;
- ces avertissements ne bloquent pas un test de developpement local avec consentement explicite de l'utilisateur.

## 11.5 Creation de l'application Entra

Une App Registration dediee au test a ete creee.

Chemin exact dans Azure :

```text
Azure Portal
  -> Inscriptions d'applications
  -> Nouvelle inscription
```

Formulaire `Inscrire une application` :

| Champ | Valeur choisie |
|---|---|
| Nom | `Sosson Email Test` |
| Types de comptes pris en charge | `Tout locataire Entra ID + compte personnel Microsoft` |
| URI de redirection | laisse vide a cette etape |

Nom :

```text
Sosson Email Test
```

Type de comptes pris en charge :

```text
Tout locataire Entra ID + compte personnel Microsoft
```

Dans le portail, cette option apparait comme une application utilisable par :

```text
Tous les utilisateurs de compte Microsoft
```

Raison de ce choix :

- le compte Outlook utilise pour le test est un compte Microsoft personnel ;
- une option `Locataire unique seulement` aurait limite l'application au tenant Azure uniquement ;
- l'option multitenant + compte personnel permet le consentement du compte Outlook de developpement.

Apres clic sur `S'inscrire`, Azure a ouvert la page de vue d'ensemble de l'application.

Champs importants visibles sur la vue d'ensemble :

| Champ Azure | Utilisation dans le projet |
|---|---|
| `ID d'application (client)` | `MICROSOFT_CLIENT_ID` |
| `ID de l'annuaire (locataire)` | `MICROSOFT_TENANT_ID` |
| `ID de l'objet` | non utilise dans le test OAuth |
| `Types de comptes pris en charge` | verification que les comptes Microsoft personnels sont acceptes |

Identifiants non secrets releves :

```text
MICROSOFT_TENANT_ID=40de9480-40dc-4fee-90c6-75bfc6aeb56c
MICROSOFT_CLIENT_ID=b9316a09-9d96-44ec-ba09-4b037a01562d
```

Ces valeurs ne sont pas des mots de passe. Elles peuvent etre stockees dans `.env.local` pour le test.

Ne pas confondre :

```text
Client ID = identifiant public de l'application.
Tenant ID = identifiant public du repertoire.
Client secret = mot de passe applicatif, secret, jamais public.
```

## 11.6 Configuration Authentication / URI de redirection

Deux URI de redirection ont ete ajoutees dans Azure, dans l'onglet :

```text
Authentification
```

Chemin exact :

```text
Application Sosson Email Test
  -> Authentification (Preview)
  -> Ajouter un URI de redirection
```

Au depart, l'intention etait d'utiliser `Application a page unique (SPA)` pour le local React. Pendant la configuration, la plateforme finalement creee a ete :

```text
Web
```

Ce choix est conserve volontairement pour la suite.

Raison :

```text
La plateforme Web est plus adaptee au flux authorization code cote serveur.
Elle permet de garder le client secret et l'echange token hors du navigateur.
```

URI sandbox :

```text
https://sosson-sandbox.web.app/auth/microsoft/callback
```

URI locale precise utilisee pour les tests :

```text
http://localhost:5173/auth/microsoft/callback
```

Raison du double callback :

- `localhost:5173` permet de tester depuis Vite et depuis le script local OAuth ;
- l'URL sandbox est preparee pour le futur branchement Firebase Hosting ;
- Microsoft autorise plusieurs URI de redirection sur la meme application.

Details de saisie dans Azure :

1. Cliquer `Ajouter un URI de redirection`.
2. Selectionner `Web`.
3. Renseigner d'abord :

   ```text
   https://sosson-sandbox.web.app/auth/microsoft/callback
   ```

4. Laisser `URL de deconnexion du canal avant` vide.
5. Ne pas cocher les cases de flux implicites.
6. Cliquer `Configurer`.
7. Refaire l'ajout pour :

   ```text
   http://localhost:5173/auth/microsoft/callback
   ```

Les cases suivantes n'ont pas ete cochees :

```text
Jetons d'acces pour flux implicites
Jetons d'ID pour flux implicites et hybrides
```

Raison :

```text
Le flux cible est authorization code cote serveur, pas le flux implicite navigateur.
```

Le champ de deconnexion front-channel a ete laisse vide, car il n'est pas necessaire pour cette preuve technique.

Etat attendu dans Azure apres configuration :

| Type de plateforme | URI |
|---|---|
| Web | `https://sosson-sandbox.web.app/auth/microsoft/callback` |
| Web | `http://localhost:5173/auth/microsoft/callback` |

## 11.7 Configuration API autorisees / Microsoft Graph

Dans l'onglet :

```text
API autorisees
```

API choisie :

```text
Microsoft Graph
```

Type de permissions choisi :

```text
Autorisations deleguees
```

Chemin exact :

```text
Application Sosson Email Test
  -> API autorisees
  -> Ajouter une autorisation
  -> Microsoft Graph
  -> Autorisations deleguees
```

Sequence suivie :

1. Azure contenait deja `User.Read` par defaut.
2. `offline_access` a ete coche dans la famille `OpenId permissions`.
3. `email` a aussi ete coche pendant la recherche. Il n'est pas bloquant mais pas indispensable.
4. Rechercher `Mail.Read`.
5. Cocher uniquement `Mail.Read`.
6. Rechercher `Mail.Send`.
7. Cocher uniquement `Mail.Send`.
8. Ne pas cocher les variantes `.Shared`.
9. Ne pas cocher les permissions `Application` pour ce test delegue.
10. Cliquer `Ajouter des autorisations`.

Permissions presentes apres configuration :

```text
User.Read
email
offline_access
Mail.Read
Mail.Send
```

Role de chaque permission :

| Permission | Role dans le test |
|---|---|
| `User.Read` | Lire le profil de l'utilisateur connecte |
| `email` | Afficher l'adresse email du profil, non critique |
| `offline_access` | Autoriser un refresh token dans un flux delegue |
| `Mail.Read` | Lire les emails de la boite connectee |
| `Mail.Send` | Envoyer un email au nom de la boite connectee |

Le consentement administrateur du tenant a ete accorde dans Azure pour `Default Directory`.

Action de consentement :

```text
API autorisees
  -> Accorder un consentement d'administrateur pour Default Directory
  -> Confirmer
```

Etat attendu apres consentement :

- les permissions restent de type `Deleguee` ;
- la colonne de statut doit indiquer que le consentement est accorde ;
- l'utilisateur verra quand meme un ecran de consentement Microsoft la premiere fois si l'application est non verifiee.

Note :

```text
Le test actuel utilise un flux delegue.
La cible produit pourra passer en flux serveur app-only si Sosson utilise une vraie boite entreprise Microsoft 365.
```

## 11.8 Configuration Certificats & secrets

Un secret client a ete cree dans :

```text
Certificats & secrets
```

Chemin exact :

```text
Application Sosson Email Test
  -> Certificats & secrets
  -> Secrets client
  -> Nouveau secret client
```

Formulaire utilise :

| Champ | Valeur |
|---|---|
| Description | `sosson-email-test` |
| Expiration | duree courte confortable pour le test |

Description :

```text
sosson-email-test
```

Azure affiche ensuite une ligne de secret avec deux colonnes a ne pas confondre :

| Colonne Azure | Signification | A utiliser ? |
|---|---|---|
| `Valeur` | vrai secret client, mot de passe applicatif | Oui, dans `.env.local` uniquement |
| `ID de secret` | identifiant technique de l'objet secret | Non pour OAuth |

Point critique :

```text
MICROSOFT_CLIENT_SECRET doit contenir la colonne Valeur, pas l'ID de secret.
```

Azure n'affiche la colonne `Valeur` qu'une seule fois. Si elle n'a pas ete copiee immediatement, il faut supprimer le secret et en creer un nouveau.

Un premier secret a ete expose dans une capture pendant la configuration. Il a donc ete considere comme compromis et remplace.

Regle appliquee :

```text
Tout secret visible dans une capture, un chat, un commit ou un log est compromis.
Il doit etre supprime et regenere.
```

Le nouveau secret a ete stocke uniquement dans `.env.local`.

Procedure appliquee apres exposition accidentelle :

1. Retourner dans `Certificats & secrets`.
2. Cliquer sur la poubelle du secret expose.
3. Confirmer la suppression.
4. Creer un nouveau secret client.
5. Copier uniquement la colonne `Valeur`.
6. Coller cette valeur dans `.env.local`.
7. Ne plus envoyer de capture avec cette valeur visible.

Important :

- utiliser la colonne **Valeur** du secret, pas la colonne **ID de secret** ;
- Azure n'affiche la valeur qu'une seule fois ;
- ne jamais prefixer ce secret avec `VITE_` ;
- ne jamais le mettre dans `.env.sandbox` ou `.env.production` ;
- ne jamais le commiter.

## 11.9 Rangement local des variables et separation front/serveur

Le fichier local suivant a ete cree :

```text
.env.local
```

Il est ignore par Git via la regle :

```text
*.local
```

Variables ajoutees :

```env
MICROSOFT_TENANT_ID=40de9480-40dc-4fee-90c6-75bfc6aeb56c
MICROSOFT_CLIENT_ID=b9316a09-9d96-44ec-ba09-4b037a01562d
MICROSOFT_CLIENT_SECRET=valeur_locale_non_commitee
MICROSOFT_REDIRECT_URI=http://localhost:5173/auth/microsoft/callback
MICROSOFT_SANDBOX_REDIRECT_URI=https://sosson-sandbox.web.app/auth/microsoft/callback
MICROSOFT_MAILBOX=matthis.fradinpro14@outlook.fr
```

Raison de chaque variable :

| Variable | Role |
|---|---|
| `MICROSOFT_TENANT_ID` | cible le repertoire Microsoft pour l'echange OAuth |
| `MICROSOFT_CLIENT_ID` | identifie l'application `Sosson Email Test` |
| `MICROSOFT_CLIENT_SECRET` | prouve l'identite de l'application cote serveur |
| `MICROSOFT_REDIRECT_URI` | callback local utilise par le script de test |
| `MICROSOFT_SANDBOX_REDIRECT_URI` | callback Firebase Hosting prepare pour la suite |
| `MICROSOFT_MAILBOX` | boite Outlook test utilisee pour lire/envoyer |

Verification realisee :

- le placeholder du secret a ete remplace ;
- aucune variable `VITE_...SECRET` n'est presente ;
- le secret reste local.

Commandement important :

```text
VITE_ expose la variable au bundle navigateur.
Donc aucune variable contenant SECRET, TOKEN ou REFRESH ne doit commencer par VITE_.
```

Dans la preuve technique actuelle, `.env.local` sert au script Node local. En production, l'equivalent devra vivre dans Secret Manager ou dans la configuration securisee de Cloud Functions, pas dans le bundle React.

## 11.10 Script de test OAuth local

Un script local a ete ajoute :

```text
scripts/test-outlook-oauth.mjs
```

Commandes ajoutees dans `package.json` :

```bash
npm run test:outlook:oauth
npm run test:outlook:send
```

Fonction du script :

- lance un petit serveur HTTP local sur `localhost:5173` ;
- ouvre l'URL Microsoft OAuth ;
- recoit le code OAuth sur `/auth/microsoft/callback` ;
- echange ce code contre un token Microsoft ;
- appelle Microsoft Graph ;
- n'ecrit pas les tokens dans un fichier ;
- n'affiche pas les tokens dans le terminal.

Une erreur a ete rencontree au premier lancement :

```text
AADSTS900144: The request body must contain the following parameter: 'scope'.
```

Cause :

```text
L'ouverture automatique Windows coupait l'URL Microsoft au premier caractere `&`.
Le navigateur recevait donc une URL incomplete sans le parametre `scope`.
```

Correction appliquee :

- le script affiche maintenant l'URL complete a copier manuellement si besoin ;
- l'ouverture navigateur Windows utilise `Start-Process`.

## 11.11 Test de lecture Microsoft Graph

Commande utilisee :

```bash
npm run test:outlook:oauth
```

Scopes demandes :

```text
openid profile offline_access User.Read Mail.Read Mail.Send
```

Ecran Microsoft obtenu :

```text
Autoriser cette application a acceder a vos informations
Application : Sosson Email Test
Editeur : non verifie
```

Permissions affichees par Microsoft :

- conserver l'acces aux donnees auxquelles l'application a acces ;
- lecture du profil ;
- consultation des emails ;
- envoi d'emails en votre nom.

Resultat apres acceptation :

```text
Connexion Microsoft Graph OK
Compte: matthis.fradinpro14@outlook.fr
Dernier mail lu: Verification des informations de securite du compte Microsoft
```

Conclusion :

```text
OAuth fonctionne.
Mail.Read fonctionne.
Microsoft Graph voit bien la boite Outlook de test.
```

## 11.12 Test d'envoi Microsoft Graph

Commande utilisee :

```bash
npm run test:outlook:send
```

Endpoint Graph utilise par le script :

```text
POST https://graph.microsoft.com/v1.0/me/sendMail
```

Destinataire du test :

```text
MICROSOFT_MAILBOX
```

Sujet genere :

```text
Sosson Graph test 2026-05-16T14:33:38.362Z
```

Resultat navigateur :

```text
Connexion Microsoft Graph OK
Compte: matthis.fradinpro14@outlook.fr
Dernier mail lu: Nouvelle(s) application(s) connectee(s) a votre compte Microsoft
Mail de test envoye: Sosson Graph test 2026-05-16T14:33:38.362Z
```

Verification manuelle :

- le mail de test a ete retrouve dans Outlook ;
- l'envoi Graph est donc valide.

Conclusion :

```text
Mail.Send fonctionne.
La preuve technique lecture + envoi est terminee.
```

## 11.13 Etat reel au 2026-05-16

Ce qui est valide :

- compte Outlook test cree et fonctionnel ;
- acces Azure/Entra fonctionnel ;
- App Registration `Sosson Email Test` creee ;
- URI locale et sandbox configurees ;
- permissions Graph deleguees ajoutees ;
- consentement accorde ;
- secret client regenere apres exposition accidentelle ;
- `.env.local` cree et non commite ;
- OAuth local valide ;
- lecture du dernier mail validee ;
- envoi d'un mail de test valide.

Ce qui n'est pas encore fait :

- aucune route React `/auth/microsoft/callback` n'est encore implementee ;
- aucun token Microsoft n'est encore stocke en base ;
- aucune Cloud Function email n'est encore creee ;
- la page `/emails` lit encore les seeds locaux ;
- SQL Connect ne contient pas encore les tables email ;
- les pieces jointes Outlook ne sont pas encore importees ;
- aucun mecanisme de refresh token persistant n'est encore branche ;
- aucun flux sandbox deploye n'a encore ete valide.

## 11.14 Regles de securite pour la suite

Regles non negociables :

- le secret Microsoft ne va jamais dans React ;
- aucune variable `VITE_MICROSOFT_CLIENT_SECRET` ne doit exister ;
- les tokens Microsoft ne doivent pas etre stockes dans `localStorage` ;
- le refresh token, si utilise, doit etre chiffre ou stocke cote serveur ;
- les appels Graph d'envoi doivent passer par un backend controle ;
- chaque envoi doit etre journalise ;
- les permissions doivent rester minimales ;
- tout secret expose doit etre supprime et regenere.

Pour une integration produit propre, le front ne doit jamais envoyer directement avec Graph. Le flux cible est :

```text
React
  -> Cloud Function / backend authentifie Firebase
  -> verification role Sosson
  -> Microsoft Graph
  -> SQL Connect audit + email
```

## 11.15 Prochaine etape recommandee

Avant de brancher la page `/emails`, creer d'abord le socle serveur :

1. definir le schema SQL Connect email minimal ;
2. creer une route ou Function OAuth callback ;
3. stocker les tokens cote serveur de facon securisee ;
4. creer une Function `syncOutlookInbox` qui lit quelques messages ;
5. inserer les messages dans SQL Connect ;
6. brancher `/emails` sur SQL Connect avec fallback seed ;
7. creer ensuite `sendOutlookMail` pour l'envoi depuis le site.

Le test local `scripts/test-outlook-oauth.mjs` doit rester un outil de validation, pas devenir le code produit.

---

**References liees** :

- [docs/outlook-mail-kit.md](outlook-mail-kit.md)
- [docs/06-integrations.md](06-integrations.md)
- [docs/10-securite.md](10-securite.md)
- [AGENTS.md](../AGENTS.md)
