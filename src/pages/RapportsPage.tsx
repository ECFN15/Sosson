import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, FileText, Plus, RefreshCcw, ShieldCheck, TrendingUp } from 'lucide-react'
import { useApp } from '@/lib/store'
import { isDataConnectEnabled } from '@/lib/dataconnect'
import { createRapportInSql, loadRapportsFromSql } from '@/features/reports/reportSql'
import { loadAnalyticsSnapshotsFromSql } from '@/features/analytics/analyticsSql'
import { ENV } from '@/lib/firebase'

type ReportSource = 'loading' | 'sql' | 'sql-empty' | 'local-fallback'
type ReportStatus = 'preparing' | 'generated' | 'draft' | 'failed'
type ReportFormat = 'pdf' | 'excel' | 'dashboard'

type ReportRow = {
  id: string
  title: string
  type: string
  status: ReportStatus
  periodStart?: string | null
  periodEnd?: string | null
  format?: string | null
  summary?: string | null
  exportPath?: string | null
  payloadHash?: string | null
  author?: string
  scope?: string
  source: 'sql' | 'local'
}

type ReportDraft = {
  title: string
  type: string
  format: ReportFormat
  periodStart: string
  periodEnd: string
  summary: string
}

type SqlReport = Awaited<ReturnType<typeof loadRapportsFromSql>>[number]
type SqlSnapshot = Awaited<ReturnType<typeof loadAnalyticsSnapshotsFromSql>>[number]

const sourceLabels: Record<ReportSource, string> = {
  loading: 'SQL en lecture...',
  sql: 'Rapports SQL',
  'sql-empty': 'Rapports SQL vides',
  'local-fallback': 'Fallback local',
}

const statusLabels: Record<ReportStatus, string> = {
  preparing: 'Preparation',
  generated: 'Genere',
  draft: 'Brouillon',
  failed: 'Erreur',
}

const statusStyles: Record<ReportStatus, string> = {
  preparing: 'bg-[#FDEBDD] text-[#D95B17]',
  generated: 'bg-[#E6F4EA] text-[#1E8E3E]',
  draft: 'bg-[#FAF6F2] text-[#6B6B6B]',
  failed: 'bg-[#FEE2E2] text-[#DC2626]',
}

const localReports: ReportRow[] = [
  {
    id: 'local-report-weekly',
    title: 'Rapport hebdo direction',
    type: 'direction',
    status: 'draft',
    format: 'dashboard',
    summary: 'Fallback local: budget, marge, planning.',
    author: 'Local',
    scope: 'Tous chantiers',
    source: 'local',
  },
  {
    id: 'local-report-suppliers',
    title: 'Analyse fournisseurs',
    type: 'fournisseurs',
    status: 'draft',
    format: 'excel',
    summary: 'Fallback local: depenses par categorie.',
    author: 'Local',
    scope: 'Factures',
    source: 'local',
  },
]

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function monthStartKey() {
  const date = new Date()
  date.setDate(1)
  return date.toISOString().slice(0, 10)
}

function normalizeStatus(value: string): ReportStatus {
  if (value === 'generated' || value === 'draft' || value === 'failed') return value
  return 'preparing'
}

function formatDate(value?: string | null) {
  if (!value) return 'Periode libre'
  return new Date(value).toLocaleDateString('fr-FR')
}

function mapSqlReport(report: SqlReport): ReportRow {
  return {
    id: report.id,
    title: report.titre,
    type: report.rapportType,
    status: normalizeStatus(report.statut),
    periodStart: report.periodeDebut,
    periodEnd: report.periodeFin,
    format: report.format,
    exportPath: report.storagePath,
    payloadHash: report.sha256 ?? report.snapshot?.payloadHash ?? null,
    author: report.author ? `${report.author.prenom} ${report.author.nom}` : undefined,
    scope: report.chantier?.nom ?? report.client?.nom ?? report.snapshot?.snapshotType,
    source: 'sql',
  }
}

function snapshotLabel(snapshot?: SqlSnapshot | null) {
  if (!snapshot) return 'Aucun snapshot analytics'
  return `${snapshot.snapshotType} - ${snapshot.status}`
}

export function RapportsPage() {
  const { user } = useApp()
  const [reports, setReports] = useState<ReportRow[]>(localReports)
  const [source, setSource] = useState<ReportSource>('local-fallback')
  const [snapshots, setSnapshots] = useState<SqlSnapshot[]>([])
  const [feedback, setFeedback] = useState('')
  const [selectedId, setSelectedId] = useState(localReports[0]?.id ?? '')
  const [draft, setDraft] = useState<ReportDraft>({
    title: 'Rapport mensuel Sosson',
    type: 'direction',
    format: 'dashboard',
    periodStart: monthStartKey(),
    periodEnd: todayKey(),
    summary: 'Brouillon de rapport indexe en SQL. Export fichier a generer plus tard.',
  })
  const canUseReportSql = isDataConnectEnabled && Boolean(user)
  const effectiveSource: ReportSource = canUseReportSql ? source : 'local-fallback'
  const selectedReport = reports.find(report => report.id === selectedId) ?? reports[0]
  const latestSnapshot = snapshots[0] ?? null

  useEffect(() => {
    if (!canUseReportSql) return

    let mounted = true

    async function loadSqlReports() {
      setSource('loading')
      try {
        const [loadedReports, loadedSnapshots] = await Promise.all([
          loadRapportsFromSql(),
          loadAnalyticsSnapshotsFromSql({ environment: ENV }),
        ])
        if (!mounted) return
        const rows = loadedReports.map(mapSqlReport)
        setReports(rows)
        setSnapshots(loadedSnapshots)
        setSelectedId(rows[0]?.id ?? '')
        setSource(rows.length ? 'sql' : 'sql-empty')
      } catch (error) {
        console.info('Rapports SQL Connect indisponibles, fallback local visible.', error)
        if (!mounted) return
        setReports(localReports)
        setSelectedId(localReports[0]?.id ?? '')
        setSource('local-fallback')
        setFeedback('Rapports SQL indisponibles: affichage du fallback local.')
      }
    }

    void loadSqlReports()

    return () => {
      mounted = false
    }
  }, [canUseReportSql])

  const stats = useMemo(() => {
    const generated = reports.filter(report => report.status === 'generated').length
    const preparing = reports.filter(report => report.status === 'preparing').length
    return [
      { label: 'Rapports SQL', value: effectiveSource === 'sql' ? String(reports.length) : '0' },
      { label: 'En preparation', value: String(preparing) },
      { label: 'Exports generes', value: String(generated) },
    ]
  }, [effectiveSource, reports])

  async function createReport() {
    const title = draft.title.trim()
    if (!title) {
      setFeedback('Titre obligatoire.')
      return
    }

    if (!canUseReportSql) {
      const localReport: ReportRow = {
        id: `local-report-${Date.now()}`,
        title,
        type: draft.type,
        status: 'draft',
        periodStart: draft.periodStart || null,
        periodEnd: draft.periodEnd || null,
        format: draft.format,
        summary: draft.summary,
        author: 'Local',
        scope: 'Fallback navigateur',
        source: 'local',
      }
      setReports(current => [localReport, ...current])
      setSelectedId(localReport.id)
      setFeedback('Brouillon cree localement: ce n est pas une preuve SQL.')
      return
    }

    try {
      const reportId = await createRapportInSql({
        snapshotId: latestSnapshot?.id ?? null,
        authorId: null,
        clientId: null,
        chantierId: null,
        titre: title,
        rapportType: draft.type,
        statut: 'preparing',
        periodeDebut: draft.periodStart || null,
        periodeFin: draft.periodEnd || null,
        format: draft.format,
        sha256: null,
        summary: draft.summary,
        generatedAt: null,
      })

      const report: ReportRow = {
        id: reportId,
        title,
        type: draft.type,
        status: 'preparing',
        periodStart: draft.periodStart || null,
        periodEnd: draft.periodEnd || null,
        format: draft.format,
        summary: draft.summary,
        author: user?.prenom ? `${user.prenom} ${user.nom}` : undefined,
        scope: latestSnapshot ? snapshotLabel(latestSnapshot) : 'Sans snapshot',
        payloadHash: latestSnapshot?.payloadHash ?? null,
        source: 'sql',
      }
      setReports(current => [report, ...current])
      setSelectedId(report.id)
      setSource('sql')
      setFeedback(latestSnapshot
        ? 'Brouillon de rapport cree en SQL avec snapshot analytics.'
        : 'Brouillon de rapport cree en SQL sans snapshot analytics.')
    } catch (error) {
      console.info('Creation rapport SQL impossible.', error)
      setFeedback('Rapport non cree: SQL Connect est indisponible ou le role SQL est insuffisant.')
    }
  }

  return (
    <div className="min-h-full bg-[#FAF6F2] px-6 py-6">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-[26px] font-semibold leading-tight text-[#1E1E1E]">Rapports</h1>
          <p className="mt-1 max-w-2xl text-sm text-[#3C3C3C]">
            Index des rapports, snapshots analytics et exports a produire.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-[10px] border border-[#F2E8DC] bg-white px-3 py-1.5 font-semibold text-[#3C3C3C]">
              Source: {sourceLabels[effectiveSource]}
            </span>
            <span className="rounded-[10px] border border-[#F2E8DC] bg-white px-3 py-1.5 font-semibold text-[#3C3C3C]">
              Snapshot: {snapshotLabel(latestSnapshot)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void createReport()}
          className="inline-flex h-10 w-fit items-center gap-2 rounded-[14px] bg-[#F06B21] px-4 text-sm font-semibold text-white transition hover:bg-[#D95B17]"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Creer le brouillon
        </button>
      </div>

      {feedback ? (
        <button
          type="button"
          onClick={() => setFeedback('')}
          className="mb-5 w-full rounded-[14px] border border-[#F2E8DC] bg-white px-4 py-3 text-left text-sm font-medium text-[#D95B17]"
        >
          {feedback}
        </button>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="min-w-0 space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            {stats.map(stat => (
              <section key={stat.label} className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
                <span className="inline-flex rounded-[8px] bg-[#FDEBDD] px-2.5 py-1 text-[11px] font-semibold text-[#F06B21]">
                  {stat.label}
                </span>
                <p className="mt-4 text-[28px] font-semibold leading-none text-[#1E1E1E]">{stat.value}</p>
              </section>
            ))}
          </div>

          <section className="overflow-hidden rounded-[20px] border border-[#F2E8DC] bg-white">
            <div className="flex items-center justify-between border-b border-[#F2E8DC] px-5 py-4">
              <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Rapports indexes</h2>
              <RefreshCcw className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
            </div>

            {reports.length ? (
              <div className="divide-y divide-[#F2E8DC]">
                {reports.map(report => (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => setSelectedId(report.id)}
                    className={`flex w-full items-center gap-4 px-5 py-4 text-left transition ${selectedReport?.id === report.id ? 'bg-[#F06B21]/[0.06]' : 'hover:bg-[#F9F7F3]'}`}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#FAF6F2] text-[#F06B21]">
                      <FileText className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-[#1E1E1E]">{report.title}</span>
                      <span className="block truncate text-[12px] text-[#6B6B6B]">
                        {report.type} - {formatDate(report.periodStart)} au {formatDate(report.periodEnd)}
                      </span>
                    </span>
                    <span className={`rounded-[6px] px-2.5 py-1 text-[11px] font-semibold ${statusStyles[report.status]}`}>
                      {statusLabels[report.status]}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-sm text-[#6B6B6B]">
                Aucun rapport SQL indexe pour l instant.
              </div>
            )}
          </section>
        </main>

        <aside className="space-y-5">
          <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#FDEBDD] text-[#F06B21]">
                <TrendingUp className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Nouveau rapport</h2>
                <p className="text-[12px] text-[#6B6B6B]">Metadata SQL seulement.</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-[12px] font-medium text-[#3C3C3C]">Titre</span>
                <input
                  value={draft.title}
                  onChange={event => setDraft({ ...draft, title: event.target.value })}
                  className="mt-1 h-10 w-full rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-sm text-[#1E1E1E] outline-none focus:border-[#F06B21]"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[12px] font-medium text-[#3C3C3C]">Type</span>
                  <select
                    value={draft.type}
                    onChange={event => setDraft({ ...draft, type: event.target.value })}
                    className="mt-1 h-10 w-full rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-sm text-[#1E1E1E] outline-none focus:border-[#F06B21]"
                  >
                    <option value="direction">Direction</option>
                    <option value="previsionnel">Previsionnel</option>
                    <option value="factures">Factures</option>
                    <option value="planning">Planning</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-[12px] font-medium text-[#3C3C3C]">Format</span>
                  <select
                    value={draft.format}
                    onChange={event => setDraft({ ...draft, format: event.target.value as ReportFormat })}
                    className="mt-1 h-10 w-full rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-sm text-[#1E1E1E] outline-none focus:border-[#F06B21]"
                  >
                    <option value="dashboard">Dashboard</option>
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[12px] font-medium text-[#3C3C3C]">Debut</span>
                  <input
                    type="date"
                    value={draft.periodStart}
                    onChange={event => setDraft({ ...draft, periodStart: event.target.value })}
                    className="mt-1 h-10 w-full rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-sm text-[#1E1E1E] outline-none focus:border-[#F06B21]"
                  />
                </label>
                <label className="block">
                  <span className="text-[12px] font-medium text-[#3C3C3C]">Fin</span>
                  <input
                    type="date"
                    value={draft.periodEnd}
                    onChange={event => setDraft({ ...draft, periodEnd: event.target.value })}
                    className="mt-1 h-10 w-full rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-sm text-[#1E1E1E] outline-none focus:border-[#F06B21]"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[12px] font-medium text-[#3C3C3C]">Resume</span>
                <textarea
                  value={draft.summary}
                  onChange={event => setDraft({ ...draft, summary: event.target.value })}
                  className="mt-1 min-h-[96px] w-full resize-none rounded-[10px] border border-[#F2E8DC] bg-white px-3 py-2 text-sm text-[#1E1E1E] outline-none focus:border-[#F06B21]"
                />
              </label>
            </div>
          </section>

          <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#FAF6F2] text-[#F06B21]">
                <CalendarDays className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Selection</h2>
                <p className="mt-2 text-sm font-semibold text-[#1E1E1E]">{selectedReport?.title ?? 'Aucun rapport'}</p>
                <p className="mt-1 text-[12px] text-[#6B6B6B]">{selectedReport?.summary ?? 'Pas de resume.'}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-[12px] text-[#6B6B6B]">
              <p>Source: {selectedReport?.source === 'sql' ? 'SQL' : 'fallback local'}</p>
              <p>Export: {selectedReport?.exportPath ?? 'Aucun fichier Storage'}</p>
              <p>Hash: {selectedReport?.payloadHash ?? 'Non renseigne'}</p>
            </div>
          </section>

          <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <div className="flex items-center gap-3 text-sm text-[#3C3C3C]">
              <ShieldCheck className="h-5 w-5 text-[#F06B21]" strokeWidth={1.75} />
              SQL garde le statut, le perimetre, le chemin Storage et les hashes. Les fichiers lourds restent hors base.
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
