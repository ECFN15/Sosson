import type { LucideIcon } from 'lucide-react'
import { BellRing, KeyRound, MailCheck, Send, ShieldCheck, Workflow } from 'lucide-react'

export type OutlookKitStatus = 'ready' | 'todo' | 'blocked'

export interface OutlookKitStep {
  id: string
  title: string
  description: string
  status: OutlookKitStatus
  icon: LucideIcon
}

export interface OutlookPermission {
  scope: string
  mode: 'Delegated' | 'Application'
  reason: string
  adminConsent: boolean
}

export const OUTLOOK_MAILBOX_ADDRESS = 'contact@sosson.fr'

export const OUTLOOK_GRAPH_ENDPOINTS = [
  {
    label: 'Lecture boite principale',
    method: 'GET',
    path: '/users/{mailbox}/mailFolders/inbox/messages',
  },
  {
    label: 'Synchronisation incrementale',
    method: 'GET',
    path: '/users/{mailbox}/mailFolders/{folderId}/messages/delta',
  },
  {
    label: 'Envoi depuis Sosson',
    method: 'POST',
    path: '/users/{mailbox}/sendMail',
  },
  {
    label: 'Notifications webhook',
    method: 'POST',
    path: '/subscriptions',
  },
] as const

export const OUTLOOK_REQUIRED_PERMISSIONS: OutlookPermission[] = [
  {
    scope: 'Mail.Read',
    mode: 'Application',
    reason: 'Lire le contenu de la boite entreprise sans session Outlook ouverte dans le navigateur.',
    adminConsent: true,
  },
  {
    scope: 'Mail.Send',
    mode: 'Application',
    reason: 'Envoyer des mails depuis la boite entreprise via une Cloud Function serveur.',
    adminConsent: true,
  },
  {
    scope: 'offline_access',
    mode: 'Delegated',
    reason: 'Utile seulement si on choisit un flux delegue avec connexion humaine au lieu du mode service.',
    adminConsent: false,
  },
]

export const OUTLOOK_SETUP_STEPS: OutlookKitStep[] = [
  {
    id: 'entra',
    title: 'App Microsoft Entra',
    description: 'Creer une App Registration dediee a Sosson avec tenant ID, client ID et secret stocke cote serveur.',
    status: 'todo',
    icon: KeyRound,
  },
  {
    id: 'permissions',
    title: 'Consentement admin',
    description: 'Accorder Mail.Read et Mail.Send en permissions application, puis limiter l acces a la boite entreprise.',
    status: 'todo',
    icon: ShieldCheck,
  },
  {
    id: 'ingestion',
    title: 'Ingestion Graph',
    description: 'Cloud Function: lister les messages, dedupliquer par internetMessageId, stocker dans SQL Connect.',
    status: 'todo',
    icon: MailCheck,
  },
  {
    id: 'sync',
    title: 'Delta + webhook',
    description: 'Utiliser deltaLink pour les rattrapages et les subscriptions Graph pour reveiller la synchronisation.',
    status: 'todo',
    icon: BellRing,
  },
  {
    id: 'send',
    title: 'Envoi controle',
    description: 'Envoyer via /sendMail depuis une Function, avec brouillon, journal d audit et copie elements envoyes.',
    status: 'todo',
    icon: Send,
  },
  {
    id: 'routing',
    title: 'Rattachement Sosson',
    description: 'Brancher le tri IA et la validation humaine vers Client, Chantier, Facture et timeline.',
    status: 'ready',
    icon: Workflow,
  },
]

export const OUTLOOK_DOC_LINKS = [
  {
    label: 'Microsoft Graph - List messages',
    url: 'https://learn.microsoft.com/en-us/graph/api/user-list-messages?view=graph-rest-1.0',
  },
  {
    label: 'Microsoft Graph - sendMail',
    url: 'https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0',
  },
  {
    label: 'Microsoft Graph - permissions',
    url: 'https://learn.microsoft.com/en-us/graph/permissions-reference',
  },
  {
    label: 'Microsoft identity - OAuth auth code + PKCE',
    url: 'https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow',
  },
  {
    label: 'Microsoft Graph - delta messages',
    url: 'https://learn.microsoft.com/en-us/graph/delta-query-messages',
  },
  {
    label: 'Microsoft Graph - webhooks',
    url: 'https://learn.microsoft.com/en-us/graph/change-notifications-delivery-webhooks',
  },
  {
    label: 'Exchange Online - application RBAC',
    url: 'https://learn.microsoft.com/en-us/graph/auth-limit-mailbox-access',
  },
]
