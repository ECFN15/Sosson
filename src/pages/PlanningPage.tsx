import { useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Info,
  MoreVertical,
  Plus,
  Settings2,
  UserRound,
} from 'lucide-react'

type ViewMode = 'semaine' | 'mois' | 'agenda'
type EventState = 'planned' | 'late' | 'ghost' | 'absence'

type Team = {
  id: string
  label: string
  short: string
  people: number
  dot: string
  bg: string
  border: string
}

type PlanningEvent = {
  title: string
  task: string
  time: string
  state?: EventState
}

const weekDays = ['Lun 21', 'Mar 22', 'Mer 23', 'Jeu 24', 'Ven 25', 'Sam 26', 'Dim 27']
const miniDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

const teams: Team[] = [
  {
    id: 'charpente',
    label: 'Équipe Charpente',
    short: 'Charpente',
    people: 4,
    dot: '#F06B21',
    bg: '#FDE9DB',
    border: '#F06B21',
  },
  {
    id: 'couverture',
    label: 'Équipe Couverture',
    short: 'Couverture',
    people: 3,
    dot: '#6B91B5',
    bg: '#DCE9F2',
    border: '#6B91B5',
  },
  {
    id: 'menuiserie',
    label: 'Équipe Menuiserie',
    short: 'Menuiserie',
    people: 4,
    dot: '#C9A227',
    bg: '#FDEFC2',
    border: '#C9A227',
  },
  {
    id: 'gros-oeuvre',
    label: 'Équipe Gros œuvre',
    short: 'Gros œuvre',
    people: 5,
    dot: '#A45A2C',
    bg: '#E8DCC5',
    border: '#A45A2C',
  },
  {
    id: 'terrassement',
    label: 'Équipe Terrassement',
    short: 'Terrassement',
    people: 3,
    dot: '#F89A62',
    bg: '#F9E6BF',
    border: '#F89A62',
  },
]

const planning: Record<string, Array<PlanningEvent | null>> = {
  charpente: [
    { title: 'Maison Dupont', task: 'Gros œuvre', time: '08:00 - 17:00' },
    { title: 'Maison Dupont', task: 'Charpente', time: '08:00 - 17:00' },
    { title: 'Maison Dupont', task: 'Charpente', time: '08:00 - 17:00' },
    { title: 'Villa des Pins', task: 'Charpente', time: '08:00 - 17:00' },
    { title: 'Villa des Pins', task: 'Charpente', time: '08:00 - 12:00' },
    null,
    null,
  ],
  couverture: [
    null,
    { title: 'Villa des Pins', task: 'Couverture', time: '08:00 - 17:00' },
    { title: 'Villa des Pins', task: 'Couverture', time: '08:00 - 17:00' },
    { title: 'Maison Martin', task: 'Couverture', time: '08:00 - 17:00' },
    { title: 'Maison Martin', task: 'Couverture', time: '08:00 - 12:00' },
    null,
    null,
  ],
  menuiserie: [
    { title: 'Atelier', task: 'Fabrication', time: '08:00 - 17:00' },
    { title: 'Maison Dupont', task: 'Menuiseries int.', time: '08:00 - 17:00' },
    { title: 'Maison Dupont', task: 'Menuiseries int.', time: '08:00 - 17:00' },
    { title: 'Atelier', task: 'Fabrication', time: '08:00 - 17:00' },
    { title: 'Villa des Pins', task: 'Charpente', time: '08:00 - 17:00', state: 'ghost' },
    { title: 'Villa des Pins', task: 'Menuiseries ext.', time: '08:00 - 12:00' },
    null,
  ],
  'gros-oeuvre': [
    { title: 'Maison Martin', task: 'Gros oeuvre bois', time: '08:00 - 17:00' },
    { title: 'Maison Martin', task: 'Gros oeuvre bois', time: '08:00 - 17:00' },
    { title: 'Retard', task: 'Isolation', time: '08:00 - 17:00', state: 'late' },
    { title: 'Maison Martin', task: 'Gros œuvre', time: '08:00 - 17:00' },
    { title: 'Maison Martin', task: 'Gros œuvre', time: '08:00 - 12:00' },
    null,
    null,
  ],
  terrassement: [
    { title: 'Lotissement', task: 'Terrassement', time: '08:00 - 17:00' },
    { title: 'Lotissement', task: 'Terrassement', time: '08:00 - 17:00' },
    null,
    { title: 'Lotissement', task: 'Terrassement', time: '08:00 - 17:00' },
    null,
    null,
    null,
  ],
}

const miniCalendar = [
  30, 31, 1, 2, 3, 4, 5,
  6, 7, 8, 9, 10, 11, 12,
  13, 14, 15, 16, 17, 18, 19,
  20, 21, 22, 23, 24, 25, 26,
  27, 28, 29, 30, 1, 2, 3,
]

const unplanned = [
  { title: 'Pose bardage', project: 'Maison Martin', time: '08:00 - 17:00', level: 'Moyenne' },
  { title: 'Livraison menuiseries', project: 'Villa des Pins', time: '14:00 - 16:00', level: 'Basse' },
  { title: 'Réunion de chantier', project: 'Maison Martin', time: '09:00 - 11:00', level: 'Haute' },
]

const absences = [
  { name: 'Lucas Bernard', reason: 'Congés payés', dates: '21 - 24 avril 2026', team: 'Équipe Charpente', color: '#F06B21' },
  { name: 'Sophie Leroy', reason: 'Formation', dates: '23 avril 2026', team: 'Équipe Menuiserie', color: '#C9A227' },
]

const alerts = [
  { title: 'Maison Martin - Isolation en retard', text: 'Tâche en retard de 2 jours', action: 'Voir le chantier', kind: 'late' },
  { title: 'Surcharge détectée : Équipe Gros œuvre', text: '4 chantiers prévus cette semaine', action: 'Rééquilibrer', kind: 'info' },
]

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-[20px] border border-[#EADBC8] bg-white shadow-[0_1px_0_rgba(255,255,255,.9)_inset,0_14px_34px_rgba(30,30,30,0.045)] ${className}`}>
      {children}
    </section>
  )
}

function ActionButton({ children, active = false, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center rounded-[12px] px-4 text-sm font-medium transition ${
        active
          ? 'bg-[#F06B21] text-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-[#D95B17]'
          : 'text-[#3C3C3C] hover:bg-white hover:text-[#1E1E1E]'
      }`}
    >
      {children}
    </button>
  )
}

function OutlineButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border border-[#F2E8DC] bg-white px-3.5 text-sm font-medium text-[#3C3C3C] transition hover:border-[#EADBC8] hover:text-[#1E1E1E] ${className}`}
    >
      {children}
    </button>
  )
}

function EventBlock({ event, team, dayIndex, selected, onSelect }: { event: PlanningEvent; team: Team; dayIndex: number; selected: boolean; onSelect: () => void }) {
  const isLate = event.state === 'late'
  const isGhost = event.state === 'ghost'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative min-h-[70px] w-full rounded-[10px] px-2.5 py-2 text-left transition hover:ring-1 hover:ring-[#F06B21]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F06B21]/30 ${selected ? 'ring-2 ring-[#F06B21]/30' : ''} ${
        isGhost ? 'border-2 border-dashed bg-white' : 'border-l-[3px]'
      } ${isLate ? 'bg-[#FEE2E2]' : ''}`}
      style={{
        backgroundColor: isLate ? undefined : isGhost ? 'rgba(255,255,255,0.72)' : team.bg,
        borderColor: isLate ? '#DC2626' : team.border,
      }}
    >
      {isGhost && dayIndex === 4 && (
        <div className="pointer-events-none absolute -right-2 -top-9 z-20 hidden w-[148px] rounded-[10px] border border-[#EADBC8] bg-[#FDE9DB] px-3 py-2 shadow-[0_10px_24px_rgba(30,30,30,0.14)] 2xl:block">
          <p className="truncate text-[11px] font-semibold text-[#1E1E1E]">Villa des Pins</p>
          <p className="text-[10px] text-[#3C3C3C]">Charpente</p>
          <p className="mt-1 text-[10px] text-[#6B6B6B]">08:00 - 17:00</p>
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <p className={`truncate text-[11px] font-semibold ${isLate ? 'text-[#DC2626]' : 'text-[#1E1E1E]'}`}>
          {event.title}
        </p>
        {isLate && <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#DC2626]" strokeWidth={1.75} />}
      </div>
      <p className={`mt-1 truncate text-[10px] ${isLate ? 'text-[#B45309]' : 'text-[#3C3C3C]'}`}>{event.task}</p>
      <p className="mt-1.5 text-[10px] text-[#1E1E1E]">{event.time}</p>
    </button>
  )
}

function priorityStyles(level: string) {
  if (level === 'Haute') return 'bg-[#FEE2E2] text-[#DC2626]'
  if (level === 'Moyenne') return 'bg-[#FEF3C7] text-[#B45309]'
  return 'bg-[#DCE9F2] text-[#315A78]'
}

export function PlanningPage() {
  const [view, setView] = useState<ViewMode>('semaine')
  const [selectedEvent, setSelectedEvent] = useState('Maison Dupont - Charpente')

  return (
    <div className="min-h-full bg-[#FAF6F2] px-6 py-6">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-[26px] font-semibold leading-tight text-[#1E1E1E]">Planning interactif</h1>
          <p className="mt-1 text-sm text-[#3C3C3C]">Organisez vos chantiers et vos équipes en un coup d'œil.</p>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-[14px] bg-[#F06B21] px-5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:bg-[#D95B17] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Créer un événement
        </button>
      </div>

      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="inline-flex w-fit rounded-[12px] border border-[#F2E8DC] bg-white p-1">
          {(['semaine', 'mois', 'agenda'] as const).map(option => (
            <ActionButton key={option} active={view === option} onClick={() => setView(option)}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </ActionButton>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:ml-10">
          <button type="button" className="grid h-10 w-10 place-items-center rounded-[12px] text-[#1E1E1E] transition hover:bg-white">
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <p className="min-w-[164px] text-center text-sm font-medium text-[#1E1E1E]">21 - 27 avril 2026</p>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-[12px] text-[#1E1E1E] transition hover:bg-white">
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <OutlineButton>Aujourd'hui</OutlineButton>
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:ml-auto">
          <OutlineButton>
            <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
            Toutes les équipes
            <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
          </OutlineButton>
          <OutlineButton>
            <Filter className="h-4 w-4" strokeWidth={1.75} />
            Filtres
            <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
          </OutlineButton>
          <OutlineButton className="w-10 px-0">
            <Settings2 className="h-4 w-4" strokeWidth={1.75} />
          </OutlineButton>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <Card className="p-5">
            <div className="mb-4 rounded-[14px] border border-[#F2E8DC] bg-[#FFF9F4] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#F06B21]">Créneau sélectionné</p>
              <p className="mt-1 text-[13px] font-semibold text-[#1E1E1E]">{selectedEvent}</p>
              <p className="mt-1 text-[11px] text-[#6B6B6B]">Cliquez un bloc planning pour changer la sélection.</p>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#1E1E1E]">Avril 2026</h2>
              <div className="flex items-center gap-1 text-[#6B6B6B]">
                <button type="button" className="grid h-7 w-7 place-items-center rounded-[8px] hover:bg-[#FAF6F2]">
                  <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
                <button type="button" className="grid h-7 w-7 place-items-center rounded-[8px] hover:bg-[#FAF6F2]">
                  <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {miniDays.map((day, index) => (
                <span key={`${day}-${index}`} className="py-1 text-[11px] font-medium text-[#1E1E1E]">
                  {day}
                </span>
              ))}
              {miniCalendar.map((day, index) => {
                const isCurrentWeek = index >= 22 && index <= 27
                const isToday = day === 21 && index === 22
                const isOutside = index < 2 || index > 31

                return (
                  <button
                    key={`${day}-${index}`}
                    type="button"
                    className={`grid h-8 place-items-center rounded-[10px] text-[12px] transition ${
                      isToday
                        ? 'bg-[#1E1E1E] font-semibold text-white'
                        : isCurrentWeek
                          ? 'bg-[#FDEBDD] font-medium text-[#1E1E1E]'
                          : isOutside
                            ? 'text-[#9CA3AF]'
                            : 'text-[#3C3C3C] hover:bg-[#FAF6F2]'
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#1E1E1E]">Équipes</h2>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1 rounded-[10px] border border-[#F2E8DC] bg-white px-2.5 text-[12px] font-medium text-[#3C3C3C] hover:border-[#EADBC8]"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {teams.map(team => (
                <div key={team.id} className="flex items-center gap-3 rounded-[12px] px-1 py-1">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: team.dot }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-[#1E1E1E]">{team.label}</p>
                    <p className="text-[11px] text-[#6B6B6B]">{team.people} personnes</p>
                  </div>
                  <button type="button" className="grid h-7 w-7 place-items-center rounded-[8px] text-[#6B6B6B] hover:bg-[#FAF6F2]">
                    <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold text-[#1E1E1E]">Légende</h2>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-[8px] bg-[#FDEBDD] px-2.5 py-1 text-[11px] font-medium text-[#F06B21]">En cours</span>
              <span className="rounded-[8px] bg-[#DCE9F2] px-2.5 py-1 text-[11px] font-medium text-[#315A78]">À venir</span>
              <span className="rounded-[8px] bg-[#FEE2E2] px-2.5 py-1 text-[11px] font-medium text-[#DC2626]">En retard</span>
              <span className="rounded-[8px] bg-[#FAF6F2] px-2.5 py-1 text-[11px] font-medium text-[#6B6B6B]">Terminé</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[12px] text-[#6B6B6B]">
              <span className="h-8 w-8 rounded-[8px] border border-dashed border-[#EADBC8] bg-[#FAF6F2]" />
              Absence / Congé
            </div>
          </Card>
        </aside>

        <main className="min-w-0 space-y-5">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-[112px_repeat(7,minmax(104px,1fr))] border-b border-[#F2E8DC]">
                  <div className="border-r border-[#F2E8DC] bg-white p-4" />
                  {weekDays.map((day, index) => (
                    <div
                      key={day}
                      className={`border-r border-[#F2E8DC] p-4 text-center text-sm font-medium last:border-r-0 ${
                        index >= 5 ? 'bg-[#FAF6F2] text-[#6B6B6B]' : 'bg-white text-[#3C3C3C]'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {teams.map(team => (
                  <div key={team.id} className="grid min-h-[96px] grid-cols-[112px_repeat(7,minmax(104px,1fr))] border-b border-[#F2E8DC] last:border-b-0">
                    <div className="border-r border-[#F2E8DC] bg-white p-3">
                      <p className="text-[13px] font-semibold leading-tight text-[#1E1E1E]">{team.label}</p>
                      <p className="mt-1 text-[11px] text-[#6B6B6B]">{team.people} personnes</p>
                    </div>
                    {planning[team.id].map((event, dayIndex) => (
                      <div
                        key={`${team.id}-${dayIndex}`}
                        className={`border-r border-[#F2E8DC] p-2 last:border-r-0 ${
                          dayIndex >= 5
                            ? 'bg-[#FAF6F2]'
                            : 'bg-white'
                        }`}
                      >
                        {event ? (
                          <EventBlock
                            event={event}
                            team={team}
                            dayIndex={dayIndex}
                            selected={selectedEvent === `${event.title} - ${event.task}`}
                            onSelect={() => setSelectedEvent(`${event.title} - ${event.task}`)}
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid gap-5 xl:grid-cols-3">
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#1E1E1E]">Événements non planifiés</h2>
                <span className="grid h-6 min-w-6 place-items-center rounded-[8px] bg-[#FAF6F2] px-2 text-[12px] font-semibold text-[#6B6B6B]">
                  {unplanned.length}
                </span>
              </div>
              <div className="space-y-3">
                {unplanned.map(item => (
                  <div key={item.title} className="flex items-center gap-3 rounded-[12px] p-2 transition hover:bg-[#FAF6F2]">
                    <Clock3 className="h-4 w-4 shrink-0 text-[#F06B21]" strokeWidth={1.75} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-[#1E1E1E]">{item.title}</p>
                      <p className="truncate text-[11px] text-[#6B6B6B]">{item.project} · {item.time}</p>
                    </div>
                    <span className={`whitespace-nowrap rounded-[7px] px-2 py-1 text-[11px] font-medium ${priorityStyles(item.level)}`}>
                      {item.level}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#1E1E1E]">Absences / Congés</h2>
                <span className="grid h-6 min-w-6 place-items-center rounded-[8px] bg-[#FAF6F2] px-2 text-[12px] font-semibold text-[#6B6B6B]">
                  {absences.length}
                </span>
              </div>
              <div className="space-y-4">
                {absences.map(absence => (
                  <div key={absence.name} className="flex items-start gap-3">
                    <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-[#A45A2C]" strokeWidth={1.75} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-[#1E1E1E]">{absence.name}</p>
                      <p className="text-[11px] text-[#6B6B6B]">{absence.reason}</p>
                      <p className="text-[11px] text-[#6B6B6B]">{absence.dates}</p>
                    </div>
                    <div className="flex max-w-[132px] items-center gap-2 text-right text-[11px] text-[#6B6B6B]">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: absence.color }} />
                      <span>{absence.team}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-[#F2E8DC] py-2 text-sm font-medium text-[#6B6B6B] hover:text-[#1E1E1E]">
                Voir toutes les absences
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </Card>

            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#1E1E1E]">Alertes planning</h2>
                <span className="grid h-6 min-w-6 place-items-center rounded-[8px] bg-[#FAF6F2] px-2 text-[12px] font-semibold text-[#6B6B6B]">
                  {alerts.length}
                </span>
              </div>
              <div className="space-y-3">
                {alerts.map(alert => (
                  <div key={alert.title} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 rounded-[12px] border border-[#F2E8DC] p-3">
                    <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-[10px] ${alert.kind === 'late' ? 'bg-[#FEE2E2]' : 'bg-[#DCE9F2]'}`}>
                      {alert.kind === 'late' ? (
                        <AlertTriangle className="h-4 w-4 text-[#DC2626]" strokeWidth={1.75} />
                      ) : (
                        <Info className="h-4 w-4 text-[#315A78]" strokeWidth={1.75} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium leading-tight text-[#1E1E1E]">{alert.title}</p>
                      <p className="text-[11px] text-[#6B6B6B]">{alert.text}</p>
                    </div>
                    <button type="button" className="col-span-2 rounded-[8px] border border-[#F2E8DC] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#3C3C3C] hover:border-[#EADBC8]">
                      {alert.action}
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-[#F2E8DC] py-2 text-sm font-medium text-[#6B6B6B] hover:text-[#1E1E1E]">
                Voir toutes les alertes
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </Card>
          </div>
        </main>
      </div>

    </div>
  )
}
