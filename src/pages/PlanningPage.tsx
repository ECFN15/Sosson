import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  SlidersHorizontal,
  ChevronDown,
  AlertTriangle,
  User,
  Clock,
  MoreVertical,
  ArrowRight,
} from 'lucide-react'

const WEEK_DAYS = ['Lun 21', 'Mar 22', 'Mer 23', 'Jeu 24', 'Ven 25', 'Sam 26', 'Dim 27']
const WEEK_DAYS_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

const TEAMS = [
  {
    id: 'charpente',
    label: 'Équipe Charpente',
    persons: 4,
    color: '#F06B21',
    bg: '#FDE9DB',
    border: '#F06B21',
  },
  {
    id: 'couverture',
    label: 'Équipe Couverture',
    persons: 3,
    color: '#6B91B5',
    bg: '#DCE9F2',
    border: '#6B91B5',
  },
  {
    id: 'menuiserie',
    label: 'Équipe Menuiserie',
    persons: 4,
    color: '#C9A227',
    bg: '#FDEFC2',
    border: '#C9A227',
  },
  {
    id: 'grosoeuvre',
    label: 'Équipe Gros œuvre',
    persons: 5,
    color: '#A45A2C',
    bg: '#E8DCC5',
    border: '#A45A2C',
  },
  {
    id: 'terrassement',
    label: 'Équipe Terrassement',
    persons: 3,
    color: '#8A7458',
    bg: '#EDE3D2',
    border: '#8A7458',
  },
]

type EventStatus = 'normal' | 'retard' | 'absent'

interface PlanEvent {
  label: string
  sub: string
  hours: string
  status?: EventStatus
  dashed?: boolean
}

const GRID_DATA: Record<string, (PlanEvent | null)[]> = {
  charpente:    [
    { label: 'Maison Dupont', sub: 'Gros œuvre', hours: '08:00 – 17:00' },
    { label: 'Maison Dupont', sub: 'Charpente', hours: '08:00 – 17:00' },
    { label: 'Maison Dupont', sub: 'Charpente', hours: '08:00 – 17:00' },
    { label: 'Villa des Pins', sub: 'Charpente', hours: '08:00 – 17:00' },
    { label: 'Villa des Pins', sub: 'Charpente', hours: '08:00 – 12:00' },
    null,
    null,
  ],
  couverture: [
    null,
    { label: 'Villa des Pins', sub: 'Couverture', hours: '08:00 – 17:00' },
    { label: 'Villa des Pins', sub: 'Couverture', hours: '08:00 – 17:00' },
    { label: 'Villa des Pins', sub: 'Couverture', hours: '08:00 – 17:00' },
    { label: 'Rénov. Centre', sub: 'Couverture', hours: '08:00 – 12:00' },
    null,
    null,
  ],
  menuiserie: [
    null,
    { label: 'Atelier', sub: 'Fabrication', hours: '08:00 – 17:00' },
    { label: 'Maison Dupont', sub: 'Menuiseries int.', hours: '08:00 – 17:00' },
    { label: 'Maison Dupont', sub: 'Menuiseries int.', hours: '08:00 – 17:00' },
    { label: 'Atelier', sub: 'Fabrication', hours: '08:00 – 17:00' },
    { label: 'Villa des Pins', sub: 'Menuiseries ext.', hours: '08:00 – 12:00', dashed: true },
    null,
  ],
  grosoeuvre: [
    { label: 'Rénov. Centre', sub: 'Gros œuvre', hours: '08:00 – 17:00' },
    { label: 'Rénov. Centre', sub: 'Gros œuvre', hours: '08:00 – 17:00' },
    { label: 'Retard', sub: 'Isolation', hours: '08:00 – 17:00', status: 'retard' },
    { label: 'Maison Martin', sub: 'Gros œuvre', hours: '08:00 – 17:00' },
    { label: 'Maison Martin', sub: 'Gros œuvre', hours: '08:00 – 12:00' },
    null,
    null,
  ],
  terrassement: [
    { label: 'Lotissement', sub: 'Terrassement', hours: '08:00 – 17:00' },
    { label: 'Lotissement', sub: 'Terrassement', hours: '08:00 – 17:00' },
    null,
    { label: 'Lotissement', sub: 'Terrassement', hours: '08:00 – 17:00' },
    null,
    null,
    null,
  ],
}

const MINI_CAL = {
  month: 'Avril 2026',
  startDay: 2,
  days: 30,
  today: 21,
}

const UNPLANNED = [
  { label: 'Pose bardage', sub: 'Maison Martin · 08:00 – 17:00', priority: 'Moyenne' },
  { label: 'Livraison menuiseries', sub: "Villa des Pins · 14:00 – 16:00", priority: 'Basse' },
  { label: 'Réunion de chantier', sub: 'Rénov. Centre · 09:00 – 11:00', priority: 'Haute' },
]

const ABSENCES = [
  { name: 'Lucas Bernard', type: 'Congés payés', dates: '21 – 24 avril 2026', team: 'Équipe Charpente', teamColor: '#F06B21' },
  { name: 'Sophie Leroy', type: 'Formation', dates: '23 avril 2026', team: 'Équipe Menuiserie', teamColor: '#C9A227' },
]

const ALERTS = [
  { label: 'Rénov. Centre – Isolation en retard', sub: 'Tâche en retard de 2 jours', color: '#DC2626', bg: '#FEE2E2' },
  { label: 'Surcharge détectée : Équipe Gros œuvre', sub: '4 chantiers prévus cette semaine', color: '#B45309', bg: '#FEF3C7' },
]

function priorityColor(p: string) {
  if (p === 'Haute') return { bg: '#FEE2E2', text: '#DC2626' }
  if (p === 'Moyenne') return { bg: '#FEF3C7', text: '#B45309' }
  return { bg: '#E6F4EA', text: '#1E8E3E' }
}

export function PlanningPage() {
  const [view, setView] = useState<'semaine' | 'mois' | 'agenda'>('semaine')

  return (
    <div className="flex flex-col h-full bg-[#FAF6F2] overflow-hidden">

      {/* ── Page header ── */}
      <div className="px-7 pt-6 pb-0 flex items-start justify-between shrink-0">
        <div>
          <h1 className="text-[22px] font-bold text-[#1E1E1E]">Planning interactif</h1>
          <p className="text-[13px] text-[#6B6B6B] mt-0.5">Organisez vos chantiers et vos équipes en un coup d'œil.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#F06B21] hover:bg-[#D95B17] text-white text-[13px] font-semibold px-4 py-2.5 rounded-[12px] transition-colors">
          <Plus size={15} strokeWidth={2.5} />
          Créer un événement
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="px-7 pt-4 pb-3 flex items-center gap-3 shrink-0">
        {/* View tabs */}
        <div className="flex items-center bg-white border border-[#F2E8DC] rounded-[10px] p-0.5 gap-0.5">
          {(['semaine', 'mois', 'agenda'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-colors capitalize ${
                view === v
                  ? 'bg-[#F06B21] text-white'
                  : 'text-[#6B6B6B] hover:text-[#1E1E1E]'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {/* Week nav */}
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 rounded-[8px] hover:bg-white border border-transparent hover:border-[#F2E8DC] flex items-center justify-center text-[#6B6B6B] transition-colors">
            <ChevronLeft size={14} />
          </button>
          <span className="text-[13px] font-semibold text-[#1E1E1E] px-2">21 – 27 avril 2026</span>
          <button className="w-7 h-7 rounded-[8px] hover:bg-white border border-transparent hover:border-[#F2E8DC] flex items-center justify-center text-[#6B6B6B] transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>

        <button className="px-3 py-1.5 text-[12px] font-medium text-[#6B6B6B] bg-white border border-[#F2E8DC] rounded-[8px] hover:text-[#1E1E1E] transition-colors">
          Aujourd'hui
        </button>

        <div className="flex-1" />

        {/* Filters */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#6B6B6B] bg-white border border-[#F2E8DC] rounded-[8px] hover:text-[#1E1E1E] transition-colors">
          Toutes les équipes <ChevronDown size={12} />
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#6B6B6B] bg-white border border-[#F2E8DC] rounded-[8px] hover:text-[#1E1E1E] transition-colors">
          <SlidersHorizontal size={13} />
          Filtres <ChevronDown size={12} />
        </button>
        <button className="w-8 h-8 rounded-[8px] bg-white border border-[#F2E8DC] flex items-center justify-center text-[#6B6B6B] hover:text-[#1E1E1E] transition-colors">
          <Settings size={14} />
        </button>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex gap-0 overflow-hidden px-7 pb-6">

        {/* Left panel */}
        <div className="w-[200px] shrink-0 flex flex-col gap-4 mr-4">

          {/* Mini-calendar */}
          <div className="bg-white rounded-[16px] border border-[#F2E8DC] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold text-[#1E1E1E]">{MINI_CAL.month}</span>
              <div className="flex gap-0.5">
                <button className="w-5 h-5 rounded flex items-center justify-center text-[#6B6B6B] hover:text-[#1E1E1E]"><ChevronLeft size={11} /></button>
                <button className="w-5 h-5 rounded flex items-center justify-center text-[#6B6B6B] hover:text-[#1E1E1E]"><ChevronRight size={11} /></button>
              </div>
            </div>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {WEEK_DAYS_SHORT.map((d, i) => (
                <div key={i} className="text-[9px] font-semibold text-[#9CA3AF] text-center py-0.5">{d}</div>
              ))}
            </div>
            {/* Days grid */}
            {(() => {
              const cells: (number | null)[] = Array(MINI_CAL.startDay - 1).fill(null)
              for (let d = 1; d <= MINI_CAL.days; d++) cells.push(d)
              while (cells.length % 7 !== 0) cells.push(null)
              const weeks: (number | null)[][] = []
              for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
              return weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      className={`text-[10px] text-center py-0.5 rounded-full cursor-pointer transition-colors ${
                        day === MINI_CAL.today
                          ? 'bg-[#1E1E1E] text-white font-bold'
                          : day && day >= 21 && day <= 27
                          ? 'text-[#F06B21] font-semibold'
                          : day
                          ? 'text-[#3C3C3C] hover:bg-[#FAF6F2]'
                          : ''
                      }`}
                    >
                      {day ?? ''}
                    </div>
                  ))}
                </div>
              ))
            })()}
          </div>

          {/* Équipes */}
          <div className="bg-white rounded-[16px] border border-[#F2E8DC] p-3 flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold text-[#1E1E1E]">Équipes</span>
              <button className="flex items-center gap-1 text-[11px] text-[#F06B21] font-medium hover:text-[#D95B17]">
                <Plus size={11} strokeWidth={2.5} /> Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {TEAMS.map(t => (
                <div key={t.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                    <div>
                      <p className="text-[11px] font-medium text-[#1E1E1E] leading-tight">{t.label}</p>
                      <p className="text-[10px] text-[#9CA3AF]">{t.persons} personnes</p>
                    </div>
                  </div>
                  <button className="text-[#9CA3AF] hover:text-[#6B6B6B]"><MoreVertical size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Légende */}
          <div className="bg-white rounded-[16px] border border-[#F2E8DC] p-3">
            <p className="text-[11px] font-semibold text-[#1E1E1E] mb-2">Légende</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FDEBDD] text-[#F06B21] font-medium">En cours</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EADBC8] text-[#A45A2C] font-medium">À venir</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#DC2626] font-medium">En retard</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F2E8DC] text-[#6B6B6B] font-medium">Terminé</span>
            <div className="mt-2 flex items-center gap-1.5">
              <div className="w-6 border-t border-dashed border-[#9CA3AF]" />
              <span className="text-[10px] text-[#6B6B6B]">Absence / Congé</span>
            </div>
          </div>
        </div>

        {/* Right: grid + bottom panels */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden min-w-0">

          {/* Weekly grid */}
          <div className="bg-white rounded-[16px] border border-[#F2E8DC] overflow-auto flex-1">
            <table className="w-full border-collapse" style={{ minWidth: 700 }}>
              <thead>
                <tr className="border-b border-[#F2E8DC]">
                  <th className="w-[130px] px-3 py-2 text-left text-[11px] font-medium text-[#6B6B6B] bg-white sticky left-0 z-10 border-r border-[#F2E8DC]" />
                  {WEEK_DAYS.map((d, i) => (
                    <th
                      key={i}
                      className={`px-2 py-2 text-[12px] font-semibold text-center ${
                        d.includes('21') ? 'text-[#F06B21]' : 'text-[#3C3C3C]'
                      }`}
                      style={{ minWidth: 110 }}
                    >
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TEAMS.map((team, ti) => (
                  <tr key={team.id} className={ti < TEAMS.length - 1 ? 'border-b border-[#F2E8DC]' : ''}>
                    {/* Team label */}
                    <td className="px-3 py-3 sticky left-0 bg-white z-10 border-r border-[#F2E8DC] align-top">
                      <p className="text-[12px] font-semibold text-[#1E1E1E] leading-tight">{team.label}</p>
                      <p className="text-[10px] text-[#9CA3AF]">{team.persons} personnes</p>
                    </td>
                    {/* Events */}
                    {GRID_DATA[team.id].map((evt, di) => (
                      <td key={di} className="px-1.5 py-2 align-top" style={{ minWidth: 110 }}>
                        {evt ? (
                          <div
                            className={`rounded-[8px] px-2 py-1.5 text-left ${
                              evt.dashed ? 'border-2 border-dashed' : ''
                            }`}
                            style={{
                              backgroundColor: evt.status === 'retard' ? '#FEE2E2' : evt.dashed ? 'transparent' : team.bg,
                              borderColor: evt.dashed ? team.color : undefined,
                            }}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <p
                                className="text-[11px] font-semibold leading-tight truncate"
                                style={{ color: evt.status === 'retard' ? '#DC2626' : '#1E1E1E' }}
                              >
                                {evt.label}
                              </p>
                              {evt.status === 'retard' && (
                                <AlertTriangle size={11} className="text-[#DC2626] shrink-0 mt-0.5" />
                              )}
                            </div>
                            <p className="text-[10px] mt-0.5" style={{ color: evt.status === 'retard' ? '#DC2626' : '#6B6B6B' }}>
                              {evt.sub}
                            </p>
                            <p className="text-[10px] mt-0.5" style={{ color: evt.status === 'retard' ? '#B45309' : '#9CA3AF' }}>
                              {evt.hours}
                            </p>
                          </div>
                        ) : null}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom 3 panels */}
          <div className="grid grid-cols-3 gap-4 shrink-0">

            {/* Événements non planifiés */}
            <div className="bg-white rounded-[16px] border border-[#F2E8DC] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[12px] font-semibold text-[#1E1E1E]">Événements non planifiés</h3>
                <span className="w-5 h-5 rounded-full bg-[#FDEBDD] text-[#F06B21] text-[10px] font-bold flex items-center justify-center">
                  {UNPLANNED.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {UNPLANNED.map((u, i) => {
                  const pc = priorityColor(u.priority)
                  return (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-[6px] bg-[#FAF6F2] flex items-center justify-center shrink-0 mt-0.5">
                        <Clock size={11} className="text-[#F06B21]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-[#1E1E1E] truncate">{u.label}</p>
                        <p className="text-[10px] text-[#6B6B6B] truncate">{u.sub}</p>
                      </div>
                      <span
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: pc.bg, color: pc.text }}
                      >
                        {u.priority}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Absences / Congés */}
            <div className="bg-white rounded-[16px] border border-[#F2E8DC] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[12px] font-semibold text-[#1E1E1E]">Absences / Congés</h3>
                <span className="w-5 h-5 rounded-full bg-[#FDEBDD] text-[#F06B21] text-[10px] font-bold flex items-center justify-center">
                  {ABSENCES.length}
                </span>
              </div>
              <div className="space-y-3">
                {ABSENCES.map((a, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#EADBC8] flex items-center justify-center shrink-0 mt-0.5">
                      <User size={11} className="text-[#A45A2C]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[#1E1E1E]">{a.name}</p>
                      <p className="text-[10px] text-[#6B6B6B]">{a.type}</p>
                      <p className="text-[10px] text-[#9CA3AF]">{a.dates}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: a.teamColor }} />
                      <span className="text-[9px] text-[#6B6B6B]">{a.team}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-3 flex items-center gap-1 text-[11px] font-medium text-[#F06B21] hover:text-[#D95B17] transition-colors">
                Voir toutes les absences <ArrowRight size={11} />
              </button>
            </div>

            {/* Alertes planning */}
            <div className="bg-white rounded-[16px] border border-[#F2E8DC] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[12px] font-semibold text-[#1E1E1E]">Alertes planning</h3>
                <span className="w-5 h-5 rounded-full bg-[#FDEBDD] text-[#F06B21] text-[10px] font-bold flex items-center justify-center">
                  {ALERTS.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {ALERTS.map((a, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div
                      className="w-6 h-6 rounded-[6px] flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: a.bg }}
                    >
                      <AlertTriangle size={11} style={{ color: a.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[#1E1E1E] leading-tight">{a.label}</p>
                      <p className="text-[10px] text-[#6B6B6B]">{a.sub}</p>
                    </div>
                    <button className="text-[9px] font-medium text-[#F06B21] hover:text-[#D95B17] shrink-0 whitespace-nowrap transition-colors">
                      {i === 0 ? 'Voir le chantier' : 'Rééquilibrer'}
                    </button>
                  </div>
                ))}
              </div>
              <button className="mt-3 flex items-center gap-1 text-[11px] font-medium text-[#F06B21] hover:text-[#D95B17] transition-colors">
                Voir toutes les alertes <ArrowRight size={11} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
