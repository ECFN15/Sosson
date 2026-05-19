import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowRight, X, Check, Search, Database, Mail, Phone, MapPin, Users, WifiOff } from 'lucide-react'
import type { Client } from '@/data/clients'
import { useApp } from '@/lib/store'
import { isDataConnectEnabled } from '@/lib/dataconnect'
import { canAccessPage } from '@/lib/accessControl'
import { categoryColors, categoryLabels, euro } from '@/lib/previsionnelAnalytics'
import { operationalPrevisionnelLines, previsionnelDataCoverage } from '@/lib/previsionnelModel'
import type { PrevisionnelCategory } from '@/data/previsionnel'
import { useOperationalData } from '@/features/operations/useOperationalData'
import { createClientInSql } from '@/features/operations/operationalAdapters'

const typeLabel = { particulier: 'Particulier', professionnel: 'Professionnel', public: 'Collectivité' }
const typeColor = {
  particulier: 'bg-[#FDEBDD] text-[#F06B21]',
  professionnel: 'bg-[#F1E6D6] text-[#A45A2C]',
  public: 'bg-[#DCE9F2] text-[#3C3C3C]',
}
const typeOptions = ['particulier', 'professionnel', 'public'] as const

type ClientTypeFilter = Client['type'] | 'all'
type ClientSort = 'nom' | 'ville' | 'chantiers' | 'recent'
type ExerciseFilter = string | 'all'
type CategoryFilter = PrevisionnelCategory | 'all'

const exerciseOptions = Array.from(new Set(operationalPrevisionnelLines.map(line => line.exercise))).sort()
const latestExercise = exerciseOptions[exerciseOptions.length - 1] ?? 'all'
const categoryOptions = Object.keys(categoryLabels) as PrevisionnelCategory[]

function normalizeKey(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function formatDate(value: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function ClientsPage() {
  const { clients, chantiers, source: operationalSource, isLoading: isOperationalLoading } = useOperationalData()
  const { user, addClient, accessMatrix } = useApp()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [permissionFeedback, setPermissionFeedback] = useState('')
  const [clientQuery, setClientQuery] = useState('')
  const [clientTypeFilter, setClientTypeFilter] = useState<ClientTypeFilter>('all')
  const [clientSort, setClientSort] = useState<ClientSort>('nom')
  const [exerciseFilter, setExerciseFilter] = useState<ExerciseFilter>(latestExercise)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [portfolioQuery, setPortfolioQuery] = useState('')
  const [form, setForm] = useState({
    nom: '', type: 'particulier' as Client['type'],
    prenom: '', email: '', telephone: '', adresse: '', ville: '', codePostal: '',
    typeChantierCible: '', souhaits: '', notes: '',
  })
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const coverage = previsionnelDataCoverage()

  const canCreate = canAccessPage(user?.role, 'clients', accessMatrix, 'create')
  const canWriteSql = operationalSource === 'dataconnect' && isDataConnectEnabled && Boolean(user)
  const chantiersByClient = useMemo(() => {
    const grouped = new Map<string, typeof chantiers>()
    chantiers.forEach(chantier => {
      const list = grouped.get(chantier.clientId) ?? []
      list.push(chantier)
      grouped.set(chantier.clientId, list)
    })
    return grouped
  }, [chantiers])
  const clientsById = useMemo(() => new Map(clients.map(client => [client.id, client])), [clients])
  const chantiersById = useMemo(() => new Map(chantiers.map(chantier => [chantier.id, chantier])), [chantiers])

  const excelClientStatsByKey = useMemo(() => {
    const stats = new Map<string, {
      exercises: Set<string>
      categories: Set<PrevisionnelCategory>
      byExercise: Record<string, {
        chantierCount: number
        totalBudget: number
        totalDepenses: number
        categories: Set<PrevisionnelCategory>
        byCategory: Record<PrevisionnelCategory, { chantierCount: number; totalBudget: number; totalDepenses: number }>
      }>
    }>()

    operationalPrevisionnelLines.forEach(line => {
      const canonicalKey = normalizeKey(line.clientKey || line.clientName)
      if (!canonicalKey) return

      const item = stats.get(canonicalKey) ?? { exercises: new Set<string>(), categories: new Set<PrevisionnelCategory>(), byExercise: {} }
      const exerciseStats = item.byExercise[line.exercise] ?? {
        chantierCount: 0,
        totalBudget: 0,
        totalDepenses: 0,
        categories: new Set<PrevisionnelCategory>(),
        byCategory: {} as Record<PrevisionnelCategory, { chantierCount: number; totalBudget: number; totalDepenses: number }>,
      }
      const categoryStats = exerciseStats.byCategory[line.category] ?? { chantierCount: 0, totalBudget: 0, totalDepenses: 0 }
      const amountBase = line.caPrevision || line.caContrat || line.plannedTotal || line.realizedTotal

      item.exercises.add(line.exercise)
      item.categories.add(line.category)
      exerciseStats.chantierCount += 1
      exerciseStats.totalBudget += amountBase
      exerciseStats.totalDepenses += line.realizedTotal
      exerciseStats.categories.add(line.category)
      categoryStats.chantierCount += 1
      categoryStats.totalBudget += amountBase
      categoryStats.totalDepenses += line.realizedTotal
      exerciseStats.byCategory[line.category] = categoryStats
      item.byExercise[line.exercise] = exerciseStats

      stats.set(canonicalKey, item)
      stats.set(normalizeKey(line.clientName), item)
      stats.set(normalizeKey(line.rawName), item)
      stats.set(`prev-client-${canonicalKey}`, item)
    })

    return stats
  }, [])

  const clientStats = useCallback((client: Client) => {
    return excelClientStatsByKey.get(client.id)
      ?? excelClientStatsByKey.get(client.id.replace(/^prev-client-/, ''))
      ?? excelClientStatsByKey.get(normalizeKey(client.nom))
  }, [excelClientStatsByKey])

  const clientMatchesExercise = useCallback((client: Client) => {
    if (exerciseFilter === 'all') return true
    return Boolean(clientStats(client)?.exercises.has(exerciseFilter))
  }, [clientStats, exerciseFilter])

  const clientMatchesCategory = useCallback((client: Client) => {
    if (categoryFilter === 'all') return true
    const stats = clientStats(client)
    if (!stats) return false
    if (exerciseFilter === 'all') return stats.categories.has(categoryFilter)
    return Boolean(stats.byExercise[exerciseFilter]?.categories.has(categoryFilter))
  }, [categoryFilter, clientStats, exerciseFilter])

  const chantierMatchesExercise = useCallback((chantier: typeof chantiers[number]) => {
    if (exerciseFilter === 'all') return true
    if (chantier.nom.includes(`(${exerciseFilter})`)) return true

    const startYear = Number(exerciseFilter.slice(0, 4))
    if (!Number.isFinite(startYear)) return false

    return chantier.dateDebut >= `${startYear}-10-01` && chantier.dateDebut < `${startYear + 1}-10-01`
  }, [exerciseFilter])

  const filteredClients = useMemo(() => {
    const query = clientQuery.trim().toLowerCase()

    return [...clients]
      .filter(client => {
        if (clientTypeFilter !== 'all' && client.type !== clientTypeFilter) return false
        if (!clientMatchesExercise(client)) return false
        if (!clientMatchesCategory(client)) return false
        if (!query) return true

        return [
          client.nom,
          client.email,
          client.telephone,
          client.ville,
          client.codePostal,
          client.adresse,
          ...(chantiersByClient.get(client.id) ?? []).map(chantier => chantier.nom),
        ].some(value => value.toLowerCase().includes(query))
      })
      .sort((a, b) => {
        if (clientSort === 'ville') {
          return `${a.ville} ${a.nom}`.localeCompare(`${b.ville} ${b.nom}`, 'fr')
        }
        if (clientSort === 'chantiers') {
          if (exerciseFilter !== 'all') {
            const aCount = clientStats(a)?.byExercise[exerciseFilter]?.chantierCount ?? 0
            const bCount = clientStats(b)?.byExercise[exerciseFilter]?.chantierCount ?? 0
            return bCount - aCount
          }
          return (chantiersByClient.get(b.id)?.length ?? 0) - (chantiersByClient.get(a.id)?.length ?? 0)
        }
        if (clientSort === 'recent') {
          return new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
        }
        return a.nom.localeCompare(b.nom, 'fr')
      })
  }, [chantiersByClient, clientMatchesCategory, clientMatchesExercise, clientQuery, clientSort, clientStats, clientTypeFilter, clients, exerciseFilter])

  const exerciseScopedClients = clients.filter(client => clientMatchesExercise(client))
  const categoryScopedClients = exerciseScopedClients.filter(client => clientMatchesCategory(client))
  const exerciseScopedLineCount = operationalPrevisionnelLines.filter(line => exerciseFilter === 'all' || line.exercise === exerciseFilter).length
  const directoryRows = useMemo(() => {
    const query = clientQuery.trim().toLowerCase()

    if (categoryFilter !== 'all') {
      return operationalPrevisionnelLines
        .filter(line => {
          if (line.category !== categoryFilter) return false
          if (exerciseFilter !== 'all' && line.exercise !== exerciseFilter) return false

          const clientId = `prev-client-${normalizeKey(line.clientKey || line.clientName)}`
          const client = clientsById.get(clientId)
          const clientType = client?.type ?? 'particulier'
          if (clientTypeFilter !== 'all' && clientType !== clientTypeFilter) return false
          if (!query) return true

          const chantier = chantiersById.get(`prev-chantier-${line.id.replace(/^prev-/, '')}`)
          return [
            line.rawName,
            line.clientName,
            line.clientKey,
            line.exercise,
            categoryLabels[line.category],
            client?.email ?? '',
            client?.telephone ?? '',
            client?.ville ?? '',
            client?.codePostal ?? '',
            client?.adresse ?? '',
            chantier?.nom ?? '',
          ].some(value => value.toLowerCase().includes(query))
        })
        .sort((a, b) => {
          if (exerciseFilter === 'all' && a.exercise !== b.exercise) return b.exercise.localeCompare(a.exercise, 'fr')
          return a.sourceRow - b.sourceRow
        })
        .map(line => {
          const clientId = `prev-client-${normalizeKey(line.clientKey || line.clientName)}`
          const client = clientsById.get(clientId)
          const chantier = chantiersById.get(`prev-chantier-${line.id.replace(/^prev-/, '')}`)
          const budgetTotal = line.caPrevision || line.caContrat || line.plannedTotal || line.realizedTotal

          return {
            key: line.id,
            clientId,
            clientType: client?.type ?? 'particulier',
            displayName: line.rawName || line.clientName,
            subLabel: `Exercice ${line.exercise} · ligne Excel ${line.sourceRow}`,
            email: client?.email ?? '',
            telephone: client?.telephone ?? '',
            ville: client?.ville ?? '',
            codePostal: client?.codePostal ?? '',
            adresse: client?.adresse ?? '',
            firstChantier: chantier,
            visibleCategories: [line.category],
            chantierCount: 1,
            budgetTotal,
            depensesTotal: line.realizedTotal,
            dateLabel: line.exercise,
          }
        })
    }

    return filteredClients.map(client => {
      const allClientChantiers = chantiersByClient.get(client.id) ?? []
      const clientChantiers = allClientChantiers.filter(chantierMatchesExercise)
      const firstChantier = clientChantiers[0] ?? allClientChantiers[0]
      const stats = clientStats(client)
      const selectedExerciseStats = exerciseFilter === 'all' ? null : stats?.byExercise[exerciseFilter]
      const activeStats = exerciseFilter === 'all' ? null : selectedExerciseStats
      const visibleCategories = Array.from((selectedExerciseStats?.categories ?? stats?.categories ?? new Set<PrevisionnelCategory>())).slice(0, 3)
      const chantierCount = activeStats?.chantierCount ?? clientChantiers.length
      const budgetTotal = activeStats?.totalBudget ?? clientChantiers.reduce((sum, chantier) => sum + chantier.budgetPrevisionnel, 0)
      const depensesTotal = activeStats?.totalDepenses ?? clientChantiers.reduce((sum, chantier) => sum + chantier.depensesEngagees, 0)

      return {
        key: client.id,
        clientId: client.id,
        clientType: client.type,
        displayName: client.nom,
        subLabel: client.adresse || 'Adresse non renseignée',
        email: client.email,
        telephone: client.telephone,
        ville: client.ville,
        codePostal: client.codePostal,
        adresse: client.adresse,
        firstChantier,
        visibleCategories,
        chantierCount,
        budgetTotal,
        depensesTotal,
        dateLabel: formatDate(client.dateCreation),
      }
    })
  }, [
    categoryFilter,
    chantierMatchesExercise,
    chantiersByClient,
    chantiersById,
    clientQuery,
    clientStats,
    clientTypeFilter,
    clientsById,
    exerciseFilter,
    filteredClients,
  ])

  const completeExcelPortfolio = Object.values(
    operationalPrevisionnelLines.reduce<Record<string, {
      clientKey: string
      name: string
      aliases: Set<string>
      lineTypes: Set<string>
      exercises: Set<string>
      totalPrevision: number
      totalContrat: number
      totalPlanned: number
      totalRealized: number
      chantierCount: number
      sourceCount: number
      lastExercise: string
    }>>((acc, line) => {
      const item = acc[line.clientKey] ?? {
        clientKey: line.clientKey,
        name: line.clientName,
        aliases: new Set<string>(),
        lineTypes: new Set<string>(),
        exercises: new Set<string>(),
        totalPrevision: 0,
        totalContrat: 0,
        totalPlanned: 0,
        totalRealized: 0,
        chantierCount: 0,
        sourceCount: 0,
        lastExercise: line.exercise,
      }
      item.aliases.add(line.rawName)
      item.lineTypes.add(line.lineType)
      item.exercises.add(line.exercise)
      item.totalPrevision += line.caPrevision
      item.totalContrat += line.caContrat
      item.totalPlanned += line.plannedTotal
      item.totalRealized += line.realizedTotal
      item.sourceCount += 1
      if (line.lineType === 'chantier') item.chantierCount += 1
      if (line.exercise > item.lastExercise) item.lastExercise = line.exercise
      acc[line.clientKey] = item
      return acc
    }, {}),
  )
    .map(item => ({
      ...item,
      aliases: Array.from(item.aliases).sort(),
      lineTypes: Array.from(item.lineTypes).sort(),
      exercises: Array.from(item.exercises).sort(),
    }))
    .sort((a, b) => (b.totalPrevision + b.totalPlanned + b.totalContrat) - (a.totalPrevision + a.totalPlanned + a.totalContrat))

  const historicalClients = completeExcelPortfolio
    .filter(client => {
      const query = portfolioQuery.trim().toLowerCase()
      if (!query) return true
      return [client.name, ...client.aliases].some(value => value.toLowerCase().includes(query))
    })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!canCreate) {
      setPermissionFeedback('Creation client non autorisee pour ce profil.')
      setShowModal(false)
      return
    }

    const clientInput = {
      type: form.type,
      nom: form.nom.trim(),
      prenom: form.prenom.trim() || null,
      email: form.email.trim() || null,
      telephone: form.telephone.trim() || null,
      adresse: form.adresse.trim() || null,
      ville: form.ville.trim() || null,
      codePostal: form.codePostal.trim() || null,
      typeChantierCible: form.typeChantierCible.trim() || null,
      souhaits: form.souhaits.trim() || null,
      notes: form.notes.trim() || null,
    }

    if (!clientInput.nom) {
      setPermissionFeedback('Nom client obligatoire.')
      return
    }

    const newClient: Client = {
      id: `local-client-${Date.now()}`,
      type: form.type,
      nom: clientInput.nom,
      prenom: clientInput.prenom ?? '',
      email: clientInput.email ?? '',
      telephone: clientInput.telephone ?? '',
      adresse: clientInput.adresse ?? '',
      ville: clientInput.ville ?? '',
      codePostal: clientInput.codePostal ?? '',
      typeChantierCible: clientInput.typeChantierCible ?? '',
      souhaits: clientInput.souhaits ?? '',
      notes: clientInput.notes ?? '',
      dateCreation: new Date().toISOString().split('T')[0],
      chantierIds: [],
    }

    setIsSaving(true)
    try {
      if (canWriteSql) {
        newClient.id = await createClientInSql(clientInput)
        setPermissionFeedback('Client cree dans SQL Connect.')
      } else {
        setPermissionFeedback('Client ajoute localement. Ce fallback ne prouve pas une ecriture SQL.')
      }

      addClient(newClient)
      setSaved(true)
      setTimeout(() => { setSaved(false); setShowModal(false) }, 1200)
      setForm({
        nom: '',
        prenom: '',
        type: 'particulier',
        email: '',
        telephone: '',
        adresse: '',
        ville: '',
        codePostal: '',
        typeChantierCible: '',
        souhaits: '',
        notes: '',
      })
    } catch (error) {
      console.error(error)
      setPermissionFeedback("Ecriture SQL Connect impossible. Aucun client local n'a ete cree.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-full bg-[#FAF6F2] p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1E1E]">Clients</h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">{clients.length} clients</p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-[14px] bg-[#F06B21] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#D95B17]"
          >
            <Plus size={16} /> Nouveau client
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

      <div className="mb-6 grid gap-4 xl:grid-cols-3">
        <div className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">Base active</p>
          <p className="mt-3 text-[26px] font-bold leading-none text-[#1E1E1E]">{clients.length}</p>
          <p className="mt-2 text-[12px] text-[#6B6B6B]">Clients dans le store applicatif</p>
        </div>
        <div className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">Base Excel</p>
            <p className="mt-3 text-[26px] font-bold leading-none text-[#1E1E1E]">{completeExcelPortfolio.length}</p>
          <p className="mt-2 text-[12px] text-[#6B6B6B]">Clients rapprochés depuis tous les exercices Excel</p>
        </div>
        <div className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">Historique</p>
          <p className="mt-3 text-[26px] font-bold leading-none text-[#1E1E1E]">
            {coverage.operationalLines.toLocaleString('fr-FR')}
          </p>
          <p className="mt-2 text-[12px] text-[#6B6B6B]">
            Chantiers exploitables, {coverage.syntheticOrNonOperationalLines} lignes synthèse exclues
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-[#F2E8DC] bg-white">
        <div className="border-b border-[#F2E8DC] p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h2 className="text-[17px] font-semibold text-[#1E1E1E]">Répertoire clients</h2>
              <p className="mt-1 text-[12px] text-[#6B6B6B]">
                {directoryRows.length.toLocaleString('fr-FR')} {categoryFilter === 'all' ? 'client' : 'ligne chantier'}{directoryRows.length > 1 ? 's' : ''} affiché{directoryRows.length > 1 ? 's' : ''} sur {categoryFilter === 'all' ? categoryScopedClients.length.toLocaleString('fr-FR') : exerciseScopedLineCount.toLocaleString('fr-FR')} pour {exerciseFilter === 'all' ? 'tous les exercices' : `l'exercice ${exerciseFilter}`}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_150px_160px] xl:w-[700px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  value={clientQuery}
                  onChange={event => setClientQuery(event.target.value)}
                  placeholder="Rechercher nom, ville, email..."
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
                  <option key={exercise} value={exercise}>
                    {exercise}
                  </option>
                ))}
              </select>
              <select
                value={clientSort}
                onChange={event => setClientSort(event.target.value as ClientSort)}
                className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-sm font-medium text-[#1E1E1E] outline-none focus:ring-2 focus:ring-[#F06B21]/20"
                aria-label="Trier les clients"
              >
                <option value="nom">Tri nom</option>
                <option value="ville">Tri ville</option>
                <option value="chantiers">Tri chantiers</option>
                <option value="recent">Tri récent</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { key: 'all' as const, label: 'Tous', count: categoryFilter === 'all' ? categoryScopedClients.length : directoryRows.length },
              ...typeOptions.map(type => ({
                key: type,
                label: typeLabel[type],
                count: categoryFilter === 'all'
                  ? categoryScopedClients.filter(client => client.type === type).length
                  : directoryRows.filter(row => row.clientType === type).length,
              })),
            ].map(option => {
              const active = clientTypeFilter === option.key
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setClientTypeFilter(option.key)}
                  className={`inline-flex h-9 items-center gap-2 rounded-[10px] border px-3 text-[12px] font-semibold transition-colors ${
                    active
                      ? 'border-[#F06B21] bg-[#FDEBDD] text-[#F06B21]'
                      : 'border-[#F2E8DC] bg-white text-[#6B6B6B] hover:bg-[#FAF6F2] hover:text-[#1E1E1E]'
                  }`}
                >
                  {option.label}
                  <span className={active ? 'text-[#F06B21]' : 'text-[#9CA3AF]'}>
                    {option.count.toLocaleString('fr-FR')}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { key: 'all' as const, label: 'Tous chantiers', count: exerciseScopedLineCount, color: '#F06B21' },
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
                  <span style={{ color: active ? option.color : '#9CA3AF' }}>
                    {option.count.toLocaleString('fr-FR')}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="max-h-[640px] overflow-auto">
          <table className="w-full min-w-[1180px] text-left text-[13px]">
            <thead className="sticky top-0 z-10 bg-[#FAF6F2] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B6B6B]">
              <tr>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Ville</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Chantier</th>
                <th className="px-5 py-3 text-right">Chantiers</th>
                <th className="px-5 py-3 text-right">Budget</th>
                <th className="px-5 py-3 text-right">Engagé</th>
                <th className="px-5 py-3">Création</th>
                <th className="w-12 px-5 py-3" aria-label="Ouvrir" />
              </tr>
            </thead>
            <tbody>
              {directoryRows.map(row => (
                  <tr
                    key={row.key}
                    className="group cursor-pointer border-t border-[#F2E8DC] transition-colors hover:bg-[#FFF9F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F06B21]/30"
                    onClick={() => navigate(`/clients/${row.clientId}`)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        navigate(`/clients/${row.clientId}`)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <td className="px-5 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-[#FDEBDD] text-[#F06B21]">
                          <Users className="h-4 w-4" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#1E1E1E] transition-colors group-hover:text-[#F06B21]">{row.displayName}</p>
                          <p className="mt-0.5 truncate text-[11px] text-[#6B6B6B]">{row.subLabel}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[12px] text-[#3C3C3C]">
                          <Mail className="h-3.5 w-3.5 text-[#9CA3AF]" strokeWidth={1.75} />
                          <span className="max-w-[220px] truncate">{row.email || 'Email non renseigné'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-[#6B6B6B]">
                          <Phone className="h-3.5 w-3.5 text-[#9CA3AF]" strokeWidth={1.75} />
                          <span>{row.telephone || 'Téléphone non renseigné'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 text-[#3C3C3C]">
                        <MapPin className="h-3.5 w-3.5 text-[#9CA3AF]" strokeWidth={1.75} />
                        <span>{row.ville || '—'}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-[#9CA3AF]">{row.codePostal}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-[6px] px-2.5 py-1 text-[11px] font-medium ${typeColor[row.clientType]}`}>
                        {typeLabel[row.clientType]}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex max-w-[220px] flex-wrap gap-1.5">
                        {row.visibleCategories.map(category => (
                          <span
                            key={category}
                            className="inline-flex items-center gap-1 rounded-[6px] border px-2 py-0.5 text-[11px] font-semibold"
                            style={{ borderColor: categoryColors[category], color: categoryColors[category] }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: categoryColors[category] }} />
                            {categoryLabels[category]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="font-semibold text-[#1E1E1E]">{row.chantierCount}</span>
                      <span className="ml-1 text-[11px] text-[#6B6B6B]">dossier{row.chantierCount > 1 ? 's' : ''}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-[#1E1E1E]">{row.budgetTotal ? euro(row.budgetTotal) : '—'}</td>
                    <td className="px-5 py-3 text-right text-[#3C3C3C]">{row.depensesTotal ? euro(row.depensesTotal) : '—'}</td>
                    <td className="px-5 py-3 text-[#3C3C3C]">{row.dateLabel}</td>
                    <td className="px-5 py-3">
                      <ArrowRight size={17} className="text-[#9CA3AF] transition-colors group-hover:text-[#F06B21]" strokeWidth={1.75} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {directoryRows.length === 0 && (
          <div className="border-t border-[#F2E8DC] px-5 py-10 text-center">
            <p className="text-sm font-semibold text-[#1E1E1E]">Aucun client trouvé</p>
            <p className="mt-1 text-[12px] text-[#6B6B6B]">Ajustez la recherche ou les filtres pour élargir le répertoire.</p>
          </div>
        )}
      </div>

      {permissionFeedback && (
        <div className="mb-5 flex items-center justify-between rounded-[14px] border border-[#F2E8DC] bg-white px-4 py-3 text-[13px] font-medium text-[#3C3C3C]">
          <span>{permissionFeedback}</span>
          <button type="button" onClick={() => setPermissionFeedback('')} className="text-[#F06B21] hover:text-[#D95B17]">OK</button>
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-[20px] border border-[#F2E8DC] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#F2E8DC] p-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-[#F06B21]" />
              <h2 className="text-[17px] font-semibold text-[#1E1E1E]">Base client historique Excel</h2>
            </div>
            <p className="mt-1 text-[12px] text-[#6B6B6B]">
              Les noms de chantier du prévisionnel sont rapprochés en clients, avec alias et exercices conservés.
            </p>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={portfolioQuery}
              onChange={event => setPortfolioQuery(event.target.value)}
              placeholder="Rechercher dans l'historique"
              className="h-10 w-[280px] rounded-[14px] border border-[#F2E8DC] bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#F06B21]/20"
            />
          </div>
        </div>
        <div className="max-h-[640px] overflow-auto">
          <table className="w-full min-w-[1180px] text-left text-[13px]">
            <thead className="sticky top-0 z-10 bg-[#FAF6F2] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B6B6B]">
              <tr>
                <th className="px-5 py-3">Client rapproché</th>
                <th className="px-5 py-3">Alias Excel</th>
              <th className="px-5 py-3">Lignes / chantiers</th>
              <th className="px-5 py-3">Types</th>
                <th className="px-5 py-3">Exercices</th>
                <th className="px-5 py-3">CA prévision</th>
                <th className="px-5 py-3">Contrat</th>
                <th className="px-5 py-3">Dernier exercice</th>
              </tr>
            </thead>
            <tbody>
              {historicalClients.map(client => (
                <tr key={client.clientKey} className="border-t border-[#F2E8DC]">
                  <td className="px-5 py-3 font-semibold text-[#1E1E1E]">{client.name}</td>
                  <td className="px-5 py-3 text-[#6B6B6B]">{client.aliases.slice(0, 3).join(' / ')}</td>
                  <td className="px-5 py-3 font-semibold text-[#1E1E1E]">{client.sourceCount} / {client.chantierCount}</td>
                  <td className="px-5 py-3 text-[#3C3C3C]">{client.lineTypes.join(', ')}</td>
                  <td className="px-5 py-3 text-[#3C3C3C]">{client.exercises.length}</td>
                  <td className="px-5 py-3 font-semibold text-[#1E1E1E]">{euro(client.totalPrevision || client.totalPlanned)}</td>
                  <td className="px-5 py-3 text-[#3C3C3C]">{client.totalContrat ? euro(client.totalContrat) : '—'}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-[#FDEBDD] px-2.5 py-1 text-[11px] font-semibold text-[#F06B21]">
                      {client.lastExercise}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && canCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-[20px] border border-[#F2E8DC] bg-white shadow-[0_24px_80px_rgba(30,30,30,0.18)]">
            <div className="flex items-center justify-between border-b border-[#F2E8DC] px-6 py-5">
              <h2 className="font-semibold text-[#1E1E1E]">Nouveau client</h2>
              <button onClick={() => setShowModal(false)} className="text-[#9CA3AF] hover:text-[#1E1E1E]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="max-h-[calc(90vh-76px)] space-y-4 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Nom / Raison sociale *</label>
                  <input required className="w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Prenom contact</label>
                  <input className="w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Type</label>
                  <div className="flex gap-2">
                    {(['particulier', 'professionnel', 'public'] as const).map(t => (
                      <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={`flex-1 rounded-xl border py-2 text-xs font-medium transition-all ${form.type === t ? 'border-[#F06B21] bg-[#F06B21] text-white' : 'border-[#F2E8DC] text-[#6B6B6B] hover:border-[#EADBC8]'}`}>
                        {typeLabel[t]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Email</label>
                  <input type="email" className="w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Téléphone</label>
                  <input className="w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Adresse</label>
                  <input className="w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Ville</label>
                  <input className="w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Code postal</label>
                  <input className="w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" value={form.codePostal} onChange={e => setForm(f => ({ ...f, codePostal: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Type de chantier cible</label>
                  <input className="w-full rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" value={form.typeChantierCible} onChange={e => setForm(f => ({ ...f, typeChantierCible: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Souhaits / demande</label>
                  <textarea rows={3} className="w-full resize-none rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" value={form.souhaits} onChange={e => setForm(f => ({ ...f, souhaits: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-medium text-[#6B6B6B]">Notes libres</label>
                  <textarea rows={3} className="w-full resize-none rounded-xl border border-[#F2E8DC] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${saved ? 'bg-[#1E8E3E] text-white' : 'bg-[#F06B21] text-white hover:bg-[#D95B17]'}`}>
                {saved ? <><Check size={16} /> Client cree !</> : isSaving ? 'Enregistrement...' : 'Creer le client'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
