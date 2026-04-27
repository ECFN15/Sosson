import { useMemo, useState } from 'react'
import { emails, useApp } from '@/lib/store'
import { getChantierCover } from '@/data/media'
import type { Email } from '@/data/emails'
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  Archive,
  ArrowDown,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  Filter,
  Forward,
  HardHat,
  Home,
  Inbox,
  Link2,
  Mail,
  MailOpen,
  MoreHorizontal,
  Paperclip,
  Plus,
  Reply,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  Zap,
} from 'lucide-react'

type EmailTab = 'toutes' | 'prioritaires' | 'devis' | 'factures' | 'chantiers' | 'internes' | 'spam'

const TAB_LABELS: Array<{ key: EmailTab; label: string }> = [
  { key: 'toutes', label: 'Toutes' },
  { key: 'prioritaires', label: 'Prioritaires' },
  { key: 'devis', label: 'Devis / Demande' },
  { key: 'factures', label: 'Factures' },
  { key: 'chantiers', label: 'Chantiers' },
  { key: 'internes', label: 'Internes' },
  { key: 'spam', label: 'Spam' },
]

const TAG_LABELS: Record<Email['tag'], string> = {
  client: 'Client',
  fournisseur: 'Fournisseur',
  interne: 'Interne',
  devis: 'Devis / Demande',
  facture: 'Facture',
  chantier: 'Chantier',
  spam: 'Spam',
}

const TAG_STYLES: Record<Email['tag'], string> = {
  client: 'bg-[#F1E6D6] text-[#1E1E1E]',
  fournisseur: 'bg-[#FAF6F2] text-[#6B6B6B]',
  interne: 'bg-[#DCE9F2] text-[#3C3C3C]',
  devis: 'bg-[#FDEBDD] text-[#D95B17]',
  facture: 'bg-[#EADBC8] text-[#A45A2C]',
  chantier: 'bg-[#F06B21]/10 text-[#F06B21]',
  spam: 'bg-[#FEE2E2] text-[#DC2626]',
}

const TAG_ICONS: Record<Email['tag'], LucideIcon> = {
  client: Home,
  fournisseur: Inbox,
  interne: Mail,
  devis: AlertTriangle,
  facture: FileText,
  chantier: HardHat,
  spam: MailOpen,
}

function splitSender(expediteur: string) {
  const match = expediteur.match(/^(.*?)\s*<(.+)>$/)
  if (match) {
    return {
      name: match[1]?.trim() || expediteur,
      email: match[2]?.trim() || expediteur,
    }
  }

  if (expediteur.includes('@')) {
    const [localPart] = expediteur.split('@')
    const name = localPart
      .split(/[._-]/)
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')

    return { name: name || expediteur, email: expediteur }
  }

  return { name: expediteur, email: expediteur }
}

function formatListDate(value: string) {
  const date = new Date(value)
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)

  if (sameDay) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return 'Hier'
  }

  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

function formatFullDate(value: string) {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function matchesTab(email: Email, tab: EmailTab) {
  switch (tab) {
    case 'prioritaires':
      return email.priorite === 'haute'
    case 'devis':
      return email.tag === 'devis'
    case 'factures':
      return email.tag === 'facture'
    case 'chantiers':
      return email.tag === 'chantier' || email.tag === 'client'
    case 'internes':
      return email.tag === 'interne'
    case 'spam':
      return email.tag === 'spam'
    case 'toutes':
    default:
      return true
  }
}

function countForTab(tab: EmailTab) {
  return emails.filter(email => matchesTab(email, tab)).length
}

function EmailListItem({
  email,
  chantierName,
  selected,
  onSelect,
}: {
  email: Email
  chantierName: string
  selected: boolean
  onSelect: () => void
}) {
  const sender = splitSender(email.expediteur)
  const Icon = email.priorite === 'haute' ? AlertTriangle : TAG_ICONS[email.tag]

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'group relative w-full text-left px-4 py-4 transition-colors',
        'border-b border-[#F2E8DC]/70 last:border-b-0',
        selected ? 'bg-[#F06B21]/[0.07]' : 'bg-white hover:bg-[#F9F7F3]',
      ].join(' ')}
    >
      {selected && <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#F06B21]" aria-hidden="true" />}
      {!email.lu && !selected && (
        <span className="absolute left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#F06B21]" />
      )}

      <div className="flex gap-3 pl-1">
        <div
          className={[
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]',
            selected ? 'bg-white text-[#F06B21]' : 'bg-[#FAF6F2] text-[#6B6B6B]',
          ].join(' ')}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="truncate text-[13px] font-semibold text-[#1E1E1E]">{sender.name}</p>
            <span className="shrink-0 text-[12px] text-[#6B6B6B]">{formatListDate(email.date)}</span>
          </div>
          <div className="mt-1 flex items-start gap-2">
            <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#1E1E1E]">{email.sujet}</p>
            <span className={`shrink-0 rounded-[6px] px-2 py-0.5 text-[10px] font-medium ${TAG_STYLES[email.tag]}`}>
              {email.priorite === 'haute' ? 'Prioritaire' : TAG_LABELS[email.tag]}
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-[12px] leading-5 text-[#6B6B6B]">{email.extrait}</p>
          <p className="mt-2 truncate text-[11px] text-[#9CA3AF]">{chantierName}</p>
        </div>
      </div>
    </button>
  )
}

function ProjectThumbnail({ src }: { src: string }) {
  return (
    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-[10px] border border-[#F2E8DC] bg-[#EADBC8]">
      <img src={src} alt="Aperçu du chantier" className="h-full w-full object-cover" loading="lazy" />
    </div>
  )
}

export function EmailsPage() {
  const { chantiers, clients } = useApp()
  const [activeTab, setActiveTab] = useState<EmailTab>('toutes')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(emails[0]?.id ?? '')
  const [actionFeedback, setActionFeedback] = useState('')
  const [selectedSuggestion, setSelectedSuggestion] = useState('Maison Dupont')

  const sortedEmails = useMemo(
    () => [...emails].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    []
  )

  const visibleEmails = useMemo(() => {
    const query = search.trim().toLowerCase()
    return sortedEmails.filter(email => {
      if (!matchesTab(email, activeTab)) return false
      if (!query) return true

      const sender = splitSender(email.expediteur)
      return [sender.name, sender.email, email.sujet, email.extrait, TAG_LABELS[email.tag]]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
  }, [activeTab, search, sortedEmails])

  const selectedEmail = sortedEmails.find(email => email.id === selectedId) ?? sortedEmails[0]
  const selectedSender = splitSender(selectedEmail.expediteur)
  const selectedChantier = chantiers.find(chantier => chantier.id === selectedEmail.chantierId)
  const selectedClient = clients.find(client => client.id === selectedEmail.clientId)
  const analysisProgress = selectedEmail.priorite === 'haute' ? 92 : 76
  const emailBody = selectedEmail.extrait.replace(/^Bonjour,\s*/i, '')

  return (
    <div className="min-h-full bg-[#FAF6F2] p-6 xl:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight text-[#1E1E1E]">Boîte email - Tri intelligent</h1>
          <p className="mt-2 text-sm text-[#3C3C3C]">Vos emails sont automatiquement triés et liés à vos chantiers.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#F2E8DC] bg-white px-4 text-sm font-medium text-[#1E1E1E] transition-colors hover:bg-[#F9F7F3]"
          >
            Non lus
            <ChevronDown className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#F2E8DC] bg-white px-4 text-sm font-medium text-[#1E1E1E] transition-colors hover:bg-[#F9F7F3]"
          >
            <CalendarDays className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
            Période
            <ChevronDown className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#F2E8DC] bg-white px-4 text-sm font-medium text-[#1E1E1E] transition-colors hover:bg-[#F9F7F3]"
          >
            <Filter className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
            Filtres
            <ChevronDown className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="mb-5 flex items-center justify-between rounded-[14px] border border-[#F2E8DC] bg-white px-4 py-3 text-[13px] font-medium text-[#3C3C3C]">
          <span>{actionFeedback}</span>
          <button type="button" onClick={() => setActionFeedback('')} className="text-[#F06B21] hover:text-[#D95B17]">OK</button>
        </div>
      )}

      <div className="mb-5 overflow-x-auto">
        <div className="inline-flex min-w-max rounded-[10px] border border-[#F2E8DC] bg-white p-1">
          {TAB_LABELS.map(tab => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'inline-flex h-9 items-center gap-2 rounded-[8px] px-4 text-sm font-medium transition-colors',
                  isActive ? 'bg-[#FDEBDD] text-[#F06B21]' : 'text-[#3C3C3C] hover:bg-[#FAF6F2]',
                ].join(' ')}
              >
                {tab.label}
                <span
                  className={[
                    'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                    isActive ? 'bg-white text-[#F06B21]' : 'bg-[#FAF6F2] text-[#6B6B6B]',
                  ].join(' ')}
                >
                  {countForTab(tab.key)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid min-h-[620px] grid-cols-1 gap-4 2xl:grid-cols-[360px_minmax(520px,1fr)_340px]">
        <section className="flex min-h-[560px] flex-col overflow-hidden rounded-[20px] border border-[#F2E8DC] bg-white shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
          <div className="flex h-[58px] items-center gap-3 border-b border-[#F2E8DC] px-4">
            <Search className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
            <input
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Rechercher un email..."
              className="min-w-0 flex-1 bg-transparent text-sm text-[#1E1E1E] placeholder:text-[#9CA3AF] focus:outline-none"
            />
            <SlidersHorizontal className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
          </div>

          <div className="flex-1 overflow-y-auto">
            {visibleEmails.length > 0 ? (
              visibleEmails.map(email => {
                const chantier = chantiers.find(item => item.id === email.chantierId)
                return (
                  <EmailListItem
                    key={email.id}
                    email={email}
                    chantierName={chantier?.nom ?? 'Chantier a qualifier'}
                    selected={selectedEmail.id === email.id}
                    onSelect={() => setSelectedId(email.id)}
                  />
                )
              })
            ) : (
              <div className="flex h-full min-h-[260px] items-center justify-center px-6 text-center text-sm text-[#6B6B6B]">
                Aucun email ne correspond à ces critères.
              </div>
            )}
          </div>

          <div className="border-t border-[#F2E8DC] p-4">
            <button
              type="button"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-[#F2E8DC] bg-white text-sm font-medium text-[#1E1E1E] transition-colors hover:bg-[#F9F7F3]"
            >
              <ArrowDown className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
              Charger plus d'emails
            </button>
          </div>
        </section>

        <section className="flex min-h-[560px] flex-col overflow-hidden rounded-[20px] border border-[#F2E8DC] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex min-h-[58px] flex-wrap items-center gap-2 border-b border-[#F2E8DC] px-5 py-3">
            <button onClick={() => setActionFeedback('Réponse préparée avec le contexte chantier')} className="inline-flex items-center gap-2 rounded-[10px] px-2.5 py-2 text-sm font-medium text-[#3C3C3C] hover:bg-[#FAF6F2]" type="button">
              <Reply className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
              Répondre
            </button>
            <button onClick={() => setActionFeedback('Email prêt à être transféré à l’équipe chantier')} className="inline-flex items-center gap-2 rounded-[10px] px-2.5 py-2 text-sm font-medium text-[#3C3C3C] hover:bg-[#FAF6F2]" type="button">
              <Forward className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
              Transférer
            </button>
            <button onClick={() => setActionFeedback('Email marqué comme lu pour la démonstration')} className="inline-flex items-center gap-2 rounded-[10px] px-2.5 py-2 text-sm font-medium text-[#3C3C3C] hover:bg-[#FAF6F2]" type="button">
              <MailOpen className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
              Marquer comme lu
            </button>
            <button onClick={() => setActionFeedback('Email archivé dans le flux de démonstration')} className="inline-flex items-center gap-2 rounded-[10px] px-2.5 py-2 text-sm font-medium text-[#3C3C3C] hover:bg-[#FAF6F2]" type="button">
              <Archive className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
              Archiver
            </button>
            <button className="ml-auto flex h-9 w-9 items-center justify-center rounded-[10px] text-[#6B6B6B] hover:bg-[#FAF6F2]" type="button" aria-label="Plus d'actions">
              <MoreHorizontal className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 xl:p-6">
            <div className="mb-7">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-[20px] font-semibold leading-tight text-[#1E1E1E]">{selectedEmail.sujet}</h2>
                <span className={`rounded-[6px] px-2.5 py-1 text-[11px] font-medium ${TAG_STYLES[selectedEmail.tag]}`}>
                  {selectedEmail.priorite === 'haute' ? 'Prioritaire' : TAG_LABELS[selectedEmail.tag]}
                </span>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-b border-[#F2E8DC] pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#1E1E1E]">
                    {selectedSender.name}{' '}
                    <span className="font-normal text-[#6B6B6B]">&lt;{selectedSender.email}&gt;</span>
                  </p>
                  <p className="mt-1 text-xs text-[#6B6B6B]">À : {selectedClient?.nom ?? selectedEmail.destinataire}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#6B6B6B]">
                  <span>{formatFullDate(selectedEmail.date)}</span>
                  <Star className="h-4 w-4" strokeWidth={1.75} />
                  <Reply className="h-4 w-4" strokeWidth={1.75} />
                  <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
                </div>
              </div>
            </div>

            <div className="max-w-[680px] text-[15px] leading-7 text-[#1E1E1E]">
              <p>Bonjour,</p>
              <p className="mt-4">{emailBody}</p>
              <p className="mt-4">
                Cordialement,
                <br />
                {selectedSender.name}
              </p>
            </div>

            <div className="mt-8 rounded-[20px] border border-[#F2E8DC] bg-[#FDEBDD]/45 p-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#F06B21]" strokeWidth={1.75} />
                  <h3 className="text-[15px] font-semibold text-[#1E1E1E]">Analyse IA</h3>
                </div>
                <span className="rounded-[6px] bg-white px-2.5 py-1 text-[11px] font-medium text-[#F06B21]">
                  {selectedEmail.priorite === 'haute' ? 'Prioritaire' : 'A qualifier'}
                </span>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <p className="mb-3 text-xs font-semibold text-[#1E1E1E]">Detection</p>
                  {['Demande de devis', 'Extension', 'Ossature bois', '20m2'].map(item => (
                    <div key={item} className="mb-2 flex items-center gap-2 text-[13px] text-[#3C3C3C] last:mb-0">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#A45A2C]" strokeWidth={2} />
                      {item}
                    </div>
                  ))}
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-[#1E1E1E]">Intention</p>
                  <p className="text-[13px] leading-5 text-[#3C3C3C]">
                    Demande de devis pour un projet d'extension en ossature bois.
                  </p>
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold text-[#1E1E1E]">Confiance</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[15px] font-semibold text-[#1E1E1E]">{analysisProgress}%</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EADBC8]">
                        <div className="h-full rounded-full bg-[#F06B21]" style={{ width: `${analysisProgress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-3 flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
                <h3 className="text-[15px] font-semibold text-[#1E1E1E]">Pièces jointes (1)</h3>
              </div>
              <div className="flex items-center gap-4 rounded-[14px] border border-[#F2E8DC] bg-white p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#FEE2E2] text-[#DC2626]">
                  <FileText className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1E1E1E]">Plan_extension.pdf</p>
                  <p className="mt-0.5 text-xs text-[#6B6B6B]">PDF - 1.2 Mo</p>
                </div>
                <button type="button" className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[#6B6B6B] hover:bg-[#FAF6F2]" aria-label="Télécharger">
                  <Download className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <button type="button" className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[#6B6B6B] hover:bg-[#FAF6F2]" aria-label="Options">
                  <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="flex min-h-[560px] flex-col gap-4">
          <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5 shadow-[-2px_0_10px_rgba(0,0,0,0.02)]">
            <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Lier à un chantier / client</h2>

            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold text-[#1E1E1E]">Chantier suggéré par IA</p>
              <div className="rounded-[14px] border border-[#F2E8DC] bg-white p-3">
                <div className="flex gap-3">
                  <ProjectThumbnail src={getChantierCover(selectedChantier?.id)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-[#1E1E1E]">{selectedChantier?.nom ?? 'Chantier à créer'}</p>
                      <span className="rounded-[6px] bg-[#E6F4EA] px-2 py-0.5 text-[10px] font-semibold text-[#1E8E3E]">
                        Match : 85%
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#6B6B6B]">{selectedClient?.nom ?? 'Client à qualifier'}</p>
                    <p className="mt-1 text-xs text-[#3C3C3C]">En cours - Démarrage prévu mai 2026</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-3 text-xs font-semibold text-[#1E1E1E]">Autres suggestions</p>
              {[
                { label: 'Maison Dupont', sub: 'Dupont Jean', match: '65%' },
                { label: 'Extension Martin', sub: 'Martin SARL', match: '40%' },
              ].map(item => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setSelectedSuggestion(item.label)
                    setActionFeedback(`${item.label} sélectionné comme chantier cible`)
                  }}
                  className="mb-2 flex w-full items-center gap-3 rounded-[10px] border border-[#F2E8DC] bg-white p-2.5 text-left transition-colors last:mb-0 hover:bg-[#F9F7F3]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#FAF6F2] text-[#6B6B6B]">
                    <HardHat className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-[#1E1E1E]">{item.label}</p>
                    <p className="truncate text-[12px] text-[#6B6B6B]">{item.sub}</p>
                  </div>
                  <span className="rounded-[6px] bg-[#E6F4EA] px-2 py-0.5 text-[10px] font-semibold text-[#1E8E3E]">
                    {selectedSuggestion === item.label ? 'Sélectionné' : `Match : ${item.match}`}
                  </span>
                </button>
              ))}
              <button
                type="button"
                className="mt-1 flex h-10 w-full items-center justify-between rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-sm font-medium text-[#1E1E1E] hover:bg-[#F9F7F3]"
              >
                Voir tous les chantiers
                <ChevronRight className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
              </button>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
                <p className="text-xs font-semibold text-[#1E1E1E]">Tags</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['devis', 'extension', 'ossature bois'].map(tag => (
                  <span key={tag} className="rounded-[6px] bg-[#F1E6D6] px-2.5 py-1.5 text-[12px] font-medium text-[#3C3C3C]">
                    {tag}
                  </span>
                ))}
                <button type="button" className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#F2E8DC] bg-white text-[#6B6B6B] hover:bg-[#FAF6F2]" aria-label="Ajouter un tag">
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold text-[#1E1E1E]">Actions rapides</p>
              <button
                type="button"
                onClick={() => setActionFeedback(`Email lié à ${selectedSuggestion}`)}
                className="mb-3 flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#F06B21] px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-[#D95B17]"
              >
                <Link2 className="h-4 w-4" strokeWidth={1.75} />
                Lier au chantier
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[#F2E8DC] bg-white text-xs font-medium text-[#3C3C3C] hover:bg-[#F9F7F3]">
                  <FileText className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
                  Créer un devis
                </button>
                <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[#F2E8DC] bg-white text-xs font-medium text-[#3C3C3C] hover:bg-[#F9F7F3]">
                  <CalendarDays className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
                  Créer une tâche
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <h2 className="mb-5 text-[15px] font-semibold text-[#1E1E1E]">Activité liée</h2>
            {[
              { label: 'Email reçu', time: '21 avr. 2026 à 09:42' },
              { label: 'Affecté à Jean Dupont', time: '21 avr. 2026 à 09:43' },
              { label: 'Analyse IA - 92% de confiance', time: '21 avr. 2026 à 09:43' },
            ].map(item => (
              <div key={item.label} className="mb-4 flex items-center gap-3 last:mb-0">
                <Clock3 className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
                <p className="min-w-0 flex-1 truncate text-[12px] text-[#3C3C3C]">{item.label}</p>
                <span className="shrink-0 text-[11px] text-[#9CA3AF]">{item.time}</span>
              </div>
            ))}
          </section>

          <section className="rounded-[20px] border border-[#F2E8DC] bg-[#FDEBDD]/45 p-5">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-[#F06B21]">
                <Zap className="h-5 w-5" strokeWidth={1.9} />
              </div>
              <div>
                <h2 className="text-[14px] font-semibold text-[#1E1E1E]">Gagnez du temps</h2>
                <p className="mt-2 text-[13px] leading-5 text-[#3C3C3C]">
                  L'IA a trié et analysé cet email. Vérifiez simplement les informations et liez-le au chantier correspondant.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
