import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Database,
  FileText,
  HardHat,
  PieChart as PieChartIcon,
  ReceiptText,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useApp } from '@/lib/store'
import { isDataConnectEnabled } from '@/lib/dataconnect'
import { ENV } from '@/lib/firebase'
import { loadAnalyticsSnapshotsFromSql } from '@/features/analytics/analyticsSql'
import {
  loadLatestPrevisionnelFromSql,
  type SqlPrevisionnelExercise,
  type SqlPrevisionnelLine as SqlPrevisionnelLineRow,
} from '@/features/previsionnel/previsionnelSql'
import {
  amountBase,
  categoryColors,
  categoryLabels,
  latestCategoryData,
  latestExercise,
} from '@/lib/previsionnelAnalytics'
import { operationalPrevisionnelLines, previsionnelDataCoverage } from '@/lib/previsionnelModel'
import { useOperationalData } from '@/features/operations/useOperationalData'

type SqlExercise = SqlPrevisionnelExercise
type SqlPrevisionnelLine = SqlPrevisionnelLineRow
type AnalyticsSnapshotSummary = {
  snapshotType: string
  status: string
  totalCaPrevision?: number | null
  totalCaRealise?: number | null
  payloadHash?: string | null
  sourceWatermark?: string | null
  dateCreation: string
}

type DashboardLine = {
  id: string
  name: string
  clientName: string
  category: string
  base: number
  plannedTotal: number
  realizedTotal: number
  invoicedTotal: number
  monthly: Array<{
    order: number
    label: string
    planned: number
    realized: number
    invoiceSent: boolean
  }>
  chantierId?: string
}

type CategoryPoint = {
  name: string
  category: string
  planned: number
  realized: number
  count: number
  color: string
  pct: number
}

const scrollableDashboardListClass =
  'min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 -mr-1 [scrollbar-width:thin] [scrollbar-color:#EADBC8_transparent]'

const syntheticLinePatterns = [
  /\bcumul\b/i,
  /\btotal\b/i,
  /\btotaux\b/i,
  /\bsous[-\s]?total\b/i,
  /\bca\s+r[eé]alis[eé]e?\b/i,
  /\breste\s+a\s+facturer\b/i,
  /\bfacturation\s+globale\b/i,
]

function fmt(n: number) {
  return Math.round(n).toLocaleString('fr-FR')
}

function fmtEuro(n: number) {
  return `${fmt(n)} EUR`
}

function ratio(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0
}

function exerciseBaseSql(exercise: SqlExercise) {
  return exercise.caPrevision || exercise.plannedTotal || exercise.caContrat
}

function isSyntheticLabel(value: string) {
  return syntheticLinePatterns.some(pattern => pattern.test(value))
}

function isOperationalSqlLine(line: SqlPrevisionnelLine) {
  const label = `${line.rawName} ${line.clientName}`.trim()
  const amount = Math.max(line.caPrevision, line.caContrat, line.plannedTotal, line.realizedTotal)
  return line.lineType === 'chantier' && Boolean(line.clientName.trim()) && !isSyntheticLabel(label) && amount > 0
}

function lineBase(line: {
  caPrevision: number
  caContrat: number
  plannedTotal: number
  realizedTotal: number
}) {
  return line.caPrevision || line.plannedTotal || line.caContrat || line.realizedTotal
}

function linesFromSql(lines: SqlPrevisionnelLine[]): DashboardLine[] {
  return lines.filter(isOperationalSqlLine).map(line => ({
    id: line.id,
    name: line.rawName || line.clientName,
    clientName: line.clientName,
    category: line.category,
    base: lineBase(line),
    plannedTotal: line.plannedTotal,
    realizedTotal: line.realizedTotal,
    invoicedTotal: line.invoicedTotal,
    chantierId: line.chantier?.id,
    monthly: line.monthly.map(month => ({
      order: month.monthOrder,
      label: month.label,
      planned: month.planned,
      realized: month.realized,
      invoiceSent: Boolean(month.invoiceSent),
    })),
  }))
}

function linesFromLocal(exercise: string): DashboardLine[] {
  return operationalPrevisionnelLines
    .filter(line => line.exercise === exercise)
    .map(line => ({
      id: line.id,
      name: line.rawName || line.clientName,
      clientName: line.clientName,
      category: line.category,
      base: lineBase(line),
      plannedTotal: line.plannedTotal,
      realizedTotal: line.realizedTotal,
      invoicedTotal: line.invoicedTotal,
      monthly: line.monthly.map(month => ({
        order: month.order,
        label: month.label,
        planned: month.planned,
        realized: month.realized,
        invoiceSent: Boolean(month.invoiceSent),
      })),
    }))
}

function monthlyFromLines(lines: DashboardLine[]) {
  const grouped = new Map<number, { mois: string; planned: number; realized: number; invoiceSent: number }>()

  lines.forEach(line => {
    line.monthly.forEach(month => {
      const item = grouped.get(month.order) ?? {
        mois: month.label,
        planned: 0,
        realized: 0,
        invoiceSent: 0,
      }
      item.planned += month.planned
      item.realized += month.realized
      item.invoiceSent += month.invoiceSent ? 1 : 0
      grouped.set(month.order, item)
    })
  })

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a - b)
    .map(([, item]) => ({
      ...item,
      planned: Math.round(item.planned),
      realized: Math.round(item.realized),
    }))
}

function categoriesFromSql(lines: DashboardLine[]): CategoryPoint[] {
  const grouped = new Map<string, { category: string; planned: number; realized: number; count: number }>()

  lines.forEach(line => {
    const item = grouped.get(line.category) ?? { category: line.category, planned: 0, realized: 0, count: 0 }
    item.planned += line.plannedTotal || line.base
    item.realized += line.realizedTotal
    item.count += 1
    grouped.set(line.category, item)
  })

  const total = Array.from(grouped.values()).reduce((sum, item) => sum + item.realized, 0)

  return Array.from(grouped.values())
    .map(item => ({
      name: categoryLabels[item.category as keyof typeof categoryLabels] ?? item.category,
      category: item.category,
      planned: Math.round(item.planned),
      realized: Math.round(item.realized),
      count: item.count,
      color: categoryColors[item.category as keyof typeof categoryColors] ?? '#C8B18C',
      pct: ratio(item.realized, total),
    }))
    .sort((a, b) => b.realized - a.realized)
}

function categoriesFromLocal(): CategoryPoint[] {
  const raw = latestCategoryData()
  const total = raw.reduce((sum, item) => sum + item.realized, 0)
  return raw
    .map(item => ({ ...item, pct: ratio(item.realized, total) }))
    .sort((a, b) => b.realized - a.realized)
}

function KpiCard({
  label,
  value,
  detail,
  icon: Icon,
  trend,
  trendUp,
}: {
  label: string
  value: string
  detail: string
  icon: React.ElementType
  trend?: string
  trendUp?: boolean
}) {
  return (
    <div className="flex min-h-[132px] flex-col gap-3 rounded-[20px] border border-[#F2E8DC] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium leading-none text-[#3C3C3C]">{label}</p>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#FFF4EA] text-[#F06B21] ring-1 ring-[#F06B21]/5">
          <Icon size={18} strokeWidth={1.75} />
        </div>
      </div>
      <div className="text-[26px] font-bold leading-none tracking-tight text-[#1E1E1E]">{value}</div>
      <div className="flex items-center gap-1.5">
        {trend && (
          <>
            {trendUp ? (
              <TrendingUp size={13} className="text-[#1E8E3E]" />
            ) : (
              <TrendingDown size={13} className="text-[#DC2626]" />
            )}
            <span className={`text-[12px] font-semibold ${trendUp ? 'text-[#1E8E3E]' : 'text-[#DC2626]'}`}>
              {trend}
            </span>
          </>
        )}
        <span className="text-[11px] text-[#6B6B6B]">{detail}</span>
      </div>
    </div>
  )
}

function GapBadge({ gap, rate }: { gap: number; rate: number }) {
  const isBehind = gap < 0
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        isBehind ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#FDEBDD] text-[#F06B21]'
      }`}
    >
      {isBehind ? `${fmt(Math.abs(gap))} EUR a couvrir` : `${Math.round(rate)}% realise`}
    </span>
  )
}

export function DashboardPage() {
  const {
    chantiers,
    factures,
    source: operationalSource,
    isLoading: isOperationalLoading,
  } = useOperationalData()
  const { user } = useApp()
  const navigate = useNavigate()
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

    async function loadPrevisionnel() {
      if (!isDataConnectEnabled || !user) {
        if (mounted) setSqlStatus('fallback')
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
        if (mounted) setSqlStatus('fallback')
      }
    }

    void loadPrevisionnel()

    return () => {
      mounted = false
    }
  }, [user])

  const localLatest = latestExercise()
  const usesSql = sqlStatus === 'ready' && sqlExercises.length > 0
  const currentExercise = usesSql ? sqlExercises[sqlExercises.length - 1] : localLatest
  const currentExerciseLabel = currentExercise.exercise
  const sourceLabel = usesSql
    ? latestAnalyticsSnapshot
      ? 'SQL Connect + snapshot'
      : 'SQL Connect, calcul front'
    : operationalSource === 'dataconnect'
      ? 'SQL Connect + Excel local'
      : 'Excel local'
  const coverage = previsionnelDataCoverage()

  const dashboardLines = usesSql ? linesFromSql(sqlLatestLines) : linesFromLocal(currentExerciseLabel)
  const monthlyData = monthlyFromLines(dashboardLines)
  const categoryData = usesSql ? categoriesFromSql(dashboardLines) : categoriesFromLocal()

  const baseAmount = usesSql ? exerciseBaseSql(currentExercise as SqlExercise) : amountBase(localLatest)
  const realizedAmount = currentExercise.realizedTotal
  const invoicedAmount = currentExercise.invoicedTotal
  const gapAmount = realizedAmount - baseAmount
  const realizationRate = ratio(realizedAmount, baseAmount)
  const invoiceSentLines = dashboardLines.filter(line => line.monthly.some(month => month.invoiceSent))
  const invoiceSentCells = dashboardLines.reduce(
    (sum, line) => sum + line.monthly.filter(month => month.invoiceSent).length,
    0,
  )
  const topGaps = [...dashboardLines]
    .map(line => ({
      ...line,
      gap: line.realizedTotal - line.base,
      rate: line.base > 0 ? (line.realizedTotal / line.base) * 100 : 0,
    }))
    .filter(line => line.base > 0)
    .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
    .slice(0, 8)

  const topChantiers = [...dashboardLines]
    .sort((a, b) => Math.max(b.base, b.realizedTotal) - Math.max(a.base, a.realizedTotal))
    .slice(0, 8)

  const chantiersCourants = chantiers.filter(chantier => chantier.statut === 'en_cours')
  const chantiersPlanifies = chantiers
    .filter(chantier => chantier.statut !== 'cloture')
    .sort((a, b) => a.dateFinPrevue.localeCompare(b.dateFinPrevue))
    .slice(0, 5)
  const facturesEnAttente = factures.filter(facture => facture.statut === 'en_attente')
  const totalFacturesEnAttente = facturesEnAttente.reduce((sum, facture) => sum + facture.montantTTC, 0)
  const alertCount = topGaps.filter(line => line.gap < 0).length + invoiceSentLines.length

  const dateStr = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-full space-y-6 bg-[#FAF6F2] p-7">
      <section className="overflow-hidden rounded-[24px] border border-[#2A2A2A] bg-[#1E1E1E] text-white shadow-[0_18px_48px_rgba(30,30,30,0.16)]">
        <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="flex min-w-0 flex-col justify-between gap-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#F89A62]">
                Pilotage previsionnel vivant
              </p>
              <h1 className="mt-3 max-w-[760px] text-[34px] font-semibold leading-[1.02] tracking-[-0.01em] text-white">
                Bonjour {user?.prenom}, voici l'exercice {currentExerciseLabel} consolide depuis le fichier Excel.
              </h1>
              <p className="mt-3 max-w-[660px] text-sm leading-6 text-[#C9C9C9]">
                Situation au {dateStr}. Les indicateurs ci-dessous utilisent le previsionnel importe, les chantiers
                derives de l'Excel et les donnees SQL Connect quand elles sont disponibles.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate('/previsionnel')}
                className="inline-flex h-10 items-center gap-2 rounded-[12px] bg-[#F06B21] px-4 text-sm font-semibold text-white transition hover:bg-[#D95B17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F06B21]/40"
              >
                <Database className="h-4 w-4" strokeWidth={1.75} />
                Ouvrir le previsionnel
              </button>
              <button
                type="button"
                onClick={() => navigate('/statistiques')}
                className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[#3C3C3C] bg-[#242424] px-4 text-sm font-semibold text-[#E5E5E5] transition hover:border-[#F06B21] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F06B21]/40"
              >
                <PieChartIcon className="h-4 w-4" strokeWidth={1.75} />
                Analyse detaillee
              </button>
              <button
                type="button"
                onClick={() => navigate('/chantiers')}
                className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[#3C3C3C] bg-[#242424] px-4 text-sm font-semibold text-[#E5E5E5] transition hover:border-[#F06B21] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F06B21]/40"
              >
                <HardHat className="h-4 w-4" strokeWidth={1.75} />
                Chantiers vivants
              </button>
            </div>
          </div>

          <div className="rounded-[20px] border border-[#2A2A2A] bg-[#242424] p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8A8A8A]">
                Source et controles
              </span>
              <span className="rounded-full bg-[#2A1A0D] px-2.5 py-1 text-[11px] font-semibold text-[#F06B21]">
                {sqlStatus === 'loading' || isOperationalLoading ? 'Chargement' : sourceLabel}
              </span>
            </div>
            <div className="grid gap-3">
              {[
                {
                  label: 'Lignes chantier',
                  value: dashboardLines.length.toString(),
                  meta: `${coverage.syntheticOrNonOperationalLines} lignes non operationnelles exclues`,
                  Icon: HardHat,
                },
                {
                  label: 'Cellules facture envoyee',
                  value: invoiceSentCells.toString(),
                  meta: `${invoiceSentLines.length} chantiers avec signal Excel jaune`,
                  Icon: ReceiptText,
                },
                {
                  label: 'Ecart realise / prevu',
                  value: fmtEuro(gapAmount),
                  meta: `${realizationRate}% de realisation sur ${currentExerciseLabel}`,
                  Icon: gapAmount >= 0 ? TrendingUp : AlertTriangle,
                },
                {
                  label: 'Snapshot analytics SQL',
                  value: analyticsStatus === 'loading' ? '...' : latestAnalyticsSnapshot ? 'Oui' : 'Non',
                  meta: latestAnalyticsSnapshot
                    ? `${latestAnalyticsSnapshot.snapshotType} - ${latestAnalyticsSnapshot.status}`
                    : 'Calcul front depuis SQL/previsionnel, pas de snapshot fige',
                  Icon: Database,
                },
              ].map(item => {
                const Icon = item.Icon
                return (
                  <div
                    key={item.label}
                    className="grid grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] border border-[#2A2A2A] bg-[#1E1E1E] p-3"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#FDEBDD] text-[#F06B21]">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-white">{item.label}</span>
                      <span className="block truncate text-[11px] text-[#8A8A8A]">{item.meta}</span>
                    </span>
                    <strong className="text-[18px] font-semibold text-white">{item.value}</strong>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="CA previsionnel"
          value={fmtEuro(baseAmount)}
          detail={`${currentExerciseLabel} depuis Excel`}
          icon={TrendingUp}
        />
        <KpiCard
          label="CA realise"
          value={fmtEuro(realizedAmount)}
          detail={`${realizationRate}% du previsionnel`}
          trend={gapAmount >= 0 ? `+${fmt(gapAmount)} EUR` : `-${fmt(Math.abs(gapAmount))} EUR`}
          trendUp={gapAmount >= 0}
          icon={PieChartIcon}
        />
        <KpiCard
          label="Factures envoyees Excel"
          value={fmtEuro(invoicedAmount)}
          detail={`${invoiceSentCells} cellules marquees envoyees`}
          icon={ReceiptText}
        />
        <KpiCard
          label="Chantiers en cours"
          value={chantiersCourants.length.toString()}
          detail={`${chantiersPlanifies.length} dossiers non clotures visibles`}
          icon={HardHat}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_320px]">
        <div className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[13px] font-semibold text-[#1E1E1E]">Top chantiers prevu / realise</h2>
            <span className="text-[11px] font-medium text-[#6B6B6B]">{currentExerciseLabel}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topChantiers} barGap={4} barCategoryGap="30%">
              <XAxis
                dataKey="clientName"
                tick={{ fontSize: 10, fill: '#6B6B6B' }}
                axisLine={false}
                tickLine={false}
                interval={0}
                tickFormatter={value => String(value).split(' ').slice(0, 2).join(' ')}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#6B6B6B' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={value => `${Number(value) / 1000}k`}
              />
              <Tooltip
                formatter={(value, name) => [
                  fmtEuro(Number(value ?? 0)),
                  name === 'realizedTotal' ? 'Realise' : 'Previsionnel',
                ]}
                contentStyle={{ borderRadius: '10px', border: '1px solid #F2E8DC', fontSize: '11px' }}
              />
              <Bar dataKey="base" fill="#F06B21" radius={[4, 4, 0, 0]} />
              <Bar dataKey="realizedTotal" fill="#1E1E1E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-[13px] font-semibold text-[#1E1E1E]">Repartition du realise par categorie</h2>
            <span className="text-[11px] font-medium text-[#6B6B6B]">{categoryData.length} categories</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <PieChart width={168} height={168}>
                <Pie
                  data={categoryData}
                  cx={80}
                  cy={80}
                  innerRadius={52}
                  outerRadius={74}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="realized"
                  strokeWidth={2}
                  stroke="#FAF6F2"
                >
                  {categoryData.map(entry => (
                    <Cell key={entry.category} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[13px] font-bold text-[#1E1E1E]">{fmtEuro(realizedAmount)}</span>
                <span className="text-[10px] text-[#6B6B6B]">Realise</span>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              {categoryData.slice(0, 6).map(category => (
                <div key={category.category} className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="truncate text-[11px] text-[#3C3C3C]">{category.name}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#1E1E1E]">{category.pct}%</span>
                    <span className="text-[10px] text-[#6B6B6B]">{fmtEuro(category.realized)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex h-[304px] min-h-0 flex-col rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[13px] font-semibold text-[#1E1E1E]">Ecarts a surveiller</h2>
            <span className="rounded-full bg-[#FAF6F2] px-2 py-0.5 text-[10px] font-semibold text-[#6B6B6B]">
              {alertCount}
            </span>
          </div>
          <div className={scrollableDashboardListClass}>
            {topGaps.map(line => (
              <button
                key={line.id}
                onClick={() => (line.chantierId ? navigate(`/chantiers/${line.chantierId}`) : navigate('/previsionnel'))}
                className="flex w-full items-start gap-3 rounded-[10px] p-2 text-left transition-colors hover:bg-[#FAF6F2]"
              >
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] ${
                    line.gap < 0 ? 'bg-[#FEF3C7]' : 'bg-[#FDEBDD]'
                  }`}
                >
                  <AlertTriangle size={13} className={line.gap < 0 ? 'text-[#B45309]' : 'text-[#F06B21]'} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-[#1E1E1E]">{line.clientName}</p>
                  <p className="truncate text-[11px] text-[#6B6B6B]">
                    {fmtEuro(line.realizedTotal)} realise sur {fmtEuro(line.base)}
                  </p>
                </div>
                <GapBadge gap={line.gap} rate={line.rate} />
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate('/previsionnel')}
            className="mt-3 flex shrink-0 items-center gap-1.5 text-[12px] font-medium text-[#F06B21] transition-colors hover:text-[#D95B17]"
          >
            Voir le tableur <ArrowRight size={12} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <div className="flex h-[276px] min-h-0 flex-col rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-[#1E1E1E]">Prevu / realise mensuel</h2>
          </div>
          <div className="mb-3 flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[11px] text-[#6B6B6B]">
              <span className="inline-block w-6 border-t-2 border-dashed border-[#F06B21]" />
              Prevu
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-[#6B6B6B]">
              <span className="inline-block w-6 border-t-2 border-[#1E1E1E]" />
              Realise
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <XAxis dataKey="mois" tick={{ fontSize: 10, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#6B6B6B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={value => `${Number(value) / 1000}k`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    fmtEuro(Number(value ?? 0)),
                    name === 'planned' ? 'Prevu' : 'Realise',
                  ]}
                  contentStyle={{ borderRadius: '10px', border: '1px solid #F2E8DC', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="planned" stroke="#F06B21" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 3, fill: '#F06B21' }} />
                <Line type="monotone" dataKey="realized" stroke="#1E1E1E" strokeWidth={2} dot={{ r: 3, fill: '#1E1E1E' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex h-[276px] min-h-0 flex-col rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[13px] font-semibold text-[#1E1E1E]">Factures envoyees dans Excel</h2>
            <span className="rounded-full bg-[#FAF6F2] px-2 py-0.5 text-[10px] font-semibold text-[#6B6B6B]">
              {invoiceSentLines.length}
            </span>
          </div>
          <div className={scrollableDashboardListClass}>
            {invoiceSentLines.slice(0, 8).map(line => (
              <div key={line.id} className="flex items-start gap-3 rounded-[10px] p-2">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[#FDEBDD]">
                  <ReceiptText size={13} className="text-[#F06B21]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-[#1E1E1E]">{line.clientName}</p>
                  <p className="truncate text-[11px] text-[#6B6B6B]">
                    {line.monthly.filter(month => month.invoiceSent).map(month => month.label).join(', ')}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] font-semibold text-[#1E1E1E]">{fmtEuro(line.invoicedTotal)}</span>
              </div>
            ))}
            {invoiceSentLines.length === 0 && (
              <p className="text-[12px] text-[#6B6B6B]">Aucun signal facture envoyee pour cet exercice.</p>
            )}
          </div>
        </div>

        <div className="flex h-[276px] min-h-0 flex-col rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[13px] font-semibold text-[#1E1E1E]">Prochaines fins prevues</h2>
            <Calendar size={16} className="text-[#F06B21]" />
          </div>
          <div className={scrollableDashboardListClass}>
            {chantiersPlanifies.map(chantier => {
              const date = new Date(`${chantier.dateFinPrevue}T00:00:00`)
              return (
                <button
                  key={chantier.id}
                  onClick={() => navigate(`/chantiers/${chantier.id}`)}
                  className="flex w-full items-center gap-3 rounded-[10px] p-2 text-left transition-colors hover:bg-[#FAF6F2]"
                >
                  <div className="w-10 shrink-0 text-center">
                    <p className="text-[18px] font-bold leading-none text-[#F06B21]">{date.getDate()}</p>
                    <p className="text-[10px] uppercase text-[#6B6B6B]">
                      {date.toLocaleDateString('fr-FR', { month: 'short' })}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-[#1E1E1E]">{chantier.nom}</p>
                    <p className="truncate text-[11px] text-[#6B6B6B]">{fmtEuro(chantier.budgetPrevisionnel)}</p>
                  </div>
                </button>
              )
            })}
          </div>
          <button
            onClick={() => navigate('/planning')}
            className="mt-3 flex shrink-0 items-center gap-1.5 text-[12px] font-medium text-[#F06B21] transition-colors hover:text-[#D95B17]"
          >
            Voir le planning <ArrowRight size={12} />
          </button>
        </div>

        <div className="flex h-[276px] min-h-0 flex-col rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[13px] font-semibold text-[#1E1E1E]">Couverture import</h2>
            <Database size={16} className="text-[#F06B21]" />
          </div>
          <div className="grid gap-3">
            <div className="rounded-[14px] bg-[#FAF6F2] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">Exercices</p>
              <p className="mt-1 text-[24px] font-bold leading-none text-[#1E1E1E]">{coverage.exercises}</p>
            </div>
            <div className="rounded-[14px] bg-[#FAF6F2] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">Clients</p>
              <p className="mt-1 text-[24px] font-bold leading-none text-[#1E1E1E]">{coverage.clients}</p>
            </div>
            <div className="rounded-[14px] bg-[#FAF6F2] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">Lignes exclues</p>
              <p className="mt-1 text-[24px] font-bold leading-none text-[#1E1E1E]">
                {coverage.syntheticOrNonOperationalLines}
              </p>
            </div>
          </div>
        </div>
      </div>

      {facturesEnAttente.length > 0 && (
        <div className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[13px] font-semibold text-[#1E1E1E]">Factures fournisseurs a qualifier</p>
              <p className="mt-1 text-[12px] text-[#6B6B6B]">
                {facturesEnAttente.length} facture{facturesEnAttente.length > 1 ? 's' : ''} issue
                {facturesEnAttente.length > 1 ? 's' : ''} de SQL Connect, pour {fmtEuro(totalFacturesEnAttente)}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/factures?status=en_attente')}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] bg-[#F06B21] px-4 text-sm font-semibold text-white transition hover:bg-[#D95B17]"
            >
              <FileText className="h-4 w-4" strokeWidth={1.75} />
              Traiter
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
