import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Calculator,
  Database,
  Euro,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  annualTrendData,
  bestAndWorstYears,
  categoryLabels,
  categoryColors,
  cleanPrevisionnelExercises,
  euro,
  growthData,
  latestCategoryData,
  latestLotData,
  percent,
  topClientPortfolios,
} from '@/lib/previsionnelAnalytics'
import { isDataConnectEnabled } from '@/lib/dataconnect'
import { ENV } from '@/lib/firebase'
import { loadAnalyticsSnapshotsFromSql } from '@/features/analytics/analyticsSql'
import {
  loadLatestPrevisionnelFromSql,
  type SqlPrevisionnelExercise,
  type SqlPrevisionnelLine as SqlPrevisionnelLineRow,
} from '@/features/previsionnel/previsionnelSql'
import { useApp } from '@/lib/store'
import { operationalPrevisionnelLines, previsionnelDataCoverage } from '@/lib/previsionnelModel'

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[20px] border border-[#EADBC8] bg-white shadow-[0_1px_0_rgba(255,255,255,.9)_inset,0_14px_34px_rgba(30,30,30,0.045)] ${className}`}>{children}</section>
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: string
  detail: string
  icon: typeof Euro
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">{label}</p>
          <p className="mt-3 text-[25px] font-bold leading-none text-[#1E1E1E]">{value}</p>
          <p className="mt-2 text-[12px] text-[#6B6B6B]">{detail}</p>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[#FDEBDD] text-[#F06B21]">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
      </div>
    </Card>
  )
}

type SqlExercise = SqlPrevisionnelExercise
type SqlPrevisionnelLine = SqlPrevisionnelLineRow
type TrendPoint = { exercise: string; prevision: number; contrat: number; realise: number; taux: number }
type GrowthPoint = { exercise: string; value: number; growth: number }
type AnalyticsSnapshotSummary = {
  snapshotType: string
  status: string
  payloadHash?: string | null
  sourceWatermark?: string | null
  dateCreation: string
}

function amountBaseSql(exercise: SqlExercise) {
  return exercise.caPrevision || exercise.plannedTotal || exercise.caContrat
}

function trendFromSql(exercises: SqlExercise[]): TrendPoint[] {
  return exercises.map(exercise => {
    const base = amountBaseSql(exercise)
    return {
      exercise: exercise.exercise,
      prevision: Math.round(base),
      contrat: Math.round(exercise.caContrat),
      realise: Math.round(exercise.realizedTotal),
      taux: base > 0 ? Math.round((exercise.realizedTotal / base) * 100) : 0,
    }
  })
}

function growthFromTrend(trend: TrendPoint[]): GrowthPoint[] {
  return trend.map((item, index) => {
    const previous = trend[index - 1]
    const currentValue = item.realise || item.prevision || item.contrat
    const previousValue = previous ? previous.realise || previous.prevision || previous.contrat : 0
    const growth = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0
    return {
      exercise: item.exercise,
      value: Math.round(currentValue),
      growth: Number(growth.toFixed(2)),
    }
  })
}

function yearsFromGrowth(growth: GrowthPoint[]) {
  const comparable = growth.slice(1)
  const bestGrowth = comparable.reduce((best, item) => (item.growth > best.growth ? item : best), comparable[0])
  const worstGrowth = comparable.reduce((worst, item) => (item.growth < worst.growth ? item : worst), comparable[0])
  const byValue = [...growth].sort((a, b) => a.value - b.value)

  return {
    bestGrowth,
    worstGrowth,
    lowestYear: byValue[0],
    bestYear: byValue[byValue.length - 1],
  }
}

function categoryDataFromSql(lines: SqlPrevisionnelLine[]) {
  const grouped = new Map<string, { category: string; planned: number; realized: number; count: number }>()

  lines.forEach(line => {
    const item = grouped.get(line.category) ?? { category: line.category, planned: 0, realized: 0, count: 0 }
    item.planned += line.plannedTotal || line.caPrevision || line.caContrat
    item.realized += line.realizedTotal
    item.count += 1
    grouped.set(line.category, item)
  })

  return Array.from(grouped.values()).map(item => ({
    name: categoryLabels[item.category as keyof typeof categoryLabels] ?? item.category,
    category: item.category,
    planned: Math.round(item.planned),
    realized: Math.round(item.realized),
    count: item.count,
    color: categoryColors[item.category as keyof typeof categoryColors] ?? '#C8B18C',
  }))
}

function lotDataFromSql(lines: SqlPrevisionnelLine[], limit = 9) {
  const grouped = new Map<string, { key: string; name: string; value: number }>()

  lines.forEach(line => {
    line.lots.forEach(lot => {
      const item = grouped.get(lot.lotKey) ?? { key: lot.lotKey, name: lot.label, value: 0 }
      item.value += lot.amount
      grouped.set(lot.lotKey, item)
    })
  })

  return Array.from(grouped.values())
    .map(item => ({ ...item, value: Math.round(item.value) }))
    .filter(item => item.value !== 0)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, limit)
}

export function StatistiquesPage() {
  const { user } = useApp()
  const [sqlStatus, setSqlStatus] = useState<'idle' | 'loading' | 'ready' | 'fallback'>('idle')
  const [sqlExercises, setSqlExercises] = useState<SqlExercise[]>([])
  const [sqlLatestLines, setSqlLatestLines] = useState<SqlPrevisionnelLine[]>([])
  const [analyticsStatus, setAnalyticsStatus] = useState<'idle' | 'loading' | 'ready' | 'empty' | 'fallback'>('idle')
  const [latestAnalyticsSnapshot, setLatestAnalyticsSnapshot] = useState<AnalyticsSnapshotSummary | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadAnalyticsSnapshot() {
      if (!isDataConnectEnabled || !user) {
        if (mounted) setAnalyticsStatus('fallback')
        return
      }

      setAnalyticsStatus('loading')
      try {
        const snapshots = await loadAnalyticsSnapshotsFromSql({ environment: ENV })
        if (!mounted) return
        setLatestAnalyticsSnapshot(snapshots[0] ?? null)
        setAnalyticsStatus(snapshots.length ? 'ready' : 'empty')
      } catch {
        if (mounted) setAnalyticsStatus('fallback')
      }
    }

    void loadAnalyticsSnapshot()

    return () => {
      mounted = false
    }
  }, [user])

  useEffect(() => {
    let mounted = true

    async function loadSqlStats() {
      if (!isDataConnectEnabled || !user) {
        if (!mounted) return
        setSqlStatus('fallback')
        return
      }

      setSqlStatus('loading')
      try {
        const { exercises, lines } = await loadLatestPrevisionnelFromSql()

        if (!mounted) return
        setSqlExercises(exercises)
        setSqlLatestLines(lines)
        setSqlStatus(exercises.length ? 'ready' : 'fallback')
      } catch {
        if (!mounted) return
        setSqlStatus('fallback')
      }
    }

    void loadSqlStats()

    return () => {
      mounted = false
    }
  }, [user])

  const usesSql = sqlStatus === 'ready' && sqlExercises.length > 0
  const trend = useMemo(() => (usesSql ? trendFromSql(sqlExercises) : annualTrendData()), [sqlExercises, usesSql])
  const growth = useMemo(() => (usesSql ? growthFromTrend(trend) : growthData()), [trend, usesSql])
  const years = usesSql ? yearsFromGrowth(growth) : bestAndWorstYears()
  const latest = cleanPrevisionnelExercises[cleanPrevisionnelExercises.length - 1]
  const previous = cleanPrevisionnelExercises[cleanPrevisionnelExercises.length - 2]
  const latestGrowth = growth[growth.length - 1]?.growth ?? 0
  const averageAnnual = trend.reduce((sum, item) => sum + item.realise, 0) / Math.max(trend.length, 1)
  const coverage = previsionnelDataCoverage()
  const sentInvoices = usesSql
    ? sqlExercises.reduce((sum, exercise) => sum + exercise.invoicedTotal, 0)
    : operationalPrevisionnelLines.reduce((sum, line) => sum + line.invoicedTotal, 0)
  const categories = usesSql ? categoryDataFromSql(sqlLatestLines) : latestCategoryData()
  const lots = usesSql ? lotDataFromSql(sqlLatestLines, 9) : latestLotData(9)
  const clients = topClientPortfolios(10)
  const sourceLabel = usesSql
    ? latestAnalyticsSnapshot
      ? 'SQL Connect + snapshot'
      : 'SQL Connect, calcul front'
    : 'Donnees locales'
  const snapshotLabel = latestAnalyticsSnapshot
    ? `${latestAnalyticsSnapshot.snapshotType} - ${latestAnalyticsSnapshot.status}`
    : analyticsStatus === 'loading'
      ? 'Snapshot analytics: chargement'
      : 'Snapshot analytics: non disponible'
  const exerciseCount = usesSql ? sqlExercises.length : coverage.exercises
  const chantierCount = usesSql ? sqlExercises.reduce((sum, exercise) => sum + exercise.chantierCount, 0) : coverage.operationalLines
  const latestLabel = usesSql ? sqlExercises[sqlExercises.length - 1]?.sheet : latest.sheet
  const previousLabel = usesSql ? sqlExercises[sqlExercises.length - 2]?.sheet : previous.sheet

  return (
    <div className="min-h-full bg-[#FAF6F2] p-6 xl:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#F2E8DC] bg-white px-3 py-1 text-[12px] font-semibold text-[#6B6B6B]">
              <Calculator className="h-3.5 w-3.5 text-[#F06B21]" />
              Analyse multi-exercices
            </span>
            <span className="rounded-full bg-[#1E1E1E] px-3 py-1 text-[12px] font-semibold text-white">
              2013-14 → 2025-26
            </span>
            <span className="rounded-full bg-[#FDEBDD] px-3 py-1 text-[12px] font-semibold text-[#F06B21]">
              Source : {sourceLabel}
            </span>
            <span className="rounded-full border border-[#F2E8DC] bg-white px-3 py-1 text-[12px] font-semibold text-[#6B6B6B]">
              {snapshotLabel}
            </span>
          </div>
          <h1 className="text-[30px] font-bold leading-tight text-[#1E1E1E]">Statistiques</h1>
          <p className="mt-2 max-w-3xl text-sm text-[#6B6B6B]">
            Tableau d’analyse façon direction financière : croissance, écarts, concentration clients, répartition par corps d’état et fiabilité prévu/réalisé.
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard label="Meilleure année" value={years.bestYear.exercise} detail={euro(years.bestYear.value)} icon={TrendingUp} />
        <StatCard label="Année la plus faible" value={years.lowestYear.exercise} detail={euro(years.lowestYear.value)} icon={TrendingDown} />
        <StatCard label="Croissance récente" value={percent(latestGrowth)} detail={`${latestLabel} vs ${previousLabel}`} icon={LineChartIcon} />
        <StatCard label="Moyenne annuelle" value={euro(averageAnnual)} detail={`${trend.length} exercices consolidés`} icon={Database} />
      </div>

      <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1.35fr)_420px]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-semibold text-[#1E1E1E]">Courbe de croissance</h2>
              <p className="mt-1 text-[12px] text-[#6B6B6B]">CA réalisé quand disponible, prévision/contrat en fallback historique.</p>
            </div>
            <span className="rounded-full bg-[#FDEBDD] px-3 py-1 text-[12px] font-semibold text-[#F06B21]">
              Pic croissance {years.bestGrowth.exercise}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={330}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="caFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#F06B21" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#F06B21" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#F2E8DC" vertical={false} />
              <XAxis dataKey="exercise" tick={{ fill: '#6B6B6B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B6B6B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={value => `${Math.round(Number(value) / 1000)}k`} />
              <Tooltip formatter={value => euro(Number(value))} contentStyle={{ border: '1px solid #F2E8DC', borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="realise" name="Réalisé" stroke="#F06B21" strokeWidth={2.5} fill="url(#caFill)" />
              <Area type="monotone" dataKey="prevision" name="Prévision" stroke="#1E1E1E" strokeWidth={2} fill="transparent" strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h2 className="text-[17px] font-semibold text-[#1E1E1E]">Lecture expert-comptable</h2>
          <div className="mt-4 space-y-3">
            {[
              ['Meilleure croissance', years.bestGrowth.exercise, percent(years.bestGrowth.growth)],
              ['Plus fort recul', years.worstGrowth.exercise, percent(years.worstGrowth.growth)],
              ['Factures envoyées', 'Cellules jaunes, non encaissées', euro(sentInvoices)],
              ['Chantiers exploitables', `${exerciseCount} exercices`, chantierCount.toLocaleString('fr-FR')],
            ].map(([label, main, value]) => (
              <div key={label} className="rounded-[14px] bg-[#FAF6F2] p-3">
                <p className="text-[12px] font-medium text-[#6B6B6B]">{label}</p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <span className="text-[13px] font-semibold text-[#1E1E1E]">{main}</span>
                  <span className="text-[13px] font-bold text-[#F06B21]">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_380px]">
        <Card className="p-5">
          <h2 className="text-[17px] font-semibold text-[#1E1E1E]">Croissance annuelle</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={growth.slice(1)}>
              <CartesianGrid stroke="#F2E8DC" vertical={false} />
              <XAxis dataKey="exercise" tick={{ fill: '#6B6B6B', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B6B6B', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={value => `${value}%`} />
              <Tooltip formatter={value => percent(Number(value))} contentStyle={{ border: '1px solid #F2E8DC', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="growth" radius={[6, 6, 0, 0]}>
                {growth.slice(1).map(item => (
                  <Cell key={item.exercise} fill={item.growth >= 0 ? '#F06B21' : '#1E1E1E'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h2 className="text-[17px] font-semibold text-[#1E1E1E]">Corps d’état 2025-26</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={lots} layout="vertical" margin={{ left: 18 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fill: '#6B6B6B', fontSize: 10 }} axisLine={false} tickLine={false} width={92} />
              <Tooltip formatter={value => euro(Number(value))} contentStyle={{ border: '1px solid #F2E8DC', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="value" fill="#F06B21" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[17px] font-semibold text-[#1E1E1E]">Mix chantier</h2>
            <PieChartIcon className="h-4 w-4 text-[#F06B21]" />
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={categories} dataKey="planned" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={2}>
                {categories.map(item => (
                  <Cell key={item.category} fill={item.color} />
                ))}
              </Pie>
              <Tooltip formatter={value => euro(Number(value))} contentStyle={{ border: '1px solid #F2E8DC', borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2">
            {categories.slice(0, 6).map(item => (
              <div key={item.category} className="flex items-center gap-2 text-[11px] text-[#6B6B6B]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#F2E8DC] p-5">
          <div>
            <h2 className="text-[17px] font-semibold text-[#1E1E1E]">Top clients historiques</h2>
            <p className="mt-1 text-[12px] text-[#6B6B6B]">Rapprochement automatique par nom source Excel normalisé.</p>
          </div>
          <BarChart3 className="h-5 w-5 text-[#F06B21]" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-[13px]">
            <thead className="bg-[#FAF6F2] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B6B6B]">
              <tr>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Chantiers</th>
                <th className="px-5 py-3">Exercices</th>
                <th className="px-5 py-3">Prévision</th>
                <th className="px-5 py-3">Contrat</th>
                <th className="px-5 py-3">Dernier exercice</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.clientKey} className="border-t border-[#F2E8DC]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-[12px] bg-[#FDEBDD] text-[#F06B21]">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#1E1E1E]">{client.name}</p>
                        <p className="text-[11px] text-[#6B6B6B]">{client.aliases.slice(0, 2).join(' / ')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-[#1E1E1E]">{client.chantierCount}</td>
                  <td className="px-5 py-3 text-[#3C3C3C]">{client.exercises.length}</td>
                  <td className="px-5 py-3 font-semibold text-[#1E1E1E]">{euro(client.totalPrevision || client.totalPlanned)}</td>
                  <td className="px-5 py-3 text-[#3C3C3C]">{client.totalContrat ? euro(client.totalContrat) : '—'}</td>
                  <td className="px-5 py-3 text-[#3C3C3C]">{client.lastExercise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
