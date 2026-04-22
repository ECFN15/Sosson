import { AlertTriangle, TrendingUp, HardHat, FileText, Euro, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp, clients } from '@/lib/store'
import { categorieLabels, categorieColors } from '@/data/factures'
import type { CategorieDepense } from '@/data/factures'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  sub: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <div className="text-xs text-slate-400 mt-1">{sub}</div>
    </div>
  )
}

function tendanceBadge(tendance: string) {
  if (tendance === 'rouge') return 'bg-red-100 text-red-700'
  if (tendance === 'orange') return 'bg-amber-100 text-amber-700'
  return 'bg-green-100 text-green-700'
}

function tendanceLabel(tendance: string) {
  if (tendance === 'rouge') return '⚠ Dérive budget'
  if (tendance === 'orange') return '~ À surveiller'
  return '✓ Dans les clous'
}

export function DashboardPage() {
  const { chantiers, factures, user } = useApp()
  const navigate = useNavigate()

  const chantiersActifs = chantiers.filter(c => c.statut === 'en_cours')
  const totalDepenses = factures
    .filter(f => f.statut === 'validee')
    .reduce((sum, f) => sum + f.montantTTC, 0)
  const alertes = chantiers.filter(c => c.tendance === 'rouge' || c.tendance === 'orange')
  const facturesEnAttente = factures.filter(f => f.statut === 'en_attente')

  const depensesParCategorie = factures
    .filter(f => f.statut === 'validee')
    .reduce<Record<string, number>>((acc, f) => {
      acc[f.categorie] = (acc[f.categorie] ?? 0) + f.montantTTC
      return acc
    }, {})

  const chartData = Object.entries(depensesParCategorie)
    .map(([cat, val]) => ({
      name: categorieLabels[cat as CategorieDepense] ?? cat,
      value: Math.round(val),
      color: categorieColors[cat as CategorieDepense] ?? '#94a3b8',
    }))
    .sort((a, b) => b.value - a.value)

  const isGerant = user?.role === 'gerant'

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Bonjour, {user?.prenom} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {alertes.length > 0 && (
        <div className="mb-6 space-y-2">
          {alertes.map(a => {
            const client = clients.find(c => c.id === a.clientId)
            const depassement = ((a.depensesEngagees - a.budgetPrevisionnel) / a.budgetPrevisionnel * 100)
            return (
              <button
                key={a.id}
                onClick={() => navigate(`/chantiers/${a.id}`)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all hover:shadow-sm ${
                  a.tendance === 'rouge'
                    ? 'bg-red-50 border-red-200 hover:border-red-300'
                    : 'bg-amber-50 border-amber-200 hover:border-amber-300'
                }`}
              >
                <AlertTriangle
                  size={20}
                  className={a.tendance === 'rouge' ? 'text-red-500' : 'text-amber-500'}
                />
                <div className="flex-1">
                  <span className="font-semibold text-slate-800">{a.nom}</span>
                  <span className="text-slate-500 text-sm ml-2">— {client?.nom}</span>
                  {a.tendance === 'rouge' && (
                    <span className="text-red-600 text-sm ml-2 font-medium">
                      Dérive budget +{Math.abs(depassement).toFixed(0)}%
                    </span>
                  )}
                  {a.tendance === 'orange' && (
                    <span className="text-amber-600 text-sm ml-2 font-medium">
                      À surveiller — {Math.round((a.depensesEngagees / a.budgetPrevisionnel) * 100)}% du budget consommé
                    </span>
                  )}
                </div>
                <ArrowRight size={16} className="text-slate-400" />
              </button>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Chantiers actifs"
          value={chantiersActifs.length.toString()}
          sub={`${chantiers.filter(c => c.statut === 'cloture').length} clôturé(s)`}
          icon={HardHat}
          color="bg-blue-500"
        />
        {isGerant && (
          <StatCard
            label="Dépenses du mois"
            value={`${totalDepenses.toLocaleString('fr-FR')} €`}
            sub="Factures validées"
            icon={Euro}
            color="bg-emerald-500"
          />
        )}
        <StatCard
          label="Factures en attente"
          value={facturesEnAttente.length.toString()}
          sub="À traiter"
          icon={FileText}
          color="bg-amber-500"
        />
        <StatCard
          label="Alertes actives"
          value={alertes.length.toString()}
          sub="Chantiers à surveiller"
          icon={AlertTriangle}
          color={alertes.length > 0 ? 'bg-red-500' : 'bg-slate-400'}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {isGerant && (
          <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-slate-900">Dépenses par catégorie</h2>
              <TrendingUp size={18} className="text-slate-400" />
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barSize={32}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k€`}
                />
                <Tooltip
                  formatter={(v: number) => [`${v.toLocaleString('fr-FR')} €`, 'Montant TTC']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Chantiers en cours</h2>
          <div className="space-y-3">
            {chantiersActifs.map(c => {
              const pct = Math.round((c.depensesEngagees / c.budgetPrevisionnel) * 100)
              return (
                <button
                  key={c.id}
                  onClick={() => navigate(`/chantiers/${c.id}`)}
                  className="w-full text-left group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 group-hover:text-orange-600 transition-colors">
                      {c.nom}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${tendanceBadge(c.tendance)}`}
                    >
                      {tendanceLabel(c.tendance)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        c.tendance === 'rouge'
                          ? 'bg-red-500'
                          : c.tendance === 'orange'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {c.depensesEngagees.toLocaleString('fr-FR')} € / {c.budgetPrevisionnel.toLocaleString('fr-FR')} € ({pct}%)
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
