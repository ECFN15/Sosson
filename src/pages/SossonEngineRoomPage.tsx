import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent, ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  ArrowLeft,
  Database,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { loadDocumentsSqlData } from '@/features/documents/documentSql'
import { loadLatestPrevisionnelFromSql } from '@/features/previsionnel/previsionnelSql'
import { dataSourceLabels } from '@/features/dataState'
import { isDataConnectEnabled } from '@/lib/dataconnect'
import { useApp } from '@/lib/store'
import type { Client } from '@/data/clients'
import type { Chantier } from '@/data/chantiers'
import type { Devis } from '@/data/devis'
import type { Facture } from '@/data/factures'

type StatusRole = 'success' | 'info' | 'warning' | 'danger' | 'neutral'
type SqlProbeStatus = 'idle' | 'loading' | 'ready' | 'error' | 'skipped'
type WorkbenchMode = 'global' | 'client'
type CatalogDomain =
  | 'core'
  | 'documents'
  | 'previsionnel'
  | 'email'
  | 'planning'
  | 'analytics'
  | 'audit'

type DataPreviewRow = Record<string, string | number | boolean | null>

type ProbeState = {
  status: SqlProbeStatus
  error: string | null
  durationMs: number | null
  documents: {
    folders: number
    attaches: number
    sample: DataPreviewRow[]
  } | null
  previsionnel: {
    exercises: number
    latestExercise: string | null
    latestLinesLoaded: number
    expectedLines: number
    expectedChantiers: number
    exerciseSample: DataPreviewRow[]
    lineSample: DataPreviewRow[]
  } | null
}

type DataTableCatalog = {
  key: string
  name: string
  domain: CatalogDomain
  storage: string
  truth: string
  countLabel: string
  countRole: StatusRole
  columns: string[]
  relations: string[]
  operations: string[]
  security: string
  sampleRows: DataPreviewRow[]
  sqlShape: string
}

type MetricCardProps = {
  label: string
  value: string
  detail: string
  role?: StatusRole
  Icon?: LucideIcon
}

type DiagramNode = {
  key: string
  x: number
  y: number
}

type DiagramLink = {
  from: string
  to: string
  label: string
}

const initialProbe: ProbeState = {
  status: 'idle',
  error: null,
  durationMs: null,
  documents: null,
  previsionnel: null,
}

const diagramStageWidth = 1500
const diagramStageHeight = 760
const diagramNodeWidth = 154
const diagramNodeHeight = 78
const workbenchFitPadding = 32
const minWorkbenchZoom = 0.45
const maxWorkbenchZoom = 1.7

const diagramNodes: DiagramNode[] = [
  { key: 'user', x: 80, y: 110 },
  { key: 'client', x: 270, y: 110 },
  { key: 'devis', x: 440, y: 88 },
  { key: 'chantier', x: 440, y: 208 },
  { key: 'facture', x: 600, y: 208 },
  { key: 'documentFolder', x: 805, y: 100 },
  { key: 'documentAttache', x: 1030, y: 130 },
  { key: 'emailThread', x: 805, y: 245 },
  { key: 'emailMessage', x: 1030, y: 265 },
  { key: 'emailAttachment', x: 1240, y: 265 },
  { key: 'previsionnelImportBatch', x: 80, y: 420 },
  { key: 'previsionnelExercise', x: 270, y: 420 },
  { key: 'clientAlias', x: 270, y: 555 },
  { key: 'previsionnelLine', x: 440, y: 490 },
  { key: 'previsionnelMonthlyAmount', x: 600, y: 420 },
  { key: 'previsionnelLotAmount', x: 600, y: 555 },
  { key: 'previsionnelCellEdit', x: 80, y: 555 },
  { key: 'planningEvent', x: 805, y: 420 },
  { key: 'planningAssignment', x: 985, y: 420 },
  { key: 'analyticsSnapshot', x: 805, y: 555 },
  { key: 'rapport', x: 985, y: 555 },
  { key: 'auditEvent', x: 1165, y: 420 },
  { key: 'entityChangeLog', x: 1330, y: 420 },
  { key: 'checkpointRun', x: 1165, y: 555 },
  { key: 'checkpointStep', x: 1330, y: 555 },
  { key: 'checkpointArtifact', x: 1165, y: 650 },
  { key: 'checkpointDecision', x: 1330, y: 650 },
  { key: 'dataImportRun', x: 805, y: 650 },
  { key: 'dataImportIssue', x: 985, y: 650 },
]

const diagramLinks: DiagramLink[] = [
  { from: 'user', to: 'chantier', label: 'chef' },
  { from: 'client', to: 'chantier', label: '1:N' },
  { from: 'client', to: 'devis', label: '1:N' },
  { from: 'devis', to: 'chantier', label: '0:1' },
  { from: 'chantier', to: 'facture', label: '1:N' },
  { from: 'documentFolder', to: 'documentAttache', label: 'range' },
  { from: 'client', to: 'documentAttache', label: 'link' },
  { from: 'chantier', to: 'documentAttache', label: 'link' },
  { from: 'facture', to: 'documentAttache', label: 'piece' },
  { from: 'client', to: 'emailThread', label: 'link' },
  { from: 'chantier', to: 'emailThread', label: 'link' },
  { from: 'emailThread', to: 'emailMessage', label: '1:N' },
  { from: 'emailMessage', to: 'emailAttachment', label: '1:N' },
  { from: 'emailAttachment', to: 'documentAttache', label: 'classe' },
  { from: 'previsionnelImportBatch', to: 'previsionnelExercise', label: '1:N' },
  { from: 'previsionnelExercise', to: 'previsionnelLine', label: '1:N' },
  { from: 'client', to: 'clientAlias', label: 'aliases' },
  { from: 'client', to: 'previsionnelLine', label: 'N:1' },
  { from: 'chantier', to: 'previsionnelLine', label: '0:1' },
  { from: 'previsionnelLine', to: 'previsionnelMonthlyAmount', label: 'mois' },
  { from: 'previsionnelLine', to: 'previsionnelLotAmount', label: 'lots' },
  { from: 'chantier', to: 'planningEvent', label: 'agenda' },
  { from: 'planningEvent', to: 'planningAssignment', label: 'assign' },
  { from: 'user', to: 'planningAssignment', label: 'user' },
  { from: 'analyticsSnapshot', to: 'rapport', label: 'source' },
  { from: 'client', to: 'rapport', label: 'scope' },
  { from: 'chantier', to: 'rapport', label: 'scope' },
  { from: 'auditEvent', to: 'entityChangeLog', label: 'trace' },
  { from: 'checkpointRun', to: 'checkpointStep', label: 'steps' },
  { from: 'checkpointRun', to: 'checkpointArtifact', label: 'preuves' },
  { from: 'checkpointRun', to: 'checkpointDecision', label: 'go/no-go' },
  { from: 'dataImportRun', to: 'dataImportIssue', label: 'issues' },
  { from: 'dataImportRun', to: 'previsionnelImportBatch', label: 'batch' },
  { from: 'dataImportRun', to: 'entityChangeLog', label: 'change' },
]

const diagramZones = [
  { label: 'Operationnel', tone: 'operationnel', x: 40, y: 58, w: 740, h: 280 },
  { label: 'Documents + emails', tone: 'documents', x: 790, y: 58, w: 700, h: 320 },
  { label: 'Previsionnel Excel', tone: 'previsionnel', x: 40, y: 390, w: 740, h: 330 },
  { label: 'Planning + analytics + audit', tone: 'audit', x: 790, y: 390, w: 700, h: 350 },
]

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function StatusPill({ role, children }: { role: StatusRole; children: ReactNode }) {
  return (
    <span className="engine-pill" data-role={role}>
      {children}
    </span>
  )
}

function MetricCard({ label, value, detail, role = 'neutral', Icon }: MetricCardProps) {
  return (
    <article className="engine-metric" data-role={role}>
      <div>
        <p>{label}</p>
        {Icon ? <Icon size={18} strokeWidth={1.8} /> : null}
      </div>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  )
}

function probeStatusLabel(status: SqlProbeStatus) {
  if (status === 'loading') return 'Lecture SQL en cours'
  if (status === 'ready') return 'Lecture SQL reussie'
  if (status === 'error') return 'Lecture SQL indisponible'
  if (status === 'skipped') return 'SQL Connect desactive'
  return 'Pret a lire'
}

function probeStatusRole(status: SqlProbeStatus): StatusRole {
  if (status === 'ready') return 'success'
  if (status === 'loading') return 'info'
  if (status === 'error') return 'warning'
  if (status === 'skipped') return 'neutral'
  return 'neutral'
}

function formatError(error: unknown) {
  if (!error) return null
  if (error instanceof Error) return error.message
  return String(error)
}

function formatEuros(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

function sourceBadgeForId(id: string, isSqlSource: boolean) {
  if (id.startsWith('prev-')) return { label: 'Previsionnel Excel', role: 'info' as StatusRole }
  return isSqlSource
    ? { label: 'Operationnel SQL', role: 'success' as StatusRole }
    : { label: 'Fallback visible', role: 'warning' as StatusRole }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getWorkbenchFitScale(viewportSize: { width: number; height: number }) {
  if (!viewportSize.width || !viewportSize.height) return 1

  const usableWidth = Math.max(1, viewportSize.width - workbenchFitPadding * 2)
  const usableHeight = Math.max(1, viewportSize.height - workbenchFitPadding * 2)
  return Math.min(1, usableWidth / diagramStageWidth, usableHeight / diagramStageHeight)
}

function getCenteredWorkbenchPan(
  viewportSize: { width: number; height: number },
  scale = getWorkbenchFitScale(viewportSize)
) {
  if (!viewportSize.width || !viewportSize.height) return { x: 28, y: 70 }

  return {
    x: Math.round((viewportSize.width - diagramStageWidth * scale) / 2),
    y: Math.round((viewportSize.height - diagramStageHeight * scale) / 2),
  }
}

function centerFor(node: DiagramNode) {
  return {
    x: node.x + diagramNodeWidth / 2,
    y: node.y + diagramNodeHeight / 2,
  }
}

function diagramPortFor(node: DiagramNode, side: 'left' | 'right' | 'top' | 'bottom') {
  if (side === 'left') return { x: node.x, y: node.y + diagramNodeHeight / 2 }
  if (side === 'right') return { x: node.x + diagramNodeWidth, y: node.y + diagramNodeHeight / 2 }
  if (side === 'top') return { x: node.x + diagramNodeWidth / 2, y: node.y }
  return { x: node.x + diagramNodeWidth / 2, y: node.y + diagramNodeHeight }
}

function diagramPathFor(from: DiagramNode, to: DiagramNode) {
  const fromCenter = centerFor(from)
  const toCenter = centerFor(to)
  const horizontal = Math.abs(toCenter.x - fromCenter.x) >= Math.abs(toCenter.y - fromCenter.y)

  if (horizontal) {
    const fromSide = fromCenter.x <= toCenter.x ? 'right' : 'left'
    const toSide = fromCenter.x <= toCenter.x ? 'left' : 'right'
    const start = diagramPortFor(from, fromSide)
    const end = diagramPortFor(to, toSide)
    const midX = Math.round((start.x + end.x) / 2)

    return {
      d: `M ${start.x} ${start.y} H ${midX} V ${end.y} H ${end.x}`,
      labelX: midX,
      labelY: Math.round((start.y + end.y) / 2),
    }
  }

  const fromSide = fromCenter.y <= toCenter.y ? 'bottom' : 'top'
  const toSide = fromCenter.y <= toCenter.y ? 'top' : 'bottom'
  const start = diagramPortFor(from, fromSide)
  const end = diagramPortFor(to, toSide)
  const midY = Math.round((start.y + end.y) / 2)

  return {
    d: `M ${start.x} ${start.y} V ${midY} H ${end.x} V ${end.y}`,
    labelX: Math.round((start.x + end.x) / 2),
    labelY: midY,
  }
}

function domainLabel(domain: CatalogDomain) {
  const labels: Record<CatalogDomain, string> = {
    core: 'Core',
    documents: 'Documents',
    previsionnel: 'Previsionnel',
    email: 'Emails',
    planning: 'Planning',
    analytics: 'Analytics',
    audit: 'Audit',
  }
  return labels[domain]
}

function ClientDetailModal({
  client,
  chantiers,
  devis,
  factures,
  sourceIsSql,
  onClose,
}: {
  client: Client
  chantiers: Chantier[]
  devis: Devis[]
  factures: Facture[]
  sourceIsSql: boolean
  onClose: () => void
}) {
  const budget = chantiers.reduce((sum, chantier) => sum + chantier.budgetPrevisionnel, 0)
  const depenses = factures.reduce((sum, facture) => sum + facture.montantTTC, 0)
  const badge = sourceBadgeForId(client.id, sourceIsSql)

  return (
    <div className="engine-modal-backdrop" role="dialog" aria-modal="true" aria-label={`Detail client ${client.nom}`}>
      <section className="engine-client-modal">
        <button className="engine-icon-button engine-modal-close" type="button" onClick={onClose} aria-label="Fermer">
          <X size={18} strokeWidth={1.9} />
        </button>

        <header className="engine-client-modal-head">
          <span>Explorateur client</span>
          <h2>{client.nom}</h2>
          <StatusPill role={badge.role}>{badge.label}</StatusPill>
        </header>

        <div className="engine-client-modal-metrics">
          <MetricCard label="Chantiers" value={String(chantiers.length)} detail="rattaches au client" role={badge.role} />
          <MetricCard label="Devis" value={String(devis.length)} detail="demandes/envoyes/signes" role={badge.role} />
          <MetricCard label="Factures" value={String(factures.length)} detail="via ses chantiers" role="warning" />
          <MetricCard label="Budget" value={formatEuros(budget)} detail="somme visible" />
          <MetricCard label="Depenses" value={formatEuros(depenses)} detail="factures visibles" role="warning" />
        </div>

        <div className="engine-client-modal-grid">
          <div>
            <h3>Chantiers lies</h3>
            <div className="engine-soft-list">
              {chantiers.map(chantier => (
                <div key={chantier.id} className="engine-soft-row">
                  <span>
                    <strong>{chantier.nom}</strong>
                    <small>{chantier.statut} - {formatEuros(chantier.budgetPrevisionnel)}</small>
                  </span>
                  <Link to={`/chantiers/${chantier.id}`}>Ouvrir</Link>
                </div>
              ))}
              {!chantiers.length ? <div className="engine-empty-state">Aucun chantier charge.</div> : null}
            </div>
          </div>

          <div>
            <h3>Devis et factures</h3>
            <div className="engine-soft-list">
              {devis.slice(0, 4).map(item => (
                <div key={item.id} className="engine-soft-row">
                  <span>
                    <strong>{item.numeroDevis}</strong>
                    <small>{item.statut}</small>
                  </span>
                  <strong>{item.montantTTC ? formatEuros(item.montantTTC) : 'A chiffrer'}</strong>
                </div>
              ))}
              {factures.slice(0, 4).map(facture => (
                <div key={facture.id} className="engine-soft-row">
                  <span>
                    <strong>{facture.numeroFacture}</strong>
                    <small>{facture.fournisseur}</small>
                  </span>
                  <strong>{formatEuros(facture.montantTTC)}</strong>
                </div>
              ))}
              {!devis.length && !factures.length ? <div className="engine-empty-state">Aucun devis ni facture charge.</div> : null}
            </div>
          </div>
        </div>

        <footer className="engine-client-modal-actions">
          <Link to={`/clients/${client.id}`}>Ouvrir fiche client</Link>
          <StatusPill role="warning">Sandbox distante non prouvee ici</StatusPill>
        </footer>
      </section>
    </div>
  )
}

export function SossonEngineRoomPage() {
  const { operationalDataState, user } = useApp()
  const workbenchViewportRef = useRef<HTMLDivElement | null>(null)
  const [probe, setProbe] = useState<ProbeState>(initialProbe)
  const [selectedTableKey, setSelectedTableKey] = useState('client')
  const [tableFilter, setTableFilter] = useState('')
  const [detailClientId, setDetailClientId] = useState<string | null>(null)
  const [workbenchMode, setWorkbenchMode] = useState<WorkbenchMode>('global')
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [workbenchZoom, setWorkbenchZoom] = useState(1)
  const [workbenchViewportSize, setWorkbenchViewportSize] = useState({ width: 0, height: 0 })
  const [workbenchPan, setWorkbenchPan] = useState({ x: 28, y: 70 })
  const [dragOrigin, setDragOrigin] = useState<{ pointerId: number; x: number; y: number; panX: number; panY: number } | null>(null)
  const workbenchFitScale = useMemo(() => getWorkbenchFitScale(workbenchViewportSize), [workbenchViewportSize])
  const workbenchRenderScale = workbenchFitScale * workbenchZoom

  const refreshSqlProbe = useCallback(async () => {
    if (!isDataConnectEnabled) {
      setProbe({ ...initialProbe, status: 'skipped' })
      return
    }

    const startedAt = performance.now()
    setProbe(prev => ({ ...prev, status: 'loading', error: null }))
    try {
      const [documents, previsionnel] = await Promise.all([
        loadDocumentsSqlData(),
        loadLatestPrevisionnelFromSql(),
      ])

      setProbe({
        status: 'ready',
        error: null,
        durationMs: Math.round(performance.now() - startedAt),
        documents: {
          folders: documents.folders.length,
          attaches: documents.documents.length,
          sample: documents.documents.slice(0, 5).map(document => ({
            id: document.id,
            title: document.title,
            kind: document.kind,
            status: document.status,
            source: document.source,
            folder: document.folderName ?? null,
          })),
        },
        previsionnel: {
          exercises: previsionnel.exercises.length,
          latestExercise: previsionnel.latest?.exercise ?? null,
          latestLinesLoaded: previsionnel.lines.length,
          expectedLines: previsionnel.exercises.reduce((sum, exercise) => sum + exercise.lineCount, 0),
          expectedChantiers: previsionnel.exercises.reduce((sum, exercise) => sum + exercise.chantierCount, 0),
          exerciseSample: previsionnel.exercises.slice(0, 5).map(exercise => ({
            exercise: exercise.exercise,
            sheet: exercise.sheet,
            lineCount: exercise.lineCount,
            chantierCount: exercise.chantierCount,
            caPrevision: exercise.caPrevision,
          })),
          lineSample: previsionnel.lines.slice(0, 5).map(line => ({
            row: line.sourceRow,
            client: line.clientName,
            rawName: line.rawName,
            monthly: line.monthly.length,
            lots: line.lots.length,
            plannedTotal: line.plannedTotal,
          })),
        },
      })
    } catch (error) {
      setProbe({
        ...initialProbe,
        status: 'error',
        error: formatError(error),
        durationMs: Math.round(performance.now() - startedAt),
      })
    }
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refreshSqlProbe()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [refreshSqlProbe])

  useEffect(() => {
    const viewport = workbenchViewportRef.current
    if (!viewport) return undefined

    const updateSize = () => {
      setWorkbenchViewportSize(current => {
        const next = {
          width: viewport.clientWidth,
          height: viewport.clientHeight,
        }
        return current.width === next.width && current.height === next.height ? current : next
      })
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!workbenchViewportSize.width || !workbenchViewportSize.height) return
    setWorkbenchPan(getCenteredWorkbenchPan(workbenchViewportSize, workbenchFitScale))
  }, [workbenchFitScale, workbenchViewportSize])

  const resetWorkbenchView = useCallback(() => {
    setWorkbenchZoom(1)
    setWorkbenchPan(getCenteredWorkbenchPan(workbenchViewportSize, workbenchFitScale))
  }, [workbenchFitScale, workbenchViewportSize])

  const handleWorkbenchWheel = useCallback((event: WheelEvent) => {
    const viewport = workbenchViewportRef.current
    if (!viewport) return

    event.preventDefault()
    event.stopPropagation()
    const bounds = viewport.getBoundingClientRect()
    const cursorX = event.clientX - bounds.left
    const cursorY = event.clientY - bounds.top
    const delta = event.deltaY || event.deltaX
    const nextZoom = clamp(workbenchZoom * (delta > 0 ? 0.92 : 1.08), minWorkbenchZoom, maxWorkbenchZoom)
    const ratio = nextZoom / workbenchZoom

    setWorkbenchZoom(nextZoom)
    setWorkbenchPan(current => ({
      x: cursorX - (cursorX - current.x) * ratio,
      y: cursorY - (cursorY - current.y) * ratio,
    }))
  }, [workbenchZoom])

  useEffect(() => {
    const viewport = workbenchViewportRef.current
    if (!viewport) return undefined

    viewport.addEventListener('wheel', handleWorkbenchWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', handleWorkbenchWheel)
  }, [handleWorkbenchWheel])

  const handleWorkbenchPointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button, a, input')) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragOrigin({
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      panX: workbenchPan.x,
      panY: workbenchPan.y,
    })
  }, [workbenchPan.x, workbenchPan.y])

  const handleWorkbenchPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!dragOrigin || dragOrigin.pointerId !== event.pointerId) return
    setWorkbenchPan({
      x: dragOrigin.panX + event.clientX - dragOrigin.x,
      y: dragOrigin.panY + event.clientY - dragOrigin.y,
    })
  }, [dragOrigin])

  const handleWorkbenchPointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (dragOrigin?.pointerId === event.pointerId) setDragOrigin(null)
  }, [dragOrigin])

  const openDiagramTable = useCallback((tableKey: string) => {
    setSelectedTableKey(tableKey)

    if (tableKey === 'client') {
      resetWorkbenchView()
      setWorkbenchMode('client')
      setSelectedClientId(null)
      setClientSearch('')
      return
    }

    if (workbenchMode === 'client') return

    resetWorkbenchView()
    setWorkbenchMode('global')
  }, [resetWorkbenchView, workbenchMode])

  const sourceIsSql = operationalDataState.source === 'dataconnect'

  const tableCatalog: DataTableCatalog[] = useMemo(() => {
    const { clients, chantiers, devis, factures } = operationalDataState.data
    const sourceLabel = sourceIsSql
      ? 'lignes SQL lues par le front'
      : `lignes visibles depuis ${dataSourceLabels[operationalDataState.source]}`

    return [
      {
        key: 'user',
        name: 'User',
        domain: 'core',
        storage: 'PostgreSQL via SQL Connect',
        truth: 'Profil applicatif interne. id = Firebase Auth UID. Le seed metier ne cree pas ces lignes.',
        countLabel: user ? '1 session front' : 'profil absent',
        countRole: user ? 'info' : 'warning',
        columns: ['id String', 'email varchar(254)', 'nom varchar(80)', 'prenom varchar(80)', 'role varchar(32)', 'avatar varchar(8)', 'dateCreation'],
        relations: ['User 0..N Chantier via chefChantier', 'User 0..N PlanningAssignment', 'User 0..N AnalyticsSnapshot/Rapport'],
        operations: ['GetCurrentUser', 'ListUsers', 'RBAC dans mutations sensibles'],
        security: 'Utilisateur courant lu avec auth.uid. Les mutations sensibles doivent relire User cote serveur.',
        sampleRows: user
          ? [{
              id: user.id,
              email: user.email,
              nom: user.nom,
              prenom: user.prenom,
              role: user.role,
            }]
          : [],
        sqlShape: 'query GetCurrentUser @auth(level: USER) { user(key: { id_expr: "auth.uid" }) { id email nom prenom role avatar } }',
      },
      {
        key: 'client',
        name: 'Client',
        domain: 'core',
        storage: 'PostgreSQL via SQL Connect; fallback Excel/seed dans le front',
        truth: `Donneur d'ordre ou prospect. Les listes operationnelles SQL filtrent origineImport = "operationnel"; ici ${sourceLabel}.`,
        countLabel: `${clients.length} visibles`,
        countRole: sourceIsSql ? 'success' : 'warning',
        columns: ['origineImport varchar(32)', 'type varchar(32)', 'nom varchar(200)', 'prenom', 'email', 'telephone', 'ville', 'typeChantierCible', 'dateCreation'],
        relations: ['Client 1..N Chantier', 'Client 1..N Devis', 'Client 1..N ClientAlias', 'Client 1..N PrevisionnelLine', 'Client 1..N DocumentAttache/EmailThread/Rapport'],
        operations: ['ListOperationalClients', 'GetClient', 'CreateClient', 'UpdateClient'],
        security: 'Creation/update via SQL Connect quand source active. Fallback local visible hors SQL.',
        sampleRows: clients.slice(0, 8).map(client => ({
          id: client.id,
          nom: client.nom,
          type: client.type,
          ville: client.ville,
          cible: client.typeChantierCible ?? null,
          chantiers: client.chantierIds.length,
        })),
        sqlShape: 'clients(where: { origineImport: { eq: "operationnel" } }, orderBy: { nom: ASC }, limit: 1000)',
      },
      {
        key: 'chantier',
        name: 'Chantier',
        domain: 'core',
        storage: 'PostgreSQL via SQL Connect; fallback Excel/seed dans le front',
        truth: `Dossier operationnel rattache a un client. Les depenses et tendances sont derivees des factures; ici ${sourceLabel}.`,
        countLabel: `${chantiers.length} visibles`,
        countRole: sourceIsSql ? 'success' : 'warning',
        columns: ['origineImport', 'clientId', 'chefChantierId', 'nom', 'statut', 'dateDebut', 'dateFinPrevue', 'budgetPrevisionnel', 'dateCreation'],
        relations: ['Chantier N..1 Client', 'Chantier 0..N Devis', 'Chantier 0..N Facture', 'Chantier 0..N PlanningEvent/DocumentAttache/Rapport'],
        operations: ['ListOperationalChantiers', 'GetChantier', 'CreateChantier', 'UpdateChantierStatut'],
        security: 'Statuts modifies par mutation dediee. RBAC serveur implemente localement, a verifier sandbox.',
        sampleRows: chantiers.slice(0, 8).map(chantier => ({
          id: chantier.id,
          nom: chantier.nom,
          statut: chantier.statut,
          clientId: chantier.clientId,
          budget: chantier.budgetPrevisionnel,
          depenses: chantier.depensesEngagees,
        })),
        sqlShape: 'chantiers(where: { origineImport: { eq: "operationnel" } }, orderBy: { dateDebut: DESC }, limit: 1200)',
      },
      {
        key: 'devis',
        name: 'Devis',
        domain: 'core',
        storage: 'PostgreSQL via SQL Connect',
        truth: 'Objet entre demande prospect/client et chantier confirme. Peut exister sans chantier tant que le projet n est pas signe.',
        countLabel: `${devis.length} visibles`,
        countRole: sourceIsSql ? 'success' : 'warning',
        columns: ['clientId', 'chantierId nullable', 'numeroDevis', 'titre', 'statut', 'montantHT', 'montantTTC', 'dateDemande', 'dateSignature'],
        relations: ['Devis N..1 Client', 'Devis 0..1 Chantier', 'Devis 0..N DocumentAttache'],
        operations: ['ListDevis', 'ListDevisByClient', 'ListDevisByChantier', 'CreateDevis', 'UpdateDevisStatut'],
        security: 'Mutation sensible: statut et rattachement chantier doivent rester coherents avec le role.',
        sampleRows: devis.slice(0, 8).map(item => ({
          id: item.id,
          numero: item.numeroDevis,
          statut: item.statut,
          clientId: item.clientId,
          chantierId: item.chantierId ?? null,
          montantTTC: item.montantTTC ?? null,
        })),
        sqlShape: 'deviss(orderBy: { dateCreation: DESC }, limit: 1000) { id numeroDevis statut client { id nom } chantier { id nom } }',
      },
      {
        key: 'facture',
        name: 'Facture',
        domain: 'core',
        storage: 'PostgreSQL via SQL Connect; ajout local possible si SQL indisponible',
        truth: 'Facture fournisseur definitive. Elle impacte dashboard/statistiques quel que soit son statut de classement.',
        countLabel: `${factures.length} visibles`,
        countRole: sourceIsSql ? 'success' : 'warning',
        columns: ['chantierId', 'fournisseur', 'numeroFacture', 'montantHT', 'tva', 'montantTTC', 'date', 'categorie', 'statut'],
        relations: ['Facture N..1 Chantier', 'Facture 0..N DocumentAttache', 'Facture alimente budget/depenses/marge'],
        operations: ['ListFactures', 'ListFacturesByStatut', 'CreateFacture', 'SetFactureStatut'],
        security: 'Creation/statut par SQL quand source active. Fallback annonce hors source SQL.',
        sampleRows: factures.slice(0, 8).map(facture => ({
          id: facture.id,
          fournisseur: facture.fournisseur,
          statut: facture.statut,
          montantTTC: facture.montantTTC,
          chantierId: facture.chantierId,
        })),
        sqlShape: 'factures(orderBy: { date: DESC }, limit: 1000) { chantier { id client { id nom } } }',
      },
      {
        key: 'documentFolder',
        name: 'DocumentFolder',
        domain: 'documents',
        storage: 'PostgreSQL metadata',
        truth: 'Dossier logique proche explorateur. Ne contient pas le binaire fichier.',
        countLabel: probe.documents ? `${probe.documents.folders} SQL` : 'pas interroge',
        countRole: probe.documents ? 'info' : 'warning',
        columns: ['nom', 'slug', 'parentId', 'clientId', 'chantierId', 'description', 'dateCreation'],
        relations: ['DocumentFolder parent/enfant', 'DocumentFolder 0..N DocumentAttache'],
        operations: ['ListDocumentFolders', 'CreateDocumentFolder'],
        security: 'Metadata SQL seulement; Storage reste source fichier.',
        sampleRows: [],
        sqlShape: 'documentFolders(orderBy: { nom: ASC }) { id nom slug parent { id } client { id } chantier { id } }',
      },
      {
        key: 'documentAttache',
        name: 'DocumentAttache',
        domain: 'documents',
        storage: 'PostgreSQL metadata + Firebase Storage pour le fichier',
        truth: 'Classe un fichier et le rattache a client, chantier, devis ou facture. Le binaire reste hors SQL.',
        countLabel: probe.documents ? `${probe.documents.attaches} SQL` : 'pas interroge',
        countRole: probe.documents ? 'info' : 'warning',
        columns: ['folderId', 'clientId', 'chantierId', 'devisId', 'factureId', 'nomFichier', 'storagePath', 'sha256', 'typeDocument', 'statut'],
        relations: ['DocumentAttache N..0/1 Client/Chantier/Devis/Facture', 'EmailAttachment peut produire DocumentAttache'],
        operations: ['ListDocumentsAttaches', 'ListDocumentsByChantier', 'CreateDocumentAttache', 'UpdateDocumentAttacheLinks'],
        security: 'Ne pas confondre metadata lue et presence reelle du fichier Storage.',
        sampleRows: probe.documents?.sample ?? [],
        sqlShape: 'documentAttaches(orderBy: { dateCreation: DESC }, limit: 1000) { storagePath folder client chantier facture }',
      },
      {
        key: 'previsionnelImportBatch',
        name: 'PrevisionnelImportBatch',
        domain: 'previsionnel',
        storage: 'PostgreSQL seed depuis Excel',
        truth: 'Trace le classeur source, son chemin, son hash et les notes d import.',
        countLabel: '1 batch attendu local',
        countRole: 'info',
        columns: ['workbook', 'sourcePath', 'workbookHash', 'importedAt', 'notes'],
        relations: ['PrevisionnelImportBatch 1..N PrevisionnelExercise', 'DataImportRun peut pointer vers batch'],
        operations: ['CreatePrevisionnelImportBatch', 'seed:previsionnel:dataconnect'],
        security: 'Action d import sandbox protegee par script garde.',
        sampleRows: [],
        sqlShape: 'previsionnelImportBatch_insert(...) { id workbook sourcePath workbookHash }',
      },
      {
        key: 'previsionnelExercise',
        name: 'PrevisionnelExercise',
        domain: 'previsionnel',
        storage: 'PostgreSQL via seed Excel',
        truth: 'Un exercice correspond a une periode du classeur et porte les compteurs de controle.',
        countLabel: probe.previsionnel ? `${probe.previsionnel.exercises} exercices` : 'pas interroge',
        countRole: probe.previsionnel ? 'info' : 'warning',
        columns: ['batchId', 'sheet', 'exercise', 'startYear', 'endYear', 'lineCount', 'chantierCount', 'caPrevision', 'plannedTotal'],
        relations: ['PrevisionnelExercise N..1 Batch', 'PrevisionnelExercise 1..N PrevisionnelLine'],
        operations: ['ListPrevisionnelExercises', 'verify:previsionnel:dataconnect'],
        security: 'Lecture analytique, ne doit pas polluer les listes operationnelles.',
        sampleRows: probe.previsionnel?.exerciseSample ?? [],
        sqlShape: 'previsionnelExercises(orderBy: { exercise: ASC }) { exercise sheet lineCount chantierCount caPrevision }',
      },
      {
        key: 'clientAlias',
        name: 'ClientAlias',
        domain: 'previsionnel',
        storage: 'PostgreSQL rapprochement Excel',
        truth: 'Alias historique rattache a un client canonique pour eviter les doublons au nom libre.',
        countLabel: '616 attendus seed',
        countRole: 'info',
        columns: ['clientId', 'alias', 'normalizedKey', 'source', 'dateCreation'],
        relations: ['ClientAlias N..1 Client', 'SearchClientAliases(normalizedKey)'],
        operations: ['SearchClientAliases', 'seed:previsionnel:generate'],
        security: 'Ne pas deduire une identite client depuis le nom seul.',
        sampleRows: [],
        sqlShape: 'clientAliases(where: { normalizedKey: { eq: $normalizedKey } }) { client { id nom } alias source }',
      },
      {
        key: 'previsionnelLine',
        name: 'PrevisionnelLine',
        domain: 'previsionnel',
        storage: 'PostgreSQL seed Excel; edition partielle depuis tableur web',
        truth: 'Ligne source du tableur. Conserve sourceSheet/sourceRow et rattache client + chantier optionnel.',
        countLabel: probe.previsionnel ? `${probe.previsionnel.latestLinesLoaded} latest` : 'pas interroge',
        countRole: probe.previsionnel ? 'info' : 'warning',
        columns: ['exerciseId', 'clientId', 'chantierId', 'sourceSheet', 'sourceRow', 'rawName', 'clientName', 'lineType', 'plannedTotal', 'invoicedTotal'],
        relations: ['PrevisionnelLine N..1 Exercise', 'PrevisionnelLine N..1 Client', 'PrevisionnelLine 0..1 Chantier'],
        operations: ['ListPrevisionnelLinesByExercise', 'UpdatePrevisionnelLineAmounts', 'LinkPrevisionnelLineToChantier'],
        security: 'Frontiere operationnel/previsionnel a verifier avant sandbox.',
        sampleRows: probe.previsionnel?.lineSample ?? [],
        sqlShape: 'previsionnelLines(where: { exerciseId: { eq: $exerciseId } }, orderBy: { sourceRow: ASC }, limit: 300)',
      },
      {
        key: 'previsionnelMonthlyAmount',
        name: 'PrevisionnelMonthlyAmount',
        domain: 'previsionnel',
        storage: 'PostgreSQL enfant de PrevisionnelLine',
        truth: 'Montants mensuels. invoiceSent vient du jaune Excel: facture envoyee, pas paiement encaisse.',
        countLabel: '1577 attendus seed',
        countRole: probe.previsionnel ? 'info' : 'warning',
        columns: ['lineId', 'month', 'label', 'monthOrder', 'planned', 'realized', 'invoiceSent'],
        relations: ['PrevisionnelMonthlyAmount N..1 PrevisionnelLine'],
        operations: ['UpdatePrevisionnelMonthlyAmount', 'verify:previsionnel-edits:dataconnect'],
        security: 'La sauvegarde SQL garde fallback localStorage si SQL indisponible.',
        sampleRows: [],
        sqlShape: 'monthly { id month label monthOrder planned realized invoiceSent }',
      },
      {
        key: 'previsionnelLotAmount',
        name: 'PrevisionnelLotAmount',
        domain: 'previsionnel',
        storage: 'PostgreSQL enfant de PrevisionnelLine',
        truth: 'Ventilation par lot / corps d etat issue du classeur.',
        countLabel: '887 attendus seed',
        countRole: 'info',
        columns: ['lineId', 'lotKey', 'label', 'amount'],
        relations: ['PrevisionnelLotAmount N..1 PrevisionnelLine'],
        operations: ['ListPrevisionnelLinesByExercise', 'StatistiquesPage'],
        security: 'Lecture analytique seulement pour le moment.',
        sampleRows: [],
        sqlShape: 'lots { id lotKey label amount }',
      },
      {
        key: 'previsionnelCellEdit',
        name: 'PrevisionnelCellEdit',
        domain: 'previsionnel',
        storage: 'PostgreSQL override cellule exacte',
        truth: 'Trace les modifications cellule par cellule pour conserver le rendu tableur/export.',
        countLabel: 'lu par feuille',
        countRole: 'neutral',
        columns: ['id String', 'sourceSheet', 'cellRef', 'valueText', 'numericValue', 'dateModification'],
        relations: ['Reference logique sourceSheet + cellRef, pas FK vers ligne'],
        operations: ['ListPrevisionnelCellEdits', 'UpsertPrevisionnelCellEdit'],
        security: 'Conserve la cellule exacte sans casser le modele analytique.',
        sampleRows: [],
        sqlShape: 'previsionnelCellEdits(where: { sourceSheet: { eq: $sourceSheet } }, limit: 10000)',
      },
      {
        key: 'emailThread',
        name: 'EmailThread',
        domain: 'email',
        storage: 'PostgreSQL index Outlook/Graph',
        truth: 'Indexe une conversation utile. SQL ne devient pas une boite mail.',
        countLabel: 'preuve locale',
        countRole: 'warning',
        columns: ['provider', 'externalThreadId', 'subject', 'statut', 'importance', 'clientId', 'chantierId', 'assignedToId', 'lastMessageAt', 'messageCount'],
        relations: ['EmailThread 0..1 Client/Chantier/User', 'EmailThread 1..N EmailMessage'],
        operations: ['ListEmailThreads', 'ListUnreadEmailThreads', 'GetEmailThread', 'CreateEmailThread', 'UpdateEmailThreadStatusAndLinks'],
        security: 'Graph/Outlook externe; SQL indexe seulement metadata et liens metier.',
        sampleRows: [],
        sqlShape: 'emailThreads(orderBy: { lastMessageAt: DESC }, limit: 100) { id subject statut client { id } chantier { id } }',
      },
      {
        key: 'emailMessage',
        name: 'EmailMessage',
        domain: 'email',
        storage: 'PostgreSQL metadata message',
        truth: 'Message utile sous thread. Corps lourd externe ou stocke via bodyStoragePath.',
        countLabel: 'preuve locale',
        countRole: 'warning',
        columns: ['threadId', 'externalMessageId', 'direction', 'fromEmail', 'subject', 'bodyPreview', 'bodyStoragePath', 'sentAt', 'receivedAt', 'isRead'],
        relations: ['EmailMessage N..1 EmailThread', 'EmailMessage 1..N EmailAttachment'],
        operations: ['GetEmailThread', 'CreateEmailMessage'],
        security: 'Masquer contenu sensible long; garder seulement apercu et chemin preuve.',
        sampleRows: [],
        sqlShape: 'emailThread(id) { messages { id direction fromEmail subject bodyPreview receivedAt attachments { id } } }',
      },
      {
        key: 'emailAttachment',
        name: 'EmailAttachment',
        domain: 'email',
        storage: 'PostgreSQL metadata + Storage optionnel',
        truth: 'Piece jointe email qui peut devenir DocumentAttache classe.',
        countLabel: 'preuve locale',
        countRole: 'warning',
        columns: ['messageId', 'documentId', 'externalAttachmentId', 'nomFichier', 'storagePath', 'mimeType', 'tailleBytes', 'sha256', 'statut'],
        relations: ['EmailAttachment N..1 EmailMessage', 'EmailAttachment 0..1 DocumentAttache'],
        operations: ['CreateEmailAttachment', 'GetEmailThread'],
        security: 'Ne pas exposer secret Graph ni payload binaire cote front.',
        sampleRows: [],
        sqlShape: 'emailAttachments { id nomFichier storagePath document { id storagePath } }',
      },
      {
        key: 'planningEvent',
        name: 'PlanningEvent',
        domain: 'planning',
        storage: 'PostgreSQL planning',
        truth: 'Carte planning rattachee optionnellement a un chantier. Annulation conserve la ligne avec statut cancelled.',
        countLabel: 'preuve locale',
        countRole: 'warning',
        columns: ['chantierId', 'titre', 'eventType', 'statut', 'startAt', 'endAt', 'location', 'createdById', 'updatedById'],
        relations: ['PlanningEvent 0..1 Chantier', 'PlanningEvent 1..N PlanningAssignment'],
        operations: ['ListPlanningEventsByPeriod', 'ListPlanningEventsByChantier', 'CreatePlanningEvent', 'UpdatePlanningEventDetails', 'CancelPlanningEvent'],
        security: 'Production future en lecture seule par defaut; mutations protegees par role.',
        sampleRows: [],
        sqlShape: 'planningEvents(where: { startAt: { ge: $startAt }, endAt: { le: $endAt } }) { assignments { user { id } } }',
      },
      {
        key: 'planningAssignment',
        name: 'PlanningAssignment',
        domain: 'planning',
        storage: 'PostgreSQL affectations',
        truth: 'Affecte un utilisateur ou une equipe a un evenement planning.',
        countLabel: 'preuve locale',
        countRole: 'warning',
        columns: ['eventId', 'userId', 'assignmentRole', 'statut', 'notes', 'dateCreation'],
        relations: ['PlanningAssignment N..1 PlanningEvent', 'PlanningAssignment 0..1 User'],
        operations: ['CreatePlanningAssignment', 'UpdatePlanningAssignmentStatus'],
        security: 'RH/equipes restent localStorage tant que modele SQL equipe n existe pas.',
        sampleRows: [],
        sqlShape: 'planningAssignments { id assignmentRole statut user { id nom } }',
      },
      {
        key: 'analyticsSnapshot',
        name: 'AnalyticsSnapshot',
        domain: 'analytics',
        storage: 'PostgreSQL snapshot + payload hors SQL',
        truth: 'Snapshot reproductible pour dashboard, stats et rapports. Payload lourd en fichier/Storage.',
        countLabel: 'preuve locale',
        countRole: 'warning',
        columns: ['environment', 'snapshotType', 'scopeType', 'scopeId', 'periodStart', 'status', 'totalCaPrevision', 'totalFacturesTtc', 'payloadPath', 'payloadHash'],
        relations: ['AnalyticsSnapshot 0..N Rapport', 'AnalyticsSnapshot 0..1 User createdBy'],
        operations: ['ListAnalyticsSnapshots', 'GetAnalyticsSnapshot', 'CreateAnalyticsSnapshot', 'snapshot:analytics:dataconnect'],
        security: 'Snapshot local ne prouve pas sandbox distante.',
        sampleRows: [],
        sqlShape: 'analyticsSnapshots(where: { environment: { eq: $environment } }, orderBy: { dateCreation: DESC })',
      },
      {
        key: 'rapport',
        name: 'Rapport',
        domain: 'analytics',
        storage: 'PostgreSQL metadata + artefact CSV/Storage',
        truth: 'Rapport genere ou en cours. SQL garde statut, perimetre, chemin et hash.',
        countLabel: 'preuve locale',
        countRole: 'warning',
        columns: ['snapshotId', 'authorId', 'clientId', 'chantierId', 'titre', 'rapportType', 'statut', 'format', 'storagePath', 'sha256', 'generatedAt'],
        relations: ['Rapport 0..1 AnalyticsSnapshot/User/Client/Chantier'],
        operations: ['ListRapports', 'GetRapport', 'CreateRapport', 'MarkRapportGenerated'],
        security: 'Chemin/hash prouves localement; Storage distant a valider.',
        sampleRows: [],
        sqlShape: 'rapports(orderBy: { dateCreation: DESC }) { id titre statut storagePath sha256 snapshot { id } }',
      },
      {
        key: 'auditEvent',
        name: 'AuditEvent',
        domain: 'audit',
        storage: 'PostgreSQL append-only',
        truth: 'Evenement audit metier ou technique. Base de la tracabilite durable.',
        countLabel: 'emulateur uniquement',
        countRole: 'warning',
        columns: ['environment', 'eventType', 'severity', 'entityType', 'entityId', 'action', 'status', 'actorUid', 'source', 'evidencePath', 'evidenceHash'],
        relations: ['AuditEvent 0..N EntityChangeLog'],
        operations: ['ListRecentAuditEvents', 'CreateAuditEvent', 'verify:checkpoint-audit:dataconnect'],
        security: 'Append-only: creation/lecture, pas update/delete depuis front.',
        sampleRows: [],
        sqlShape: 'auditEvents(where: { environment: { eq: $environment } }, orderBy: { dateCreation: DESC }, limit: 100)',
      },
      {
        key: 'checkpointRun',
        name: 'CheckpointRun',
        domain: 'audit',
        storage: 'PostgreSQL index checkpoint + artefacts tmp',
        truth: 'Execution d un checkpoint local, sandbox ou production. Les gros logs restent hors SQL.',
        countLabel: 'emulateur uniquement',
        countRole: 'warning',
        columns: ['environment', 'checkpointKey', 'title', 'status', 'startedAt', 'finishedAt', 'commitSha', 'sourceBranch', 'command', 'actorUid'],
        relations: ['CheckpointRun 1..N Step/Artifact/Decision', 'CheckpointRun 0..N EntityChangeLog'],
        operations: ['ListCheckpointRuns', 'GetCheckpointRun', 'CreateCheckpointRun'],
        security: 'Ne pas assimiler presence repo a existence sandbox distante.',
        sampleRows: [],
        sqlShape: 'checkpointRuns(where: { environment: { eq: $environment } }) { steps { id } artifacts { id } decisions { id } }',
      },
      {
        key: 'checkpointStep',
        name: 'CheckpointStep',
        domain: 'audit',
        storage: 'PostgreSQL index checkpoint',
        truth: 'Etape detaillee avec commande, duree, code retour et chemin log.',
        countLabel: 'emulateur uniquement',
        countRole: 'warning',
        columns: ['runId', 'stepKey', 'label', 'status', 'command', 'exitCode', 'durationMs', 'logPath', 'logHash'],
        relations: ['CheckpointStep N..1 CheckpointRun', 'CheckpointStep 0..N CheckpointArtifact'],
        operations: ['CreateCheckpointStep', 'GetCheckpointRun'],
        security: 'Les logs lourds restent en fichiers, pas dans SQL.',
        sampleRows: [],
        sqlShape: 'checkpointRun(id) { steps(orderBy: { startedAt: ASC }) { stepKey label status durationMs } }',
      },
      {
        key: 'checkpointArtifact',
        name: 'CheckpointArtifact',
        domain: 'audit',
        storage: 'PostgreSQL index + fichier hors SQL',
        truth: 'Preuve produite par checkpoint: path, hash, taille, mime.',
        countLabel: 'emulateur uniquement',
        countRole: 'warning',
        columns: ['runId', 'stepId', 'artifactType', 'path', 'storagePath', 'sha256', 'sizeBytes', 'mimeType', 'description'],
        relations: ['CheckpointArtifact N..1 CheckpointRun', 'CheckpointArtifact 0..1 CheckpointStep'],
        operations: ['CreateCheckpointArtifact', 'GetCheckpointRun'],
        security: 'SQL indexe les preuves, ne stocke pas les fichiers lourds.',
        sampleRows: [],
        sqlShape: 'checkpointRun(id) { artifacts { artifactType path sha256 sizeBytes } }',
      },
      {
        key: 'checkpointDecision',
        name: 'CheckpointDecision',
        domain: 'audit',
        storage: 'PostgreSQL decision humaine',
        truth: 'Decision rattachee a un checkpoint, dont validationPhraseHash.',
        countLabel: 'emulateur uniquement',
        countRole: 'warning',
        columns: ['runId', 'decisionType', 'status', 'decidedByUid', 'decidedByEmail', 'decisionText', 'validationPhraseHash'],
        relations: ['CheckpointDecision N..1 CheckpointRun'],
        operations: ['CreateCheckpointDecision', 'check:operational-lifecycle-decisions'],
        security: 'Gate manuel avant sandbox; ne pas automatiser sans validation humaine.',
        sampleRows: [],
        sqlShape: 'checkpointRun(id) { decisions { decisionType status decisionText validationPhraseHash } }',
      },
      {
        key: 'dataImportRun',
        name: 'DataImportRun',
        domain: 'audit',
        storage: 'PostgreSQL index import',
        truth: 'Execution d import Excel, seed local, seed sandbox ou autre source.',
        countLabel: 'emulateur uniquement',
        countRole: 'warning',
        columns: ['environment', 'importKind', 'sourceName', 'sourcePath', 'sourceHash', 'status', 'rowCount', 'insertedCount', 'updatedCount', 'artifactPath'],
        relations: ['DataImportRun 1..N DataImportIssue', 'DataImportRun 0..1 PrevisionnelImportBatch', 'DataImportRun 0..N EntityChangeLog'],
        operations: ['ListDataImportRuns', 'GetDataImportRun', 'CreateDataImportRun'],
        security: 'seed:sandbox reel exige ALLOW_SANDBOX_DATACONNECT_SEED + --sandbox + --yes-sandbox.',
        sampleRows: [],
        sqlShape: 'dataImportRuns(where: { environment: { eq: $environment } }) { issues { code severity } }',
      },
      {
        key: 'dataImportIssue',
        name: 'DataImportIssue',
        domain: 'audit',
        storage: 'PostgreSQL anomalies import',
        truth: 'Anomalie detectee pendant un import avec code, ligne source et statut de resolution.',
        countLabel: 'emulateur uniquement',
        countRole: 'warning',
        columns: ['runId', 'severity', 'code', 'entityType', 'entityKey', 'sourceSheet', 'sourceRow', 'message', 'resolutionStatus'],
        relations: ['DataImportIssue N..1 DataImportRun'],
        operations: ['CreateDataImportIssue', 'GetDataImportRun'],
        security: 'Trace d anomalie, pas correction automatique.',
        sampleRows: [],
        sqlShape: 'dataImportRun(id) { issues { severity code entityType sourceSheet sourceRow resolutionStatus } }',
      },
      {
        key: 'entityChangeLog',
        name: 'EntityChangeLog',
        domain: 'audit',
        storage: 'PostgreSQL append-only',
        truth: 'Journal des changements entites metier avec hash avant/apres et source.',
        countLabel: 'emulateur uniquement',
        countRole: 'warning',
        columns: ['environment', 'entityType', 'entityId', 'action', 'source', 'actorUid', 'beforeHash', 'afterHash', 'reason', 'auditEventId', 'checkpointRunId'],
        relations: ['EntityChangeLog 0..1 AuditEvent/CheckpointRun/DataImportRun'],
        operations: ['ListEntityChangeLogs', 'CreateEntityChangeLog'],
        security: 'Append-only pour audit; pas d edition manuelle.',
        sampleRows: [],
        sqlShape: 'entityChangeLogs(where: { environment: { eq: $environment }, entityType: { eq: $entityType }, entityId: { eq: $entityId } })',
      },
    ]
  }, [operationalDataState.data, operationalDataState.source, probe.documents, probe.previsionnel, sourceIsSql, user])

  const selectedTable = tableCatalog.find(table => table.key === selectedTableKey) ?? tableCatalog[0]
  const tableByKey = useMemo(() => new Map(tableCatalog.map(table => [table.key, table])), [tableCatalog])
  const nodeByKey = useMemo(() => new Map(diagramNodes.map(node => [node.key, node])), [])
  const normalizedSearch = normalizeSearch(tableFilter)
  const normalizedClientSearch = normalizeSearch(clientSearch)
  const matchingClients = useMemo(() => {
    if (!normalizedSearch) return []

    return operationalDataState.data.clients
      .filter(client => {
        const haystack = normalizeSearch([
          client.nom,
          client.prenom ?? '',
          client.email,
          client.telephone,
          client.ville,
          client.codePostal,
          client.type,
          client.typeChantierCible ?? '',
        ].join(' '))
        return haystack.includes(normalizedSearch)
      })
      .slice(0, 8)
  }, [normalizedSearch, operationalDataState.data.clients])
  const selectedWorkbenchClient = useMemo(
    () => (selectedClientId ? operationalDataState.data.clients.find(client => client.id === selectedClientId) ?? null : null),
    [operationalDataState.data.clients, selectedClientId]
  )
  const clientWorkbenchResults = useMemo(() => {
    const clients = operationalDataState.data.clients
    if (!normalizedClientSearch) return clients.slice(0, 24)

    return clients
      .filter(client => {
        const haystack = normalizeSearch([
          client.nom,
          client.prenom ?? '',
          client.email,
          client.telephone,
          client.ville,
          client.codePostal,
          client.type,
          client.typeChantierCible ?? '',
        ].join(' '))
        return haystack.includes(normalizedClientSearch)
      })
      .slice(0, 24)
  }, [normalizedClientSearch, operationalDataState.data.clients])
  const focusedSearchClient = selectedWorkbenchClient ?? (workbenchMode === 'global' ? matchingClients[0] ?? null : null)
  const clientWorkbenchRows = useMemo(() => {
    if (!focusedSearchClient) {
      return {
        chantiers: [] as Chantier[],
        devis: [] as Devis[],
        factures: [] as Facture[],
      }
    }

    const chantiers = operationalDataState.data.chantiers.filter(chantier => chantier.clientId === focusedSearchClient.id)
    const chantierIds = new Set(chantiers.map(chantier => chantier.id))
    const devis = operationalDataState.data.devis.filter(item => item.clientId === focusedSearchClient.id || (item.chantierId ? chantierIds.has(item.chantierId) : false))
    const factures = operationalDataState.data.factures.filter(facture => chantierIds.has(facture.chantierId))

    return {
      chantiers,
      devis,
      factures,
    }
  }, [focusedSearchClient, operationalDataState.data.chantiers, operationalDataState.data.devis, operationalDataState.data.factures])
  const clientNodeMeta = useMemo(() => {
    const meta = new Map<string, { title?: string; subtitle: string; count: string }>()
    if (!focusedSearchClient) return meta

    meta.set('client', {
      title: focusedSearchClient.nom,
      subtitle: focusedSearchClient.ville || focusedSearchClient.type,
      count: '1 client',
    })
    if (clientWorkbenchRows.chantiers.length) {
      meta.set('chantier', {
        subtitle: clientWorkbenchRows.chantiers[0].nom,
        count: `${clientWorkbenchRows.chantiers.length} chantier${clientWorkbenchRows.chantiers.length > 1 ? 's' : ''}`,
      })
    }
    if (clientWorkbenchRows.devis.length) {
      meta.set('devis', {
        subtitle: clientWorkbenchRows.devis[0].numeroDevis,
        count: `${clientWorkbenchRows.devis.length} devis`,
      })
    }
    if (clientWorkbenchRows.factures.length) {
      meta.set('facture', {
        subtitle: clientWorkbenchRows.factures[0].fournisseur,
        count: `${clientWorkbenchRows.factures.length} facture${clientWorkbenchRows.factures.length > 1 ? 's' : ''}`,
      })
    }

    return meta
  }, [clientWorkbenchRows.chantiers, clientWorkbenchRows.devis, clientWorkbenchRows.factures, focusedSearchClient])
  const clientRelatedTableKeys = useMemo(() => {
    const keys = new Set<string>()
    if (!focusedSearchClient) return keys

    const hasEmailRefs = clientWorkbenchRows.chantiers.some(chantier => chantier.emailIds.length > 0)

    keys.add('client')
    if (clientWorkbenchRows.chantiers.length) keys.add('chantier')
    if (clientWorkbenchRows.devis.length) keys.add('devis')
    if (clientWorkbenchRows.factures.length) keys.add('facture')
    if (hasEmailRefs) {
      keys.add('emailThread')
      keys.add('emailMessage')
    }

    return keys
  }, [clientWorkbenchRows.chantiers, clientWorkbenchRows.devis, clientWorkbenchRows.factures, focusedSearchClient])
  const clientHasRelatedTables = clientRelatedTableKeys.size > 1
  const activeRelationKeys = useMemo(() => {
    const keys = new Set([selectedTable.key])
    if (focusedSearchClient) clientRelatedTableKeys.forEach(key => keys.add(key))
    for (const link of diagramLinks) {
      if (link.from === selectedTable.key || link.to === selectedTable.key) {
        keys.add(link.from)
        keys.add(link.to)
      }
    }
    return keys
  }, [clientRelatedTableKeys, focusedSearchClient, selectedTable.key])
  const visibleDiagramNodes = useMemo(
    () => (workbenchMode === 'client'
      ? focusedSearchClient
        ? diagramNodes.filter(node => clientRelatedTableKeys.has(node.key))
        : []
      : diagramNodes),
    [clientRelatedTableKeys, focusedSearchClient, workbenchMode]
  )
  const visibleDiagramNodeKeys = useMemo(() => new Set(visibleDiagramNodes.map(node => node.key)), [visibleDiagramNodes])
  const visibleDiagramLinks = useMemo(
    () => diagramLinks.filter(link => visibleDiagramNodeKeys.has(link.from) && visibleDiagramNodeKeys.has(link.to)),
    [visibleDiagramNodeKeys]
  )
  const visibleDiagramZones = useMemo(() => (
    diagramZones.filter(zone => visibleDiagramNodes.some(node => (
      node.x >= zone.x &&
      node.x <= zone.x + zone.w &&
      node.y >= zone.y &&
      node.y <= zone.y + zone.h
    )))
  ), [visibleDiagramNodes])

  const filteredTableCatalog = useMemo(() => {
    const filter = normalizedSearch
    if (workbenchMode === 'client') {
      return tableCatalog.filter(table => focusedSearchClient ? clientRelatedTableKeys.has(table.key) : table.key === 'client')
    }
    if (!filter) return tableCatalog
    if (matchingClients.length) return tableCatalog.filter(table => clientRelatedTableKeys.has(table.key))

    return tableCatalog.filter(table => {
      const haystack = [
        table.name,
        table.domain,
        table.storage,
        table.truth,
        table.countLabel,
        table.columns.join(' '),
        table.relations.join(' '),
        table.operations.join(' '),
        table.security,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(filter)
    })
  }, [clientRelatedTableKeys, focusedSearchClient, matchingClients.length, normalizedSearch, tableCatalog, workbenchMode])

  const detailClient = detailClientId
    ? operationalDataState.data.clients.find(client => client.id === detailClientId) ?? null
    : null
  const detailClientChantiers = detailClient
    ? operationalDataState.data.chantiers.filter(chantier => chantier.clientId === detailClient.id)
    : []
  const detailClientDevis = detailClient
    ? operationalDataState.data.devis.filter(devis => devis.clientId === detailClient.id)
    : []
  const detailClientFactures = detailClientChantiers.length
    ? operationalDataState.data.factures.filter(facture => detailClientChantiers.some(chantier => chantier.id === facture.chantierId))
    : []

  return (
    <div className="engine-room engine-room-workbench">
      <style>{engineRoomCss}</style>

      <header className="bench-topbar">
        <div className="bench-topbar-left">
          <Link className="engine-ghost-button" to="/dashboard">
            <ArrowLeft size={17} strokeWidth={1.9} />
            Dashboard
          </Link>
          <div>
            <span>Database overview</span>
            <strong>Base relationnelle Sosson</strong>
          </div>
        </div>
        <div className="bench-topbar-search">
          <Search size={17} strokeWidth={1.9} />
          <input
            value={tableFilter}
            onChange={event => setTableFilter(event.target.value)}
            placeholder="Rechercher table, colonne, operation, client, ville..."
          />
        </div>
        <div className="bench-topbar-actions">
          <StatusPill role={isDataConnectEnabled ? 'success' : 'neutral'}>{isDataConnectEnabled ? 'SQL Connect active' : 'SQL off'}</StatusPill>
          <StatusPill role={probeStatusRole(probe.status)}>{probeStatusLabel(probe.status)}</StatusPill>
          <button className="engine-ghost-button" type="button" onClick={() => void refreshSqlProbe()} disabled={probe.status === 'loading'}>
            <RefreshCw size={16} strokeWidth={1.9} />
            Relire
          </button>
        </div>
      </header>

      <main className="bench-shell">
        <aside className="bench-sidebar">
              <div className="bench-sidebar-head">
                <span>Catalogue</span>
                <strong>{filteredTableCatalog.length}/{tableCatalog.length} tables</strong>
              </div>

              {matchingClients.length ? (
                <div className="bench-search-results">
                  <span>Clients trouves</span>
                  {matchingClients.map(client => {
                    const chantiersCount = operationalDataState.data.chantiers.filter(chantier => chantier.clientId === client.id).length
                    return (
                      <button key={client.id} type="button" onClick={() => setDetailClientId(client.id)}>
                        <strong>{client.nom}</strong>
                        <small>{client.ville || client.type} - {chantiersCount} chantier{chantiersCount > 1 ? 's' : ''}</small>
                      </button>
                    )
                  })}
                </div>
              ) : null}

              <div className="bench-domain-grid">
                {(['core', 'documents', 'previsionnel', 'email', 'planning', 'analytics', 'audit'] as CatalogDomain[]).map(domain => (
                  <button
                    key={domain}
                    type="button"
                    className="bench-domain-pill"
                    onClick={() => setTableFilter(domain === tableFilter ? '' : domain)}
                  >
                    <span>{domainLabel(domain)}</span>
                    <strong>{tableCatalog.filter(table => table.domain === domain).length}</strong>
                  </button>
                ))}
              </div>

              <div className="bench-table-list" role="listbox" aria-label="Tables SQL Connect">
                {filteredTableCatalog.map(table => (
                  <button
                    key={table.key}
                    type="button"
                    className="bench-table-row"
                    data-selected={selectedTable.key === table.key}
                    onClick={() => setSelectedTableKey(table.key)}
                  >
                    <span>
                      <Database size={15} strokeWidth={1.8} />
                      <strong>{table.name}</strong>
                    </span>
                    <small>{domainLabel(table.domain)}</small>
                    <StatusPill role={table.countRole}>{table.countLabel}</StatusPill>
                  </button>
                ))}
                {!filteredTableCatalog.length ? (
                  <div className="engine-empty-state">Aucune table ne correspond au filtre courant.</div>
                ) : null}
              </div>
            </aside>

            <section className="bench-main">
              <section className="bench-diagram-shell" data-mode={workbenchMode}>
                <div className="bench-canvas-toolbar">
                  <div>
                    <span>{workbenchMode === 'client' ? 'Client workbench' : 'Schema global'}</span>
                    <strong>{focusedSearchClient ? focusedSearchClient.nom : selectedTable.name}</strong>
                  </div>
                  <div className="bench-canvas-actions">
                    {workbenchMode === 'client' ? (
                      <button type="button" onClick={() => { setWorkbenchMode('global'); setSelectedClientId(null); resetWorkbenchView() }}>
                        Vue globale
                      </button>
                    ) : null}
                    <button type="button" onClick={() => setWorkbenchZoom(value => clamp(value - .1, minWorkbenchZoom, maxWorkbenchZoom))}>-</button>
                    <span>{Math.round(workbenchZoom * 100)}%</span>
                    <button type="button" onClick={() => setWorkbenchZoom(value => clamp(value + .1, minWorkbenchZoom, maxWorkbenchZoom))}>+</button>
                    <button type="button" onClick={resetWorkbenchView}>Reset</button>
                  </div>
                </div>

                {probe.error ? (
                  <div className="bench-canvas-alert" role="status">
                    <AlertTriangle size={16} strokeWidth={1.9} />
                    SQL partiel
                  </div>
                ) : null}

                {workbenchMode === 'client' && !focusedSearchClient ? (
                  <section className="bench-client-picker">
                    <div>
                      <span>Open Client</span>
                      <h2>Selectionner un client</h2>
                      <p>La vue globale est remplacee par un workbench centre sur le client et ses relations metier.</p>
                    </div>
                    <label className="bench-client-search">
                      <Search size={17} strokeWidth={1.9} />
                      <input
                        value={clientSearch}
                        onChange={event => setClientSearch(event.target.value)}
                        placeholder="Rechercher un client, ville, telephone..."
                      />
                    </label>
                    <div className="bench-client-results">
                      {clientWorkbenchResults.map(client => {
                        const chantiersCount = operationalDataState.data.chantiers.filter(chantier => chantier.clientId === client.id).length
                        return (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => {
                              setSelectedClientId(client.id)
                              setSelectedTableKey('client')
                              resetWorkbenchView()
                            }}
                          >
                            <strong>{client.nom}</strong>
                            <small>{client.ville || client.type} - {chantiersCount} chantier{chantiersCount > 1 ? 's' : ''}</small>
                          </button>
                        )
                      })}
                    </div>
                  </section>
                ) : null}

                <div
                  ref={workbenchViewportRef}
                  className="bench-diagram-viewport"
                  data-dragging={dragOrigin !== null}
                  onPointerDown={handleWorkbenchPointerDown}
                  onPointerMove={handleWorkbenchPointerMove}
                  onPointerUp={handleWorkbenchPointerUp}
                  onPointerCancel={handleWorkbenchPointerUp}
                >
                  <div
                    className="bench-diagram-stage"
                    style={{
                      transform: `translate3d(${workbenchPan.x}px, ${workbenchPan.y}px, 0) scale(${workbenchRenderScale})`,
                    }}
                  >
                    {visibleDiagramZones.map(zone => (
                      <div
                        key={zone.label}
                        className="bench-diagram-zone"
                        data-tone={zone.tone}
                        style={{ left: zone.x, top: zone.y, width: zone.w, height: zone.h }}
                      >
                        {zone.label}
                      </div>
                    ))}

                    <svg className="bench-diagram-lines" viewBox={`0 0 ${diagramStageWidth} ${diagramStageHeight}`} aria-hidden="true">
                      {visibleDiagramLinks.map(link => {
                        const from = nodeByKey.get(link.from)
                        const to = nodeByKey.get(link.to)
                        if (!from || !to) return null
                        const route = diagramPathFor(from, to)
                        const selected =
                          link.from === selectedTable.key ||
                          link.to === selectedTable.key ||
                          (focusedSearchClient !== null && clientRelatedTableKeys.has(link.from) && clientRelatedTableKeys.has(link.to))
                        return (
                          <g key={`${link.from}-${link.to}-${link.label}`} className="bench-link" data-active={selected}>
                            <path d={route.d} />
                            {selected ? (
                              <text x={route.labelX} y={route.labelY - 5}>
                                {link.label}
                              </text>
                            ) : null}
                          </g>
                        )
                      })}
                    </svg>

                    {visibleDiagramNodes.map(node => {
                      const table = tableByKey.get(node.key)
                      if (!table) return null
                      const nodeMeta = workbenchMode === 'client' ? clientNodeMeta.get(node.key) : null
                      const nodeTitle = nodeMeta?.title ?? table.name
                      const nodeSubtitle = nodeMeta?.subtitle ?? table.columns.slice(0, 3).join(' / ')
                      return (
                        <div
                          key={node.key}
                          className="bench-diagram-node"
                          data-selected={selectedTable.key === node.key}
                          data-linked={activeRelationKeys.has(node.key)}
                          data-domain={table.domain}
                          style={{ left: node.x, top: node.y }}
                        >
                          <button type="button" className="bench-node-main" onClick={() => setSelectedTableKey(node.key)}>
                            <span>
                              <Database size={14} strokeWidth={1.8} />
                              <strong className="bench-node-title" title={nodeTitle}>{nodeTitle}</strong>
                            </span>
                            <small title={nodeSubtitle}>{nodeSubtitle}</small>
                            <em>{nodeMeta?.count ?? table.countLabel}</em>
                          </button>
                          <button
                            type="button"
                            className="bench-node-open"
                            onClick={() => openDiagramTable(node.key)}
                            aria-label={`Ouvrir ${table.name}`}
                            title={`Ouvrir ${table.name}`}
                          >
                            <ArrowUpRight size={11} strokeWidth={2.2} />
                          </button>
                        </div>
                      )
                    })}

                    {workbenchMode === 'client' && focusedSearchClient && !clientHasRelatedTables ? (
                      <div className="bench-client-empty-relations">
                        <strong>Aucune table rattachee</strong>
                        <span>Ce client n'a pas encore de chantier, devis, facture ou autre relation visible dans le front.</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {workbenchMode === 'client' && focusedSearchClient && clientHasRelatedTables && selectedTableKey !== 'client' ? (
                  <aside className="bench-relation-panel" aria-label={`Donnees ${selectedTable.name}`}>
                    <div className="bench-relation-panel-head">
                      <span>{focusedSearchClient.nom}</span>
                      <strong>{selectedTable.name}</strong>
                      <button type="button" onClick={() => setSelectedTableKey('client')} aria-label="Fermer le panneau">
                        <X size={14} strokeWidth={2} />
                      </button>
                    </div>

                    {selectedTableKey === 'chantier' ? (
                      <div className="bench-relation-list">
                        {clientWorkbenchRows.chantiers.map(chantier => (
                          <Link key={chantier.id} to={`/chantiers/${chantier.id}`} className="bench-relation-card">
                            <span>
                              <strong>{chantier.nom}</strong>
                              <small>{chantier.statut} - {chantier.adresse}</small>
                            </span>
                            <em>{formatEuros(chantier.budgetPrevisionnel)}</em>
                          </Link>
                        ))}
                      </div>
                    ) : null}

                    {selectedTableKey === 'devis' ? (
                      <div className="bench-relation-list">
                        {clientWorkbenchRows.devis.map(devis => (
                          <button key={devis.id} type="button" className="bench-relation-card">
                            <span>
                              <strong>{devis.numeroDevis}</strong>
                              <small>{devis.titre} - {devis.statut}</small>
                            </span>
                            <em>{devis.montantTTC ? formatEuros(devis.montantTTC) : 'A chiffrer'}</em>
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {selectedTableKey === 'facture' ? (
                      <div className="bench-relation-list">
                        {clientWorkbenchRows.factures.map(facture => (
                          <button key={facture.id} type="button" className="bench-relation-card">
                            <span>
                              <strong>{facture.numeroFacture}</strong>
                              <small>{facture.fournisseur} - {facture.statut}</small>
                            </span>
                            <em>{formatEuros(facture.montantTTC)}</em>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </aside>
                ) : null}
              </section>
            </section>
      </main>

      {detailClient ? (
        <ClientDetailModal
          client={detailClient}
          chantiers={detailClientChantiers}
          devis={detailClientDevis}
          factures={detailClientFactures}
          sourceIsSql={sourceIsSql}
          onClose={() => setDetailClientId(null)}
        />
      ) : null}
    </div>
  )
}

const engineRoomCss = `
:root {
  --engine-canvas: #FAF6F2;
  --engine-surface: #FFFFFF;
  --engine-ink: #1E1E1E;
  --engine-muted: #6B6B6B;
  --engine-line: #F2E8DC;
  --engine-line-strong: #EADBC8;
  --engine-action: #F06B21;
  --engine-action-soft: #FFF4EC;
  --engine-info-bg: #EEF4FF;
  --engine-info-fg: #3152D4;
  --engine-success-bg: #ECFDF5;
  --engine-success-fg: #047857;
  --engine-warning-bg: #FFFBEB;
  --engine-warning-fg: #B45309;
  --engine-danger-bg: #FFF1F2;
  --engine-danger-fg: #B91C1C;
  --engine-neutral-bg: #F6F2EC;
  --engine-neutral-fg: #6B6B6B;
  --engine-radius-card: 20px;
  --engine-radius-panel: 24px;
  --engine-radius-pill: 999px;
  --engine-shadow-soft: 0 24px 70px rgba(30, 30, 30, .10);
  --engine-s-2: 8px;
  --engine-s-3: 12px;
  --engine-s-4: 16px;
  --engine-s-5: 20px;
  --engine-s-6: 24px;
  --engine-s-7: 32px;
  --engine-s-8: 48px;
  --engine-ease: cubic-bezier(.2, .8, .2, 1);
}

.engine-room {
  min-height: 100svh;
  background: var(--engine-canvas);
  color: var(--engine-ink);
  font-family: Inter, system-ui, sans-serif;
}

.engine-room,
.engine-room * {
  box-sizing: border-box;
}

.engine-room button,
.engine-room input {
  font: inherit;
}

.engine-home,
.engine-home-main {
  width: min(100%, 1480px);
  margin: 0 auto;
  padding: var(--engine-s-6);
}

.engine-topbar,
.engine-topbar-actions,
.engine-back,
.engine-refresh,
.engine-primary,
.engine-secondary,
.engine-ghost-button,
.bench-topbar,
.bench-topbar-left,
.bench-topbar-actions {
  display: flex;
  align-items: center;
}

.engine-topbar,
.bench-topbar {
  justify-content: space-between;
  gap: var(--engine-s-4);
}

.engine-topbar-actions,
.bench-topbar-actions,
.engine-home-actions,
.bench-main-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--engine-s-3);
}

.engine-back,
.engine-refresh,
.engine-secondary,
.engine-ghost-button {
  min-height: 42px;
  gap: var(--engine-s-2);
  border: 1px solid var(--engine-line-strong);
  border-radius: var(--engine-radius-pill);
  background: var(--engine-surface);
  color: var(--engine-ink);
  padding: 0 var(--engine-s-4);
  font-size: 13px;
  font-weight: 850;
  text-decoration: none;
  cursor: pointer;
}

.engine-back {
  border-color: var(--engine-ink);
  box-shadow: 0 4px 0 var(--engine-ink);
}

.engine-refresh:disabled,
.engine-ghost-button:disabled {
  cursor: wait;
  opacity: .58;
}

.engine-primary {
  min-height: 48px;
  gap: var(--engine-s-2);
  border: 1px solid #D95B17;
  border-radius: 14px;
  background: var(--engine-action);
  color: #fff;
  padding: 0 var(--engine-s-5);
  font-size: 13px;
  font-weight: 900;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 6px 0 #1E1E1E;
  transition: transform 160ms var(--engine-ease), box-shadow 160ms var(--engine-ease);
}

.engine-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 7px 0 #1E1E1E;
}

.engine-primary:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 #1E1E1E;
}

.engine-pill {
  display: inline-flex;
  width: max-content;
  max-width: 100%;
  align-items: center;
  border-radius: var(--engine-radius-pill);
  padding: 6px 11px;
  background: var(--engine-neutral-bg);
  color: var(--engine-neutral-fg);
  font-size: 11px;
  font-weight: 850;
  line-height: 1.2;
  text-transform: uppercase;
}

.engine-pill[data-role='success'] { background: var(--engine-success-bg); color: var(--engine-success-fg); }
.engine-pill[data-role='info'] { background: var(--engine-info-bg); color: var(--engine-info-fg); }
.engine-pill[data-role='warning'] { background: var(--engine-warning-bg); color: var(--engine-warning-fg); }
.engine-pill[data-role='danger'] { background: var(--engine-danger-bg); color: var(--engine-danger-fg); }

.engine-home-hero {
  display: grid;
  grid-template-columns: minmax(0, .86fr) minmax(440px, .72fr);
  align-items: stretch;
  gap: var(--engine-s-6);
  padding: var(--engine-s-8) 0 var(--engine-s-4);
}

.engine-home-copy,
.engine-home-console,
.engine-home-card,
.engine-readiness,
.engine-home-workbench-preview {
  border: 1px solid var(--engine-line);
  border-radius: var(--engine-radius-panel);
  background: rgba(255, 255, 255, .94);
  box-shadow: 0 18px 50px rgba(30, 30, 30, .06);
}

.engine-home-copy {
  display: grid;
  align-content: center;
  justify-items: start;
  gap: var(--engine-s-5);
  padding: clamp(28px, 5vw, 54px);
}

.engine-home-copy h1 {
  margin: 0;
  font-size: clamp(48px, 7vw, 92px);
  font-weight: 900;
  line-height: .94;
  letter-spacing: 0;
}

.engine-home-copy p {
  max-width: 70ch;
  margin: 0;
  color: #3C3C3C;
  font-size: 16px;
  line-height: 1.7;
}

.engine-home-console {
  display: grid;
  gap: var(--engine-s-5);
  padding: var(--engine-s-6);
  background:
    linear-gradient(180deg, #1E1E1E 0 118px, #FFFFFF 118px),
    #fff;
}

.engine-home-console-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--engine-s-4);
  color: #fff;
}

.engine-home-console-head span,
.bench-sidebar-head span,
.bench-overview-copy span,
.engine-section-title span,
.bench-diagram-toolbar span,
.bench-client-strip > div > span,
.bench-sql-shape span,
.bench-preview > div > span {
  color: var(--engine-muted);
  font-size: 11px;
  font-weight: 850;
  text-transform: uppercase;
}

.engine-home-console-head span {
  color: rgba(255, 255, 255, .7);
}

.engine-home-console-head strong {
  font-size: 34px;
  line-height: .95;
}

.engine-console-mini-grid,
.engine-client-modal-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--engine-s-3);
}

.engine-metric {
  display: grid;
  gap: var(--engine-s-2);
  border: 1px solid var(--engine-line);
  border-radius: var(--engine-radius-card);
  background: #fff;
  padding: var(--engine-s-4);
}

.engine-metric[data-role='success'] { background: var(--engine-success-bg); }
.engine-metric[data-role='info'] { background: var(--engine-info-bg); }
.engine-metric[data-role='warning'] { background: var(--engine-warning-bg); }
.engine-metric[data-role='danger'] { background: var(--engine-danger-bg); }

.engine-metric div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--engine-s-2);
}

.engine-metric p {
  margin: 0;
  color: var(--engine-muted);
  font-size: 11px;
  font-weight: 850;
  line-height: 1.35;
  text-transform: uppercase;
}

.engine-metric strong {
  overflow-wrap: anywhere;
  font-size: 30px;
  line-height: 1;
}

.engine-metric span {
  color: #5A5A5A;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.35;
}

.engine-home-main {
  display: grid;
  gap: var(--engine-s-6);
  padding-top: 0;
  padding-bottom: var(--engine-s-8);
}

.engine-home-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--engine-s-4);
}

.engine-home-card {
  display: grid;
  min-height: 230px;
  align-content: start;
  gap: var(--engine-s-3);
  padding: var(--engine-s-5);
}

.engine-home-card svg {
  color: var(--engine-action);
}

.engine-home-card h2 {
  margin: 0;
  font-size: 22px;
  line-height: 1.06;
}

.engine-home-card p,
.engine-home-workbench-preview p {
  margin: 0;
  color: #4A4A4A;
  font-size: 13px;
  line-height: 1.62;
}

.engine-home-card[data-role='success'] { box-shadow: inset 0 5px 0 var(--engine-success-bg); }
.engine-home-card[data-role='info'] { box-shadow: inset 0 5px 0 var(--engine-info-bg); }
.engine-home-card[data-role='warning'] { box-shadow: inset 0 5px 0 var(--engine-warning-bg); }

.engine-readiness {
  display: grid;
  grid-template-columns: minmax(280px, .45fr) minmax(0, 1fr);
  gap: var(--engine-s-5);
  padding: var(--engine-s-6);
}

.engine-section-title {
  display: grid;
  align-content: start;
  gap: var(--engine-s-3);
}

.engine-section-title h2,
.engine-home-workbench-preview h2,
.engine-client-modal-head h2 {
  margin: 0;
  font-size: clamp(28px, 3vw, 46px);
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0;
}

.engine-readiness-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--engine-s-3);
}

.engine-readiness-row {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--engine-s-3);
  border: 1px solid var(--engine-line);
  border-radius: 18px;
  background: #fff;
  padding: var(--engine-s-4);
}

.engine-readiness-row[data-role='warning'] { background: var(--engine-warning-bg); }
.engine-readiness-row[data-role='success'] { background: var(--engine-success-bg); }

.engine-readiness-row svg {
  color: var(--engine-action);
}

.engine-readiness-row strong,
.engine-readiness-row small,
.bench-table-row strong,
.bench-table-row small,
.bench-client-chip strong,
.bench-client-chip small,
.engine-soft-row strong,
.engine-soft-row small {
  display: block;
}

.engine-readiness-row strong {
  font-size: 14px;
  line-height: 1.25;
}

.engine-readiness-row small {
  margin-top: 3px;
  color: #5A5A5A;
  font-size: 12px;
  line-height: 1.35;
}

.engine-home-workbench-preview {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--engine-s-5);
  padding: var(--engine-s-6);
}

.engine-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--engine-s-3);
  border: 1px solid rgba(180, 83, 9, .24);
  border-radius: var(--engine-radius-card);
  background: var(--engine-warning-bg);
  color: var(--engine-warning-fg);
  padding: var(--engine-s-4);
}

.engine-alert strong,
.engine-alert small {
  display: block;
}

.engine-alert strong {
  color: var(--engine-ink);
  font-size: 14px;
}

.engine-alert small {
  margin-top: 3px;
  color: #7C4A03;
  font-size: 13px;
  line-height: 1.45;
}

.engine-room-workbench {
  min-height: 100svh;
  overflow: hidden;
  background: #EDE7DF;
}

.bench-topbar {
  height: 72px;
  border-bottom: 1px solid rgba(255, 255, 255, .08);
  background: var(--engine-ink);
  color: #fff;
  padding: 0 var(--engine-s-5);
}

.bench-topbar-left {
  gap: var(--engine-s-4);
}

.bench-topbar-search {
  display: flex;
  width: min(42vw, 680px);
  min-width: 320px;
  align-items: center;
  gap: var(--engine-s-2);
  border: 1px solid rgba(255, 255, 255, .14);
  border-radius: 14px;
  background: rgba(255, 255, 255, .08);
  color: rgba(255, 255, 255, .76);
  padding: 0 var(--engine-s-3);
}

.bench-topbar-search input {
  width: 100%;
  min-width: 0;
  height: 42px;
  border: 0;
  background: transparent;
  color: #fff;
  outline: 0;
  font-size: 13px;
  font-weight: 750;
}

.bench-topbar-search input::placeholder {
  color: rgba(255, 255, 255, .45);
}

.bench-topbar-left > div span,
.bench-topbar-left > div strong {
  display: block;
}

.bench-topbar-left > div span {
  color: rgba(255, 255, 255, .58);
  font-size: 11px;
  font-weight: 850;
  text-transform: uppercase;
}

.bench-topbar-left > div strong {
  margin-top: 3px;
  font-size: 16px;
  line-height: 1.2;
}

.bench-topbar .engine-ghost-button {
  border-color: rgba(255, 255, 255, .16);
  background: rgba(255, 255, 255, .06);
  color: #fff;
}

.bench-shell {
  display: grid;
  grid-template-columns: 324px minmax(0, 1fr);
  height: calc(100svh - 72px);
  min-height: 640px;
}

.bench-sidebar {
  display: grid;
  min-height: 0;
  align-content: start;
  overflow: hidden;
  background: #1E1E1E;
  color: #fff;
}

.bench-sidebar {
  border-right: 1px solid rgba(255, 255, 255, .08);
  padding: var(--engine-s-4);
}

.bench-sidebar-head {
  display: grid;
  gap: var(--engine-s-2);
  padding-bottom: var(--engine-s-4);
}

.bench-sidebar-head span {
  color: rgba(255, 255, 255, .55);
}

.bench-sidebar-head strong {
  font-size: 24px;
  line-height: 1;
}

.bench-search {
  display: flex;
  align-items: center;
  gap: var(--engine-s-2);
  height: 40px;
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 12px;
  background: rgba(255, 255, 255, .06);
  padding: 0 var(--engine-s-3);
}

.bench-search input {
  min-width: 0;
  flex: 1;
  border: 0;
  background: transparent;
  color: #fff;
  outline: 0;
  font-size: 13px;
}

.bench-search input::placeholder {
  color: rgba(255, 255, 255, .42);
}

.bench-search-results {
  display: grid;
  gap: 8px;
  border: 1px solid rgba(240, 107, 33, .22);
  border-radius: 14px;
  background: rgba(240, 107, 33, .10);
  margin-bottom: var(--engine-s-4);
  padding: var(--engine-s-3);
}

.bench-search-results > span {
  color: rgba(255, 255, 255, .64);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
}

.bench-search-results button {
  display: grid;
  gap: 3px;
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 10px;
  background: rgba(255, 255, 255, .08);
  color: #fff;
  padding: 9px 10px;
  text-align: left;
  cursor: pointer;
}

.bench-search-results strong,
.bench-search-results small {
  display: block;
}

.bench-search-results strong {
  font-size: 12px;
  line-height: 1.2;
}

.bench-search-results small {
  color: rgba(255, 255, 255, .58);
  font-size: 11px;
}

.bench-domain-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: var(--engine-s-4) 0;
}

.bench-domain-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--engine-s-2);
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 12px;
  background: rgba(255, 255, 255, .05);
  color: #fff;
  padding: 9px 10px;
  cursor: pointer;
}

.bench-domain-pill span {
  overflow: hidden;
  font-size: 11px;
  font-weight: 850;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bench-domain-pill strong {
  color: var(--engine-action);
  font-size: 12px;
}

.bench-table-list {
  display: grid;
  min-height: 0;
  gap: 8px;
  overflow-y: auto;
  padding-right: 4px;
}

.bench-table-row {
  display: grid;
  gap: 7px;
  border: 1px solid rgba(255, 255, 255, .08);
  border-radius: 14px;
  background: rgba(255, 255, 255, .045);
  color: #fff;
  padding: 11px;
  text-align: left;
  cursor: pointer;
}

.bench-table-row:hover,
.bench-table-row[data-selected='true'] {
  border-color: rgba(240, 107, 33, .72);
  background: rgba(240, 107, 33, .13);
}

.bench-table-row[data-selected='true'] {
  box-shadow: inset 3px 0 0 var(--engine-action);
}

.bench-table-row > span {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--engine-s-2);
}

.bench-table-row svg {
  color: var(--engine-action);
  flex: 0 0 auto;
}

.bench-table-row strong {
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bench-table-row small {
  color: rgba(255, 255, 255, .54);
  font-size: 11px;
}

.bench-main {
  display: grid;
  min-width: 0;
  min-height: 0;
  grid-template-rows: minmax(0, 1fr);
  overflow: hidden;
  padding: 0;
}

.bench-diagram-toolbar,
.bench-client-strip,
.bench-preview > div {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--engine-s-4);
}

.bench-overview-bar {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) auto;
  align-items: end;
  gap: var(--engine-s-4);
  border: 1px solid var(--engine-line);
  border-radius: 18px;
  background: #fff;
  padding: 14px 16px;
}

.bench-overview-copy {
  display: grid;
  gap: 4px;
}

.bench-overview-copy strong {
  display: block;
  font-size: 28px;
  line-height: 1;
}

.bench-overview-copy small {
  color: var(--engine-muted);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.35;
}

.bench-overview-metrics {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 7px;
}

.bench-overview-metrics span {
  border-radius: 999px;
  background: var(--engine-neutral-bg);
  color: var(--engine-neutral-fg);
  padding: 7px 9px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  white-space: nowrap;
}

.bench-overview-metrics span[data-role='success'] { background: var(--engine-success-bg); color: var(--engine-success-fg); }
.bench-overview-metrics span[data-role='info'] { background: var(--engine-info-bg); color: var(--engine-info-fg); }
.bench-overview-metrics span[data-role='warning'] { background: var(--engine-warning-bg); color: var(--engine-warning-fg); }
.bench-overview-metrics span[data-role='danger'] { background: var(--engine-danger-bg); color: var(--engine-danger-fg); }
.bench-overview-metrics span[data-role='neutral'] { background: var(--engine-neutral-bg); color: var(--engine-neutral-fg); }

.bench-diagram-shell,
.bench-client-strip {
  min-width: 0;
  border: 1px solid var(--engine-line);
  border-radius: var(--engine-radius-panel);
  background: #fff;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(30, 30, 30, .045);
}

.bench-diagram-shell {
  position: relative;
  height: 100%;
  border: 0;
  border-radius: 0;
}

.bench-canvas-toolbar,
.bench-canvas-alert {
  position: absolute;
  z-index: 8;
  backdrop-filter: blur(12px);
}

.bench-canvas-toolbar {
  left: 18px;
  top: 18px;
  display: flex;
  max-width: calc(100% - 36px);
  align-items: center;
  justify-content: space-between;
  gap: var(--engine-s-4);
  border: 1px solid rgba(30, 30, 30, .12);
  border-radius: 16px;
  background: rgba(255, 252, 248, .92);
  padding: 10px 12px;
  box-shadow: 0 14px 34px rgba(30, 30, 30, .10);
}

.bench-canvas-toolbar span {
  display: block;
  color: var(--engine-muted);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
}

.bench-canvas-toolbar strong {
  display: block;
  margin-top: 2px;
  max-width: 320px;
  overflow: hidden;
  font-size: 16px;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bench-canvas-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.bench-canvas-actions button,
.bench-canvas-actions span {
  display: inline-flex;
  min-width: 34px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--engine-line-strong);
  border-radius: 10px;
  background: #fff;
  color: var(--engine-ink);
  padding: 0 10px;
  font-size: 11px;
  font-weight: 900;
}

.bench-canvas-actions button {
  cursor: pointer;
}

.bench-canvas-alert {
  right: 18px;
  top: 18px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid rgba(180, 83, 9, .20);
  border-radius: 999px;
  background: rgba(255, 251, 235, .92);
  color: var(--engine-warning-fg);
  padding: 8px 11px;
  font-size: 11px;
  font-weight: 900;
}

.bench-diagram-toolbar {
  align-items: center;
  border-bottom: 1px solid var(--engine-line);
  padding: 12px 16px;
}

.bench-diagram-toolbar strong {
  display: block;
  margin-top: 3px;
  font-size: 19px;
  line-height: 1.1;
}

.bench-diagram-viewport {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background:
    linear-gradient(#EDE3D8 1px, transparent 1px),
    linear-gradient(90deg, #EDE3D8 1px, transparent 1px),
    #FFFDF9;
  background-size: 24px 24px;
  cursor: grab;
  overscroll-behavior: contain;
  touch-action: none;
  user-select: none;
}

.bench-diagram-viewport[data-dragging='true'] {
  cursor: grabbing;
}

.bench-diagram-stage {
  position: relative;
  width: 1500px;
  height: 760px;
  overflow: visible;
  transform-origin: 0 0;
  will-change: transform;
}

.bench-diagram-zone {
  position: absolute;
  z-index: 0;
  border: 1px solid rgba(30, 30, 30, .12);
  border-radius: 10px;
  background: rgba(255, 244, 236, .72);
  color: rgba(30, 30, 30, .58);
  overflow: hidden;
  padding: 12px 14px;
  font-size: 11px;
  font-weight: 900;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .64);
  text-transform: uppercase;
}

.bench-diagram-zone[data-tone='documents'] {
  background: rgba(238, 244, 255, .82);
}

.bench-diagram-zone[data-tone='previsionnel'] {
  background: rgba(255, 251, 235, .80);
}

.bench-diagram-zone[data-tone='audit'] {
  background: rgba(246, 242, 236, .82);
}

.bench-diagram-lines {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 1500px;
  height: 760px;
  pointer-events: none;
}

.bench-link path {
  fill: none;
  stroke: rgba(30, 30, 30, .24);
  stroke-width: 1.25;
  opacity: .24;
  shape-rendering: geometricPrecision;
}

.bench-link[data-active='true'] path {
  stroke: var(--engine-action);
  stroke-width: 2.4;
  opacity: 1;
}

.bench-link text {
  fill: #D95B17;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  font-weight: 900;
}

.bench-diagram-node {
  position: absolute;
  z-index: 2;
  display: grid;
  width: 154px;
  height: 78px;
  align-content: start;
  gap: 0;
  border: 1px solid #CBB8A5;
  border-radius: 8px;
  background: #fff;
  color: var(--engine-ink);
  text-align: left;
  box-shadow: 0 2px 0 rgba(30, 30, 30, .16);
}

.bench-diagram-node::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 5px;
  border-radius: 8px 8px 0 0;
  background: #D9C9B9;
}

.bench-diagram-node[data-domain='core']::before { background: var(--engine-action); }
.bench-diagram-node[data-domain='documents']::before,
.bench-diagram-node[data-domain='email']::before { background: #8EABD9; }
.bench-diagram-node[data-domain='previsionnel']::before { background: #D7A23A; }
.bench-diagram-node[data-domain='planning']::before,
.bench-diagram-node[data-domain='analytics']::before,
.bench-diagram-node[data-domain='audit']::before { background: #8E8277; }

.bench-diagram-node[data-linked='true'] {
  border-color: rgba(240, 107, 33, .64);
}

.bench-diagram-node[data-selected='true'] {
  border-color: var(--engine-action);
  background: #FFF4EC;
  box-shadow: 0 4px 0 var(--engine-action);
}

.bench-node-main {
  display: grid;
  width: 100%;
  height: 100%;
  gap: 5px;
  min-width: 0;
  border: 0;
  background: transparent;
  color: inherit;
  padding: 12px 9px 9px;
  text-align: left;
  cursor: pointer;
}

.bench-node-open {
  position: absolute;
  right: 6px;
  top: 7px;
  display: inline-flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(240, 107, 33, .24);
  border-radius: 999px;
  background: var(--engine-action-soft);
  color: #B95316;
  margin: 0;
  opacity: 0;
  padding: 0;
  transform: translateY(-2px);
  transition: opacity 140ms var(--engine-ease), transform 140ms var(--engine-ease);
  cursor: pointer;
}

.bench-node-open svg {
  pointer-events: none;
}

.bench-diagram-node:hover .bench-node-open,
.bench-diagram-node:focus-within .bench-node-open,
.bench-diagram-node[data-selected='true'] .bench-node-open {
  opacity: 1;
  transform: translateY(0);
}

.bench-diagram-node span {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  font-size: 12px;
  font-weight: 900;
}

.bench-diagram-node span svg {
  color: var(--engine-action);
  flex: 0 0 auto;
}

.bench-node-title {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bench-diagram-node small {
  min-width: 0;
  overflow: hidden;
  color: #5A5A5A;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 9px;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bench-diagram-node em {
  color: var(--engine-muted);
  font-size: 10px;
  font-style: normal;
  font-weight: 850;
}

.bench-client-picker {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 9;
  display: grid;
  width: min(720px, calc(100% - 48px));
  max-height: min(640px, calc(100% - 80px));
  overflow: hidden;
  gap: var(--engine-s-4);
  border: 1px solid var(--engine-line-strong);
  border-radius: 20px;
  background: rgba(255, 252, 248, .96);
  padding: var(--engine-s-5);
  box-shadow: 0 28px 80px rgba(30, 30, 30, .22);
  transform: translate(-50%, -50%);
}

.bench-client-picker span {
  color: var(--engine-muted);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.bench-client-picker h2 {
  margin: 4px 0 0;
  font-size: 34px;
  line-height: 1;
}

.bench-client-picker p {
  margin: 8px 0 0;
  color: #4A4A4A;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.45;
}

.bench-client-search {
  display: flex;
  align-items: center;
  gap: var(--engine-s-2);
  height: 44px;
  border: 1px solid var(--engine-line-strong);
  border-radius: 14px;
  background: #fff;
  padding: 0 var(--engine-s-3);
}

.bench-client-search svg {
  color: var(--engine-muted);
  flex: 0 0 auto;
}

.bench-client-search input {
  min-width: 0;
  flex: 1;
  border: 0;
  background: transparent;
  outline: 0;
  font-size: 14px;
  font-weight: 750;
}

.bench-client-results {
  display: grid;
  max-height: 340px;
  overflow-y: auto;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding-right: 4px;
}

.bench-client-results button {
  display: grid;
  gap: 4px;
  border: 1px solid var(--engine-line);
  border-radius: 12px;
  background: #fff;
  color: var(--engine-ink);
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
}

.bench-client-results button:hover {
  border-color: var(--engine-action);
  background: #FFF8F2;
}

.bench-client-results strong,
.bench-client-results small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bench-client-results strong {
  font-size: 13px;
}

.bench-client-results small {
  color: var(--engine-muted);
  font-size: 11px;
}

.bench-client-empty-relations {
  position: absolute;
  left: 282px;
  top: 214px;
  z-index: 4;
  display: grid;
  max-width: 320px;
  gap: 6px;
  border: 1px solid var(--engine-line-strong);
  border-radius: 14px;
  background: rgba(255, 252, 248, .94);
  color: var(--engine-ink);
  padding: 14px 16px;
  box-shadow: 0 12px 32px rgba(30, 30, 30, .10);
}

.bench-client-empty-relations strong {
  font-size: 14px;
  line-height: 1.1;
}

.bench-client-empty-relations span {
  color: var(--engine-muted);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
}

.bench-relation-panel {
  position: absolute;
  right: 18px;
  bottom: 18px;
  z-index: 10;
  display: grid;
  width: min(390px, calc(100% - 36px));
  max-height: min(440px, calc(100% - 118px));
  overflow: hidden;
  gap: var(--engine-s-3);
  border: 1px solid rgba(30, 30, 30, .12);
  border-radius: 18px;
  background: rgba(255, 252, 248, .96);
  padding: var(--engine-s-4);
  box-shadow: 0 24px 72px rgba(30, 30, 30, .20);
}

.bench-relation-panel-head {
  position: relative;
  display: grid;
  gap: 3px;
  padding-right: 34px;
}

.bench-relation-panel-head span {
  color: var(--engine-muted);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
}

.bench-relation-panel-head strong {
  font-size: 22px;
  line-height: 1;
}

.bench-relation-panel-head button {
  position: absolute;
  right: 0;
  top: 0;
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 1px solid var(--engine-line-strong);
  border-radius: 999px;
  background: #fff;
  color: var(--engine-ink);
  cursor: pointer;
}

.bench-relation-list {
  display: grid;
  gap: 8px;
  overflow-y: auto;
  padding-right: 4px;
}

.bench-relation-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--engine-s-3);
  border: 1px solid var(--engine-line);
  border-radius: 14px;
  background: #fff;
  color: var(--engine-ink);
  padding: 11px 12px;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.bench-relation-card:hover {
  border-color: var(--engine-action);
  background: #FFF8F2;
}

.bench-relation-card span {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.bench-relation-card strong,
.bench-relation-card small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bench-relation-card strong {
  font-size: 13px;
}

.bench-relation-card small {
  color: var(--engine-muted);
  font-size: 11px;
  font-weight: 700;
}

.bench-relation-card em {
  flex: 0 0 auto;
  color: #B95316;
  font-size: 11px;
  font-style: normal;
  font-weight: 900;
}

.bench-client-strip {
  align-items: center;
  padding: var(--engine-s-4);
}

.bench-client-strip > div:first-child {
  min-width: 210px;
}

.bench-client-strip > div > strong {
  display: block;
  margin-top: 4px;
  font-size: 16px;
}

.bench-client-list {
  display: flex;
  min-width: 0;
  flex: 1;
  gap: var(--engine-s-3);
  overflow-x: auto;
  padding-bottom: 2px;
}

.bench-client-chip {
  display: flex;
  min-width: 230px;
  align-items: center;
  justify-content: space-between;
  gap: var(--engine-s-3);
  border: 1px solid var(--engine-line);
  border-radius: 16px;
  background: #fff;
  color: var(--engine-ink);
  padding: var(--engine-s-3);
  text-align: left;
  cursor: pointer;
}

.bench-client-chip:hover {
  border-color: var(--engine-action);
  background: #FFF8F2;
}

.bench-client-chip strong {
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bench-client-chip small {
  color: var(--engine-muted);
  font-size: 11px;
}

.bench-bottom-panel {
  display: grid;
  gap: var(--engine-s-3);
  border: 1px solid var(--engine-line);
  border-radius: 18px;
  background: #fff;
  padding: 14px;
  box-shadow: 0 8px 24px rgba(30, 30, 30, .04);
}

.bench-bottom-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--engine-s-4);
}

.bench-bottom-head span {
  color: var(--engine-muted);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.bench-bottom-head h2 {
  margin: 4px 0 0;
  font-size: 22px;
  line-height: 1;
}

.bench-linked-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--engine-s-3);
}

.bench-related-rows {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--engine-s-3);
}

.bench-related-rows a,
.bench-related-rows button {
  display: grid;
  gap: 4px;
  border: 1px solid var(--engine-line);
  border-radius: 14px;
  background: #FFFCF8;
  color: var(--engine-ink);
  padding: var(--engine-s-3);
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.bench-related-rows strong,
.bench-related-rows small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bench-related-rows strong {
  font-size: 13px;
}

.bench-related-rows small {
  color: var(--engine-muted);
  font-size: 11px;
}

.bench-table-detail-grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr 1fr;
  gap: var(--engine-s-3);
}

.bench-table-detail-grid article {
  min-width: 0;
  border: 1px solid var(--engine-line);
  border-radius: 14px;
  background: #FFFCF8;
  padding: 12px;
}

.bench-table-detail-grid h3 {
  margin: 0 0 var(--engine-s-3);
  font-size: 14px;
}

.bench-table-detail-grid ul {
  display: grid;
  gap: 7px;
  margin: 0;
  padding-left: 18px;
  color: #3C3C3C;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.42;
}

.bench-preview h3,
.engine-client-modal-grid h3 {
  margin: 0;
  font-size: 14px;
  line-height: 1.2;
}

.bench-column-list,
.bench-operation-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.bench-column-list code {
  border-radius: 8px;
  background: var(--engine-ink);
  color: #fff;
  padding: 6px 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  line-height: 1.2;
}

.bench-operation-list span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  background: var(--engine-action-soft);
  color: #B95316;
  padding: 6px 9px;
  font-size: 11px;
  font-weight: 850;
}

.bench-sql-shape,
.bench-preview {
  overflow: hidden;
  border: 1px solid var(--engine-line);
  border-radius: 16px;
  background: #fff;
}

.bench-sql-shape {
  margin-top: var(--engine-s-4);
}

.bench-sql-shape span {
  display: block;
  border-bottom: 1px solid var(--engine-line);
  padding: var(--engine-s-3);
}

.bench-sql-shape pre {
  margin: 0;
  overflow-x: auto;
  background: var(--engine-ink);
  color: #fff;
  padding: var(--engine-s-4);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  line-height: 1.55;
}

.bench-preview {
  margin-top: var(--engine-s-4);
}

.bench-preview > div {
  align-items: center;
  border-bottom: 1px solid var(--engine-line);
  padding: var(--engine-s-3);
}

.engine-data-table-wrap {
  overflow-x: auto;
}

.engine-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.engine-data-table th,
.engine-data-table td {
  max-width: 240px;
  border-bottom: 1px solid var(--engine-line);
  padding: 10px 12px;
  text-align: left;
  vertical-align: top;
}

.engine-data-table th {
  background: #FAF6F2;
  color: var(--engine-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  text-transform: uppercase;
}

.engine-data-table td {
  color: #2F2F2F;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  overflow-wrap: anywhere;
}

.engine-empty-state {
  display: flex;
  align-items: center;
  gap: var(--engine-s-3);
  color: var(--engine-muted);
  padding: var(--engine-s-4);
  font-size: 13px;
  font-weight: 750;
  line-height: 1.45;
}

.engine-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  background: rgba(30, 30, 30, .42);
  padding: var(--engine-s-5);
}

.engine-client-modal {
  position: relative;
  display: grid;
  width: min(100%, 1040px);
  max-height: min(860px, calc(100svh - 48px));
  overflow: auto;
  gap: var(--engine-s-5);
  border: 1px solid var(--engine-line);
  border-radius: 28px;
  background: #FFFCF8;
  padding: var(--engine-s-6);
  box-shadow: 0 32px 110px rgba(30, 30, 30, .28);
}

.engine-icon-button {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid var(--engine-line-strong);
  border-radius: 999px;
  background: #fff;
  color: var(--engine-ink);
  cursor: pointer;
}

.engine-modal-close {
  position: absolute;
  right: var(--engine-s-5);
  top: var(--engine-s-5);
}

.engine-client-modal-head {
  display: grid;
  justify-items: start;
  gap: var(--engine-s-3);
  padding-right: 52px;
}

.engine-client-modal-head span:first-child {
  color: var(--engine-muted);
  font-size: 11px;
  font-weight: 850;
  text-transform: uppercase;
}

.engine-client-modal-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--engine-s-4);
}

.engine-soft-list {
  display: grid;
  gap: var(--engine-s-3);
  margin-top: var(--engine-s-3);
}

.engine-soft-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--engine-s-3);
  border: 1px solid var(--engine-line);
  border-radius: 16px;
  background: #fff;
  padding: var(--engine-s-3);
}

.engine-soft-row strong {
  font-size: 13px;
  line-height: 1.25;
}

.engine-soft-row small {
  color: var(--engine-muted);
  font-size: 11px;
}

.engine-soft-row a,
.engine-client-modal-actions a {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  border: 1px solid var(--engine-line-strong);
  border-radius: 12px;
  background: #fff;
  color: var(--engine-ink);
  padding: 0 var(--engine-s-3);
  font-size: 12px;
  font-weight: 850;
  text-decoration: none;
}

.engine-client-modal-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--engine-s-3);
  border-top: 1px solid var(--engine-line);
  padding-top: var(--engine-s-4);
}

.engine-back:focus-visible,
.engine-refresh:focus-visible,
.engine-primary:focus-visible,
.engine-secondary:focus-visible,
.engine-ghost-button:focus-visible,
.bench-table-row:focus-visible,
.bench-domain-pill:focus-visible,
.bench-node-main:focus-visible,
.bench-node-open:focus-visible,
.bench-client-chip:focus-visible,
.engine-icon-button:focus-visible {
  outline: 3px solid rgba(240, 107, 33, .36);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .engine-primary {
    transition-duration: .01ms !important;
    transform: none !important;
  }
}

@media (max-width: 980px) {
  .engine-home-hero,
  .engine-readiness,
  .engine-home-workbench-preview,
  .bench-shell {
    grid-template-columns: 1fr;
  }

  .bench-shell {
    height: auto;
    min-height: calc(100svh - 72px);
  }

  .bench-sidebar {
    max-height: none;
  }

  .bench-main {
    overflow: visible;
  }

  .bench-overview-bar,
  .engine-home-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .engine-home,
  .engine-home-main,
  .bench-main,
  .bench-sidebar {
    padding: var(--engine-s-4);
  }

  .engine-topbar,
  .bench-topbar,
  .engine-home-workbench-preview,
  .bench-overview-bar,
  .bench-topbar-search,
  .bench-client-strip {
    align-items: stretch;
    flex-direction: column;
  }

  .bench-topbar-search {
    width: 100%;
    min-width: 0;
  }

  .engine-home-copy h1 {
    font-size: 46px;
  }

.engine-console-mini-grid,
.bench-overview-bar,
.engine-home-grid,
  .engine-readiness-grid,
  .engine-client-modal-metrics,
  .engine-client-modal-grid {
    grid-template-columns: 1fr;
  }

  .bench-linked-grid,
  .bench-related-rows,
  .bench-table-detail-grid {
    grid-template-columns: 1fr;
  }

  .engine-readiness-row {
    grid-template-columns: 28px minmax(0, 1fr);
  }

  .engine-readiness-row .engine-pill {
    grid-column: 2;
  }
}
`
