import {
  TrendingUp,
  TrendingDown,
  HardHat,
  FileText,
  PieChart as PieChartIcon,
  ReceiptText,
  AlertTriangle,
  ArrowRight,
  Mail,
  CheckCircle,
  MoreHorizontal,
  Calendar,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/lib/store'
import { categorieLabels } from '@/data/factures'
import type { CategorieDepense } from '@/data/factures'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const DONUT_COLORS: Record<string, string> = {
  bois_materiaux: '#F06B21',
  sous_traitance: '#1E1E1E',
  quincaillerie: '#A45A2C',
  carburant: '#C8B18C',
  location_materiel: '#EADBC8',
  plomberie: '#F89A62',
  electricite: '#6B6B6B',
  peinture: '#3C3C3C',
}

const tresoData = [
  { mois: 'Avr.', prevision: 180000, realise: 160000 },
  { mois: 'Mai', prevision: 220000, realise: 195000 },
  { mois: 'Juin', prevision: 200000, realise: 210000 },
  { mois: 'Jul.', prevision: 260000, realise: 240000 },
  { mois: 'Août', prevision: 240000, realise: 270000 },
  { mois: 'Sept.', prevision: 280000, realise: null },
  { mois: 'Oct.', prevision: 320000, realise: null },
]

const depensesParMoisData = [
  { mois: 'M-7', val: 62000 },
  { mois: 'M-6', val: 88000 },
  { mois: 'M-5', val: 74000 },
  { mois: 'M-4', val: 110000 },
  { mois: 'M-3', val: 95000 },
  { mois: 'M-2', val: 130000 },
  { mois: 'M-1', val: 115000 },
  { mois: 'M', val: 155000 },
]

const docTraitesData = [
  { x: 1, val: 80 },
  { x: 2, val: 95 },
  { x: 3, val: 88 },
  { x: 4, val: 110 },
  { x: 5, val: 102 },
  { x: 6, val: 126 },
]

function fmt(n: number) {
  return n.toLocaleString('fr-FR')
}

function KpiCard({
  label,
  value,
  trend,
  trendLabel,
  sub,
  icon: Icon,
  iconBg = 'bg-[#FFF4EA]',
  iconColor = 'text-[#F06B21]',
  trendUp,
}: {
  label: string
  value: string
  trend?: string
  trendLabel?: string
  sub?: string
  icon: React.ElementType
  iconBg?: string
  iconColor?: string
  trendUp?: boolean
}) {
  return (
    <div className="bg-white rounded-[20px] p-5 border border-[#F2E8DC] min-h-[132px] flex flex-col gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-[#3C3C3C] leading-none">{label}</p>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ring-1 ring-[#F06B21]/5 ${iconBg}`}>
          <Icon size={18} strokeWidth={1.9} className={iconColor} />
        </div>
      </div>
      <div className="text-[26px] font-bold text-[#1E1E1E] leading-none tracking-tight">{value}</div>
      {trend && (
        <div className="flex items-center gap-1.5">
          {trendUp !== undefined ? (
            trendUp ? (
              <TrendingUp size={13} className="text-[#1E8E3E]" />
            ) : (
              <TrendingDown size={13} className="text-[#DC2626]" />
            )
          ) : null}
          <span className={`text-[12px] font-semibold ${trendUp ? 'text-[#1E8E3E]' : 'text-[#DC2626]'}`}>{trend}</span>
          {trendLabel && <span className="text-[11px] text-[#6B6B6B]">{trendLabel}</span>}
        </div>
      )}
      {sub && !trend && <p className="text-[11px] text-[#6B6B6B]">{sub}</p>}
    </div>
  )
}

function RiskBadge({ level }: { level: 'high' | 'medium' }) {
  if (level === 'high') {
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#DC2626]">
        Risque élevé
      </span>
    )
  }
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309]">
      Risque moyen
    </span>
  )
}

export function DashboardPage() {
  const { chantiers, factures, user, clients } = useApp()
  const navigate = useNavigate()

  const chantiersActifs = chantiers.filter(c => c.statut === 'en_cours')
  const facturesEnAttente = factures.filter(f => f.statut === 'en_attente')
  const totalDepenses = factures
    .filter(f => f.statut === 'validee')
    .reduce((sum, f) => sum + f.montantTTC, 0)
  const totalBudget = chantiers.reduce((s, c) => s + c.budgetPrevisionnel, 0)
  const chiffreAffaires = totalBudget
  const marge = chiffreAffaires - totalDepenses

  const depensesParCategorie = factures
    .filter(f => f.statut === 'validee')
    .reduce<Record<string, number>>((acc, f) => {
      acc[f.categorie] = (acc[f.categorie] ?? 0) + f.montantTTC
      return acc
    }, {})

  const donutData = Object.entries(depensesParCategorie)
    .map(([cat, val]) => ({
      name: categorieLabels[cat as CategorieDepense] ?? cat,
      value: Math.round(val),
      color: DONUT_COLORS[cat] ?? '#9CA3AF',
      pct: Math.round((val / totalDepenses) * 100),
    }))
    .sort((a, b) => b.value - a.value)

  const margeParChantierData = chantiers.map(c => ({
    name: c.nom.length > 10 ? c.nom.split(' ').slice(0, 2).join(' ') : c.nom,
    realise: c.depensesEngagees,
    previsionnel: c.budgetPrevisionnel,
  }))

  const chantiersEnRisque = chantiers.filter(c => c.tendance === 'rouge' || c.tendance === 'orange')

  const topCategories = donutData.slice(0, 3)

  const dateStr = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="p-7 space-y-6 min-h-full bg-[#FAF6F2]">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold text-[#1E1E1E] leading-snug">
          Bonjour {user?.prenom},
        </h1>
        <p className="text-[13px] text-[#6B6B6B] mt-0.5">
          Voici la situation de votre entreprise ce {dateStr}
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-5 gap-4">
        <KpiCard
          label="Chiffre d'affaires (HT)"
          value={`${fmt(chiffreAffaires)} €`}
          trend="+12,5%"
          trendLabel="vs mois dernier"
          trendUp={true}
          icon={TrendingUp}
          iconBg="bg-[#FFF4EA]"
        />
        <KpiCard
          label="Marge prévisionnelle"
          value={`${fmt(Math.round(marge))} €`}
          trend={`${Math.round((marge / chiffreAffaires) * 100)}%`}
          trendLabel="vs mois dernier"
          trendUp={true}
          icon={PieChartIcon}
          iconBg="bg-[#FFF4EA]"
        />
        <KpiCard
          label="Dépenses engagées"
          value={`${fmt(Math.round(totalDepenses))} €`}
          trend="-8,3%"
          trendLabel="vs mois dernier"
          trendUp={false}
          icon={ReceiptText}
          iconBg="bg-[#FFF4EA]"
        />
        <KpiCard
          label="Chantiers en cours"
          value={chantiersActifs.length.toString()}
          sub={`+${chantiersActifs.length} ce mois-ci`}
          icon={HardHat}
          iconBg="bg-[#FFF4EA]"
        />
        <KpiCard
          label="Factures en attente"
          value={facturesEnAttente.length.toString()}
          sub={`${fmt(facturesEnAttente.reduce((s, f) => s + f.montantTTC, 0))} €`}
          icon={FileText}
          iconBg="bg-[#FFF4EA]"
        />
      </div>

      {/* Row 2: Marge par chantier + Répartition dépenses + Alertes */}
      <div className="grid grid-cols-[1fr_1fr_280px] gap-4">
        {/* Marge par chantier */}
        <div className="bg-white rounded-[20px] p-5 border border-[#F2E8DC]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-semibold text-[#1E1E1E]">Marge par chantier</h2>
            <div className="flex items-center gap-3 text-[11px] text-[#6B6B6B]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#1E1E1E] inline-block" />
                Marge réalisée
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#F06B21] inline-block" />
                Marge prévisionnelle
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={margeParChantierData} barGap={4} barCategoryGap="30%">
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#6B6B6B' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#6B6B6B' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v, name) => [
                  `${fmt(Number(v ?? 0))} €`,
                  name === 'realise' ? 'Réalisé' : 'Prévisionnel',
                ]}
                contentStyle={{
                  borderRadius: '10px',
                  border: '1px solid #F2E8DC',
                  fontSize: '11px',
                }}
              />
              <Bar dataKey="realise" fill="#1E1E1E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="previsionnel" fill="#F06B21" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition dépenses donut */}
        <div className="bg-white rounded-[20px] p-5 border border-[#F2E8DC]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[13px] font-semibold text-[#1E1E1E]">Répartition des dépenses par catégorie</h2>
            <button className="text-[#6B6B6B] hover:text-[#1E1E1E]">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <PieChart width={160} height={160}>
                <Pie
                  data={donutData}
                  cx={75}
                  cy={75}
                  innerRadius={50}
                  outerRadius={72}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#FAF6F2"
                >
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[13px] font-bold text-[#1E1E1E]">{fmt(Math.round(totalDepenses))} €</span>
                <span className="text-[10px] text-[#6B6B6B]">Dépenses engagées</span>
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              {donutData.slice(0, 6).map(d => (
                <div key={d.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-[11px] text-[#3C3C3C] truncate max-w-[90px]">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-semibold text-[#1E1E1E]">{d.pct}%</span>
                    <span className="text-[10px] text-[#6B6B6B]">{fmt(d.value)} €</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alertes importantes */}
        <div className="bg-white rounded-[20px] p-5 border border-[#F2E8DC] flex flex-col">
          <h2 className="text-[13px] font-semibold text-[#1E1E1E] mb-3">Alertes importantes</h2>
          <div className="flex-1 space-y-3">
            {chantiersEnRisque.map(c => {
              const depassement = Math.round(((c.depensesEngagees - c.budgetPrevisionnel) / c.budgetPrevisionnel) * 100)
              return (
                <button
                  key={c.id}
                  onClick={() => navigate(`/chantiers/${c.id}`)}
                  className="w-full flex items-start gap-3 text-left hover:bg-[#FAF6F2] rounded-[10px] p-2 -mx-2 transition-colors"
                >
                  <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5 ${c.tendance === 'rouge' ? 'bg-[#FEE2E2]' : 'bg-[#FEF3C7]'}`}>
                    <AlertTriangle size={13} className={c.tendance === 'rouge' ? 'text-[#DC2626]' : 'text-[#B45309]'} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-[#1E1E1E] truncate">
                      {c.tendance === 'rouge' ? 'Dépassement budget' : 'Budget à surveiller'}
                    </p>
                    <p className="text-[11px] text-[#6B6B6B] truncate">
                      {c.nom} {c.tendance === 'rouge' ? `+${depassement}%` : `${Math.round((c.depensesEngagees / c.budgetPrevisionnel) * 100)}%`}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#9CA3AF] shrink-0 ml-auto">il y a 2h</span>
                </button>
              )
            })}
            <div className="flex items-start gap-3 p-2 -mx-2">
              <div className="w-7 h-7 rounded-[8px] bg-[#FEF3C7] flex items-center justify-center shrink-0 mt-0.5">
                <FileText size={13} className="text-[#B45309]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-[#1E1E1E]">Facture non rattachée</p>
                <p className="text-[11px] text-[#6B6B6B]">{facturesEnAttente.length} facture{facturesEnAttente.length > 1 ? 's' : ''} fournisseur en attente</p>
              </div>
              <span className="text-[10px] text-[#9CA3AF] shrink-0 ml-auto">il y a 5h</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/chantiers')}
            className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-[#F06B21] hover:text-[#D95B17] transition-colors"
          >
            Voir toutes les alertes <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Row 3: Activité récente + Trésorerie + Chantiers en risque + Prochaines échéances */}
      <div className="grid grid-cols-4 gap-4">
        {/* Activité récente */}
        <div className="flex min-h-[276px] flex-col rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <h2 className="text-[13px] font-semibold text-[#1E1E1E] mb-4">Activité récente</h2>
          <div className="flex-1 space-y-4">
            {factures.slice(0, 4).map((f, i) => {
              const chantier = chantiers.find(c => c.id === f.chantierId)
              const icons = [CheckCircle, Mail, FileText, ArrowRight]
              const Icon = icons[i % icons.length]
              const colors = ['text-[#1E8E3E]', 'text-[#F06B21]', 'text-[#6B6B6B]', 'text-[#6B6B6B]']
              const times = ['il y a 15 min', 'il y a 16 min', 'il y a 1 h', 'il y a 2 h']
              return (
                <div key={f.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-[8px] bg-[#FAF6F2] flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={13} strokeWidth={1.75} className={colors[i]} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#1E1E1E] truncate">{f.fournisseur}</p>
                    <p className="text-[11px] text-[#6B6B6B] truncate">{fmt(f.montantTTC)} € — {chantier?.nom}</p>
                  </div>
                  <span className="text-[10px] text-[#9CA3AF] shrink-0">{times[i]}</span>
                </div>
              )
            })}
          </div>
          <button
            onClick={() => navigate('/factures')}
            className="mt-auto flex items-center gap-1.5 pt-4 text-[12px] font-medium text-[#F06B21] transition-colors hover:text-[#D95B17]"
          >
            Voir toute l'activité <ArrowRight size={12} />
          </button>
        </div>

        {/* Trésorerie prévisionnelle */}
        <div className="flex min-h-[276px] flex-col rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[13px] font-semibold text-[#1E1E1E]">Trésorerie prévisionnelle</h2>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <span className="flex items-center gap-1.5 text-[11px] text-[#6B6B6B]">
              <span className="w-6 border-t-2 border-dashed border-[#F06B21] inline-block" />
              Prévision
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-[#6B6B6B]">
              <span className="w-6 border-t-2 border-[#1E1E1E] inline-block" />
              Réalisé
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tresoData}>
                <XAxis dataKey="mois" tick={{ fontSize: 10, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6B6B6B' }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip
                  formatter={(v, name) => [`${fmt(Number(v ?? 0))} €`, name === 'prevision' ? 'Prévision' : 'Réalisé']}
                  contentStyle={{ borderRadius: '10px', border: '1px solid #F2E8DC', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="prevision" stroke="#F06B21" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 3, fill: '#F06B21' }} />
                <Line type="monotone" dataKey="realise" stroke="#1E1E1E" strokeWidth={2} dot={{ r: 3, fill: '#1E1E1E' }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chantiers en risque */}
        <div className="flex min-h-[276px] flex-col rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <h2 className="text-[13px] font-semibold text-[#1E1E1E] mb-4">Chantiers en risque</h2>
          <div className="flex-1 space-y-4">
            {chantiersEnRisque.map(c => {
              const client = clients.find(cl => cl.id === c.clientId)
              const depassement = Math.round(((c.depensesEngagees - c.budgetPrevisionnel) / c.budgetPrevisionnel) * 100)
              const margeText = `Marge prévisionnelle : ${Math.round((1 - c.depensesEngagees / c.budgetPrevisionnel) * 100)}%`
              return (
                <button
                  key={c.id}
                  onClick={() => navigate(`/chantiers/${c.id}`)}
                  className="flex w-full items-start gap-3 rounded-[12px] text-left transition-colors hover:bg-[#FAF6F2]"
                >
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] ${c.tendance === 'rouge' ? 'bg-[#FEE2E2]' : 'bg-[#FEF3C7]'}`}>
                    <AlertTriangle size={13} className={c.tendance === 'rouge' ? 'text-[#DC2626]' : 'text-[#B45309]'} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="truncate text-[12px] font-semibold text-[#1E1E1E]">{c.nom}</span>
                      <RiskBadge level={c.tendance === 'rouge' ? 'high' : 'medium'} />
                    </div>
                    <p className="truncate text-[11px] text-[#6B6B6B]">
                      {c.tendance === 'rouge'
                        ? `Dépassement prévisionnel : +${depassement}%`
                        : margeText}
                    </p>
                    {client && <p className="truncate text-[10px] text-[#9CA3AF]">— {client.nom}</p>}
                  </div>
                </button>
              )
            })}
            {chantiers.filter(c => c.tendance === 'vert' && c.statut === 'en_cours').slice(0, 1).map(c => (
              <button
                key={c.id}
                onClick={() => navigate(`/chantiers/${c.id}`)}
                className="flex w-full items-start gap-3 rounded-[12px] text-left transition-colors hover:bg-[#FAF6F2]"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-[#FEF3C7]">
                  <AlertTriangle size={13} className="text-[#B45309]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="truncate text-[12px] font-semibold text-[#1E1E1E]">{c.nom}</span>
                    <RiskBadge level="medium" />
                  </div>
                  <p className="truncate text-[11px] text-[#6B6B6B]">Retard planning : 5 jours</p>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate('/chantiers')}
            className="mt-auto flex items-center gap-1.5 pt-4 text-[12px] font-medium text-[#F06B21] transition-colors hover:text-[#D95B17]"
          >
            Voir tous les chantiers à risque <ArrowRight size={12} />
          </button>
        </div>

        {/* Prochaines échéances */}
        <div className="flex min-h-[276px] flex-col rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <h2 className="text-[13px] font-semibold text-[#1E1E1E] mb-4">Prochaines échéances</h2>
          <div className="flex-1 space-y-3">
            {[
              { day: '22', month: 'avr', label: 'Réunion de chantier', sub: 'Maison Dupont', time: '09:00', Icon: Users },
              { day: '23', month: 'avr', label: 'Livraison matériaux', sub: 'Villa des Pins', time: '10:30', Icon: HardHat },
              { day: '24', month: 'avr', label: 'Point planning', sub: 'Équipe 1', time: '14:00', Icon: Calendar },
            ].map((e, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 shrink-0 text-center">
                  <p className="text-[18px] font-bold text-[#F06B21] leading-none">{e.day}</p>
                  <p className="text-[10px] text-[#6B6B6B] uppercase">{e.month}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#1E1E1E] truncate">{e.label}</p>
                  <p className="text-[11px] text-[#6B6B6B] truncate">{e.sub}</p>
                </div>
                <span className="text-[11px] font-medium text-[#6B6B6B] shrink-0">{e.time}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/planning')}
            className="mt-auto flex items-center gap-1.5 pt-4 text-[12px] font-medium text-[#F06B21] transition-colors hover:text-[#D95B17]"
          >
            Voir tout le planning <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Row 4: Bottom stats */}
      <div className="grid grid-cols-4 gap-4">
        {/* Dépenses par mois */}
        <div className="bg-white rounded-[20px] p-5 border border-[#F2E8DC]">
          <p className="text-[12px] font-medium text-[#6B6B6B] mb-1">Dépenses par mois (8 derniers mois)</p>
          <p className="text-[22px] font-bold text-[#1E1E1E]">{fmt(Math.round(totalDepenses))} €</p>
          <p className="text-[11px] text-[#6B6B6B] mb-3">Total dépenses</p>
          <p className="text-[11px] text-[#DC2626] font-semibold">-8,3% vs période précédente</p>
          <ResponsiveContainer width="100%" height={60}>
            <BarChart data={depensesParMoisData} barSize={12}>
              <Bar dataKey="val" radius={[3, 3, 0, 0]}>
                {depensesParMoisData.map((_, i) => (
                  <Cell key={i} fill={i === depensesParMoisData.length - 1 ? '#F06B21' : '#EADBC8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top catégories */}
        <div className="bg-white rounded-[20px] p-5 border border-[#F2E8DC]">
          <p className="text-[13px] font-semibold text-[#1E1E1E] mb-4">Top catégories</p>
          <div className="space-y-3">
            {topCategories.map(cat => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-[12px] text-[#3C3C3C]">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#6B6B6B]">{fmt(cat.value)} €</span>
                    <span className="text-[11px] font-semibold text-[#1E1E1E] w-8 text-right">{cat.pct}%</span>
                  </div>
                </div>
                <div className="w-full bg-[#F2E8DC] rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Productivité équipe */}
        <div className="bg-white rounded-[20px] p-5 border border-[#F2E8DC]">
          <p className="text-[12px] font-medium text-[#6B6B6B] mb-1">Productivité équipe (ce mois)</p>
          <p className="text-[36px] font-bold text-[#1E1E1E] leading-none">89%</p>
          <p className="text-[11px] text-[#6B6B6B] mb-4">vs objectif</p>
          <div className="w-full bg-[#F2E8DC] rounded-full h-2 mb-2">
            <div className="h-2 rounded-full bg-[#1E8E3E] transition-all" style={{ width: '89%' }} />
          </div>
          <p className="text-[11px] text-[#1E8E3E] font-semibold">+6% vs mois dernier</p>
        </div>

        {/* Documents traités */}
        <div className="bg-white rounded-[20px] p-5 border border-[#F2E8DC]">
          <p className="text-[12px] font-medium text-[#6B6B6B] mb-1">Documents traités (ce mois)</p>
          <p className="text-[36px] font-bold text-[#1E1E1E] leading-none">126</p>
          <p className="text-[11px] text-[#1E8E3E] font-semibold mb-3">+23% vs mois dernier</p>
          <ResponsiveContainer width="100%" height={50}>
            <LineChart data={docTraitesData}>
              <Line type="monotone" dataKey="val" stroke="#F06B21" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
