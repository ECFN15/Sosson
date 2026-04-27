import { useNavigate } from 'react-router-dom'
import { HardHat, Euro, AlertTriangle, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { useApp } from '@/lib/store'
import { getChantierCover } from '@/data/media'

function StatutBadge({ statut }: { statut: string }) {
  if (statut === 'en_cours')
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-[#FDEBDD] px-2.5 py-1 text-xs font-medium text-[#F06B21]">
        <Clock size={11} /> En cours
      </span>
    )
  if (statut === 'cloture')
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-[#E6F4EA] px-2.5 py-1 text-xs font-medium text-[#1E8E3E]">
        <CheckCircle size={11} /> Clôturé
      </span>
    )
  return (
    <span className="rounded-full bg-[#FAF6F2] px-2.5 py-1 text-xs font-medium text-[#6B6B6B]">
      En attente
    </span>
  )
}

export function ChantiersPage() {
  const { chantiers, user, clients } = useApp()
  const navigate = useNavigate()
  const isGerant = user?.role === 'gerant'
  const isAssistante = user?.role === 'assistante'

  const visibleChantiers =
    user?.role === 'chef_chantier'
      ? chantiers.filter(c => c.chefChantier === `${user.prenom} ${user.nom}`)
      : chantiers

  return (
    <div className="min-h-full bg-[#FAF6F2] p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1E1E]">Chantiers</h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">{visibleChantiers.length} chantiers</p>
        </div>
        {(isGerant || isAssistante) && (
          <button className="flex items-center gap-2 rounded-[14px] bg-[#F06B21] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#D95B17]">
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
              className="group rounded-[20px] border border-[#F2E8DC] bg-white p-6 text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:border-[#EADBC8] hover:bg-[#FFF9F4]"
            >
              <div className="flex items-start gap-4">
                <div className="h-24 w-32 shrink-0 overflow-hidden rounded-[14px] border border-[#F2E8DC] bg-[#EADBC8]">
                  <img src={getChantierCover(c.id)} alt={`Aperçu ${c.nom}`} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="font-semibold text-[#1E1E1E] transition-colors group-hover:text-[#F06B21]">
                      {c.nom}
                    </h3>
                    <StatutBadge statut={c.statut} />
                    {c.tendance === 'rouge' && (
                      <span className="flex items-center gap-1 rounded-full bg-[#FEE2E2] px-2 py-0.5 text-xs font-medium text-[#DC2626]">
                        <AlertTriangle size={10} /> Dérive
                      </span>
                    )}
                    {c.tendance === 'orange' && (
                      <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-xs font-medium text-[#B45309]">
                        ~ Surveiller
                      </span>
                    )}
                  </div>
                  <div className="mb-1 text-sm text-[#6B6B6B]">{client?.nom}</div>
                  <div className="text-xs text-[#9CA3AF]">{c.adresse}</div>
                </div>
                <ArrowRight size={18} className="mt-1 text-[#9CA3AF] transition-colors group-hover:text-[#F06B21]" />
              </div>

              {isGerant && (
                <div className="mt-4 grid grid-cols-3 gap-4 border-t border-[#F2E8DC] pt-4">
                  <div>
                    <div className="mb-0.5 text-xs text-[#6B6B6B]">Budget</div>
                    <div className="text-sm font-semibold text-[#3C3C3C]">
                      {c.budgetPrevisionnel.toLocaleString('fr-FR')} €
                    </div>
                  </div>
                  <div>
                    <div className="mb-0.5 text-xs text-[#6B6B6B]">Dépenses</div>
                    <div className={`text-sm font-semibold ${c.tendance === 'rouge' ? 'text-[#DC2626]' : 'text-[#3C3C3C]'}`}>
                      {c.depensesEngagees.toLocaleString('fr-FR')} €
                    </div>
                  </div>
                  <div>
                    <div className="mb-0.5 text-xs text-[#6B6B6B]">Marge restante</div>
                    <div className={`flex items-center gap-1 text-sm font-semibold ${marge >= 0 ? 'text-[#1E8E3E]' : 'text-[#DC2626]'}`}>
                      <Euro size={12} />
                      {Math.abs(marge).toLocaleString('fr-FR')} {marge < 0 ? '(dépassé)' : ''}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs text-[#6B6B6B]">
                  <span>Avancement budget</span>
                  <span className={pct > 100 ? 'font-medium text-[#DC2626]' : ''}>{pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#F2E8DC]">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      c.tendance === 'rouge' ? 'bg-[#DC2626]' : c.tendance === 'orange' ? 'bg-[#F06B21]' : 'bg-[#1E8E3E]'
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
