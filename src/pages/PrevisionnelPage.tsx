import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Cloud, FileSpreadsheet, Filter, Loader2, Maximize2, Search, Send, TableProperties } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { loadPrevisionnelSheetFromSql } from '@/features/previsionnel/previsionnelSql'
import { buildPrevisionnelSqlGridState } from '@/features/previsionnel/previsionnelSqlValues'
import { currentPrevisionnelSheet } from '@/data/previsionnelCurrentSheet'
import { isDataConnectEnabled } from '@/lib/dataconnect'
import { waitForFirebaseUser } from '@/lib/firebaseAuthState'
import { categoryLabels, euro } from '@/lib/previsionnelAnalytics'
import { buildSpreadsheetView, type SpreadsheetCellUpdates } from '@/lib/previsionnelSpreadsheet'
import { useApp } from '@/lib/store'
import type { CurrentSheetCategory, CurrentSheetLineType } from '@/data/previsionnelCurrentSheet'

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
const STORAGE_KEY = `sosson:previsionnel:${currentPrevisionnelSheet.sheet}:cell-updates`
type SqlStatus = 'idle' | 'loading' | 'ready' | 'unavailable' | 'error'

function preloadSpreadsheetPage() {
  return import('@/pages/PrevisionnelSpreadsheetPage')
}

function asDisplay(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  return String(value)
}

export function PrevisionnelPage() {
  const navigate = useNavigate()
  const { user } = useApp()
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<CurrentSheetLineType | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<CurrentSheetCategory | 'all'>('all')
  const [isOpening, setIsOpening] = useState(false)
  const [progress, setProgress] = useState(0)
  const [sqlStatus, setSqlStatus] = useState<SqlStatus>('idle')
  const [sqlMessage, setSqlMessage] = useState('Lecture SQL Connect non lancee.')
  const [sqlValues, setSqlValues] = useState<SpreadsheetCellUpdates>({})
  const [sqlLineCount, setSqlLineCount] = useState(0)
  const [sqlCellEditCount, setSqlCellEditCount] = useState(0)
  const [edited] = useState<SpreadsheetCellUpdates>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as SpreadsheetCellUpdates
    } catch {
      return {}
    }
  })

  useEffect(() => {
    let mounted = true

    async function loadSqlPrevisionnel() {
      if (!isDataConnectEnabled || !user) {
        if (!mounted) return
        setSqlStatus('unavailable')
        setSqlMessage('Fallback local actif: Data Connect ou profil utilisateur indisponible.')
        setSqlValues({})
        setSqlLineCount(0)
        setSqlCellEditCount(0)
        return
      }

      setSqlStatus('loading')
      setSqlMessage(`Lecture SQL Connect ${currentPrevisionnelSheet.sheet} en cours.`)

      try {
        const firebaseUser = await waitForFirebaseUser()
        if (!firebaseUser) {
          if (!mounted) return
          setSqlStatus('unavailable')
          setSqlMessage('Fallback local actif: session Firebase absente pour SQL Connect.')
          setSqlValues({})
          setSqlLineCount(0)
          setSqlCellEditCount(0)
          return
        }

        const { exercise, lines, cellEdits } = await loadPrevisionnelSheetFromSql(currentPrevisionnelSheet.sheet)
        if (!mounted) return

        if (!exercise) {
          setSqlStatus('unavailable')
          setSqlMessage(`Fallback local actif: aucun exercice SQL ${currentPrevisionnelSheet.sheet}.`)
          setSqlValues({})
          setSqlLineCount(0)
          setSqlCellEditCount(0)
          return
        }

        setSqlValues(buildPrevisionnelSqlGridState(currentPrevisionnelSheet, lines, cellEdits).values)
        setSqlLineCount(lines.length)
        setSqlCellEditCount(cellEdits.length)
        setSqlStatus('ready')
        setSqlMessage(`${lines.length} lignes et ${cellEdits.length} cellule(s) relues depuis SQL Connect.`)
      } catch (error) {
        if (!mounted) return
        setSqlStatus('error')
        setSqlMessage(`Fallback local actif: SQL Connect indisponible (${error instanceof Error ? error.message : 'erreur inconnue'}).`)
        setSqlValues({})
        setSqlLineCount(0)
        setSqlCellEditCount(0)
      }
    }

    void loadSqlPrevisionnel()

    return () => {
      mounted = false
    }
  }, [user])

  const spreadsheet = useMemo(
    () => buildSpreadsheetView(currentPrevisionnelSheet, sqlValues, edited),
    [edited, sqlValues],
  )

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return spreadsheet.rows.filter(row => {
      if (typeFilter !== 'all' && row.lineType !== typeFilter) return false
      if (categoryFilter !== 'all' && row.category !== categoryFilter) return false
      if (!q) return true
      return row.name.toLowerCase().includes(q) || String(row.rowNumber).includes(q) || row.cells.some(cell => asDisplay(cell.value).toLowerCase().includes(q))
    })
  }, [categoryFilter, query, spreadsheet.rows, typeFilter])

  const editedCount = Object.keys(edited).length
  const { caPrevision, caContrat, monthlyPlanned } = spreadsheet.kpis
  const sourceLabel =
    sqlStatus === 'ready'
      ? 'Source SQL Connect'
      : sqlStatus === 'loading'
        ? 'Lecture SQL'
        : 'Fallback local visible'
  const sourceDetail =
    sqlStatus === 'ready'
      ? `${sqlLineCount} ligne(s) SQL + ${sqlCellEditCount} cellule(s) exactes`
      : 'Feuille TS et brouillon navigateur, pas une preuve sandbox distante'
  const kpiCards = [
    {
      label: 'CA prevision',
      value: euro(caPrevision),
      detail: sqlStatus === 'ready' ? 'Cellule D171 selon la logique Excel' : 'Cellule D171 depuis la reference locale',
    },
    {
      label: 'CA contrat',
      value: euro(caContrat),
      detail: sqlStatus === 'ready' ? 'Cellule E171 selon la logique Excel' : 'Cellule E171 depuis la reference locale',
    },
    {
      label: 'Total feuille',
      value: euro(monthlyPlanned),
      detail: sqlStatus === 'ready' ? 'Cellule F171 selon la logique Excel' : 'Cellule F171 depuis la reference locale',
    },
    {
      label: 'Cellules modifiees',
      value: editedCount.toLocaleString('fr-FR'),
      detail: sqlStatus === 'ready' ? `${sqlCellEditCount} cellule(s) SQL + brouillon navigateur` : 'Brouillon navigateur local',
    },
  ]

  async function openSpreadsheet() {
    if (isOpening) return

    setIsOpening(true)
    setProgress(40)

    try {
      await preloadSpreadsheetPage()
      setProgress(100)
      navigate('/previsionnel/tableur')
    } catch {
      setIsOpening(false)
      setProgress(0)
    }
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
            Synthese web sur la structure du previsionnel Excel. Les valeurs sont relues depuis SQL Connect quand l'auth et Data Connect repondent; sinon le fallback local reste explicitement signale.
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[16px] border border-[#F2E8DC] bg-white px-4 py-3 text-[12px] text-[#6B6B6B]">
        <span
          className="inline-flex items-center gap-2 rounded-[10px] px-3 py-1.5 font-semibold"
          style={{
            backgroundColor: sqlStatus === 'ready' ? '#E6F4EA' : sqlStatus === 'loading' ? '#FFF4EA' : '#FAF6F2',
            color: sqlStatus === 'ready' ? '#1E8E3E' : sqlStatus === 'loading' ? '#F06B21' : '#6B6B6B',
          }}
        >
          <Cloud className="h-4 w-4" />
          {sourceLabel}
        </span>
        <span>{sqlMessage}</span>
        <span className="ml-auto font-semibold text-[#1E1E1E]">{sourceDetail}</span>
      </div>

      <div className="mb-5 grid gap-4 xl:grid-cols-4">
        {kpiCards.map(({ label, value, detail }) => (
          <div key={label} className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">{label}</p>
            <p className="mt-3 text-[24px] font-bold leading-none text-[#1E1E1E]">{value}</p>
            <p className="mt-2 text-[12px] text-[#6B6B6B]">{detail}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[14px] border border-[#F2E8DC] bg-white px-4 py-3 text-[12px] text-[#6B6B6B]">
        <span className="inline-flex items-center gap-2 font-semibold text-[#1E1E1E]">
          <Send className="h-4 w-4 text-[#F06B21]" />
          Légende métier
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-5 rounded-[4px] border border-[#EADBC8] bg-[#FFF9B1]" />
          Jaune = facture envoyée
        </span>
        <span>Ce signal ne veut pas dire payé ou encaissé.</span>
        <span className="ml-auto inline-flex items-center gap-2 font-semibold text-[#1E1E1E]">
          <Cloud className="h-4 w-4 text-[#F06B21]" />
          Sauvegarde SQL disponible dans le tableur plein ecran; cette page ne masque pas le fallback
        </span>
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-[20px] border border-[#F2E8DC] bg-white p-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Rechercher une ligne ou un n° Excel"
              className="h-10 w-full rounded-[14px] border border-[#F2E8DC] bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#F06B21]/20 sm:w-[300px]"
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
          {sqlStatus === 'ready' && <span className="text-[#1E8E3E]">- base SQL chargee</span>}
        </div>
      </div>

      <section className="overflow-hidden rounded-[20px] border border-[#F2E8DC] bg-white">
        <div className="flex items-center gap-2 border-b border-[#F2E8DC] px-5 py-3">
          <TableProperties className="h-4 w-4 text-[#F06B21]" />
          <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Tableur web 2025-26</h2>
          <span className="ml-auto text-[12px] text-[#6B6B6B]">Colonnes A:BP, lignes Excel conservées</span>
        </div>

        <div className="flex min-h-[320px] items-center justify-center bg-[#FAF6F2] p-5">
          <div className="w-full max-w-[440px] rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <button
              type="button"
              onClick={() => void openSpreadsheet()}
              disabled={isOpening}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#F06B21] px-4 text-sm font-semibold text-white transition hover:bg-[#D95B17] disabled:cursor-wait disabled:bg-[#C8B18C]"
            >
              {isOpening ? <Loader2 className="h-4 w-4 animate-spin" /> : <Maximize2 className="h-4 w-4" />}
              Accéder au tableur plein écran
              {!isOpening && <ArrowRight className="h-4 w-4" />}
            </button>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#FAF6F2]">
              <div
                className="h-full rounded-full bg-[#F06B21] transition-[width] duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-[#6B6B6B]">
              <span>{isOpening ? 'Chargement réel de la page tableur' : 'Prêt à ouvrir en plein écran'}</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
