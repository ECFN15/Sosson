import { useEffect, useMemo, useState } from 'react'
import type { DragEvent, FormEvent, ReactNode } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GripVertical,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { isDataConnectEnabled } from '@/lib/dataconnect'
import {
  cancelPlanningEventInSql,
  completePlanningJobSheetInSql,
  createPlanningAssignmentInSql,
  createPlanningEventInSql,
  createPlanningJobSheetInSql,
  loadPlanningEventsByPeriodFromSql,
  updatePlanningJobSheetProgressInSql,
  updatePlanningEventDetailsInSql,
} from '@/features/planning/planningSql'
import { createWorkTimeEntryInSql, loadTeamDirectoryFromSql } from '@/features/team/teamSql'
import { loadMembers, loadTeams, themeOptions } from '@/lib/teamDirectory'

type PlanningStatus = 'planned' | 'blocked' | 'done' | 'cancelled'
type PlanningSource = 'loading' | 'sql' | 'sql-empty' | 'local-fallback'
type TeamDirectorySource = 'local' | 'loading-sql' | 'sql' | 'sql-empty' | 'sql-error'

type Team = {
  id: string
  label: string
  short: string
  people: number
  accent: string
  bg: string
  leadMemberId?: string
}

type PlanningItem = {
  id: string
  title: string
  chantierId: string
  teamId: string
  date: string
  startTime: string
  endTime: string
  status: PlanningStatus
  notes: string
  source: 'sql' | 'local'
  sqlEventId?: string
  assignmentId?: string
  leadMemberId?: string
  jobSheetId?: string
  jobSheetStatus?: string
  jobSheetInstructions?: string
  jobSheetCompletionNotes?: string
  plannedHours?: number
  actualHours?: number
  jobSheetWorkHours?: number
}

type PlanningDraft = Omit<PlanningItem, 'id' | 'source' | 'sqlEventId'>
type SqlPlanningEvent = Awaited<ReturnType<typeof loadPlanningEventsByPeriodFromSql>>[number]

const STORAGE_KEY = 'sosson.planning.items.v1'

const defaultPlanningTeams: Team[] = [
  { id: 'charpente', label: 'Equipe Charpente', short: 'Charpente', people: 4, accent: '#F06B21', bg: '#FDE9DB' },
  { id: 'couverture', label: 'Equipe Couverture', short: 'Couverture', people: 3, accent: '#6B91B5', bg: '#DCE9F2' },
  { id: 'menuiserie', label: 'Equipe Menuiserie', short: 'Menuiserie', people: 4, accent: '#C9A227', bg: '#FDEFC2' },
  { id: 'gros-oeuvre', label: 'Equipe Gros oeuvre', short: 'Gros oeuvre', people: 5, accent: '#A45A2C', bg: '#E8DCC5' },
  { id: 'terrassement', label: 'Equipe Terrassement', short: 'Terrassement', people: 3, accent: '#F89A62', bg: '#F9E6BF' },
]

const statusLabels: Record<PlanningStatus, string> = {
  planned: 'Planifie',
  blocked: 'Bloque',
  done: 'Termine',
  cancelled: 'Annule',
}

const planningSourceLabels: Record<PlanningSource, string> = {
  loading: 'SQL en lecture...',
  sql: 'Planning SQL',
  'sql-empty': 'Planning SQL vide',
  'local-fallback': 'Fallback local',
}

const teamDirectorySourceLabels: Record<TeamDirectorySource, string> = {
  local: 'Equipes locales',
  'loading-sql': 'Equipes SQL en lecture...',
  sql: 'Equipes finales SQL',
  'sql-empty': 'Equipes SQL vides',
  'sql-error': 'Equipes locales',
}

function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function makeShortTeamName(name: string) {
  return name.replace(/^equipe\s+/i, '').trim() || name
}

function directoryToPlanningTeams(
  directoryTeams: ReturnType<typeof loadTeams>,
  directoryMembers: ReturnType<typeof loadMembers>,
): Team[] {
  if (!directoryTeams.length) return defaultPlanningTeams

  return directoryTeams.map(team => {
    const theme = themeOptions[team.theme]
    const short = makeShortTeamName(team.name)
    const teamMembers = directoryMembers.filter(member => member.teamId === team.id)
    return {
      id: team.id,
      label: team.name,
      short,
      people: teamMembers.length,
      accent: theme.edge,
      bg: theme.bg,
      leadMemberId: teamMembers[0]?.id,
    }
  })
}

function loadPlanningTeams(): Team[] {
  return directoryToPlanningTeams(loadTeams(), loadMembers())
}

function normalizeStatus(value: string): PlanningStatus {
  if (value === 'cancelled') return value
  if (value === 'blocked' || value === 'done') return value
  return 'planned'
}

function dateTimeFromParts(date: string, time: string) {
  return new Date(`${date}T${time || '00:00'}:00`).toISOString()
}

function hoursBetween(startTime: string, endTime: string) {
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  const start = (Number.isFinite(startHour) ? startHour : 0) * 60 + (Number.isFinite(startMinute) ? startMinute : 0)
  const end = (Number.isFinite(endHour) ? endHour : 0) * 60 + (Number.isFinite(endMinute) ? endMinute : 0)
  return Math.max(0, Math.round(((end - start) / 60) * 100) / 100)
}

function positiveNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

function timeFromIso(value: string) {
  return new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function teamIdFromSqlEvent(event: SqlPlanningEvent, planningTeams: Team[]) {
  const sqlTeamId = event.assignmentsByPeriod[0]?.sossonTeam?.id
  if (sqlTeamId && planningTeams.some(team => team.id === sqlTeamId)) return sqlTeamId
  const role = event.assignmentsByPeriod[0]?.assignmentRole
  if (role && planningTeams.some(team => team.id === role)) return role
  if (planningTeams.some(team => team.id === event.eventType)) return event.eventType
  return planningTeams[0]?.id ?? ''
}

function sqlEventToPlanningItem(event: SqlPlanningEvent, planningTeams: Team[]): PlanningItem {
  const start = new Date(event.startAt)
  const assignment = event.assignmentsByPeriod[0]
  const jobSheet = event.jobSheetsByPeriod[0]
  const jobSheetWorkHours = jobSheet?.workTimesByPeriodJobSheet.reduce((sum, entry) => sum + Number(entry.hours ?? 0), 0)
  const teamId = teamIdFromSqlEvent(event, planningTeams)
  const team = planningTeams.find(item => item.id === teamId)
  return {
    id: event.id,
    sqlEventId: event.id,
    source: 'sql',
    title: event.titre,
    chantierId: event.chantier?.id ?? '',
    teamId,
    date: toDateKey(start),
    startTime: timeFromIso(event.startAt),
    endTime: timeFromIso(event.endAt),
    status: normalizeStatus(event.statut),
    notes: event.notes ?? '',
    assignmentId: assignment?.id,
    leadMemberId: jobSheet?.leadMember?.id ?? team?.leadMemberId,
    jobSheetId: jobSheet?.id,
    jobSheetStatus: jobSheet?.statut,
    jobSheetInstructions: jobSheet?.instructions ?? undefined,
    jobSheetCompletionNotes: jobSheet?.completionNotes ?? undefined,
    plannedHours: jobSheet?.plannedHours ?? hoursBetween(timeFromIso(event.startAt), timeFromIso(event.endAt)),
    actualHours: jobSheet?.actualHours ?? undefined,
    jobSheetWorkHours,
  }
}

function startOfWeek(date: Date) {
  const next = new Date(date)
  const day = next.getDay()
  const diff = day === 0 ? -6 : 1 - day
  next.setDate(next.getDate() + diff)
  next.setHours(0, 0, 0, 0)
  return next
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatShortDay(date: Date) {
  const label = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: '2-digit' }).format(date)
  return label.replace('.', '')
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)
}

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `planning-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function loadPlanningItems(): PlanningItem[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored) as PlanningItem[]
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter(item =>
        item
        && typeof item.id === 'string'
        && typeof item.title === 'string'
        && typeof item.teamId === 'string'
        && typeof item.date === 'string'
      )
      .map(item => ({ ...item, source: 'local' }))
  } catch {
    return []
  }
}

function buildInitialItems(weekStart: Date, chantierOptions: Array<{ id: string; nom: string }>, planningTeams: Team[]): PlanningItem[] {
  const firstChantier = chantierOptions[0]
  const secondChantier = chantierOptions[1] ?? firstChantier
  const thirdChantier = chantierOptions[2] ?? secondChantier
  const firstTeamId = planningTeams[0]?.id ?? defaultPlanningTeams[0].id
  const secondTeamId = planningTeams[1]?.id ?? planningTeams[0]?.id ?? defaultPlanningTeams[1].id
  const thirdTeamId = planningTeams[2]?.id ?? planningTeams[0]?.id ?? defaultPlanningTeams[2].id

  return [
    {
      id: makeId(),
      title: firstChantier ? `Intervention - ${firstChantier.nom}` : 'Intervention chantier',
      chantierId: firstChantier?.id ?? '',
      teamId: firstTeamId,
      date: toDateKey(weekStart),
      startTime: '08:00',
      endTime: '17:00',
      status: 'planned',
      notes: 'Ossature et levage.',
      source: 'local',
    },
    {
      id: makeId(),
      title: secondChantier ? `Couverture - ${secondChantier.nom}` : 'Couverture toiture',
      chantierId: secondChantier?.id ?? '',
      teamId: secondTeamId,
      date: toDateKey(addDays(weekStart, 1)),
      startTime: '08:00',
      endTime: '17:00',
      status: 'planned',
      notes: '',
      source: 'local',
    },
    {
      id: makeId(),
      title: thirdChantier ? `Point blocage - ${thirdChantier.nom}` : 'Point blocage chantier',
      chantierId: thirdChantier?.id ?? '',
      teamId: thirdTeamId,
      date: toDateKey(addDays(weekStart, 2)),
      startTime: '09:00',
      endTime: '11:00',
      status: 'blocked',
      notes: 'Verifier approvisionnement avant de confirmer la suite.',
      source: 'local',
    },
  ]
}

function createDraft(teamId: string, date: string, chantierId: string): PlanningDraft {
  return {
    title: '',
    chantierId,
    teamId,
    date,
    startTime: '08:00',
    endTime: '17:00',
    status: 'planned',
    notes: '',
  }
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[20px] border border-[#F2E8DC] bg-white ${className}`}>
      {children}
    </section>
  )
}

function IconButton({ label, children, onClick }: { label: string; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-[12px] border border-[#F2E8DC] bg-white text-[#1E1E1E] transition hover:border-[#EADBC8] hover:bg-[#FAF6F2]"
    >
      {children}
    </button>
  )
}

function statusClass(status: PlanningStatus) {
  if (status === 'cancelled') return 'bg-[#F3F4F6] text-[#6B7280]'
  if (status === 'blocked') return 'bg-[#FEE2E2] text-[#DC2626]'
  if (status === 'done') return 'bg-[#E7F5EA] text-[#2F7D46]'
  return 'bg-[#FDE9DB] text-[#F06B21]'
}

export function PlanningPage() {
  const { chantiers, user, dataSource } = useApp()
  const [planningTeams, setPlanningTeams] = useState<Team[]>(() => loadPlanningTeams())
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [items, setItems] = useState<PlanningItem[]>(() => {
    const stored = loadPlanningItems()
    return stored.length ? stored : buildInitialItems(startOfWeek(new Date()), chantiers, planningTeams)
  })
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null)
  const [draft, setDraft] = useState<PlanningDraft | null>(null)
  const [feedback, setFeedback] = useState('')
  const [jobSheetDraft, setJobSheetDraft] = useState({
    instructions: '',
    plannedHours: '7',
    actualHours: '7',
    checklist: '',
    materials: '',
    blockers: '',
    completionNotes: '',
  })
  const [planningSource, setPlanningSource] = useState<PlanningSource>('local-fallback')
  const [teamDirectorySource, setTeamDirectorySource] = useState<TeamDirectorySource>('local')
  const [teamDirectoryMessage, setTeamDirectoryMessage] = useState('Equipes lues depuis le repertoire local.')
  const canUsePlanningSql = dataSource === 'dataconnect' && isDataConnectEnabled && Boolean(user)
  const effectivePlanningSource: PlanningSource = canUsePlanningSql ? planningSource : 'local-fallback'
  const shouldWritePlanningToSql = canUsePlanningSql && effectivePlanningSource !== 'local-fallback'
  const missingSqlTeamDirectory = shouldWritePlanningToSql && teamDirectorySource !== 'sql'
  const canCreatePlanningCard = planningTeams.length > 0 && !missingSqlTeamDirectory && teamDirectorySource !== 'loading-sql' && planningSource !== 'loading'

  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart])
  const weekDateKeys = useMemo(() => new Set(days.map(toDateKey)), [days])
  const visibleItems = useMemo(() => items.filter(item => weekDateKeys.has(item.date)), [items, weekDateKeys])
  const selectedItem = selectedId ? items.find(item => item.id === selectedId) ?? null : null
  const chantierOptions = chantiers.length ? chantiers : []
  const defaultChantierId = chantierOptions[0]?.id ?? ''

  useEffect(() => {
    if (!selectedItem) return
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      const plannedHours = (selectedItem.plannedHours ?? hoursBetween(selectedItem.startTime, selectedItem.endTime)) || 7
      const actualHours = selectedItem.actualHours ?? selectedItem.jobSheetWorkHours ?? plannedHours
      setJobSheetDraft({
        instructions: selectedItem.jobSheetInstructions ?? selectedItem.notes,
        plannedHours: String(plannedHours),
        actualHours: String(actualHours),
        checklist: '',
        materials: '',
        blockers: '',
        completionNotes: selectedItem.jobSheetCompletionNotes ?? '',
      })
    })
    return () => {
      cancelled = true
    }
  }, [selectedItem])

  useEffect(() => {
    if (effectivePlanningSource !== 'local-fallback') return
    const localItems = items.filter(item => item.source === 'local').map(item => ({
      id: item.id,
      title: item.title,
      chantierId: item.chantierId,
      teamId: item.teamId,
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
      status: item.status,
      notes: item.notes,
      source: 'local' as const,
    }))
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(localItems))
  }, [effectivePlanningSource, items])

  useEffect(() => {
    if (!canUsePlanningSql) {
      let cancelled = false
      queueMicrotask(() => {
        if (cancelled) return
        setTeamDirectorySource('local')
        setTeamDirectoryMessage('Equipes lues depuis le repertoire local.')
        setPlanningTeams(loadPlanningTeams())
      })
      return () => {
        cancelled = true
      }
    }

    let mounted = true

    async function loadSqlTeamDirectory() {
      setTeamDirectorySource('loading-sql')
      setTeamDirectoryMessage('Lecture des equipes finales SQL pour le planning.')

      try {
        const directory = await loadTeamDirectoryFromSql()
        if (!mounted) return

        if (directory.teams.length > 0) {
          const nextTeams = directoryToPlanningTeams(directory.teams, directory.members)
          setPlanningTeams(nextTeams)
          setTeamDirectorySource('sql')
          setTeamDirectoryMessage(`${nextTeams.length} equipe(s) finale(s) et ${directory.members.length} fiche(s) membre relues depuis SQL.`)
          setDraft(prev => {
            if (!prev || nextTeams.some(team => team.id === prev.teamId)) return prev
            return { ...prev, teamId: nextTeams[0]?.id ?? defaultPlanningTeams[0].id }
          })
        } else {
          setPlanningTeams([])
          setSelectedId(null)
          setDraft(null)
          setTeamDirectorySource('sql-empty')
          setTeamDirectoryMessage('SQL repond mais aucune equipe finale Sosson n existe encore. Creez une equipe finale avant de planifier en SQL.')
        }
      } catch (error) {
        if (!mounted) return
        setPlanningTeams(loadPlanningTeams())
        setTeamDirectorySource('sql-error')
        setTeamDirectoryMessage(`Equipes SQL indisponibles: ${error instanceof Error ? error.message : String(error)}.`)
      }
    }

    void loadSqlTeamDirectory()

    return () => {
      mounted = false
    }
  }, [canUsePlanningSql])

  useEffect(() => {
    if (!canUsePlanningSql) return

    let mounted = true

    async function loadSqlPlanning() {
      setPlanningSource('loading')
      const periodEnd = addDays(weekStart, 7)
      periodEnd.setMilliseconds(periodEnd.getMilliseconds() - 1)

      try {
        const sqlEvents = await loadPlanningEventsByPeriodFromSql({
          startAt: weekStart.toISOString(),
          endAt: periodEnd.toISOString(),
        })
        if (!mounted) return
        const sqlItems = sqlEvents.filter(event => event.statut !== 'cancelled').map(event => sqlEventToPlanningItem(event, planningTeams))
        setItems(sqlItems)
        setSelectedId(planningTeams.length ? sqlItems[0]?.id ?? null : null)
        setDraft(null)
        setPlanningSource(sqlItems.length ? 'sql' : 'sql-empty')
      } catch (error) {
        console.info('Planning SQL Connect indisponible, fallback local visible.', error)
        if (!mounted) return
        setPlanningSource('local-fallback')
        setFeedback('Planning SQL indisponible: affichage du fallback local.')
      }
    }

    void loadSqlPlanning()

    return () => {
      mounted = false
    }
  }, [canUsePlanningSql, planningTeams, weekStart])

  function getChantierName(chantierId: string) {
    return chantierOptions.find(chantier => chantier.id === chantierId)?.nom ?? 'Sans chantier'
  }

  function openCreate(teamId = planningTeams[0]?.id ?? '', date = toDateKey(days[0])) {
    if (!planningTeams.length) {
      setFeedback(canUsePlanningSql
        ? 'Creation bloquee: aucune equipe finale SQL n est disponible pour le planning.'
        : 'Creation bloquee: aucune equipe locale n est disponible.')
      return
    }
    if (missingSqlTeamDirectory) {
      setFeedback('Creation bloquee: selectionnez une equipe finale SQL avant d enregistrer une carte durable.')
      return
    }
    const selectedTeamId = planningTeams.some(team => team.id === teamId) ? teamId : planningTeams[0].id
    setSelectedId(null)
    setDraft(createDraft(selectedTeamId, date, defaultChantierId))
  }

  function openEdit(item: PlanningItem) {
    setSelectedId(item.id)
    setDraft({
      title: item.title,
      chantierId: item.chantierId,
      teamId: item.teamId,
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
      status: item.status,
      notes: item.notes,
    })
  }

  function closeEditor() {
    setDraft(null)
  }

  async function submitDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft) return

    const title = draft.title.trim()
    if (!title) return

    if (selectedId) {
      const currentItem = items.find(item => item.id === selectedId)
      if (currentItem?.source === 'sql') {
        if (teamDirectorySource !== 'sql' || !isUuidLike(draft.teamId)) {
          setFeedback('Modification bloquee: une carte SQL doit rester rattachee a une equipe finale SQL.')
          return
        }
        try {
          await updatePlanningEventDetailsInSql({
            id: currentItem.sqlEventId ?? currentItem.id,
            chantierId: draft.chantierId || null,
            titre: title,
            eventType: draft.teamId,
            statut: draft.status,
            startAt: dateTimeFromParts(draft.date, draft.startTime),
            endAt: dateTimeFromParts(draft.date, draft.endTime),
            location: null,
            notes: draft.notes || null,
          })
        } catch (error) {
          console.info('Mise a jour planning SQL impossible.', error)
          setFeedback('Modification non enregistree: SQL Connect est indisponible.')
          return
        }
      }

      setItems(prev => prev.map(item => (item.id === selectedId ? { ...item, ...draft, title } : item)))
      setDraft(null)
      setFeedback(currentItem?.source === 'sql' ? 'Carte planning mise a jour en SQL.' : 'Carte locale modifiee.')
      return
    }

    const nextItem: PlanningItem = {
      ...draft,
      id: makeId(),
      title,
      source: 'local',
    }

    if (shouldWritePlanningToSql) {
      if (teamDirectorySource !== 'sql' || !isUuidLike(draft.teamId)) {
        setFeedback('Carte non creee: une equipe finale SQL est requise.')
        return
      }
      try {
        const eventId = await createPlanningEventInSql({
          chantierId: draft.chantierId || null,
          titre: title,
          eventType: draft.teamId,
          statut: draft.status,
          startAt: dateTimeFromParts(draft.date, draft.startTime),
          endAt: dateTimeFromParts(draft.date, draft.endTime),
          location: null,
          notes: draft.notes || null,
        })

        const assignmentId = await createPlanningAssignmentInSql({
          eventId,
          userId: null,
          sossonTeamId: isUuidLike(draft.teamId) ? draft.teamId : null,
          assignmentRole: draft.teamId,
          statut: draft.status,
          notes: null,
        })
        const team = planningTeams.find(item => item.id === draft.teamId)
        const jobSheetId = await createPlanningJobSheetInSql({
          eventId,
          assignmentId,
          chantierId: draft.chantierId || null,
          sossonTeamId: isUuidLike(draft.teamId) ? draft.teamId : null,
          leadMemberId: team?.leadMemberId && isUuidLike(team.leadMemberId) ? team.leadMemberId : null,
          titre: title,
          statut: 'ready',
          instructions: draft.notes || null,
          plannedHours: hoursBetween(draft.startTime, draft.endTime),
          actualHours: null,
          checklist: null,
          materials: null,
          blockers: null,
        })

        nextItem.id = eventId
        nextItem.sqlEventId = eventId
        nextItem.source = 'sql'
        nextItem.assignmentId = assignmentId
        nextItem.leadMemberId = team?.leadMemberId
        nextItem.jobSheetId = jobSheetId
        nextItem.jobSheetStatus = 'ready'
        nextItem.jobSheetInstructions = draft.notes
        nextItem.plannedHours = hoursBetween(draft.startTime, draft.endTime)
        setPlanningSource('sql')
      } catch (error) {
        console.info('Creation planning SQL impossible.', error)
        setFeedback('Carte non creee: SQL Connect est indisponible. Aucun fallback local silencieux en mode SQL.')
        return
      }
    }

    setItems(prev => [nextItem, ...prev])
    setSelectedId(nextItem.id)
    setDraft(null)
    if (nextItem.source === 'sql') setFeedback('Carte planning creee en SQL.')
    else setFeedback('Carte locale creee dans le fallback planning visible.')
  }

  async function saveSelectedJobSheet() {
    if (!selectedItem || selectedItem.source !== 'sql') {
      setFeedback('La fiche intervention demande une carte planning SQL.')
      return
    }

    const plannedHours = positiveNumber(jobSheetDraft.plannedHours)
    const actualHours = positiveNumber(jobSheetDraft.actualHours)
    const team = planningTeams.find(item => item.id === selectedItem.teamId)
    if (teamDirectorySource !== 'sql' || !isUuidLike(selectedItem.teamId)) {
      setFeedback('Fiche intervention non enregistree: la carte doit etre rattachee a une equipe finale SQL.')
      return
    }

    try {
      let jobSheetId = selectedItem.jobSheetId
      if (!jobSheetId) {
        jobSheetId = await createPlanningJobSheetInSql({
          eventId: selectedItem.sqlEventId ?? selectedItem.id,
          assignmentId: selectedItem.assignmentId ?? null,
          chantierId: selectedItem.chantierId || null,
          sossonTeamId: isUuidLike(selectedItem.teamId) ? selectedItem.teamId : null,
          leadMemberId: selectedItem.leadMemberId && isUuidLike(selectedItem.leadMemberId)
            ? selectedItem.leadMemberId
            : team?.leadMemberId && isUuidLike(team.leadMemberId)
              ? team.leadMemberId
              : null,
          titre: selectedItem.title,
          statut: 'ready',
          instructions: jobSheetDraft.instructions.trim() || null,
          plannedHours,
          actualHours: actualHours || null,
          checklist: jobSheetDraft.checklist.trim() || null,
          materials: jobSheetDraft.materials.trim() || null,
          blockers: jobSheetDraft.blockers.trim() || null,
        })
      } else {
        await updatePlanningJobSheetProgressInSql({
          id: jobSheetId,
          statut: actualHours > 0 ? 'in_progress' : selectedItem.jobSheetStatus ?? 'ready',
          instructions: jobSheetDraft.instructions.trim() || null,
          plannedHours,
          actualHours: actualHours || null,
          checklist: jobSheetDraft.checklist.trim() || null,
          materials: jobSheetDraft.materials.trim() || null,
          blockers: jobSheetDraft.blockers.trim() || null,
          completionNotes: jobSheetDraft.completionNotes.trim() || null,
          proofStoragePath: null,
          proofSha256: null,
          reportStoragePath: null,
          reportSha256: null,
        })
      }

      const nextStatus = actualHours > 0 ? 'in_progress' : 'ready'
      setItems(prev => prev.map(item => (
        item.id === selectedItem.id
          ? {
              ...item,
              jobSheetId,
              jobSheetStatus: nextStatus,
              jobSheetInstructions: jobSheetDraft.instructions.trim(),
              jobSheetCompletionNotes: jobSheetDraft.completionNotes.trim(),
              plannedHours,
              actualHours: actualHours || undefined,
              leadMemberId: item.leadMemberId ?? team?.leadMemberId,
            }
          : item
      )))
      setFeedback('Fiche intervention enregistree en SQL.')
    } catch (error) {
      console.info('Fiche intervention SQL impossible.', error)
      setFeedback(`Fiche intervention non enregistree: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async function submitSelectedJobSheetHours() {
    if (!selectedItem || selectedItem.source !== 'sql' || !selectedItem.jobSheetId) {
      setFeedback('Creez d abord la fiche intervention SQL.')
      return
    }

    const team = planningTeams.find(item => item.id === selectedItem.teamId)
    const memberId = selectedItem.leadMemberId ?? team?.leadMemberId
    if (!memberId || !isUuidLike(memberId)) {
      setFeedback('Impossible de saisir les heures: aucun membre SQL pilote dans cette equipe.')
      return
    }

    const hours = positiveNumber(jobSheetDraft.actualHours)
    if (hours <= 0) {
      setFeedback('Renseignez des heures reelles superieures a zero.')
      return
    }

    try {
      await createWorkTimeEntryInSql({
        memberId,
        chantierId: selectedItem.chantierId || null,
        planningEventId: selectedItem.sqlEventId ?? selectedItem.id,
        planningAssignmentId: selectedItem.assignmentId ?? null,
        jobSheetId: selectedItem.jobSheetId,
        workDate: selectedItem.date,
        hours,
        kind: 'chantier',
        status: 'submitted',
        notes: jobSheetDraft.completionNotes.trim() || `Heures issues de la fiche ${selectedItem.title}`,
      })
      setItems(prev => prev.map(item => (
        item.id === selectedItem.id
          ? {
              ...item,
              actualHours: hours,
              jobSheetWorkHours: Number(item.jobSheetWorkHours ?? 0) + hours,
              jobSheetStatus: 'in_progress',
              leadMemberId: memberId,
            }
          : item
      )))
      setFeedback('Heures chantier rattachees a la fiche intervention SQL.')
    } catch (error) {
      console.info('Saisie heures fiche intervention impossible.', error)
      setFeedback(`Heures non enregistrees: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async function completeSelectedJobSheet() {
    if (!selectedItem || selectedItem.source !== 'sql' || !selectedItem.jobSheetId) {
      setFeedback('Creez d abord la fiche intervention SQL.')
      return
    }

    const actualHours = positiveNumber(jobSheetDraft.actualHours)
    try {
      await completePlanningJobSheetInSql({
        id: selectedItem.jobSheetId,
        actualHours: actualHours || null,
        completionNotes: jobSheetDraft.completionNotes.trim() || null,
        proofStoragePath: null,
        proofSha256: null,
        reportStoragePath: null,
        reportSha256: null,
      })
      setItems(prev => prev.map(item => (
        item.id === selectedItem.id
          ? {
              ...item,
              jobSheetStatus: 'completed',
              status: 'done',
              actualHours: actualHours || item.actualHours,
              jobSheetCompletionNotes: jobSheetDraft.completionNotes.trim(),
            }
          : item
      )))
      setFeedback('Fiche intervention terminee en SQL.')
    } catch (error) {
      console.info('Cloture fiche intervention impossible.', error)
      setFeedback(`Fiche non terminee: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async function deleteSelected() {
    if (!selectedId) return
    const currentItem = items.find(item => item.id === selectedId)
    if (currentItem?.source === 'sql') {
      try {
        const cancellationNote = [
          currentItem.notes.trim(),
          `Annule depuis la page Planning le ${new Date().toISOString()}.`,
        ].filter(Boolean).join('\n')
        await cancelPlanningEventInSql({
          id: currentItem.sqlEventId ?? currentItem.id,
          notes: cancellationNote,
        })
      } catch (error) {
        console.info('Annulation planning SQL impossible.', error)
        setFeedback('Annulation non enregistree: SQL Connect est indisponible.')
        return
      }

      setItems(prev => prev.filter(item => item.id !== selectedId))
      setSelectedId(null)
      setDraft(null)
      setFeedback('Carte planning annulee en SQL et masquee de la vue active.')
      return
    }

    setItems(prev => prev.filter(item => item.id !== selectedId))
    setSelectedId(null)
    setDraft(null)
    setFeedback('Carte locale supprimee.')
  }

  async function moveItem(itemId: string, teamId: string, date: string) {
    const currentItem = items.find(item => item.id === itemId)
    if (currentItem?.source === 'sql') {
      if (teamDirectorySource !== 'sql' || !isUuidLike(teamId)) {
        setFeedback('Deplacement bloque: une carte SQL doit rester rattachee a une equipe finale SQL.')
        return
      }
      try {
        await updatePlanningEventDetailsInSql({
          id: currentItem.sqlEventId ?? currentItem.id,
          chantierId: currentItem.chantierId || null,
          titre: currentItem.title,
          eventType: teamId,
          statut: currentItem.status,
          startAt: dateTimeFromParts(date, currentItem.startTime),
          endAt: dateTimeFromParts(date, currentItem.endTime),
          location: null,
          notes: currentItem.notes || null,
        })
      } catch (error) {
        console.info('Deplacement planning SQL impossible.', error)
        setFeedback('Deplacement non enregistre: SQL Connect est indisponible.')
        return
      }
    }

    setItems(prev => prev.map(item => (item.id === itemId ? { ...item, teamId, date } : item)))
    setSelectedId(itemId)
    setDraft(null)
    setFeedback(currentItem?.source === 'sql' ? 'Carte planning deplacee en SQL.' : 'Carte locale deplacee.')
  }

  function onDragStart(event: DragEvent<HTMLButtonElement>, itemId: string) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', itemId)
  }

  function onDrop(event: DragEvent<HTMLDivElement>, teamId: string, date: string) {
    event.preventDefault()
    const itemId = event.dataTransfer.getData('text/plain')
    if (itemId) void moveItem(itemId, teamId, date)
  }

  function itemsForCell(teamId: string, date: string) {
    return visibleItems
      .filter(item => item.teamId === teamId && item.date === date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const weekLabel = `${formatLongDate(days[0])} - ${formatLongDate(days[6])}`

  return (
    <div className="min-h-full bg-[#FAF6F2] px-6 py-6">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-[26px] font-semibold leading-tight text-[#1E1E1E]">Planning chantier</h1>
          <p className="mt-1 text-sm text-[#3C3C3C]">
            Creez, modifiez et deplacez les cartes directement dans la semaine.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-[10px] border border-[#F2E8DC] bg-white px-3 py-1.5 font-semibold text-[#3C3C3C]">
              Source: {planningSourceLabels[effectivePlanningSource]}
            </span>
            <span className="rounded-[10px] border border-[#F2E8DC] bg-white px-3 py-1.5 font-semibold text-[#3C3C3C]" title={teamDirectoryMessage}>
              Equipes: {teamDirectorySourceLabels[teamDirectorySource]}
            </span>
            {feedback ? (
              <button
                type="button"
                onClick={() => setFeedback('')}
                className="rounded-[10px] border border-[#F2E8DC] bg-white px-3 py-1.5 text-left font-medium text-[#D95B17]"
              >
                {feedback}
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <IconButton label="Semaine precedente" onClick={() => setWeekStart(prev => addDays(prev, -7))}>
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          </IconButton>
          <div className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[#F2E8DC] bg-white px-4 text-sm font-medium text-[#1E1E1E]">
            <CalendarDays className="h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
            {weekLabel}
          </div>
          <IconButton label="Semaine suivante" onClick={() => setWeekStart(prev => addDays(prev, 7))}>
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </IconButton>
          <button
            type="button"
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            className="inline-flex h-10 items-center justify-center rounded-[12px] border border-[#F2E8DC] bg-white px-4 text-sm font-medium text-[#3C3C3C] transition hover:border-[#EADBC8] hover:text-[#1E1E1E]"
          >
            Aujourd'hui
          </button>
          <button
            type="button"
            onClick={() => openCreate()}
            disabled={!canCreatePlanningCard}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] bg-[#F06B21] px-4 text-sm font-semibold text-white transition hover:bg-[#D95B17] disabled:cursor-not-allowed disabled:bg-[#CFC7BE] disabled:text-white"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Nouvelle carte
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="min-w-0 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[128px_repeat(7,minmax(112px,1fr))] border-b border-[#F2E8DC]">
                <div className="border-r border-[#F2E8DC] bg-white p-4 text-[12px] font-semibold uppercase text-[#6B6B6B]">
                  Equipes
                </div>
                {days.map(day => {
                  const dateKey = toDateKey(day)
                  const dayCount = visibleItems.filter(item => item.date === dateKey).length

                  return (
                    <div key={dateKey} className="border-r border-[#F2E8DC] bg-white p-4 last:border-r-0">
                      <p className="text-sm font-semibold capitalize text-[#1E1E1E]">{formatShortDay(day)}</p>
                      <p className="mt-1 text-[11px] text-[#6B6B6B]">{dayCount} carte{dayCount > 1 ? 's' : ''}</p>
                    </div>
                  )
                })}
              </div>

              {planningTeams.map(team => (
                <div key={team.id} className="grid min-h-[132px] grid-cols-[128px_repeat(7,minmax(112px,1fr))] border-b border-[#F2E8DC] last:border-b-0">
                  <div className="border-r border-[#F2E8DC] bg-white p-3">
                    <div className="mb-2 h-2 w-8 rounded-full" style={{ backgroundColor: team.accent }} />
                    <p className="text-[13px] font-semibold leading-tight text-[#1E1E1E]">{team.short}</p>
                    <p className="mt-1 text-[11px] text-[#6B6B6B]">{team.people} pers.</p>
                  </div>
                  {days.map(day => {
                    const dateKey = toDateKey(day)
                    const cellItems = itemsForCell(team.id, dateKey)

                    return (
                      <div
                        key={`${team.id}-${dateKey}`}
                        onDragOver={event => event.preventDefault()}
                        onDrop={event => onDrop(event, team.id, dateKey)}
                        className="min-h-[132px] border-r border-[#F2E8DC] bg-white p-2 last:border-r-0"
                      >
                        <button
                          type="button"
                          onClick={() => openCreate(team.id, dateKey)}
                          className="mb-2 flex h-8 w-full items-center justify-center gap-1 rounded-[10px] border border-dashed border-[#EADBC8] text-[12px] font-medium text-[#6B6B6B] transition hover:border-[#F06B21] hover:text-[#F06B21]"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                          Ajouter
                        </button>

                        <div className="space-y-2">
                          {cellItems.map(item => (
                            <button
                              key={item.id}
                              type="button"
                              draggable
                              onDragStart={event => onDragStart(event, item.id)}
                              onClick={() => {
                                setSelectedId(item.id)
                                setDraft(null)
                              }}
                              className={`w-full rounded-[10px] border-l-[3px] p-2 text-left transition hover:translate-y-[-1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F06B21]/30 ${
                                selectedId === item.id ? 'ring-2 ring-[#F06B21]/25' : ''
                              }`}
                              style={{ backgroundColor: team.bg, borderColor: team.accent }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="min-w-0 truncate text-[12px] font-semibold text-[#1E1E1E]">{item.title}</p>
                                <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6B6B6B]" strokeWidth={1.75} />
                              </div>
                              <p className="mt-1 truncate text-[11px] text-[#3C3C3C]">{getChantierName(item.chantierId)}</p>
                              <div className="mt-2 flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#1E1E1E]">
                                  <Clock3 className="h-3 w-3" strokeWidth={1.75} />
                                  {item.startTime}-{item.endTime}
                                </span>
                                <span className={`rounded-[7px] px-1.5 py-0.5 text-[10px] font-semibold ${statusClass(item.status)}`}>
                                  {statusLabels[item.status]}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
              {planningTeams.length === 0 ? (
                <div className="grid min-h-[132px] place-items-center border-b border-[#F2E8DC] bg-white px-6 text-center">
                  <div>
                    <p className="text-sm font-semibold text-[#1E1E1E]">Aucune equipe finale disponible pour le planning</p>
                    <p className="mt-1 text-[12px] text-[#6B6B6B]">{teamDirectoryMessage}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Card>

        <aside className="space-y-5">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[#1E1E1E]">{draft ? (selectedId ? 'Modifier la carte' : 'Creer une carte') : 'Carte selectionnee'}</h2>
                <p className="mt-1 text-[12px] text-[#6B6B6B]">{visibleItems.length} carte{visibleItems.length > 1 ? 's' : ''} cette semaine</p>
              </div>
              {draft ? (
                <button
                  type="button"
                  aria-label="Fermer"
                  title="Fermer"
                  onClick={closeEditor}
                  className="grid h-9 w-9 place-items-center rounded-[10px] border border-[#F2E8DC] text-[#6B6B6B] hover:text-[#1E1E1E]"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              ) : null}
            </div>

            {draft ? (
              <form className="space-y-4" onSubmit={event => void submitDraft(event)}>
                <label className="block">
                  <span className="text-[12px] font-medium text-[#3C3C3C]">Titre</span>
                  <input
                    value={draft.title}
                    onChange={event => setDraft({ ...draft, title: event.target.value })}
                    className="mt-1 h-10 w-full rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-sm text-[#1E1E1E] outline-none focus:border-[#F06B21]"
                    placeholder="Ex: Pose bardage"
                  />
                </label>

                <label className="block">
                  <span className="text-[12px] font-medium text-[#3C3C3C]">Chantier</span>
                  <select
                    value={draft.chantierId}
                    onChange={event => setDraft({ ...draft, chantierId: event.target.value })}
                    className="mt-1 h-10 w-full rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-sm text-[#1E1E1E] outline-none focus:border-[#F06B21]"
                  >
                    {chantierOptions.length ? (
                      chantierOptions.map(chantier => (
                        <option key={chantier.id} value={chantier.id}>
                          {chantier.nom}
                        </option>
                      ))
                    ) : (
                      <option value="">Sans chantier</option>
                    )}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[12px] font-medium text-[#3C3C3C]">Equipe</span>
                    <select
                      value={draft.teamId}
                      onChange={event => setDraft({ ...draft, teamId: event.target.value })}
                      className="mt-1 h-10 w-full rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-sm text-[#1E1E1E] outline-none focus:border-[#F06B21]"
                    >
                      {planningTeams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.short}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-[12px] font-medium text-[#3C3C3C]">Date</span>
                    <input
                      type="date"
                      value={draft.date}
                      onChange={event => setDraft({ ...draft, date: event.target.value })}
                      className="mt-1 h-10 w-full rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-sm text-[#1E1E1E] outline-none focus:border-[#F06B21]"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[12px] font-medium text-[#3C3C3C]">Debut</span>
                    <input
                      type="time"
                      value={draft.startTime}
                      onChange={event => setDraft({ ...draft, startTime: event.target.value })}
                      className="mt-1 h-10 w-full rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-sm text-[#1E1E1E] outline-none focus:border-[#F06B21]"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[12px] font-medium text-[#3C3C3C]">Fin</span>
                    <input
                      type="time"
                      value={draft.endTime}
                      onChange={event => setDraft({ ...draft, endTime: event.target.value })}
                      className="mt-1 h-10 w-full rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-sm text-[#1E1E1E] outline-none focus:border-[#F06B21]"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-[12px] font-medium text-[#3C3C3C]">Statut</span>
                  <select
                    value={draft.status}
                    onChange={event => setDraft({ ...draft, status: event.target.value as PlanningStatus })}
                    className="mt-1 h-10 w-full rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-sm text-[#1E1E1E] outline-none focus:border-[#F06B21]"
                  >
                    <option value="planned">Planifie</option>
                    <option value="blocked">Bloque</option>
                    <option value="done">Termine</option>
                    {draft.status === 'cancelled' ? <option value="cancelled">Annule</option> : null}
                  </select>
                </label>

                <label className="block">
                  <span className="text-[12px] font-medium text-[#3C3C3C]">Notes</span>
                  <textarea
                    value={draft.notes}
                    onChange={event => setDraft({ ...draft, notes: event.target.value })}
                    className="mt-1 min-h-[82px] w-full resize-none rounded-[10px] border border-[#F2E8DC] bg-white px-3 py-2 text-sm text-[#1E1E1E] outline-none focus:border-[#F06B21]"
                    placeholder="Details utiles pour l'equipe"
                  />
                </label>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-[12px] bg-[#F06B21] px-4 text-sm font-semibold text-white transition hover:bg-[#D95B17]"
                  >
                    <Save className="h-4 w-4" strokeWidth={1.75} />
                    Enregistrer
                  </button>
                  {selectedId ? (
                    <button
                      type="button"
                      onClick={deleteSelected}
                      className="grid h-10 w-10 place-items-center rounded-[12px] border border-[#F2E8DC] text-[#DC2626] transition hover:bg-[#FEE2E2]"
                      aria-label="Annuler ou retirer la carte"
                      title="Annuler ou retirer la carte"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  ) : null}
                </div>
              </form>
            ) : selectedItem ? (
              <div className="space-y-4">
                <div>
                  <p className="text-[12px] font-medium text-[#6B6B6B]">Titre</p>
                  <p className="mt-1 text-base font-semibold text-[#1E1E1E]">{selectedItem.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[12px] font-medium text-[#6B6B6B]">Chantier</p>
                    <p className="mt-1 text-[#1E1E1E]">{getChantierName(selectedItem.chantierId)}</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-[#6B6B6B]">Date</p>
                    <p className="mt-1 text-[#1E1E1E]">{formatLongDate(parseDateKey(selectedItem.date))}</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-[#6B6B6B]">Equipe</p>
                    <p className="mt-1 text-[#1E1E1E]">{planningTeams.find(team => team.id === selectedItem.teamId)?.short}</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-[#6B6B6B]">Horaire</p>
                    <p className="mt-1 text-[#1E1E1E]">{selectedItem.startTime} - {selectedItem.endTime}</p>
                  </div>
                </div>
                {selectedItem.notes ? (
                  <div>
                    <p className="text-[12px] font-medium text-[#6B6B6B]">Notes</p>
                    <p className="mt-1 text-sm text-[#1E1E1E]">{selectedItem.notes}</p>
                  </div>
                ) : null}
                {selectedItem.source === 'sql' ? (
                  <div className="rounded-[14px] border border-[#F2E8DC] bg-[#FAF6F2] p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[12px] font-semibold uppercase text-[#6B6B6B]">Fiche intervention</p>
                        <p className="mt-1 text-[13px] font-semibold text-[#1E1E1E]">
                          {selectedItem.jobSheetId ? 'Fiche SQL active' : 'A creer depuis cette carte'}
                        </p>
                      </div>
                      <span className={`rounded-[8px] px-2 py-1 text-[11px] font-semibold ${statusClass(selectedItem.jobSheetStatus === 'completed' ? 'done' : selectedItem.jobSheetStatus === 'blocked' ? 'blocked' : 'planned')}`}>
                        {selectedItem.jobSheetStatus ?? 'draft'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={jobSheetDraft.plannedHours}
                        onChange={event => setJobSheetDraft(prev => ({ ...prev, plannedHours: event.target.value }))}
                        type="number"
                        min="0"
                        step="0.25"
                        className="h-9 rounded-[10px] border border-[#F2E8DC] bg-white px-2 text-[12px] outline-none focus:border-[#F06B21]"
                        placeholder="Heures prevues"
                      />
                      <input
                        value={jobSheetDraft.actualHours}
                        onChange={event => setJobSheetDraft(prev => ({ ...prev, actualHours: event.target.value }))}
                        type="number"
                        min="0"
                        step="0.25"
                        className="h-9 rounded-[10px] border border-[#F2E8DC] bg-white px-2 text-[12px] outline-none focus:border-[#F06B21]"
                        placeholder="Heures reelles"
                      />
                      <textarea
                        value={jobSheetDraft.instructions}
                        onChange={event => setJobSheetDraft(prev => ({ ...prev, instructions: event.target.value }))}
                        rows={3}
                        className="col-span-2 resize-none rounded-[10px] border border-[#F2E8DC] bg-white px-2 py-2 text-[12px] outline-none focus:border-[#F06B21]"
                        placeholder="Consignes chantier"
                      />
                      <input
                        value={jobSheetDraft.checklist}
                        onChange={event => setJobSheetDraft(prev => ({ ...prev, checklist: event.target.value }))}
                        className="col-span-2 h-9 rounded-[10px] border border-[#F2E8DC] bg-white px-2 text-[12px] outline-none focus:border-[#F06B21]"
                        placeholder="Checklist, separee par virgules"
                      />
                      <input
                        value={jobSheetDraft.materials}
                        onChange={event => setJobSheetDraft(prev => ({ ...prev, materials: event.target.value }))}
                        className="col-span-2 h-9 rounded-[10px] border border-[#F2E8DC] bg-white px-2 text-[12px] outline-none focus:border-[#F06B21]"
                        placeholder="Materiel / approvisionnement"
                      />
                      <textarea
                        value={jobSheetDraft.completionNotes}
                        onChange={event => setJobSheetDraft(prev => ({ ...prev, completionNotes: event.target.value }))}
                        rows={2}
                        className="col-span-2 resize-none rounded-[10px] border border-[#F2E8DC] bg-white px-2 py-2 text-[12px] outline-none focus:border-[#F06B21]"
                        placeholder="Retour terrain / fin intervention"
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => void saveSelectedJobSheet()}
                        className="h-9 rounded-[10px] bg-[#1E1E1E] px-2 text-[11px] font-semibold text-white transition hover:bg-[#2A2A2A]"
                      >
                        Sauver
                      </button>
                      <button
                        type="button"
                        onClick={() => void submitSelectedJobSheetHours()}
                        disabled={!selectedItem.jobSheetId}
                        className="h-9 rounded-[10px] border border-[#F2E8DC] bg-white px-2 text-[11px] font-semibold text-[#1E1E1E] transition hover:border-[#F06B21] disabled:cursor-not-allowed disabled:text-[#9CA3AF]"
                      >
                        Heures
                      </button>
                      <button
                        type="button"
                        onClick={() => void completeSelectedJobSheet()}
                        disabled={!selectedItem.jobSheetId}
                        className="h-9 rounded-[10px] bg-[#F06B21] px-2 text-[11px] font-semibold text-white transition hover:bg-[#D95B17] disabled:cursor-not-allowed disabled:bg-[#D99A72]"
                      >
                        Terminer
                      </button>
                    </div>
                    <p className="mt-3 text-[11px] text-[#6B6B6B]">
                      {Number(selectedItem.jobSheetWorkHours ?? 0).toFixed(1)} h deja reliees a cette fiche.
                    </p>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => openEdit(selectedItem)}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[12px] border border-[#F2E8DC] bg-white px-4 text-sm font-semibold text-[#1E1E1E] transition hover:border-[#EADBC8]"
                >
                  <Pencil className="h-4 w-4" strokeWidth={1.75} />
                  Modifier
                </button>
              </div>
            ) : (
              <div className="rounded-[14px] border border-dashed border-[#EADBC8] bg-[#FFF9F4] p-4 text-sm text-[#6B6B6B]">
                Selectionnez une carte ou cliquez sur Ajouter dans une case du planning.
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  )
}
