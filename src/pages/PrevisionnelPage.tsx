import { useMemo, useState } from 'react'
import { Download, FileSpreadsheet, Filter, RotateCcw, Save, Search, TableProperties } from 'lucide-react'
import { currentPrevisionnelSheet } from '@/data/previsionnelCurrentSheet'
import { categoryLabels, euro } from '@/lib/previsionnelAnalytics'
import { exportCurrentPrevisionnelWorkbookFromCells, type WorkbookCellUpdates } from '@/lib/previsionnelExport'
import type { CurrentSheetCategory, CurrentSheetLineType, CurrentSheetRow } from '@/data/previsionnelCurrentSheet'

const typeLabels: Record<CurrentSheetLineType, string> = {
  blank: 'Vide',
  section: 'Section',
  total: 'Total',
  example: 'Exemple',
  commission: 'Commission',
  avoir: 'Avoir',
  remboursement: 'Remboursement',
  facturation: 'Facturation',
  chantier: 'Chantier',
}

const editableTypes: CurrentSheetLineType[] = ['chantier', 'commission', 'avoir', 'remboursement', 'facturation', 'example']

function asDisplay(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  return String(value)
}

function asNumber(value: string | number | null | undefined) {
  if (typeof value === 'number') return value
  if (!value) return 0
  const parsed = Number(String(value).replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}

function lineAmount(row: CurrentSheetRow, col: string) {
  return asNumber(row.cells.find(cell => cell.col === col)?.value)
}

function rowInitialValue(row: CurrentSheetRow, col: string) {
  return row.cells.find(cell => cell.col === col)?.value ?? null
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

function buildExportUpdates(edited: WorkbookCellUpdates) {
  const updates: WorkbookCellUpdates = {}

  currentPrevisionnelSheet.rows.forEach(row => {
    row.cells.forEach(cell => {
      if (!cell.editable) return
      updates[cell.ref] = Object.prototype.hasOwnProperty.call(edited, cell.ref) ? edited[cell.ref] : cell.value
    })
  })

  return updates
}

export function PrevisionnelPage() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<CurrentSheetLineType | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<CurrentSheetCategory | 'all'>('all')
  const [edited, setEdited] = useState<WorkbookCellUpdates>({})

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return currentPrevisionnelSheet.rows.filter(row => {
      if (typeFilter !== 'all' && row.lineType !== typeFilter) return false
      if (categoryFilter !== 'all' && row.category !== categoryFilter) return false
      if (!q) return true
      return row.name.toLowerCase().includes(q) || String(row.rowNumber).includes(q)
    })
  }, [categoryFilter, query, typeFilter])

  const editedCount = Object.keys(edited).length
  const chantierRows = currentPrevisionnelSheet.rows.filter(row => row.lineType === 'chantier')
  const caPrevision = chantierRows.reduce((sum, row) => sum + lineAmount(row, 'D'), 0)
  const caContrat = chantierRows.reduce((sum, row) => sum + lineAmount(row, 'E'), 0)
  const monthlyPlanned = chantierRows.reduce((sum, row) => {
    return sum + currentPrevisionnelSheet.monthPairs.reduce((monthSum, pair) => monthSum + lineAmount(row, pair.planned), 0)
  }, 0)

  function valueFor(ref: string, fallback: string | number | null) {
    return Object.prototype.hasOwnProperty.call(edited, ref) ? edited[ref] : fallback
  }

  function updateCell(ref: string, value: string, numeric: boolean) {
    setEdited(prev => ({
      ...prev,
      [ref]: numeric ? value.replace(/\s/g, '') : value,
    }))
  }

  async function handleExport() {
    await exportCurrentPrevisionnelWorkbookFromCells(buildExportUpdates(edited), currentPrevisionnelSheet.sheet)
  }

  return (
    <div className="min-h-full bg-[#FAF6F2] p-6 xl:p-8">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#F2E8DC] bg-white px-3 py-1 text-[12px] font-semibold text-[#6B6B6B]">
            <FileSpreadsheet className="h-3.5 w-3.5 text-[#F06B21]" />
            Feuille Excel reproduite : {currentPrevisionnelSheet.sheet}
          </div>
          <h1 className="text-[30px] font-bold leading-tight text-[#1E1E1E]">Prévisionnel éditable</h1>
          <p className="mt-2 max-w-3xl text-sm text-[#6B6B6B]">
            Interface de saisie web sur la structure du prévisionnel Excel. Les employés remplissent les cellules ici, puis exportent le même classeur `.xlsx` année en cours avec la mise en forme conservée.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setEdited({})}
            className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#F2E8DC] bg-white px-4 text-sm font-semibold text-[#1E1E1E] hover:bg-[#FAF6F2]"
          >
            <RotateCcw className="h-4 w-4 text-[#F06B21]" />
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={() => void handleExport()}
            className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-[#F06B21] px-4 text-sm font-semibold text-white hover:bg-[#D95B17]"
          >
            <Download className="h-4 w-4" />
            Exporter le Excel
          </button>
        </div>
      </div>

      <div className="mb-5 grid gap-4 xl:grid-cols-4">
        {[
          ['CA prévision', euro(caPrevision), 'Colonne D, lignes chantier'],
          ['CA contrat', euro(caContrat), 'Colonne E, lignes chantier'],
          ['Prévu mensuel', euro(monthlyPlanned), 'Somme AR:BO'],
          ['Cellules modifiées', editedCount.toLocaleString('fr-FR'), 'Non sauvegardé en base'],
        ].map(([label, value, detail]) => (
          <div key={label} className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">{label}</p>
            <p className="mt-3 text-[24px] font-bold leading-none text-[#1E1E1E]">{value}</p>
            <p className="mt-2 text-[12px] text-[#6B6B6B]">{detail}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-[20px] border border-[#F2E8DC] bg-white p-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Rechercher une ligne ou un n° Excel"
              className="h-10 w-[300px] rounded-[14px] border border-[#F2E8DC] bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#F06B21]/20"
            />
          </div>
          <select
            value={typeFilter}
            onChange={event => setTypeFilter(event.target.value as CurrentSheetLineType | 'all')}
            className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-sm font-semibold text-[#1E1E1E] outline-none focus:ring-2 focus:ring-[#F06B21]/20"
          >
            <option value="all">Toutes les lignes</option>
            {editableTypes.map(type => (
              <option key={type} value={type}>
                {typeLabels[type]}
              </option>
            ))}
            <option value="section">Sections</option>
            <option value="total">Totaux</option>
          </select>
          <select
            value={categoryFilter}
            onChange={event => setCategoryFilter(event.target.value as CurrentSheetCategory | 'all')}
            className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-sm font-semibold text-[#1E1E1E] outline-none focus:ring-2 focus:ring-[#F06B21]/20"
          >
            <option value="all">Toutes catégories</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#6B6B6B]">
          <Filter className="h-4 w-4 text-[#F06B21]" />
          {rows.length} ligne(s) affichées sur {currentPrevisionnelSheet.rows.length}
        </div>
      </div>

      <section className="overflow-hidden rounded-[20px] border border-[#F2E8DC] bg-white">
        <div className="flex items-center gap-2 border-b border-[#F2E8DC] px-5 py-3">
          <TableProperties className="h-4 w-4 text-[#F06B21]" />
          <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Tableur web 2025-26</h2>
          <span className="ml-auto text-[12px] text-[#6B6B6B]">Colonnes A:BP, lignes Excel conservées</span>
        </div>

        <div className="max-h-[68vh] overflow-auto">
          <table className="border-separate border-spacing-0 text-left text-[12px]">
            <thead className="sticky top-0 z-30">
              <tr>
                <th className="sticky left-0 z-40 min-w-[52px] border-b border-r border-[#EADBC8] bg-[#1E1E1E] px-2 py-2 text-center text-white">
                  #
                </th>
                {currentPrevisionnelSheet.columns.map(column => (
                  <th
                    key={`group-${column.key}`}
                    className="border-b border-r border-[#EADBC8] bg-[#1E1E1E] px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-[0.05em] text-white"
                    style={{ minWidth: column.width }}
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
                    className="border-b border-r border-[#EADBC8] bg-[#FDEBDD] px-2 py-2 text-center text-[11px] font-semibold text-[#1E1E1E]"
                    style={{ minWidth: column.width }}
                  >
                    <div>{column.key}</div>
                    <div className="mt-0.5 truncate text-[10px] font-medium text-[#6B6B6B]">{column.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id}>
                  <td
                    className="sticky left-0 z-20 border-b border-r border-[#EADBC8] px-2 py-1 text-center text-[11px] font-semibold"
                    style={{ backgroundColor: row.lineType === 'section' ? '#DCE9F2' : row.lineType === 'total' ? '#1E1E1E' : '#FAF6F2', color: cellColor(row) }}
                  >
                    {row.rowNumber}
                  </td>
                  {row.cells.map(cell => {
                    const column = currentPrevisionnelSheet.columns.find(item => item.key === cell.col)
                    const value = valueFor(cell.ref, cell.value)
                    const editable = cell.editable
                    const numeric = typeof rowInitialValue(row, cell.col) === 'number' || column?.kind === 'monthly' || column?.kind === 'ratio'
                    const changed = Object.prototype.hasOwnProperty.call(edited, cell.ref)
                    const stickyClass = cell.col === 'B' ? 'sticky left-[52px] z-10 shadow-[2px_0_0_#EADBC8]' : ''

                    return (
                      <td
                        key={cell.ref}
                        className={`border-b border-r border-[#EADBC8] p-0 ${stickyClass}`}
                        style={{
                          minWidth: column?.width ?? 92,
                          backgroundColor: changed ? '#FFF4EA' : cellBg(row, cell.fillId, editable),
                          color: cellColor(row),
                        }}
                      >
                        {editable ? (
                          <input
                            value={asDisplay(value)}
                            inputMode={numeric ? 'decimal' : 'text'}
                            onChange={event => updateCell(cell.ref, event.target.value, numeric)}
                            className="h-8 w-full min-w-0 border-0 bg-transparent px-2 text-[12px] font-medium text-[#1E1E1E] outline-none focus:bg-white focus:ring-2 focus:ring-inset focus:ring-[#F06B21]/30"
                            aria-label={`${cell.ref} ${row.name}`}
                          />
                        ) : (
                          <span className="block h-8 truncate px-2 py-2 text-[11px] font-medium">
                            {asDisplay(value)}
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-4 rounded-[14px] border border-[#F2E8DC] bg-white p-4 text-[12px] leading-6 text-[#6B6B6B]">
        <div className="mb-2 flex items-center gap-2 font-semibold text-[#1E1E1E]">
          <Save className="h-4 w-4 text-[#F06B21]" />
          État de cette version
        </div>
        La saisie est locale au navigateur et l’export réinjecte les cellules éditées dans le modèle Excel `2025-26`. La prochaine étape produit sera la sauvegarde SQL Connect des lignes mensuelles et la recalculation contrôlée des totaux côté backend.
      </div>
    </div>
  )
}
