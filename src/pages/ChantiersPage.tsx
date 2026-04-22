import { useNavigate } from 'react-router-dom'
import { HardHat, Euro, AlertTriangle, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { useApp, clients } from '@/lib/store'

function StatutBadge({ statut }: { statut: string }) {
  if (statut === 'en_cours')
    return (
      <span className="flex items-center gap-1.5 text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
        <Clock size={11} /> En cours
      </span>
    )
  if (statut === 'cloture')
    return (
      <span className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
        <CheckCircle size={11} /> Clôturé
      </span>
    )
  return (
    <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
      En attente
    </span>
  )
}

export function ChantiersPage() {
  const { chantiers, user } = useApp()
  const navigate = useNavigate()
  const isGerant = user?.role === 'gerant'
  const isAssistante = user?.role === 'assistante'

  const visibleChantiers =
    user?.role === 'chef_chantier'
      ? chantiers.filter(c => c.chefChantier === `${user.prenom} ${user.nom}`)
      : chantiers

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chantiers</h1>
          <p className="text-slate-500 text-sm mt-1">{visibleChantiers.length} chantiers</p>
        </div>
        {(isGerant || isAssistante) && (
          <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2">
            <HardHat size={16} />
            Nouveau chantier
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {visibleChantiers.map(c => {
          const client = clients.find(cl => cl.id === c.clientId)
          const pct = Math.round((c.depensesEngagees / c.budgetPrevisionnel) * 100)
          const marge = c.budgetPrevisionnel - c.depensesEngagees

          return (
            <button
              key={c.id}
              onClick={() => navigate(`/chantiers/${c.id}`)}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-left hover:border-orange-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
                      {c.nom}
                    </h3>
                    <StatutBadge statut={c.statut} />
                    {c.tendance === 'rouge' && (
                      <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                        <AlertTriangle size={10} /> Dérive
                      </span>
                    )}
                    {c.tendance === 'orange' && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                        ~ Surveiller
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 mb-1">{client?.nom}</div>
                  <div className="text-xs text-slate-400">{c.adresse}</div>
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:text-orange-400 transition-colors mt-1" />
              </div>

              {isGerant && (
                <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                  <div>
                    <div className="text-xs text-slate-400 mb-0.5">Budget</div>
                    <div className="text-sm font-semibold text-slate-700">
                      {c.budgetPrevisionnel.toLocaleString('fr-FR')} €
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-0.5">Dépenses</div>
                    <div className={`text-sm font-semibold ${c.tendance === 'rouge' ? 'text-red-600' : 'text-slate-700'}`}>
                      {c.depensesEngagees.toLocaleString('fr-FR')} €
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-0.5">Marge restante</div>
                    <div className={`text-sm font-semibold flex items-center gap-1 ${marge >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      <Euro size={12} />
                      {Math.abs(marge).toLocaleString('fr-FR')} {marge < 0 ? '(dépassé)' : ''}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Avancement budget</span>
                  <span className={pct > 100 ? 'text-red-500 font-medium' : ''}>{pct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      c.tendance === 'rouge' ? 'bg-red-500' : c.tendance === 'orange' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
