import { useApp, clients } from '@/lib/store'
import { categorieLabels, categorieColors } from '@/data/factures'
import type { CategorieDepense } from '@/data/factures'
import { CheckCircle, Clock, XCircle, Filter } from 'lucide-react'
import { useState } from 'react'

function StatutBadge({ statut }: { statut: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    validee: { label: 'Validée', cls: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> },
    en_attente: { label: 'En attente', cls: 'bg-amber-100 text-amber-700', icon: <Clock size={12} /> },
    rejetee: { label: 'Rejetée', cls: 'bg-red-100 text-red-700', icon: <XCircle size={12} /> },
  }
  const s = map[statut] ?? map['en_attente']
  return (
    <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  )
}

export function FacturesPage() {
  const { factures, chantiers, user } = useApp()
  const [filterStatut, setFilterStatut] = useState<string>('tous')

  const isGerant = user?.role === 'gerant'

  const visibleFactures = factures.filter(f => {
    if (filterStatut !== 'tous' && f.statut !== filterStatut) return false
    if (user?.role === 'chef_chantier') {
      const chantier = chantiers.find(c => c.id === f.chantierId)
      if (!chantier || chantier.chefChantier !== `${user.prenom} ${user.nom}`) return false
    }
    return true
  })

  const totalTTC = visibleFactures
    .filter(f => f.statut === 'validee')
    .reduce((s, f) => s + f.montantTTC, 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Factures fournisseurs</h1>
          <p className="text-slate-500 text-sm mt-1">{visibleFactures.length} factures</p>
        </div>
        {isGerant && (
          <div className="text-right">
            <div className="text-xs text-slate-400">Total validées</div>
            <div className="text-lg font-bold text-slate-900">{totalTTC.toLocaleString('fr-FR')} €</div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Filter size={14} className="text-slate-400" />
        {['tous', 'en_attente', 'validee', 'rejetee'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatut(s)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${filterStatut === s ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
          >
            {s === 'tous' ? 'Toutes' : s === 'en_attente' ? 'En attente' : s === 'validee' ? 'Validées' : 'Rejetées'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {visibleFactures.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-400 text-sm">Aucune facture</div>
          ) : (
            visibleFactures.map(f => {
              const chantier = chantiers.find(c => c.id === f.chantierId)
              const client = clients.find(c => c.id === chantier?.clientId)
              return (
                <div key={f.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: categorieColors[f.categorie as CategorieDepense] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-slate-800">{f.fournisseur}</span>
                      <span className="text-xs text-slate-400">{f.numeroFacture}</span>
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {categorieLabels[f.categorie as CategorieDepense]} · {chantier?.nom} · {client?.nom}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 hidden md:block">
                    {new Date(f.date).toLocaleDateString('fr-FR')}
                  </div>
                  <StatutBadge statut={f.statut} />
                  {isGerant && (
                    <div className="text-sm font-semibold text-slate-800 min-w-[90px] text-right">
                      {f.montantTTC.toLocaleString('fr-FR')} €
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
