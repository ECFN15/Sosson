import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import {
  CalendarDays,
  Camera,
  Car,
  CheckCircle2,
  Clock3,
  FileText,
  Fuel,
  HardHat,
  MessageSquare,
  Mic,
  MicOff,
  Navigation,
  Paperclip,
  Route,
  Send,
  ShieldCheck,
  Upload,
  UsersRound,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import {
  leaveTypeLabels,
  loadLeaves,
  loadMembers,
  loadTeams,
  planningMonths,
} from '@/lib/teamDirectory'
import type { LeaveType, TeamMember } from '@/lib/teamDirectory'
import {
  addCoworkLeaveRequest,
  addCoworkMessage,
  getCoworkRealtimePreference,
  loadCoworkReportDraft,
  saveCoworkReportDraft,
  subscribeCoworkLeaveRequests,
  subscribeCoworkMessages,
} from '@/features/cowork/coworkRealtime'
import type {
  CoworkLeaveRequest,
  CoworkMessage,
  CoworkRealtimeSource,
  CoworkReportDraft,
  CoworkReportFile,
} from '@/features/cowork/coworkTypes'
import { loadFuelStations } from '@/features/cowork/fuelProvider'
import type { FuelStation } from '@/features/cowork/fuelProvider'
import {
  hashDocumentFile,
  validateDocumentUploadFile,
} from '@/features/documents/storagePaths'

type StoredPlanningItem = {
  id: string
  title: string
  chantierId: string
  teamId: string
  date: string
  startTime: string
  endTime: string
  status: 'planned' | 'blocked' | 'done' | 'cancelled'
  notes: string
}

type SpeechRecognitionAlternative = {
  transcript: string
}

type SpeechRecognitionResult = {
  isFinal: boolean
  0: SpeechRecognitionAlternative
}

type SpeechRecognitionResultList = {
  length: number
  item: (index: number) => SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

type SpeechRecognitionEventLike = Event & {
  resultIndex: number
  results: SpeechRecognitionResultList
}

type SpeechRecognitionInstance = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance
type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

const PLANNING_STORAGE_KEY = 'sosson.planning.items.v1'
const DEPOT_ADDRESS = 'Sosson depot, Valence, France'

const statusLabels: Record<StoredPlanningItem['status'], string> = {
  planned: 'Planifie',
  blocked: 'Point bloquant',
  done: 'Termine',
  cancelled: 'Annule',
}

const statusStyles: Record<StoredPlanningItem['status'], string> = {
  planned: 'bg-[#FDE9DB] text-[#D95B17]',
  blocked: 'bg-[#FEE2E2] text-[#DC2626]',
  done: 'bg-[#E7F5EA] text-[#2F7D46]',
  cancelled: 'bg-[#F3F0EC] text-[#6B6B6B]',
}

const routeImpactLabels: Record<FuelStation['routeImpact'], string> = {
  near_site: 'Pres du chantier',
  on_route: 'Sur trajet',
  near_depot: 'Pres depot',
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[20px] border border-[#F2E8DC] bg-white ${className}`}>{children}</section>
}

function IconBadge({ children, tone = 'light' }: { children: ReactNode; tone?: 'light' | 'dark' }) {
  return (
    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-[14px] ${tone === 'dark' ? 'bg-[#1E1E1E] text-[#F06B21]' : 'bg-[#FDEBDD] text-[#F06B21]'}`}>
      {children}
    </span>
  )
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' }).format(date)
}

function formatTime(value: string) {
  return value || '--:--'
}

function makeId(prefix: string) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function readPlanningItems(): StoredPlanningItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(PLANNING_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is StoredPlanningItem =>
      item &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.chantierId === 'string' &&
      typeof item.teamId === 'string' &&
      typeof item.date === 'string',
    )
  } catch {
    return []
  }
}

function normalizeName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function findConnectedMember(members: TeamMember[], userEmail: string, fullName: string) {
  const normalizedFullName = normalizeName(fullName)
  return members.find(member => member.email.toLowerCase() === userEmail.toLowerCase()) ??
    members.find(member => normalizeName(`${member.firstName} ${member.lastName}`) === normalizedFullName) ??
    null
}

function mapsDirectionsUrl(destination: string) {
  const url = new URL('https://www.google.com/maps/dir/')
  url.searchParams.set('api', '1')
  url.searchParams.set('origin', DEPOT_ADDRESS)
  url.searchParams.set('destination', destination)
  url.searchParams.set('travelmode', 'driving')
  return url.toString()
}

function mapsEmbedUrl(destination: string) {
  const url = new URL('https://maps.google.com/maps')
  url.searchParams.set('q', destination)
  url.searchParams.set('output', 'embed')
  return url.toString()
}

function speechRecognitionConstructor() {
  if (typeof window === 'undefined') return null
  const speechWindow = window as SpeechWindow
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null
}

function monthDayCount(month: string) {
  const monthIndex = planningMonths.indexOf(month)
  if (monthIndex < 0) return 31
  return new Date(new Date().getFullYear(), monthIndex + 1, 0).getDate()
}

export function CoworkPage() {
  const { user, chantiers, clients, dataSource } = useApp()
  const today = useMemo(() => new Date(), [])
  const todayKey = toDateKey(today)
  const members = useMemo(() => loadMembers(), [])
  const teams = useMemo(() => loadTeams(), [])
  const baseLeaves = useMemo(() => loadLeaves(), [])
  const connectedMember = useMemo(() => {
    if (!user) return null
    return findConnectedMember(members, user.email, `${user.prenom} ${user.nom}`)
  }, [members, user])
  const activeTeam = useMemo(() => {
    if (connectedMember) return teams.find(team => team.id === connectedMember.teamId) ?? teams[0] ?? null
    if (user?.role === 'assistante') return teams.find(team => team.theme === 'administratif') ?? teams[0] ?? null
    return teams[0] ?? null
  }, [connectedMember, teams, user?.role])
  const teamMembers = useMemo(
    () => members.filter(member => member.teamId === activeTeam?.id),
    [activeTeam?.id, members],
  )
  const profileLabel = user?.role === 'chef_chantier' || user?.role === 'ouvrier' ? 'App terrain par defaut' : 'Vue supervision COWORK'

  const planningItems = useMemo(() => {
    const stored = readPlanningItems()
    const teamScoped = activeTeam ? stored.filter(item => item.teamId === activeTeam.id) : stored
    return teamScoped.filter(item => item.date === todayKey)
  }, [activeTeam, todayKey])

  const assignedChantiers = useMemo(() => {
    if (!user) return chantiers
    const userName = normalizeName(`${user.prenom} ${user.nom}`)
    const memberSites = connectedMember?.activeSites.map(normalizeName) ?? []
    const direct = chantiers.filter(chantier =>
      normalizeName(chantier.chefChantier).includes(userName) ||
      memberSites.some(site => normalizeName(chantier.nom).includes(site) || site.includes(normalizeName(chantier.nom))),
    )
    if (direct.length) return direct
    return chantiers.filter(chantier => chantier.statut === 'en_cours').slice(0, 3)
  }, [chantiers, connectedMember, user])

  const selectedPlanning = planningItems[0] ?? null
  const selectedChantier = useMemo(() => {
    const planned = selectedPlanning ? chantiers.find(chantier => chantier.id === selectedPlanning.chantierId) : null
    return planned ?? assignedChantiers[0] ?? chantiers[0] ?? null
  }, [assignedChantiers, chantiers, selectedPlanning])
  const selectedClient = selectedChantier ? clients.find(client => client.id === selectedChantier.clientId) ?? null : null
  const syntheticPlanning = useMemo<StoredPlanningItem>(() => ({
    id: 'cowork-synthetic-today',
    title: selectedChantier ? `Intervention - ${selectedChantier.nom}` : 'Intervention a affecter',
    chantierId: selectedChantier?.id ?? '',
    teamId: activeTeam?.id ?? '',
    date: todayKey,
    startTime: '08:00',
    endTime: '17:00',
    status: selectedChantier?.tendance === 'rouge' ? 'blocked' : 'planned',
    notes: selectedChantier?.description ?? 'Aucune carte planning trouvee pour aujourd hui.',
  }), [activeTeam?.id, selectedChantier, todayKey])
  const mainPlanning = selectedPlanning ?? syntheticPlanning

  const [fuelStations, setFuelStations] = useState<FuelStation[]>([])
  const [fuelMessage, setFuelMessage] = useState('')
  const [fuelSource, setFuelSource] = useState<'api' | 'mock'>('mock')
  const [messages, setMessages] = useState<CoworkMessage[]>([])
  const [messageSource, setMessageSource] = useState<CoworkRealtimeSource>('local')
  const [messageText, setMessageText] = useState('')
  const [leaveRequests, setLeaveRequests] = useState<CoworkLeaveRequest[]>([])
  const [leaveSource, setLeaveSource] = useState<CoworkRealtimeSource>('local')
  const [leaveMonth, setLeaveMonth] = useState(planningMonths[today.getMonth()])
  const [leaveType, setLeaveType] = useState<LeaveType>('conges')
  const [leaveStartDay, setLeaveStartDay] = useState('1')
  const [leaveEndDay, setLeaveEndDay] = useState('1')
  const [leaveNote, setLeaveNote] = useState('')
  const [reportText, setReportText] = useState('')
  const [transcript, setTranscript] = useState('')
  const [reportFiles, setReportFiles] = useState<CoworkReportFile[]>([])
  const [reportFeedback, setReportFeedback] = useState('')
  const [reportSource, setReportSource] = useState<CoworkRealtimeSource>('local')
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const teamId = activeTeam?.id ?? 'cowork-general'
  const reportDraftId = `cowork-report-${user?.id ?? 'anonymous'}-${todayKey}`

  useEffect(() => {
    let cancelled = false
    async function loadStations() {
      const result = await loadFuelStations({ chantier: selectedChantier, depotAddress: DEPOT_ADDRESS })
      if (cancelled) return
      setFuelStations(result.stations)
      setFuelSource(result.source)
      setFuelMessage(result.message)
    }

    void loadStations()
    return () => {
      cancelled = true
    }
  }, [selectedChantier])

  useEffect(() => {
    return subscribeCoworkMessages(teamId, (nextMessages, source) => {
      setMessages(nextMessages)
      setMessageSource(source)
    })
  }, [teamId])

  useEffect(() => {
    return subscribeCoworkLeaveRequests(teamId, (nextRequests, source) => {
      setLeaveRequests(nextRequests)
      setLeaveSource(source)
    })
  }, [teamId])

  useEffect(() => {
    let cancelled = false
    async function loadDraft() {
      const draft = await loadCoworkReportDraft(reportDraftId)
      if (!draft || cancelled) return
      setReportText(draft.noteText)
      setTranscript(draft.transcript)
      setReportFiles(draft.files)
      setReportSource(draft.source)
    }

    void loadDraft()
    return () => {
      cancelled = true
    }
  }, [reportDraftId])

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanText = messageText.trim()
    if (!cleanText || !user) return
    const source = await addCoworkMessage({
      teamId,
      authorId: user.id,
      authorName: `${user.prenom} ${user.nom}`,
      authorRole: user.role,
      text: cleanText,
    })
    setMessageSource(source)
    setMessageText('')
  }

  async function persistReport(nextText = reportText, nextTranscript = transcript, nextFiles = reportFiles) {
    if (!user) return
    const draft: CoworkReportDraft = {
      id: reportDraftId,
      teamId,
      userId: user.id,
      chantierId: selectedChantier?.id ?? '',
      noteText: nextText,
      transcript: nextTranscript,
      files: nextFiles,
      updatedAt: new Date().toISOString(),
      source: reportSource,
    }
    const source = await saveCoworkReportDraft(draft)
    setReportSource(source)
    setReportFeedback(source === 'firestore'
      ? 'Brouillon terrain synchronise. Les fichiers restent a envoyer dans Storage.'
      : 'Brouillon local sauvegarde. Ce n est pas encore une preuve Storage durable.')
  }

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    const nextFiles: CoworkReportFile[] = []

    for (const file of files) {
      const validationError = validateDocumentUploadFile(file)
      if (validationError) {
        setReportFeedback(`${file.name}: ${validationError}`)
        continue
      }
      const sha256 = await hashDocumentFile(file)
      const fileId = makeId('cowork-file')
      nextFiles.push({
        id: fileId,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        sha256,
        localReference: `${selectedChantier?.id ?? 'sans-chantier'}:${fileId}`,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        localStatus: 'local_preview',
      })
    }

    if (nextFiles.length) {
      const merged = [...nextFiles, ...reportFiles]
      setReportFiles(merged)
      await persistReport(reportText, transcript, merged)
    }
    event.target.value = ''
  }

  function startVoiceNote() {
    const SpeechRecognition = speechRecognitionConstructor()
    if (!SpeechRecognition) {
      setReportFeedback("Transcription vocale indisponible dans ce navigateur. Vous pouvez saisir la note au clavier.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'fr-FR'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onresult = event => {
      let finalText = ''
      let interimText = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index] ?? event.results.item(index)
        if (result.isFinal) finalText += result[0].transcript
        else interimText += result[0].transcript
      }
      if (finalText) {
        setTranscript(current => {
          const next = `${current} ${finalText}`.trim()
          void persistReport(reportText, next, reportFiles)
          return next
        })
      } else if (interimText) {
        setReportFeedback(`Ecoute: ${interimText}`)
      }
    }
    recognition.onerror = () => {
      setIsRecording(false)
      setReportFeedback("La dictee vocale s'est arretee. Le texte deja transcrit est conserve.")
    }
    recognition.onend = () => setIsRecording(false)
    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
    setReportFeedback('Dictee vocale active. Parlez, la note sera transcrite ici.')
  }

  function stopVoiceNote() {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsRecording(false)
  }

  async function submitLeave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!activeTeam) return
    const member = connectedMember ?? teamMembers[0]
    if (!member) return
    const startDay = Math.max(1, Math.min(monthDayCount(leaveMonth), Number(leaveStartDay) || 1))
    const endDay = Math.max(startDay, Math.min(monthDayCount(leaveMonth), Number(leaveEndDay) || startDay))
    const source = await addCoworkLeaveRequest({
      teamId,
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
      type: leaveType,
      month: leaveMonth,
      startDay,
      endDay,
      note: leaveNote.trim(),
    })
    setLeaveSource(source)
    setLeaveNote('')
  }

  const teamLeaves = useMemo(() => {
    const memberIds = new Set(teamMembers.map(member => member.id))
    return baseLeaves.filter(leave => memberIds.has(leave.memberId))
  }, [baseLeaves, teamMembers])

  const calendarDays = Array.from({ length: monthDayCount(leaveMonth) }, (_, index) => index + 1)
  const routeUrl = selectedChantier ? mapsDirectionsUrl(selectedChantier.adresse) : ''
  const mapUrl = selectedChantier ? mapsEmbedUrl(selectedChantier.adresse) : ''
  const bestFuelPrice = fuelStations[0]?.dieselPrice ?? 0

  return (
    <div className="min-h-full bg-[#FAF6F2] p-4 sm:p-6 xl:p-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5">
        <section className="overflow-hidden rounded-[24px] border border-[#EADBC8] bg-[#1E1E1E] text-white shadow-[0_18px_44px_rgba(30,30,30,0.12)]">
          <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-6">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#3C3C3C] bg-[#2A2A2A] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#F06B21]">
                  <UsersRound className="h-3.5 w-3.5" strokeWidth={1.75} />
                  COWORK
                </span>
                <span className="rounded-full bg-[#2A1A0D] px-3 py-1 text-[11px] font-semibold text-[#FDEBDD]">
                  {profileLabel}
                </span>
                <span className="rounded-full bg-[#242424] px-3 py-1 text-[11px] font-semibold text-[#C9C9C9]">
                  Temps reel: {messageSource === 'firestore' || leaveSource === 'firestore' ? 'source externe' : 'fallback local'}
                </span>
              </div>
              <h1 className="max-w-3xl text-[34px] font-semibold leading-[1.02] text-white sm:text-[44px]">
                Journee terrain, messages et rapports au meme endroit.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#C9C9C9]">
                COWORK sert d'app terrain pour les equipes chantier et de cockpit de suivi pour le bureau. Les donnees validees restent cote SQL Connect; les flux vivants restent en fallback local tant que le modele SQL dedie n'est pas cree.
              </p>
            </div>
            <div className="rounded-[20px] border border-[#3C3C3C] bg-[#242424] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A8A8A]">Aujourdhui</p>
              <p className="mt-2 text-[24px] font-semibold capitalize leading-tight text-white">{formatShortDate(today)}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-[14px] bg-[#1E1E1E] p-3">
                  <p className="text-[18px] font-semibold text-[#F06B21]">{planningItems.length || 1}</p>
                  <p className="mt-1 text-[10px] text-[#A3A3A3]">cartes</p>
                </div>
                <div className="rounded-[14px] bg-[#1E1E1E] p-3">
                  <p className="text-[18px] font-semibold text-[#F06B21]">{teamMembers.length}</p>
                  <p className="mt-1 text-[10px] text-[#A3A3A3]">equipe</p>
                </div>
                <div className="rounded-[14px] bg-[#1E1E1E] p-3">
                  <p className="text-[18px] font-semibold text-[#F06B21]">{bestFuelPrice ? bestFuelPrice.toFixed(2) : '--'}</p>
                  <p className="mt-1 text-[10px] text-[#A3A3A3]">gasoil</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <main className="grid gap-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="p-5">
                <div className="mb-5 flex items-start gap-3">
                  <IconBadge><CalendarDays className="h-5 w-5" strokeWidth={1.75} /></IconBadge>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#F06B21]">Planning du jour</p>
                    <h2 className="mt-1 text-[18px] font-semibold text-[#1E1E1E]">{mainPlanning.title}</h2>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[14px] bg-[#FAF6F2] p-3">
                    <p className="text-[11px] text-[#6B6B6B]">Horaire</p>
                    <p className="mt-1 text-[15px] font-semibold text-[#1E1E1E]">{formatTime(mainPlanning.startTime)} - {formatTime(mainPlanning.endTime)}</p>
                  </div>
                  <div className="rounded-[14px] bg-[#FAF6F2] p-3">
                    <p className="text-[11px] text-[#6B6B6B]">Etat</p>
                    <span className={`mt-1 inline-flex rounded-[8px] px-2 py-1 text-[12px] font-semibold ${statusStyles[mainPlanning.status]}`}>
                      {statusLabels[mainPlanning.status]}
                    </span>
                  </div>
                  <div className="rounded-[14px] bg-[#FAF6F2] p-3">
                    <p className="text-[11px] text-[#6B6B6B]">Equipe</p>
                    <p className="mt-1 truncate text-[15px] font-semibold text-[#1E1E1E]">{activeTeam?.name ?? 'A affecter'}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-[#3C3C3C]">{mainPlanning.notes}</p>
              </Card>

              <Card className="p-5">
                <div className="mb-5 flex items-start gap-3">
                  <IconBadge><HardHat className="h-5 w-5" strokeWidth={1.75} /></IconBadge>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#F06B21]">Affectation</p>
                    <h2 className="mt-1 truncate text-[18px] font-semibold text-[#1E1E1E]">{selectedChantier?.nom ?? 'Aucun chantier'}</h2>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-[14px] border border-[#F2E8DC] bg-[#FAF6F2] p-3">
                    <p className="text-[11px] text-[#6B6B6B]">Client</p>
                    <p className="mt-1 text-[15px] font-semibold text-[#1E1E1E]">{selectedClient?.nom ?? 'Client non renseigne'}</p>
                  </div>
                  <div className="rounded-[14px] border border-[#F2E8DC] bg-[#FAF6F2] p-3">
                    <p className="text-[11px] text-[#6B6B6B]">Adresse</p>
                    <p className="mt-1 text-sm font-medium text-[#1E1E1E]">{selectedChantier?.adresse ?? 'Adresse non renseignee'}</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="overflow-hidden">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-h-[260px] bg-[#EADBC8]">
                  {mapUrl ? (
                    <iframe
                      title="Carte chantier"
                      src={mapUrl}
                      className="h-full min-h-[260px] w-full border-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-full min-h-[260px] place-items-center text-sm text-[#6B6B6B]">Carte indisponible</div>
                  )}
                </div>
                <div className="p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <IconBadge><Route className="h-5 w-5" strokeWidth={1.75} /></IconBadge>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#F06B21]">Itineraire</p>
                      <h2 className="text-[17px] font-semibold text-[#1E1E1E]">Depot vers client</h2>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="rounded-[14px] bg-[#FAF6F2] p-3">
                      <p className="text-[11px] text-[#6B6B6B]">Depart</p>
                      <p className="mt-1 font-semibold text-[#1E1E1E]">{DEPOT_ADDRESS}</p>
                    </div>
                    <div className="rounded-[14px] bg-[#FAF6F2] p-3">
                      <p className="text-[11px] text-[#6B6B6B]">Arrivee</p>
                      <p className="mt-1 font-semibold text-[#1E1E1E]">{selectedChantier?.adresse ?? 'A affecter'}</p>
                    </div>
                  </div>
                  {routeUrl && (
                    <a
                      href={routeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#F06B21] px-4 text-sm font-semibold text-white transition hover:bg-[#D95B17]"
                    >
                      <Navigation className="h-4 w-4" strokeWidth={1.75} />
                      Ouvrir l itineraire
                    </a>
                  )}
                </div>
              </div>
            </Card>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
              <Card className="p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <IconBadge><Fuel className="h-5 w-5" strokeWidth={1.75} /></IconBadge>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#F06B21]">Gasoil trajet</p>
                      <h2 className="mt-1 text-[18px] font-semibold text-[#1E1E1E]">Stations a comparer</h2>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#FAF6F2] px-3 py-1 text-[11px] font-semibold text-[#6B6B6B]">
                    {fuelSource === 'api' ? 'API' : 'Mock'}
                  </span>
                </div>
                <p className="mb-4 text-sm leading-6 text-[#6B6B6B]">{fuelMessage}</p>
                <div className="space-y-3">
                  {fuelStations.map(station => (
                    <div key={station.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-[14px] border border-[#F2E8DC] bg-[#FAF6F2] p-3">
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-[#1E1E1E]">{station.name}</p>
                        <p className="mt-1 truncate text-[11px] text-[#6B6B6B]">{routeImpactLabels[station.routeImpact]} - {station.distanceKm.toFixed(1)} km</p>
                      </div>
                      <p className="text-[18px] font-semibold text-[#F06B21]">{station.dieselPrice.toFixed(2)} EUR</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <div className="mb-4 flex items-start gap-3">
                  <IconBadge><Car className="h-5 w-5" strokeWidth={1.75} /></IconBadge>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#F06B21]">Optimisation cout</p>
                    <h2 className="mt-1 text-[18px] font-semibold text-[#1E1E1E]">Decision rapide</h2>
                  </div>
                </div>
                <div className="rounded-[16px] bg-[#1E1E1E] p-4 text-white">
                  <p className="text-[12px] text-[#C9C9C9]">Station conseillee</p>
                  <p className="mt-2 text-[20px] font-semibold">{fuelStations[0]?.name ?? 'Aucune station'}</p>
                  <p className="mt-2 text-sm leading-6 text-[#C9C9C9]">
                    Connecter un provider reel permettra de comparer les prix sur l itineraire et pres du chantier sans modifier la page.
                  </p>
                </div>
              </Card>
            </div>
          </main>

          <aside className="grid gap-5">
            <Card className="flex min-h-[430px] flex-col p-5">
              <div className="mb-4 flex items-center gap-3">
                <IconBadge><MessageSquare className="h-5 w-5" strokeWidth={1.75} /></IconBadge>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#F06B21]">Chat equipe</p>
                  <h2 className="text-[18px] font-semibold text-[#1E1E1E]">{activeTeam?.name ?? 'General'}</h2>
                </div>
              </div>
              <div className="mb-3 rounded-[14px] bg-[#FAF6F2] p-3 text-[12px] leading-5 text-[#6B6B6B]">
                {getCoworkRealtimePreference()}
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {messages.length ? messages.map(message => (
                  <div key={message.id} className="rounded-[14px] border border-[#F2E8DC] bg-[#FAF6F2] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-[13px] font-semibold text-[#1E1E1E]">{message.authorName}</p>
                      <span className="text-[10px] text-[#6B6B6B]">{new Date(message.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="mt-2 text-sm leading-5 text-[#3C3C3C]">{message.text}</p>
                  </div>
                )) : (
                  <div className="rounded-[14px] border border-dashed border-[#EADBC8] bg-[#FFF9F4] p-4 text-sm text-[#6B6B6B]">
                    Aucun message pour cette equipe. Envoyez le premier point terrain.
                  </div>
                )}
              </div>
              <form onSubmit={sendMessage} className="mt-4 flex gap-2">
                <input
                  value={messageText}
                  onChange={event => setMessageText(event.target.value)}
                  placeholder="Message equipe..."
                  className="h-11 min-w-0 flex-1 rounded-[14px] border border-[#F2E8DC] bg-[#FAF6F2] px-3 text-sm text-[#1E1E1E] outline-none focus:border-[#F06B21]"
                />
                <button type="submit" className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#F06B21] text-white">
                  <Send className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </form>
            </Card>
          </aside>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_460px]">
          <Card className="p-5">
            <div className="mb-5 flex items-start gap-3">
              <IconBadge><FileText className="h-5 w-5" strokeWidth={1.75} /></IconBadge>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#F06B21]">Rapport chantier</p>
                <h2 className="mt-1 text-[18px] font-semibold text-[#1E1E1E]">Photos, note et transcription</h2>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold text-[#1E1E1E]">Note terrain</span>
                <textarea
                  value={reportText}
                  onChange={event => setReportText(event.target.value)}
                  onBlur={() => void persistReport()}
                  rows={7}
                  className="w-full resize-none rounded-[14px] border border-[#F2E8DC] bg-[#FAF6F2] px-3 py-3 text-sm leading-6 text-[#1E1E1E] outline-none focus:border-[#F06B21]"
                  placeholder="Ce qui a ete fait, blocages, materiel, prochaine etape..."
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[12px] font-semibold text-[#1E1E1E]">Transcription vocale</span>
                <textarea
                  value={transcript}
                  onChange={event => setTranscript(event.target.value)}
                  onBlur={() => void persistReport()}
                  rows={7}
                  className="w-full resize-none rounded-[14px] border border-[#F2E8DC] bg-[#FAF6F2] px-3 py-3 text-sm leading-6 text-[#1E1E1E] outline-none focus:border-[#F06B21]"
                  placeholder="La dictee vocale apparaitra ici si le navigateur la supporte."
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[#F2E8DC] bg-white px-4 text-sm font-semibold text-[#1E1E1E] hover:border-[#F06B21]"
              >
                <Camera className="h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                Photos / fichiers
              </button>
              <button
                type="button"
                onClick={isRecording ? stopVoiceNote : startVoiceNote}
                className="inline-flex h-10 items-center gap-2 rounded-[12px] bg-[#1E1E1E] px-4 text-sm font-semibold text-white hover:bg-[#2A2A2A]"
              >
                {isRecording ? <MicOff className="h-4 w-4 text-[#F06B21]" strokeWidth={1.75} /> : <Mic className="h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />}
                {isRecording ? 'Stop dictee' : 'Note vocale'}
              </button>
              <button
                type="button"
                onClick={() => void persistReport()}
                className="inline-flex h-10 items-center gap-2 rounded-[12px] bg-[#F06B21] px-4 text-sm font-semibold text-white hover:bg-[#D95B17]"
              >
                <Upload className="h-4 w-4" strokeWidth={1.75} />
                Sauvegarder
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="application/pdf,image/jpeg,image/png,image/heic"
                className="hidden"
                onChange={handleFiles}
              />
            </div>
            <p className="mt-3 text-[12px] leading-5 text-[#6B6B6B]">
              {reportFeedback || 'Les fichiers creent une metadata locale/pending. Le binaire Storage reste a brancher par URL signee.'}
            </p>
            {reportFiles.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {reportFiles.slice(0, 4).map(file => (
                  <div key={file.id} className="grid grid-cols-[46px_minmax(0,1fr)] gap-3 rounded-[14px] border border-[#F2E8DC] bg-[#FAF6F2] p-3">
                    <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-[12px] bg-white text-[#F06B21]">
                      {file.previewUrl ? <img src={file.previewUrl} alt="" className="h-full w-full object-cover" /> : <Paperclip className="h-4 w-4" strokeWidth={1.75} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-[#1E1E1E]">{file.name}</span>
                      <span className="block truncate text-[11px] text-[#6B6B6B]">{(file.size / 1024 / 1024).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo - pending Storage</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="mb-5 flex items-start gap-3">
              <IconBadge><ShieldCheck className="h-5 w-5" strokeWidth={1.75} /></IconBadge>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#F06B21]">Conges equipe</p>
                <h2 className="mt-1 text-[18px] font-semibold text-[#1E1E1E]">Calendrier partage</h2>
              </div>
            </div>
            <form onSubmit={submitLeave} className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <select value={leaveMonth} onChange={event => setLeaveMonth(event.target.value)} className="h-10 rounded-[12px] border border-[#F2E8DC] bg-white px-3 text-sm text-[#1E1E1E] outline-none focus:border-[#F06B21]">
                  {planningMonths.map(month => <option key={month} value={month}>{month}</option>)}
                </select>
                <select value={leaveType} onChange={event => setLeaveType(event.target.value as LeaveType)} className="h-10 rounded-[12px] border border-[#F2E8DC] bg-white px-3 text-sm text-[#1E1E1E] outline-none focus:border-[#F06B21]">
                  {Object.entries(leaveTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={leaveStartDay} onChange={event => setLeaveStartDay(event.target.value)} type="number" min="1" max="31" className="h-10 rounded-[12px] border border-[#F2E8DC] bg-white px-3 text-sm outline-none focus:border-[#F06B21]" placeholder="Jour debut" />
                <input value={leaveEndDay} onChange={event => setLeaveEndDay(event.target.value)} type="number" min="1" max="31" className="h-10 rounded-[12px] border border-[#F2E8DC] bg-white px-3 text-sm outline-none focus:border-[#F06B21]" placeholder="Jour fin" />
              </div>
              <input value={leaveNote} onChange={event => setLeaveNote(event.target.value)} className="h-10 rounded-[12px] border border-[#F2E8DC] bg-white px-3 text-sm outline-none focus:border-[#F06B21]" placeholder="Note courte" />
              <button type="submit" className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] bg-[#F06B21] px-4 text-sm font-semibold text-white hover:bg-[#D95B17]">
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
                Poser la demande
              </button>
            </form>
            <div className="mt-5 grid grid-cols-7 gap-1">
              {calendarDays.map(day => {
                const hasBaseLeave = teamLeaves.some(leave => leave.month === leaveMonth && day >= leave.startDay && day <= leave.endDay)
                const hasRequest = leaveRequests.some(request => request.month === leaveMonth && request.status !== 'rejected' && day >= request.startDay && day <= request.endDay)
                return (
                  <span
                    key={day}
                    className={`grid aspect-square place-items-center rounded-[10px] text-[12px] font-semibold ${
                      hasRequest ? 'bg-[#FDEBDD] text-[#F06B21]' : hasBaseLeave ? 'bg-[#EADBC8] text-[#1E1E1E]' : 'bg-[#FAF6F2] text-[#6B6B6B]'
                    }`}
                  >
                    {day}
                  </span>
                )
              })}
            </div>
            <div className="mt-4 space-y-2">
              {leaveRequests.slice(0, 4).map(request => (
                <div key={request.id} className="rounded-[12px] bg-[#FAF6F2] p-3 text-sm">
                  <p className="font-semibold text-[#1E1E1E]">{request.memberName} - {leaveTypeLabels[request.type as LeaveType] ?? request.type}</p>
                  <p className="mt-1 text-[12px] text-[#6B6B6B]">{request.month}, du {request.startDay} au {request.endDay} - {request.status}</p>
                </div>
              ))}
              {!leaveRequests.length && (
                <p className="rounded-[12px] bg-[#FAF6F2] p-3 text-sm text-[#6B6B6B]">Aucune demande COWORK pour cette equipe. Source: {leaveSource}.</p>
              )}
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#6B6B6B]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#FAF6F2] px-3 py-1 font-semibold">
              <Clock3 className="h-3.5 w-3.5 text-[#F06B21]" strokeWidth={1.75} />
              Source operationnelle: {dataSource}
            </span>
            <span>SQL Connect garde les donnees metier validees.</span>
            <span>Chat, brouillons et demandes live restent en fallback local jusqu'au modele SQL dedie.</span>
            <span>Storage reste la cible des photos et rapports binaires.</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
