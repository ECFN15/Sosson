import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '@/lib/store'
import { emails as seedEmails } from '@/data/emails'
import type { Email } from '@/data/emails'
import { isDataConnectEnabled } from '@/lib/dataconnect'
import {
  OUTLOOK_MAILBOX_ADDRESS,
} from '@/lib/outlookMailKit'
import {
  createEmailMessageInSql,
  createEmailThreadInSql,
  loadEmailThreadsFromSql,
  updateEmailThreadStatusAndLinksInSql,
} from '@/features/email/emailSql'
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  Archive,
  BellRing,
  ChevronDown,
  Clock3,
  Edit3,
  FileText,
  Forward,
  Inbox,
  Mail,
  MailCheck,
  MailOpen,
  LogOut,
  MoreHorizontal,
  Paperclip,
  Plus,
  RefreshCcw,
  Reply,
  Search,
  Send,
  Sparkles,
  Star,
  Tag,
  Trash2,
  X,
} from 'lucide-react'

type MailFolder = 'inbox' | 'unread' | 'flagged' | 'sent' | 'drafts' | 'archive' | 'deleted' | 'spam'
type MailPriority = Email['priorite']
type MailTag = Email['tag']
type ComposeMode = 'new' | 'reply' | 'forward'
type MailSource = 'sql' | 'outlook' | 'seed' | 'local'
type EmailPanelSource = 'loading' | 'sql' | 'sql-empty' | 'outlook' | 'outlook-error' | 'outlook-disconnected' | 'seed-fallback'
type OutlookProfile = { mail?: string; userPrincipalName?: string; displayName?: string }

const OUTLOOK_LOCAL_API = 'http://localhost:8787'
const OUTLOOK_RETURN_TO_KEY = 'sosson.outlook.returnTo'

interface MailMessage extends Email {
  folder: MailFolder
  flagged: boolean
  archived: boolean
  deleted: boolean
  attachments: Array<{ name: string; size: string; type: string }>
  source: MailSource
  sqlThreadId?: string
}

type SqlEmailThread = Awaited<ReturnType<typeof loadEmailThreadsFromSql>>[number]

const FOLDER_LABELS: Record<MailFolder, string> = {
  inbox: 'Boite de reception',
  unread: 'Non lus',
  flagged: 'Favoris',
  sent: 'Elements envoyes',
  drafts: 'Brouillons',
  archive: 'Archive',
  deleted: 'Elements supprimes',
  spam: 'Courrier indesirable',
}

const FOLDER_ICONS: Record<MailFolder, LucideIcon> = {
  inbox: Inbox,
  unread: MailOpen,
  flagged: Star,
  sent: Send,
  drafts: Edit3,
  archive: Archive,
  deleted: Trash2,
  spam: AlertTriangle,
}

const FOLDER_ORDER: MailFolder[] = ['inbox', 'unread', 'flagged', 'sent', 'drafts', 'archive', 'deleted', 'spam']

const TAG_LABELS: Record<MailTag, string> = {
  client: 'Client',
  fournisseur: 'Fournisseur',
  interne: 'Interne',
  devis: 'Devis',
  facture: 'Facture',
  chantier: 'Chantier',
  spam: 'Spam',
}

const TAG_STYLES: Record<MailTag, string> = {
  client: 'bg-[#F1E6D6] text-[#1E1E1E]',
  fournisseur: 'bg-[#FAF6F2] text-[#6B6B6B]',
  interne: 'bg-[#F1E6D6] text-[#3C3C3C]',
  devis: 'bg-[#FDEBDD] text-[#D95B17]',
  facture: 'bg-[#EADBC8] text-[#A45A2C]',
  chantier: 'bg-[#F06B21]/10 text-[#F06B21]',
  spam: 'bg-[#FEE7E2] text-[#B42318]',
}

const PRIORITY_LABELS: Record<MailPriority, string> = {
  haute: 'Haute',
  normale: 'Normale',
  faible: 'Faible',
}

const SOURCE_LABELS: Record<EmailPanelSource, string> = {
  loading: 'Chargement...',
  sql: 'Index SQL',
  'sql-empty': 'Index SQL vide',
  outlook: 'Graph live',
  'outlook-error': 'Graph indisponible',
  'outlook-disconnected': 'Graph deconnecte',
  'seed-fallback': 'Fallback local',
}

function isUuid(value?: string | null) {
  return Boolean(value?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i))
}

function normalizeImportance(value?: string | null): MailPriority {
  const normalized = value?.toLowerCase()
  if (normalized === 'haute' || normalized === 'high' || normalized === 'important') return 'haute'
  if (normalized === 'faible' || normalized === 'low') return 'faible'
  return 'normale'
}

function inferTag(subject: string, hasAttachments = false): MailTag {
  const normalized = subject.toLowerCase()
  if (normalized.includes('facture')) return 'facture'
  if (normalized.includes('devis')) return 'devis'
  if (normalized.includes('chantier') || normalized.includes('travaux')) return 'chantier'
  if (hasAttachments) return 'facture'
  return 'client'
}

function mapSqlThreadStatusToFolder(status: string): MailFolder {
  const normalized = status.toLowerCase()
  if (normalized.includes('archive')) return 'archive'
  if (normalized.includes('supprim') || normalized.includes('deleted')) return 'deleted'
  if (normalized.includes('spam')) return 'spam'
  return 'inbox'
}

function mapMessageUpdateToSqlStatus(update: Partial<MailMessage>) {
  if (update.deleted) return 'supprime'
  if (update.archived || update.folder === 'archive') return 'archive'
  if (update.lu === true) return 'traite'
  if (update.lu === false) return 'non_lu'
  return null
}

function seedMessageToMailMessage(email: Email): MailMessage {
  return {
    ...email,
    folder: 'inbox',
    flagged: email.priorite === 'haute',
    archived: false,
    deleted: false,
    attachments: email.tag === 'facture' || email.tag === 'devis'
      ? [{ name: 'Piece jointe locale', size: 'Seed TS', type: 'fallback' }]
      : [],
    source: 'seed',
  }
}

function outlookMessageToMailMessage(message: MailMessage): MailMessage {
  return {
    ...message,
    source: 'outlook',
    folder: message.folder ?? 'inbox',
    flagged: Boolean(message.flagged),
    archived: Boolean(message.archived),
    deleted: Boolean(message.deleted),
    attachments: message.attachments ?? [],
  }
}

function sqlThreadToMailMessage(thread: SqlEmailThread): MailMessage {
  const chantierId = thread.chantier?.id ?? ''
  const clientId = thread.client?.id ?? thread.chantier?.client.id ?? ''
  const folder = mapSqlThreadStatusToFolder(thread.statut)

  return {
    id: thread.id,
    sqlThreadId: thread.id,
    source: 'sql',
    chantierId,
    clientId,
    expediteur: thread.participantsSummary ?? 'Thread email indexe SQL',
    destinataire: OUTLOOK_MAILBOX_ADDRESS,
    sujet: thread.subject,
    extrait: `${thread.messageCount} message${thread.messageCount > 1 ? 's' : ''} indexe${thread.messageCount > 1 ? 's' : ''} dans SQL.`,
    date: thread.lastMessageAt,
    lu: thread.statut.toLowerCase() !== 'non_lu',
    priorite: normalizeImportance(thread.importance),
    tag: inferTag(thread.subject, thread.hasAttachments),
    folder,
    flagged: normalizeImportance(thread.importance) === 'haute',
    archived: folder === 'archive',
    deleted: folder === 'deleted',
    attachments: thread.hasAttachments
      ? [{ name: 'Pieces jointes indexees', size: 'Metadonnees SQL', type: 'SQL' }]
      : [],
  }
}

function splitSender(sender: string) {
  const match = sender.match(/^(.*?)\s*<(.+)>$/)
  if (match) return { name: match[1]?.trim() || sender, email: match[2]?.trim() || sender }
  if (!sender.includes('@')) return { name: sender, email: sender }

  const [localPart] = sender.split('@')
  const name = localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

  return { name: name || sender, email: sender }
}

function formatShortDate(value: string) {
  const date = new Date(value)
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  if (sameDay) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

function formatFullDate(value: string) {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getFolderMessages(messages: MailMessage[], folder: MailFolder) {
  switch (folder) {
    case 'unread':
      return messages.filter(message => !message.deleted && !message.lu)
    case 'flagged':
      return messages.filter(message => !message.deleted && message.flagged)
    case 'archive':
      return messages.filter(message => message.archived && !message.deleted)
    case 'deleted':
      return messages.filter(message => message.deleted)
    case 'spam':
      return messages.filter(message => !message.deleted && message.folder === 'spam')
    case 'sent':
    case 'drafts':
    case 'inbox':
    default:
      return messages.filter(message => !message.deleted && !message.archived && message.folder === folder)
  }
}

function countFolder(messages: MailMessage[], folder: MailFolder) {
  return getFolderMessages(messages, folder).length
}

function matchesSearch(message: MailMessage, query: string) {
  if (!query) return true
  const sender = splitSender(message.expediteur)
  return [
    sender.name,
    sender.email,
    message.destinataire,
    message.sujet,
    message.extrait,
    TAG_LABELS[message.tag],
    PRIORITY_LABELS[message.priorite],
  ]
    .join(' ')
    .toLowerCase()
    .includes(query)
}

function buildDraft(mode: ComposeMode, message?: MailMessage) {
  if (!message || mode === 'new') {
    return { to: '', subject: '', body: '', mode }
  }

  const sender = splitSender(message.expediteur)
  if (mode === 'forward') {
    return {
      to: '',
      subject: `TR: ${message.sujet}`,
      body: `\n\n---------- Message transfere ----------\nDe: ${sender.name} <${sender.email}>\nSujet: ${message.sujet}\n\n${message.extrait}`,
      mode,
    }
  }

  return {
    to: sender.email,
    subject: message.sujet.startsWith('Re:') ? message.sujet : `Re: ${message.sujet}`,
    body: `Bonjour,\n\n\n\nCordialement,\nSosson\n\n--- Message original ---\n${message.extrait}`,
    mode,
  }
}

function FolderButton({
  folder,
  active,
  count,
  unread,
  onClick,
}: {
  folder: MailFolder
  active: boolean
  count: number
  unread: number
  onClick: () => void
}) {
  const Icon = FOLDER_ICONS[folder]

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex h-10 w-full items-center gap-3 rounded-[14px] px-3 text-left text-[13px] font-medium transition-colors',
        active ? 'bg-[#FDEBDD] text-[#F06B21]' : 'text-[#3C3C3C] hover:bg-[#FAF6F2]',
      ].join(' ')}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      <span className="min-w-0 flex-1 truncate">{FOLDER_LABELS[folder]}</span>
      {unread > 0 && folder === 'inbox' ? (
        <span className="rounded-full bg-[#F06B21] px-2 py-0.5 text-[11px] font-semibold text-white">{unread}</span>
      ) : count > 0 ? (
        <span className="text-[11px] font-semibold text-[#9B8F82]">{count}</span>
      ) : null}
    </button>
  )
}

function MessageRow({
  message,
  selected,
  onSelect,
  onToggleFlag,
}: {
  message: MailMessage
  selected: boolean
  onSelect: () => void
  onToggleFlag: () => void
}) {
  const sender = splitSender(message.expediteur)
  const hasAttachments = message.attachments.length > 0

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'group relative w-full border-b border-[#F2E8DC] px-4 py-3 text-left transition-colors last:border-b-0',
        selected ? 'bg-[#FDEBDD]/70' : message.lu ? 'bg-white hover:bg-[#F9F7F3]' : 'bg-[#FFFDFC] hover:bg-[#F9F7F3]',
      ].join(' ')}
    >
      {selected && <span className="absolute bottom-0 left-0 top-0 w-1 bg-[#F06B21]" aria-hidden="true" />}
      {!message.lu && <span className="absolute left-2 top-5 h-2 w-2 rounded-full bg-[#F06B21]" aria-hidden="true" />}

      <div className="flex items-start gap-3 pl-2">
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#FAF6F2] text-[12px] font-semibold text-[#1E1E1E]">
          {sender.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className={['min-w-0 flex-1 truncate text-[13px] text-[#1E1E1E]', message.lu ? 'font-medium' : 'font-semibold'].join(' ')}>
              {sender.name}
            </p>
            <span className="shrink-0 text-[11px] text-[#6B6B6B]">{formatShortDate(message.date)}</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <p className={['min-w-0 flex-1 truncate text-[13px] text-[#1E1E1E]', message.lu ? 'font-medium' : 'font-semibold'].join(' ')}>
              {message.sujet}
            </p>
            {hasAttachments && <Paperclip className="h-3.5 w-3.5 shrink-0 text-[#9B8F82]" strokeWidth={1.75} />}
          </div>
          <p className="mt-1 line-clamp-1 text-[12px] leading-5 text-[#6B6B6B]">{message.extrait}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className={`rounded-[6px] px-2 py-0.5 text-[10px] font-semibold ${TAG_STYLES[message.tag]}`}>{TAG_LABELS[message.tag]}</span>
            {message.priorite === 'haute' && (
              <span className="rounded-[6px] bg-[#FEE7E2] px-2 py-0.5 text-[10px] font-semibold text-[#B42318]">Prioritaire</span>
            )}
          </div>
        </div>
        <span
          role="button"
          tabIndex={0}
          onClick={event => {
            event.stopPropagation()
            onToggleFlag()
          }}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              event.stopPropagation()
              onToggleFlag()
            }
          }}
          className={[
            'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] transition-colors',
            message.flagged ? 'text-[#F06B21]' : 'text-[#C8B8A7] hover:bg-[#FAF6F2] hover:text-[#6B6B6B]',
          ].join(' ')}
          aria-label={message.flagged ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Star className={message.flagged ? 'h-4 w-4 fill-current' : 'h-4 w-4'} strokeWidth={1.75} />
        </span>
      </div>
    </button>
  )
}

function ComposePanel({
  draft,
  onClose,
  onChange,
  onSend,
  onSaveDraft,
}: {
  draft: { to: string; subject: string; body: string; mode: ComposeMode }
  onClose: () => void
  onChange: (draft: { to: string; subject: string; body: string; mode: ComposeMode }) => void
  onSend: () => void
  onSaveDraft: () => void
}) {
  return (
    <article className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <div className="flex min-h-[58px] items-center gap-3 border-b border-[#F2E8DC] px-5 text-[#1E1E1E]">
        <Edit3 className="h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
        <p className="flex-1 text-sm font-semibold">
          {draft.mode === 'new' ? 'Nouveau message' : draft.mode === 'reply' ? 'Repondre' : 'Transferer'}
        </p>
        <button type="button" onClick={onSaveDraft} className="rounded-[10px] border border-[#F2E8DC] bg-[#FAF6F2] px-3 py-2 text-xs font-semibold text-[#3C3C3C] hover:bg-white">
          Brouillon
        </button>
        <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[#6B6B6B] hover:bg-[#FAF6F2]" aria-label="Fermer">
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
      <div className="grid shrink-0 gap-0">
        <label className="grid grid-cols-[72px_minmax(0,1fr)] items-center border-b border-[#F2E8DC] px-4 py-3 text-sm">
          <span className="text-[#6B6B6B]">A</span>
          <input
            value={draft.to}
            onChange={event => onChange({ ...draft, to: event.target.value })}
            className="min-w-0 bg-transparent text-[#1E1E1E] outline-none"
            placeholder="destinataire@exemple.fr"
          />
        </label>
        <label className="grid grid-cols-[72px_minmax(0,1fr)] items-center border-b border-[#F2E8DC] px-4 py-3 text-sm">
          <span className="text-[#6B6B6B]">Objet</span>
          <input
            value={draft.subject}
            onChange={event => onChange({ ...draft, subject: event.target.value })}
            className="min-w-0 bg-transparent text-[#1E1E1E] outline-none"
            placeholder="Sujet"
          />
        </label>
      </div>
      <textarea
        value={draft.body}
        onChange={event => onChange({ ...draft, body: event.target.value })}
        className="min-h-[260px] flex-1 resize-none bg-white px-4 py-4 text-sm leading-6 text-[#1E1E1E] outline-none"
        placeholder="Rediger le message..."
      />
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-[#F2E8DC] px-4 py-3">
        <button
          type="button"
          onClick={onSend}
          className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-[#F06B21] px-4 text-sm font-semibold text-white hover:bg-[#D95B17]"
        >
          <Send className="h-4 w-4" strokeWidth={1.75} />
          Envoyer
        </button>
        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-[12px] text-[#6B6B6B] hover:bg-[#FAF6F2]" aria-label="Joindre un fichier">
          <Paperclip className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-[12px] text-[#6B6B6B] hover:bg-[#FAF6F2]" aria-label="Plus d'options">
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </article>
  )
}

export function EmailsPage() {
  const { chantiers, clients, user } = useApp()
  const [messages, setMessages] = useState<MailMessage[]>(() => seedEmails.map(seedMessageToMailMessage))
  const [emailSource, setEmailSource] = useState<EmailPanelSource>('seed-fallback')
  const [activeFolder, setActiveFolder] = useState<MailFolder>('inbox')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [toast, setToast] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [draft, setDraft] = useState(() => buildDraft('new'))
  const [outlookConnected, setOutlookConnected] = useState(false)
  const [outlookProfile, setOutlookProfile] = useState<OutlookProfile | null>(null)
  const [outlookConfiguredMailbox, setOutlookConfiguredMailbox] = useState('')
  const [outlookLoading, setOutlookLoading] = useState(false)
  const [outlookError, setOutlookError] = useState('')
  const preferOutlookRef = useRef(false)
  const canUseEmailSql = isDataConnectEnabled && Boolean(user)
  const effectiveEmailSource: EmailPanelSource = emailSource

  useEffect(() => {
    if (!canUseEmailSql || outlookConnected || preferOutlookRef.current) return

    let mounted = true

    async function loadSqlThreads() {
      setEmailSource('loading')
      try {
        const threads = await loadEmailThreadsFromSql()
        if (!mounted || preferOutlookRef.current) return
        const nextMessages = threads.map(sqlThreadToMailMessage)
        setMessages(nextMessages)
        setSelectedId(nextMessages[0]?.id ?? '')
        setEmailSource(nextMessages.length ? 'sql' : 'sql-empty')
      } catch (error) {
        console.info('Index email SQL Connect indisponible, fallback local visible.', error)
        if (!mounted || preferOutlookRef.current) return
        setMessages(seedEmails.map(seedMessageToMailMessage))
        setSelectedId('')
        setEmailSource('seed-fallback')
      }
    }

    void loadSqlThreads()

    return () => {
      mounted = false
    }
  }, [canUseEmailSql, outlookConnected])

  useEffect(() => {
    fetch(`${OUTLOOK_LOCAL_API}/api/outlook/status`)
      .then(async response => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error ?? 'Serveur Outlook local indisponible')
        if (payload.connected) preferOutlookRef.current = true
        setOutlookConnected(Boolean(payload.connected))
        setOutlookProfile(payload.profile ?? null)
        setOutlookConfiguredMailbox(payload.mailbox ?? '')
        if (payload.connected) {
          void refreshOutlookSnapshot()
        } else if (payload.mailbox) {
          preferOutlookRef.current = true
          setMessages([])
          setSelectedId('')
          setEmailSource('outlook-disconnected')
        }
      })
      .catch(() => {
        preferOutlookRef.current = false
        setOutlookConnected(false)
        setOutlookError('Serveur Outlook local non demarre. Lance npm run outlook:local.')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const unreadCount = messages.filter(message => !message.deleted && !message.lu).length
  const folderMessages = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return getFolderMessages(messages, activeFolder)
      .filter(message => matchesSearch(message, normalized))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [activeFolder, messages, query])

  const selectedMessage = messages.find(message => message.id === selectedId) ?? folderMessages[0]
  const selectedSender = selectedMessage ? splitSender(selectedMessage.expediteur) : null
  const selectedChantier = selectedMessage ? chantiers.find(chantier => chantier.id === selectedMessage.chantierId) : undefined
  const selectedClient = selectedMessage ? clients.find(client => client.id === selectedMessage.clientId) : undefined
  const confidence = selectedMessage?.priorite === 'haute' ? 92 : selectedMessage?.tag === 'facture' ? 83 : 74
  const activeMailboxAddress = outlookProfile?.mail ?? outlookProfile?.userPrincipalName ?? outlookConfiguredMailbox
  const mailboxLabel = outlookConnected && activeMailboxAddress ? activeMailboxAddress : 'Compte Microsoft a connecter'
  const outlookActionLabel = outlookConnected
    ? effectiveEmailSource === 'outlook' ? 'Synchroniser Graph' : 'Charger les mails Graph'
    : 'Connecter la boite dev'
  const emptyMailboxTitle = effectiveEmailSource === 'loading'
    ? 'Chargement Microsoft Graph...'
    : effectiveEmailSource === 'outlook-error'
      ? 'Microsoft Graph indisponible'
      : effectiveEmailSource === 'outlook-disconnected'
        ? 'Boite dev deconnectee'
      : outlookConnected ? 'Aucun message Graph' : 'Boite dev non connectee'
  const emptyMailboxHint = effectiveEmailSource === 'loading'
    ? `Lecture de ${mailboxLabel}.`
    : effectiveEmailSource === 'outlook-error'
      ? 'Reconnecte la boite dev ou verifie le serveur local Outlook.'
      : effectiveEmailSource === 'outlook-disconnected'
        ? 'Clique sur Connecter la boite dev pour relancer le flux Microsoft.'
      : outlookConnected ? 'Change de dossier ou retire le filtre de recherche.' : 'Lance le serveur local puis connecte ton compte Microsoft.'

  async function connectOutlook() {
    setOutlookLoading(true)
    setOutlookError('')
    preferOutlookRef.current = true
    try {
      const response = await fetch(`${OUTLOOK_LOCAL_API}/api/outlook/auth-url`)
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error ?? 'Impossible de generer l URL Microsoft')
      localStorage.setItem(OUTLOOK_RETURN_TO_KEY, `${window.location.pathname}${window.location.search}`)
      window.location.href = payload.url
    } catch (error) {
      preferOutlookRef.current = false
      setOutlookError(error instanceof Error ? error.message : String(error))
      setToast('Serveur Outlook local indisponible. Lance npm run outlook:local dans un terminal.')
    } finally {
      setOutlookLoading(false)
    }
  }

  async function refreshOutlookSnapshot() {
    setOutlookLoading(true)
    setOutlookError('')
    preferOutlookRef.current = true
    setEmailSource('loading')
    setMessages([])
    setSelectedId('')
    try {
      const folders: Array<'inbox' | 'sent' | 'drafts'> = ['inbox', 'sent', 'drafts']
      const payloads = await Promise.all(
        folders.map(async folder => {
          const response = await fetch(`${OUTLOOK_LOCAL_API}/api/outlook/messages?folder=${folder}&top=30`)
          const payload = await response.json()
          if (!response.ok) throw new Error(payload.error ?? `Lecture Outlook impossible: ${folder}`)
          return payload.messages as MailMessage[]
        }),
      )
      const nextMessages = payloads.flat().map(outlookMessageToMailMessage)
      setMessages(nextMessages)
      const preferred = getFolderMessages(nextMessages, activeFolder)[0] ?? nextMessages[0]
      setSelectedId(preferred?.id ?? '')
      setOutlookConnected(true)
      setEmailSource('outlook')
      setToast(`${nextMessages.length} messages Outlook charges depuis Microsoft Graph.`)
    } catch (error) {
      setMessages([])
      setSelectedId('')
      setEmailSource('outlook-error')
      setOutlookError(error instanceof Error ? error.message : String(error))
      setToast(error instanceof Error ? error.message : 'Synchronisation Outlook impossible.')
    } finally {
      setOutlookLoading(false)
    }
  }

  async function disconnectOutlook() {
    setOutlookLoading(true)
    setOutlookError('')
    try {
      const response = await fetch(`${OUTLOOK_LOCAL_API}/api/outlook/disconnect`, { method: 'POST' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error ?? 'Deconnexion Outlook refusee')

      preferOutlookRef.current = true
      setOutlookConnected(false)
      setOutlookProfile(null)
      setOutlookConfiguredMailbox(payload.mailbox ?? outlookConfiguredMailbox)
      setMessages([])
      setSelectedId('')
      setActiveFolder('inbox')
      setEmailSource('outlook-disconnected')
      setToast('Boite dev Microsoft Graph deconnectee.')
    } catch (error) {
      setOutlookError(error instanceof Error ? error.message : String(error))
      setToast(error instanceof Error ? error.message : 'Deconnexion Outlook impossible.')
    } finally {
      setOutlookLoading(false)
    }
  }

  async function patchSelected(update: Partial<MailMessage>, feedback: string) {
    if (!selectedMessage) return

    if (selectedMessage.source === 'sql') {
      const statut = mapMessageUpdateToSqlStatus(update)
      if (!statut) {
        setToast('Action locale uniquement: aucune mutation SQL disponible pour ce champ.')
        return
      }

      try {
        await updateEmailThreadStatusAndLinksInSql({
          id: selectedMessage.sqlThreadId ?? selectedMessage.id,
          statut,
          clientId: isUuid(selectedMessage.clientId) ? selectedMessage.clientId : null,
          chantierId: isUuid(selectedMessage.chantierId) ? selectedMessage.chantierId : null,
          assignedToId: null,
        })
      } catch (error) {
        console.info('Mise a jour email SQL refusee.', error)
        setToast('Modification non enregistree: SQL Connect est indisponible.')
        return
      }
    }

    setMessages(current => current.map(message => (message.id === selectedMessage.id ? { ...message, ...update } : message)))
    setToast(feedback)
  }

  function toggleFlag(id: string) {
    setMessages(current => current.map(message => (message.id === id ? { ...message, flagged: !message.flagged } : message)))
  }

  function openComposer(mode: ComposeMode) {
    setDraft(buildDraft(mode, selectedMessage))
    setComposeOpen(true)
  }

  async function createMailIndexInSql(message: MailMessage, status: string) {
    const threadId = await createEmailThreadInSql({
      provider: outlookConnected ? 'outlook-graph' : 'local-compose',
      externalThreadId: message.id,
      subject: message.sujet,
      statut: status,
      importance: message.priorite,
      clientId: isUuid(message.clientId) ? message.clientId : null,
      chantierId: isUuid(message.chantierId) ? message.chantierId : null,
      assignedToId: null,
      lastMessageAt: message.date,
      participantsSummary: `${message.expediteur} -> ${message.destinataire}`,
      messageCount: 1,
      hasAttachments: message.attachments.length > 0,
    })

    await createEmailMessageInSql({
      threadId,
      externalMessageId: message.id,
      direction: 'outbound',
      fromEmail: activeMailboxAddress || OUTLOOK_MAILBOX_ADDRESS,
      fromName: 'Sosson',
      toSummary: message.destinataire,
      ccSummary: null,
      subject: message.sujet,
      bodyPreview: message.extrait,
      bodyStoragePath: null,
      bodyHash: null,
      sentAt: status === 'brouillon' ? null : message.date,
      receivedAt: message.date,
      isRead: true,
      hasAttachments: message.attachments.length > 0,
    })

    return threadId
  }

  async function sendDraft() {
    const trimmedTo = draft.to.trim()
    const trimmedSubject = draft.subject.trim() || '(sans objet)'
    if (!trimmedTo) {
      setToast('Ajoute un destinataire avant envoi.')
      return
    }

    try {
      if (outlookConnected) {
        const response = await fetch(`${OUTLOOK_LOCAL_API}/api/outlook/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: trimmedTo, subject: trimmedSubject, body: draft.body }),
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error ?? 'Envoi Graph refuse')
      }
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Envoi Outlook impossible.')
      return
    }

    const sent: MailMessage = {
      id: `sent-${Date.now()}`,
      chantierId: selectedMessage?.chantierId ?? 'chantier-1',
      clientId: selectedMessage?.clientId ?? 'client-1',
      expediteur: activeMailboxAddress || OUTLOOK_MAILBOX_ADDRESS,
      destinataire: trimmedTo,
      sujet: trimmedSubject,
      extrait: draft.body.trim() || 'Message envoye depuis Sosson.',
      date: new Date().toISOString(),
      lu: true,
      priorite: 'normale',
      tag: selectedMessage?.tag ?? 'interne',
      folder: 'sent',
      flagged: false,
      archived: false,
      deleted: false,
      attachments: [],
      source: canUseEmailSql ? 'sql' : 'local',
    }

    let sqlIndexWarning = ''
    if (canUseEmailSql) {
      try {
        const threadId = await createMailIndexInSql(sent, 'envoye')
        sent.id = threadId
        sent.sqlThreadId = threadId
      } catch (error) {
        console.info('Indexation SQL du message envoye impossible.', error)
        sent.source = 'local'
        sqlIndexWarning = outlookConnected
          ? 'Message envoye via Graph, mais non indexe SQL.'
          : 'Message local cree, mais non indexe SQL.'
      }
    }

    setMessages(current => [sent, ...current])
    setComposeOpen(false)
    setActiveFolder('sent')
    setSelectedId(sent.id)
    if (sent.source === 'sql') setEmailSource('sql')
    setToast(sqlIndexWarning || (sent.source === 'sql'
      ? 'Message envoye et indexe SQL.'
      : outlookConnected ? 'Message envoye via Microsoft Graph.' : 'Message envoye dans la simulation locale.'))
  }

  async function saveDraft() {
    const saved: MailMessage = {
      id: `draft-${Date.now()}`,
      chantierId: selectedMessage?.chantierId ?? 'chantier-1',
      clientId: selectedMessage?.clientId ?? 'client-1',
      expediteur: activeMailboxAddress || OUTLOOK_MAILBOX_ADDRESS,
      destinataire: draft.to || 'Destinataire a renseigner',
      sujet: draft.subject || '(brouillon sans objet)',
      extrait: draft.body || 'Brouillon en cours.',
      date: new Date().toISOString(),
      lu: true,
      priorite: 'normale',
      tag: selectedMessage?.tag ?? 'interne',
      folder: 'drafts',
      flagged: false,
      archived: false,
      deleted: false,
      attachments: [],
      source: canUseEmailSql ? 'sql' : 'local',
    }

    let sqlIndexWarning = ''
    if (canUseEmailSql) {
      try {
        const threadId = await createMailIndexInSql(saved, 'brouillon')
        saved.id = threadId
        saved.sqlThreadId = threadId
      } catch (error) {
        console.info('Indexation SQL du brouillon impossible.', error)
        saved.source = 'local'
        sqlIndexWarning = 'Brouillon local cree, mais non indexe SQL.'
      }
    }

    setMessages(current => [saved, ...current])
    setComposeOpen(false)
    setActiveFolder('drafts')
    setSelectedId(saved.id)
    if (saved.source === 'sql') setEmailSource('sql')
    setToast(sqlIndexWarning || (saved.source === 'sql' ? 'Brouillon indexe SQL.' : 'Brouillon sauvegarde localement.'))
  }

  async function selectMessage(message: MailMessage) {
    setComposeOpen(false)
    setSelectedId(message.id)
    if (!message.lu) {
      if (message.source === 'sql') {
        try {
          await updateEmailThreadStatusAndLinksInSql({
            id: message.sqlThreadId ?? message.id,
            statut: 'traite',
            clientId: isUuid(message.clientId) ? message.clientId : null,
            chantierId: isUuid(message.chantierId) ? message.chantierId : null,
            assignedToId: null,
          })
        } catch (error) {
          console.info('Marquage lu SQL impossible.', error)
          setToast('Message non marque lu: SQL Connect est indisponible.')
          return
        }
      }
      setMessages(current => current.map(item => (item.id === message.id ? { ...item, lu: true } : item)))
    }
  }

  async function linkSelectedThread() {
    if (!selectedMessage) return
    if (selectedMessage.source !== 'sql') {
      setToast('Rattachement local uniquement: cet email ne vient pas de l index SQL.')
      return
    }

    try {
      await updateEmailThreadStatusAndLinksInSql({
        id: selectedMessage.sqlThreadId ?? selectedMessage.id,
        statut: 'lie',
        clientId: isUuid(selectedMessage.clientId) ? selectedMessage.clientId : null,
        chantierId: isUuid(selectedMessage.chantierId) ? selectedMessage.chantierId : null,
        assignedToId: null,
      })
      setMessages(current => current.map(message => (message.id === selectedMessage.id ? { ...message, lu: true } : message)))
      setToast('Email rattache dans l index SQL.')
    } catch (error) {
      console.info('Rattachement email SQL impossible.', error)
      setToast('Rattachement non enregistre: SQL Connect est indisponible.')
    }
  }

  return (
    <div className="flex h-[calc(100vh-76px)] min-h-[720px] flex-col overflow-hidden bg-[#FAF6F2] p-4 xl:p-6">
      <div className="mb-4 flex shrink-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight text-[#1E1E1E]">Outlook Sosson</h1>
          <p className="mt-1 text-sm text-[#3C3C3C]">Boite de test Graph, qualification chantier et envoi depuis l'espace principal.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-sm font-medium text-[#3C3C3C]">
            <BellRing className="h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
            {unreadCount} non lus
          </span>
          <span className="inline-flex h-10 items-center rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-sm font-medium text-[#3C3C3C]">
            Source: {SOURCE_LABELS[effectiveEmailSource]}
          </span>
          <button
            type="button"
            onClick={() => {
              if (outlookConnected && effectiveEmailSource !== 'outlook-error') void refreshOutlookSnapshot()
              else void connectOutlook()
            }}
            disabled={outlookLoading}
            className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-sm font-medium text-[#1E1E1E] hover:bg-[#F9F7F3]"
          >
            <RefreshCcw className={outlookLoading ? 'h-4 w-4 animate-spin text-[#6B6B6B]' : 'h-4 w-4 text-[#6B6B6B]'} strokeWidth={1.75} />
            {outlookActionLabel}
          </button>
          {outlookConnected && (
            <button
              type="button"
              onClick={() => void disconnectOutlook()}
              disabled={outlookLoading}
              className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-sm font-medium text-[#B42318] hover:bg-[#FFF4F2]"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              Deconnecter mail
            </button>
          )}
          <button
            type="button"
            onClick={() => openComposer('new')}
            className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-[#F06B21] px-4 text-sm font-semibold text-white hover:bg-[#D95B17]"
          >
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            Nouveau message
          </button>
        </div>
      </div>

      {toast && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-[14px] border border-[#F2E8DC] bg-white px-4 py-3 text-sm text-[#3C3C3C]">
          <span>{toast}</span>
          <button type="button" onClick={() => setToast('')} className="font-semibold text-[#F06B21] hover:text-[#D95B17]">
            OK
          </button>
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[260px_minmax(340px,440px)_minmax(0,1fr)]">
        <aside className="min-h-0 overflow-y-auto rounded-[20px] border border-[#F2E8DC] bg-white p-3">
          <div className="mb-3 rounded-[16px] bg-[#1E1E1E] p-4 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#F06B21] text-sm font-bold">OS</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{outlookConnected ? 'Outlook connecte' : 'Outlook local'}</p>
                <p className="truncate text-xs text-white/65">
                  {mailboxLabel}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <span className="rounded-[10px] bg-white/10 px-2 py-2">{SOURCE_LABELS[effectiveEmailSource]}</span>
              <span className="rounded-[10px] bg-white/10 px-2 py-2">{messages.length} mails</span>
            </div>
            {!outlookConnected ? (
              <button
                type="button"
                onClick={connectOutlook}
                className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-[12px] bg-[#F06B21] text-sm font-semibold text-white hover:bg-[#D95B17]"
              >
                Connecter la boite dev
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void disconnectOutlook()}
                className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[12px] bg-white/10 text-sm font-semibold text-white hover:bg-white/15"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
                Deconnecter mail
              </button>
            )}
          </div>

          <nav className="space-y-1">
            {FOLDER_ORDER.map(folder => (
              <FolderButton
                key={folder}
                folder={folder}
                active={activeFolder === folder}
                count={countFolder(messages, folder)}
                unread={unreadCount}
                onClick={() => {
                  setComposeOpen(false)
                  setActiveFolder(folder)
                  const next = getFolderMessages(messages, folder)[0]
                  if (next) setSelectedId(next.id)
                }}
              />
            ))}
          </nav>

          <div className="mt-5 border-t border-[#F2E8DC] pt-4">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase text-[#9B8F82]">Categories</p>
            {(['devis', 'facture', 'client', 'chantier'] as MailTag[]).map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setQuery(TAG_LABELS[tag].toLowerCase())
                  setToast(`Filtre categorie: ${TAG_LABELS[tag]}`)
                }}
                className="flex h-9 w-full items-center gap-3 rounded-[12px] px-3 text-left text-[13px] text-[#3C3C3C] hover:bg-[#FAF6F2]"
              >
                <Tag className="h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                {TAG_LABELS[tag]}
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-[20px] border border-[#F2E8DC] bg-white">
          <div className="border-b border-[#F2E8DC] p-4">
            <div className="flex h-11 items-center gap-3 rounded-[14px] border border-[#F2E8DC] bg-[#FAF6F2] px-3">
              <Search className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Rechercher dans la boite..."
                className="min-w-0 flex-1 bg-transparent text-sm text-[#1E1E1E] outline-none placeholder:text-[#9B8F82]"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="text-[#6B6B6B] hover:text-[#1E1E1E]" aria-label="Effacer la recherche">
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-[#6B6B6B]">
              <span>{FOLDER_LABELS[activeFolder]}</span>
              <button type="button" className="inline-flex items-center gap-1 rounded-[8px] px-2 py-1 hover:bg-[#FAF6F2]">
                Tries par date
                <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {folderMessages.length > 0 ? (
              folderMessages.map(message => (
                <MessageRow
                  key={message.id}
                  message={message}
                  selected={selectedMessage?.id === message.id}
                  onSelect={() => void selectMessage(message)}
                  onToggleFlag={() => toggleFlag(message.id)}
                />
              ))
            ) : (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-8 text-center">
                <MailCheck className="h-10 w-10 text-[#C8B8A7]" strokeWidth={1.5} />
                <p className="mt-3 text-sm font-semibold text-[#1E1E1E]">
                  {emptyMailboxTitle}
                </p>
                <p className="mt-1 text-sm text-[#6B6B6B]">
                  {emptyMailboxHint}
                </p>
                {(!outlookConnected || effectiveEmailSource === 'outlook-error') && (
                  <button
                    type="button"
                    onClick={connectOutlook}
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-[14px] bg-[#F06B21] px-4 text-sm font-semibold text-white hover:bg-[#D95B17]"
                  >
                    Connecter la boite dev
                  </button>
                )}
                {outlookError && <p className="mt-3 max-w-[280px] text-xs leading-5 text-[#B42318]">{outlookError}</p>}
              </div>
            )}
          </div>
        </section>

        <main className="flex min-h-0 flex-col overflow-hidden rounded-[20px] border border-[#F2E8DC] bg-white">
          <div className="flex min-h-[58px] flex-wrap items-center gap-2 border-b border-[#F2E8DC] px-4 py-3">
            <button type="button" onClick={() => openComposer('reply')} className="inline-flex h-9 items-center gap-2 rounded-[10px] px-3 text-sm font-medium text-[#3C3C3C] hover:bg-[#FAF6F2]">
              <Reply className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
              Repondre
            </button>
            <button type="button" onClick={() => openComposer('forward')} className="inline-flex h-9 items-center gap-2 rounded-[10px] px-3 text-sm font-medium text-[#3C3C3C] hover:bg-[#FAF6F2]">
              <Forward className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
              Transferer
            </button>
            <button type="button" onClick={() => void patchSelected({ lu: !selectedMessage?.lu }, selectedMessage?.lu ? 'Message marque non lu.' : 'Message marque lu.')} className="inline-flex h-9 items-center gap-2 rounded-[10px] px-3 text-sm font-medium text-[#3C3C3C] hover:bg-[#FAF6F2]">
              {selectedMessage?.lu ? <Mail className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} /> : <MailOpen className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />}
              {selectedMessage?.lu ? 'Non lu' : 'Lu'}
            </button>
            <button type="button" onClick={() => void patchSelected({ archived: true, folder: 'archive' }, 'Message archive.')} className="inline-flex h-9 items-center gap-2 rounded-[10px] px-3 text-sm font-medium text-[#3C3C3C] hover:bg-[#FAF6F2]">
              <Archive className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
              Archiver
            </button>
            <button type="button" onClick={() => void patchSelected({ deleted: true, folder: 'deleted' }, 'Message deplace dans elements supprimes.')} className="inline-flex h-9 items-center gap-2 rounded-[10px] px-3 text-sm font-medium text-[#3C3C3C] hover:bg-[#FAF6F2]">
              <Trash2 className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
              Supprimer
            </button>
            <button type="button" className="ml-auto flex h-9 w-9 items-center justify-center rounded-[10px] text-[#6B6B6B] hover:bg-[#FAF6F2]" aria-label="Parametres">
              <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>

          {composeOpen ? (
            <ComposePanel
              draft={draft}
              onClose={() => setComposeOpen(false)}
              onChange={setDraft}
              onSend={sendDraft}
              onSaveDraft={saveDraft}
            />
          ) : selectedMessage && selectedSender ? (
            <article className="flex-1 overflow-y-auto p-5 xl:p-6">
              <div className="flex flex-col gap-4 border-b border-[#F2E8DC] pb-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[22px] font-semibold leading-tight text-[#1E1E1E]">{selectedMessage.sujet}</h2>
                    <span className={`rounded-[6px] px-2.5 py-1 text-[11px] font-semibold ${TAG_STYLES[selectedMessage.tag]}`}>{TAG_LABELS[selectedMessage.tag]}</span>
                    {selectedMessage.flagged && <Star className="h-4 w-4 fill-[#F06B21] text-[#F06B21]" strokeWidth={1.75} />}
                  </div>
                  <p className="mt-2 text-sm text-[#6B6B6B]">
                    De {selectedSender.name} <span className="text-[#9B8F82]">&lt;{selectedSender.email}&gt;</span>
                  </p>
                  <p className="mt-1 text-sm text-[#6B6B6B]">A {selectedMessage.destinataire}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
                  <Clock3 className="h-4 w-4" strokeWidth={1.75} />
                  {formatFullDate(selectedMessage.date)}
                  <button type="button" onClick={() => toggleFlag(selectedMessage.id)} className="ml-2 flex h-9 w-9 items-center justify-center rounded-[10px] hover:bg-[#FAF6F2]" aria-label="Favori">
                    <Star className={selectedMessage.flagged ? 'h-4 w-4 fill-[#F06B21] text-[#F06B21]' : 'h-4 w-4 text-[#6B6B6B]'} strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              <section className="mt-5 rounded-[18px] border border-[#F2E8DC] bg-[#FAF6F2] p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase text-[#9B8F82]">Rattachement Sosson</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-[8px] bg-white px-3 py-1.5 text-sm font-semibold text-[#1E1E1E]">
                        {selectedChantier?.nom ?? 'Chantier a qualifier'}
                      </span>
                      <span className="rounded-[8px] bg-white px-3 py-1.5 text-sm text-[#6B6B6B]">
                        {selectedClient?.nom ?? 'Client non rattache'}
                      </span>
                      <span className="rounded-[8px] bg-[#FDEBDD] px-3 py-1.5 text-xs font-semibold text-[#D95B17]">
                        Match {confidence}%
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void linkSelectedThread()}
                      className="inline-flex h-10 items-center justify-center rounded-[14px] bg-[#F06B21] px-4 text-sm font-semibold text-white hover:bg-[#D95B17]"
                    >
                      Lier au dossier
                    </button>
                    <button
                      type="button"
                      onClick={() => setToast('Recherche de chantier a ouvrir dans une modale de selection.')}
                      className="inline-flex h-10 items-center justify-center rounded-[14px] border border-[#F2E8DC] bg-white px-4 text-sm font-semibold text-[#1E1E1E] hover:bg-[#F9F7F3]"
                    >
                      Changer
                    </button>
                  </div>
                </div>
              </section>

              <div className="mt-6 max-w-[760px] text-[15px] leading-7 text-[#1E1E1E]">
                <p>Bonjour,</p>
                <p className="mt-4">{selectedMessage.extrait.replace(/^Bonjour,\s*/i, '')}</p>
                <p className="mt-4">Cordialement,</p>
                <p>{selectedSender.name}</p>
              </div>

              {selectedMessage.attachments.length > 0 && (
                <section className="mt-8">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1E1E1E]">
                    <Paperclip className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
                    Pieces jointes
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {selectedMessage.attachments.map(attachment => (
                      <div key={attachment.name} className="flex items-center gap-3 rounded-[14px] border border-[#F2E8DC] bg-[#FAF6F2] p-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white text-[#F06B21]">
                          <FileText className="h-5 w-5" strokeWidth={1.75} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#1E1E1E]">{attachment.name}</p>
                          <p className="text-xs text-[#6B6B6B]">{attachment.type} - {attachment.size}</p>
                        </div>
                        <button type="button" className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[#6B6B6B] hover:bg-white" aria-label="Actions piece jointe">
                          <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="mt-8 rounded-[20px] border border-[#F2E8DC] bg-[#FDEBDD]/45 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1E1E1E]">
                      <Sparkles className="h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                      Analyse et rattachement
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#3C3C3C]">
                      Intention detectee: {selectedMessage.tag === 'facture' ? 'facture fournisseur a classer' : selectedMessage.tag === 'devis' ? 'demande de devis a traiter' : 'message client a rattacher'}.
                    </p>
                  </div>
                  <span className="rounded-[8px] bg-white px-3 py-1 text-xs font-semibold text-[#F06B21]">Confiance {confidence}%</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#EADBC8]">
                  <div className="h-full rounded-full bg-[#F06B21]" style={{ width: `${confidence}%` }} />
                </div>
              </section>
            </article>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-[#6B6B6B]">Selectionne un message.</div>
          )}
        </main>

      </div>

    </div>
  )
}
