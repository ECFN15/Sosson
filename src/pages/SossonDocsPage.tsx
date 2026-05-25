import { useEffect, useMemo, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Boxes,
  CheckCircle2,
  Code2,
  Database,
  FileText,
  FolderOpen,
  KeyRound,
  Link as LinkIcon,
  LockKeyhole,
  MailCheck,
  MonitorCheck,
  Route,
  Server,
  ShieldCheck,
  Table2,
  TerminalSquare,
  UsersRound,
} from 'lucide-react'

type DocCallout = {
  title: string
  body: string
}

type DocSubSection = {
  title: string
  body: string[]
  bullets?: string[]
  procedure?: string[]
  code?: string
  evidence?: string[]
  callout?: DocCallout
}

type DocSection = {
  id: string
  title: string
  summary: string
  subsections: DocSubSection[]
}

type DocChapter = {
  id: string
  number: string
  title: string
  shortTitle: string
  lead: string
  icon: LucideIcon
  status: string
  sections: DocSection[]
  sources: string[]
  commands?: string[]
}

const previsionnelDocSnapshot = {
  workbook: 'excel/PREVISIONNEL v6  2022-2023-2024-2025 - v2.xlsx',
  latestStructureSheet: '2025-26',
  auditedSheets: 13,
  clientCount: 586,
  aliasCount: 616,
  chantierCount: 898,
  lineCount: 898,
  monthlyAmounts: 1577,
  lotAmounts: 887,
} as const

const docChapters: DocChapter[] = [
  {
    id: 'mails',
    number: '01',
    title: 'Mails, Microsoft Azure et Microsoft Graph',
    shortTitle: 'Mails',
    lead:
      'Ce chapitre documente le futur module email: compte Outlook de test, application Microsoft Entra, permissions Graph, callback OAuth, lecture et envoi local, puis limites avant production.',
    icon: MailCheck,
    status: 'Preuve locale validee, integration produit a construire',
    sources: [
      'docs/11-outlook-graph-email.md',
      'docs/outlook-mail-kit.md',
      'docs/06-integrations.md',
      'src/pages/MicrosoftCallbackPage.tsx',
      'scripts/test-outlook-oauth.mjs',
      '.env.local',
    ],
    commands: ['npm run test:outlook:oauth', 'npm run test:outlook:send', 'npm run outlook:local'],
    sections: [
      {
        id: 'mail-vision',
        title: 'Vision fonctionnelle du chapitre mails',
        summary: 'Le mail doit devenir un dossier operationnel, pas une boite Outlook collee dans un iframe.',
        subsections: [
          {
            title: 'Objectif produit',
            body: [
              'Sosson doit permettre de retrouver les emails lies aux clients, chantiers, factures et documents. Le but n est pas de remplacer Outlook, mais de rattacher les conversations utiles aux dossiers de l entreprise.',
              'La boite mail restera geree par Microsoft. Sosson lit, classe, rattache et prepare les actions metier: assigner a un chantier, extraire une piece jointe, transformer une facture PDF en entree facture, ou garder une trace dans le dossier client.',
            ],
            bullets: [
              'Lecture des emails entrants via Microsoft Graph.',
              'Envoi controle depuis la boite test valide localement.',
              'Rattachement futur email -> client, chantier, facture ou document.',
              'Pieces jointes stockees cote Storage avec metadata SQL.',
            ],
          },
          {
            title: 'Etat reel au 17 mai 2026',
            body: [
              'Une preuve technique locale existe: OAuth Microsoft, Mail.Read et Mail.Send ont ete valides avec une App Registration Entra nommee Sosson Email Test.',
              'Cette preuve n est pas encore une integration produit complete. Elle valide le chemin Azure/Graph, les scopes, les callbacks et la separation du secret client hors React.',
            ],
            evidence: [
              'AGENTS.md mentionne l app Microsoft Entra de test et les deux URI de redirection.',
              'docs/11-outlook-graph-email.md consigne le journal complet de configuration.',
              'scripts/test-outlook-oauth.mjs sert de banc de test, pas de code produit final.',
            ],
          },
        ],
      },
      {
        id: 'mail-azure',
        title: 'Creation du compte Azure et de l App Registration',
        summary: 'Procedure concrete pour reproduire proprement la configuration Microsoft.',
        subsections: [
          {
            title: 'Creation de la boite Outlook de test',
            body: [
              'Le test part d une vraie boite Outlook gratuite. Cette etape evite de confondre un probleme Graph avec une boite mail qui ne sait pas deja envoyer ou recevoir.',
            ],
            procedure: [
              'Ouvrir https://outlook.com.',
              'Creer une adresse Microsoft dediee au developpement.',
              'Finaliser les verifications Microsoft demandees.',
              'Ouvrir Outlook Web et confirmer la reception du message de bienvenue.',
              'Envoyer un email manuel vers une autre adresse controlee.',
              'Repondre depuis cette autre adresse et verifier la reception dans Outlook.',
              'Documenter le compte dans le journal local sans exposer de secret dans le repo.',
            ],
            callout: {
              title: 'Gate obligatoire',
              body:
                'Si Outlook Web ne fonctionne pas en manuel, Graph ne doit pas etre configure. La boite doit etre saine avant OAuth.',
            },
          },
          {
            title: 'Creation de l application Microsoft Entra',
            body: [
              'L App Registration est l identite OAuth de Sosson cote Microsoft. Elle porte les callbacks, les scopes Graph et le secret serveur.',
            ],
            procedure: [
              'Ouvrir https://portal.azure.com avec le compte de developpement.',
              'Chercher Inscriptions d applications.',
              'Cliquer sur Nouvelle inscription.',
              'Nommer l application Sosson Email Test.',
              'Choisir Tout locataire Entra ID + compte personnel Microsoft.',
              'Ne pas mettre de callback dans le formulaire initial si l ecran ne le demande pas.',
              'Recuperer ID d application client et ID de l annuaire locataire.',
              'Ajouter les callbacks Web: https://sosson-sandbox.web.app/auth/microsoft/callback et http://localhost:5173/auth/microsoft/callback.',
            ],
            evidence: [
              'MICROSOFT_CLIENT_ID et MICROSOFT_TENANT_ID ne sont pas des secrets.',
              'MICROSOFT_CLIENT_SECRET est un secret et ne doit jamais etre prefixe par VITE_.',
              'Le type de compte doit accepter les comptes Microsoft personnels pour une boite Outlook gratuite.',
            ],
          },
        ],
      },
      {
        id: 'mail-graph',
        title: 'Microsoft Graph, OAuth et scopes',
        summary: 'Ce que Graph expose et ce que Sosson doit demander au minimum.',
        subsections: [
          {
            title: 'Permissions deleguees retenues',
            body: [
              'La preuve locale utilise des permissions deleguees parce que l utilisateur consent pour sa boite. Pour une PME mono-entreprise, ce chemin reste le plus simple tant que le volume et la gouvernance Microsoft 365 restent modestes.',
              'Les permissions actuelles sont suffisantes pour lire l utilisateur, maintenir la session OAuth, lire des emails et envoyer un email de test.',
            ],
            bullets: ['User.Read', 'email', 'offline_access', 'Mail.Read', 'Mail.Send'],
            code: `Authorization Code Flow
  navigateur -> Microsoft login
  Microsoft -> /auth/microsoft/callback?code=...
  serveur/local script -> echange code contre tokens
  Graph /me/messages -> lecture
  Graph /me/sendMail -> envoi`,
          },
          {
            title: 'Secret client et tokens',
            body: [
              'Azure affiche deux valeurs differentes pour un secret: la Valeur et l ID de secret. OAuth utilise la Valeur. L ID de secret ne remplace pas le mot de passe applicatif.',
              'La Valeur n est visible qu une seule fois. Si elle est perdue ou exposee, le secret doit etre supprime puis regenere.',
            ],
            code: `MICROSOFT_CLIENT_ID=public
MICROSOFT_TENANT_ID=public
MICROSOFT_CLIENT_SECRET=secret serveur

Interdits:
variable front exposant le secret Microsoft
localStorage pour refresh tokens
secret Graph dans un bundle React`,
          },
          {
            title: 'Ce qui reste a produire',
            body: [
              'La prochaine etape n est pas de refaire Azure. Elle consiste a creer la couche produit: stockage serveur des tokens, refresh controle, synchronisation paginee, rattachement aux dossiers et protection RBAC.',
            ],
            bullets: [
              'Backend OAuth serveur ou Cloud Function dediee.',
              'Stockage de refresh tokens dans Secret Manager ou equivalent serveur, jamais en SQL brut.',
              'Table SQL future Email / EmailAttachment / EmailLink si le module devient persistant.',
              'Job de synchronisation incremental avec delta tokens Graph.',
              'UI emails reliee aux clients/chantiers/factures existants.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sql-connect',
    number: '02',
    title: 'SQL Connect, PostgreSQL et source de verite metier',
    shortTitle: 'SQL',
    lead:
      'SQL Connect est la cible de persistance metier. Le front React passe par le SDK genere, les queries/mutations Data Connect et Cloud SQL PostgreSQL.',
    icon: Database,
    status: 'Deploy sandbox Data Connect reussi, front encore hybride',
    sources: [
      'dataconnect/schema/schema.gql',
      'dataconnect/sosson/queries.gql',
      'dataconnect/sosson/mutations.gql',
      'dataconnect/sosson/connector.yaml',
      'docs/05-sql-connect.md',
      'src/dataconnect-generated/',
      'src/dataconnect-admin-generated/',
    ],
    commands: [
      'firebase deploy --only dataconnect --project sosson-sandbox',
      'firebase dataconnect:sdk:generate',
      'npm run checkpoint:002:local',
      'npm run checkpoint:002:emulator',
    ],
    sections: [
      {
        id: 'sql-role',
        title: 'Role de SQL Connect dans Sosson',
        summary: 'React ne parle pas directement a PostgreSQL; Data Connect est la couche contractuelle.',
        subsections: [
          {
            title: 'Flux technique',
            body: [
              'Les pages React utilisent des stores et adapters applicatifs. Ces adapters appellent le SDK SQL Connect genere. Les operations autorisees sont decrites dans queries.gql et mutations.gql.',
              'Cette separation permet de garder un contrat type entre interface, operations serveur et schema relationnel.',
            ],
            code: `React page
  -> src/lib/store.tsx ou src/features/*
  -> SDK SQL Connect genere
  -> dataconnect/sosson/queries.gql
  -> Firebase SQL Connect
  -> Cloud SQL PostgreSQL fdcdb`,
          },
          {
            title: 'Regles de maintenance',
            body: [
              'Les SDKs generes ne se modifient jamais a la main. Toute evolution part du schema ou des operations GraphQL, puis regenere le SDK.',
              'La sandbox passe avant la production. Une operation production n est pas validee tant que la sandbox n a pas prouve le deploy, le seed, les roles et les smoke tests.',
            ],
            bullets: [
              'Source de verite types: dataconnect/schema/schema.gql.',
              'Source de verite lectures: dataconnect/sosson/queries.gql.',
              'Source de verite ecritures: dataconnect/sosson/mutations.gql.',
              'Generated: src/dataconnect-generated et src/dataconnect-admin-generated.',
            ],
          },
        ],
      },
      {
        id: 'sql-schema',
        title: 'Schema metier courant',
        summary: 'Les tables couvrent le noyau operationnel, les documents et le previsionnel importe.',
        subsections: [
          {
            title: 'Tables operationnelles',
            body: [
              'Le coeur metier est volontairement simple: User, Client, Chantier et Facture. Les champs derives comme marge, depenses agregees ou tendances se calculent depuis les relations et les factures.',
            ],
            bullets: [
              'User: profil applicatif interne lie au Firebase Auth UID.',
              'Client: client final, operationnel ou historique importe.',
              'Chantier: dossier rattache a un client, operationnel ou previsionnel.',
              'Facture: facture fournisseur rattachee a un chantier.',
            ],
          },
          {
            title: 'Tables documents et previsionnel',
            body: [
              'Les documents separent les fichiers binaires Storage de leurs metadata SQL. Le previsionnel separe le batch d import, les exercices, les alias clients, les lignes, les montants mensuels, les montants par lot et les cellules modifiees.',
            ],
            bullets: [
              'DocumentFolder et DocumentAttache pour le rangement documentaire.',
              'PrevisionnelImportBatch et PrevisionnelExercise pour tracer les imports.',
              'ClientAlias pour conserver les noms Excel originaux.',
              'PrevisionnelLine, PrevisionnelMonthlyAmount, PrevisionnelLotAmount et PrevisionnelCellEdit pour reconstruire l historique et l export.',
            ],
          },
        ],
      },
      {
        id: 'sql-front',
        title: 'Integration front progressive',
        summary: 'Le front est branche partiellement a SQL Connect, avec fallback local encore present.',
        subsections: [
          {
            title: 'Etat actuel des pages',
            body: [
              'Le store principal peut lire clients, chantiers et factures depuis SQL Connect quand disponible. En cas d indisponibilite ou d auth absente, le front retombe encore sur les donnees locales ou derivees du previsionnel.',
              'Le profil applicatif utilisateur tente GetCurrentUser avant le fallback Firestore transitoire.',
            ],
            evidence: [
              'src/lib/auth.ts tente SQL User via GetCurrentUser.',
              'src/lib/store.tsx reste le point de transition principal.',
              'src/pages/PrevisionnelPage.tsx et src/pages/StatistiquesPage.tsx lisent maintenant SQL quand disponible.',
            ],
          },
          {
            title: 'Fin de la phase hybride',
            body: [
              'La suite produit doit reduire progressivement les fallbacks. Un fallback local utile en developpement ne doit pas masquer une sandbox vide ou mal provisionnee.',
            ],
            bullets: [
              'Provisionner les vrais User SQL sandbox.',
              'Valider les mutations RBAC sur sandbox.',
              'Remplacer les pages metier locales par hooks/adapters SQL Connect.',
              'Garder les donnees Excel comme historique et non comme source operationnelle.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'securite',
    number: '03',
    title: 'Securite, Auth, roles et secrets',
    shortTitle: 'Securite',
    lead:
      'Firebase Auth prouve l identite. SQL User porte le role applicatif. Les secrets restent cote serveur. Les mutations sensibles verifient le role serveur.',
    icon: ShieldCheck,
    status: 'RBAC serveur implemente localement, validation sandbox restante',
    sources: [
      'docs/10-securite.md',
      'src/lib/accessControl.ts',
      'src/features/auth/sqlUserProfile.ts',
      'scripts/check-auth-safety.mjs',
      'scripts/check-front-secrets.mjs',
      'scripts/check-dataconnect-auth-invariants.mjs',
      'firestore.rules',
      'storage.rules',
    ],
    commands: [
      'npm run check:front-secrets',
      'npm run check:auth-safety',
      'npm run check:dataconnect-auth',
      'npm run verify:dataconnect:rbac',
    ],
    sections: [
      {
        id: 'security-identity',
        title: 'Identite et profil applicatif',
        summary: 'La connexion et le role ne sont pas la meme chose.',
        subsections: [
          {
            title: 'Modele retenu',
            body: [
              'Firebase Auth repond a la question qui est connecte. La table SQL User repond a la question ce que cet utilisateur a le droit de faire dans Sosson.',
              'Le role ne doit pas etre choisi par le navigateur. Il est provisionne par un script admin et lu par les queries/mutations SQL Connect.',
            ],
            code: `Firebase Auth UID
  -> User.id dans SQL
  -> role gerant | assistante | chef_chantier | ouvrier
  -> checks serveur sur mutations sensibles`,
          },
          {
            title: 'Fallbacks autorises',
            body: [
              'Firestore users/{uid} reste seulement un fallback transitoire du profil applicatif. Le fallback local seed est reserve au dev local opt-in et ne doit pas etre actif en sandbox/production.',
            ],
            bullets: [
              'SQL User est la cible.',
              'Firestore profil est transitoire.',
              'localStorage ne porte jamais une autorisation.',
              'Le navigateur ne cree pas son propre role.',
            ],
          },
        ],
      },
      {
        id: 'security-rbac',
        title: 'RBAC SQL Connect',
        summary: 'Les mutations sensibles combinent auth Firebase et verification SQL User.',
        subsections: [
          {
            title: 'Principe serveur',
            body: [
              'Les operations sensibles demandent un utilisateur Firebase authentifie, puis relisent le User SQL correspondant a auth.uid pour verifier le role.',
              'Cette regle empeche un client modifie de forger un role ou d appeler une mutation d administration sans profil SQL valide.',
            ],
            bullets: [
              '@auth(level: USER) sur operations sensibles.',
              'Sous-lecture SQL User(id = auth.uid).',
              '@check sur role pour les actions protegees.',
              'Script admin pour provisionner User, pas mutation client publique.',
            ],
          },
          {
            title: 'Validation attendue',
            body: [
              'Le local prouve la structure. La sandbox doit encore prouver les vrais comptes Firebase, les vrais UID, les vrais roles et les erreurs attendues en cas de role insuffisant.',
            ],
            procedure: [
              'Verifier Firebase Auth sandbox et les UID reels.',
              'Preparer dataconnect/user_profiles.example.json puis un fichier local non commite.',
              'Lancer le dry-run de provision SQL User.',
              'Executer la provision avec validation humaine.',
              'Tester GetCurrentUser depuis le front sandbox.',
              'Tester une mutation autorisee et une mutation refusee.',
            ],
          },
        ],
      },
      {
        id: 'security-secrets',
        title: 'Secrets et front',
        summary: 'Aucun secret ne doit entrer dans le bundle Vite.',
        subsections: [
          {
            title: 'Regle Vite',
            body: [
              'Toute variable prefixee VITE_ peut etre exposee dans le navigateur. Les identifiants publics peuvent y vivre. Les secrets OAuth, refresh tokens, cles privees et mots de passe ne le peuvent pas.',
            ],
            code: `OK cote front:
VITE_FIREBASE_API_KEY
VITE_MICROSOFT_CLIENT_ID

Interdit:
variable front contenant SECRET
variable front contenant REFRESH ou TOKEN
cle service account exposee au navigateur`,
          },
          {
            title: 'Garde-fous existants',
            body: [
              'Le repo contient des checks statiques pour eviter les erreurs les plus dangereuses: secrets front, auth locale ouverte, usage Firestore hors limites, rules Firebase incoherentes et garde-fous production.',
            ],
            evidence: [
              'npm run check:front-secrets',
              'npm run check:auth-safety',
              'npm run check:firestore-boundary',
              'npm run check:production-guard',
              'npm run check:sandbox-guardrails',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'previsionnel',
    number: '04',
    title: 'Previsionnel Excel, clients historiques et statistiques',
    shortTitle: 'Previsionnel',
    lead:
      'Le classeur Excel historique devient une source d import controlee. Les donnees utiles alimentent SQL Connect sans remplacer les listes operationnelles.',
    icon: Table2,
    status: 'Parser et seed local presents, injection sandbox a valider',
    sources: [
      'dataconnect/previsionnel_seed_data.gql',
      'dataconnect/previsionnel_seed/*.gql',
      'scripts/generate-previsionnel-seed.mjs',
      'scripts/verify-previsionnel-dataconnect-local.mjs',
      'src/pages/PrevisionnelPage.tsx',
      'src/pages/StatistiquesPage.tsx',
      'docs/previsionnel-tableur-audit.md',
    ],
    commands: [
      'npm run seed:previsionnel:generate',
      'npm run seed:previsionnel:dataconnect',
      'npm run verify:previsionnel:dataconnect',
      'npm run verify:previsionnel:clients',
    ],
    sections: [
      {
        id: 'prev-source',
        title: 'Source Excel et interpretation',
        summary: 'Le classeur est une archive metier, pas le modele direct de l application.',
        subsections: [
          {
            title: 'Volume audite',
            body: [
              `Le seed previsionnel courant couvre ${previsionnelDocSnapshot.auditedSheets} exercices, ${previsionnelDocSnapshot.clientCount} clients, ${previsionnelDocSnapshot.aliasCount} alias, ${previsionnelDocSnapshot.chantierCount} chantiers historiques, ${previsionnelDocSnapshot.monthlyAmounts} montants mensuels et ${previsionnelDocSnapshot.lotAmounts} montants par lot.`,
              'Les lignes de synthese Excel comme Cumul et Total sont exclues. Le jaune Excel signifie facture envoyee, pas facture payee ni encaissee.',
            ],
            code: `workbook: ${previsionnelDocSnapshot.workbook}
structure: ${previsionnelDocSnapshot.latestStructureSheet}
trace: sourceSheet + sourceRow
origineImport: previsionnel`,
          },
          {
            title: 'Rapprochement clients',
            body: [
              'Les noms du classeur sont rapproches en clients canoniques, tout en conservant les alias originaux. Cela permet de consolider l historique sans perdre la facon dont l entreprise nommait les dossiers dans Excel.',
            ],
            bullets: [
              'Client porte origineImport operationnel ou previsionnel.',
              'ClientAlias conserve les libelles Excel.',
              'Chantier historique garde sourceSheet et sourceRow.',
              'Les listes operationnelles filtrent origineImport = operationnel.',
            ],
          },
        ],
      },
      {
        id: 'prev-ui',
        title: 'Pages previsionnel et statistiques',
        summary: 'Les pages lisent SQL quand disponible et gardent un fallback TS nettoye.',
        subsections: [
          {
            title: 'PrevisionnelPage',
            body: [
              'La page charge les valeurs 2025-26 depuis SQL Connect quand disponible. Le bouton Sauvegarder SQL met a jour les montants mensuels et enregistre les cellules modifiees pour conserver un export Excel exact.',
            ],
            evidence: [
              'UpdatePrevisionnelMonthlyAmount pour les montants mensuels.',
              'UpsertPrevisionnelCellEdit pour les cellules modifiees.',
              'Fallback localStorage conserve quand SQL Connect est indisponible.',
            ],
          },
          {
            title: 'StatistiquesPage',
            body: [
              'La page tente de lire les exercices et les lignes courantes depuis SQL Connect. Si SQL Connect ou l auth ne repond pas, elle retombe sur les donnees TS nettoyees.',
            ],
            bullets: [
              'CA previsionnel et realise.',
              'Ventilation par lots.',
              'Lecture des exercices.',
              'Graphes lies aux sources chiffrees.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'documents',
    number: '05',
    title: 'Documents, factures et Firebase Storage',
    shortTitle: 'Documents',
    lead:
      'Les fichiers binaires doivent vivre dans Firebase Storage. SQL garde les metadata, les liens aux chantiers, les types MIME et les chemins canoniques.',
    icon: FolderOpen,
    status: 'Metadata SQL preparee, upload signe encore a produire',
    sources: [
      'src/pages/DocumentsPage.tsx',
      'src/features/documents/',
      'src/features/documents/storagePaths.test.ts',
      'scripts/check-document-storage-boundary.mjs',
      'storage.rules',
      'dataconnect/schema/schema.gql',
    ],
    commands: ['npm run test:documents', 'npm run check:document-storage', 'npm run check:firebase-rules'],
    sections: [
      {
        id: 'docs-model',
        title: 'Modele documentaire',
        summary: 'Un fichier n est pas seulement un blob: il a un contexte metier.',
        subsections: [
          {
            title: 'Separation binaire et metadata',
            body: [
              'Storage porte les octets: PDF, photos, exports, pieces jointes. SQL porte le sens: chantier, client, facture, dossier, nom lisible, MIME, taille, chemin Storage et auteur.',
            ],
            bullets: [
              'DocumentFolder structure les dossiers.',
              'DocumentAttache garde les metadata SQL.',
              'Les chemins pending-documents/... restent une zone d attente front.',
              'Aucune lecture publique du bucket ne doit etre ouverte.',
            ],
          },
          {
            title: 'Factures fournisseurs',
            body: [
              'Une facture fournisseur doit finir rattachee a un chantier. Le document PDF peut exister comme fichier, mais la facture metier doit vivre dans SQL avec son statut, son montant, son fournisseur et son chantier.',
            ],
            callout: {
              title: 'Front actuel',
              body:
                'L effet ajout de facture met encore a jour le state React local. La persistence SQL complete reste une etape produit a finaliser.',
            },
          },
        ],
      },
      {
        id: 'docs-security',
        title: 'Securite Storage',
        summary: 'Le pattern cible est URL signee serveur, pas upload anonyme.',
        subsections: [
          {
            title: 'Pattern cible',
            body: [
              'Le front demande une URL d upload. Le backend verifie auth, role, ACL chantier, MIME et taille. Storage recoit ensuite le fichier directement via URL signee courte.',
            ],
            procedure: [
              'Le client prepare nom, type MIME, taille et entite cible.',
              'Le backend verifie les droits et calcule le chemin canonique.',
              'Le backend emet une URL signee PUT courte.',
              'Le navigateur upload directement vers Storage.',
              'Un finalize ou une mutation confirme les metadata SQL.',
            ],
          },
          {
            title: 'Checks existants',
            body: [
              'Des tests et checks verifient deja que les chemins et limites documentaires ne se dispersent pas dans le front.',
            ],
            evidence: [
              'test:documents couvre les chemins Storage.',
              'check:document-storage surveille les frontieres documentaires.',
              'storage.rules est actuellement ferme par defaut dans le repo.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'front',
    number: '06',
    title: 'Frontend React, navigation et etat applicatif',
    shortTitle: 'Front',
    lead:
      'Le front React/Vite est le squelette produit existant. Il couvre deja les ecrans principaux mais plusieurs pages restent hybrides entre SQL, seeds et donnees locales.',
    icon: MonitorCheck,
    status: 'Application utilisable, migration SQL progressive',
    sources: [
      'src/App.tsx',
      'src/components/layout/AppLayout.tsx',
      'src/lib/store.tsx',
      'src/lib/auth.ts',
      'src/pages/*.tsx',
      'docs/07-frontend-state.md',
    ],
    commands: ['npm run dev', 'npm run lint', 'npm run build:sandbox'],
    sections: [
      {
        id: 'front-pages',
        title: 'Pages existantes',
        summary: 'Sosson est deja une application, pas seulement une maquette.',
        subsections: [
          {
            title: 'Ecrans couverts',
            body: [
              'Le front contient login, dashboard, chantiers, detail chantier, clients, factures, emails, documents, planning, previsionnel, statistiques, equipe et documentation.',
            ],
            bullets: [
              'DashboardPage: vision operationnelle.',
              'ChantiersPage et ChantierDetailPage: suivi des dossiers.',
              'ClientsPage et ClientDetailPage: portefeuille client.',
              'FacturesPage: factures fournisseurs.',
              'DocumentsPage: gestion documentaire.',
              'EmailsPage: surface mail encore a raccorder au module Graph.',
            ],
          },
          {
            title: 'Layout et design Sosson',
            body: [
              'L identite courante est Orange chantier, Anthracite et Ivoire. Les anciens verts ne doivent plus reapparaitre. Les pages produit doivent rester denses, lisibles et operationnelles.',
            ],
            bullets: [
              'Fond #FAF6F2 ou #FFFFFF.',
              'Cartes rounded-[20px] et bord #F2E8DC.',
              'Un seul CTA orange par zone visible.',
              'Lucide stroke fin et Inter partout.',
            ],
          },
        ],
      },
      {
        id: 'front-state',
        title: 'Etat applicatif et fallbacks',
        summary: 'Le front doit afficher une verite claire: SQL, fallback ou donnees locales.',
        subsections: [
          {
            title: 'Sources de donnees',
            body: [
              'Le store principal gere encore plusieurs sources. C est acceptable pendant la transition, mais l UI doit eviter de faire croire qu une donnee locale est deja une donnee sandbox persistante.',
            ],
            bullets: [
              'Firebase Auth si la configuration existe.',
              'SQL Connect pour les entites metier quand disponible.',
              'Donnees TS/previsionnel nettoyees comme fallback.',
              'localStorage pour brouillons, pas pour autorisation.',
            ],
          },
          {
            title: 'Direction produit',
            body: [
              'Chaque page doit migrer vers un adapter SQL Connect clair, avec etat loading, erreur, empty, fallback et source affichee quand necessaire.',
            ],
            evidence: [
              'scripts/check-page-dataconnect-imports.mjs surveille les imports de pages.',
              'scripts/audit-frontend-sources.mjs audite les sources front.',
              'tests data-state existent pour stabiliser la lecture des sources.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'parcours-produit',
    number: '07',
    title: 'Parcours produit: dashboard, chantiers, clients et operations',
    shortTitle: 'Parcours produit',
    lead:
      'Ce chapitre transforme la documentation technique en mode d emploi concret des ecrans Sosson: quoi regarder, quoi faire et quelle source de donnees se trouve derriere chaque page.',
    icon: UsersRound,
    status: 'Couverture produit ajoutee, raccord SQL a poursuivre page par page',
    sources: [
      'src/pages/DashboardPage.tsx',
      'src/pages/ChantiersPage.tsx',
      'src/pages/ChantierDetailPage.tsx',
      'src/pages/ClientsPage.tsx',
      'src/pages/ClientDetailPage.tsx',
      'src/pages/FacturesPage.tsx',
      'src/pages/EmailsPage.tsx',
      'src/pages/PlanningPage.tsx',
      'docs/07-frontend-state.md',
    ],
    commands: ['npm run audit:frontend-sources', 'npm run check:page-dataconnect-imports', 'npm run test:data-state'],
    sections: [
      {
        id: 'product-dashboard',
        title: 'Dashboard et pilotage quotidien',
        summary: 'Le dashboard doit repondre a la question: ou est l attention du jour ?',
        subsections: [
          {
            title: 'Lecture attendue',
            body: [
              'Le dashboard sert au gerant et a l assistante pour voir les chantiers actifs, les factures a surveiller, les alertes de budget et les dossiers qui demandent une action.',
              'Une bonne documentation dashboard explique comment lire un indicateur, d ou vient la donnee et ce qu il faut faire quand le chiffre semble faux.',
            ],
            bullets: [
              'Verifier la source: SQL si disponible, fallback si sandbox non alimentee.',
              'Cliquer vers le chantier ou la facture au lieu de traiter un chiffre isole.',
              'Comparer previsionnel, realise et statut facture avant de conclure sur la marge.',
              'Ne pas confondre donnees historiques Excel et chantiers operationnels.',
            ],
          },
          {
            title: 'Erreurs frequentes',
            body: [
              'Un dashboard peut donner une impression de certitude excessive. Sosson doit afficher ou documenter les cas ou les donnees viennent encore d un fallback ou d un seed local.',
            ],
            callout: {
              title: 'Regle produit',
              body:
                'Un indicateur operationnel doit toujours pouvoir etre relie a une entite: client, chantier, facture, document ou ligne previsionnelle.',
            },
          },
        ],
      },
      {
        id: 'product-chantiers',
        title: 'Chantiers et details de dossier',
        summary: 'Le chantier est le centre de gravite operationnel.',
        subsections: [
          {
            title: 'Retrouver un chantier',
            body: [
              'La liste chantiers doit permettre de filtrer les dossiers actifs, de distinguer operationnel et historique previsionnel, puis d ouvrir une fiche detail sans perdre le contexte client.',
            ],
            procedure: [
              'Ouvrir la page Chantiers.',
              'Filtrer par statut, client ou recherche texte.',
              'Verifier si le chantier est operationnel ou issu du previsionnel.',
              'Ouvrir la fiche detail.',
              'Controler les factures, documents, emails rattaches et indicateurs budgetaires.',
            ],
          },
          {
            title: 'Fiche chantier',
            body: [
              'La fiche detail doit devenir la page qui regroupe le dossier vivant: client, budget, factures, documents, mails, planning et historique. La documentation doit donc expliquer les liens entre ces modules.',
            ],
            bullets: [
              'Client: proprietaire du dossier.',
              'Factures: depenses fournisseurs et statut.',
              'Documents: PDF, photos, pieces rattachees.',
              'Emails: conversations a relier au dossier.',
              'Planning: interventions et equipe si le module est branche.',
            ],
          },
        ],
      },
      {
        id: 'product-clients-factures',
        title: 'Clients, factures et correction metier',
        summary: 'Les clients et factures sont les objets que l equipe corrigera le plus souvent.',
        subsections: [
          {
            title: 'Client canonique et alias',
            body: [
              'Un client peut apparaitre sous plusieurs noms dans Excel, dans un email ou dans un document fournisseur. Sosson doit garder un client canonique tout en conservant les alias historiques pour l audit.',
            ],
            bullets: [
              'Ne pas creer un doublon client si un alias existe deja.',
              'Rattacher les chantiers historiques au client canonique quand le rapprochement est confirme.',
              'Garder l alias source pour comprendre l historique Excel.',
            ],
          },
          {
            title: 'Rattacher une facture',
            body: [
              'Une facture fournisseur utile doit etre reliee a un chantier. Tant que le flux document complet n est pas fini, l equipe doit distinguer l ajout visuel local, la metadata SQL et le futur binaire Storage.',
            ],
            procedure: [
              'Identifier le fournisseur et le montant.',
              'Choisir le chantier concerne.',
              'Verifier le statut facture.',
              'Joindre le PDF dans le flux document quand l upload signe sera pret.',
              'Controler que la depense remonte dans la fiche chantier et les statistiques.',
            ],
          },
        ],
      },
      {
        id: 'product-mails-planning',
        title: 'Emails, planning et equipe',
        summary: 'Ces pages doivent connecter la communication et l execution terrain.',
        subsections: [
          {
            title: 'Email sans chantier',
            body: [
              'Un email entrant peut ne pas etre rattachable automatiquement. La documentation produit doit prevoir un traitement humain simple: qualifier, rattacher, ignorer ou transformer en document.',
            ],
            procedure: [
              'Lire expediteur, objet et pieces jointes.',
              'Chercher un client ou un chantier probable.',
              'Rattacher manuellement si la correspondance est sure.',
              'Classer comme non rattache si le doute reste.',
              'Transformer la piece jointe en document ou facture si elle porte une preuve utile.',
            ],
          },
          {
            title: 'Planning et equipe',
            body: [
              'Le planning et l equipe sont des surfaces d execution. La documentation doit expliquer qui voit quoi, comment les affectations se relient aux chantiers et quelles actions restent locales ou futures.',
            ],
            bullets: [
              'Planning: intervention, chantier, equipe et date.',
              'Equipe: profil interne, role et permissions.',
              'Chef chantier: futur perimetre restreint aux dossiers assignes.',
              'Gerant/assistante: pilotage complet selon RBAC serveur.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'exploitation',
    number: '08',
    title: 'Sandbox, checkpoints, seeds et exploitation',
    shortTitle: 'Exploitation',
    lead:
      'La sandbox est le passage obligatoire avant production. Les checkpoints doivent produire des preuves, pas seulement un sentiment que le code marche.',
    icon: TerminalSquare,
    status: 'Checkpoint local prepare, actions sandbox humaines restantes',
    sources: [
      'docs/10-runbooks.md',
      'docs/13-checkpoint-002-readiness.md',
      'docs/15-checkpoint-002-sandbox-execution.md',
      'scripts/checkpoint-002-local.mjs',
      'scripts/checkpoint-002-emulator.mjs',
      'scripts/seed-dataconnect-sandbox.mjs',
      'deploy/dashboard.mjs',
    ],
    commands: [
      'npm run checkpoint:002:local',
      'npm run emulators:dataconnect',
      'npm run checkpoint:002:emulator',
      'npm run seed:sandbox -- --dry-run --kind=previsionnel --output=tmp/checkpoint-002/seed-sandbox-dry-run.json',
      'npm run dashboard',
    ],
    sections: [
      {
        id: 'ops-env',
        title: 'Environnements',
        summary: 'Sandbox d abord, production ensuite.',
        subsections: [
          {
            title: 'Firebase projects',
            body: [
              'Le projet Firebase par defaut est sosson-sandbox. L alias prod pointe vers sosson-prod. Une action production demande une validation specifique et ne doit pas etre deduite d un test local reussi.',
            ],
            code: `.firebaserc
default -> sosson-sandbox
prod    -> sosson-prod

Data Connect sandbox:
region   europe-west9
service  sosson-sandbox-service
instance sosson-sandbox-instance
database fdcdb`,
          },
          {
            title: 'Fichiers d environnement',
            body: [
              'Le repo distingue sandbox, production et local. Les fichiers exemples guident les variables publiques. Les secrets reels restent locaux ou serveur.',
            ],
            bullets: ['.env.sandbox', '.env.production', '.env.example', '.env.local non commite pour secrets locaux'],
          },
        ],
      },
      {
        id: 'ops-checkpoints',
        title: 'Checkpoint 002',
        summary: 'Le checkpoint ne vaut que si chaque preuve couvre une exigence reelle.',
        subsections: [
          {
            title: 'Preflight local',
            body: [
              'Le preflight local lance les checks CI, les audits front, le dry-run du seed sandbox et le dry-run provisioning SQL User. Il ne touche pas la sandbox distante.',
            ],
            procedure: [
              'Executer npm run checkpoint:002:local.',
              'Lire les artefacts produits sous tmp/checkpoint-002.',
              'Corriger les erreurs locales avant sandbox.',
              'Ne pas declarer la sandbox validee sur la seule base du preflight local.',
            ],
          },
          {
            title: 'Execution sandbox reelle',
            body: [
              'La sandbox reelle demande des actions explicites: deploy rules, deploy Data Connect, seed reel, provisioning User avec vrais UID, comptage, RBAC et smoke manuel.',
            ],
            bullets: [
              'ALLOW_SANDBOX_DATACONNECT_SEED=true requis pour seed reel.',
              '--sandbox et --yes-sandbox requis pour eviter une execution accidentelle.',
              'counts-sandbox.json doit etre archive.',
              'GetCurrentUser doit fonctionner avec un vrai compte Firebase Auth.',
            ],
          },
        ],
      },
      {
        id: 'ops-costs',
        title: 'Couts et monitoring',
        summary: 'Le cout fixe principal sera Cloud SQL; les fichiers et IA seront les variables a surveiller.',
        subsections: [
          {
            title: 'Strategie cout bas',
            body: [
              'Sosson est un outil interne mono-PME. L architecture doit eviter les surcouts SaaS multi-tenant et garder les traitements lourds sous controle.',
            ],
            bullets: [
              'Cloud SQL production 24/7 seulement quand la sandbox est stable.',
              'Emulateurs et local autant que possible.',
              'Photos: thumbnails et HD a la demande.',
              'Storage Archive pour chantiers clos.',
              'Budgets GCP avec seuils 50/80/100/150/200%.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'roadmap',
    number: '09',
    title: 'Roadmap, agents IA et maintenance du livre',
    shortTitle: 'Roadmap',
    lead:
      'Cette documentation doit rester un livre vivant: chaque chantier technique ajoute un chapitre, une procedure, des preuves et les limites encore ouvertes.',
    icon: Route,
    status: 'Structure livre creee, enrichissement continu attendu',
    sources: [
      'docs/09-roadmap.md',
      'docs/12-ai-agent-roadmap.md',
      'docs/14-objective-completion-audit.md',
      'AGENTS.md',
      'documentation.md',
      'docs/00-index.md',
    ],
    commands: ['npm run check:doc-entrypoints', 'npm run check:doc-links', 'npm run ci:sandbox'],
    sections: [
      {
        id: 'roadmap-agents',
        title: 'Equipe de redaction IA et equipe technique',
        summary: 'La page doit agreger plusieurs angles: produit, architecture, securite, front, exploitation.',
        subsections: [
          {
            title: 'Roles editoriaux',
            body: [
              'Pour garder une documentation riche, chaque chapitre doit etre relu comme si une equipe specialisee contribuait: redacteur produit, architecte SQL, securite/RBAC, front UX, exploitation sandbox et support utilisateur.',
            ],
            bullets: [
              'Redaction produit: pourquoi le sujet existe et quel workflow il sert.',
              'Equipe tech: fichiers, commandes, limites et contrats.',
              'Equipe securite: secrets, roles, scopes, risques.',
              'Equipe exploitation: preuves, runbooks, rollback et statut sandbox.',
              'Equipe UX: lisibilite, navigation, sections et sous-sections.',
            ],
          },
          {
            title: 'Definition d un chapitre complet',
            body: [
              'Un chapitre Sosson ne doit pas etre un paragraphe isole. Il doit contenir contexte, etat reel, procedure, sources du repo, commandes, risques, prochaines etapes et statut de validation.',
            ],
            procedure: [
              'Nommer le chapitre par domaine metier ou technique.',
              'Lister les sections lisibles dans la timeline.',
              'Ajouter des sous-sections concretes.',
              'Citer fichiers et commandes maintenables.',
              'Distinguer implemente, valide localement, a valider sandbox et futur.',
              'Ajouter un gate de verification quand une action peut etre dangereuse.',
            ],
          },
        ],
      },
      {
        id: 'roadmap-next',
        title: 'Prochains chapitres a enrichir',
        summary: 'La structure accepte plus de matiere sans rendre la navigation illisible.',
        subsections: [
          {
            title: 'Priorites de contenu',
            body: [
              'Les prochains enrichissements devraient suivre l ordre produit: finaliser les profils SQL User, valider RBAC sandbox, brancher les pages metier SQL, puis construire le module email produit sur la preuve Graph.',
            ],
            bullets: [
              'Chapitre mails: delta sync Graph, tables Email, rattachements et pieces jointes.',
              'Chapitre SQL: exemples complets de queries/mutations par page.',
              'Chapitre securite: runbook de rotation secrets et de depart employe.',
              'Chapitre documents: upload signe complet et scan fichiers.',
              'Chapitre exploitation: smoke tests sandbox et rollback.',
            ],
          },
        ],
      },
    ],
  },
]

const editorialTeam = [
  ['Produit', 'Transforme les besoins terrain en chapitres lisibles.'],
  ['Tech SQL', 'Relie chaque explication au schema, aux queries et aux mutations.'],
  ['Securite', 'Verifie les roles, secrets, scopes et limites de production.'],
  ['Front UX', 'Organise la lecture longue, les etats et la navigation.'],
  ['Exploitation', 'Ajoute commandes, gates, preuves et runbooks sandbox.'],
]

function subSectionId(chapter: DocChapter, section: DocSection, index: number) {
  return `${chapter.id}-${section.id}-sub-${index + 1}`
}

function ChapterTitle({ chapter }: { chapter: DocChapter }) {
  const Icon = chapter.icon

  return (
    <div className="border-b border-[#F2E8DC] pb-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#1E1E1E] text-[13px] font-semibold text-white">
          {chapter.number}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#EADBC8] bg-white px-3 py-1 text-[12px] font-semibold text-[#6B6B6B]">
          <Icon className="h-3.5 w-3.5 text-[#F06B21]" />
          Chapitre {chapter.number}
        </span>
      </div>
      <h2 className="mt-5 max-w-3xl text-[30px] font-semibold leading-[1.12] text-[#1E1E1E]">{chapter.title}</h2>
      <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[#3C3C3C]">{chapter.lead}</p>
      <div className="mt-5 inline-flex items-center gap-2 rounded-[10px] border border-[#F2E8DC] bg-[#FAF6F2] px-3 py-2 text-[12px] font-semibold text-[#3C3C3C]">
        <CheckCircle2 className="h-4 w-4 text-[#F06B21]" />
        {chapter.status}
      </div>
    </div>
  )
}

function SourceList({ title, items, icon: Icon }: { title: string; items: string[]; icon: LucideIcon }) {
  return (
    <div className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
      <div className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B6B6B]">
        <Icon className="h-4 w-4 text-[#F06B21]" />
        {title}
      </div>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item} className="rounded-[10px] border border-[#F2E8DC] bg-[#FAF6F2] px-3 py-2 font-mono text-[12px] leading-5 text-[#3C3C3C]">
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

function TextList({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  const Tag = ordered ? 'ol' : 'ul'

  return (
    <Tag className={`${ordered ? 'list-decimal' : 'list-disc'} mt-4 space-y-2 pl-5 text-[14px] leading-6 text-[#3C3C3C]`}>
      {items.map(item => (
        <li key={item}>{item}</li>
      ))}
    </Tag>
  )
}

function SubSectionBlock({ id, subSection, isActive }: { id: string; subSection: DocSubSection; isActive: boolean }) {
  return (
    <div
      id={id}
      className={`scroll-mt-28 rounded-[20px] border bg-white p-5 transition-all duration-300 ${
        isActive ? 'border-[#F06B21]/45 shadow-[0_14px_34px_rgba(30,30,30,0.08)]' : 'border-[#F2E8DC]'
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 rounded-full transition-all duration-300 ${
            isActive ? 'w-8 bg-[#F06B21]' : 'w-2.5 bg-[#EADBC8]'
          }`}
        />
        <h4 className={`text-[16px] font-semibold transition-colors duration-300 ${isActive ? 'text-[#F06B21]' : 'text-[#1E1E1E]'}`}>
          {subSection.title}
        </h4>
      </div>
      <div className="mt-3 space-y-3">
        {subSection.body.map(paragraph => (
          <p key={paragraph} className="text-[14px] leading-7 text-[#3C3C3C]">
            {paragraph}
          </p>
        ))}
      </div>
      {subSection.bullets ? <TextList items={subSection.bullets} /> : null}
      {subSection.procedure ? <TextList items={subSection.procedure} ordered /> : null}
      {subSection.code ? (
        <pre className="mt-4 overflow-x-auto rounded-[14px] border border-[#2F2F2F] bg-[#1E1E1E] p-4 font-mono text-[12px] leading-6 text-white">
          {subSection.code}
        </pre>
      ) : null}
      {subSection.evidence ? (
        <div className="mt-4 grid gap-2">
          {subSection.evidence.map(item => (
            <div key={item} className="flex gap-2 rounded-[10px] border border-[#F2E8DC] bg-[#FAF6F2] px-3 py-2 text-[13px] leading-5 text-[#3C3C3C]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#F06B21]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      ) : null}
      {subSection.callout ? (
        <div className="mt-4 rounded-[14px] border border-[#F06B21]/30 bg-[#FFF4EC] p-4">
          <p className="text-[13px] font-semibold text-[#1E1E1E]">{subSection.callout.title}</p>
          <p className="mt-2 text-[13px] leading-6 text-[#3C3C3C]">{subSection.callout.body}</p>
        </div>
      ) : null}
    </div>
  )
}

function SectionBlock({
  chapter,
  section,
  activeSection,
  activeSubSection,
}: {
  chapter: DocChapter
  section: DocSection
  activeSection: string
  activeSubSection: string
}) {
  const sectionId = `${chapter.id}-${section.id}`
  const isCurrentSection = activeSection === sectionId

  return (
    <section id={sectionId} className="scroll-mt-24">
      <div
        className={`mb-4 flex items-start gap-3 rounded-[16px] p-3 transition-all duration-500 ${
          isCurrentSection ? 'bg-[#FFF4EC] shadow-[0_10px_28px_rgba(240,107,33,0.10)]' : 'bg-transparent'
        }`}
      >
        <div
          className={`mt-1 rounded-full transition-all duration-300 ${
            isCurrentSection ? 'h-9 w-2 bg-[#F06B21]' : 'h-2.5 w-2.5 bg-[#F06B21]'
          }`}
        />
        <div>
          <h3 className={`text-[20px] font-semibold transition-colors duration-300 ${isCurrentSection ? 'text-[#F06B21]' : 'text-[#1E1E1E]'}`}>
            {section.title}
          </h3>
          <p className="mt-2 text-[14px] leading-6 text-[#6B6B6B]">{section.summary}</p>
        </div>
      </div>
      <div className="grid gap-4">
        {section.subsections.map((subSection, index) => {
          const id = subSectionId(chapter, section, index)
          return (
            <SubSectionBlock
              key={subSection.title}
              id={id}
              subSection={subSection}
              isActive={activeSubSection === id}
            />
          )
        })}
      </div>
    </section>
  )
}

export function SossonDocsPage() {
  const [active, setActive] = useState(docChapters[0].id)
  const [activeSection, setActiveSection] = useState(`${docChapters[0].id}-${docChapters[0].sections[0].id}`)
  const [activeSubSection, setActiveSubSection] = useState(subSectionId(docChapters[0], docChapters[0].sections[0], 0))
  const timelineRef = useRef<HTMLElement | null>(null)
  const sectionNavRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const [timelineCursor, setTimelineCursor] = useState({ top: 0, height: 0, opacity: 0 })

  const counts = useMemo(
    () => ({
      chapters: docChapters.length,
      sections: docChapters.reduce((total, chapter) => total + chapter.sections.length, 0),
      subSections: docChapters.reduce(
        (total, chapter) => total + chapter.sections.reduce((sectionTotal, section) => sectionTotal + section.subsections.length, 0),
        0,
      ),
      sources: new Set(docChapters.flatMap(chapter => chapter.sources)).size,
    }),
    [],
  )

  useEffect(() => {
    const updateActiveTarget = () => {
      const chapterTargets = docChapters
        .map(chapter => document.getElementById(chapter.id))
        .filter((node): node is HTMLElement => Boolean(node))
      const sectionTargets = docChapters
        .flatMap(chapter => chapter.sections.map(section => document.getElementById(`${chapter.id}-${section.id}`)))
        .filter((node): node is HTMLElement => Boolean(node))
      const subSectionTargets = docChapters
        .flatMap(chapter =>
          chapter.sections.flatMap(section =>
            section.subsections.map((_, index) => document.getElementById(subSectionId(chapter, section, index))),
          ),
        )
        .filter((node): node is HTMLElement => Boolean(node))

      const pickCurrent = (nodes: HTMLElement[], offset: number) => {
        const passed = nodes
          .map(node => ({ id: node.id, top: node.getBoundingClientRect().top }))
          .filter(item => item.top <= offset)
          .sort((a, b) => b.top - a.top)[0]

        return passed?.id ?? nodes[0]?.id
      }

      const nextSection = pickCurrent(sectionTargets, 180)
      const nextSubSection = pickCurrent(subSectionTargets, 210)
      const nextChapterFromSection = docChapters.find(chapter => nextSection?.startsWith(`${chapter.id}-`))?.id
      const nextChapter = nextChapterFromSection ?? pickCurrent(chapterTargets, 160)

      if (nextChapter) setActive(nextChapter)
      if (nextSection) setActiveSection(nextSection)
      if (nextSubSection) setActiveSubSection(nextSubSection)
    }

    updateActiveTarget()
    window.addEventListener('scroll', updateActiveTarget, { passive: true })
    window.addEventListener('resize', updateActiveTarget)

    return () => {
      window.removeEventListener('scroll', updateActiveTarget)
      window.removeEventListener('resize', updateActiveTarget)
    }
  }, [])

  useEffect(() => {
    function updateTimelineCursor() {
      const navNode = timelineRef.current
      const activeNode = sectionNavRefs.current[activeSection]
      if (!navNode || !activeNode) {
        setTimelineCursor(cursor => ({ ...cursor, opacity: 0 }))
        return
      }

      const navRect = navNode.getBoundingClientRect()
      const activeRect = activeNode.getBoundingClientRect()
      setTimelineCursor({
        top: activeRect.top - navRect.top,
        height: activeRect.height,
        opacity: 1,
      })
    }

    const frame = window.requestAnimationFrame(updateTimelineCursor)
    window.addEventListener('resize', updateTimelineCursor)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateTimelineCursor)
    }
  }, [activeSection])

  const activeChapter = docChapters.find(chapter => chapter.id === active) ?? docChapters[0]
  const activeSectionData =
    activeChapter.sections.find(section => `${activeChapter.id}-${section.id}` === activeSection) ?? activeChapter.sections[0]
  const activeSubSectionData =
    activeSectionData.subsections.find((_, index) => subSectionId(activeChapter, activeSectionData, index) === activeSubSection) ??
    activeSectionData.subsections[0]

  return (
    <div className="min-h-full bg-[#FAF6F2] text-[#1E1E1E]">
      <div className="grid min-h-full gap-8 px-5 py-6 lg:px-6 xl:grid-cols-[300px_minmax(0,940px)_300px] xl:px-8">
        <aside className="hidden xl:block">
          <div className="sticky top-6">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B6B]">Timeline du livre</p>
            <nav ref={timelineRef} className="relative space-y-3">
              <div className="absolute bottom-0 left-[13px] top-0 z-0 w-px bg-[#EADBC8]" />
              <div
                className="pointer-events-none absolute left-9 right-0 z-0 rounded-[12px] bg-[#FFF4EC] shadow-[0_10px_28px_rgba(240,107,33,0.12)] transition-[transform,height,opacity] duration-500 ease-out"
                style={{
                  height: timelineCursor.height,
                  opacity: timelineCursor.opacity,
                  transform: `translateY(${timelineCursor.top}px)`,
                }}
              />
              {docChapters.map(chapter => (
                <div key={chapter.id} className="relative z-10">
                  <a href={`#${chapter.id}`} className="group flex items-center gap-3">
                    <span
                      className={`relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-[10px] text-[11px] font-semibold transition-all duration-300 ${
                        active === chapter.id
                          ? 'bg-[#F06B21] text-white shadow-[0_8px_20px_rgba(240,107,33,0.25)]'
                          : 'bg-[#FAF6F2] text-[#6B6B6B] ring-1 ring-[#EADBC8] group-hover:text-[#1E1E1E]'
                      }`}
                    >
                      {chapter.number}
                    </span>
                    <span className={`text-[13px] font-semibold transition-colors ${active === chapter.id ? 'text-[#1E1E1E]' : 'text-[#6B6B6B] group-hover:text-[#1E1E1E]'}`}>
                      {chapter.shortTitle}
                    </span>
                  </a>

                  <div className="ml-10 mt-2 space-y-1.5">
                    {chapter.sections.map((section, sectionIndex) => {
                      const sectionId = `${chapter.id}-${section.id}`
                      const isActiveSection = activeSection === sectionId
                      const isPastSection = active === chapter.id && sectionIndex < chapter.sections.findIndex(item => `${chapter.id}-${item.id}` === activeSection)

                      return (
                        <div key={section.id}>
                          <a
                            ref={node => {
                              sectionNavRefs.current[sectionId] = node
                            }}
                            href={`#${sectionId}`}
                            className={`group/section flex items-center gap-2 rounded-[10px] px-2 py-1 text-[11px] font-semibold transition-all duration-300 ${
                              isActiveSection
                                ? 'translate-x-1 text-[#F06B21]'
                                : active === chapter.id
                                  ? 'text-[#6B6B6B] hover:bg-white/70 hover:text-[#1E1E1E]'
                                  : 'text-[#A79A8C] hover:text-[#1E1E1E]'
                            }`}
                          >
                            <span
                              className={`relative inline-flex h-2 w-2 shrink-0 rounded-full transition-all duration-300 ${
                                isActiveSection ? 'bg-[#F06B21]' : isPastSection ? 'bg-[#1E1E1E]' : 'bg-[#EADBC8]'
                              }`}
                            >
                              {isActiveSection ? <span className="absolute inset-[-4px] rounded-full border border-[#F06B21]/35 animate-ping" /> : null}
                            </span>
                            <span className="line-clamp-1">{section.title}</span>
                          </a>

                          {isActiveSection ? (
                            <div className="ml-4 mt-1 space-y-1 border-l border-[#F2E8DC] pl-3">
                              {section.subsections.map((subSection, index) => {
                                const id = subSectionId(chapter, section, index)
                                const isActiveSubSection = activeSubSection === id

                                return (
                                  <a
                                    key={id}
                                    href={`#${id}`}
                                    className={`relative block rounded-[8px] px-2 py-1 text-[11px] leading-4 transition-all duration-300 ${
                                      isActiveSubSection
                                        ? 'translate-x-1 bg-[#FFF4EC] font-semibold text-[#F06B21]'
                                        : 'text-[#8A7F74] hover:bg-white/70 hover:text-[#1E1E1E]'
                                    }`}
                                  >
                                    {isActiveSubSection ? <span className="absolute -left-[13px] top-1.5 h-4 w-1 rounded-full bg-[#F06B21]" /> : null}
                                    {subSection.title}
                                  </a>
                                )
                              })}
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0">
          <nav className="sticky top-0 z-20 -mx-5 mb-5 border-y border-[#F2E8DC] bg-[#FAF6F2]/95 px-5 py-3 backdrop-blur xl:hidden">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B6B]">Timeline du livre</p>
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {docChapters.map(chapter => (
                <a
                  key={chapter.id}
                  href={`#${chapter.id}`}
                  className={`shrink-0 rounded-[14px] border px-3 py-2 text-left transition-colors ${
                    active === chapter.id
                      ? 'border-[#F06B21] bg-white text-[#1E1E1E]'
                      : 'border-[#EADBC8] bg-white/70 text-[#6B6B6B]'
                  }`}
                >
                  <span className="block text-[11px] font-semibold">Chapitre {chapter.number}</span>
                  <span className="mt-1 block max-w-[140px] truncate text-[12px] font-semibold">{chapter.shortTitle}</span>
                </a>
              ))}
            </div>
          </nav>

          <header className="mb-6 rounded-[20px] border border-[#F2E8DC] bg-white p-6 md:p-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#EADBC8] bg-[#FAF6F2] px-3 py-1 text-[12px] font-semibold text-[#6B6B6B]">
              <BookOpen className="h-3.5 w-3.5 text-[#F06B21]" />
              Documentation longue forme
            </div>
            <h1 className="max-w-4xl text-[38px] font-semibold leading-[1.08] text-[#1E1E1E] md:text-[48px]">
              Livre technique Sosson
            </h1>
            <p className="mt-5 max-w-3xl text-[16px] leading-7 text-[#3C3C3C]">
              Une documentation organisee comme un livre: chapitres lisibles dans la timeline, sections concretes, sous-sections actionnables, sources du repo et commandes de verification. Le chapitre mails ouvre maintenant le document, comme demande, avec Azure, Microsoft Graph et les procedures de reprise.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Chapitres', counts.chapters.toString()],
                ['Sections', counts.sections.toString()],
                ['Sous-sections', counts.subSections.toString()],
                ['Sources repo', counts.sources.toString()],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[14px] border border-[#F2E8DC] bg-[#FAF6F2] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B6B6B]">{label}</p>
                  <p className="mt-2 text-[26px] font-semibold text-[#1E1E1E]">{value}</p>
                </div>
              ))}
            </div>
          </header>

          <section className="mb-6 rounded-[20px] border border-[#F2E8DC] bg-[#1E1E1E] p-6 text-white">
            <div className="flex flex-wrap items-center gap-3">
              <UsersRound className="h-5 w-5 text-[#F06B21]" />
              <h2 className="text-[18px] font-semibold">Atelier de redaction IA et equipe technique</h2>
            </div>
            <p className="mt-3 max-w-3xl text-[14px] leading-7 text-white/75">
              La page est pensee comme un ouvrage maintenu par plusieurs roles: produit, architecture, securite, front et exploitation. Chaque chapitre doit pouvoir grossir sans casser la lecture.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-5">
              {editorialTeam.map(([role, detail]) => (
                <div key={role} className="rounded-[14px] border border-white/10 bg-white/5 p-3">
                  <p className="text-[13px] font-semibold text-white">{role}</p>
                  <p className="mt-2 text-[12px] leading-5 text-white/65">{detail}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-8">
            {docChapters.map(chapter => (
              <article key={chapter.id} id={chapter.id} className="scroll-mt-6 rounded-[20px] border border-[#F2E8DC] bg-[#FFFDFB] p-5 md:p-7">
                <ChapterTitle chapter={chapter} />
                <div className="mt-6 grid gap-5">
                  {chapter.sections.map(section => (
                    <SectionBlock
                      key={section.id}
                      chapter={chapter}
                      section={section}
                      activeSection={activeSection}
                      activeSubSection={activeSubSection}
                    />
                  ))}
                </div>
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <SourceList title="Sources" items={chapter.sources} icon={FileText} />
                  {chapter.commands ? <SourceList title="Commandes" items={chapter.commands} icon={TerminalSquare} /> : null}
                </div>
              </article>
            ))}
          </div>
        </main>

        <aside className="hidden xl:block">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
              <div className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6B6B6B]">
                <LinkIcon className="h-4 w-4 text-[#F06B21]" />
                Chapitre actif
              </div>
              <p className="text-[24px] font-semibold text-[#1E1E1E]">{activeChapter.number}</p>
              <p className="mt-2 text-[15px] font-semibold leading-6 text-[#1E1E1E]">{activeChapter.title}</p>
              <p className="mt-3 text-[13px] leading-6 text-[#6B6B6B]">{activeChapter.status}</p>
              <div className="mt-4 rounded-[14px] bg-[#FAF6F2] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B6B6B]">Lecture active</p>
                <p className="mt-2 text-[13px] font-semibold leading-5 text-[#1E1E1E]">{activeSectionData.title}</p>
                <p className="mt-1 text-[12px] leading-5 text-[#F06B21]">{activeSubSectionData.title}</p>
              </div>
            </div>

            <div className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B6B6B]">Index rapide</p>
              <div className="space-y-3">
                {[
                  [MailCheck, 'Mails Graph', 'Chapitre 01'],
                  [Database, 'SQL Connect', 'Chapitre 02'],
                  [LockKeyhole, 'Roles serveur', 'Chapitre 03'],
                  [Table2, 'Excel historique', 'Chapitre 04'],
                  [FolderOpen, 'Documents', 'Chapitre 05'],
                  [Code2, 'Front React', 'Chapitre 06'],
                  [UsersRound, 'Parcours produit', 'Chapitre 07'],
                  [Server, 'Sandbox', 'Chapitre 08'],
                  [Boxes, 'Roadmap agents', 'Chapitre 09'],
                ].map(([Icon, label, detail]) => {
                  const TypedIcon = Icon as LucideIcon
                  return (
                    <div key={label as string} className="flex items-center gap-3 border-t border-[#F2E8DC] pt-3 first:border-t-0 first:pt-0">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#FAF6F2]">
                        <TypedIcon className="h-4 w-4 text-[#F06B21]" />
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1E1E1E]">{label as string}</p>
                        <p className="text-[11px] text-[#6B6B6B]">{detail as string}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[20px] border border-[#F2E8DC] bg-[#1E1E1E] p-5 text-white">
              <p className="text-[12px] font-semibold text-[#F06B21]">Regle de maintenance</p>
              <p className="mt-3 text-[13px] leading-6 text-white/75">
                Ajouter un sujet veut dire ajouter un chapitre ou une section avec contexte, procedure, sources, commandes, statut et limites. Ne pas remplacer une documentation riche par un resume.
              </p>
              <div className="mt-4 space-y-2 text-[12px] text-white/70">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Chapitres lisibles a gauche
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Sections et sous-sections concretes
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Sources et commandes par chapitre
                </p>
                <p className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  Secrets jamais exposes
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
