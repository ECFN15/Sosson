import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Check,
  CircleDot,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  Plus,
  ReceiptText,
  Share2,
  Upload,
  UserRound,
} from 'lucide-react'
import { canAccessPage } from '@/lib/accessControl'
import { isDataConnectEnabled } from '@/lib/dataconnect'
import { useApp } from '@/lib/store'
import { categorieLabels } from '@/data/factures'
import { operationalPrevisionnelLines } from '@/lib/previsionnelModel'
import { categoryLabels as previsionnelCategoryLabels } from '@/lib/previsionnelAnalytics'
import { updateChantierStatutInSql } from '@/features/operations/operationalAdapters'
import { useOperationalData } from '@/features/operations/useOperationalData'
import { loadDocumentsSqlData } from '@/features/documents/documentSql'
import { loadEmailThreadsFromSql } from '@/features/email/emailSql'
import { loadPlanningEventsByChantierFromSql } from '@/features/planning/planningSql'
import type { CategorieDepense } from '@/data/factures'
import type { Chantier } from '@/data/chantiers'
import type { DocumentRecord } from '@/features/documents/documentTypes'
import type { PrevisionnelLine } from '@/data/previsionnel'

const statusOptions: Array<{ value: Chantier['statut']; label: string }> = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'devis_a_faire', label: 'Devis a faire' },
  { value: 'devis_envoye', label: 'Devis envoye' },
  { value: 'signe', label: 'Signe' },
  { value: 'en_preparation', label: 'En preparation' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'en_pause', label: 'En pause' },
  { value: 'termine', label: 'Termine' },
  { value: 'cloture', label: 'Cloture' },
  { value: 'annule', label: 'Annule' },
]

const statusLabel: Record<Chantier['statut'], string> = Object.fromEntries(
  statusOptions.map(option => [option.value, option.label]),
) as Record<Chantier['statut'], string>

const statusStyle: Record<Chantier['statut'], string> = {
  prospect: 'bg-[#FAF6F2] text-[#6B6B6B]',
  devis_a_faire: 'bg-[#FDEBDD] text-[#D95B17]',
  devis_envoye: 'bg-[#F1E6D6] text-[#A45A2C]',
  signe: 'bg-[#E6F4EA] text-[#1E8E3E]',
  en_preparation: 'bg-[#FAF6F2] text-[#3C3C3C]',
  en_cours: 'bg-[#FDEBDD] text-[#F06B21]',
  en_pause: 'bg-[#FAF6F2] text-[#6B6B6B]',
  termine: 'bg-[#E6F4EA] text-[#1E8E3E]',
  cloture: 'bg-[#F1E6D6] text-[#3C3C3C]',
  annule: 'bg-[#FEE2E2] text-[#DC2626]',
}

const statusTimelineValues: Chantier['statut'][] = [
  'prospect',
  'devis_a_faire',
  'devis_envoye',
  'signe',
  'en_preparation',
  'en_cours',
  'termine',
  'cloture',
]

const factureStatusStyle = {
  validee: { label: 'Validee', className: 'bg-[#E6F4EA] text-[#1E8E3E]' },
  en_attente: { label: 'En attente', className: 'bg-[#FDEBDD] text-[#D95B17]' },
  rejetee: { label: 'Rejetee', className: 'bg-[#FEE2E2] text-[#DC2626]' },
} as const

const categoryColor: Record<CategorieDepense, string> = {
  bois_materiaux: '#F06B21',
  materiaux: '#D8B898',
  quincaillerie: '#8A5A2F',
  sous_traitance: '#2F2F2F',
  carburant: '#D8B898',
  location_materiel: '#F89A62',
  plomberie: '#C79A72',
  electricite: '#6B6B6B',
  peinture: '#FFE3CC',
  autre: '#F2E8DC',
}

type SqlEmailThread = Awaited<ReturnType<typeof loadEmailThreadsFromSql>>[number]
type SqlPlanningEvent = Awaited<ReturnType<typeof loadPlanningEventsByChantierFromSql>>[number]

type ActivityItem = {
  id: string
  title: string
  detail: string
  date: string
  icon: typeof ReceiptText
}

function formatEuros(value: number) {
  return `${Math.round(value).toLocaleString('fr-FR')} EUR`
}

function formatDate(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function percentOf(value: number, total: number) {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) return 0
  return Math.round((value / total) * 100)
}

function chantierLineId(chantierId?: string | null) {
  if (!chantierId?.startsWith('prev-chantier-')) return null
  return `prev-${chantierId.replace(/^prev-chantier-/, '')}`
}

function isSqlCompatibleId(id?: string | null) {
  return Boolean(id) && !id?.startsWith('prev-') && !id?.startsWith('local-')
}

function amountBase(line?: PrevisionnelLine | null, fallback = 0) {
  if (!line) return fallback
  return line.caPrevision || line.caContrat || line.plannedTotal || line.realizedTotal
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[20px] border border-[#EADBC8] bg-white shadow-[0_1px_0_rgba(255,255,255,.9)_inset,0_14px_34px_rgba(30,30,30,0.045)] ${className}`}>
      {children}
    </section>
  )
}

function SourcePill({ label, tone = 'local' }: { label: string; tone?: 'sql' | 'local' | 'static' }) {
  const className =
    tone === 'sql'
      ? 'border-[#D8EBDD] bg-[#E6F4EA] text-[#1E8E3E]'
      : tone === 'static'
        ? 'border-[#F2E8DC] bg-[#FAF6F2] text-[#6B6B6B]'
        : 'border-[#F2E8DC] bg-[#FDEBDD] text-[#D95B17]'

  return (
    <span className={`inline-flex items-center rounded-[8px] border px-2.5 py-1 text-[11px] font-semibold ${className}`}>
      {label}
    </span>
  )
}

function LinkButton({ children, to }: { children: ReactNode; to: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1.5 rounded-[10px] px-1 py-1 text-[12px] font-medium text-[#1E1E1E] hover:bg-[#FAF6F2]">
      {children}
      <ArrowRight className="h-3.5 w-3.5 text-[#6B6B6B]" strokeWidth={1.75} />
    </Link>
  )
}

function IconAction({
  icon: Icon,
  children,
  to,
}: {
  icon: typeof Plus
  children: ReactNode
  to: string
}) {
  return (
    <Link to={to} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[12px] border border-[#F2E8DC] bg-white px-3 text-sm font-medium text-[#1E1E1E] hover:bg-[#FAF6F2]">
      <Icon className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
      {children}
    </Link>
  )
}

function KpiCard({
  label,
  value,
  detail,
  children,
}: {
  label: string
  value: string
  detail?: string
  children?: ReactNode
}) {
  return (
    <Card className="min-h-[126px] p-5">
      <p className="text-[12px] font-medium text-[#3C3C3C]">{label}</p>
      <div className="mt-3 text-[24px] font-bold leading-none tracking-tight text-[#1E1E1E]">{value}</div>
      {children}
      {detail && <p className="mt-3 text-[11px] text-[#6B6B6B]">{detail}</p>}
    </Card>
  )
}

function EmptyNotice({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[14px] bg-[#FAF6F2] p-4 text-[13px] leading-5 text-[#6B6B6B]">
      {children}
    </p>
  )
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('')
}

function sortByDateDesc<T extends { date: string }>(rows: T[]) {
  return [...rows].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function ChantierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, accessMatrix, updateChantierStatus } = useApp()
  const {
    chantiers,
    factures,
    clients,
    source: operationalSource,
    isLoading: isOperationalLoading,
    error: operationalError,
    hasUnsyncedLocalChanges,
  } = useOperationalData()
  const [statusFeedback, setStatusFeedback] = useState('')
  const [isStatusSaving, setIsStatusSaving] = useState(false)
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [documentError, setDocumentError] = useState('')
  const [emailThreads, setEmailThreads] = useState<SqlEmailThread[]>([])
  const [emailError, setEmailError] = useState('')
  const [planningEvents, setPlanningEvents] = useState<SqlPlanningEvent[]>([])
  const [planningError, setPlanningError] = useState('')
  const canEditChantier = canAccessPage(user?.role, 'chantiers', accessMatrix, 'edit')

  const chantier = chantiers.find(item => item.id === id)
  const client = clients.find(item => item.id === chantier?.clientId)
  const chantierFactures = useMemo(
    () => factures.filter(facture => facture.chantierId === id),
    [factures, id],
  )
  const previsionnelByLineId = useMemo(
    () => new Map(operationalPrevisionnelLines.map(line => [line.id, line])),
    [],
  )
  const selectedLine = previsionnelByLineId.get(chantierLineId(chantier?.id) ?? '')
  const isSqlSource = operationalSource === 'dataconnect'
  const canReadSqlModules = isSqlSource && isDataConnectEnabled && Boolean(user) && isSqlCompatibleId(chantier?.id)

  useEffect(() => {
    if (!canReadSqlModules || !chantier?.id) {
      return
    }

    let isMounted = true

    async function loadDocuments() {
      try {
        const sqlData = await loadDocumentsSqlData()
        if (!isMounted) return
        setDocuments(sqlData.documents)
        setDocumentError('')
      } catch (error) {
        console.info('Documents SQL Connect indisponibles sur la fiche chantier.', error)
        if (!isMounted) return
        setDocuments([])
        setDocumentError('Documents SQL indisponibles')
      }
    }

    void loadDocuments()

    return () => {
      isMounted = false
    }
  }, [canReadSqlModules, chantier?.id])

  useEffect(() => {
    if (!canReadSqlModules) {
      return
    }

    let isMounted = true

    async function loadEmails() {
      try {
        const rows = await loadEmailThreadsFromSql()
        if (!isMounted) return
        setEmailThreads(rows)
        setEmailError('')
      } catch (error) {
        console.info('Emails SQL Connect indisponibles sur la fiche chantier.', error)
        if (!isMounted) return
        setEmailThreads([])
        setEmailError('Emails SQL indisponibles')
      }
    }

    void loadEmails()

    return () => {
      isMounted = false
    }
  }, [canReadSqlModules])

  useEffect(() => {
    if (!canReadSqlModules || !chantier?.id) {
      return
    }

    let isMounted = true
    const chantierId = chantier.id

    async function loadPlanning() {
      try {
        const rows = await loadPlanningEventsByChantierFromSql({ chantierId })
        if (!isMounted) return
        setPlanningEvents(rows.filter(event => event.statut !== 'cancelled'))
        setPlanningError('')
      } catch (error) {
        console.info('Planning SQL Connect indisponible sur la fiche chantier.', error)
        if (!isMounted) return
        setPlanningEvents([])
        setPlanningError('Planning SQL indisponible')
      }
    }

    void loadPlanning()

    return () => {
      isMounted = false
    }
  }, [canReadSqlModules, chantier?.id])

  if (!chantier) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#FAF6F2] p-8">
        <Card className="max-w-md p-8 text-center">
          <h1 className="text-[22px] font-semibold text-[#1E1E1E]">Chantier introuvable</h1>
          <p className="mt-2 text-sm text-[#6B6B6B]">Le dossier demande n'existe pas dans les donnees chargees.</p>
          <button
            type="button"
            onClick={() => navigate('/chantiers')}
            className="mt-5 inline-flex items-center gap-2 rounded-[14px] bg-[#F06B21] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#D95B17]"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            Retour aux chantiers
          </button>
        </Card>
      </div>
    )
  }

  const currentChantier = chantier
  const factureTotal = chantierFactures.reduce((sum, facture) => sum + facture.montantTTC, 0)
  const factureValidatedTotal = chantierFactures
    .filter(facture => facture.statut === 'validee')
    .reduce((sum, facture) => sum + facture.montantTTC, 0)
  const facturePendingCount = chantierFactures.filter(facture => facture.statut === 'en_attente').length
  const budget = amountBase(selectedLine, chantier.budgetPrevisionnel)
  const visibleExpenseTotal = chantierFactures.length > 0 ? factureTotal : (selectedLine?.realizedTotal ?? chantier.depensesEngagees)
  const progress = Math.min(Math.max(percentOf(visibleExpenseTotal, budget), 0), 100)
  const margin = budget - visibleExpenseTotal
  const marginPercent = percentOf(margin, budget)
  const sourceLabel = isOperationalLoading
    ? 'Chargement SQL'
    : isSqlSource
      ? 'Operationnel SQL'
      : operationalSource === 'excel'
        ? 'Fallback Excel'
        : 'Seeds locaux'
  const sourceDetail = isSqlSource
    ? "Le chantier et ses factures viennent de Data Connect dans cette session."
    : operationalSource === 'excel'
      ? "Le chantier vient du fichier Excel/previsionnel charge cote front. Les modules non presents dans l'Excel restent absents."
      : "Le chantier vient des seeds locaux. Ces donnees ne prouvent pas l'etat sandbox."
  const canWriteSql = operationalSource === 'dataconnect' && isDataConnectEnabled && Boolean(user)
  const sourceTone = isSqlSource ? 'sql' : operationalSource === 'excel' ? 'static' : 'local'
  const currentTimelineIndex = chantier.statut === 'en_pause'
    ? statusTimelineValues.indexOf('en_cours')
    : statusTimelineValues.indexOf(chantier.statut)
  const hasExceptionalStatus = chantier.statut === 'en_pause' || chantier.statut === 'annule'
  const statusTimeline = statusTimelineValues.map(value => ({ value, label: statusLabel[value] }))

  const moduleDocuments = canReadSqlModules ? documents : []
  const moduleEmailThreads = canReadSqlModules ? emailThreads : []
  const modulePlanningEvents = canReadSqlModules ? planningEvents : []
  const visibleDocumentError = canReadSqlModules ? documentError : ''
  const visibleEmailError = canReadSqlModules ? emailError : ''
  const visiblePlanningError = canReadSqlModules ? planningError : ''
  const chantierDocuments = sortByDateDesc(
    moduleDocuments.filter(document =>
      document.chantierId === chantier.id ||
      chantierFactures.some(facture => facture.id === document.factureId),
    ),
  )
  const chantierEmailThreads = sortByDateDesc(
    moduleEmailThreads
      .filter(thread => thread.chantier?.id === chantier.id)
      .map(thread => ({
        ...thread,
        date: thread.lastMessageAt,
      })),
  )
  const planningRows = [...modulePlanningEvents].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  const upcomingPlanningRows = planningRows

  const assignedPeople = new Map<string, { name: string; role: string }>()
  if (chantier.chefChantier.trim()) {
    assignedPeople.set(`chef-${chantier.chefChantier}`, { name: chantier.chefChantier, role: 'Responsable chantier' })
  }
  for (const event of planningRows) {
    for (const assignment of event.assignmentsByChantier) {
      if (!assignment.user) continue
      const name = `${assignment.user.prenom} ${assignment.user.nom}`.trim()
      if (!name) continue
      assignedPeople.set(assignment.user.id, {
        name,
        role: assignment.assignmentRole || assignment.user.role,
      })
    }
  }
  const teamRows = Array.from(assignedPeople.values())

  const categoryRows = Object.entries(
    chantierFactures.reduce<Record<string, number>>((acc, facture) => {
      acc[facture.categorie] = (acc[facture.categorie] ?? 0) + facture.montantTTC
      return acc
    }, {}),
  )
    .map(([category, amount]) => ({
      category: category as CategorieDepense,
      label: categorieLabels[category as CategorieDepense] ?? category,
      amount,
      pct: percentOf(amount, Math.max(factureTotal, 1)),
      color: categoryColor[category as CategorieDepense] ?? '#EADBC8',
    }))
    .sort((a, b) => b.amount - a.amount)

  const monthlyRows = (selectedLine?.monthly ?? []).filter(month => month.planned || month.realized || month.invoiceSent)
  const lotRows = Object.entries(selectedLine?.lots ?? {})
    .filter(([, value]) => Number(value) !== 0)
    .sort(([, a], [, b]) => b - a)

  const activityRows: ActivityItem[] = sortByDateDesc([
    ...chantierFactures.map(facture => ({
      id: `facture-${facture.id}`,
      icon: ReceiptText,
      title: `Facture ${facture.numeroFacture}`,
      detail: `${facture.fournisseur} - ${formatEuros(facture.montantTTC)}`,
      date: facture.date,
    })),
    ...chantierDocuments.map(document => ({
      id: `document-${document.id}`,
      icon: FileText,
      title: document.title,
      detail: document.detail || document.folderName || 'Document rattache',
      date: document.date,
    })),
    ...chantierEmailThreads.map(thread => ({
      id: `email-${thread.id}`,
      icon: Mail,
      title: thread.subject,
      detail: thread.participantsSummary || `${thread.messageCount} message(s)`,
      date: thread.lastMessageAt,
    })),
    ...planningRows.map(event => ({
      id: `planning-${event.id}`,
      icon: CalendarDays,
      title: event.titre,
      detail: event.location || event.eventType,
      date: event.startAt,
    })),
  ]).slice(0, 8)

  const alerts = [
    budget > 0 && visibleExpenseTotal > budget
      ? {
          title: 'Budget depasse',
          detail: `${formatEuros(visibleExpenseTotal)} visibles pour ${formatEuros(budget)} budget.`,
        }
      : null,
    facturePendingCount > 0
      ? {
          title: 'Factures en attente',
          detail: `${facturePendingCount} facture${facturePendingCount > 1 ? 's' : ''} a traiter avant validation des depenses.`,
        }
      : null,
  ].filter((item): item is { title: string; detail: string } => Boolean(item))

  async function handleStatusChange(nextStatus: Chantier['statut']) {
    if (nextStatus === currentChantier.statut || isStatusSaving) return

    if (!canEditChantier) {
      setStatusFeedback("Statut non modifie: votre role n'autorise pas l'edition des chantiers.")
      return
    }

    const dateFin = nextStatus === 'cloture' ? new Date().toISOString().slice(0, 10) : null
    setIsStatusSaving(true)
    setStatusFeedback('')

    try {
      if (canWriteSql) {
        if (!isSqlCompatibleId(currentChantier.id)) {
          setStatusFeedback("Statut non modifie: ce chantier n'est pas une ligne operationnelle SQL.")
          return
        }

        await updateChantierStatutInSql({ id: currentChantier.id, statut: nextStatus, dateFin })
        updateChantierStatus(currentChantier.id, nextStatus, dateFin)
        setStatusFeedback(`Statut SQL Connect mis a jour: ${statusLabel[nextStatus]}.`)
      } else {
        updateChantierStatus(currentChantier.id, nextStatus, dateFin)
        setStatusFeedback("Statut mis a jour en fallback local uniquement. Cela ne prouve pas une ecriture SQL ni une donnee sandbox.")
      }
    } catch (error) {
      console.error(error)
      setStatusFeedback("Le statut n'a pas pu etre enregistre en SQL. Aucun fallback local silencieux n'a ete applique.")
    } finally {
      setIsStatusSaving(false)
    }
  }

  return (
    <div className="min-h-full bg-[#FAF6F2]">
      <div className="border-b border-[#F2E8DC] bg-white px-5 py-5 lg:px-8">
        <div className="mb-4 flex items-center gap-2 text-[12px] font-medium text-[#6B6B6B]">
          <button type="button" onClick={() => navigate('/chantiers')} className="hover:text-[#F06B21]">
            Chantiers
          </button>
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span className="truncate text-[#1E1E1E]">{chantier.nom}</span>
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-[#1E1E1E] lg:text-[30px]">{chantier.nom}</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyle[chantier.statut]}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {statusLabel[chantier.statut]}
              </span>
              <SourcePill label={sourceLabel} tone={sourceTone} />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-[#3C3C3C]">
              {client && (
                <Link to={`/clients/${client.id}`} className="inline-flex items-center gap-2 font-medium text-[#1E1E1E] hover:text-[#F06B21]">
                  <UserRound className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
                  {client.nom}
                </Link>
              )}
              {chantier.adresse && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
                  {chantier.adresse}
                </span>
              )}
              {formatDate(chantier.dateDebut) && (
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
                  Debut: {formatDate(chantier.dateDebut)}
                </span>
              )}
              {formatDate(chantier.dateFinPrevue) && (
                <span className="inline-flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
                  Fin prevue: {formatDate(chantier.dateFinPrevue)}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/clients/${chantier.clientId}`} className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#F2E8DC] bg-white px-4 text-sm font-medium text-[#1E1E1E] hover:bg-[#FAF6F2]">
              Fiche client
              <ExternalLink className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
            </Link>
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#F2E8DC] bg-white px-4 text-sm font-medium text-[#1E1E1E] hover:bg-[#FAF6F2]">
              <Share2 className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
              Partager
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 px-5 py-5 lg:px-8 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <main className="min-w-0 space-y-5">
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <SourcePill label={sourceLabel} tone={sourceTone} />
              {hasUnsyncedLocalChanges && <SourcePill label="Fallback non verite SQL" tone="local" />}
              {operationalError && <SourcePill label="SQL indisponible" tone="local" />}
              <SourcePill label={`Factures: ${chantierFactures.length}`} tone={isSqlSource ? 'sql' : sourceTone} />
              {selectedLine && <SourcePill label={`Excel ${selectedLine.exercise} ligne ${selectedLine.sourceRow}`} tone="static" />}
              {chantierDocuments.length > 0 && <SourcePill label={`Documents SQL: ${chantierDocuments.length}`} tone="sql" />}
              {chantierEmailThreads.length > 0 && <SourcePill label={`Emails SQL: ${chantierEmailThreads.length}`} tone="sql" />}
              {planningRows.length > 0 && <SourcePill label={`Planning SQL: ${planningRows.length}`} tone="sql" />}
            </div>
            <p className="mt-2 text-[12px] leading-5 text-[#6B6B6B]">
              {sourceDetail} Les modules equipe, planning, echeances, documents, emails et activite ne s'affichent que si une donnee reliee au chantier existe.
            </p>
            {(operationalError || visibleDocumentError || visibleEmailError || visiblePlanningError) && (
              <p className="mt-2 text-[12px] font-medium text-[#D95B17]">
                {[operationalError, visibleDocumentError, visibleEmailError, visiblePlanningError].filter(Boolean).join(' - ')}
              </p>
            )}
          </Card>

          <Card className="flex flex-col gap-4 p-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13px] font-semibold text-[#1E1E1E]">Statut chantier</p>
                <SourcePill label={canWriteSql ? 'Mutation SQL disponible' : 'Ecriture fallback local'} tone={canWriteSql ? 'sql' : 'local'} />
              </div>
              <p className="mt-1 text-[12px] text-[#6B6B6B]">
                UpdateChantierStatut est utilise quand Data Connect est la source active.
              </p>
              {statusFeedback && <p className="mt-2 text-[12px] font-medium text-[#D95B17]">{statusFeedback}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => void handleStatusChange(option.value)}
                  disabled={isStatusSaving || option.value === chantier.statut}
                  className={`h-9 rounded-[12px] border px-3 text-[12px] font-semibold transition-colors disabled:cursor-not-allowed ${
                    option.value === chantier.statut
                      ? 'border-[#F06B21] bg-[#FDEBDD] text-[#D95B17]'
                      : 'border-[#F2E8DC] bg-white text-[#3C3C3C] hover:bg-[#FAF6F2]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Progression statut</h2>
                <p className="mt-1 text-[12px] text-[#6B6B6B]">Statut courant: {statusLabel[chantier.statut]}</p>
              </div>
              {hasExceptionalStatus && (
                <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${statusStyle[chantier.statut]}`}>
                  {statusLabel[chantier.statut]}
                </span>
              )}
            </div>
            <div className="overflow-x-auto pb-2">
              <div className="grid min-w-[920px] items-start" style={{ gridTemplateColumns: `repeat(${statusTimeline.length}, minmax(0, 1fr))` }}>
                {statusTimeline.map((step, index) => {
                  const isDone = !hasExceptionalStatus && currentTimelineIndex >= 0 && index < currentTimelineIndex
                  const isActive = currentTimelineIndex >= 0 && index === currentTimelineIndex
                  const isFuture = currentTimelineIndex < 0 || index > currentTimelineIndex
                  const nextStep = statusTimeline[index + 1]
                  const segmentClass = isDone
                    ? 'bg-[#1E8E3E]'
                    : isActive && !hasExceptionalStatus
                      ? 'bg-[#F06B21]'
                      : 'bg-[#EADBC8]'
                  const dotClass = isDone
                    ? 'bg-[#1E8E3E] text-white'
                    : isActive
                      ? hasExceptionalStatus
                        ? 'bg-[#FDEBDD] text-[#F06B21]'
                        : 'bg-[#F06B21] text-white'
                      : 'bg-[#EADBC8] text-white'

                  return (
                    <div key={step.value} className="relative flex flex-col items-center text-center">
                      {nextStep && <span className={`absolute left-1/2 top-[15px] z-0 h-0.5 w-full ${segmentClass}`} />}
                      <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${dotClass}`}>
                        {isDone ? <Check className="h-4 w-4" strokeWidth={2.4} /> : isActive ? <CircleDot className="h-4 w-4" strokeWidth={2.3} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                      </div>
                      <p className={`mt-3 max-w-[110px] text-[11px] font-medium leading-tight ${isActive ? 'text-[#1E1E1E]' : isFuture ? 'text-[#6B6B6B]' : 'text-[#3C3C3C]'}`}>
                        {step.label}
                      </p>
                      {step.value === 'en_cours' && formatDate(chantier.dateDebut) && (
                        <p className="mt-1 text-[10px] text-[#6B6B6B]">Debut {formatDate(chantier.dateDebut)}</p>
                      )}
                      {step.value === 'cloture' && formatDate(chantier.dateFin) && (
                        <p className="mt-1 text-[10px] text-[#6B6B6B]">Fin {formatDate(chantier.dateFin)}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {budget > 0 && (
              <KpiCard label="Avancement financier" value={`${progress}%`} detail={`${formatEuros(visibleExpenseTotal)} / ${formatEuros(budget)}`}>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#F2E8DC]">
                  <div className="h-full rounded-full bg-[#F06B21]" style={{ width: `${progress}%` }} />
                </div>
              </KpiCard>
            )}
            {budget > 0 && <KpiCard label={selectedLine ? 'Budget Excel' : 'Budget chantier'} value={formatEuros(budget)} />}
            <KpiCard label={chantierFactures.length > 0 ? 'Factures TTC visibles' : selectedLine ? 'Realise Excel' : 'Depenses chargees'} value={formatEuros(visibleExpenseTotal)} />
            {budget > 0 && <KpiCard label="Marge visible" value={formatEuros(margin)} detail={`${marginPercent}% du budget`} />}
          </div>

          <div className="grid gap-5 2xl:grid-cols-[1fr_1fr]">
            <Card className="p-5">
              <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Informations chantier</h2>
              <div className="mt-4 space-y-3">
                {[
                  ['Client', client?.nom],
                  ['Adresse', chantier.adresse],
                  ['Type client', client?.type],
                  ['Statut', statusLabel[chantier.statut]],
                  ['Debut', formatDate(chantier.dateDebut)],
                  ['Fin prevue', formatDate(chantier.dateFinPrevue)],
                  ['Fin reelle', formatDate(chantier.dateFin)],
                  ['Responsable', chantier.chefChantier],
                  ['Source Excel', selectedLine ? `${selectedLine.sourceSheet} ligne ${selectedLine.sourceRow}` : null],
                  ['Categorie Excel', selectedLine ? previsionnelCategoryLabels[selectedLine.category] : null],
                ].filter(([, value]) => Boolean(value)).map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[116px_minmax(0,1fr)] gap-3 text-[13px]">
                    <span className="text-[#6B6B6B]">{label}</span>
                    <span className="font-medium text-[#1E1E1E]">{value}</span>
                  </div>
                ))}
                {chantier.description && (
                  <div className="pt-1 text-[13px] leading-5 text-[#3C3C3C]">
                    <span className="mb-1 block text-[#6B6B6B]">Description</span>
                    {chantier.description}
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Synthese financiere</h2>
                  <p className="mt-1 text-[12px] text-[#6B6B6B]">
                    Les categories viennent uniquement des factures rattachees au chantier.
                  </p>
                </div>
                <SourcePill label={chantierFactures.length > 0 ? 'Factures rattachees' : 'Aucune facture'} tone={chantierFactures.length > 0 ? sourceTone : 'static'} />
              </div>

              {categoryRows.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {categoryRows.map(item => (
                    <div key={item.category}>
                      <div className="mb-2 grid grid-cols-[minmax(0,1fr)_54px_92px] items-center gap-3 text-[12px]">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="truncate text-[#3C3C3C]">{item.label}</span>
                        </div>
                        <span className="text-right font-medium text-[#6B6B6B]">{item.pct}%</span>
                        <span className="text-right font-medium text-[#1E1E1E]">{formatEuros(item.amount)}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#F2E8DC]">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(item.pct, 100)}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyNotice>Aucune ventilation par facture rattachee n'est chargee pour ce chantier.</EmptyNotice>
              )}
            </Card>
          </div>

          <Card className="p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Factures rattachees au chantier</h2>
                <p className="mt-1 text-[12px] text-[#6B6B6B]">
                  Toute facture creee ou importee avec ce chantierId alimente cette liste, les totaux et l'activite.
                </p>
              </div>
              <SourcePill label={isSqlSource ? 'Factures SQL lues' : 'Factures visibles'} tone={sourceTone} />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                ['Nombre', `${chantierFactures.length}`],
                ['Total TTC visible', formatEuros(factureTotal)],
                ['Validees TTC', formatEuros(factureValidatedTotal)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[14px] bg-[#FAF6F2] p-3">
                  <p className="text-[12px] text-[#6B6B6B]">{label}</p>
                  <p className="mt-1 text-[18px] font-semibold text-[#1E1E1E]">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 overflow-hidden rounded-[14px] border border-[#F2E8DC]">
              <div className="hidden grid-cols-[minmax(0,1fr)_150px_120px_110px] gap-3 bg-[#FAF6F2] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B] md:grid">
                <span>Facture</span>
                <span>Fournisseur</span>
                <span>Statut</span>
                <span className="text-right">TTC</span>
              </div>
              <div className="divide-y divide-[#F2E8DC] bg-white">
                {sortByDateDesc(chantierFactures).slice(0, 10).map(facture => {
                  const status = factureStatusStyle[facture.statut] ?? factureStatusStyle.en_attente
                  return (
                    <div key={facture.id} className="grid gap-3 px-4 py-3 text-[13px] md:grid-cols-[minmax(0,1fr)_150px_120px_110px] md:items-center">
                      <span className="min-w-0">
                        <strong className="block truncate text-[#1E1E1E]">{facture.numeroFacture}</strong>
                        <small className="mt-1 block truncate text-[11px] text-[#6B6B6B]">{facture.description || 'Description non renseignee'}</small>
                      </span>
                      <span className="truncate text-[#3C3C3C]">{facture.fournisseur}</span>
                      <span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}>{status.label}</span>
                      <span className="font-semibold text-[#1E1E1E] md:text-right">{formatEuros(facture.montantTTC)}</span>
                    </div>
                  )
                })}
                {chantierFactures.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-[#6B6B6B]">
                    Aucune facture chargee pour ce chantier.
                  </p>
                )}
              </div>
            </div>

            {facturePendingCount > 0 && (
              <p className="mt-3 text-[12px] font-medium text-[#D95B17]">
                {facturePendingCount} facture{facturePendingCount > 1 ? 's' : ''} en attente.
              </p>
            )}
          </Card>

          {(monthlyRows.length > 0 || lotRows.length > 0) && (
            <div className="grid gap-5 2xl:grid-cols-[1.2fr_0.8fr]">
              {monthlyRows.length > 0 && (
                <Card className="overflow-hidden">
                  <div className="border-b border-[#F2E8DC] px-5 py-4">
                    <h2 className="text-[16px] font-semibold text-[#1E1E1E]">Mensualisation Excel</h2>
                    <p className="mt-1 text-[12px] text-[#6B6B6B]">Les cellules jaunes indiquent facture envoyee, pas paiement encaisse.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-[13px]">
                      <thead className="bg-[#FAF6F2] text-[12px] font-medium text-[#6B6B6B]">
                        <tr>
                          <th className="px-5 py-3">Mois</th>
                          <th className="px-5 py-3 text-right">Prevu</th>
                          <th className="px-5 py-3 text-right">Realise</th>
                          <th className="px-5 py-3">Facture envoyee</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyRows.map(month => (
                          <tr key={`${month.order}-${month.month}`} className="border-t border-[#F2E8DC]">
                            <td className="px-5 py-3 font-semibold text-[#1E1E1E]">{month.label}</td>
                            <td className="px-5 py-3 text-right text-[#3C3C3C]">{formatEuros(month.planned)}</td>
                            <td className="px-5 py-3 text-right font-semibold text-[#1E1E1E]">{formatEuros(month.realized)}</td>
                            <td className="px-5 py-3">
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${month.invoiceSent ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-[#FAF6F2] text-[#6B6B6B]'}`}>
                                {month.invoiceSent ? 'Oui' : 'Non'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {lotRows.length > 0 && (
                <Card className="p-5">
                  <h2 className="text-[16px] font-semibold text-[#1E1E1E]">Lots Excel</h2>
                  <p className="mt-1 text-[12px] text-[#6B6B6B]">Ventilation issue de la ligne source.</p>
                  <div className="mt-4 space-y-3">
                    {lotRows.map(([lot, value]) => (
                      <div key={lot} className="rounded-[14px] bg-[#FAF6F2] p-3">
                        <p className="text-[12px] capitalize text-[#6B6B6B]">{lot.replace(/_/g, ' ')}</p>
                        <p className="mt-1 font-semibold text-[#1E1E1E]">{formatEuros(value)}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {activityRows.length > 0 && (
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Activite recente</h2>
                <div className="flex flex-wrap gap-2">
                  {chantierFactures.length > 0 && <SourcePill label="Factures" tone={sourceTone} />}
                  {chantierDocuments.length > 0 && <SourcePill label="Documents SQL" tone="sql" />}
                  {chantierEmailThreads.length > 0 && <SourcePill label="Emails SQL" tone="sql" />}
                  {planningRows.length > 0 && <SourcePill label="Planning SQL" tone="sql" />}
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {activityRows.map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.id} className="flex items-start gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#FAF6F2] text-[#F06B21]">
                        <Icon className="h-4 w-4" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-[#1E1E1E]">{item.title}</p>
                        <p className="mt-1 truncate text-[12px] text-[#6B6B6B]">{item.detail}</p>
                      </div>
                      <span className="shrink-0 text-[11px] text-[#9CA3AF]">{formatDateTime(item.date) ?? formatDate(item.date)}</span>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {chantierDocuments.length > 0 && (
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Documents rattaches</h2>
                <SourcePill label="SQL Connect" tone="sql" />
              </div>
              <div className="mt-5 space-y-4">
                {chantierDocuments.slice(0, 8).map(document => (
                  <div key={document.id} className="grid grid-cols-[34px_minmax(0,1fr)_86px] items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#FAF6F2] text-[#F06B21]">
                      <FileText className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[#1E1E1E]">{document.title}</p>
                      <p className="mt-1 truncate text-[11px] text-[#6B6B6B]">{document.detail || document.folderName || document.kind}</p>
                    </div>
                    <span className="text-right text-[11px] text-[#9CA3AF]">{formatDate(document.date)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <LinkButton to={`/documents?chantierId=${chantier.id}`}>Voir les documents</LinkButton>
              </div>
            </Card>
          )}

          {chantierEmailThreads.length > 0 && (
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Emails rattaches</h2>
                <SourcePill label="SQL Connect" tone="sql" />
              </div>
              <div className="mt-5 space-y-4">
                {chantierEmailThreads.slice(0, 6).map(thread => (
                  <div key={thread.id} className="grid grid-cols-[34px_minmax(0,1fr)_86px] items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#FAF6F2] text-[#F06B21]">
                      <Mail className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[#1E1E1E]">{thread.subject}</p>
                      <p className="mt-1 truncate text-[11px] text-[#6B6B6B]">{thread.participantsSummary || `${thread.messageCount} message(s)`}</p>
                    </div>
                    <span className="text-right text-[11px] text-[#9CA3AF]">{formatDateTime(thread.lastMessageAt)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {planningRows.length > 0 && (
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Planning du chantier</h2>
                <SourcePill label="SQL Connect" tone="sql" />
              </div>
              <div className="mt-5 space-y-3">
                {planningRows.slice(0, 8).map(event => (
                  <div key={event.id} className="rounded-[14px] border border-[#F2E8DC] bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[#1E1E1E]">{event.titre}</p>
                        <p className="mt-1 text-[12px] text-[#6B6B6B]">
                          {formatDateTime(event.startAt)} - {formatDateTime(event.endAt)}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#FAF6F2] px-2.5 py-1 text-[11px] font-semibold text-[#6B6B6B]">{event.statut}</span>
                    </div>
                    {(event.location || event.notes) && (
                      <p className="mt-3 text-[12px] leading-5 text-[#6B6B6B]">{[event.location, event.notes].filter(Boolean).join(' - ')}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <LinkButton to="/planning">Voir le planning</LinkButton>
              </div>
            </Card>
          )}
        </main>

        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Actions rapides</h2>
            <div className="mt-4 space-y-2">
              <Link to={`/factures?chantierId=${chantier.id}`} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#F06B21] px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-[#D95B17]">
                <ReceiptText className="h-4 w-4" strokeWidth={2} />
                Nouvelle facture fournisseur
              </Link>
              <IconAction icon={Upload} to={`/documents?chantierId=${chantier.id}`}>
                Ajouter un document
              </IconAction>
              <IconAction icon={CalendarDays} to="/planning">
                Ouvrir le planning
              </IconAction>
            </div>
          </Card>

          {teamRows.length > 0 && (
            <Card className="p-5">
              <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Equipe affectee</h2>
              <div className="mt-4 space-y-4">
                {teamRows.map(member => (
                  <div key={`${member.name}-${member.role}`} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EADBC8] text-[12px] font-bold text-[#1E1E1E]">
                      {initials(member.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#1E1E1E]">{member.name}</p>
                      <p className="mt-0.5 truncate text-[11px] text-[#6B6B6B]">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {upcomingPlanningRows.length > 0 && (
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Echeances planning</h2>
                <SourcePill label="SQL" tone="sql" />
              </div>
              <div className="mt-4 space-y-3">
                {upcomingPlanningRows.slice(0, 4).map(event => (
                  <div key={event.id} className="rounded-[14px] bg-[#FAF6F2] p-3">
                    <p className="text-[13px] font-semibold text-[#1E1E1E]">{event.titre}</p>
                    <p className="mt-1 text-[11px] text-[#6B6B6B]">{formatDateTime(event.startAt)}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {alerts.length > 0 && (
            <Card className="p-5">
              <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Alertes calculees</h2>
              <div className="mt-4 space-y-4">
                {alerts.map(alert => (
                  <div key={alert.title} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#FDEBDD] text-[#F06B21]">
                      <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-[#1E1E1E]">{alert.title}</p>
                      <p className="mt-1 text-[11px] leading-4 text-[#6B6B6B]">{alert.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  )
}
