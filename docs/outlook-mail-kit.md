# Kit Outlook / Microsoft Graph pour la page mail

Statut: specification de reprise
Derniere mise a jour: 2026-05-16

Ce document remplace l'hypothese historique Gmail pour la boite mail entreprise. La cible est une boite Microsoft 365 / Outlook connectee a Sosson pour lire les emails, les rattacher aux clients/chantiers et envoyer des reponses depuis le site.

## 1. Decision recommandee

Pour Sosson, le choix le plus propre est un flux serveur:

- une boite entreprise unique, par exemple `contact@sosson.fr` ou `dossiers@sosson.fr`;
- une application Microsoft Entra mono-tenant;
- des permissions Microsoft Graph applicatives `Mail.Read` et `Mail.Send`;
- une restriction Exchange Online RBAC pour limiter l'application a la seule boite cible;
- aucun secret Microsoft dans le front React.

Le flux delegue avec MSAL navigateur reste possible si chaque utilisateur doit connecter sa propre boite. Ce n'est pas le meilleur point de depart pour une PME qui veut brancher une boite d'entreprise centrale.

## 2. Etapes Microsoft 365

1. Creer ou confirmer la boite Outlook entreprise.
2. Dans Microsoft Entra admin center, creer une App Registration dediee a Sosson.
3. Choisir "Accounts in this organizational directory only".
4. Creer un secret client ou, mieux, un certificat cote serveur.
5. Ajouter les permissions Microsoft Graph applicatives:
   - `Mail.Read`
   - `Mail.Send`
6. Faire valider l'admin consent par l'administrateur Microsoft 365.
7. Restreindre l'application a la boite cible avec Exchange Online RBAC for Applications.
8. Stocker `tenantId`, `clientId`, `clientSecret` ou certificat dans Secret Manager, jamais dans Vite.

## 3. Flux OAuth

### Mode serveur app-only

```http
POST https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token
Content-Type: application/x-www-form-urlencoded

client_id={clientId}
client_secret={secret}
scope=https://graph.microsoft.com/.default
grant_type=client_credentials
```

Ce mode est adapte a une boite entreprise unique et a des jobs Cloud Functions.

### Mode delegue utilisateur

Si un jour chaque salarie connecte sa boite personnelle, utiliser le flux authorization code + PKCE via MSAL. Les scopes seraient alors:

```text
openid profile offline_access Mail.Read Mail.Send
```

## 4. Endpoints Graph utiles

```http
GET  /users/{mailbox}/mailFolders
GET  /users/{mailbox}/mailFolders/inbox/messages
GET  /users/{mailbox}/messages/{messageId}
GET  /users/{mailbox}/messages/{messageId}/attachments
GET  /users/{mailbox}/mailFolders/{folderId}/messages/delta
POST /users/{mailbox}/sendMail
POST /subscriptions
```

Recommandations:

- utiliser `$select` pour ne charger que les champs utiles;
- paginer avec `@odata.nextLink`;
- stocker `@odata.deltaLink` par dossier;
- dedupliquer avec `internetMessageId` et l'id Graph;
- enregistrer les pieces jointes dans Cloud Storage, pas en base SQL.

## 5. Synchronisation entrante

Phase 1 robuste:

1. Scheduler Cloud Function toutes les 5 a 15 minutes.
2. Appel `messages/delta` sur Inbox.
3. Stockage des nouveaux emails dans SQL Connect.
4. Rattachement IA puis validation humaine dans la page mail.

Phase 2 quasi temps reel:

1. Creer une subscription Graph sur `users/{id}/mailFolders('Inbox')/messages`.
2. Exposer une URL HTTPS publique pour recevoir les notifications.
3. Repondre vite au webhook et pousser le traitement dans une queue.
4. Renouveler la subscription avant expiration.
5. Garder le delta sync comme filet de securite.

## 6. Envoi depuis Sosson

L'envoi ne doit pas partir directement du navigateur.

Flux cible:

1. L'utilisateur redige ou valide une reponse dans Sosson.
2. Le front appelle une Cloud Function `sendOutlookMail`.
3. La Function verifie l'utilisateur Firebase Auth et ses droits Sosson.
4. La Function appelle Microsoft Graph `POST /users/{mailbox}/sendMail`.
5. Sosson journalise l'envoi: utilisateur, destinataires, sujet, chantier/client, date, id Graph si disponible.

Le bouton "Repondre" de la page mail doit donc preparer un brouillon applicatif, pas exposer un token Microsoft au front.

## 7. Modele SQL Connect a ajouter

Le schema actuel n'a pas encore les tables email. Le minimum cible:

- `Email`
  - `id`
  - `provider` (`MICROSOFT_GRAPH`)
  - `providerMessageId`
  - `internetMessageId`
  - `conversationId`
  - `folderId`
  - `changeKey`
  - `from`
  - `to`
  - `cc`
  - `subject`
  - `bodyText`
  - `bodyHtmlUri`
  - `receivedAt`
  - `isRead`
  - `priority`
  - `category`
- `EmailRattachement`
  - `emailId`
  - `entityType` (`CLIENT` ou `CHANTIER`)
  - `entityId`
  - `scoreConfianceIA`
  - `confirmedBy`
  - `confirmedAt`
- `EmailPieceJointe`
  - `emailId`
  - `graphAttachmentId`
  - `fileName`
  - `mimeType`
  - `size`
  - `storagePath`

Ne pas modifier les SDKs generes a la main apres ajout du schema.

## 8. Variables serveur a prevoir

```text
MICROSOFT_TENANT_ID=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET_SECRET_NAME=
MICROSOFT_MAILBOX_UPN=contact@sosson.fr
MICROSOFT_WEBHOOK_CLIENT_STATE_SECRET_NAME=
```

Ces variables sont cote Cloud Functions / Secret Manager. Elles ne doivent pas etre prefixees `VITE_`.

## 9. Checklist de branchement

- [ ] App Registration Entra creee.
- [ ] `Mail.Read` et `Mail.Send` accordes en application permissions.
- [ ] Admin consent valide.
- [ ] Acces limite a la boite cible via Exchange Online RBAC.
- [ ] Secret ou certificat stocke cote serveur.
- [ ] Cloud Function d'ingestion delta creee.
- [ ] Tables SQL Connect email ajoutees.
- [ ] SDK SQL Connect regenere.
- [ ] Page `/emails` branchee sur SQL Connect avec fallback local.
- [ ] Cloud Function d'envoi creee.
- [ ] Audit log des envois et rattachements actif.

## 10. Sources Microsoft officielles

- OAuth authorization code + PKCE: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow
- Client credentials flow: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow
- Admin consent: https://learn.microsoft.com/en-us/entra/identity-platform/v2-admin-consent
- List messages: https://learn.microsoft.com/en-us/graph/api/user-list-messages
- Send mail: https://learn.microsoft.com/en-us/graph/api/user-sendmail
- Delta messages: https://learn.microsoft.com/en-us/graph/delta-query-messages
- Change notifications webhooks: https://learn.microsoft.com/en-us/graph/change-notifications-delivery-webhooks
- Create subscription: https://learn.microsoft.com/en-us/graph/api/subscription-post-subscriptions
- Permissions reference: https://learn.microsoft.com/en-us/graph/permissions-reference
- Exchange Online RBAC for Applications: https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac
