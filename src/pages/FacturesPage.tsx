import { useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  ExternalLink,
  FileText,
  Filter,
  LayoutGrid,
  Plus,
  ReceiptText,
  SlidersHorizontal,
  Upload,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { categorieLabels } from '@/data/factures'
import type { CategorieDepense, Facture } from '@/data/factures'

type FactureTab = 'toutes' | 'a_traiter' | 'validees' | 'en_attente' | 'rejetees'

const tabs: Array<{ key: FactureTab; label: string }> = [
  { key: 'toutes', label: 'Toutes' },
  { key: 'a_traiter', label: 'À traiter' },
  { key: 'validees', label: 'Validées' },
  { key: 'en_attente', label: 'En attente' },
  { key: 'rejetees', label: 'Rejetées' },
]

const categoryStyles: Partial<Record<CategorieDepense | 'fournitures', string>> = {
  bois_materiaux: 'bg-[#F1E6D6] text-[#A45A2C]',
  quincaillerie: 'bg-[#FAF6F2] text-[#6B6B6B]',
  sous_traitance: 'bg-[#FDEBDD] text-[#F06B21]',
  carburant: 'bg-[#E6F4EA] text-[#1E8E3E]',
  location_materiel: 'bg-[#DCE9F2] text-[#3C3C3C]',
  plomberie: 'bg-[#F1E6D6] text-[#6B6B6B]',
  electricite: 'bg-[#FDEBDD] text-[#F06B21]',
  peinture: 'bg-[#FAF6F2] text-[#6B6B6B]',
  fournitures: 'bg-[#FAF6F2] text-[#6B6B6B]',
}

const extractionQueue = [
  { file: 'Facture_Bois_Materiaux.pdf', size: '2.4 Mo', pct: 85, color: '#F06B21' },
  { file: 'Quincaillerie_Pro.pdf', size: '1.8 Mo', pct: 60, color: '#F06B21' },
  { file: 'Locamat_Location.pdf', size: '3.1 Mo', pct: 40, color: '#6B91B5' },
]

const extractedLines = [
  { label: 'Madrier sapin 45x145mm – L. 4m', qty: '15 ml', unit: '18,50 €', amount: '277,50 €', vat: '20%' },
  { label: 'Panne OSB 18mm – L. 2,50m', qty: '20 m²', unit: '22,00 €', amount: '440,00 €', vat: '20%' },
  { label: 'Vis à bois 6x100mm (boîte de 200)', qty: '2 unité', unit: '62,50 €', amount: '125,00 €', vat: '20%' },
]

const demoPending = [
  {
    fournisseur: 'Bois & Matériaux',
    numeroFacture: 'F2026-0148',
    date: '21/04/2026',
    montantHT: '842,50 €',
    categorie: 'bois_materiaux' as CategorieDepense,
    chantier: 'Maison Dupont',
  },
  {
    fournisseur: 'Quincaillerie Pro',
    numeroFacture: 'QPRO-2026-0521',
    date: '20/04/2026',
    montantHT: '156,80 €',
    categorie: 'quincaillerie' as CategorieDepense,
    chantier: 'Villa des Pins',
  },
  {
    fournisseur: 'Locamat',
    numeroFacture: 'LMT-85214',
    date: '19/04/2026',
    montantHT: '1 250,00 €',
    categorie: 'location_materiel' as CategorieDepense,
    chantier: 'Extension Martin',
  },
  {
    fournisseur: 'TotalEnergies',
    numeroFacture: 'TE-2026-0417',
    date: '18/04/2026',
    montantHT: '168,50 €',
    categorie: 'carburant' as CategorieDepense,
    chantier: 'Mairie du Centre',
  },
  {
    fournisseur: 'Martin SARL',
    numeroFacture: 'MART-2026-088',
    date: '17/04/2026',
    montantHT: '420,00 €',
    categorie: 'sous_traitance' as CategorieDepense,
    chantier: 'Terrasse Bernard',
  },
]

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('fr-FR')
}

function formatEuros(value: number) {
  return `${value.toLocaleString('fr-FR')} €`
}

function statusFor(statut: string) {
  if (statut === 'validee') return { label: 'Validée', className: 'bg-[#E6F4EA] text-[#1E8E3E]' }
  if (statut === 'rejetee') return { label: 'Rejetée', className: 'bg-[#FEE2E2] text-[#DC2626]' }
  return { label: 'À traiter', className: 'bg-[#FDEBDD] text-[#F06B21]' }
}

function categoryLabel(category: CategorieDepense | 'fournitures') {
  if (category === 'fournitures') return 'Fournitures'
  return categorieLabels[category] ?? category
}

function CategoryBadge({ category }: { category: CategorieDepense | 'fournitures' }) {
  return (
    <span className={`inline-flex rounded-[6px] px-2.5 py-1 text-[11px] font-medium ${categoryStyles[category] ?? 'bg-[#FAF6F2] text-[#6B6B6B]'}`}>
      {categoryLabel(category)}
    </span>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[20px] border border-[#F2E8DC] bg-white ${className}`}>{children}</section>
}

function InvoiceIcon({ color = '#F06B21' }: { color?: string }) {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#FAF6F2]">
      <FileText className="h-4 w-4" style={{ color }} strokeWidth={1.75} />
    </div>
  )
}

function InvoicePreview() {
  return (
    <div className="h-[112px] w-[92px] rounded-[8px] border border-[#F2E8DC] bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="h-3 w-12 rounded bg-[#1E1E1E]" />
      <div className="mt-2 h-1.5 w-14 rounded bg-[#EADBC8]" />
      <div className="mt-1 h-1.5 w-10 rounded bg-[#EADBC8]" />
      <div className="mt-4 grid grid-cols-3 gap-1">
        {[...Array(9)].map((_, index) => (
          <div key={index} className="h-2 rounded bg-[#F2E8DC]" />
        ))}
      </div>
      <div className="mt-4 h-8 rounded bg-[#FDEBDD]" />
    </div>
  )
}

function PendingRow({ row }: { row: (typeof demoPending)[number] }) {
  return (
    <tr className="border-b border-[#F2E8DC] last:border-b-0 hover:bg-[#F9F7F3]">
      <td className="w-10 px-3 py-3">
        <input type="checkbox" aria-label={`Sélectionner ${row.numeroFacture}`} className="h-4 w-4 rounded border-[#D8C9B2]" />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <InvoiceIcon color={row.categorie === 'location_materiel' ? '#6B91B5' : '#F06B21'} />
          <span className="text-[13px] font-medium text-[#1E1E1E]">{row.fournisseur}</span>
        </div>
      </td>
      <td className="px-3 py-3 text-[13px] text-[#3C3C3C]">{row.numeroFacture}</td>
      <td className="px-3 py-3 text-[13px] text-[#3C3C3C]">{row.date}</td>
      <td className="px-3 py-3 text-[13px] font-medium text-[#3C3C3C]">{row.montantHT}</td>
      <td className="px-3 py-3"><CategoryBadge category={row.categorie} /></td>
      <td className="px-3 py-3 text-[13px] text-[#3C3C3C]">{row.chantier}</td>
      <td className="px-3 py-3">
        <span className="rounded-[6px] bg-[#FDEBDD] px-2.5 py-1 text-[11px] font-medium text-[#F06B21]">À traiter</span>
      </td>
    </tr>
  )
}

function ValidatedRow({ facture }: { facture: Facture }) {
  const { chantiers, clients } = useApp()
  const chantier = chantiers.find(item => item.id === facture.chantierId)
  const client = clients.find(item => item.id === chantier?.clientId)
  const status = statusFor(facture.statut)

  return (
    <tr className="border-b border-[#F2E8DC] last:border-b-0 hover:bg-[#F9F7F3]">
      <td className="w-10 px-3 py-3">
        <input type="checkbox" aria-label={`Sélectionner ${facture.numeroFacture}`} className="h-4 w-4 rounded border-[#D8C9B2]" />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <InvoiceIcon color="#1E1E1E" />
          <span className="text-[13px] font-medium text-[#1E1E1E]">{facture.fournisseur}</span>
        </div>
      </td>
      <td className="px-3 py-3 text-[13px] text-[#3C3C3C]">{facture.numeroFacture}</td>
      <td className="px-3 py-3 text-[13px] text-[#3C3C3C]">{formatDate(facture.date)}</td>
      <td className="px-3 py-3 text-[13px] font-medium text-[#3C3C3C]">{formatEuros(facture.montantHT)}</td>
      <td className="px-3 py-3"><CategoryBadge category={facture.categorie} /></td>
      <td className="px-3 py-3 text-[13px] text-[#3C3C3C]">{chantier?.nom ?? client?.nom ?? 'Non rattachée'}</td>
      <td className="px-3 py-3">
        <span className={`rounded-[6px] px-2.5 py-1 text-[11px] font-medium ${status.className}`}>{status.label}</span>
      </td>
    </tr>
  )
}

export function FacturesPage() {
  const { factures, chantiers, user } = useApp()
  const [activeTab, setActiveTab] = useState<FactureTab>('a_traiter')

  const scopedFactures = useMemo(() => {
    if (user?.role !== 'chef_chantier') return factures
    return factures.filter(facture => {
      const chantier = chantiers.find(item => item.id === facture.chantierId)
      return chantier?.chefChantier === `${user.prenom} ${user.nom}`
    })
  }, [chantiers, factures, user])

  const validatedFactures = scopedFactures.filter(facture => facture.statut === 'validee')
  const pendingFactures = scopedFactures.filter(facture => facture.statut === 'en_attente')
  const rejectedFactures = scopedFactures.filter(facture => facture.statut === 'rejetee')

  const counts: Record<FactureTab, number> = {
    toutes: scopedFactures.length + demoPending.length,
    a_traiter: demoPending.length + pendingFactures.length,
    validees: validatedFactures.length,
    en_attente: pendingFactures.length,
    rejetees: rejectedFactures.length,
  }

  const totalValidated = validatedFactures.reduce((sum, facture) => sum + facture.montantTTC, 0)

  return (
    <div className="min-h-full bg-[#FAF6F2] p-6 xl:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight text-[#1E1E1E]">Factures fournisseurs</h1>
          <p className="mt-2 text-sm text-[#3C3C3C]">Centralisez et traitez toutes vos factures fournisseurs.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#F2E8DC] bg-white px-4 text-sm font-medium text-[#1E1E1E] hover:bg-[#F9F7F3]">
            <CalendarDays className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
            Période
            <ChevronDown className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
          </button>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#F2E8DC] bg-white px-4 text-sm font-medium text-[#1E1E1E] hover:bg-[#F9F7F3]">
            <Filter className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
            Filtres
            <ChevronDown className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
          </button>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-[#F06B21] px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-[#D95B17]">
            <Plus className="h-4 w-4" strokeWidth={2} />
            Nouvelle facture
          </button>
        </div>
      </div>

      <div className="mb-5 overflow-x-auto">
        <div className="inline-flex min-w-max gap-2">
          {tabs.map(tab => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'inline-flex h-10 items-center gap-2 rounded-[10px] border px-4 text-sm font-medium transition-colors',
                  isActive ? 'border-[#F2E8DC] bg-white text-[#F06B21]' : 'border-[#F2E8DC] bg-white text-[#1E1E1E] hover:bg-[#F9F7F3]',
                ].join(' ')}
              >
                {tab.label}
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${isActive ? 'bg-[#FDEBDD] text-[#F06B21]' : 'bg-[#FAF6F2] text-[#6B6B6B]'}`}>
                  {counts[tab.key]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <main className="min-w-0 space-y-5">
          <Card className="grid gap-5 border-dashed border-[#F06B21]/45 p-5 2xl:grid-cols-[minmax(260px,0.8fr)_minmax(380px,1fr)]">
            <div className="flex min-h-[210px] flex-col items-center justify-center rounded-[16px] bg-white text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF6F2] text-[#1E1E1E]">
                <Upload className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <p className="mt-4 text-[15px] font-semibold text-[#1E1E1E]">Déposer vos factures ici</p>
              <p className="mt-1 text-[13px] text-[#1E1E1E]">ou cliquez pour parcourir</p>
              <p className="mt-5 text-[11px] text-[#6B6B6B]">PDF, JPG, PNG ou HEIC – Taille max 20 Mo</p>
            </div>

            <div className="rounded-[16px] border border-[#F2E8DC] bg-white p-5">
              <h2 className="text-[15px] font-semibold text-[#1E1E1E]">3 fichiers en cours d’extraction</h2>
              <div className="mt-5 space-y-4">
                {extractionQueue.map(item => (
                  <div key={item.file} className="grid grid-cols-[30px_minmax(0,1fr)_58px_112px_124px] items-center gap-3">
                    <InvoiceIcon color={item.color} />
                    <p className="truncate text-[13px] font-medium text-[#1E1E1E]">{item.file}</p>
                    <span className="text-[12px] text-[#6B6B6B]">{item.size}</span>
                    <span className="text-[12px] text-[#6B6B6B]">Extraction {item.pct}%</span>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#EADBC8]">
                      <div className="h-full rounded-full bg-[#F06B21]" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[16px] font-semibold text-[#1E1E1E]">À traiter ({counts.a_traiter})</h2>
              <div className="flex items-center gap-2">
                <button type="button" className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-[12px] font-medium text-[#6B6B6B] hover:bg-[#F9F7F3]">
                  Trier par : <span className="text-[#1E1E1E]">Date</span>
                  <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
                <button type="button" className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#F2E8DC] bg-white text-[#6B6B6B] hover:bg-[#F9F7F3]" aria-label="Vue liste">
                  <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <button type="button" className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#F2E8DC] bg-[#FAF6F2] text-[#1E1E1E]" aria-label="Vue compacte">
                  <LayoutGrid className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse">
                  <thead className="bg-white text-left text-[12px] font-medium text-[#6B6B6B]">
                    <tr className="border-b border-[#F2E8DC]">
                      <th className="w-10 px-3 py-3"><input type="checkbox" aria-label="Tout sélectionner" className="h-4 w-4 rounded border-[#D8C9B2]" /></th>
                      <th className="px-3 py-3">Fournisseur</th>
                      <th className="px-3 py-3">N° de facture</th>
                      <th className="px-3 py-3">Date</th>
                      <th className="px-3 py-3">Montant HT</th>
                      <th className="px-3 py-3">Catégorie suggérée</th>
                      <th className="px-3 py-3">Chantier</th>
                      <th className="px-3 py-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoPending.map(row => <PendingRow key={row.numeroFacture} row={row} />)}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-[#F2E8DC] px-4 py-3">
                <button type="button" className="inline-flex items-center gap-2 text-sm font-medium text-[#1E1E1E] hover:text-[#F06B21]">
                  Voir toutes les factures à traiter
                  <ArrowIcon />
                </button>
              </div>
            </Card>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-8 border-b border-[#F2E8DC]">
              {[
                ['Validées', validatedFactures.length],
                ['En attente', pendingFactures.length],
                ['Rejetées', rejectedFactures.length],
              ].map(([label, count], index) => (
                <button
                  key={label}
                  type="button"
                  className={`border-b-2 pb-3 text-sm font-medium ${index === 0 ? 'border-[#1E8E3E] text-[#1E8E3E]' : 'border-transparent text-[#6B6B6B]'}`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] border-collapse">
                  <thead className="bg-white text-left text-[12px] font-medium text-[#6B6B6B]">
                    <tr className="border-b border-[#F2E8DC]">
                      <th className="w-10 px-3 py-3"><input type="checkbox" aria-label="Sélectionner les validées" className="h-4 w-4 rounded border-[#D8C9B2]" /></th>
                      <th className="px-3 py-3">Fournisseur</th>
                      <th className="px-3 py-3">N° de facture</th>
                      <th className="px-3 py-3">Date</th>
                      <th className="px-3 py-3">Montant HT</th>
                      <th className="px-3 py-3">Catégorie</th>
                      <th className="px-3 py-3">Chantier</th>
                      <th className="px-3 py-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validatedFactures.slice(0, 5).map(facture => <ValidatedRow key={facture.id} facture={facture} />)}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-[#F2E8DC] px-4 py-3">
                <button type="button" className="inline-flex items-center gap-2 text-sm font-medium text-[#1E1E1E] hover:text-[#F06B21]">
                  Voir toutes les factures validées
                  <ArrowIcon />
                </button>
              </div>
            </Card>
          </section>
        </main>

        <aside className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold text-[#1E1E1E]">Extraction IA</h2>
              <span className="rounded-[6px] bg-[#E6F4EA] px-2.5 py-1 text-[11px] font-semibold text-[#1E8E3E]">Confiance : 92%</span>
            </div>

            <div className="mt-5 flex gap-4 border-b border-[#F2E8DC] pb-5">
              <InvoicePreview />
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-semibold text-[#1E1E1E]">F2026-0148.pdf</h3>
                <p className="mt-2 text-[12px] text-[#6B6B6B]">Reçu le 21/04/2026 à 09:42</p>
                <p className="mt-1 text-[12px] text-[#6B6B6B]">Bois & Matériaux</p>
                <button type="button" className="mt-3 inline-flex items-center gap-2 text-[12px] font-medium text-[#6B6B6B] hover:text-[#1E1E1E]">
                  Voir le document original
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-[13px] font-semibold text-[#1E1E1E]">Informations extraites</h3>
              <div className="mt-4 space-y-4">
                {[
                  ['Fournisseur', 'Bois & Matériaux'],
                  ['N° de facture', 'F2026-0148'],
                  ['Date de facture', '18/04/2026'],
                  ['Date d’échéance', '18/05/2026 (à 27 jours)'],
                  ['Montant HT', '842,50 €'],
                  ['TVA (20%)', '168,50 €'],
                  ['Montant TTC', '1 011,00 €'],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[128px_minmax(0,1fr)_18px] items-center gap-3 text-[13px]">
                    <span className="text-[#1E1E1E]">{label}</span>
                    <span className="text-[#3C3C3C]">{value}</span>
                    <CheckCircle className="h-3.5 w-3.5 text-[#1E8E3E]" strokeWidth={1.75} />
                  </div>
                ))}
                {[
                  ['Mode de paiement', 'Virement'],
                  ['Chantier', 'Maison Dupont'],
                  ['Catégorie suggérée', 'Bois'],
                  ['Sous-catégorie', 'Bois de structure'],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[128px_minmax(0,1fr)] items-center gap-3 text-[13px]">
                    <span className="text-[#1E1E1E]">{label}</span>
                    <button type="button" className="flex h-9 items-center justify-between rounded-[8px] border border-[#F2E8DC] bg-white px-3 text-left text-[13px] text-[#3C3C3C]">
                      {value}
                      <ChevronDown className="h-3.5 w-3.5 text-[#6B6B6B]" strokeWidth={1.75} />
                    </button>
                  </div>
                ))}
                <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-3 text-[13px]">
                  <span className="pt-2 text-[#1E1E1E]">Notes</span>
                  <textarea className="h-16 resize-none rounded-[8px] border border-[#F2E8DC] bg-white px-3 py-2 text-[13px] text-[#1E1E1E] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F06B21]/20" placeholder="Ajouter une note..." />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-[13px] font-semibold text-[#1E1E1E]">Lignes extraites (3)</h3>
              <div className="overflow-hidden rounded-[10px] border border-[#F2E8DC]">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#FAF6F2] text-[#6B6B6B]">
                    <tr>
                      <th className="px-2 py-2 font-medium">Désignation</th>
                      <th className="px-2 py-2 font-medium">Qté</th>
                      <th className="px-2 py-2 font-medium">PU HT</th>
                      <th className="px-2 py-2 font-medium">Montant HT</th>
                      <th className="px-2 py-2 font-medium">TVA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedLines.map(line => (
                      <tr key={line.label} className="border-t border-[#F2E8DC]">
                        <td className="px-2 py-2 text-[#1E1E1E]">{line.label}</td>
                        <td className="px-2 py-2 text-[#3C3C3C]">{line.qty}</td>
                        <td className="px-2 py-2 text-[#3C3C3C]">{line.unit}</td>
                        <td className="px-2 py-2 text-[#3C3C3C]">{line.amount}</td>
                        <td className="px-2 py-2 text-[#3C3C3C]">{line.vat}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button type="button" className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[#F06B21] bg-white px-3 text-sm font-semibold text-[#F06B21] hover:bg-[#FDEBDD]">
                Rejeter
              </button>
              <button type="button" className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-sm font-semibold text-[#1E1E1E] hover:bg-[#FAF6F2]">
                Mettre en attente
              </button>
              <button type="button" className="inline-flex h-10 items-center justify-center rounded-[10px] bg-[#F06B21] px-3 text-sm font-semibold text-white hover:bg-[#D95B17]">
                Valider la facture
              </button>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#FDEBDD] text-[#F06B21]">
                <ReceiptText className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-[14px] font-semibold text-[#1E1E1E]">Pilotage fournisseur</h2>
                <p className="mt-1 text-[12px] text-[#6B6B6B]">{formatEuros(totalValidated)} validés dans le périmètre actuel.</p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function ArrowIcon() {
  return <ArrowRight className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
}
