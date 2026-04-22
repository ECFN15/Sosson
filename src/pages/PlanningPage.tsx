import { useApp, clients } from '@/lib/store'
import { Calendar } from 'lucide-react'

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
const COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-emerald-500']

function monthIndex(dateStr: string) {
  return new Date(dateStr).getMonth()
}

export function PlanningPage() {
  const { chantiers } = useApp()

  const activeChantiers = chantiers.filter(c => c.statut === 'en_cours' || c.statut === 'en_attente')

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Planning</h1>
        <p className="text-slate-500 text-sm mt-1">Vue calendrier 2026 — chantiers en cours</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Année 2026</span>
        </div>

        <div className="p-6 overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[200px_repeat(12,1fr)] gap-0 mb-3">
              <div />
              {MONTHS.map(m => (
                <div key={m} className="text-xs font-medium text-slate-400 text-center pb-2 border-b border-slate-100">
                  {m}
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-3">
              {activeChantiers.map((c, i) => {
                const client = clients.find(cl => cl.id === c.clientId)
                const startMonth = monthIndex(c.dateDebut)
                const endMonth = monthIndex(c.dateFinPrevue)
                return (
                  <div key={c.id} className="grid grid-cols-[200px_repeat(12,1fr)] gap-0 items-center">
                    <div className="pr-4">
                      <div className="text-sm font-medium text-slate-800 truncate">{c.nom}</div>
                      <div className="text-xs text-slate-400 truncate">{client?.nom}</div>
                    </div>
                    {Array.from({ length: 12 }, (_, month) => {
                      const isActive = month >= startMonth && month <= endMonth
                      const isFirst = month === startMonth
                      const isLast = month === endMonth
                      return (
                        <div key={month} className="h-8 px-0.5">
                          {isActive ? (
                            <div
                              className={`h-full ${COLORS[i % COLORS.length]} opacity-80 flex items-center ${isFirst ? 'rounded-l-full pl-2' : ''} ${isLast ? 'rounded-r-full pr-2' : ''}`}
                            >
                              {isFirst && (
                                <span className="text-white text-xs font-medium truncate">{c.nom}</span>
                              )}
                            </div>
                          ) : (
                            <div className="h-full" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/50">
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar size={12} />
            Vue indicative — synchronisation Google Calendar à venir
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {activeChantiers.map(c => {
          const client = clients.find(cl => cl.id === c.clientId)
          return (
            <div key={c.id} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <div className="font-medium text-sm text-slate-800 mb-1">{c.nom}</div>
              <div className="text-xs text-slate-400 mb-2">{client?.nom}</div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Début : {new Date(c.dateDebut).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}</span>
                <span>Fin : {new Date(c.dateFinPrevue).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="mt-2 text-xs font-medium text-slate-600">{c.chefChantier}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
