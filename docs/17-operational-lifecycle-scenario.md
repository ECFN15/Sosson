# 17 - Scenario nouveau client operationnel

> Statut: reponses metier renseignees en side conversation, a reprendre par l'agent principal
> Derniere revision: 2026-05-18
> Portee: cadrage metier obligatoire avant validation sandbox du cycle nouveau client.

## Pourquoi ce document existe

Le cycle technique local est prouve en emulateur Data Connect: un profil `User` local autorise cree une fiche prospect sans chantier, un devis demande sans chantier, un client operationnel, un chantier rattache, un devis signe et des factures fournisseur definitives/categorisees, puis le script relit les liens SQL.

Cette preuve ne suffit pas a valider le scenario metier reel. Les decisions ci-dessous ont ete renseignees par l'utilisateur en side conversation et doivent guider la reprise de l'agent principal avant toute demande de validation sandbox.

Preuve technique locale:

```bash
npm run verify:operational-lifecycle:dataconnect -- --output=tmp/checkpoint-002/operational-lifecycle-local.json
```

Artefact local:

```text
tmp/checkpoint-002/operational-lifecycle-local.json
```

## Questions a trancher

| # | Decision metier | Reponse attendue | Impact produit / SQL |
|---|---|---|---|
| 1 | Informations minimales quand un nouveau client appelle | Creer une fiche client des le premier contact avec nom, prenom, adresse, telephone, type de chantier cible, souhaits du client et notes libres. | Le front doit permettre une fiche client/prospect initiale, meme avant chantier confirme. |
| 2 | Client sans chantier ou creation client + chantier ensemble | Un client peut etre cree sans chantier si le projet n'est pas encore assez precis. Il faut aussi pouvoir creer client + chantier en meme temps quand le besoin est clair. | Workflow en deux modes: fiche client seule, ou creation combinee client + chantier. |
| 3 | Devis comme objet separe ou chantier suffisant pour l'instant | Creer une vraie partie `Devis`. Statuts attendus: `devis_demande`, `devis_envoye`, `devis_signe`. | Nouveau domaine SQL/front a prevoir; le devis fait le pont entre souhait client et chantier confirme. |
| 4 | Moment d'arrivee d'une facture fournisseur et personne qui la saisit | Une facture fournisseur peut arriver a tout moment pendant le chantier, souvent mois par mois. Plusieurs roles peuvent la saisir. Une facture importee est consideree definitive. | Droits multi-roles a prevoir; rattachement obligatoire au chantier; pas de fallback silencieux. |
| 5 | Factures qui impactent le dashboard | Toute facture fournisseur importee impacte directement le dashboard. Elle doit etre classee par categorie/poste: bois, electricite, materiaux, sous-traitance, etc. | Calculs dashboard/statistiques bases sur toutes les factures visibles, avec ventilation par cout matiere/poste. |
| 6 | Client Excel previsionnel qui devient operationnel | Le tableur Excel est un previsionnel semi-operationnel. Un client/chantier Excel peut devenir operationnel; une fois termine, sa data finale devient historique operationnel. | Prevoir promotion/liaison controlee entre previsionnel et operationnel au lieu de toujours recreer une fiche propre. |
| 7 | Statuts chantier reellement utilises | Statuts valides: `prospect`, `devis_a_faire`, `devis_envoye`, `signe`, `en_preparation`, `en_cours`, `en_pause`, `termine`, `cloture`, `annule`. | Enum/statuts UI et SQL a faire evoluer; transitions a preciser ensuite. |
| 8 | Chiffres visibles immediatement apres creation | Budget, depenses, marge, retard, productivite salarie. Plus tard, l'interface mobile salarie devra alimenter comptes rendus, photos et temps de travail. | KPI chantier/dashboard a etendre; futur domaine RH/mobile chantier a prevoir. |
| 9 | Angle prioritaire de la page Moteur live | Les trois: visualisation base de donnees, diagramme des relations metier, explorateur client/chantier/facture/devis. Interface full page fonctionnelle, proche Microsoft Access, sans elements decoratifs inutiles. | Moteur live doit devenir un vrai outil visuel patron/assistant, pas une simple page technique. |

## Workflow metier cible retenu

Le modele cible n'est plus seulement `Client -> Chantier -> Facture`.
Le flux metier a reprendre est:

```text
Client / Prospect
  -> demande ou projet souhaite
  -> devis demande / envoye / signe
  -> chantier confirme
  -> factures fournisseur definitives et categorisees
  -> documents, emails, planning, rapports et audit
  -> historique operationnel en fin de chantier
```

Consequences directes pour la suite:

1. le front doit accepter un client/prospect sans chantier;
2. la creation combinee client + chantier reste necessaire quand le projet est clair;
3. un domaine `Devis` doit etre ajoute ou prepare;
4. les factures importees doivent impacter les chiffres, mais rester categorisees;
5. le previsionnel Excel doit pouvoir etre rapproche/promu vers l'operationnel;
6. le Moteur live doit privilegier une visualisation full page des tables, liens et objets metier.

## Hypotheses techniques deja testees

Ces hypotheses sont utiles pour les scripts locaux, mais elles ne sont pas des decisions metier finales.

| Sujet | Hypothese locale actuelle |
|---|---|
| Role createur | `assistante` peut creer client, chantier et facture. |
| Client | `type`, `nom`, `prenom`, contact, adresse, ville, code postal, type de chantier cible, souhaits et notes. |
| Devis | Un devis demande peut exister sans chantier; un devis signe est rattache au client et au chantier confirme. |
| Chantier | Rattache obligatoirement a un client, statut metier valide (`en_cours` dans la preuve lifecycle du chantier confirme). |
| Factures | Factures fournisseur definitives rattachees au chantier, toutes `validee` dans la preuve locale et ventilees par categorie/poste. |
| Origine import | Client et chantier crees avec `origineImport: "operationnel"`. |
| Previsionnel Excel | Les IDs previsionnels ne doivent jamais remonter dans les listes operationnelles actives. |
| Dashboard | Toutes les factures fournisseur importees impactent les chiffres SQL visibles; le statut sert au classement, pas a exclure le montant. |

## Format de reponse rapide

Pour debloquer la validation sandbox metier, repondre avec ce format suffit:

```text
1. Nouveau client - champs minimaux:
2. Client seul ou client + chantier:
3. Devis:
4. Facture fournisseur - moment et saisie:
5. Dashboard - factures impactantes:
6. Client Excel -> operationnel:
7. Statuts chantier:
8. Chiffres immediats:
9. Moteur live:
```

## Mise a jour assistee

Un script local peut appliquer les 9 reponses dans ce fichier sans toucher a SQL Connect ni a la sandbox:

```bash
npm run update:operational-lifecycle-decisions -- --template
npm run update:operational-lifecycle-decisions -- --text-template
npm run update:operational-lifecycle-decisions -- --text-template --output=tmp/checkpoint-002/answers.template.txt
npm run update:operational-lifecycle-decisions -- --file=tmp/checkpoint-002/answers.json --dry-run
npm run update:operational-lifecycle-decisions -- --text-file=tmp/checkpoint-002/answers.txt --dry-run
npm run update:operational-lifecycle-decisions -- --file=tmp/checkpoint-002/answers.json
npm run check:operational-lifecycle-decisions
```

Le fichier JSON attendu contient ces cles:

```json
{
  "nouveauClientChampsMinimaux": "",
  "clientEtChantier": "",
  "devis": "",
  "factureFournisseur": "",
  "dashboardFactures": "",
  "conversionPrevisionnel": "",
  "statutsChantier": "",
  "chiffresImmediats": "",
  "moteurLive": ""
}
```

Le format texte accepte aussi directement le modele de reponse rapide:

```text
1. Nouveau client - champs minimaux:
2. Client seul ou client + chantier:
3. Devis:
4. Facture fournisseur - moment et saisie:
5. Dashboard - factures impactantes:
6. Client Excel -> operationnel:
7. Statuts chantier:
8. Chiffres immediats:
9. Moteur live:
```

## Critere de passage a la sandbox

Avant toute action sandbox reelle, il faut:

1. completer les 9 reponses metier ci-dessus;
2. lancer `npm run check:operational-lifecycle-decisions` et obtenir OK;
3. ajuster le script lifecycle si les reponses changent le parcours;
4. relancer `npm run checkpoint:002:emulator` sur base locale propre;
5. confirmer que les pages Clients, Chantiers, Devis/Moteur live, Factures, Dashboard et Statistiques n'annoncent pas un fallback comme une preuve SQL;
6. utiliser la phrase de validation humaine definie dans `docs/15-checkpoint-002-sandbox-execution.md`.

Avec ces reponses, l'agent principal doit maintenir les scripts/checks et relancer la validation locale. Le verdict final depend du dernier `checkpoint:002:emulator`: pret a demander validation sandbox seulement si la preuve JSON contient aussi le prospect sans chantier, le domaine Devis et la regle factures importees impactantes.
