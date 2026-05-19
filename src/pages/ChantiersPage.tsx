import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CalendarDays, Check, CheckCircle, Clock, HardHat, Search, TriangleAlert, WifiOff, X } from 'lucide-react'
import type { Chantier, StatutChantier, TendanceChantier } from '@/data/chantiers'
import type { PrevisionnelCategory, PrevisionnelLine } from '@/data/previsionnel'
import { useApp } from '@/lib/store'
import { isDataConnectEnabled } from '@/lib/dataconnect'
import { canAccessPage } from '@/lib/accessControl'
import { categoryColors, categoryLabels, euro } from '@/lib/previsionnelAnalytics'
import { operationalPrevisionnelLines, previsionnelDataCoverage } from '@/lib/previsionnelModel'
import { useOperationalData } from '@/features/operations/useOperationalData'
import { createChantierInSql } from '@/features/operations/operationalAdapters'

type ExerciseFilter = string | 'all'
type CategoryFilter = PrevisionnelCategory | 'all'
type StatusFilter = StatutChantier | 'all'
type TendanceFilter = TendanceChantier | 'all'
type ChantierSort = 'source' | 'nom' | 'budget' | 'realise' | 'progress' | 'recent'

const exerciseOptions = Array.from(new Set(operationalPrevisionnelLines.map(line => line.exercise))).sort()
const latestExercise = exerciseOptions[exerciseOptions.length - 1] ?? 'all'
const categoryOptions = Object.keys(categoryLabels) as PrevisionnelCategory[]
const statusOptions: Array<{ key: StatusFilter; label: string }> = [
  { key: 'all', label: 'Tous statuts' },
  { key: 'prospect', label: 'Prospect' },
  { key: 'devis_a_faire', label: 'Devis a faire' },
  { key: 'devis_envoye', label: 'Devis envoye' },
  { key: 'signe', label: 'Signe' },
  { key: 'en_preparation', label: 'En preparation' },
  { key: 'en_cours', label: 'En cours' },
  { key: 'en_pause', label: 'En pause' },
  { key: 'termine', label: 'Termine' },
  { key: 'cloture', label: 'Clôturé' },
  { key: 'annule', label: 'Annule' },
]
const tendanceOptions: Array<{ key: TendanceFilter; label: string }> = [
  { key: 'all', label: 'Tous risques' },
  { key: 'rouge', label: 'Risque marge' },
  { key: 'orange', label: 'Surveillance' },
  { key: 'vert', label: 'Maîtrisé' },
]

function chantierLineId(chantierId: string) {
  if (!chantierId.startsWith('prev-chantier-')) return null
  return `prev-${chantierId.replace(/^prev-chantier-/, '')}`
}

function amountBase(line?: PrevisionnelLine, fallback = 0) {
  if (!line) return fallback
  return line.caPrevision || line.caContrat || line.plannedTotal || line.realizedTotal
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusMeta(statut: StatutChantier) {
  if (statut === 'prospect') return { label: 'Prospect', className: 'bg-[#FAF6F2] text-[#6B6B6B]', Icon: Clock }
  if (statut === 'devis_a_faire') return { label: 'Devis a faire', className: 'bg-[#FDEBDD] text-[#D95B17]', Icon: Clock }
  if (statut === 'devis_envoye') return { label: 'Devis envoye', className: 'bg-[#F1E6D6] text-[#A45A2C]', Icon: Clock }
  if (statut === 'signe') return { label: 'Signe', className: 'bg-[#E6F4EA] text-[#1E8E3E]', Icon: CheckCircle }
  if (statut === 'en_preparation') return { label: 'En preparation', className: 'bg-[#FAF6F2] text-[#3C3C3C]', Icon: CalendarDays }
  if (statut === 'en_cours') return { label: 'En cours', className: 'bg-[#FDEBDD] text-[#F06B21]', Icon: Clock }
  if (statut === 'en_pause') return { label: 'En pause', className: 'bg-[#FAF6F2] text-[#6B6B6B]', Icon: Clock }
  if (statut === 'termine') return { label: 'Termine', className: 'bg-[#E6F4EA] text-[#1E8E3E]', Icon: CheckCircle }
  if (statut === 'cloture') return { label: 'Clôturé', className: 'bg-[#F1E6D6] text-[#3C3C3C]', Icon: CheckCircle }
  return { label: 'Annule', className: 'bg-[#FEE2E2] text-[#DC2626]', Icon: TriangleAlert }
}

function tendencyMeta(tendance: TendanceChantier) {
  if (tendance === 'rouge') return { label: 'Risque marge', className: 'bg-[#FEE2E2] text-[#DC2626]' }
  if (tendance === 'orange') return { label: 'Surveillance', className: 'bg-[#FDEBDD] text-[#F06B21]' }
  return { label: 'Maîtrisé', className: 'bg-[#FAF6F2] text-[#3C3C3C]' }
}

function progressClass(progress: number, tendance: TendanceChantier) {
  if (tendance === 'rouge' || progress > 105) return 'bg-[#DC2626]'
  if (tendance === 'orange' || progress > 90) return 'bg-[#F06B21]'
  return 'bg-[#1E1E1E]'
}

function createInitialChantierForm() {
  const dateDebut = new Date()
  const dateFinPrevue = new Date(dateDebut)
  dateFinPrevue.setDate(dateDebut.getDate() + 30)

  return {
    clientId: '',
    nom: '',
    statut: 'devis_a_faire' as StatutChantier,
    dateDebut: dateDebut.toISOString().slice(0, 10),
    dateFinPrevue: dateFinPrevue.toISOString().slice(0, 10),
    budgetPrevisionnel: '',
    adresse: '',
    description: '',
  }
}

export function ChantiersPage() {
  const { chantiers, clients, source: operationalSource, isLoading: isOperationalLoading } = useOperationalData()
  const { user, accessMatrix, addChantier } = useApp()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [chantierQuery, setChantierQuery] = useState('')
  const [exerciseFilter, setExerciseFilter] = useState<ExerciseFilter>(latestExercise)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [tendanceFilter, setTendanceFilter] = useState<TendanceFilter>('all')
  const [chantierSort, setChantierSort] = useState<ChantierSort>('recent')
  const coverage = previsionnelDataCoverage()

  const canCreate = canAccessPage(user?.role, 'chantiers', accessMatrix, 'create')
  const canWriteSql = operationalSource === 'dataconnect' && isDataConnectEnabled && Boolean(user)
  const defaultClientId = clients[0]?.id ?? ''
  const [form, setForm] = useState(() => createInitialChantierForm())
  const linesById = useMemo(() => new Map(operationalPrevisionnelLines.map(line => [line.id, line])), [])
  const clientsById = useMemo(() => new Map(clients.map(client => [client.id, client])), [clients])

  const roleScopedChantiers = useMemo(() => {
    if (user?.role !== 'chef_chantier') return chantiers
    const chefName = `${user.prenom} ${user.nom}`
    return chantiers.filter(chantier => chantier.chefChantier === chefName)
  }, [chantiers, user])

  const chantierRows = useMemo(() => {
    return roleScopedChantiers.map(chantier => {
      const line = linesById.get(chantierLineId(chantier.id) ?? '')
      const client = clientsById.get(chantier.clientId)
      const budget = amountBase(line, chantier.budgetPrevisionnel)
      const realised = line?.realizedTotal ?? chantier.depensesEngagees
      const progress = budget > 0 ? Math.round((realised / budget) * 100) : 0
      const invoiceSentCells = line?.monthly.filter(month => month.invoiceSent).length ?? 0

      return {
        key: chantier.id,
        chantier,
        line,
        client,
        displayName: line?.rawName || chantier.nom,
        clientName: client?.nom ?? line?.clientName ?? 'Client non renseigné',
        exercise: line?.exercise ?? null,
        sourceRow: line?.sourceRow ?? null,
        category: line?.category ?? null,
        budget,
        realised,
        invoiced: line?.invoicedTotal ?? 0,
        progress,
        invoiceSentCells,
      }
    })
  }, [clientsById, linesById, roleScopedChantiers])

  const exerciseScopedRows = chantierRows.filter(row => exerciseFilter === 'all' || row.exercise === exerciseFilter)
  const categoryScopedRows = exerciseScopedRows.filter(row => categoryFilter === 'all' || row.category === categoryFilter)
  const statusScopedRows = categoryScopedRows.filter(row => statusFilter === 'all' || row.chantier.statut === statusFilter)
  const riskScopedRows = statusScopedRows.filter(row => tendanceFilter === 'all' || row.chantier.tendance === tendanceFilter)
  const directoryRows = riskScopedRows
    .filter(row => {
      const query = chantierQuery.trim().toLowerCase()
      if (!query) return true
      return [
        row.displayName,
        row.clientName,
        row.exercise ?? '',
        row.sourceRow ? `ligne ${row.sourceRow}` : '',
        row.category ? categoryLabels[row.category] : '',
        row.chantier.nom,
        row.chantier.description,
      ].some(value => value.toLowerCase().includes(query))
    })
    .sort((a, b) => {
      if (chantierSort === 'nom') return a.displayName.localeCompare(b.displayName, 'fr')
      if (chantierSort === 'budget') return b.budget - a.budget
      if (chantierSort === 'realise') return b.realised - a.realised
      if (chantierSort === 'progress') return b.progress - a.progress
      if (chantierSort === 'recent') {
        const dateCompare = b.chantier.dateDebut.localeCompare(a.chantier.dateDebut)
        if (dateCompare !== 0) return dateCompare
        if (a.exercise && b.exercise && a.exercise !== b.exercise) return b.exercise.localeCompare(a.exercise, 'fr')
        return (a.sourceRow ?? 0) - (b.sourceRow ?? 0)
      }
      if (a.exercise && b.exercise && a.exercise !== b.exercise) return b.exercise.localeCompare(a.exercise, 'fr')
      return (a.sourceRow ?? 0) - (b.sourceRow ?? 0)
    })

  const totalBudget = directoryRows.reduce((sum, row) => sum + row.budget, 0)
  const totalRealise = directoryRows.reduce((sum, row) => sum + row.realised, 0)
  const riskCount = directoryRows.filter(row => row.chantier.tendance === 'rouge').length
  const invoiceSentCount = directoryRows.reduce((sum, row) => sum + row.invoiceSentCells, 0)
  const exerciseScopedLineCount = operationalPrevisionnelLines.filter(line => exerciseFilter === 'all' || line.exercise === exerciseFilter).length

  async function handleCreateChantier(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canCreate) {
      setFeedback('Creation chantier non autorisee pour ce profil.')
      return
    }

    const clientId = form.clientId || defaultClientId
    const budget = Number(form.budgetPrevisionnel)
    const chantierInput = {
      clientId,
      chefChantierId: user?.role === 'chef_chantier' ? user.id : null,
      nom: form.nom.trim(),
      statut: form.statut,
      dateDebut: form.dateDebut,
      dateFinPrevue: form.dateFinPrevue,
      budgetPrevisionnel: budget,
      description: form.description.trim() || null,
      adresse: form.adresse.trim() || null,
    }

    if (!chantierInput.clientId || !chantierInput.nom || !Number.isFinite(budget)) {
      setFeedback('Completez le client, le nom et le budget du chantier.')
      return
    }

    const nextChantier: Chantier = {
      id: `local-chantier-${Date.now()}`,
      nom: chantierInput.nom,
      clientId: chantierInput.clientId,
      statut: chantierInput.statut,
      dateDebut: chantierInput.dateDebut,
      dateFin: null,
      dateFinPrevue: chantierInput.dateFinPrevue,
      budgetPrevisionnel: budget,
      depensesEngagees: 0,
      description: chantierInput.description ?? '',
      adresse: chantierInput.adresse ?? '',
      chefChantier: user?.role === 'chef_chantier' ? `${user.prenom} ${user.nom}` : '',
      tendance: 'vert',
      factureIds: [],
      emailIds: [],
    }

    setIsSaving(true)
    try {
      if (canWriteSql) {
        nextChantier.id = await createChantierInSql(chantierInput)
        setFeedback('Chantier cree dans SQL Connect.')
      } else {
        setFeedback('Chantier ajoute localement. Ce fallback ne prouve pas une ecriture SQL.')
      }

      addChantier(nextChantier)
      setSaved(true)
      setTimeout(() => { setSaved(false); setShowModal(false) }, 1200)
      setForm(current => ({
        ...current,
        clientId: '',
        nom: '',
        statut: 'devis_a_faire',
        budgetPrevisionnel: '',
        adresse: '',
        description: '',
      }))
    } catch (error) {
      console.error(error)
      setFeedback("Ecriture SQL Connect impossible. Aucun chantier local n'a ete cree.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-full bg-[#FAF6F2] p-8">
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1E1E]">Chantiers</h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">
            {directoryRows.length.toLocaleString('fr-FR')} chantier{directoryRows.length > 1 ? 's' : ''} affiché{directoryRows.length > 1 ? 's' : ''}
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => {
              if (!form.clientId && defaultClientId) setForm(current => ({ ...current, clientId: defaultClientId }))
              setShowModal(true)
            }}
            className="flex w-fit items-center gap-2 rounded-[14px] bg-[#F06B21] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#D95B17]"
          >
            <HardHat size={16} />
            Nouveau chantier
          </button>
        )}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#F2E8DC] bg-white px-4 text-sm font-medium text-[#3C3C3C]">
          {isOperationalLoading ? 'Chargement SQL...' : operationalSource === 'dataconnect' ? 'Source SQL Connect' : 'Source locale / Excel'}
        </span>
        <span className={`inline-flex h-10 items-center gap-2 rounded-[14px] border px-4 text-sm font-medium ${canWriteSql ? 'border-[#D7E7D9] bg-[#F7FBF7] text-[#1E8E3E]' : 'border-[#F2E8DC] bg-white text-[#D95B17]'}`}>
          {!canWriteSql && <WifiOff className="h-4 w-4" strokeWidth={1.75} />}
          {canWriteSql ? 'Creation SQL Connect' : 'Creation locale hors SQL'}
        </span>
      </div>

      {feedback && (
        <div className="mb-5 flex items-center justify-between rounded-[14px] border border-[#F2E8DC] bg-white px-4 py-3 text-[13px] font-medium text-[#3C3C3C]">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback('')} className="text-[#F06B21] hover:text-[#D95B17]">OK</button>
        </div>
      )}

      <div className="mb-6 grid gap-4 xl:grid-cols-4">
        <div className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">Portefeuille</p>
          <p className="mt-3 text-[26px] font-bold leading-none text-[#1E1E1E]">{directoryRows.length}</p>
          <p className="mt-2 text-[12px] text-[#6B6B6B]">Chantiers après filtres</p>
        </div>
        <div className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">Budget</p>
          <p className="mt-3 text-[26px] font-bold leading-none text-[#1E1E1E]">{euro(totalBudget)}</p>
          <p className="mt-2 text-[12px] text-[#6B6B6B]">Base prévision / contrat Excel</p>
        </div>
        <div className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">Réalisé</p>
          <p className="mt-3 text-[26px] font-bold leading-none text-[#1E1E1E]">{euro(totalRealise)}</p>
          <p className="mt-2 text-[12px] text-[#6B6B6B]">Montants réalisés du prévisionnel</p>
        </div>
        <div className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">Alertes</p>
          <p className="mt-3 text-[26px] font-bold leading-none text-[#1E1E1E]">{riskCount}</p>
          <p className="mt-2 text-[12px] text-[#6B6B6B]">{invoiceSentCount} cellule{invoiceSentCount > 1 ? 's' : ''} jaune facture envoyée</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-[#F2E8DC] bg-white">
        <div className="border-b border-[#F2E8DC] p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h2 className="text-[17px] font-semibold text-[#1E1E1E]">Répertoire chantiers</h2>
              <p className="mt-1 text-[12px] text-[#6B6B6B]">
                {directoryRows.length.toLocaleString('fr-FR')} ligne{directoryRows.length > 1 ? 's' : ''} sur {categoryScopedRows.length.toLocaleString('fr-FR')} pour {exerciseFilter === 'all' ? 'tous les exercices' : `l'exercice ${exerciseFilter}`}.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_150px_150px_160px] xl:w-[860px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  value={chantierQuery}
                  onChange={event => setChantierQuery(event.target.value)}
                  placeholder="Rechercher chantier, client, ligne..."
                  className="h-10 w-full rounded-[14px] border border-[#F2E8DC] bg-white pl-9 pr-3 text-sm text-[#1E1E1E] outline-none placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-[#F06B21]/20"
                />
              </div>
              <select
                value={exerciseFilter}
                onChange={event => setExerciseFilter(event.target.value as ExerciseFilter)}
                className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-sm font-medium text-[#1E1E1E] outline-none focus:ring-2 focus:ring-[#F06B21]/20"
                aria-label="Filtrer par exercice"
              >
                <option value="all">Tous exercices</option>
                {exerciseOptions.map(exercise => (
                  <option key={exercise} value={exercise}>{exercise}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={event => setStatusFilter(event.target.value as StatusFilter)}
                className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-sm font-medium text-[#1E1E1E] outline-none focus:ring-2 focus:ring-[#F06B21]/20"
                aria-label="Filtrer par statut"
              >
                {statusOptions.map(option => (
                  <option key={option.key} value={option.key}>{option.label}</option>
                ))}
              </select>
              <select
                value={chantierSort}
                onChange={event => setChantierSort(event.target.value as ChantierSort)}
                className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-sm font-medium text-[#1E1E1E] outline-none focus:ring-2 focus:ring-[#F06B21]/20"
                aria-label="Trier les chantiers"
              >
                <option value="recent">Tri récent</option>
                <option value="source">Tri Excel</option>
                <option value="nom">Tri nom</option>
                <option value="budget">Tri budget</option>
                <option value="realise">Tri réalisé</option>
                <option value="progress">Tri avancement</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {tendanceOptions.map(option => {
              const active = tendanceFilter === option.key
              const count = option.key === 'all'
                ? statusScopedRows.length
                : statusScopedRows.filter(row => row.chantier.tendance === option.key).length
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setTendanceFilter(option.key)}
                  className={`inline-flex h-9 items-center gap-2 rounded-[10px] border px-3 text-[12px] font-semibold transition-colors ${
                    active
                      ? 'border-[#F06B21] bg-[#FDEBDD] text-[#F06B21]'
                      : 'border-[#F2E8DC] bg-white text-[#6B6B6B] hover:bg-[#FAF6F2] hover:text-[#1E1E1E]'
                  }`}
                >
                  {option.key === 'rouge' && <TriangleAlert className="h-3.5 w-3.5" strokeWidth={1.75} />}
                  {option.label}
                  <span className={active ? 'text-[#F06B21]' : 'text-[#9CA3AF]'}>{count.toLocaleString('fr-FR')}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { key: 'all' as const, label: 'Toutes catégories', count: exerciseScopedLineCount, color: '#F06B21' },
              ...categoryOptions.map(category => ({
                key: category,
                label: categoryLabels[category],
                count: operationalPrevisionnelLines.filter(line => line.category === category && (exerciseFilter === 'all' || line.exercise === exerciseFilter)).length,
                color: categoryColors[category],
              })),
            ].map(option => {
              const active = categoryFilter === option.key
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setCategoryFilter(option.key)}
                  className="inline-flex h-9 items-center gap-2 rounded-[10px] border px-3 text-[12px] font-semibold transition-colors hover:bg-[#FAF6F2]"
                  style={{
                    borderColor: active ? option.color : '#F2E8DC',
                    backgroundColor: active ? '#FAF6F2' : '#FFFFFF',
                    color: active ? option.color : '#6B6B6B',
                  }}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: option.color }} />
                  {option.label}
                  <span style={{ color: active ? option.color : '#9CA3AF' }}>{option.count.toLocaleString('fr-FR')}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="max-h-[680px] overflow-auto">
          <table className="w-full min-w-[1280px] text-left text-[13px]">
            <thead className="sticky top-0 z-10 bg-[#FAF6F2] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B6B6B]">
              <tr>
                <th className="px-5 py-3">Chantier</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Catégorie</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Risque</th>
                <th className="px-5 py-3">Début</th>
                <th className="px-5 py-3 text-right">Budget</th>
                <th className="px-5 py-3 text-right">Réalisé</th>
                <th className="px-5 py-3 text-right">Facturé/envoyé</th>
                <th className="px-5 py-3 text-right">Avancement</th>
                <th className="w-12 px-5 py-3" aria-label="Ouvrir" />
              </tr>
            </thead>
            <tbody>
              {directoryRows.map(row => {
                const status = statusMeta(row.chantier.statut)
                const tendency = tendencyMeta(row.chantier.tendance)
                const StatusIcon = status.Icon
                return (
                  <tr
                    key={row.key}
                    className="group cursor-pointer border-t border-[#F2E8DC] transition-colors hover:bg-[#FFF9F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F06B21]/30"
                    onClick={() => navigate(`/chantiers/${row.chantier.id}`)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        navigate(`/chantiers/${row.chantier.id}`)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <td className="px-5 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-[#FDEBDD] text-[#F06B21]">
                          <HardHat className="h-4 w-4" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#1E1E1E] transition-colors group-hover:text-[#F06B21]">{row.displayName}</p>
                          <p className="mt-0.5 truncate text-[11px] text-[#6B6B6B]">
                            {row.exercise ? `Exercice ${row.exercise} · ligne Excel ${row.sourceRow}` : row.chantier.description || 'Source non renseignée'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#3C3C3C]">{row.clientName}</td>
                    <td className="px-5 py-3">
                      {row.category ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-[6px] border px-2 py-0.5 text-[11px] font-semibold"
                          style={{ borderColor: categoryColors[row.category], color: categoryColors[row.category] }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: categoryColors[row.category] }} />
                          {categoryLabels[row.category]}
                        </span>
                      ) : (
                        <span className="text-[#9CA3AF]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[11px] font-semibold ${status.className}`}>
                        <StatusIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-[6px] px-2.5 py-1 text-[11px] font-semibold ${tendency.className}`}>
                        {tendency.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#3C3C3C]">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 text-[#9CA3AF]" strokeWidth={1.75} />
                        {formatDate(row.chantier.dateDebut)}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-[#1E1E1E]">{row.budget ? euro(row.budget) : '—'}</td>
                    <td className="px-5 py-3 text-right text-[#3C3C3C]">{row.realised ? euro(row.realised) : '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="font-semibold text-[#1E1E1E]">{row.invoiced ? euro(row.invoiced) : '—'}</div>
                      <div className="text-[11px] text-[#6B6B6B]">{row.invoiceSentCells} cellule{row.invoiceSentCells > 1 ? 's' : ''} jaune</div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="mb-1 flex items-center justify-end gap-2">
                        <span className={row.progress > 105 ? 'font-semibold text-[#DC2626]' : 'font-semibold text-[#1E1E1E]'}>
                          {row.progress}%
                        </span>
                      </div>
                      <div className="ml-auto h-1.5 w-24 overflow-hidden rounded-full bg-[#EADBC8]">
                        <div className={`h-full rounded-full ${progressClass(row.progress, row.chantier.tendance)}`} style={{ width: `${Math.min(row.progress, 100)}%` }} />
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <ArrowRight size={17} className="text-[#9CA3AF] transition-colors group-hover:text-[#F06B21]" strokeWidth={1.75} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {directoryRows.length === 0 && (
          <div className="border-t border-[#F2E8DC] px-5 py-10 text-center">
            <p className="text-sm font-semibold text-[#1E1E1E]">Aucun chantier trouvé</p>
            <p className="mt-1 text-[12px] text-[#6B6B6B]">Ajustez la recherche, l'exercice, la catégorie ou le statut.</p>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-[20px] border border-[#F2E8DC] bg-white p-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">Contrôle source</p>
        <p className="mt-2 text-sm text-[#3C3C3C]">
          La vue s'appuie sur {coverage.operationalLines.toLocaleString('fr-FR')} lignes chantier exploitables du prévisionnel, avec {coverage.syntheticOrNonOperationalLines} lignes de synthèse exclues.
          Les cellules jaunes indiquent une facture envoyée, pas un paiement encaissé.
        </p>
      </div>

      {showModal && canCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-[20px] border border-[#F2E8DC] bg-white shadow-[0_24px_80px_rgba(30,30,30,0.18)]">
            <div className="flex items-center justify-between border-b border-[#F2E8DC] px-6 py-5">
              <div>
                <h2 className="font-semibold text-[#1E1E1E]">Nouveau chantier</h2>
                <p className="mt-1 text-[12px] text-[#6B6B6B]">
                  {canWriteSql ? 'Creation dans SQL Connect.' : 'Creation locale hors SQL, non durable.'}
                </p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="text-[#9CA3AF] hover:text-[#1E1E1E]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateChantier} className="space-y-4 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Client *</label>
                  <select
                    required
                    value={form.clientId || defaultClientId}
                    onChange={event => setForm(current => ({ ...current, clientId: event.target.value }))}
                    className="w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20"
                  >
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.nom}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Nom chantier *</label>
                  <input
                    required
                    value={form.nom}
                    onChange={event => setForm(current => ({ ...current, nom: event.target.value }))}
                    className="w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Statut</label>
                  <select
                    value={form.statut}
                    onChange={event => setForm(current => ({ ...current, statut: event.target.value as StatutChantier }))}
                    className="w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20"
                  >
                    {statusOptions.filter(option => option.key !== 'all').map(option => (
                      <option key={option.key} value={option.key}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Budget previsionnel *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.budgetPrevisionnel}
                    onChange={event => setForm(current => ({ ...current, budgetPrevisionnel: event.target.value }))}
                    className="w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Date debut</label>
                  <input
                    type="date"
                    value={form.dateDebut}
                    onChange={event => setForm(current => ({ ...current, dateDebut: event.target.value }))}
                    className="w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Fin prevue</label>
                  <input
                    type="date"
                    value={form.dateFinPrevue}
                    onChange={event => setForm(current => ({ ...current, dateFinPrevue: event.target.value }))}
                    className="w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Adresse</label>
                  <input
                    value={form.adresse}
                    onChange={event => setForm(current => ({ ...current, adresse: event.target.value }))}
                    className="w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Description</label>
                  <textarea
                    value={form.description}
                    onChange={event => setForm(current => ({ ...current, description: event.target.value }))}
                    className="min-h-24 w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSaving || !clients.length}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${saved ? 'bg-[#1E8E3E] text-white' : 'bg-[#F06B21] text-white hover:bg-[#D95B17]'}`}
              >
                {saved ? <><Check size={16} /> Chantier cree !</> : isSaving ? 'Enregistrement...' : 'Creer le chantier'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
