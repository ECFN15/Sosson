import { memo, useCallback, useEffect, useMemo, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import { ArchiveRestore, ArrowLeft, Cloud, Download, RotateCcw, Save } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  createPrevisionnelWorkbookVersionPendingInSql,
  getLatestGeneratedPrevisionnelWorkbookVersionFromSql,
  getPrevisionnelWorkbookVersionFromSql,
  loadPrevisionnelSheetFromSql,
  updatePrevisionnelLineAmountsInSql,
  updatePrevisionnelMonthlyAmountInSql,
  upsertPrevisionnelCellEditInSql,
} from '@/features/previsionnel/previsionnelSql'
import {
  buildPrevisionnelWorkbookVersionPaths,
  createPrevisionnelWorkbookVersionId,
  PREVISIONNEL_CURRENT_STORAGE_PATH,
  triggerPrevisionnelWorkbookGeneration,
  type PrevisionnelWorkbookGenerationStatus,
} from '@/features/previsionnel/previsionnelWorkbookExport'
import { buildPrevisionnelSqlGridState } from '@/features/previsionnel/previsionnelSqlValues'
import { currentPrevisionnelSheet } from '@/data/previsionnelCurrentSheet'
import { exportCurrentPrevisionnelWorkbookFromCells, type WorkbookCellUpdates } from '@/lib/previsionnelExport'
import { isDataConnectEnabled } from '@/lib/dataconnect'
import {
  buildSpreadsheetView,
  checkpointCellUpdates,
  formatSpreadsheetValue,
  isNumericColumn,
  normalizeSpreadsheetInput,
  parseSpreadsheetNumber,
  type SpreadsheetCellUpdates,
} from '@/lib/previsionnelSpreadsheet'
import { useApp } from '@/lib/store'
import { waitForFirebaseUser } from '@/lib/firebaseAuthState'
import {
  checkpointChecksum,
  PREVISIONNEL_BASELINE_CHECKPOINT,
  readUserCheckpoints,
  writeUserCheckpoints,
  type PrevisionnelUserCheckpoint,
} from '@/lib/previsionnelCheckpoint'
import type { CurrentSheetColumn, CurrentSheetRow } from '@/data/previsionnelCurrentSheet'

const STORAGE_KEY = `sosson:previsionnel:${currentPrevisionnelSheet.sheet}:cell-updates`
const BASELINE_CHECKPOINT_ID = PREVISIONNEL_BASELINE_CHECKPOINT.id

type SqlStatus = 'idle' | 'loading' | 'ready' | 'saving' | 'unavailable' | 'error'
type SqlCellBinding = {
  monthlyId: string
  field: 'planned' | 'realized'
}
type SqlLineBinding = {
  lineId: string
}
type CellPosition = {
  rowIndex: number
  colIndex: number
}
type CellInputRefFactory = (ref: string) => (node: HTMLInputElement | null) => void
type CellChangeHandler = (ref: string, value: string, numeric: boolean) => void
type CellFocusHandler = (ref: string) => void
type CellKeyboardHandler = (event: KeyboardEvent<HTMLInputElement>, ref: string) => void
type CellPasteHandler = (event: ClipboardEvent<HTMLInputElement>, ref: string) => void
type DraftCell = {
  ref: string
  value: string
  numeric: boolean
}
type WorkbookVersionSqlLike = {
  id: string
  status: string
  storagePath?: string | null
  currentStoragePath?: string | null
  sha256?: string | null
  generatedAt?: string | null
  errorMessage?: string | null
}
type WorkbookVersionState = Omit<WorkbookVersionSqlLike, 'status'> & {
  status: PrevisionnelWorkbookGenerationStatus
}

const SPREADSHEET_ROW_HEIGHT = 32
const SPREADSHEET_ROW_OVERSCAN = 6

function cellEditId(sheet: string, ref: string) {
  return `${sheet}:${ref}`
}

function normalizeWorkbookStatus(status: string): PrevisionnelWorkbookGenerationStatus {
  if (status === 'generating' || status === 'generated' || status === 'failed') return status
  return 'pending'
}

function workbookVersionState(version: WorkbookVersionSqlLike): WorkbookVersionState {
  return {
    ...version,
    status: normalizeWorkbookStatus(version.status),
  }
}

function workbookVersionMessage(version: WorkbookVersionState | null) {
  if (!version) return 'aucune version Storage generee'
  if (version.status === 'generated') return `generated ${version.sha256 ? version.sha256.slice(0, 8) : 'sans hash'}`
  if (version.status === 'failed') return `failed ${version.errorMessage ?? ''}`.trim()
  if (version.status === 'generating') return 'generating'
  return 'pending'
}

function asDisplay(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  return String(value)
}

function asNumber(value: string | number | null | undefined) {
  return parseSpreadsheetNumber(value ?? null)
}

function rowInitialValue(row: CurrentSheetRow, col: string) {
  return row.cells.find(cell => cell.col === col)?.value ?? null
}

function valueForCell(
  ref: string,
  fallback: string | number | null,
  edited: WorkbookCellUpdates,
  sqlValues: WorkbookCellUpdates,
  spreadsheetValues: SpreadsheetCellUpdates,
) {
  if (Object.prototype.hasOwnProperty.call(edited, ref)) return edited[ref]
  if (Object.prototype.hasOwnProperty.call(sqlValues, ref)) return sqlValues[ref]
  if (Object.prototype.hasOwnProperty.call(spreadsheetValues, ref)) return spreadsheetValues[ref]
  return fallback
}

function cellBg(row: CurrentSheetRow, fillId: number, editable: boolean) {
  if (row.lineType === 'section') return '#DCE9F2'
  if (row.lineType === 'total') return '#1E1E1E'
  if (fillId === 10) return '#FFF9B1'
  if (editable) return '#FFFFFF'
  return '#FAF6F2'
}

function cellColor(row: CurrentSheetRow) {
  if (row.lineType === 'total') return '#FFFFFF'
  return '#1E1E1E'
}

function refCoordinates(ref: string | null) {
  if (!ref) return null
  const match = /^([A-Z]+)(\d+)$/.exec(ref)
  if (!match) return null
  return { col: match[1], rowNumber: Number(match[2]) }
}

function buildExportUpdates(edited: WorkbookCellUpdates, sqlValues: WorkbookCellUpdates) {
  const updates: WorkbookCellUpdates = {}

  currentPrevisionnelSheet.rows.forEach(row => {
    row.cells.forEach(cell => {
      if (!cell.editable) return
      if (Object.prototype.hasOwnProperty.call(edited, cell.ref)) updates[cell.ref] = edited[cell.ref]
      else if (Object.prototype.hasOwnProperty.call(sqlValues, cell.ref)) updates[cell.ref] = sqlValues[cell.ref]
    })
  })

  return updates
}

interface SpreadsheetRowProps {
  row: CurrentSheetRow
  columnsByKey: Map<string, CurrentSheetColumn>
  edited: WorkbookCellUpdates
  sqlValues: WorkbookCellUpdates
  draftCellInRow: DraftCell | null
  activeCellInRow: string | null
  editingCellInRow: string | null
  rowActive: boolean
  getInputRef: CellInputRefFactory
  onCellChange: CellChangeHandler
  onCellFocus: CellFocusHandler
  onCellDoubleClick: CellFocusHandler
  onCellKeyDown: CellKeyboardHandler
  onCellPaste: CellPasteHandler
}

const SpreadsheetRow = memo(function SpreadsheetRow({
  row,
  columnsByKey,
  edited,
  draftCellInRow,
  activeCellInRow,
  editingCellInRow,
  rowActive,
  getInputRef,
  onCellChange,
  onCellFocus,
  onCellDoubleClick,
  onCellKeyDown,
  onCellPaste,
}: SpreadsheetRowProps) {
  return (
    <tr>
      <td
        className="sticky left-0 z-20 border-b border-r border-[#EADBC8] px-2 py-1 text-center text-[11px] font-semibold"
        style={{
          backgroundColor: rowActive
            ? '#FFF4EA'
            : row.lineType === 'section'
              ? '#DCE9F2'
              : row.lineType === 'total'
                ? '#1E1E1E'
                : '#FAF6F2',
          color: rowActive ? '#1E1E1E' : cellColor(row),
        }}
      >
        {row.rowNumber}
      </td>
      {row.cells.map(cell => {
        const column = columnsByKey.get(cell.col)
        const draftValue = draftCellInRow?.ref === cell.ref ? draftCellInRow.value : null
        const committedValue = cell.value
        const value = draftValue ?? committedValue
        const editable = cell.editable
        const numeric = typeof rowInitialValue(row, cell.col) === 'number' || isNumericColumn(column)
        const changed = draftValue !== null || Object.prototype.hasOwnProperty.call(edited, cell.ref)
        const active = activeCellInRow === cell.ref
        const editing = editingCellInRow === cell.ref
        const stickyClass = cell.col === 'B' ? 'sticky left-[52px] z-10 shadow-[2px_0_0_#EADBC8]' : ''
        const cellStateClass = active
          ? 'z-20 outline outline-2 outline-[#F06B21] outline-offset-[-2px]'
          : changed
            ? 'outline outline-1 outline-[#F06B21] outline-offset-[-1px]'
            : !editable
              ? 'text-[#6B6B6B]'
              : ''

        return (
          <td
            key={cell.ref}
            data-cell-ref={cell.ref}
            className={`relative border-b border-r border-[#EADBC8] p-0 ${stickyClass} ${cellStateClass}`}
            style={{
              minWidth: column?.width ?? 92,
              backgroundColor: changed ? '#FFF4EA' : cellBg(row, cell.fillId, editable),
              color: cellColor(row),
            }}
            title={editable ? cell.ref : `${cell.ref} - lecture seule`}
          >
            {editable ? (
              <input
                ref={getInputRef(cell.ref)}
                value={editing ? asDisplay(value) : formatSpreadsheetValue(value, numeric)}
                inputMode={numeric ? 'decimal' : 'text'}
                readOnly={!editing}
                onChange={event => onCellChange(cell.ref, event.target.value, numeric)}
                onFocus={() => onCellFocus(cell.ref)}
                onDoubleClick={() => onCellDoubleClick(cell.ref)}
                onKeyDown={event => onCellKeyDown(event, cell.ref)}
                onPaste={event => onCellPaste(event, cell.ref)}
                data-cell-ref={cell.ref}
                className={`h-8 w-full min-w-0 border-0 bg-transparent px-2 text-[12px] font-medium text-[#1E1E1E] outline-none focus:bg-white ${
                  changed ? 'font-semibold' : ''
                }`}
                aria-label={`${cell.ref} ${row.name}`}
              />
            ) : (
              <span className="block h-8 select-none truncate px-2 py-2 text-[11px] font-medium opacity-80">
                {formatSpreadsheetValue(value, numeric)}
              </span>
            )}
            {active && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-[3px] z-30 rounded-[3px] border-2 border-[#F06B21]"
                style={{ animation: 'sossonCellSelect 900ms ease-out infinite' }}
              >
                <span className="absolute -bottom-[5px] -right-[5px] h-[7px] w-[7px] rounded-[2px] border border-white bg-[#F06B21]" />
              </span>
            )}
          </td>
        )
      })}
    </tr>
  )
}, areSpreadsheetRowPropsEqual)

function areSpreadsheetRowPropsEqual(previous: SpreadsheetRowProps, next: SpreadsheetRowProps) {
  if (
    previous.row.id !== next.row.id ||
    previous.rowActive !== next.rowActive ||
    previous.activeCellInRow !== next.activeCellInRow ||
    previous.editingCellInRow !== next.editingCellInRow ||
    previous.draftCellInRow?.ref !== next.draftCellInRow?.ref ||
    previous.draftCellInRow?.value !== next.draftCellInRow?.value ||
    previous.draftCellInRow?.numeric !== next.draftCellInRow?.numeric ||
    previous.columnsByKey !== next.columnsByKey ||
    previous.getInputRef !== next.getInputRef ||
    previous.onCellChange !== next.onCellChange ||
    previous.onCellFocus !== next.onCellFocus ||
    previous.onCellDoubleClick !== next.onCellDoubleClick ||
    previous.onCellKeyDown !== next.onCellKeyDown ||
    previous.onCellPaste !== next.onCellPaste
  ) {
    return false
  }

  if (previous.row.cells.length !== next.row.cells.length) return false

  for (let index = 0; index < next.row.cells.length; index += 1) {
    const previousCell = previous.row.cells[index]
    const nextCell = next.row.cells[index]
    if (
      previousCell.ref !== nextCell.ref ||
      previousCell.col !== nextCell.col ||
      previousCell.editable !== nextCell.editable ||
      previousCell.fillId !== nextCell.fillId ||
      !Object.is(previousCell.value, nextCell.value)
    ) {
      return false
    }

    const previousChanged = Object.prototype.hasOwnProperty.call(previous.edited, nextCell.ref)
    const nextChanged = Object.prototype.hasOwnProperty.call(next.edited, nextCell.ref)
    if (previousChanged !== nextChanged) return false

    const previousSqlValue = Object.prototype.hasOwnProperty.call(previous.sqlValues, nextCell.ref)
      ? previous.sqlValues[nextCell.ref]
      : undefined
    const nextSqlValue = Object.prototype.hasOwnProperty.call(next.sqlValues, nextCell.ref) ? next.sqlValues[nextCell.ref] : undefined
    if (!Object.is(previousSqlValue, nextSqlValue)) return false
  }

  return true
}

export function PrevisionnelSpreadsheetPage() {
  const { user } = useApp()
  const cellInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const cellInputRefCallbacks = useRef<Record<string, (node: HTMLInputElement | null) => void>>({})
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const focusFrame = useRef<number | null>(null)
  const scrollFrame = useRef<number | null>(null)
  const handleSaveSqlRef = useRef<(() => Promise<void>) | null>(null)
  const editedRef = useRef<WorkbookCellUpdates>({})
  const draftCellRef = useRef<DraftCell | null>(null)
  const editSessionRef = useRef<{ ref: string; hadEditedValue: boolean; value: string | number | null } | null>(null)
  const [sqlStatus, setSqlStatus] = useState<SqlStatus>('idle')
  const [sqlMessage, setSqlMessage] = useState('Mode local navigateur')
  const [sqlValues, setSqlValues] = useState<WorkbookCellUpdates>({})
  const [sqlBindings, setSqlBindings] = useState<Record<string, SqlCellBinding>>({})
  const [sqlLineBindings, setSqlLineBindings] = useState<Record<number, SqlLineBinding>>({})
  const [sqlBatchId, setSqlBatchId] = useState<string | null>(null)
  const [workbookVersion, setWorkbookVersion] = useState<WorkbookVersionState | null>(null)
  const [workbookMessage, setWorkbookMessage] = useState('Excel Storage non genere')
  const [workbookRetrying, setWorkbookRetrying] = useState(false)
  const [activeCell, setActiveCell] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [draftCell, setDraftCell] = useState<DraftCell | null>(null)
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<string>(BASELINE_CHECKPOINT_ID)
  const [userCheckpoints, setUserCheckpoints] = useState<PrevisionnelUserCheckpoint[]>(() =>
    readUserCheckpoints(currentPrevisionnelSheet.sheet),
  )
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(720)
  const [edited, setEdited] = useState<WorkbookCellUpdates>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as WorkbookCellUpdates
    } catch {
      return {}
    }
  })
  useEffect(() => {
    editedRef.current = edited
    localStorage.setItem(STORAGE_KEY, JSON.stringify(edited))
  }, [edited])

  useEffect(() => {
    draftCellRef.current = draftCell
  }, [draftCell])

  useEffect(
    () => () => {
      if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current)
      if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current)
    },
    [],
  )

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    setViewportHeight(container.clientHeight || 720)
    const observer = new ResizeObserver(entries => {
      const height = entries[0]?.contentRect.height
      if (height) setViewportHeight(height)
    })
    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let mounted = true

    async function loadSqlPrevisionnel() {
      if (!isDataConnectEnabled || !user) {
        if (!mounted) return
        setSqlStatus('unavailable')
        setSqlMessage('SQL Connect indisponible : sauvegarde navigateur uniquement')
        return
      }

      setSqlStatus('loading')
      setSqlMessage('Chargement SQL Connect...')
      try {
        const firebaseUser = await waitForFirebaseUser()
        if (!firebaseUser) {
          if (!mounted) return
          setSqlStatus('unavailable')
          setSqlMessage('SQL Connect indisponible : utilisateur Firebase non connecte, mode navigateur actif')
          return
        }

        const { exercise, lines, cellEdits } = await loadPrevisionnelSheetFromSql(currentPrevisionnelSheet.sheet)

        if (!exercise) {
          if (!mounted) return
          setSqlStatus('unavailable')
          setSqlMessage(`Aucun exercice SQL pour ${currentPrevisionnelSheet.sheet}`)
          return
        }

        const { values: nextValues, cellBindings: nextBindings, lineBindings: nextLineBindings } = buildPrevisionnelSqlGridState(
          currentPrevisionnelSheet,
          lines,
          cellEdits,
        )

        if (!mounted) return
        setSqlValues(nextValues)
        setSqlBindings(nextBindings)
        setSqlLineBindings(nextLineBindings)
        setSqlBatchId(exercise.batch.id)
        setSqlStatus('ready')
        try {
          const latestWorkbookVersion = await getLatestGeneratedPrevisionnelWorkbookVersionFromSql(currentPrevisionnelSheet.sheet)
          if (!mounted) return
          if (latestWorkbookVersion) {
            const nextWorkbookVersion = workbookVersionState(latestWorkbookVersion)
            setWorkbookVersion(nextWorkbookVersion)
            setWorkbookMessage(workbookVersionMessage(nextWorkbookVersion))
          } else {
            setWorkbookVersion(null)
            setWorkbookMessage('aucune version Storage generated connue')
          }
        } catch (error) {
          if (!mounted) return
          setWorkbookVersion(null)
          setWorkbookMessage(`versioning Excel Storage indisponible: ${error instanceof Error ? error.message : 'erreur inconnue'}`)
        }
        setSqlMessage(`${lines.length} lignes et ${cellEdits.length} cellule(s) exactes chargées depuis SQL Connect`)
      } catch (error) {
        if (!mounted) return
        setSqlStatus('error')
        setSqlMessage(`SQL Connect indisponible : ${error instanceof Error ? error.message : 'erreur inconnue'}`)
      }
    }

    void loadSqlPrevisionnel()

    return () => {
      mounted = false
    }
  }, [user])

  const spreadsheet = useMemo(
    () => buildSpreadsheetView(currentPrevisionnelSheet, sqlValues as SpreadsheetCellUpdates, edited as SpreadsheetCellUpdates),
    [edited, sqlValues],
  )

  const rows = spreadsheet.rows
  const visibleWindow = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / SPREADSHEET_ROW_HEIGHT) - SPREADSHEET_ROW_OVERSCAN)
    const visibleCount = Math.ceil(viewportHeight / SPREADSHEET_ROW_HEIGHT) + SPREADSHEET_ROW_OVERSCAN * 2
    const end = Math.min(rows.length, start + visibleCount)

    return {
      start,
      end,
      rows: rows.slice(start, end),
      topHeight: start * SPREADSHEET_ROW_HEIGHT,
      bottomHeight: Math.max(0, (rows.length - end) * SPREADSHEET_ROW_HEIGHT),
    }
  }, [rows, scrollTop, viewportHeight])
  const columnsByKey = useMemo(() => new Map(currentPrevisionnelSheet.columns.map(column => [column.key, column])), [])
  const cellPositionByRef = useMemo(() => {
    const positions = new Map<string, CellPosition>()

    rows.forEach((row, rowIndex) => {
      row.cells.forEach((cell, colIndex) => {
        positions.set(cell.ref, { rowIndex, colIndex })
      })
    })

    return positions
  }, [rows])

  const editedCount =
    Object.keys(edited).length + (draftCell && !Object.prototype.hasOwnProperty.call(edited, draftCell.ref) ? 1 : 0)
  const sqlCanSave = sqlStatus === 'ready'
  const canRetryWorkbookGeneration =
    Boolean(workbookVersion) && (workbookVersion?.status === 'failed' || workbookVersion?.status === 'pending')
  const workbookStatusColor =
    workbookVersion?.status === 'generated'
      ? '#1E8E3E'
      : workbookVersion?.status === 'failed'
        ? '#B3261E'
        : workbookVersion?.status === 'generating' || workbookVersion?.status === 'pending'
          ? '#F06B21'
          : '#C8B18C'
  const activePosition = activeCell ? (cellPositionByRef.get(activeCell) ?? null) : null
  const activeCoordinates = activePosition ? refCoordinates(activeCell) : null
  const activeRowNumber = activeCoordinates?.rowNumber ?? null
  const draftRowNumber = refCoordinates(draftCell?.ref ?? null)?.rowNumber ?? null

  const valueFor = useCallback(
    (ref: string, fallback: string | number | null) => {
      const draft = draftCellRef.current
      if (draft?.ref === ref) return normalizeSpreadsheetInput(draft.value, draft.numeric)
      return valueForCell(ref, fallback, edited, sqlValues, spreadsheet.values)
    },
    [edited, sqlValues, spreadsheet.values],
  )

  const ensureEditSession = useCallback((ref: string) => {
    if (editSessionRef.current?.ref === ref) return

    const currentEdited = editedRef.current
    editSessionRef.current = {
      ref,
      hadEditedValue: Object.prototype.hasOwnProperty.call(currentEdited, ref),
      value: currentEdited[ref] ?? null,
    }
  }, [])

  const stopEditing = useCallback(() => {
    editSessionRef.current = null
    setEditingCell(null)
  }, [])

  const editedWithDraft = useCallback((base: WorkbookCellUpdates = editedRef.current) => {
    const draft = draftCellRef.current
    if (!draft) return base

    return {
      ...base,
      [draft.ref]: normalizeSpreadsheetInput(draft.value, draft.numeric),
    }
  }, [])

  const commitDraft = useCallback(() => {
    const draft = draftCellRef.current
    if (!draft) return

    const value = normalizeSpreadsheetInput(draft.value, draft.numeric)
    editedRef.current = {
      ...editedRef.current,
      [draft.ref]: value,
    }
    draftCellRef.current = null
    setEdited(prev => ({
      ...prev,
      [draft.ref]: value,
    }))
    setDraftCell(null)
  }, [])

  const updateCell = useCallback((ref: string, value: string, numeric: boolean) => {
    ensureEditSession(ref)
    setEditingCell(ref)
    const nextDraft = { ref, value, numeric }
    draftCellRef.current = nextDraft
    setDraftCell(nextDraft)
  }, [ensureEditSession])

  const clearCell = useCallback((ref: string, numeric = false) => {
    ensureEditSession(ref)
    const nextDraft = { ref, value: '', numeric }
    draftCellRef.current = nextDraft
    setDraftCell(nextDraft)
  }, [ensureEditSession])

  const restoreCheckpoint = useCallback(() => {
    const selectedCheckpoint = userCheckpoints.find(checkpoint => checkpoint.id === selectedCheckpointId)
    const checkpoint = selectedCheckpoint
      ? selectedCheckpoint.values
      : sqlCanSave
        ? checkpointCellUpdates(currentPrevisionnelSheet)
        : {}
    draftCellRef.current = null
    editedRef.current = checkpoint
    setEdited(checkpoint)
    setDraftCell(null)
    setEditingCell(null)
    setSqlMessage(
      selectedCheckpoint
        ? `${selectedCheckpoint.label} restaure localement depuis le navigateur`
        : sqlCanSave
          ? `Reference immuable PREVISIONNEL.xlsx ${currentPrevisionnelSheet.sheet} prete a sauvegarder dans SQL`
          : `Reference immuable PREVISIONNEL.xlsx ${currentPrevisionnelSheet.sheet} restauree en mode navigateur`,
    )
  }, [selectedCheckpointId, sqlCanSave, userCheckpoints])

  const createUserCheckpoint = useCallback(async () => {
    const values = editedWithDraft(buildExportUpdates(editedRef.current, sqlValues))
    const now = new Date()
    const label = `Checkpoint navigateur ${now.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`
    const checkpoint: PrevisionnelUserCheckpoint = {
      id: `checkpoint-${now.toISOString()}`,
      label,
      sheet: currentPrevisionnelSheet.sheet,
      createdAt: now.toISOString(),
      baseCheckpointId: PREVISIONNEL_BASELINE_CHECKPOINT.id,
      baseSha256: PREVISIONNEL_BASELINE_CHECKPOINT.sha256,
      values,
      valueCount: Object.keys(values).length,
      checksum: await checkpointChecksum(values),
    }
    const next = [checkpoint, ...userCheckpoints].slice(0, 20)
    setUserCheckpoints(next)
    writeUserCheckpoints(currentPrevisionnelSheet.sheet, next)
    setSelectedCheckpointId(checkpoint.id)
    setSqlMessage(`${label} cree localement dans ce navigateur depuis la reference immuable PREVISIONNEL.xlsx`)
  }, [editedWithDraft, sqlValues, userCheckpoints])

  const cancelCellEdit = useCallback((ref: string) => {
    const session = editSessionRef.current
    if (!session || session.ref !== ref) {
      draftCellRef.current = null
      setDraftCell(null)
      setEditingCell(null)
      return
    }

    draftCellRef.current = null
    setDraftCell(null)
    stopEditing()
  }, [stopEditing])

  const copyCell = useCallback(async (ref: string) => {
    const position = cellPositionByRef.get(ref)
    if (!position) return
    const cell = rows[position.rowIndex]?.cells[position.colIndex]
    if (!cell) return
    const value = asDisplay(valueFor(ref, cell.value))

    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = value
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }

    setSqlMessage(`${ref} copiee`)
  }, [cellPositionByRef, rows, valueFor])

  const getInputRef = useCallback((ref: string) => {
    if (!cellInputRefCallbacks.current[ref]) {
      cellInputRefCallbacks.current[ref] = node => {
        cellInputRefs.current[ref] = node
      }
    }
    return cellInputRefCallbacks.current[ref]
  }, [])

  const setFocusedCell = useCallback((ref: string) => {
    const draft = draftCellRef.current
    if (draft && draft.ref !== ref) commitDraft()
    if (editingCell && editingCell !== ref) stopEditing()
    setActiveCell(current => (current === ref ? current : ref))
  }, [commitDraft, editingCell, stopEditing])

  function rowNumberFromRef(ref: string) {
    const match = /\d+/.exec(ref)
    return match ? Number(match[0]) : null
  }

  function rowValue(row: CurrentSheetRow, col: string) {
    const cell = row.cells.find(item => item.col === col)
    return cell ? valueFor(cell.ref, cell.value) : null
  }

  function lineTotals(row: CurrentSheetRow) {
    return currentPrevisionnelSheet.monthPairs.reduce(
      (totals, pair) => ({
        plannedTotal: totals.plannedTotal + asNumber(rowValue(row, pair.planned)),
        realizedTotal: totals.realizedTotal + asNumber(rowValue(row, pair.realized)),
      }),
      { plannedTotal: 0, realizedTotal: 0 },
    )
  }

  async function handleExport() {
    await exportCurrentPrevisionnelWorkbookFromCells(buildExportUpdates(editedWithDraft(edited), sqlValues), currentPrevisionnelSheet.sheet)
  }

  async function handleSaveSql() {
    const editedForSave = editedWithDraft(edited)

    if (!sqlCanSave) {
      setSqlMessage('SQL Connect non prêt : les modifications restent dans ce navigateur')
      return
    }

    if (!Object.keys(editedForSave).length) {
      setSqlMessage('Aucune cellule à sauvegarder')
      return
    }

    const changedSqlRefs = Object.keys(editedForSave).filter(ref => sqlBindings[ref])
    setSqlStatus('saving')
    setSqlMessage('Sauvegarde SQL Connect en cours, puis creation de la version Excel Storage...')

    try {
      const grouped = new Map<string, { planned?: number; realized?: number }>()

      changedSqlRefs.forEach(ref => {
        const binding = sqlBindings[ref]
        const update = grouped.get(binding.monthlyId) ?? {}
        update[binding.field] = asNumber(editedForSave[ref])
        grouped.set(binding.monthlyId, update)
      })

      await Promise.all(
        Array.from(grouped.entries()).map(([id, update]) =>
          updatePrevisionnelMonthlyAmountInSql({
            id,
            planned: update.planned,
            realized: update.realized,
          }),
        ),
      )

      const changedRows = new Set(
        Object.keys(editedForSave)
          .map(rowNumberFromRef)
          .filter((rowNumber): rowNumber is number => rowNumber !== null && Boolean(sqlLineBindings[rowNumber])),
      )

      await Promise.all(
        Array.from(changedRows).map(rowNumber => {
          const row = spreadsheet.rows.find(item => item.rowNumber === rowNumber)
          const binding = sqlLineBindings[rowNumber]
          if (!row || !binding) return Promise.resolve()
          const totals = lineTotals(row)
          const name = asDisplay(rowValue(row, 'B')).trim()

          return updatePrevisionnelLineAmountsInSql({
            id: binding.lineId,
            rawName: name || undefined,
            clientName: name || undefined,
            caTce: asNumber(rowValue(row, 'A')),
            caPrevision: asNumber(rowValue(row, 'D')),
            caContrat: asNumber(rowValue(row, 'E')),
            plannedTotal: totals.plannedTotal,
            realizedTotal: totals.realizedTotal,
          })
        }),
      )

      await Promise.all(
        Object.entries(editedForSave).map(([ref, value]) => {
          const numeric = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
          const isNumeric = Number.isFinite(numeric) && String(value).trim() !== ''

          return upsertPrevisionnelCellEditInSql({
            id: cellEditId(currentPrevisionnelSheet.sheet, ref),
            sourceSheet: currentPrevisionnelSheet.sheet,
            cellRef: ref,
            valueText: isNumeric ? null : String(value ?? ''),
            numericValue: isNumeric ? numeric : null,
          })
        }),
      )

      const versionDate = new Date()
      const versionId = createPrevisionnelWorkbookVersionId(versionDate)
      const versionPaths = buildPrevisionnelWorkbookVersionPaths(versionId, versionDate)
      const baseStoragePath =
        workbookVersion?.status === 'generated' && workbookVersion.storagePath ? workbookVersion.storagePath : null

      await createPrevisionnelWorkbookVersionPendingInSql({
        id: versionId,
        batchId: sqlBatchId,
        sourceSheet: currentPrevisionnelSheet.sheet,
        storagePath: versionPaths.storagePath,
        currentStoragePath: versionPaths.currentStoragePath,
        baseStoragePath,
        editCount: Object.keys(editedForSave).length,
      })

      const pendingWorkbookVersion: WorkbookVersionState = {
        id: versionId,
        status: 'pending',
        storagePath: versionPaths.storagePath,
        currentStoragePath: versionPaths.currentStoragePath,
        sha256: null,
        generatedAt: null,
        errorMessage: null,
      }
      setWorkbookVersion(pendingWorkbookVersion)
      setWorkbookMessage(workbookVersionMessage(pendingWorkbookVersion))
      setSqlMessage(`${Object.keys(editedForSave).length} cellule(s) sauvegardee(s) dans SQL. Export Excel serveur en cours...`)

      let generatedWorkbookVersion = pendingWorkbookVersion
      try {
        const generation = await triggerPrevisionnelWorkbookGeneration(versionId)
        const refreshed = await getPrevisionnelWorkbookVersionFromSql(versionId).catch(() => null)
        generatedWorkbookVersion = refreshed
          ? workbookVersionState(refreshed)
          : {
              ...pendingWorkbookVersion,
              status: generation.status,
              storagePath: generation.storagePath ?? versionPaths.storagePath,
              currentStoragePath: generation.currentStoragePath ?? versionPaths.currentStoragePath,
              sha256: generation.sha256 ?? null,
              errorMessage: generation.errorMessage ?? null,
            }
      } catch (error) {
        const refreshed = await getPrevisionnelWorkbookVersionFromSql(versionId).catch(() => null)
        generatedWorkbookVersion = refreshed
          ? workbookVersionState(refreshed)
          : {
              ...pendingWorkbookVersion,
              status: 'failed',
              errorMessage: error instanceof Error ? error.message : 'erreur inconnue',
            }
      }

      setWorkbookVersion(generatedWorkbookVersion)
      setWorkbookMessage(workbookVersionMessage(generatedWorkbookVersion))
      setSqlValues(prev => {
        const next = { ...prev }
        Object.entries(editedForSave).forEach(([ref, value]) => {
          next[ref] = value
        })
        return next
      })
      editedRef.current = {}
      setEdited({})
      draftCellRef.current = null
      setDraftCell(null)
      setSqlStatus('ready')
      setSqlMessage(
        generatedWorkbookVersion.status === 'generated'
          ? `${Object.keys(editedForSave).length} cellule(s) sauvegardee(s) dans SQL Connect et Excel Storage generated`
          : `${Object.keys(editedForSave).length} cellule(s) sauvegardee(s) dans SQL Connect ; Excel Storage ${generatedWorkbookVersion.status}`,
      )
    } catch (error) {
      setSqlStatus('error')
      setSqlMessage(`Echec sauvegarde SQL ou creation version Excel: ${error instanceof Error ? error.message : 'erreur inconnue'}`)
    }
  }

  async function handleRetryWorkbookGeneration() {
    if (!workbookVersion) return

    setWorkbookRetrying(true)
    setWorkbookVersion(prev => (prev ? { ...prev, status: 'generating', errorMessage: null } : prev))
    setWorkbookMessage('relance generation Excel Storage...')

    try {
      const generation = await triggerPrevisionnelWorkbookGeneration(workbookVersion.id)
      const refreshed = await getPrevisionnelWorkbookVersionFromSql(workbookVersion.id).catch(() => null)
      const nextWorkbookVersion = refreshed
        ? workbookVersionState(refreshed)
        : workbookVersionState({
            ...workbookVersion,
            status: generation.status,
            storagePath: generation.storagePath ?? workbookVersion.storagePath,
            currentStoragePath: generation.currentStoragePath ?? workbookVersion.currentStoragePath,
            sha256: generation.sha256 ?? workbookVersion.sha256,
            errorMessage: generation.errorMessage ?? null,
          })

      setWorkbookVersion(nextWorkbookVersion)
      setWorkbookMessage(workbookVersionMessage(nextWorkbookVersion))
      setSqlMessage(
        nextWorkbookVersion.status === 'generated'
          ? 'Export Excel Storage genere depuis les edits SQL conserves'
          : `Export Excel Storage ${nextWorkbookVersion.status}`,
      )
    } catch (error) {
      const refreshed = await getPrevisionnelWorkbookVersionFromSql(workbookVersion.id).catch(() => null)
      const nextWorkbookVersion = refreshed
        ? workbookVersionState(refreshed)
        : {
            ...workbookVersion,
            status: 'failed' as const,
            errorMessage: error instanceof Error ? error.message : 'erreur inconnue',
          }
      setWorkbookVersion(nextWorkbookVersion)
      setWorkbookMessage(workbookVersionMessage(nextWorkbookVersion))
      setSqlMessage(`Echec relance Excel Storage: ${nextWorkbookVersion.errorMessage ?? 'erreur inconnue'}`)
    } finally {
      setWorkbookRetrying(false)
    }
  }

  useEffect(() => {
    handleSaveSqlRef.current = handleSaveSql
  })

  const cellPosition = useCallback((ref: string) => cellPositionByRef.get(ref) ?? null, [cellPositionByRef])

  const focusCell = useCallback((ref: string, select: boolean | 'end' = false) => {
    commitDraft()
    setActiveCell(current => (current === ref ? current : ref))
    stopEditing()
    const position = cellPositionByRef.get(ref)
    if (position && scrollContainerRef.current) {
      const targetTop = Math.max(0, position.rowIndex * SPREADSHEET_ROW_HEIGHT - SPREADSHEET_ROW_HEIGHT * 4)
      scrollContainerRef.current.scrollTop = targetTop
      setScrollTop(targetTop)
    }
    if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current)

    focusFrame.current = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const input = cellInputRefs.current[ref]
        if (!input) return

        if (document.activeElement !== input) input.focus({ preventScroll: true })
        input.scrollIntoView({ block: 'nearest', inline: 'nearest' })
        if (select === true) input.select()
        if (select === 'end') {
          const end = input.value.length
          input.setSelectionRange(end, end)
        }
      })
    })
  }, [cellPositionByRef, commitDraft, stopEditing])

  const startEditingCell = useCallback((ref: string, select: boolean | 'end' = false) => {
    setActiveCell(current => (current === ref ? current : ref))
    setEditingCell(current => (current === ref ? current : ref))
    if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current)

    focusFrame.current = requestAnimationFrame(() => {
      const input = cellInputRefs.current[ref]
      if (!input) return

      if (document.activeElement !== input) input.focus({ preventScroll: true })
      input.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      if (select === true) input.select()
      else if (select === 'end') {
        const end = input.value.length
        input.setSelectionRange(end, end)
      }
    })
  }, [])

  const editableRefAt = useCallback((rowIndex: number, colIndex: number, rowStep: number, colStep: number, wrapRows = false) => {
    if (rowStep !== 0) {
      for (let nextRow = rowIndex; nextRow >= 0 && nextRow < rows.length; nextRow += rowStep) {
        const row = rows[nextRow]
        const boundedCol = Math.max(0, Math.min(colIndex, (row?.cells.length ?? 1) - 1))
        const cell = row?.cells[boundedCol]
        if (cell?.editable) return cell.ref
      }
      return null
    }

    if (colStep !== 0) {
      for (let nextRow = rowIndex; nextRow >= 0 && nextRow < rows.length; nextRow += colStep > 0 ? 1 : -1) {
        const row = rows[nextRow]
        if (!row) return null
        const startCol = nextRow === rowIndex ? colIndex : colStep > 0 ? 0 : row.cells.length - 1

        for (let nextCol = startCol; nextCol >= 0 && nextCol < row.cells.length; nextCol += colStep) {
          const cell = row.cells[nextCol]
          if (cell?.editable) return cell.ref
        }

        if (!wrapRows) return null
      }
    }

    return null
  }, [rows])

  const edgeEditableRef = useCallback((rowIndex: number, colIndex: number, rowStep: number, colStep: number) => {
    let last: string | null = null

    if (rowStep !== 0) {
      for (let nextRow = rowIndex; nextRow >= 0 && nextRow < rows.length; nextRow += rowStep) {
        const row = rows[nextRow]
        const boundedCol = Math.max(0, Math.min(colIndex, (row?.cells.length ?? 1) - 1))
        const cell = row?.cells[boundedCol]
        if (cell?.editable) last = cell.ref
      }
      return last
    }

    if (colStep !== 0) {
      const row = rows[rowIndex]
      if (!row) return null
      for (let nextCol = colIndex; nextCol >= 0 && nextCol < row.cells.length; nextCol += colStep) {
        const cell = row.cells[nextCol]
        if (cell?.editable) last = cell.ref
      }
    }

    return last
  }, [rows])

  const isDirectCellInput = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return false
    if (event.nativeEvent.isComposing) return false
    if (event.key.length !== 1) return false
    return event.key === ' ' || event.key.trim().length === 1
  }, [])

  const handleCellKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>, ref: string) => {
    const position = cellPosition(ref)
    if (!position) return
    const row = rows[position.rowIndex]
    const cell = row?.cells[position.colIndex]
    if (!cell?.editable) return
    const column = columnsByKey.get(cell.col)
    const numeric = typeof rowInitialValue(row, cell.col) === 'number' || isNumericColumn(column)

    const keyMap: Record<string, [number, number]> = {
      ArrowRight: [0, 1],
      ArrowLeft: [0, -1],
      ArrowDown: [1, 0],
      ArrowUp: [-1, 0],
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault()
      void handleSaveSqlRef.current?.()
      return
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
      event.preventDefault()
      void copyCell(ref)
      return
    }

    if ((event.ctrlKey || event.metaKey) && keyMap[event.key]) {
      event.preventDefault()
      const [rowStep, colStep] = keyMap[event.key]
      const target = edgeEditableRef(position.rowIndex + rowStep, position.colIndex + colStep, rowStep, colStep)
      if (target) focusCell(target)
      return
    }

    if (event.altKey || event.ctrlKey || event.metaKey) return

    if (event.key === 'Escape') {
      event.preventDefault()
      cancelCellEdit(ref)
      focusCell(ref)
      return
    }

    if ((event.key === 'Delete' || event.key === 'Backspace') && editingCell !== ref) {
      event.preventDefault()
      clearCell(ref, numeric)
      return
    }

    if (event.key === 'F2') {
      event.preventDefault()
      startEditingCell(ref)
      return
    }

    let delta = keyMap[event.key]
    if (event.key === 'Enter') delta = event.shiftKey ? [-1, 0] : [1, 0]
    if (event.key === 'Tab') delta = event.shiftKey ? [0, -1] : [0, 1]
    if (!delta) {
      if (editingCell !== ref && isDirectCellInput(event)) {
        event.preventDefault()
        const directValue = numeric ? event.key.replace(/\s/g, '') : event.key
        updateCell(ref, directValue, numeric)
        startEditingCell(ref, 'end')
      }
      return
    }

    event.preventDefault()
    const target = editableRefAt(position.rowIndex + delta[0], position.colIndex + delta[1], delta[0], delta[1], event.key === 'Tab')
    if (!target) return
    focusCell(target)
  }, [
    cancelCellEdit,
    cellPosition,
    clearCell,
    columnsByKey,
    copyCell,
    edgeEditableRef,
    editableRefAt,
    editingCell,
    focusCell,
    isDirectCellInput,
    rows,
    startEditingCell,
    updateCell,
  ])

  const handleCellPaste = useCallback((event: ClipboardEvent<HTMLInputElement>, ref: string) => {
    const text = event.clipboardData.getData('text')

    const position = cellPosition(ref)
    if (!position) return

    if (!text.includes('\t') && !text.includes('\n')) {
      if (editingCell === ref) return
      const row = rows[position.rowIndex]
      const cell = row?.cells[position.colIndex]
      if (!cell?.editable) return
      const column = columnsByKey.get(cell.col)
      const numeric = typeof rowInitialValue(row, cell.col) === 'number' || isNumericColumn(column)

      event.preventDefault()
      updateCell(ref, text, numeric)
      focusCell(ref)
      setSqlMessage(`1 cellule collee`)
      return
    }

    event.preventDefault()
    const pastedRows = text.replace(/\r/g, '').split('\n').filter((line, index, lines) => line !== '' || index < lines.length - 1)
    let skipped = 0
    const next: WorkbookCellUpdates = {}

    pastedRows.forEach((line, rowOffset) => {
      line.split('\t').forEach((value, colOffset) => {
        const targetRow = rows[position.rowIndex + rowOffset]
        const targetCell = targetRow?.cells[position.colIndex + colOffset]
        if (!targetCell?.editable) {
          skipped += 1
          return
        }
        const column = columnsByKey.get(targetCell.col)
        next[targetCell.ref] = isNumericColumn(column) ? value.replace(/\s/g, '') : value
      })
    })

    setEdited(prev => ({ ...editedWithDraft(prev), ...next }))
    draftCellRef.current = null
    setDraftCell(null)
    setSqlMessage(
      skipped
        ? `${Object.keys(next).length} cellule(s) collée(s), ${skipped} cellule(s) non modifiable(s) ignorée(s)`
        : `${Object.keys(next).length} cellule(s) collée(s)`,
    )
  }, [cellPosition, columnsByKey, editedWithDraft, editingCell, focusCell, rows, updateCell])

  return (
    <div className="clean-saas-app flex h-[100dvh] w-screen min-w-0 flex-col overflow-hidden bg-white text-[#1E1E1E]">
      <style>
        {`@keyframes sossonCellSelect {
          0%, 100% { box-shadow: 0 0 0 1px rgba(240,107,33,0.18), 0 0 0 0 rgba(240,107,33,0.24); }
          50% { box-shadow: 0 0 0 1px rgba(240,107,33,0.3), 0 0 0 4px rgba(240,107,33,0.12); }
        }`}
      </style>
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-[#EADBC8] bg-white px-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          <Link
            to="/previsionnel"
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-[12px] font-semibold text-[#1E1E1E] hover:bg-[#FAF6F2]"
          >
            <ArrowLeft className="h-4 w-4 text-[#F06B21]" />
            Retour
          </Link>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY)
              editedRef.current = {}
              setEdited({})
              draftCellRef.current = null
              setDraftCell(null)
              setSqlMessage('Modifications locales réinitialisées ; les valeurs SQL conservées restent visibles')
            }}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-[12px] font-semibold text-[#1E1E1E] hover:bg-[#FAF6F2]"
          >
            <RotateCcw className="h-4 w-4 text-[#F06B21]" />
            Réinitialiser local
          </button>
          <button
            type="button"
            onClick={() => void handleExport()}
            title="Export local navigateur uniquement. Le fichier Storage officiel est genere cote serveur apres Sauvegarder SQL."
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[10px] bg-[#F06B21] px-3 text-[12px] font-semibold text-white hover:bg-[#D95B17]"
          >
            <Download className="h-4 w-4" />
            Export local
          </button>
          <button
            type="button"
            onClick={() => void createUserCheckpoint()}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-[12px] font-semibold text-[#1E1E1E] hover:bg-[#FAF6F2]"
            title="Creer un checkpoint navigateur base sur la reference immuable PREVISIONNEL.xlsx"
          >
            <Save className="h-4 w-4 text-[#F06B21]" />
            Creer checkpoint navigateur
          </button>
          <select
            value={selectedCheckpointId}
            onChange={event => setSelectedCheckpointId(event.target.value)}
            className="h-9 max-w-[280px] shrink-0 rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-[12px] font-semibold text-[#1E1E1E] outline-none focus:ring-2 focus:ring-[#F06B21]/20"
            title={`Référence absolue: ${PREVISIONNEL_BASELINE_CHECKPOINT.sourcePath}`}
          >
            <option value={BASELINE_CHECKPOINT_ID}>Référence immuable PREVISIONNEL.xlsx</option>
            {userCheckpoints.map(checkpoint => (
              <option key={checkpoint.id} value={checkpoint.id}>
                {checkpoint.label} · {checkpoint.valueCount} cellule(s)
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={restoreCheckpoint}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-[12px] font-semibold text-[#1E1E1E] hover:bg-[#FAF6F2]"
            title={`Restaurer le checkpoint navigateur selectionne. Reference immuable: ${PREVISIONNEL_BASELINE_CHECKPOINT.sha256}`}
          >
            <ArchiveRestore className="h-4 w-4 text-[#F06B21]" />
            Revenir checkpoint navigateur
          </button>
          <button
            type="button"
            onClick={() => void handleSaveSql()}
            disabled={!sqlCanSave || editedCount === 0}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[10px] bg-[#1E1E1E] px-3 text-[12px] font-semibold text-white hover:bg-[#3C3C3C] disabled:cursor-not-allowed disabled:bg-[#C8B18C]"
          >
            <Cloud className="h-4 w-4" />
            Sauvegarder SQL + Excel
          </button>
          {canRetryWorkbookGeneration && (
            <button
              type="button"
              onClick={() => void handleRetryWorkbookGeneration()}
              disabled={workbookRetrying}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-[12px] font-semibold text-[#1E1E1E] hover:bg-[#FAF6F2] disabled:cursor-not-allowed disabled:text-[#A3988D]"
            >
              <Cloud className="h-4 w-4 text-[#F06B21]" />
              Relancer Excel Storage
            </button>
          )}
        </div>
      </div>
      <div className="flex h-8 shrink-0 items-center gap-2 border-b border-[#EADBC8] bg-[#FAF6F2] px-3 text-[11px] font-semibold text-[#6B6B6B]">
        <span
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor:
              sqlStatus === 'ready' ? '#1E8E3E' : sqlStatus === 'saving' || sqlStatus === 'loading' ? '#F06B21' : '#C8B18C',
          }}
        />
        <span className="truncate">{sqlMessage}</span>
        <span className="hidden items-center gap-1 truncate md:inline-flex" title={workbookVersion?.currentStoragePath ?? PREVISIONNEL_CURRENT_STORAGE_PATH}>
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: workbookStatusColor }} />
          Excel Storage: {workbookMessage}
        </span>
        {editedCount > 0 && <span className="ml-auto text-[#1E1E1E]">{editedCount} cellule(s) modifiee(s)</span>}
      </div>

      <section className="min-h-0 flex-1 overflow-hidden bg-white">
        <div
          ref={scrollContainerRef}
          className="h-full overflow-auto overscroll-contain"
          onScroll={event => {
            const nextTop = event.currentTarget.scrollTop
            if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current)
            scrollFrame.current = requestAnimationFrame(() => setScrollTop(nextTop))
          }}
        >
          <table className="min-w-max border-separate border-spacing-0 text-left text-[12px]">
            <thead className="sticky top-0 z-30">
              <tr>
                <th className="sticky left-0 z-40 min-w-[52px] border-b border-r border-[#EADBC8] bg-[#1E1E1E] px-2 py-2 text-center text-white">
                  #
                </th>
                {currentPrevisionnelSheet.columns.map(column => (
                  <th
                    key={`group-${column.key}`}
                    className={`border-b border-r border-[#EADBC8] px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-[0.05em] text-white ${
                      column.key === 'B' ? 'sticky left-[52px] z-40 shadow-[2px_0_0_#EADBC8]' : ''
                    }`}
                    style={{ minWidth: column.width, backgroundColor: activeCoordinates?.col === column.key ? '#F06B21' : '#1E1E1E' }}
                  >
                    {column.group || column.key}
                  </th>
                ))}
              </tr>
              <tr>
                <th className="sticky left-0 z-40 min-w-[52px] border-b border-r border-[#EADBC8] bg-[#FDEBDD] px-2 py-2 text-center text-[#1E1E1E]">
                  Ligne
                </th>
                {currentPrevisionnelSheet.columns.map(column => (
                  <th
                    key={column.key}
                    className={`border-b border-r border-[#EADBC8] px-2 py-2 text-center text-[11px] font-semibold text-[#1E1E1E] ${
                      column.key === 'B' ? 'sticky left-[52px] z-40 shadow-[2px_0_0_#EADBC8]' : ''
                    }`}
                    style={{ minWidth: column.width, backgroundColor: activeCoordinates?.col === column.key ? '#FFF4EA' : '#FDEBDD' }}
                  >
                    <div>{column.key}</div>
                    <div className="mt-0.5 truncate text-[10px] font-medium text-[#6B6B6B]">{column.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleWindow.topHeight > 0 && (
                <tr aria-hidden="true">
                  <td colSpan={currentPrevisionnelSheet.columns.length + 1} style={{ height: visibleWindow.topHeight, padding: 0 }} />
                </tr>
              )}
              {visibleWindow.rows.map(row => {
                const rowActive = activeRowNumber === row.rowNumber

                return (
                  <SpreadsheetRow
                    key={row.id}
                    row={row}
                    columnsByKey={columnsByKey}
                    edited={edited}
                    sqlValues={sqlValues}
                    draftCellInRow={draftRowNumber === row.rowNumber ? draftCell : null}
                    activeCellInRow={rowActive ? activeCell : null}
                    editingCellInRow={rowActive ? editingCell : null}
                    rowActive={rowActive}
                    getInputRef={getInputRef}
                    onCellChange={updateCell}
                    onCellFocus={setFocusedCell}
                    onCellDoubleClick={startEditingCell}
                    onCellKeyDown={handleCellKeyDown}
                    onCellPaste={handleCellPaste}
                  />
                )
              })}
              {visibleWindow.bottomHeight > 0 && (
                <tr aria-hidden="true">
                  <td colSpan={currentPrevisionnelSheet.columns.length + 1} style={{ height: visibleWindow.bottomHeight, padding: 0 }} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  )
}

