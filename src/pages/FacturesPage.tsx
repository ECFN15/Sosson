import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  Link2,
  Plus,
  ReceiptText,
  Search,
  Upload,
  WifiOff,
  XCircle,
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useApp } from '@/lib/store'
import { isDataConnectEnabled } from '@/lib/dataconnect'
import { canAccessPage } from '@/lib/accessControl'
import { categorieLabels } from '@/data/factures'
import type { CategorieDepense, Facture, StatutFacture } from '@/data/factures'
import { createFactureInSql, setFactureStatutInSql } from '@/features/factures/factureSql'
import { useOperationalData } from '@/features/operations/useOperationalData'
import { createDocumentAttacheInSql } from '@/features/documents/documentSql'
import { buildPendingDocumentStoragePath, hashDocumentFile } from '@/features/documents/storagePaths'

type FactureTab = 'toutes' | StatutFacture

const tabs: Array<{ key: FactureTab; label: string }> = [
  { key: 'toutes', label: 'Toutes' },
  { key: 'en_attente', label: 'A traiter' },
  { key: 'validee', label: 'Validees' },
  { key: 'rejetee', label: 'Rejetees' },
]

const categories: CategorieDepense[] = [
  'bois_materiaux',
  'materiaux',
  'quincaillerie',
  'sous_traitance',
  'carburant',
  'location_materiel',
  'plomberie',
  'electricite',
  'peinture',
  'autre',
]

const statusMeta: Record<StatutFacture, { label: string; className: string; icon: typeof Clock3 }> = {
  en_attente: {
    label: 'A traiter',
    className: 'bg-[#FDEBDD] text-[#D95B17]',
    icon: Clock3,
  },
  validee: {
    label: 'Validee',
    className: 'bg-[#E6F4EA] text-[#1E8E3E]',
    icon: CheckCircle2,
  },
  rejetee: {
    label: 'Rejetee',
    className: 'bg-[#FEE2E2] text-[#DC2626]',
    icon: XCircle,
  },
}

function formatEuros(value: number) {
  return `${Math.round(value).toLocaleString('fr-FR')} EUR`
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('fr-FR')
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[20px] border border-[#EADBC8] bg-white shadow-[0_1px_0_rgba(255,255,255,.9)_inset] ${className}`}>{children}</section>
}

function StatusBadge({ statut }: { statut: StatutFacture }) {
  const meta = statusMeta[statut]
  const Icon = meta.icon
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[11px] font-semibold ${meta.className}`}>
      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
      {meta.label}
    </span>
  )
}

function CategoryBadge({ category }: { category: CategorieDepense }) {
  return (
    <span className="inline-flex rounded-[6px] bg-[#FAF6F2] px-2.5 py-1 text-[11px] font-medium text-[#3C3C3C]">
      {categorieLabels[category] ?? category}
    </span>
  )
}

export function FacturesPage() {
  const {
    factures,
    chantiers,
    clients,
    source: operationalSource,
    isLoading: isOperationalLoading,
  } = useOperationalData()
  const {
    user,
    accessMatrix,
    addFacture,
    updateFactureStatus,
  } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const statusParam = searchParams.get('status')
  const chantierFilter = searchParams.get('chantierId') ?? ''
  const factureParam = searchParams.get('factureId') ?? ''
  const initialTab: FactureTab =
    statusParam === 'validee' || statusParam === 'en_attente' || statusParam === 'rejetee' ? statusParam : 'toutes'
  const [activeTab, setActiveTab] = useState<FactureTab>(initialTab)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(factureParam || factures[0]?.id || '')
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [form, setForm] = useState({
    chantierId: chantierFilter || chantiers[0]?.id || '',
    fournisseur: '',
    numeroFacture: '',
    montantHT: '',
    tva: '20',
    date: new Date().toISOString().slice(0, 10),
    categorie: 'bois_materiaux' as CategorieDepense,
    description: '',
  })

  const canWriteSql = operationalSource === 'dataconnect' && isDataConnectEnabled && Boolean(user)
  const canCreateFactures = canAccessPage(user?.role, 'factures', accessMatrix, 'create')
  const canEditFactures = canAccessPage(user?.role, 'factures', accessMatrix, 'edit')

  const scopedFactures = useMemo(() => {
    if (user?.role !== 'chef_chantier') return factures
    return factures.filter(facture => {
      const chantier = chantiers.find(item => item.id === facture.chantierId)
      return chantier?.chefChantier === `${user.prenom} ${user.nom}`
    })
  }, [chantiers, factures, user])

  const visibleFactures = useMemo(() => {
    const query = search.trim().toLowerCase()
    return scopedFactures.filter(facture => {
      if (chantierFilter && facture.chantierId !== chantierFilter) return false
      if (activeTab !== 'toutes' && facture.statut !== activeTab) return false
      if (!query) return true

      const chantier = chantiers.find(item => item.id === facture.chantierId)
      const client = clients.find(item => item.id === chantier?.clientId)

      return [
        facture.fournisseur,
        facture.numeroFacture,
        facture.description,
        chantier?.nom,
        client?.nom,
        categorieLabels[facture.categorie],
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
  }, [activeTab, chantierFilter, chantiers, clients, scopedFactures, search])

  const selectedFacture =
    visibleFactures.find(facture => facture.id === selectedId) ??
    scopedFactures.find(facture => facture.id === selectedId) ??
    visibleFactures[0] ??
    scopedFactures[0]

  const selectedChantier = chantiers.find(chantier => chantier.id === selectedFacture?.chantierId)
  const selectedClient = clients.find(client => client.id === selectedChantier?.clientId)

  const totals = useMemo(() => {
    return scopedFactures.reduce(
      (acc, facture) => {
        acc.counts[facture.statut] += 1
        acc.imported += facture.montantTTC
        if (facture.statut === 'validee') acc.validated += facture.montantTTC
        if (facture.statut === 'en_attente') acc.pending += facture.montantTTC
        return acc
      },
      {
        validated: 0,
        pending: 0,
        imported: 0,
        counts: { validee: 0, en_attente: 0, rejetee: 0 } as Record<StatutFacture, number>,
      },
    )
  }, [scopedFactures])

  const chantierBudgetImpact = selectedChantier
    ? Math.round((selectedChantier.depensesEngagees / Math.max(selectedChantier.budgetPrevisionnel, 1)) * 100)
    : 0

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/heic': ['.heic'],
    },
    maxSize: 20 * 1024 * 1024,
    multiple: true,
    noClick: true,
    onDrop: acceptedFiles => {
      setUploadedFiles(files => [...acceptedFiles, ...files])
      if (acceptedFiles[0] && !form.numeroFacture) {
        setForm(current => ({
          ...current,
          numeroFacture: acceptedFiles[0].name.replace(/\.[^.]+$/, '').slice(0, 64),
        }))
      }
      setFeedback(canWriteSql
        ? `${acceptedFiles.length} fichier(s) selectionne(s). Le fichier n'est pas encore stocke durablement tant que le flux Storage facture n'est pas branche.`
        : `${acceptedFiles.length} fichier(s) selectionne(s) dans le fallback local. Ce n'est pas une preuve Storage.`)
    },
  })

  async function createFactureDocumentMetadata(facture: Facture, files: File[]) {
    const chantier = chantiers.find(item => item.id === facture.chantierId)
    let created = 0

    for (const file of files) {
      const sha256 = await hashDocumentFile(file)
      await createDocumentAttacheInSql({
        folderId: null,
        clientId: chantier?.clientId ?? null,
        chantierId: facture.chantierId,
        factureId: facture.id,
        nomFichier: file.name,
        storagePath: buildPendingDocumentStoragePath(file, facture.chantierId),
        mimeType: file.type || null,
        tailleBytes: file.size,
        sha256,
        typeDocument: 'facture',
        statut: 'lie',
        source: 'upload',
        description: `Piece jointe facture ${facture.numeroFacture}. Fichier Storage a finaliser.`,
        dateDocument: facture.date,
      })
      created += 1
    }

    return created
  }

  function handleTabChange(tab: FactureTab) {
    setActiveTab(tab)
    const next = new URLSearchParams(searchParams)
    if (tab === 'toutes') next.delete('status')
    else next.set('status', tab)
    setSearchParams(next)
  }

  function clearChantierFilter() {
    const next = new URLSearchParams(searchParams)
    next.delete('chantierId')
    setSearchParams(next)
  }

  async function handleCreateFacture(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canCreateFactures) {
      setFeedback("Votre role ne permet pas de creer une facture.")
      return
    }

    const chantierId = form.chantierId || chantiers[0]?.id
    const montantHT = Number(form.montantHT)
    const tva = Number(form.tva)

    if (!chantierId || !form.fournisseur.trim() || !form.numeroFacture.trim() || !Number.isFinite(montantHT)) {
      setFeedback('Completez le chantier, le fournisseur, le numero et le montant HT.')
      return
    }

    const montantTTC = Math.round(montantHT * (1 + tva / 100) * 100) / 100
    const nextFacture: Facture = {
      id: `local-facture-${Date.now()}`,
      chantierId,
      fournisseur: form.fournisseur.trim(),
      numeroFacture: form.numeroFacture.trim(),
      montantHT,
      tva,
      montantTTC,
      date: form.date,
      categorie: form.categorie,
      statut: 'validee',
      description: form.description.trim(),
    }

    setIsSaving(true)
    try {
      if (canWriteSql) {
        nextFacture.id = await createFactureInSql(nextFacture)
        if (uploadedFiles.length) {
          try {
            const documentCount = await createFactureDocumentMetadata(nextFacture, uploadedFiles)
            setFeedback(`Facture creee dans SQL Connect. ${documentCount} metadata document enregistree(s); fichier Storage a finaliser.`)
          } catch (error) {
            console.info('Creation metadata document facture impossible apres creation SQL facture.', error)
            setFeedback('Facture creee dans SQL Connect, mais metadata document non enregistree. Fichier Storage toujours a finaliser.')
          }
        } else {
          setFeedback('Facture fournisseur creee dans SQL Connect. Elle est definitive et impacte directement les chiffres.')
        }
      } else {
        setFeedback("Facture ajoutee localement hors SQL. Ce fallback ne prouve pas une ecriture SQL et n'est pas synchronise automatiquement.")
      }

      addFacture(nextFacture)
      setSelectedId(nextFacture.id)
      setForm(current => ({
        ...current,
        fournisseur: '',
        numeroFacture: '',
        montantHT: '',
        description: '',
      }))
      setUploadedFiles([])
    } catch (error) {
      console.error(error)
      setFeedback("Ecriture SQL Connect impossible. Aucune facture n'a ete creee.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleStatusChange(facture: Facture, statut: StatutFacture) {
    if (!canEditFactures) {
      setFeedback("Votre role ne permet pas de modifier le statut d'une facture.")
      return
    }

    setIsSaving(true)
    try {
      if (canWriteSql) {
        if (facture.id.startsWith('local-')) {
          setFeedback("Statut non modifie: cette facture est locale alors que la page est en source SQL.")
          return
        }

        await setFactureStatutInSql(facture.id, statut)
        setFeedback(`Statut SQL Connect mis a jour: ${statusMeta[statut].label}.`)
      } else {
        setFeedback(`Statut mis a jour localement: ${statusMeta[statut].label}.`)
      }
      updateFactureStatus(facture.id, statut)
    } catch (error) {
      console.error(error)
      setFeedback("Le statut n'a pas pu etre enregistre.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-full bg-[#FAF6F2] p-6 xl:p-8">
      <div className="mb-6 overflow-hidden rounded-[24px] border border-[#2A2A2A] bg-[#1E1E1E] px-5 py-5 text-white shadow-[0_18px_44px_rgba(30,30,30,0.16)] xl:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#3C3C3C] bg-[#2A1A0D] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#F06B21]">
              <ReceiptText className="h-3.5 w-3.5" strokeWidth={1.75} />
              Controle financier
            </span>
            <span className="inline-flex rounded-full border border-[#3C3C3C] bg-[#242424] px-3 py-1 text-[11px] font-semibold text-[#C9C9C9]">
              {canWriteSql ? 'Ecriture SQL Connect' : 'Fallback local hors SQL'}
            </span>
          </div>
          <h1 className="text-[32px] font-semibold leading-none tracking-[-0.04em] text-white">Factures fournisseurs</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#C9C9C9]">Saisie, rattachement chantier et validation des depenses fournisseurs avec un flux de controle lisible montant par montant.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#F2E8DC] bg-white px-4 text-sm font-medium text-[#3C3C3C]">
            {isOperationalLoading ? 'Chargement SQL...' : operationalSource === 'dataconnect' ? 'Source SQL Connect' : 'Source locale / Excel'}
          </span>
          {!canWriteSql && (
            <span className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#F2E8DC] bg-white px-4 text-sm font-medium text-[#D95B17]">
              <WifiOff className="h-4 w-4" strokeWidth={1.75} />
              Fallback local hors SQL
            </span>
          )}
        </div>
        </div>
      </div>

      {feedback && (
        <div className="mb-5 flex items-center justify-between rounded-[14px] border border-[#F2E8DC] bg-white px-4 py-3 text-[13px] font-medium text-[#3C3C3C]">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback('')} className="text-[#F06B21] hover:text-[#D95B17]">OK</button>
        </div>
      )}

      {chantierFilter && selectedChantier && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#F2E8DC] bg-white px-4 py-3">
          <span className="text-[13px] font-medium text-[#3C3C3C]">Vue limitee au chantier: <strong className="text-[#1E1E1E]">{selectedChantier.nom}</strong></span>
          <button type="button" onClick={clearChantierFilter} className="text-[13px] font-semibold text-[#F06B21]">Voir toutes les factures</button>
        </div>
      )}

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-[12px] font-medium text-[#6B6B6B]">Impact dashboard</p>
          <p className="mt-3 text-[24px] font-semibold text-[#1E1E1E]">{formatEuros(totals.imported)}</p>
          <p className="mt-2 text-[12px] text-[#6B6B6B]">Toutes les factures fournisseur importees impactent les chiffres.</p>
        </Card>
        <Card className="p-5">
          <p className="text-[12px] font-medium text-[#6B6B6B]">Validees</p>
          <p className="mt-3 text-[24px] font-semibold text-[#1E1E1E]">{formatEuros(totals.validated)}</p>
          <p className="mt-2 text-[12px] text-[#6B6B6B]">{totals.counts.validee} factures rattachees aux chantiers.</p>
        </Card>
        <Card className="p-5">
          <p className="text-[12px] font-medium text-[#6B6B6B]">Anomalies</p>
          <p className="mt-3 text-[24px] font-semibold text-[#1E1E1E]">{totals.counts.rejetee}</p>
          <p className="mt-2 text-[12px] text-[#6B6B6B]">A reprendre avec le fournisseur ou le chantier.</p>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <main className="min-w-0 space-y-5">
          {canCreateFactures ? (
          <Card className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-h-10 flex-wrap gap-2">
                {tabs.map(tab => {
                  const count = tab.key === 'toutes' ? scopedFactures.length : totals.counts[tab.key]
                  const isActive = activeTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => handleTabChange(tab.key)}
                      className={`inline-flex h-10 items-center gap-2 rounded-[10px] border px-4 text-sm font-medium transition-colors ${
                        isActive ? 'border-[#F06B21] bg-[#FDEBDD] text-[#D95B17]' : 'border-[#F2E8DC] bg-white text-[#1E1E1E] hover:bg-[#F9F7F3]'
                      }`}
                    >
                      {tab.label}
                      <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#6B6B6B]">{count}</span>
                    </button>
                  )
                })}
              </div>

              <label className="flex h-10 min-w-[260px] items-center gap-2 rounded-[14px] border border-[#F2E8DC] bg-white px-3">
                <Search className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
                <input
                  type="search"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Rechercher fournisseur, chantier..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-[#1E1E1E] placeholder:text-[#9CA3AF] focus:outline-none"
                />
              </label>
            </div>
          </Card>
          ) : (
          <Card className="p-5">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-[#F06B21]" strokeWidth={1.75} />
              <div>
                <h2 className="text-[14px] font-semibold text-[#1E1E1E]">Creation verrouillee</h2>
                <p className="mt-2 text-[12px] leading-5 text-[#6B6B6B]">
                  Votre role permet de consulter les factures, mais pas d'en creer depuis cette interface.
                </p>
              </div>
            </div>
          </Card>
          )}

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead className="bg-[#FAF6F2] text-left text-[12px] font-medium text-[#6B6B6B]">
                  <tr className="border-b border-[#F2E8DC]">
                    <th className="px-4 py-3">Fournisseur</th>
                    <th className="px-4 py-3">Numero</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Montant TTC</th>
                    <th className="px-4 py-3">Categorie</th>
                    <th className="px-4 py-3">Chantier</th>
                    <th className="px-4 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleFactures.map(facture => {
                    const chantier = chantiers.find(item => item.id === facture.chantierId)
                    const selected = selectedFacture?.id === facture.id
                    return (
                      <tr
                        key={facture.id}
                        onClick={() => setSelectedId(facture.id)}
                        className={`cursor-pointer border-b border-[#F2E8DC] transition-colors last:border-b-0 ${selected ? 'bg-[#FDEBDD]/45 shadow-[inset_3px_0_0_#F06B21]' : 'hover:bg-[#F9F7F3]'}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#FAF6F2] text-[#F06B21]">
                              <ReceiptText className="h-4 w-4" strokeWidth={1.75} />
                            </div>
                            <span className="text-[13px] font-semibold text-[#1E1E1E]">{facture.fournisseur}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#3C3C3C]">{facture.numeroFacture}</td>
                        <td className="px-4 py-3 text-[13px] text-[#3C3C3C]">{formatDate(facture.date)}</td>
                        <td className="px-4 py-3 text-[13px] font-semibold text-[#1E1E1E]">{formatEuros(facture.montantTTC)}</td>
                        <td className="px-4 py-3"><CategoryBadge category={facture.categorie} /></td>
                        <td className="px-4 py-3 text-[13px] text-[#3C3C3C]">{chantier?.nom ?? 'Non rattachee'}</td>
                        <td className="px-4 py-3"><StatusBadge statut={facture.statut} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {visibleFactures.length === 0 && (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-[18px] border border-[#EADBC8] bg-white text-[#F06B21] shadow-[0_10px_28px_rgba(30,30,30,0.08)]">
                  <ReceiptText className="h-8 w-8" strokeWidth={1.75} />
                </div>
                <p className="mt-4 text-sm font-semibold text-[#1E1E1E]">Aucune facture dans cette vue</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#6B6B6B]">
                  Changez d'onglet, effacez la recherche ou ajoutez une nouvelle facture fournisseur depuis le panneau de controle.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    handleTabChange('toutes')
                  }}
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-[12px] border border-[#EADBC8] bg-white px-4 text-sm font-semibold text-[#1E1E1E] hover:bg-[#FAF6F2]"
                >
                  Voir toutes les factures
                </button>
              </div>
            )}
          </Card>
        </main>

        <aside className="space-y-5">
          <Card className="p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[16px] font-semibold text-[#1E1E1E]">Nouvelle facture</h2>
                <p className="mt-1 text-[12px] text-[#6B6B6B]">Creation directe et rattachement chantier.</p>
              </div>
              <Plus className="h-5 w-5 text-[#F06B21]" strokeWidth={1.75} />
            </div>

            <div
              {...getRootProps()}
              className={`mb-4 rounded-[14px] border border-dashed p-4 text-center transition-colors ${
                isDragActive ? 'border-[#F06B21] bg-[#FDEBDD]' : 'border-[#F2E8DC] bg-[#FAF6F2]'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-5 w-5 text-[#F06B21]" strokeWidth={1.75} />
              <button type="button" onClick={open} className="mt-2 text-[13px] font-semibold text-[#1E1E1E]">
                Joindre un PDF ou une image
              </button>
              {uploadedFiles[0] && (
                <p className="mt-1 truncate text-[11px] text-[#6B6B6B]">
                  {uploadedFiles[0].name} - metadata SQL possible, fichier Storage a finaliser
                </p>
              )}
            </div>

            <form className="space-y-3" onSubmit={handleCreateFacture}>
              <label className="block">
                <span className="text-[12px] font-semibold text-[#1E1E1E]">Chantier</span>
                <select
                  value={form.chantierId || chantiers[0]?.id || ''}
                  onChange={event => setForm(current => ({ ...current, chantierId: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-sm text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20"
                >
                  {chantiers.map(chantier => (
                    <option key={chantier.id} value={chantier.id}>{chantier.nom}</option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#1E1E1E]">Fournisseur</span>
                  <input value={form.fournisseur} onChange={event => setForm(current => ({ ...current, fournisseur: event.target.value }))} className="mt-1 h-10 w-full rounded-[10px] border border-[#F2E8DC] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" />
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#1E1E1E]">Numero</span>
                  <input value={form.numeroFacture} onChange={event => setForm(current => ({ ...current, numeroFacture: event.target.value }))} className="mt-1 h-10 w-full rounded-[10px] border border-[#F2E8DC] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" />
                </label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#1E1E1E]">HT</span>
                  <input type="number" step="0.01" min="0" value={form.montantHT} onChange={event => setForm(current => ({ ...current, montantHT: event.target.value }))} className="mt-1 h-10 w-full rounded-[10px] border border-[#F2E8DC] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" />
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#1E1E1E]">TVA %</span>
                  <input type="number" step="0.1" min="0" value={form.tva} onChange={event => setForm(current => ({ ...current, tva: event.target.value }))} className="mt-1 h-10 w-full rounded-[10px] border border-[#F2E8DC] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" />
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold text-[#1E1E1E]">Date</span>
                  <input type="date" value={form.date} onChange={event => setForm(current => ({ ...current, date: event.target.value }))} className="mt-1 h-10 w-full rounded-[10px] border border-[#F2E8DC] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" />
                </label>
              </div>
              <label className="block">
                <span className="text-[12px] font-semibold text-[#1E1E1E]">Categorie</span>
                <select value={form.categorie} onChange={event => setForm(current => ({ ...current, categorie: event.target.value as CategorieDepense }))} className="mt-1 h-10 w-full rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20">
                  {categories.map(category => (
                    <option key={category} value={category}>{categorieLabels[category]}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[12px] font-semibold text-[#1E1E1E]">Description</span>
                <textarea value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} className="mt-1 h-20 w-full resize-none rounded-[10px] border border-[#F2E8DC] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" />
              </label>
              <button type="submit" disabled={isSaving || chantiers.length === 0} className="h-11 w-full rounded-[14px] bg-[#F06B21] px-4 text-sm font-semibold text-white hover:bg-[#D95B17] disabled:cursor-not-allowed disabled:opacity-60">
                {isSaving ? 'Enregistrement...' : canWriteSql ? 'Creer dans SQL Connect' : 'Ajouter localement hors SQL'}
              </button>
            </form>
          </Card>

          {selectedFacture && (
            <Card className="p-5">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[16px] font-semibold text-[#1E1E1E]">{selectedFacture.fournisseur}</h2>
                  <p className="mt-1 text-[12px] text-[#6B6B6B]">{selectedFacture.numeroFacture} - {formatDate(selectedFacture.date)}</p>
                </div>
                <StatusBadge statut={selectedFacture.statut} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div className="rounded-[12px] bg-[#FAF6F2] p-3">
                  <p className="text-[#6B6B6B]">Montant HT</p>
                  <p className="mt-1 font-semibold text-[#1E1E1E]">{formatEuros(selectedFacture.montantHT)}</p>
                </div>
                <div className="rounded-[12px] bg-[#FAF6F2] p-3">
                  <p className="text-[#6B6B6B]">Montant TTC</p>
                  <p className="mt-1 font-semibold text-[#1E1E1E]">{formatEuros(selectedFacture.montantTTC)}</p>
                </div>
              </div>

              <div className="mt-4 rounded-[14px] border border-[#F2E8DC] p-4">
                <div className="flex items-start gap-3">
                  <Link2 className="mt-0.5 h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#1E1E1E]">{selectedChantier?.nom ?? 'Chantier non rattache'}</p>
                    <p className="mt-1 text-[12px] text-[#6B6B6B]">{selectedClient?.nom ?? 'Client non qualifie'}</p>
                    {selectedChantier && (
                      <p className="mt-2 text-[12px] text-[#3C3C3C]">
                        Budget consomme: {chantierBudgetImpact}% ({formatEuros(selectedChantier.depensesEngagees)} / {formatEuros(selectedChantier.budgetPrevisionnel)})
                      </p>
                    )}
                  </div>
                </div>
                {selectedChantier && (
                  <Link to={`/chantiers/${selectedChantier.id}`} className="mt-3 inline-flex items-center gap-2 text-[13px] font-semibold text-[#F06B21]">
                    Ouvrir le chantier
                    <FileText className="h-4 w-4" strokeWidth={1.75} />
                  </Link>
                )}
              </div>

              {selectedFacture.description && (
                <p className="mt-4 rounded-[14px] bg-[#FAF6F2] p-4 text-[13px] leading-5 text-[#3C3C3C]">{selectedFacture.description}</p>
              )}

              {canEditFactures ? (
              <div className="mt-5 grid grid-cols-3 gap-2">
                <button type="button" disabled={isSaving} onClick={() => handleStatusChange(selectedFacture, 'validee')} className="h-10 rounded-[10px] bg-[#F06B21] text-[12px] font-semibold text-white hover:bg-[#D95B17] disabled:opacity-60">
                  Valider
                </button>
                <button type="button" disabled={isSaving} onClick={() => handleStatusChange(selectedFacture, 'en_attente')} className="h-10 rounded-[10px] border border-[#F2E8DC] bg-white text-[12px] font-semibold text-[#1E1E1E] hover:bg-[#FAF6F2] disabled:opacity-60">
                  A traiter
                </button>
                <button type="button" disabled={isSaving} onClick={() => handleStatusChange(selectedFacture, 'rejetee')} className="h-10 rounded-[10px] border border-[#F2E8DC] bg-white text-[12px] font-semibold text-[#DC2626] hover:bg-[#FEE2E2] disabled:opacity-60">
                  Rejeter
                </button>
              </div>
              ) : (
              <div className="mt-5 rounded-[14px] border border-[#F2E8DC] bg-[#FAF6F2] p-4 text-[12px] leading-5 text-[#6B6B6B]">
                Votre role ne permet pas de modifier le statut des factures.
              </div>
              )}
            </Card>
          )}

          <Card className="p-5">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-[#F06B21]" strokeWidth={1.75} />
              <div>
                <h2 className="text-[14px] font-semibold text-[#1E1E1E]">MVP retenu</h2>
                <p className="mt-2 text-[12px] leading-5 text-[#6B6B6B]">
                  Le faux OCR a ete retire. Le flux testable est: saisir, rattacher a un chantier, enregistrer, puis valider ou rejeter. Les fichiers selectionnes ici ne sont pas encore des fichiers Storage durables.
                </p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
