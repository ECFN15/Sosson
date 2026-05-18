import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  Database,
  FileText,
  FolderOpen,
  GitBranch,
  HardHat,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
  Table2,
  Users,
  Workflow,
  XCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { loadDocumentsSqlData } from '@/features/documents/documentSql'
import { loadLatestPrevisionnelFromSql } from '@/features/previsionnel/previsionnelSql'
import { dataSourceLabels } from '@/features/dataState'
import { isDataConnectEnabled, shouldUseDataConnectEmulator } from '@/lib/dataconnect'
import { useApp } from '@/lib/store'

type StatusRole = 'success' | 'info' | 'warning' | 'danger' | 'neutral'
type SqlProbeStatus = 'idle' | 'loading' | 'ready' | 'error' | 'skipped'

type ProbeState = {
  status: SqlProbeStatus
  error: string | null
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

type DataPreviewRow = Record<string, string | number | boolean | null>

type DataTableCatalog = {
  key: string
  name: string
  kind: 'core' | 'documents' | 'previsionnel' | 'runtime'
  storage: string
  truth: string
  countLabel: string
  countRole: StatusRole
  columns: string[]
  relations: string[]
  usedBy: string[]
  sampleRows: DataPreviewRow[]
  sqlShape: string
}

type FlowNode = {
  title: string
  subtitle: string
  role: StatusRole
  Icon: LucideIcon
}

type PageTruth = {
  title: string
  route: string
  source: string
  detail: string
  status: StatusRole
  Icon: LucideIcon
  evidence: string
}

const initialProbe: ProbeState = {
  status: 'idle',
  error: null,
  documents: null,
  previsionnel: null,
}

function StatusPill({ role, children }: { role: StatusRole; children: React.ReactNode }) {
  return (
    <span className="engine-pill" data-role={role}>
      {children}
    </span>
  )
}

function MetricCard({
  label,
  value,
  detail,
  role = 'neutral',
}: {
  label: string
  value: string
  detail: string
  role?: StatusRole
}) {
  return (
    <article className="engine-metric" data-role={role}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  )
}

function EngineNode({ node, index }: { node: FlowNode; index: number }) {
  const Icon = node.Icon
  return (
    <li className="engine-node" data-role={node.role}>
      <span className="engine-node-index">{String(index + 1).padStart(2, '0')}</span>
      <span className="engine-node-icon">
        <Icon size={20} strokeWidth={1.8} />
      </span>
      <span>
        <strong>{node.title}</strong>
        <small>{node.subtitle}</small>
      </span>
    </li>
  )
}

function PageTile({ page }: { page: PageTruth }) {
  const Icon = page.Icon
  return (
    <article className="engine-page-tile" data-role={page.status}>
      <div className="engine-page-tile-head">
        <span>
          <Icon size={19} strokeWidth={1.8} />
        </span>
        <StatusPill role={page.status}>{page.source}</StatusPill>
      </div>
      <h3>{page.title}</h3>
      <p>{page.detail}</p>
      <footer>
        <code>{page.route}</code>
        <small>{page.evidence}</small>
      </footer>
    </article>
  )
}

function DataPreviewTable({ rows }: { rows: DataPreviewRow[] }) {
  const columns = useMemo(() => {
    const keys = new Set<string>()
    for (const row of rows) {
      Object.keys(row).forEach(key => keys.add(key))
    }
    return [...keys].slice(0, 7)
  }, [rows])

  if (!rows.length || !columns.length) {
    return (
      <div className="engine-empty-state">
        <CircleDashed size={18} strokeWidth={1.9} />
        Aucune ligne chargee dans le navigateur pour cet objet. Cela ne veut pas dire que la table SQL est absente:
        la page n'a simplement pas de lignes a afficher ici.
      </div>
    )
  }

  return (
    <div className="engine-data-table-wrap">
      <table className="engine-data-table">
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${index}-${Object.values(row).join('-')}`}>
              {columns.map(column => (
                <td key={column}>{String(row[column] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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

export function SossonEngineRoomPage() {
  const { operationalDataState, isDataConnectLoading, user } = useApp()
  const [probe, setProbe] = useState<ProbeState>(initialProbe)
  const [selectedTableKey, setSelectedTableKey] = useState('client')
  const [tableFilter, setTableFilter] = useState('')

  const refreshSqlProbe = useCallback(async () => {
    if (!isDataConnectEnabled) {
      setProbe({ ...initialProbe, status: 'skipped' })
      return
    }

    setProbe(prev => ({ ...prev, status: 'loading', error: null }))
    try {
      const [documents, previsionnel] = await Promise.all([
        loadDocumentsSqlData(),
        loadLatestPrevisionnelFromSql(),
      ])

      setProbe({
        status: 'ready',
        error: null,
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
      })
    }
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refreshSqlProbe()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [refreshSqlProbe])

  const sourceRole: StatusRole =
    operationalDataState.source === 'dataconnect'
      ? 'success'
      : operationalDataState.source === 'excel'
        ? 'warning'
        : 'neutral'

  const flowNodes: FlowNode[] = useMemo(
    () => [
      {
        title: 'Firebase Auth',
        subtitle: user ? `Session ${user.role}` : 'Session requise',
        role: user ? 'success' : 'warning',
        Icon: LockKeyhole,
      },
      {
        title: 'Profil SQL User',
        subtitle: 'GetCurrentUser puis fallback Firestore transitoire',
        role: user ? 'info' : 'warning',
        Icon: ShieldCheck,
      },
      {
        title: 'Adapters metier',
        subtitle: 'src/features transforme SQL vers UI',
        role: 'success',
        Icon: Workflow,
      },
      {
        title: 'Tables operationnelles',
        subtitle: `${operationalDataState.data.clients.length} clients, ${operationalDataState.data.chantiers.length} chantiers, ${operationalDataState.data.factures.length} factures`,
        role: sourceRole,
        Icon: Database,
      },
      {
        title: 'Pages React',
        subtitle: 'Les ecrans consomment hooks/store, pas SQL direct',
        role: 'success',
        Icon: LayoutDashboard,
      },
      {
        title: 'Fallbacks explicites',
        subtitle: operationalDataState.hasUnsyncedLocalChanges ? 'Donnees locales encore visibles' : 'Flux SQL synchronise',
        role: operationalDataState.hasUnsyncedLocalChanges ? 'warning' : 'success',
        Icon: GitBranch,
      },
    ],
    [operationalDataState, sourceRole, user],
  )

  const pageTruths: PageTruth[] = useMemo(
    () => [
      {
        title: 'Dashboard',
        route: '/dashboard',
        source: operationalDataState.source === 'dataconnect' ? 'SQL + calculs' : 'Store hybride',
        detail: 'Lit les clients, chantiers et factures via useOperationalData; les indicateurs sont calcules cote front.',
        status: operationalDataState.source === 'dataconnect' ? 'success' : 'warning',
        Icon: LayoutDashboard,
        evidence: 'src/pages/DashboardPage.tsx',
      },
      {
        title: 'Clients',
        route: '/clients',
        source: operationalDataState.source === 'dataconnect' ? 'SQL lu par le front' : 'Excel/local visible',
        detail: 'Affiche les clients operationnels lus dans cette session. Ce n est pas un comptage sandbox distant.',
        status: operationalDataState.source === 'dataconnect' ? 'success' : 'warning',
        Icon: Users,
        evidence: 'src/features/operations/useOperationalData.ts',
      },
      {
        title: 'Chantiers',
        route: '/chantiers',
        source: operationalDataState.source === 'dataconnect' ? 'SQL lu par le front' : 'Excel/local visible',
        detail: 'Filtre SQL attendu sur origineImport=operationnel. Les prev-chantier-* restent un fallback/historique, pas un actif prouve sandbox.',
        status: operationalDataState.source === 'dataconnect' ? 'success' : 'warning',
        Icon: HardHat,
        evidence: 'dataconnect/sosson/queries.gql',
      },
      {
        title: 'Factures',
        route: '/factures',
        source: operationalDataState.source === 'dataconnect' ? 'SQL lu par le front' : 'Brouillon local',
        detail: 'Les creations/statuts passent par adapter SQL si la source est SQL; sinon le state React garde un fallback visible.',
        status: operationalDataState.source === 'dataconnect' ? 'success' : 'warning',
        Icon: FileText,
        evidence: 'src/features/factures/factureSql.ts',
      },
      {
        title: 'Documents',
        route: '/documents',
        source: probe.status === 'ready' ? 'SQL metadata lue' : 'Hybride',
        detail: 'SQL garde les metadonnees lues ici; le flux Storage fichier et la validation sandbox restent a finaliser.',
        status: probe.status === 'ready' ? 'info' : 'warning',
        Icon: FolderOpen,
        evidence: 'src/features/documents/documentSql.ts',
      },
      {
        title: 'Previsionnel',
        route: '/previsionnel',
        source: probe.previsionnel ? 'SQL lu local/session' : 'Fallback TS/localStorage',
        detail: 'Les exercices, lignes, montants et cellules modifiees sont lus quand SQL repond; cela ne valide pas le seed sandbox reel.',
        status: probe.previsionnel ? 'info' : 'warning',
        Icon: Table2,
        evidence: 'src/features/previsionnel/previsionnelSql.ts',
      },
      {
        title: 'Emails',
        route: '/emails',
        source: 'Preuve locale',
        detail: 'Microsoft Graph est valide localement, mais le backend produit securise reste a construire.',
        status: 'warning',
        Icon: Mail,
        evidence: 'docs/11-outlook-graph-email.md',
      },
      {
        title: 'Equipe / roles',
        route: '/equipe',
        source: 'UI locale',
        detail: 'La matrice localStorage peut restreindre l UI, mais ne doit jamais accorder un droit serveur.',
        status: 'warning',
        Icon: ShieldCheck,
        evidence: 'src/lib/accessControl.ts',
      },
    ],
    [operationalDataState.source, probe.previsionnel, probe.status],
  )

  const tableCatalog: DataTableCatalog[] = useMemo(() => {
    const clients = operationalDataState.data.clients
    const chantiers = operationalDataState.data.chantiers
    const factures = operationalDataState.data.factures
    const sourceIsSql = operationalDataState.source === 'dataconnect'
    const sourceLabel = sourceIsSql ? 'lignes SQL lues par le front' : `lignes visibles depuis ${dataSourceLabels[operationalDataState.source]}`

    return [
      {
        key: 'user',
        name: 'User',
        kind: 'core',
        storage: 'PostgreSQL via SQL Connect',
        truth: 'Profil applicatif cible. id = Firebase Auth UID. Pas seede par seed metier.',
        countLabel: user ? '1 profil en session front' : 'non charge',
        countRole: user ? 'info' : 'warning',
        columns: ['id String', 'email varchar(254)', 'nom varchar(80)', 'prenom varchar(80)', 'role varchar(32)', 'avatar varchar(8)'],
        relations: ['User 0..N Chantier via chefChantier', 'Mutations sensibles relisent User(id = auth.uid)'],
        usedBy: ['src/features/auth/sqlUserProfile.ts', 'dataconnect/sosson/mutations.gql'],
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
        kind: 'core',
        storage: 'PostgreSQL via SQL Connect; fallback Excel/seed dans le front',
        truth: `Table donneur d'ordre. Les listes operationnelles SQL filtrent origineImport = "operationnel"; ici ${sourceLabel}.`,
        countLabel: `${clients.length} visibles`,
        countRole: sourceIsSql ? 'success' : 'warning',
        columns: ['origineImport varchar(32)', 'type varchar(32)', 'nom varchar(200)', 'email varchar(254)', 'telephone', 'ville', 'codePostal', 'dateCreation'],
        relations: ['Client 1..N Chantier', 'Client 1..N ClientAlias', 'Client 1..N PrevisionnelLine', 'Client 1..N DocumentAttache'],
        usedBy: ['ListOperationalClients', 'ClientsPage', 'DashboardPage', 'ChantiersPage'],
        sampleRows: clients.slice(0, 6).map(client => ({
          id: client.id,
          nom: client.nom,
          type: client.type,
          ville: client.ville,
          chantiers: client.chantierIds.length,
        })),
        sqlShape: 'clients(where: { origineImport: { eq: "operationnel" } }, orderBy: { nom: ASC }, limit: 1000)',
      },
      {
        key: 'chantier',
        name: 'Chantier',
        kind: 'core',
        storage: 'PostgreSQL via SQL Connect; fallback Excel/seed dans le front',
        truth: `Dossier operationnel rattache a un client. depensesEngagees et tendance sont calculees dans l adapter depuis les factures; ici ${sourceLabel}.`,
        countLabel: `${chantiers.length} visibles`,
        countRole: sourceIsSql ? 'success' : 'warning',
        columns: ['origineImport varchar(32)', 'clientId UUID', 'chefChantierId String', 'nom', 'statut', 'dateDebut', 'dateFinPrevue', 'budgetPrevisionnel'],
        relations: ['Chantier N..1 Client', 'Chantier 0..N Facture', 'Chantier 0..N DocumentAttache', 'Chantier 0..N PrevisionnelLine'],
        usedBy: ['ListOperationalChantiers', 'ChantiersPage', 'FacturesPage', 'DocumentsPage'],
        sampleRows: chantiers.slice(0, 6).map(chantier => ({
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
        key: 'facture',
        name: 'Facture',
        kind: 'core',
        storage: 'PostgreSQL via SQL Connect; ajout local possible si SQL indisponible',
        truth: `Facture fournisseur rattachee a un chantier. ListFactures ne filtre pas origineImport directement; elle suit la relation chantier.`,
        countLabel: `${factures.length} visibles`,
        countRole: sourceIsSql ? 'success' : 'warning',
        columns: ['chantierId UUID', 'fournisseur', 'numeroFacture', 'montantHT numeric', 'tva numeric', 'montantTTC numeric', 'date', 'categorie', 'statut'],
        relations: ['Facture N..1 Chantier', 'Facture 0..N DocumentAttache'],
        usedBy: ['ListFactures', 'FacturesPage', 'DashboardPage', 'ChantierDetailPage'],
        sampleRows: factures.slice(0, 6).map(facture => ({
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
        kind: 'documents',
        storage: 'PostgreSQL metadata',
        truth: 'Dossier logique. Ne contient pas le binaire du fichier.',
        countLabel: probe.documents ? `${probe.documents.folders} SQL` : 'pas interroge ici',
        countRole: probe.documents ? 'info' : 'warning',
        columns: ['nom', 'slug', 'parentId', 'clientId', 'chantierId', 'description', 'dateCreation'],
        relations: ['DocumentFolder 0..N DocumentFolder enfant', 'DocumentFolder 0..N DocumentAttache'],
        usedBy: ['DocumentsPage', 'src/features/documents/documentSql.ts'],
        sampleRows: [],
        sqlShape: 'documentFolders(orderBy: { nom: ASC }) { id nom slug parent { id } client { id } chantier { id } }',
      },
      {
        key: 'documentAttache',
        name: 'DocumentAttache',
        kind: 'documents',
        storage: 'PostgreSQL metadata + Firebase Storage pour le fichier',
        truth: 'La table sait classer un fichier; Storage doit prouver que le fichier existe vraiment.',
        countLabel: probe.documents ? `${probe.documents.attaches} SQL` : 'pas interroge ici',
        countRole: probe.documents ? 'info' : 'warning',
        columns: ['folderId', 'clientId', 'chantierId', 'factureId', 'nomFichier', 'storagePath', 'mimeType', 'tailleBytes', 'typeDocument', 'statut', 'source'],
        relations: ['DocumentAttache N..0/1 Client', 'DocumentAttache N..0/1 Chantier', 'DocumentAttache N..0/1 Facture'],
        usedBy: ['DocumentsPage', 'CreateDocumentAttache', 'UpdateDocumentAttacheLinks'],
        sampleRows: probe.documents?.sample ?? [],
        sqlShape: 'documentAttaches(orderBy: { dateCreation: DESC }, limit: 1000) { storagePath folder client chantier facture }',
      },
      {
        key: 'previsionnelExercise',
        name: 'PrevisionnelExercise',
        kind: 'previsionnel',
        storage: 'PostgreSQL via seed genere depuis Excel',
        truth: 'Un exercice correspond a un onglet/periode du classeur. Les compteurs lineCount/chantierCount servent de metadata de controle.',
        countLabel: probe.previsionnel ? `${probe.previsionnel.exercises} exercices` : 'pas interroge ici',
        countRole: probe.previsionnel ? 'info' : 'warning',
        columns: ['batchId', 'sheet', 'exercise', 'startYear', 'endYear', 'lineCount', 'chantierCount', 'caPrevision', 'plannedTotal'],
        relations: ['PrevisionnelExercise N..1 PrevisionnelImportBatch', 'PrevisionnelExercise 1..N PrevisionnelLine'],
        usedBy: ['PrevisionnelSpreadsheetPage', 'StatistiquesPage', 'verify:previsionnel:dataconnect'],
        sampleRows: probe.previsionnel?.exerciseSample ?? [],
        sqlShape: 'previsionnelExercises(orderBy: { exercise: ASC }) { exercise sheet lineCount chantierCount caPrevision }',
      },
      {
        key: 'previsionnelLine',
        name: 'PrevisionnelLine',
        kind: 'previsionnel',
        storage: 'PostgreSQL via seed Excel; edition partielle depuis tableur web',
        truth: 'Une ligne du tableur conserve sourceSheet + sourceRow + montants. La query courante charge par exercice avec limite 300.',
        countLabel: probe.previsionnel ? `${probe.previsionnel.latestLinesLoaded} lignes latest chargees` : 'pas interroge ici',
        countRole: probe.previsionnel ? 'info' : 'warning',
        columns: ['exerciseId', 'clientId', 'chantierId', 'sourceSheet', 'sourceRow', 'rawName', 'clientName', 'lineType', 'caTce', 'plannedTotal', 'invoicedTotal'],
        relations: ['PrevisionnelLine N..1 PrevisionnelExercise', 'PrevisionnelLine N..1 Client', 'PrevisionnelLine 0..1 Chantier'],
        usedBy: ['ListPrevisionnelLinesByExercise', 'UpdatePrevisionnelLineAmounts', 'StatistiquesPage'],
        sampleRows: probe.previsionnel?.lineSample ?? [],
        sqlShape: 'previsionnelLines(where: { exerciseId: { eq: $exerciseId } }, orderBy: { sourceRow: ASC }, limit: 300)',
      },
      {
        key: 'previsionnelMonthlyAmount',
        name: 'PrevisionnelMonthlyAmount',
        kind: 'previsionnel',
        storage: 'PostgreSQL enfant de PrevisionnelLine',
        truth: 'Stocke les montants mensuels. invoiceSent vient du jaune Excel: facture envoyee, pas paiement encaisse.',
        countLabel: probe.previsionnel ? 'charge imbrique dans les lignes' : 'pas interroge ici',
        countRole: probe.previsionnel ? 'info' : 'warning',
        columns: ['lineId', 'month', 'label', 'monthOrder', 'planned', 'realized', 'invoiceSent'],
        relations: ['PrevisionnelMonthlyAmount N..1 PrevisionnelLine'],
        usedBy: ['PrevisionnelSpreadsheetPage', 'UpdatePrevisionnelMonthlyAmount'],
        sampleRows: [],
        sqlShape: 'monthly { id month label monthOrder planned realized invoiceSent }',
      },
      {
        key: 'previsionnelLotAmount',
        name: 'PrevisionnelLotAmount',
        kind: 'previsionnel',
        storage: 'PostgreSQL enfant de PrevisionnelLine',
        truth: 'Ventilation par lot / corps d etat issue du classeur.',
        countLabel: probe.previsionnel ? 'charge imbrique dans les lignes' : 'pas interroge ici',
        countRole: probe.previsionnel ? 'info' : 'warning',
        columns: ['lineId', 'lotKey', 'label', 'amount'],
        relations: ['PrevisionnelLotAmount N..1 PrevisionnelLine'],
        usedBy: ['StatistiquesPage', 'PrevisionnelSpreadsheetPage'],
        sampleRows: [],
        sqlShape: 'lots { id lotKey label amount }',
      },
      {
        key: 'previsionnelCellEdit',
        name: 'PrevisionnelCellEdit',
        kind: 'previsionnel',
        storage: 'PostgreSQL override cellule exacte',
        truth: 'Garde les modifications cellule par cellule pour reconstruire le tableur web et l export.',
        countLabel: 'lu par feuille, pas compte global ici',
        countRole: 'neutral',
        columns: ['id String', 'sourceSheet', 'cellRef', 'valueText', 'numericValue', 'dateModification'],
        relations: ['Reference logique sourceSheet + cellRef, pas FK vers ligne'],
        usedBy: ['ListPrevisionnelCellEdits', 'UpsertPrevisionnelCellEdit'],
        sampleRows: [],
        sqlShape: 'previsionnelCellEdits(where: { sourceSheet: { eq: $sourceSheet } }, limit: 10000)',
      },
      {
        key: 'checkpointArtifacts',
        name: 'Checkpoint / audit artifacts',
        kind: 'runtime',
        storage: 'Fichiers repo/tmp pour les preuves lourdes + index SQL local prouve en emulateur',
        truth: 'Les gros logs et fichiers restent en artefacts. L index SQL append-only des runs, etapes, preuves, decisions, imports et audit est prouve en emulateur local, pas en sandbox distante.',
        countLabel: 'non interroge depuis cette page',
        countRole: 'warning',
        columns: ['CheckpointRun', 'CheckpointStep', 'CheckpointArtifact', 'CheckpointDecision', 'DataImportRun', 'AuditEvent', 'AnalyticsSnapshot', 'tmp/checkpoint-002/*.json'],
        relations: ['CheckpointRun -> steps/artifacts/decisions', 'DataImportRun -> issues', 'EntityChangeLog -> audit/checkpoint/import'],
        usedBy: ['npm run checkpoint:002:local', 'npm run checkpoint:002:emulator', 'npm run verify:operational-boundary:dataconnect', 'npm run snapshot:analytics:dataconnect', 'npm run verify:checkpoint-audit:dataconnect'],
        sampleRows: [
          { artifact: 'seed_data.gql', form: 'GraphQL mutation', mutates: 'local ou sandbox seulement si action reelle validee' },
          { artifact: 'previsionnel_seed/*.gql', form: '113 chunks GraphQL', mutates: 'local ou sandbox seulement si action reelle validee' },
          { artifact: 'tmp/checkpoint-002/*.json', form: 'preuves ignorees git', mutates: 'non' },
        ],
        sqlShape: 'ListCheckpointRuns / GetCheckpointRun / ListDataImportRuns / ListRecentAuditEvents',
      },
    ]
  }, [operationalDataState, probe.documents, probe.previsionnel, user])

  const selectedTable = tableCatalog.find(table => table.key === selectedTableKey) ?? tableCatalog[0]
  const filteredTableCatalog = useMemo(() => {
    const filter = tableFilter.trim().toLowerCase()
    if (!filter) return tableCatalog

    return tableCatalog.filter(table => {
      const haystack = [
        table.name,
        table.kind,
        table.storage,
        table.truth,
        table.countLabel,
        table.columns.join(' '),
        table.relations.join(' '),
        table.usedBy.join(' '),
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(filter)
    })
  }, [tableCatalog, tableFilter])

  const sqlMode = shouldUseDataConnectEmulator ? 'Emulateur local en dev sandbox' : 'Service Firebase SQL Connect'
  const totalOperationalRows =
    operationalDataState.data.clients.length +
    operationalDataState.data.chantiers.length +
    operationalDataState.data.factures.length
  const liveScore = [
    operationalDataState.source === 'dataconnect',
    probe.status === 'ready',
    !operationalDataState.hasUnsyncedLocalChanges,
    user !== null,
  ].filter(Boolean).length

  return (
    <div className="engine-room">
      <style>{engineRoomCss}</style>

      <header className="engine-hero">
        <nav className="engine-topbar" aria-label="Navigation moteur Sosson">
          <Link className="engine-back" to="/dashboard">
            <ArrowLeft size={18} strokeWidth={1.9} />
            Retour dashboard
          </Link>
          <div className="engine-topbar-actions">
            <StatusPill role={isDataConnectEnabled ? 'success' : 'neutral'}>
              {isDataConnectEnabled ? 'SQL Connect active' : 'SQL Connect off'}
            </StatusPill>
            <button className="engine-refresh" type="button" onClick={() => void refreshSqlProbe()} disabled={probe.status === 'loading'}>
              <RefreshCw size={17} strokeWidth={1.9} />
              Relire SQL
            </button>
          </div>
        </nav>

        <section className="engine-hero-grid">
          <div className="engine-hero-copy">
            <StatusPill role={sourceRole}>Source operationnelle: {dataSourceLabels[operationalDataState.source]}</StatusPill>
            <h1>Le moteur vivant de Sosson.</h1>
            <p>
              Cette page montre ce que le front sait vraiment lire maintenant: les tables operationnelles, les flux SQL Connect,
              les fallbacks locaux et les pieces encore a valider en sandbox.
            </p>
          </div>

          <div className="engine-core-card" aria-label="Carte du moteur de donnees Sosson">
            <div className="engine-core-orbit">
              <span data-node="auth">Auth</span>
              <span data-node="sql">SQL</span>
              <span data-node="ui">UI</span>
              <span data-node="fallback">Fallback</span>
            </div>
            <div className="engine-core-center">
              <Database size={38} strokeWidth={1.7} />
              <strong>{totalOperationalRows}</strong>
              <span>lignes metier visibles</span>
            </div>
            <div className="engine-core-footer">
              <StatusPill role={probeStatusRole(probe.status)}>{probeStatusLabel(probe.status)}</StatusPill>
              <small>{sqlMode}</small>
            </div>
          </div>
        </section>
      </header>

      <main className="engine-main">
        <section className="engine-progress" aria-label="Progression de validation">
          {[
            ['Session', user ? 'OK' : 'A verifier', user ? 'success' : 'warning'],
            ['Store', isDataConnectLoading ? 'loading' : operationalDataState.status, sourceRole],
            ['SQL probe', probe.status, probeStatusRole(probe.status)],
            ['Score live', `${liveScore}/4`, liveScore >= 3 ? 'success' : 'warning'],
          ].map(([label, value, role]) => (
            <div key={label} className="engine-progress-step" data-role={role}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </section>

        {probe.error ? (
          <section className="engine-alert" role="status">
            <AlertTriangle size={22} strokeWidth={1.9} />
            <div>
              <strong>Lecture SQL partielle</strong>
              <p>{probe.error}</p>
            </div>
          </section>
        ) : null}

        <section className="engine-console" aria-label="Console schema et tables Sosson">
          <aside className="engine-console-rail">
            <div className="engine-console-title">
              <span>Catalogue SQL</span>
              <strong>{filteredTableCatalog.length}/{tableCatalog.length} objets</strong>
              <label className="engine-console-search">
                <span>Filtre</span>
                <input
                  value={tableFilter}
                  onChange={event => setTableFilter(event.target.value)}
                  placeholder="table, colonne, source..."
                />
              </label>
            </div>
            <div className="engine-console-tabs" role="listbox" aria-label="Tables et artefacts">
              {filteredTableCatalog.map(table => (
                <button
                  key={table.key}
                  type="button"
                  className="engine-table-tab"
                  data-selected={selectedTable.key === table.key}
                  onClick={() => setSelectedTableKey(table.key)}
                >
                  <span>
                    <Database size={15} strokeWidth={1.8} />
                    {table.name}
                  </span>
                  <StatusPill role={table.countRole}>{table.countLabel}</StatusPill>
                </button>
              ))}
              {filteredTableCatalog.length === 0 ? (
                <div className="engine-empty-filter">
                  Aucun objet ne correspond au filtre. Essaie `client`, `previsionnel`, `storage` ou `checkpoint`.
                </div>
              ) : null}
            </div>
          </aside>

          <section className="engine-console-main">
            <div className="engine-console-toolbar">
              <div>
                <span className="engine-console-kicker">{selectedTable.kind}</span>
                <h2>{selectedTable.name}</h2>
                <p>{selectedTable.truth}</p>
              </div>
              <StatusPill role={selectedTable.countRole}>{selectedTable.storage}</StatusPill>
            </div>

            <div className="engine-schema-grid">
              <article className="engine-schema-card">
                <h3>Colonnes connues</h3>
                <div className="engine-column-list">
                  {selectedTable.columns.map(column => (
                    <code key={column}>{column}</code>
                  ))}
                </div>
              </article>

              <article className="engine-schema-card">
                <h3>Relations</h3>
                <ul>
                  {selectedTable.relations.map(relation => (
                    <li key={relation}>{relation}</li>
                  ))}
                </ul>
              </article>

              <article className="engine-schema-card">
                <h3>Utilise par</h3>
                <ul>
                  {selectedTable.usedBy.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>

            <div className="engine-sql-shape">
              <div>
                <span>Forme de lecture / stockage</span>
                <button type="button" onClick={() => void refreshSqlProbe()} disabled={probe.status === 'loading'}>
                  <RefreshCw size={14} strokeWidth={1.9} />
                  relire
                </button>
              </div>
              <pre>{selectedTable.sqlShape}</pre>
            </div>

            <div className="engine-preview-panel">
              <div className="engine-preview-head">
                <div>
                  <span>Preview rows</span>
                  <h3>Lignes visibles dans le navigateur</h3>
                </div>
                <StatusPill role={selectedTable.sampleRows.length ? 'success' : 'neutral'}>
                  {selectedTable.sampleRows.length ? `${selectedTable.sampleRows.length} exemples` : 'aucun exemple'}
                </StatusPill>
              </div>
              <DataPreviewTable rows={selectedTable.sampleRows} />
            </div>
          </section>
        </section>

        <section className="engine-grid">
          <div className="engine-panel engine-panel-large">
            <div className="engine-section-head">
              <span>Flux principal</span>
              <h2>Comment une page recoit ses donnees</h2>
              <p>Le navigateur ne parle jamais directement a PostgreSQL. Il passe par Auth, Data Connect, les adapters, puis le store.</p>
            </div>
            <ol className="engine-flow">
              {flowNodes.map((node, index) => (
                <EngineNode key={node.title} node={node} index={index} />
              ))}
            </ol>
          </div>

          <aside className="engine-panel">
            <div className="engine-section-head">
              <span>Live snapshot</span>
              <h2>Ce que l'app voit</h2>
              <p>Ces compteurs viennent du store et des lectures SQL tentees par cette page.</p>
            </div>
            <div className="engine-metrics">
              <MetricCard label="Clients" value={String(operationalDataState.data.clients.length)} detail="Store operationnel" role={sourceRole} />
              <MetricCard label="Chantiers" value={String(operationalDataState.data.chantiers.length)} detail="Store operationnel" role={sourceRole} />
              <MetricCard label="Factures" value={String(operationalDataState.data.factures.length)} detail="Store operationnel" role={sourceRole} />
              <MetricCard
                label="Documents SQL"
                value={probe.documents ? String(probe.documents.attaches) : 'N/A'}
                detail={probe.documents ? `${probe.documents.folders} dossiers` : 'pas interroge depuis cette page'}
                role={probe.documents ? 'info' : 'warning'}
              />
              <MetricCard
                label="Exercices"
                value={probe.previsionnel ? String(probe.previsionnel.exercises) : 'N/A'}
                detail={probe.previsionnel?.latestExercise ?? 'previsionnel pas interroge ici'}
                role={probe.previsionnel ? 'info' : 'warning'}
              />
              <MetricCard
                label="Lignes latest"
                value={probe.previsionnel ? String(probe.previsionnel.latestLinesLoaded) : 'N/A'}
                detail={probe.previsionnel ? `${probe.previsionnel.expectedLines} attendues au total` : 'pas interroge depuis cette page'}
                role={probe.previsionnel ? 'info' : 'warning'}
              />
            </div>
          </aside>
        </section>

        <section className="engine-panel">
          <div className="engine-section-head engine-section-head-row">
            <div>
              <span>Pages du site</span>
              <h2>Qui vit sur quelle source ?</h2>
            </div>
            <p>
              Vert = le front lit SQL Connect dans la session courante. Orange = source hybride ou fallback local. Bleu = SQL partiel; cela ne prouve pas une sandbox distante seedee.
            </p>
          </div>
          <div className="engine-page-grid">
            {pageTruths.map(page => (
              <PageTile key={page.title} page={page} />
            ))}
          </div>
        </section>

        <section className="engine-grid engine-grid-bottom">
          <div className="engine-panel">
            <div className="engine-section-head">
              <span>Contrat de verite</span>
              <h2>Ce que cette page affirme</h2>
            </div>
            <ul className="engine-audit-list">
              <li>
                <CheckCircle2 size={18} />
                Les compteurs clients/chantiers/factures viennent de `operationalDataState`.
              </li>
              <li>
                <CheckCircle2 size={18} />
                Les documents et le previsionnel sont tentes via les adapters SQL existants.
              </li>
              <li>
                <AlertTriangle size={18} />
                Une sandbox non seedee ou un emulateur coupe apparait comme lecture indisponible.
              </li>
              <li>
                <XCircle size={18} />
                Cette page ne prouve pas le deploy production et ne lance aucune mutation.
              </li>
            </ul>
          </div>

          <div className="engine-panel">
            <div className="engine-section-head">
              <span>Checkpoint 002</span>
              <h2>Ce qui reste a prouver</h2>
            </div>
            <div className="engine-proof-stack">
              {[
                ['Seed sandbox reel', 'Non lance depuis cette page', 'warning'],
                ['Profils SQL User reels', 'Provisioning humain requis', 'warning'],
                ['RBAC sandbox', 'A tester avec vrais roles', 'warning'],
                ['Storage fichiers', 'Metadata oui, upload signe a finaliser', 'info'],
              ].map(([title, detail, role]) => (
                <div key={title} className="engine-proof" data-role={role}>
                  <CircleDashed size={18} strokeWidth={1.9} />
                  <span>
                    <strong>{title}</strong>
                    <small>{detail}</small>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
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
  --engine-shadow-card: 0 6px 0 #1E1E1E;
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
  background:
    linear-gradient(135deg, rgba(240, 107, 33, .10), transparent 28%),
    radial-gradient(circle at 86% 12%, rgba(30, 30, 30, .08), transparent 24%),
    var(--engine-canvas);
  color: var(--engine-ink);
  font-family: Inter, system-ui, sans-serif;
}

.engine-hero,
.engine-main {
  width: min(100%, 1480px);
  margin: 0 auto;
  padding: var(--engine-s-6);
}

.engine-topbar,
.engine-topbar-actions,
.engine-back,
.engine-refresh {
  display: flex;
  align-items: center;
}

.engine-topbar {
  justify-content: space-between;
  gap: var(--engine-s-4);
}

.engine-topbar-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--engine-s-3);
}

.engine-back,
.engine-refresh {
  min-height: 44px;
  gap: var(--engine-s-2);
  border: 1px solid var(--engine-ink);
  border-radius: var(--engine-radius-pill);
  background: var(--engine-surface);
  color: var(--engine-ink);
  padding: 0 var(--engine-s-4);
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 4px 0 var(--engine-ink);
  transform: translateY(0);
  transition: transform 160ms var(--engine-ease), box-shadow 160ms var(--engine-ease);
}

.engine-refresh {
  cursor: pointer;
}

.engine-refresh:disabled {
  cursor: wait;
  opacity: .58;
}

.engine-back:hover,
.engine-refresh:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 5px 0 var(--engine-ink);
}

.engine-back:active,
.engine-refresh:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: 0 1px 0 var(--engine-ink);
}

.engine-back:focus-visible,
.engine-refresh:focus-visible,
.engine-page-tile:focus-within {
  outline: 3px solid rgba(240, 107, 33, .35);
  outline-offset: 3px;
}

.engine-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, .95fr) minmax(360px, 1.05fr);
  align-items: center;
  gap: clamp(28px, 5vw, 72px);
  padding: clamp(42px, 7vw, 92px) 0 var(--engine-s-6);
}

.engine-hero-copy {
  display: grid;
  justify-items: start;
  gap: var(--engine-s-5);
}

.engine-hero-copy h1 {
  max-width: 11ch;
  margin: 0;
  font-size: clamp(48px, 7vw, 104px);
  font-weight: 850;
  line-height: .92;
  letter-spacing: 0;
  text-wrap: balance;
}

.engine-hero-copy p {
  max-width: 68ch;
  margin: 0;
  color: #3C3C3C;
  font-size: 17px;
  line-height: 1.7;
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

.engine-core-card {
  position: relative;
  min-height: 520px;
  overflow: hidden;
  border: 2px solid var(--engine-ink);
  border-radius: 32px;
  background:
    linear-gradient(135deg, rgba(255, 244, 236, .98), rgba(255,255,255,.96)),
    var(--engine-surface);
  box-shadow: var(--engine-shadow-card), var(--engine-shadow-soft);
}

.engine-core-orbit {
  position: absolute;
  inset: 30px;
  border: 1px dashed rgba(30, 30, 30, .24);
  border-radius: 30px;
}

.engine-core-orbit span {
  position: absolute;
  display: grid;
  min-width: 94px;
  min-height: 46px;
  place-items: center;
  border: 1px solid var(--engine-ink);
  border-radius: 999px;
  background: #fff;
  color: var(--engine-ink);
  font-size: 12px;
  font-weight: 850;
  box-shadow: 0 4px 0 var(--engine-ink);
}

.engine-core-orbit [data-node='auth'] { left: 7%; top: 8%; }
.engine-core-orbit [data-node='sql'] { right: 9%; top: 20%; background: #ECFDF5; }
.engine-core-orbit [data-node='ui'] { right: 14%; bottom: 10%; background: #EEF4FF; }
.engine-core-orbit [data-node='fallback'] { left: 8%; bottom: 19%; background: #FFFBEB; }

.engine-core-center {
  position: absolute;
  left: 50%;
  top: 48%;
  display: grid;
  width: min(58%, 280px);
  aspect-ratio: 1;
  place-items: center;
  align-content: center;
  gap: var(--engine-s-2);
  border: 2px solid var(--engine-ink);
  border-radius: 50%;
  background: var(--engine-ink);
  color: white;
  transform: translate(-50%, -50%);
}

.engine-core-center svg {
  color: var(--engine-action);
}

.engine-core-center strong {
  font-size: clamp(52px, 8vw, 92px);
  line-height: .85;
}

.engine-core-center span {
  width: min(100%, 150px);
  text-align: center;
  color: rgba(255, 255, 255, .76);
  font-size: 13px;
  font-weight: 750;
}

.engine-core-footer {
  position: absolute;
  left: var(--engine-s-6);
  right: var(--engine-s-6);
  bottom: var(--engine-s-6);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--engine-s-3);
  border-radius: var(--engine-radius-card);
  background: rgba(255, 255, 255, .82);
  padding: var(--engine-s-4);
}

.engine-core-footer small {
  color: var(--engine-muted);
  font-size: 12px;
  font-weight: 750;
}

.engine-main {
  display: grid;
  gap: var(--engine-s-6);
  padding-top: 0;
  padding-bottom: var(--engine-s-8);
}

.engine-progress {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--engine-s-3);
}

.engine-progress-step {
  display: grid;
  min-height: 86px;
  align-content: center;
  gap: var(--engine-s-2);
  border: 1px solid var(--engine-line);
  border-radius: var(--engine-radius-card);
  background: var(--engine-surface);
  padding: var(--engine-s-4);
}

.engine-progress-step span,
.engine-metric p,
.engine-section-head span {
  color: var(--engine-muted);
  font-size: 11px;
  font-weight: 850;
  line-height: 1.35;
  text-transform: uppercase;
}

.engine-progress-step strong {
  overflow-wrap: anywhere;
  font-size: 18px;
  line-height: 1.15;
}

.engine-progress-step[data-role='success'] { box-shadow: inset 0 -5px 0 var(--engine-success-bg); }
.engine-progress-step[data-role='info'] { box-shadow: inset 0 -5px 0 var(--engine-info-bg); }
.engine-progress-step[data-role='warning'] { box-shadow: inset 0 -5px 0 var(--engine-warning-bg); }

.engine-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, .8fr);
  gap: var(--engine-s-6);
}

.engine-panel {
  border: 1px solid var(--engine-line);
  border-radius: var(--engine-radius-panel);
  background: rgba(255, 255, 255, .92);
  padding: var(--engine-s-6);
  box-shadow: 0 16px 50px rgba(30, 30, 30, .06);
}

.engine-panel-large {
  min-height: 100%;
}

.engine-section-head {
  display: grid;
  gap: var(--engine-s-3);
  margin-bottom: var(--engine-s-5);
}

.engine-section-head-row {
  grid-template-columns: minmax(0, .75fr) minmax(280px, .65fr);
  align-items: end;
}

.engine-section-head h2 {
  max-width: 18ch;
  margin: 0;
  font-size: clamp(28px, 3.6vw, 48px);
  font-weight: 850;
  line-height: 1.02;
  letter-spacing: 0;
  text-wrap: balance;
}

.engine-section-head p {
  max-width: 70ch;
  margin: 0;
  color: var(--engine-muted);
  font-size: 14px;
  line-height: 1.65;
}

.engine-flow {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--engine-s-4);
  padding: 0;
  list-style: none;
}

.engine-node {
  display: grid;
  min-height: 172px;
  gap: var(--engine-s-3);
  border: 1px solid var(--engine-ink);
  border-radius: var(--engine-radius-card);
  background: #fff;
  padding: var(--engine-s-4);
  box-shadow: 0 5px 0 var(--engine-ink);
  transition: transform 180ms var(--engine-ease), box-shadow 180ms var(--engine-ease);
}

.engine-node:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 0 var(--engine-ink);
}

.engine-node[data-role='success'] { background: var(--engine-success-bg); }
.engine-node[data-role='info'] { background: var(--engine-info-bg); }
.engine-node[data-role='warning'] { background: var(--engine-warning-bg); }

.engine-node-index {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 850;
}

.engine-node-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid var(--engine-ink);
  border-radius: 14px;
  background: white;
}

.engine-node strong,
.engine-node small {
  display: block;
}

.engine-node strong {
  font-size: 18px;
  line-height: 1.15;
}

.engine-node small {
  margin-top: var(--engine-s-2);
  color: #3C3C3C;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
}

.engine-metrics {
  display: grid;
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

.engine-metric strong {
  font-size: 32px;
  line-height: .95;
}

.engine-metric span {
  color: var(--engine-muted);
  font-size: 12px;
  font-weight: 700;
}

.engine-alert {
  display: flex;
  gap: var(--engine-s-4);
  border: 1px solid rgba(180, 83, 9, .24);
  border-radius: var(--engine-radius-panel);
  background: var(--engine-warning-bg);
  color: var(--engine-warning-fg);
  padding: var(--engine-s-5);
}

.engine-alert strong {
  display: block;
  margin-bottom: 4px;
  color: var(--engine-ink);
}

.engine-alert p {
  margin: 0;
  color: #7C4A03;
  line-height: 1.55;
}

.engine-console {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  min-height: 760px;
  overflow: hidden;
  border: 1px solid var(--engine-line);
  border-radius: var(--engine-radius-panel);
  background: #111;
  box-shadow: 0 24px 80px rgba(30, 30, 30, .14);
}

.engine-console-rail {
  display: flex;
  min-height: 0;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, .08);
  background: #1E1E1E;
  padding: var(--engine-s-4);
}

.engine-console-title {
  display: grid;
  gap: var(--engine-s-3);
  padding: 0 0 var(--engine-s-4);
}

.engine-console-title span,
.engine-console-kicker,
.engine-sql-shape span,
.engine-preview-head span {
  color: #A8A8A8;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  font-weight: 850;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.engine-console-title strong {
  color: #fff;
  font-size: 13px;
}

.engine-console-search {
  display: grid;
  gap: 6px;
}

.engine-console-search input {
  min-width: 0;
  height: 38px;
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 10px;
  background: rgba(255, 255, 255, .06);
  color: #fff;
  font: 500 13px/1.3 Inter, system-ui, sans-serif;
  outline: none;
  padding: 0 10px;
}

.engine-console-search input::placeholder {
  color: rgba(255, 255, 255, .42);
}

.engine-console-search input:focus-visible {
  border-color: rgba(240, 107, 33, .7);
  box-shadow: 0 0 0 3px rgba(240, 107, 33, .18);
}

.engine-console-tabs {
  display: grid;
  min-height: 0;
  gap: 7px;
  overflow-y: auto;
  padding-right: 2px;
}

.engine-table-tab {
  display: grid;
  gap: var(--engine-s-2);
  border: 1px solid rgba(255, 255, 255, .08);
  border-radius: 12px;
  background: rgba(255, 255, 255, .04);
  color: #fff;
  padding: 10px;
  text-align: left;
  cursor: pointer;
}

.engine-table-tab[data-selected='true'] {
  border-color: rgba(240, 107, 33, .72);
  background: rgba(240, 107, 33, .13);
  box-shadow: inset 3px 0 0 var(--engine-action);
}

.engine-table-tab:hover {
  background: rgba(255, 255, 255, .08);
}

.engine-table-tab:focus-visible {
  outline: 3px solid rgba(240, 107, 33, .35);
  outline-offset: 2px;
}

.engine-empty-filter {
  border: 1px dashed rgba(255, 255, 255, .16);
  border-radius: 12px;
  color: rgba(255, 255, 255, .68);
  font-size: 13px;
  line-height: 1.45;
  padding: 12px;
}

.engine-table-tab > span:first-child {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 800;
}

.engine-table-tab svg {
  color: var(--engine-action);
  flex: 0 0 auto;
}

.engine-console-main {
  display: grid;
  align-content: start;
  gap: var(--engine-s-4);
  background: #F8F6F2;
  padding: var(--engine-s-5);
}

.engine-console-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--engine-s-5);
  border: 1px solid var(--engine-line);
  border-radius: 16px;
  background: #fff;
  padding: var(--engine-s-5);
}

.engine-console-toolbar h2 {
  margin: 5px 0 8px;
  font-size: clamp(30px, 4vw, 56px);
  font-weight: 850;
  line-height: .98;
  letter-spacing: 0;
}

.engine-console-toolbar p {
  max-width: 92ch;
  margin: 0;
  color: #3C3C3C;
  font-size: 14px;
  line-height: 1.62;
}

.engine-schema-grid {
  display: grid;
  grid-template-columns: 1.1fr .95fr .95fr;
  gap: var(--engine-s-4);
}

.engine-schema-card {
  min-width: 0;
  border: 1px solid var(--engine-line);
  border-radius: 16px;
  background: #fff;
  padding: var(--engine-s-4);
}

.engine-schema-card h3,
.engine-preview-head h3 {
  margin: 0 0 var(--engine-s-3);
  font-size: 15px;
  line-height: 1.2;
}

.engine-column-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.engine-column-list code {
  border-radius: 8px;
  background: #1E1E1E;
  color: #fff;
  padding: 6px 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
}

.engine-schema-card ul {
  display: grid;
  gap: 8px;
  margin: 0;
  padding-left: 17px;
  color: #3C3C3C;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
}

.engine-sql-shape,
.engine-preview-panel {
  overflow: hidden;
  border: 1px solid var(--engine-line);
  border-radius: 16px;
  background: #fff;
}

.engine-sql-shape > div,
.engine-preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--engine-s-3);
  border-bottom: 1px solid var(--engine-line);
  padding: var(--engine-s-3) var(--engine-s-4);
}

.engine-sql-shape button {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--engine-line-strong);
  border-radius: 999px;
  background: #fff;
  color: var(--engine-ink);
  padding: 0 10px;
  font-size: 11px;
  font-weight: 850;
  cursor: pointer;
}

.engine-sql-shape button:disabled {
  cursor: wait;
  opacity: .58;
}

.engine-sql-shape pre {
  margin: 0;
  overflow-x: auto;
  background: #1E1E1E;
  color: #fff;
  padding: var(--engine-s-4);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  line-height: 1.65;
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
  max-width: 260px;
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
  padding: var(--engine-s-5);
  font-size: 13px;
  font-weight: 750;
}

.engine-page-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--engine-s-4);
}

.engine-page-tile {
  display: grid;
  min-height: 260px;
  grid-template-rows: auto auto 1fr auto;
  gap: var(--engine-s-3);
  border: 1px solid var(--engine-line);
  border-radius: var(--engine-radius-card);
  background: #fff;
  padding: var(--engine-s-4);
  transition: transform 180ms var(--engine-ease), border-color 180ms var(--engine-ease);
}

.engine-page-tile:hover {
  border-color: var(--engine-action);
  transform: translateY(-3px);
}

.engine-page-tile[data-role='success'] { box-shadow: inset 0 5px 0 var(--engine-success-bg); }
.engine-page-tile[data-role='info'] { box-shadow: inset 0 5px 0 var(--engine-info-bg); }
.engine-page-tile[data-role='warning'] { box-shadow: inset 0 5px 0 var(--engine-warning-bg); }

.engine-page-tile-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--engine-s-3);
}

.engine-page-tile-head > span:first-child {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 14px;
  background: var(--engine-action-soft);
  color: var(--engine-action);
}

.engine-page-tile h3 {
  margin: 0;
  font-size: 20px;
  line-height: 1.08;
}

.engine-page-tile p {
  margin: 0;
  color: #3C3C3C;
  font-size: 13px;
  line-height: 1.58;
}

.engine-page-tile footer {
  display: grid;
  gap: var(--engine-s-2);
}

.engine-page-tile code {
  width: max-content;
  max-width: 100%;
  overflow-wrap: anywhere;
  border-radius: 999px;
  background: var(--engine-canvas);
  padding: 5px 9px;
  color: var(--engine-ink);
  font-size: 11px;
  font-weight: 850;
}

.engine-page-tile small {
  color: var(--engine-muted);
  font-size: 11px;
  font-weight: 750;
  line-height: 1.35;
}

.engine-grid-bottom {
  align-items: stretch;
}

.engine-audit-list,
.engine-proof-stack {
  display: grid;
  gap: var(--engine-s-3);
  margin: 0;
  padding: 0;
}

.engine-audit-list {
  list-style: none;
}

.engine-audit-list li,
.engine-proof {
  display: flex;
  align-items: flex-start;
  gap: var(--engine-s-3);
  border-radius: 16px;
  background: var(--engine-canvas);
  padding: var(--engine-s-4);
  color: #3C3C3C;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
}

.engine-audit-list svg {
  flex: 0 0 auto;
  color: var(--engine-action);
}

.engine-proof {
  border: 1px solid var(--engine-line);
  background: #fff;
}

.engine-proof[data-role='warning'] { background: var(--engine-warning-bg); }
.engine-proof[data-role='info'] { background: var(--engine-info-bg); }

.engine-proof strong,
.engine-proof small {
  display: block;
}

.engine-proof strong {
  color: var(--engine-ink);
  font-size: 14px;
}

.engine-proof small {
  margin-top: 3px;
  color: var(--engine-muted);
  font-size: 12px;
  font-weight: 700;
}

@media (prefers-reduced-motion: reduce) {
  .engine-back,
  .engine-refresh,
  .engine-node,
  .engine-page-tile {
    transition-duration: .01ms !important;
    transform: none !important;
  }
}

@media (max-width: 1120px) {
  .engine-hero-grid,
  .engine-grid,
  .engine-section-head-row,
  .engine-console,
  .engine-console-toolbar,
  .engine-schema-grid {
    grid-template-columns: 1fr;
  }

  .engine-console-rail {
    border-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, .08);
  }

  .engine-console-tabs {
    max-height: 320px;
  }

  .engine-page-grid,
  .engine-flow {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .engine-hero,
  .engine-main {
    padding: var(--engine-s-4);
  }

  .engine-topbar {
    align-items: stretch;
    flex-direction: column;
  }

  .engine-topbar-actions {
    justify-content: flex-start;
  }

  .engine-hero-grid {
    padding-top: var(--engine-s-8);
  }

  .engine-hero-copy h1 {
    max-width: 100%;
    font-size: clamp(42px, 14vw, 64px);
  }

  .engine-core-card {
    min-height: 380px;
  }

  .engine-core-center {
    width: min(62%, 210px);
  }

  .engine-progress,
  .engine-page-grid,
  .engine-flow {
    grid-template-columns: 1fr;
  }
}
`
