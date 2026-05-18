import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Euro,
  ExternalLink,
  FileText,
  Hammer,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ReceiptText,
  User,
  X,
} from 'lucide-react'
import type { Client } from '@/data/clients'
import type { StatutChantier, TendanceChantier } from '@/data/chantiers'
import type { PrevisionnelLine } from '@/data/previsionnel'
import { operationalPrevisionnelLines } from '@/lib/previsionnelModel'
import { categoryColors, categoryLabels, euro } from '@/lib/previsionnelAnalytics'
import { useApp } from '@/lib/store'
import { canAccessPage } from '@/lib/accessControl'
import { isDataConnectEnabled } from '@/lib/dataconnect'
import { updateClientInSql } from '@/features/operations/operationalAdapters'
import { useOperationalData } from '@/features/operations/useOperationalData'

const typeLabel: Record<Client['type'], string> = {
  particulier: 'Particulier',
  professionnel: 'Professionnel',
  public: 'Collectivité',
}

const typeStyle: Record<Client['type'], string> = {
  particulier: 'bg-[#FDEBDD] text-[#F06B21]',
  professionnel: 'bg-[#F1E6D6] text-[#A45A2C]',
  public: 'bg-[#DCE9F2] text-[#3C3C3C]',
}

const clientTypeOptions = Object.keys(typeLabel) as Client['type'][]

const chantierStatus: Record<StatutChantier, { label: string; className: string }> = {
  en_cours: { label: 'En cours', className: 'bg-[#FDEBDD] text-[#F06B21]' },
  en_attente: { label: 'En attente', className: 'bg-[#FAF6F2] text-[#6B6B6B]' },
  cloture: { label: 'Clôturé', className: 'bg-[#F1E6D6] text-[#3C3C3C]' },
}

const tendencyStatus: Record<TendanceChantier, { label: string; className: string }> = {
  vert: { label: 'Budget maîtrisé', className: 'bg-[#FAF6F2] text-[#3C3C3C]' },
  orange: { label: 'Surveillance', className: 'bg-[#FDEBDD] text-[#F06B21]' },
  rouge: { label: 'Risque marge', className: 'bg-[#FEE2E2] text-[#DC2626]' },
}

function formatDate(value?: string | null) {
  if (!value) return 'Non renseignée'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Non renseignée'
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function amountBase(line?: PrevisionnelLine | null, fallback = 0) {
  if (!line) return fallback
  return line.caPrevision || line.caContrat || line.plannedTotal || line.realizedTotal
}

function chantierLineId(chantierId?: string | null) {
  if (!chantierId?.startsWith('prev-chantier-')) return null
  return `prev-${chantierId.replace(/^prev-chantier-/, '')}`
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[20px] border border-[#EADBC8] bg-white shadow-[0_1px_0_rgba(255,255,255,.9)_inset,0_14px_34px_rgba(30,30,30,0.045)] ${className}`}>{children}</section>
}

function SourcePill({ label, tone = 'local' }: { label: string; tone?: 'sql' | 'local' | 'static' }) {
  const className =
    tone === 'sql'
      ? 'border-[#D8EBDD] bg-[#E6F4EA] text-[#1E8E3E]'
      : tone === 'static'
        ? 'border-[#F2E8DC] bg-[#FAF6F2] text-[#6B6B6B]'
        : 'border-[#F2E8DC] bg-[#FDEBDD] text-[#D95B17]'

  return (
    <span className={`inline-flex items-center rounded-[8px] border px-2.5 py-1 text-[11px] font-semibold ${className}`}>
      {label}
    </span>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
  detail: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#FDEBDD] text-[#F06B21]">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-[#6B6B6B]">{label}</p>
          <p className="mt-1 truncate text-[19px] font-semibold text-[#1E1E1E]">{value}</p>
          <p className="mt-1 text-[11px] text-[#6B6B6B]">{detail}</p>
        </div>
      </div>
    </Card>
  )
}

function EmptyValue({ label }: { label: string }) {
  return <span className="text-[#9CA3AF]">{label} non fourni par l'Excel</span>
}

type ClientEditForm = {
  type: Client['type']
  nom: string
  email: string
  telephone: string
  adresse: string
  ville: string
  codePostal: string
}

function createClientEditForm(client: Client): ClientEditForm {
  return {
    type: client.type,
    nom: client.nom,
    email: client.email,
    telephone: client.telephone,
    adresse: client.adresse,
    ville: client.ville,
    codePostal: client.codePostal,
  }
}

function optionalField(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, accessMatrix, updateClient } = useApp()
  const {
    clients,
    chantiers,
    source: operationalSource,
    isLoading: isOperationalLoading,
    error: operationalError,
    hasUnsyncedLocalChanges,
  } = useOperationalData()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [clientEditForm, setClientEditForm] = useState<ClientEditForm | null>(null)
  const [clientFeedback, setClientFeedback] = useState('')
  const [isClientSaving, setIsClientSaving] = useState(false)
  const canEditClient = canAccessPage(user?.role, 'clients', accessMatrix, 'edit')

  const previsionnelByLineId = useMemo(
    () => new Map(operationalPrevisionnelLines.map(line => [line.id, line])),
    [],
  )
  const client = clients.find(item => item.id === id)
  const clientChantiers = useMemo(
    () => chantiers.filter(chantier => chantier.clientId === id),
    [chantiers, id],
  )
  const clientLines = useMemo(
    () => clientChantiers
      .map(chantier => previsionnelByLineId.get(chantierLineId(chantier.id) ?? ''))
      .filter((line): line is PrevisionnelLine => Boolean(line)),
    [clientChantiers, previsionnelByLineId],
  )

  const selectedChantier = clientChantiers.find(chantier => chantier.id === selectedId) ?? clientChantiers[0]
  const selectedLine = previsionnelByLineId.get(chantierLineId(selectedChantier?.id) ?? '')
  const selectedBudget = amountBase(selectedLine, selectedChantier?.budgetPrevisionnel ?? 0)
  const selectedRealized = selectedLine?.realizedTotal ?? selectedChantier?.depensesEngagees ?? 0
  const budgetProgress = selectedBudget > 0 ? Math.min(100, Math.round((selectedRealized / selectedBudget) * 100)) : 0
  const totalBudget = clientLines.reduce((sum, line) => sum + amountBase(line), 0)
  const totalRealized = clientLines.reduce((sum, line) => sum + line.realizedTotal, 0)
  const invoiceSentCells = clientLines.reduce(
    (sum, line) => sum + line.monthly.filter(month => month.invoiceSent).length,
    0,
  )
  const latestExercise = clientLines.map(line => line.exercise).sort().at(-1) ?? 'Non renseigné'
  const isSqlSource = operationalSource === 'dataconnect'
  const sourceLabel = isOperationalLoading
    ? 'Chargement SQL'
    : isSqlSource
      ? 'SQL lu par le front'
      : operationalSource === 'excel'
        ? 'Fallback Excel/local visible'
        : 'Seeds locaux visibles'
  const sourceDetail = isSqlSource
    ? "Le client et ses chantiers sont lus via Data Connect dans cette session. Ce n'est pas un comptage sandbox distant."
    : "Le client et ses chantiers viennent d'un fallback front. Cela ne prouve aucune donnee presente en SQL sandbox."
  const canWriteSql = operationalSource === 'dataconnect' && isDataConnectEnabled && Boolean(user)

  if (!client) {
    return (
      <div className="min-h-full bg-[#FAF6F2] p-8">
        <button type="button" onClick={() => navigate('/clients')} className="inline-flex items-center gap-2 text-sm font-semibold text-[#F06B21]">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Retour clients
        </button>
        <Card className="mt-6 p-8">
          <h1 className="text-xl font-semibold text-[#1E1E1E]">Client introuvable</h1>
          <p className="mt-2 text-sm text-[#6B6B6B]">La fiche demandée n'existe pas dans les données chargées.</p>
        </Card>
      </div>
    )
  }

  const currentClient = client

  function startClientEdit() {
    setClientEditForm(createClientEditForm(currentClient))
    setClientFeedback('')
  }

  async function saveClientEdit() {
    if (!clientEditForm || isClientSaving) return

    if (!canEditClient) {
      setClientFeedback("Client non modifie: votre role n'autorise pas l'edition des clients.")
      return
    }

    const normalized = {
      type: clientEditForm.type,
      nom: clientEditForm.nom.trim(),
      email: clientEditForm.email.trim(),
      telephone: clientEditForm.telephone.trim(),
      adresse: clientEditForm.adresse.trim(),
      ville: clientEditForm.ville.trim(),
      codePostal: clientEditForm.codePostal.trim(),
    }

    if (!normalized.nom) {
      setClientFeedback('Client non modifie: le nom est obligatoire.')
      return
    }

    setIsClientSaving(true)
    setClientFeedback('')

    try {
      if (canWriteSql) {
        if (currentClient.id.startsWith('prev-client-') || currentClient.id.startsWith('local-')) {
          setClientFeedback("Client non modifie: cette fiche n'est pas une ligne operationnelle SQL.")
          return
        }

        await updateClientInSql({
          id: currentClient.id,
          type: normalized.type,
          nom: normalized.nom,
          email: optionalField(normalized.email),
          telephone: optionalField(normalized.telephone),
          adresse: optionalField(normalized.adresse),
          ville: optionalField(normalized.ville),
          codePostal: optionalField(normalized.codePostal),
        })
        updateClient(currentClient.id, normalized)
        setClientEditForm(null)
        setClientFeedback('Client SQL Connect mis a jour.')
      } else {
        updateClient(currentClient.id, normalized)
        setClientEditForm(null)
        setClientFeedback("Client mis a jour en fallback local uniquement. Cela ne prouve pas une ecriture SQL ni une donnee sandbox.")
      }
    } catch (error) {
      console.error(error)
      setClientFeedback("Le client n'a pas pu etre enregistre en SQL. Aucun fallback local silencieux n'a ete applique.")
    } finally {
      setIsClientSaving(false)
    }
  }

  return (
    <div className="min-h-full bg-[#FAF6F2] p-6 xl:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <button type="button" onClick={() => navigate('/clients')} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#F06B21] hover:text-[#D95B17]">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            Clients
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[30px] font-semibold leading-tight text-[#1E1E1E]">{client.nom}</h1>
            <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${typeStyle[client.type]}`}>{typeLabel[client.type]}</span>
            <span className="rounded-full bg-[#FAF6F2] px-2.5 py-1 text-[12px] font-semibold text-[#6B6B6B]">
              {clientLines.length} ligne{clientLines.length > 1 ? 's' : ''} previsionnel
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-[#6B6B6B]">
            Fiche consolidant la source operationnelle chargee et les lignes previsionnelles Excel rattachees quand elles existent.
          </p>
        </div>

        {selectedChantier && (
          <Link to={`/chantiers/${selectedChantier.id}`} className="inline-flex h-10 w-fit items-center gap-2 rounded-[14px] bg-[#F06B21] px-4 text-sm font-semibold text-white hover:bg-[#D95B17]">
            Ouvrir chantier
            <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        )}
      </div>

      <Card className="mb-5 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <SourcePill label={sourceLabel} tone={isSqlSource ? 'sql' : 'local'} />
          {hasUnsyncedLocalChanges && <SourcePill label="Fallback non verite SQL" tone="local" />}
          {operationalError && <SourcePill label="SQL indisponible" tone="local" />}
          <SourcePill label="Previsionnel Excel rattache" tone="static" />
          <SourcePill label="Documents/emails: non affiches ici" tone="static" />
        </div>
        <p className="mt-2 text-[12px] text-[#6B6B6B]">
          {sourceDetail} Les montants previsionnels restent issus du fichier Excel importe et ne transforment pas les chantiers historiques en chantiers operationnels actifs.
        </p>
        {operationalError && (
          <p className="mt-2 text-[12px] font-medium text-[#D95B17]">
            Derniere erreur SQL: {operationalError}
          </p>
        )}
      </Card>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <main className="min-w-0 space-y-5">
          <Card className="overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-[#F2E8DC] p-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#F06B21]">Chantier sélectionné</p>
                <h2 className="mt-2 text-[24px] font-semibold text-[#1E1E1E]">{selectedLine?.rawName ?? selectedChantier?.nom ?? 'Aucun chantier'}</h2>
                <p className="mt-1 text-sm text-[#6B6B6B]">
                  {selectedLine
                    ? `Source ${selectedLine.sourceSheet}, ligne ${selectedLine.sourceRow}.`
                    : 'Aucune ligne Excel rattachée à ce chantier.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedLine && (
                  <span
                    className="rounded-full border px-3 py-1 text-[12px] font-semibold"
                    style={{ borderColor: categoryColors[selectedLine.category], color: categoryColors[selectedLine.category] }}
                  >
                    {categoryLabels[selectedLine.category]}
                  </span>
                )}
                {selectedChantier && (
                  <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${chantierStatus[selectedChantier.statut].className}`}>
                    {chantierStatus[selectedChantier.statut].label}
                  </span>
                )}
              </div>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard icon={CalendarDays} label="Exercice" value={selectedLine?.exercise ?? latestExercise} detail={`Début chantier : ${formatDate(selectedChantier?.dateDebut)}`} />
              <MetricCard icon={Euro} label="Budget Excel" value={euro(selectedBudget)} detail={`${budgetProgress}% réalisé`} />
              <MetricCard icon={ReceiptText} label="Réalisé Excel" value={euro(selectedRealized)} detail={`Facturé/envoyé : ${euro(selectedLine?.invoicedTotal ?? 0)}`} />
              <MetricCard icon={Clock} label="Facture envoyée" value={`${selectedLine?.monthly.filter(month => month.invoiceSent).length ?? 0}`} detail="Cellules jaunes Excel, pas paiement encaissé" />
            </div>
          </Card>

          {selectedChantier && (
            <Card className="p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <h2 className="text-[18px] font-semibold text-[#1E1E1E]">Suivi prévisionnel</h2>
                  <p className="mt-1 text-sm text-[#6B6B6B]">{selectedChantier.description}</p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-[12px] font-semibold ${tendencyStatus[selectedChantier.tendance].className}`}>
                  {tendencyStatus[selectedChantier.tendance].label}
                </span>
              </div>
              <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
                <div>
                  <div className="mb-2 flex items-center justify-between text-[12px] font-medium">
                    <span className="text-[#6B6B6B]">Réalisé Excel</span>
                    <span className="text-[#1E1E1E]">{euro(selectedRealized)} / {euro(selectedBudget)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#EADBC8]">
                    <div className="h-full rounded-full bg-[#F06B21]" style={{ width: `${budgetProgress}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[12px]">
                  <div className="rounded-[14px] bg-[#FAF6F2] p-3">
                    <p className="text-[#6B6B6B]">CA contrat</p>
                    <p className="mt-1 font-semibold text-[#1E1E1E]">{euro(selectedLine?.caContrat ?? 0)}</p>
                  </div>
                  <div className="rounded-[14px] bg-[#FAF6F2] p-3">
                    <p className="text-[#6B6B6B]">CA prévision</p>
                    <p className="mt-1 font-semibold text-[#1E1E1E]">{euro(selectedLine?.caPrevision ?? 0)}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card className="overflow-hidden">
            <div className="border-b border-[#F2E8DC] px-5 py-4">
              <h2 className="text-[16px] font-semibold text-[#1E1E1E]">Mensualisation Excel</h2>
              <p className="mt-1 text-[12px] text-[#6B6B6B]">Les cellules jaunes indiquent une facture envoyée, pas forcément payée.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-[13px]">
                <thead className="bg-[#FAF6F2] text-[12px] font-medium text-[#6B6B6B]">
                  <tr>
                    <th className="px-5 py-3">Mois</th>
                    <th className="px-5 py-3 text-right">Prévu</th>
                    <th className="px-5 py-3 text-right">Réalisé</th>
                    <th className="px-5 py-3">Facture envoyée</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedLine?.monthly ?? []).map(month => (
                    <tr key={`${month.order}-${month.month}`} className="border-t border-[#F2E8DC]">
                      <td className="px-5 py-3 font-semibold text-[#1E1E1E]">{month.label}</td>
                      <td className="px-5 py-3 text-right text-[#3C3C3C]">{euro(month.planned)}</td>
                      <td className="px-5 py-3 text-right font-semibold text-[#1E1E1E]">{euro(month.realized)}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${month.invoiceSent ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-[#FAF6F2] text-[#6B6B6B]'}`}>
                          {month.invoiceSent ? 'Oui' : 'Non'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!selectedLine?.monthly.length && (
                    <tr>
                      <td colSpan={4} className="border-t border-[#F2E8DC] px-5 py-8 text-center text-sm text-[#6B6B6B]">
                        Aucune mensualisation détaillée dans l'Excel pour ce chantier.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-[#F2E8DC] px-5 py-4">
              <h2 className="text-[16px] font-semibold text-[#1E1E1E]">Lots Excel</h2>
              <p className="mt-1 text-[12px] text-[#6B6B6B]">Ventilation disponible dans la ligne source.</p>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
              {Object.entries(selectedLine?.lots ?? {}).map(([lot, value]) => (
                <div key={lot} className="rounded-[14px] bg-[#FAF6F2] p-3">
                  <p className="text-[12px] capitalize text-[#6B6B6B]">{lot.replace(/_/g, ' ')}</p>
                  <p className="mt-1 font-semibold text-[#1E1E1E]">{euro(value)}</p>
                </div>
              ))}
              {Object.keys(selectedLine?.lots ?? {}).length === 0 && (
                <p className="text-sm text-[#6B6B6B]">Aucun lot détaillé dans l'Excel pour ce chantier.</p>
              )}
            </div>
          </Card>
        </main>

        <aside className="space-y-5">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[16px] font-semibold text-[#1E1E1E]">Edition client</h2>
                <div className="mt-2">
                  <SourcePill label={canWriteSql ? 'Mutation SQL disponible' : 'Edition fallback local'} tone={canWriteSql ? 'sql' : 'local'} />
                </div>
              </div>
              <button
                type="button"
                onClick={clientEditForm ? () => setClientEditForm(null) : startClientEdit}
                className="inline-flex h-9 items-center gap-2 rounded-[12px] border border-[#F2E8DC] bg-white px-3 text-[12px] font-semibold text-[#1E1E1E] hover:bg-[#FAF6F2]"
              >
                {clientEditForm ? <X className="h-3.5 w-3.5" strokeWidth={1.75} /> : <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />}
                {clientEditForm ? 'Annuler' : 'Modifier'}
              </button>
            </div>

            {clientFeedback && (
              <p className="mt-3 text-[12px] font-medium text-[#D95B17]">{clientFeedback}</p>
            )}

            {clientEditForm && (
              <div className="mt-4 space-y-3">
                <label className="block text-[12px] font-medium text-[#6B6B6B]">
                  Type
                  <select
                    value={clientEditForm.type}
                    onChange={event => setClientEditForm(prev => prev ? { ...prev, type: event.target.value as Client['type'] } : prev)}
                    className="mt-1 h-10 w-full rounded-[12px] border border-[#F2E8DC] bg-white px-3 text-[13px] font-semibold text-[#1E1E1E] outline-none focus:border-[#F06B21]"
                  >
                    {clientTypeOptions.map(type => (
                      <option key={type} value={type}>{typeLabel[type]}</option>
                    ))}
                  </select>
                </label>
                {[
                  ['nom', 'Nom'],
                  ['email', 'Email'],
                  ['telephone', 'Telephone'],
                  ['adresse', 'Adresse'],
                  ['ville', 'Ville'],
                  ['codePostal', 'Code postal'],
                ].map(([key, label]) => (
                  <label key={key} className="block text-[12px] font-medium text-[#6B6B6B]">
                    {label}
                    <input
                      value={clientEditForm[key as keyof Omit<ClientEditForm, 'type'>]}
                      onChange={event => setClientEditForm(prev => prev ? { ...prev, [key]: event.target.value } : prev)}
                      className="mt-1 h-10 w-full rounded-[12px] border border-[#F2E8DC] bg-white px-3 text-[13px] font-semibold text-[#1E1E1E] outline-none focus:border-[#F06B21]"
                    />
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => void saveClientEdit()}
                  disabled={isClientSaving}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[14px] bg-[#F06B21] px-4 text-sm font-semibold text-white hover:bg-[#D95B17] disabled:cursor-not-allowed disabled:bg-[#C8B18C]"
                >
                  <Check className="h-4 w-4" strokeWidth={1.75} />
                  {isClientSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-[17px] font-semibold text-[#1E1E1E]">Informations client</h2>
            <div className="mt-4 space-y-3 text-[13px]">
              <div className="flex gap-3">
                <User className="mt-0.5 h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                <div>
                  <p className="font-semibold text-[#1E1E1E]">{client.nom}</p>
                  <p className="text-[#6B6B6B]">Première ligne : {formatDate(client.dateCreation)}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                {client.email ? <a href={`mailto:${client.email}`} className="text-[#3C3C3C] hover:text-[#F06B21]">{client.email}</a> : <EmptyValue label="Email" />}
              </div>
              <div className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                {client.telephone ? <a href={`tel:${client.telephone.replace(/\s/g, '')}`} className="text-[#3C3C3C] hover:text-[#F06B21]">{client.telephone}</a> : <EmptyValue label="Téléphone" />}
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                {client.adresse || client.codePostal || client.ville
                  ? <p className="text-[#3C3C3C]">{[client.adresse, client.codePostal, client.ville].filter(Boolean).join(' ')}</p>
                  : <EmptyValue label="Adresse" />}
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-[#1E1E1E]">Synthèse Excel</h2>
              <span className="rounded-full bg-[#FAF6F2] px-2.5 py-1 text-[11px] font-semibold text-[#6B6B6B]">{latestExercise}</span>
            </div>
            <div className="mt-4 space-y-3">
              {[
                ['Chantiers', `${clientLines.length}`],
                ['Budget total', euro(totalBudget)],
                ['Réalisé total', euro(totalRealized)],
                ['Cellules facture envoyée', `${invoiceSentCells}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-[12px] bg-[#FAF6F2] px-3 py-2.5 text-[13px]">
                  <span className="text-[#6B6B6B]">{label}</span>
                  <span className="font-semibold text-[#1E1E1E]">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-[16px] font-semibold text-[#1E1E1E]">Chantiers du client</h2>
            <div className="mt-4 space-y-3">
              {clientChantiers.map(chantier => {
                const line = previsionnelByLineId.get(chantierLineId(chantier.id) ?? '')
                return (
                  <button
                    key={chantier.id}
                    type="button"
                    onClick={() => setSelectedId(chantier.id)}
                    className={`flex w-full items-start gap-3 rounded-[14px] border p-3 text-left transition-colors ${selectedChantier?.id === chantier.id ? 'border-[#F06B21] bg-[#FFF9F4]' : 'border-[#F2E8DC] bg-white hover:bg-[#FAF6F2]'}`}
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#FDEBDD] text-[#F06B21]">
                      <Hammer className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#1E1E1E]">{line?.rawName ?? chantier.nom}</p>
                      <p className="mt-1 text-[11px] text-[#6B6B6B]">
                        {line ? `${line.exercise} · ${categoryLabels[line.category]} · ligne ${line.sourceRow}` : `Début ${formatDate(chantier.dateDebut)}`}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
                  </button>
                )
              })}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex gap-3">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#F06B21]" strokeWidth={1.75} />
              <div>
                <h2 className="text-[16px] font-semibold text-[#1E1E1E]">Source de la fiche</h2>
                <p className="mt-2 text-[13px] text-[#6B6B6B]">
                  Cette fiche n'affiche pas de documents, emails, photos ou contacts inventés. Les champs absents dans l'Excel restent explicitement non renseignés.
                </p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
