import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import {
  Upload, CheckCircle,
  MapPin, Calendar, User, Euro, FileText, Mail, AlertTriangle,
  Sparkles, Check, X, ChevronRight, Share2, ChevronDown,
  Plus, TrendingUp, Image,
  Pencil, ArrowRight, MoreHorizontal,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { categorieLabels } from '@/data/factures'
import type { CategorieDepense, Facture } from '@/data/factures'
import { PieChart, Pie, Cell } from 'recharts'

const DONUT_COLORS: Record<string, string> = {
  bois_materiaux: '#F06B21',
  sous_traitance: '#1E1E1E',
  quincaillerie: '#A45A2C',
  carburant: '#C8B18C',
  location_materiel: '#EADBC8',
  plomberie: '#F89A62',
  electricite: '#6B6B6B',
  autre: '#9CA3AF',
}

const EXTRACTION_RESULT = {
  fournisseur: 'Matériaux Rhône',
  numeroFacture: 'MR-2026-0287',
  montantHT: 706.0,
  tva: 20,
  montantTTC: 847.2,
  date: new Date().toISOString().split('T')[0],
  categorie: 'bois_materiaux' as CategorieDepense,
  description: 'Bois de charpente sapin 63m², vis tirefond inox, chevrons 63x75',
  confidence: 94,
}

type UploadStep = 'idle' | 'uploading' | 'analyzing' | 'result' | 'done'


export function ChantierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { chantiers, factures, addFacture, user } = useApp()
  const navigate = useNavigate()

  const chantier = chantiers.find(c => c.id === id)
  const chantierFactures = factures.filter(f => f.chantierId === id)

  const [uploadStep, setUploadStep] = useState<UploadStep>('idle')
  const [extracted, setExtracted] = useState({ ...EXTRACTION_RESULT })
  const [_fileName, setFileName] = useState('')
  const canUpload = user?.role === 'gerant' || user?.role === 'assistante'

  const onDrop = useCallback((files: File[]) => {
    if (!files[0]) return
    setFileName(files[0].name)
    setUploadStep('uploading')
    setTimeout(() => setUploadStep('analyzing'), 1200)
    setTimeout(() => setUploadStep('result'), 3000)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png'] },
    maxFiles: 1,
    disabled: !canUpload || uploadStep !== 'idle',
  })

  function handleValidate() {
    const newFacture: Facture = {
      id: `facture-new-${Date.now()}`,
      chantierId: id!,
      fournisseur: extracted.fournisseur,
      montantHT: extracted.montantHT,
      tva: extracted.tva,
      montantTTC: extracted.montantTTC,
      date: extracted.date,
      categorie: extracted.categorie,
      statut: 'validee',
      numeroFacture: extracted.numeroFacture,
      description: extracted.description,
    }
    addFacture(newFacture)
    setUploadStep('done')
    setTimeout(() => setUploadStep('idle'), 2000)
  }

  function handleCancel() {
    setUploadStep('idle')
    setFileName('')
    setExtracted({ ...EXTRACTION_RESULT })
  }

  if (!chantier) {
    return (
      <div className="p-8 text-center text-[#6B6B6B]">
        <p>Chantier introuvable.</p>
        <button onClick={() => navigate('/chantiers')} className="mt-4 text-[#F06B21] hover:underline text-sm">
          Retour à la liste
        </button>
      </div>
    )
  }

  const pct = Math.round((chantier.depensesEngagees / chantier.budgetPrevisionnel) * 100)
  const marge = chantier.budgetPrevisionnel - chantier.depensesEngagees
  const margePercent = Math.round((marge / chantier.budgetPrevisionnel) * 100)

  const depensesParCategorie = chantierFactures
    .filter(f => f.statut === 'validee')
    .reduce<Record<string, number>>((acc, f) => {
      acc[f.categorie] = (acc[f.categorie] ?? 0) + f.montantTTC
      return acc
    }, {})

  const donutData = Object.entries(depensesParCategorie)
    .map(([cat, val]) => ({
      name: categorieLabels[cat as CategorieDepense] ?? cat,
      value: Math.round(val),
      color: DONUT_COLORS[cat] ?? '#9CA3AF',
      pct: Math.round((val / chantier.depensesEngagees) * 100),
    }))
    .sort((a, b) => b.value - a.value)

  const TABS = ['Vue d\'ensemble', 'Documents', 'Factures', 'Emails', 'Planning', 'Rapports', 'Photos', 'Équipe', 'Infos chantier']

  const LOTS = [
    { label: 'Gros œuvre', pct: 100, color: '#1E8E3E' },
    { label: 'Charpente', pct: 75, color: '#F06B21' },
    { label: 'Isolation', pct: 60, color: '#F06B21' },
    { label: 'Bardage', pct: 40, color: '#DC2626' },
    { label: 'Menuiseries', pct: 0, color: '#9CA3AF' },
  ]

  const TIMELINE = [
    { label: 'Devis signé', date: '10/10/2025', done: true },
    { label: 'Préparation', date: '15/11/2025', done: true },
    { label: 'Démarrage chantier', date: '12/01/2026', done: true },
    { label: 'Fondations', date: '28/01/2026', done: true },
    { label: 'Élévation murs', date: '15/02/2026', done: true },
    { label: 'Charpente', date: '10/03/2026', done: false, active: true },
    { label: 'Isolation', date: '25/03/2026', done: false },
    { label: 'Bardage', date: '15/04/2026', done: false },
    { label: 'Menuiseries', date: '05/05/2026', done: false },
    { label: 'Livraison', date: 'Mai 2026', done: false },
  ]

  const TEAM = [
    { name: chantier.chefChantier, role: 'Conducteur de travaux', tag: 'Responsable', tagColor: '#1E8E3E' },
    { name: 'Paul Martin', role: 'Chef d\'équipe', tag: 'Terrain', tagColor: '#F06B21' },
    { name: 'Lucas Bernard', role: 'Charpentier', tag: 'Terrain', tagColor: '#F06B21' },
    { name: 'Sophie Leroy', role: 'Assistante de gestion', tag: 'Bureau', tagColor: '#6B91B5' },
  ]

  const DOCS = [
    { name: 'Plan_Masse_V2.pdf', size: '1.2 Mo', time: 'il y a 2h', color: '#DC2626' },
    { name: 'Devis_EXTENSION_BOIS.pdf', size: '890 Ko', time: 'il y a 5h', color: '#DC2626' },
    { name: 'Facture_Bois_Materiaux.pdf', size: '1.1 Mo', time: 'Hier', color: '#DC2626' },
    { name: 'Plan_Fondations.dwg', size: '2.5 Mo', time: 'Hier', color: '#6B91B5' },
    { name: 'Attestation_RT2020.pdf', size: '560 Ko', time: 'il y a 2j', color: '#DC2626' },
  ]

  const ACTIVITIES = [
    { icon: FileText, iconBg: '#FDEBDD', iconColor: '#F06B21', label: 'Facture validée – Bois & Matériaux', sub: '842,50 € – Catégorie : Bois', time: 'il y a 10 min' },
    { icon: Image, iconBg: '#E6F4EA', iconColor: '#1E8E3E', label: 'Compte-rendu ajouté par Paul Martin', sub: 'Avancement fondations + photos (3)', time: 'il y a 45 min' },
    { icon: Mail, iconBg: '#FDEBDD', iconColor: '#F06B21', label: 'Email reçu – Demande de devis extension', sub: 'Leroy Construction', time: 'il y a 1h' },
    { icon: FileText, iconBg: '#FAF6F2', iconColor: '#6B6B6B', label: 'Devis envoyé – Extension bois 20m²', sub: 'Devis n° DEV-2026-0158', time: 'il y a 2h' },
    { icon: CheckCircle, iconBg: '#E6F4EA', iconColor: '#1E8E3E', label: 'Paiement fournisseur enregistré', sub: 'Bois & Matériaux – 1 250,00 €', time: 'il y a 1j' },
  ]

  const ALERTS_CHANTIER = [
    { icon: TrendingUp, bg: '#FEE2E2', color: '#DC2626', label: 'Dépassement de budget prévisionnel', sub: 'Le chantier dépasse le budget de 12%.', time: 'il y a 2h' },
    { icon: FileText, bg: '#FEF3C7', color: '#B45309', label: 'Facture non attachée', sub: '2 factures en attente de rattachement.', time: 'il y a 5h' },
    { icon: AlertTriangle, bg: '#FEF3C7', color: '#B45309', label: 'Document manquant', sub: "Attestation d'assurance à fournir.", time: 'il y a 1j' },
  ]

  const ECHEANCES = [
    { day: '23', month: 'avr', label: 'Livraison matériaux', sub: '23 avril 2026 à 10:30', tag: 'À voir' },
    { day: '05', month: 'mai', label: 'Réunion de chantier', sub: '5 mai 2026 à 09:00', tag: 'À voir' },
    { day: '15', month: 'mai', label: 'Contrôle isolation', sub: '15 mai 2026 à 14:00', tag: 'À voir' },
  ]

  const INDICATEURS = [
    { label: 'Délai', value: 'J-32', sub: 'vs planning', trend: '+2 jours', up: false },
    { label: 'Qualité', value: '100%', sub: 'Réserves levées', trend: null, up: true },
    { label: 'Sécurité', value: '0', sub: 'Incident', trend: null, up: true },
    { label: 'Heures effectuées', value: '320 h', sub: 'vs prévision 350h', trend: null, up: null },
    { label: 'Heures à venir', value: '180 h', sub: 'Prévisionnelles', trend: '-8%', up: false },
  ]

  return (
    <div className="bg-[#FAF6F2] min-h-full">

      {/* ── Top header bar ── */}
      <div className="bg-white border-b border-[#F2E8DC] px-7 py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] text-[#6B6B6B] mb-3">
          <button onClick={() => navigate('/chantiers')} className="hover:text-[#F06B21] transition-colors">Chantiers</button>
          <ChevronRight size={12} />
          <span className="text-[#1E1E1E] font-medium">{chantier.nom}</span>
        </div>

        {/* Title row */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[22px] font-bold text-[#1E1E1E]">{chantier.nom}</h1>
              <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                chantier.statut === 'en_cours' ? 'bg-[#E6F4EA] text-[#1E8E3E]' :
                chantier.statut === 'cloture' ? 'bg-[#F2E8DC] text-[#A45A2C]' :
                'bg-[#FEF3C7] text-[#B45309]'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {chantier.statut === 'en_cours' ? 'En cours' : chantier.statut === 'cloture' ? 'Clôturé' : 'En attente'}
              </span>
            </div>
            <div className="flex items-center gap-5 text-[12px] text-[#6B6B6B]">
              <span className="flex items-center gap-1.5"><MapPin size={12} /> {chantier.adresse}</span>
              <span className="flex items-center gap-1.5"><Calendar size={12} /> Démarrage : {new Date(chantier.dateDebut).toLocaleDateString('fr-FR')}</span>
              <span className="flex items-center gap-1.5"><User size={12} /> Livraison prévue : {new Date(chantier.dateFinPrevue).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-[#6B6B6B] bg-white border border-[#F2E8DC] rounded-[10px] hover:text-[#1E1E1E] transition-colors">
              <Share2 size={13} /> Partager
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-[12px] font-semibold text-white bg-[#1E1E1E] hover:bg-black rounded-[10px] transition-colors">
              Actions <ChevronDown size={13} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 mt-4 border-b border-[#F2E8DC] -mb-px">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`px-4 py-2 text-[12px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                i === 0
                  ? 'border-[#F06B21] text-[#F06B21]'
                  : 'border-transparent text-[#6B6B6B] hover:text-[#1E1E1E]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="px-7 py-5 flex gap-5">

        {/* ── Left + center (2/3) ── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* KPI cards row */}
          <div className="grid grid-cols-5 gap-3">
            {/* Avancement */}
            <div className="bg-white rounded-[16px] p-4 border border-[#F2E8DC]">
              <p className="text-[11px] text-[#6B6B6B] mb-1">Avancement</p>
              <p className="text-[28px] font-bold text-[#1E1E1E] leading-none">{pct}%</p>
              <div className="w-full bg-[#F2E8DC] rounded-full h-1.5 mt-2">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    backgroundColor: chantier.tendance === 'rouge' ? '#DC2626' : chantier.tendance === 'orange' ? '#F06B21' : '#1E8E3E',
                  }}
                />
              </div>
              <p className="text-[10px] text-[#1E8E3E] font-semibold mt-1">+8% vs semaine dernière</p>
            </div>
            {/* Budget total */}
            <div className="bg-white rounded-[16px] p-4 border border-[#F2E8DC]">
              <p className="text-[11px] text-[#6B6B6B] mb-1">Budget total</p>
              <p className="text-[22px] font-bold text-[#1E1E1E] leading-none">{chantier.budgetPrevisionnel.toLocaleString('fr-FR')} €</p>
              <p className="text-[10px] text-[#6B6B6B] mt-1">HT</p>
            </div>
            {/* Dépenses */}
            <div className="bg-white rounded-[16px] p-4 border border-[#F2E8DC]">
              <p className="text-[11px] text-[#6B6B6B] mb-1">Dépenses engagées</p>
              <p className="text-[22px] font-bold text-[#1E1E1E] leading-none">{chantier.depensesEngagees.toLocaleString('fr-FR')} €</p>
              <p className="text-[10px] text-[#6B6B6B] mt-1">{pct}% du budget</p>
            </div>
            {/* Marge */}
            <div className="bg-white rounded-[16px] p-4 border border-[#F2E8DC]">
              <p className="text-[11px] text-[#6B6B6B] mb-1">Marge prévisionnelle</p>
              <p className={`text-[22px] font-bold leading-none ${marge < 0 ? 'text-[#DC2626]' : 'text-[#1E1E1E]'}`}>
                {Math.abs(marge).toLocaleString('fr-FR')} €
              </p>
              <p className="text-[10px] text-[#6B6B6B] mt-1">{margePercent}%</p>
            </div>
            {/* Prochaine échéance */}
            <div className="bg-white rounded-[16px] p-4 border border-[#F2E8DC]">
              <p className="text-[11px] text-[#6B6B6B] mb-1">Prochaine échéance</p>
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar size={12} className="text-[#F06B21]" />
                <p className="text-[12px] font-semibold text-[#1E1E1E]">Livraison matériaux</p>
              </div>
              <p className="text-[10px] text-[#6B6B6B]">23 avril 2026 à 10:30</p>
              <button className="mt-1 flex items-center gap-1 text-[10px] text-[#F06B21] font-medium hover:text-[#D95B17]">
                Voir le planning <ArrowRight size={10} />
              </button>
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white rounded-[16px] border border-[#F2E8DC] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-[#1E1E1E]">Activité récente</h2>
              <button className="text-[11px] text-[#F06B21] font-medium hover:text-[#D95B17] flex items-center gap-1">
                Voir toute l'activité <ArrowRight size={11} />
              </button>
            </div>
            <div className="space-y-3">
              {ACTIVITIES.map((a, i) => {
                const Icon = a.icon
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: a.iconBg }}>
                      <Icon size={13} strokeWidth={1.75} style={{ color: a.iconColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#1E1E1E] truncate">{a.label}</p>
                      <p className="text-[11px] text-[#6B6B6B] truncate">{a.sub}</p>
                    </div>
                    <span className="text-[10px] text-[#9CA3AF] shrink-0">{a.time}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Photos récentes */}
          <div className="bg-white rounded-[16px] border border-[#F2E8DC] p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-semibold text-[#1E1E1E]">Photos récentes</h2>
              <button className="text-[11px] text-[#F06B21] font-medium hover:text-[#D95B17] flex items-center gap-1">
                Voir toutes les photos <ArrowRight size={11} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square rounded-[10px] bg-[#EADBC8] flex items-center justify-center overflow-hidden">
                  <Image size={22} className="text-[#A45A2C] opacity-60" />
                </div>
              ))}
            </div>
          </div>

          {/* Synthèse financière */}
          <div className="bg-white rounded-[16px] border border-[#F2E8DC] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-[#1E1E1E]">Synthèse financière</h2>
              <button className="flex items-center gap-1 text-[11px] text-[#6B6B6B] bg-[#FAF6F2] border border-[#F2E8DC] px-2 py-1 rounded-[6px]">
                Ce mois <ChevronDown size={11} />
              </button>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                <PieChart width={150} height={150}>
                  <Pie
                    data={donutData.length > 0 ? donutData : [{ name: 'Aucune', value: 1, color: '#EADBC8', pct: 100 }]}
                    cx={70} cy={70} innerRadius={45} outerRadius={68}
                    startAngle={90} endAngle={-270} dataKey="value" strokeWidth={2} stroke="#FAF6F2"
                  >
                    {(donutData.length > 0 ? donutData : [{ color: '#EADBC8' }]).map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[12px] font-bold text-[#1E1E1E]">{chantier.depensesEngagees.toLocaleString('fr-FR')} €</span>
                  <span className="text-[9px] text-[#6B6B6B]">Dépenses engagées</span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                {donutData.slice(0, 6).map(d => (
                  <div key={d.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-[11px] text-[#3C3C3C] truncate max-w-[80px]">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-semibold text-[#1E1E1E]">{d.pct}%</span>
                      <span className="text-[10px] text-[#6B6B6B] w-16 text-right">{d.value.toLocaleString('fr-FR')} €</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="mt-3 flex items-center gap-1 text-[11px] font-medium text-[#F06B21] hover:text-[#D95B17] transition-colors">
              Voir le détail des dépenses <ArrowRight size={11} />
            </button>
          </div>

          {/* Derniers documents */}
          <div className="bg-white rounded-[16px] border border-[#F2E8DC] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-[#1E1E1E]">Derniers documents</h2>
              <button className="text-[11px] text-[#F06B21] font-medium hover:text-[#D95B17] flex items-center gap-1">
                Voir tous les documents <ArrowRight size={11} />
              </button>
            </div>
            <div className="space-y-2.5">
              {DOCS.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0" style={{ backgroundColor: d.color + '22' }}>
                    <FileText size={13} style={{ color: d.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#1E1E1E] truncate">{d.name}</p>
                    <p className="text-[10px] text-[#9CA3AF]">{d.size}</p>
                  </div>
                  <span className="text-[10px] text-[#9CA3AF] shrink-0">{d.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Avancement par lot + Dépenses vs Prévisionnel */}
          <div className="grid grid-cols-2 gap-4">
            {/* Avancement par lot */}
            <div className="bg-white rounded-[16px] border border-[#F2E8DC] p-5">
              <h2 className="text-[13px] font-semibold text-[#1E1E1E] mb-4">Avancement par lot</h2>
              <div className="space-y-3">
                {LOTS.map(lot => (
                  <div key={lot.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-[#3C3C3C]">{lot.label}</span>
                      <span className="text-[11px] font-semibold text-[#1E1E1E]">{lot.pct}%</span>
                    </div>
                    <div className="w-full bg-[#F2E8DC] rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${lot.pct}%`, backgroundColor: lot.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-3 flex items-center gap-1 text-[11px] font-medium text-[#F06B21] hover:text-[#D95B17] transition-colors">
                Voir le détail des lots <ArrowRight size={11} />
              </button>
            </div>

            {/* Échéances clés */}
            <div className="bg-white rounded-[16px] border border-[#F2E8DC] p-5">
              <h2 className="text-[13px] font-semibold text-[#1E1E1E] mb-4">Échéances clés</h2>
              <div className="space-y-3">
                {ECHEANCES.map((e, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 shrink-0 text-center">
                      <p className="text-[16px] font-bold text-[#F06B21] leading-none">{e.day}</p>
                      <p className="text-[9px] text-[#6B6B6B] uppercase">{e.month}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#1E1E1E]">{e.label}</p>
                      <p className="text-[10px] text-[#6B6B6B]">{e.sub}</p>
                    </div>
                    <span className="text-[10px] font-medium text-[#F06B21] bg-[#FDEBDD] px-2 py-0.5 rounded-full shrink-0">{e.tag}</span>
                  </div>
                ))}
              </div>
              <button className="mt-3 flex items-center gap-1 text-[11px] font-medium text-[#F06B21] hover:text-[#D95B17] transition-colors">
                Voir le planning <ArrowRight size={11} />
              </button>
            </div>
          </div>

          {/* Indicateurs clés */}
          <div className="bg-white rounded-[16px] border border-[#F2E8DC] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-[#1E1E1E]">Indicateurs clés</h2>
              <button className="text-[11px] text-[#F06B21] font-medium hover:text-[#D95B17] flex items-center gap-1">
                Voir tous les indicateurs <ArrowRight size={11} />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {INDICATEURS.map((ind, i) => (
                <div key={i} className="text-center">
                  <p className="text-[11px] text-[#6B6B6B] mb-1">{ind.label}</p>
                  <p className="text-[20px] font-bold text-[#1E1E1E] leading-none">{ind.value}</p>
                  <p className="text-[10px] text-[#6B6B6B] mt-0.5">{ind.sub}</p>
                  {ind.trend && (
                    <p className={`text-[10px] font-semibold mt-0.5 ${ind.up === false ? 'text-[#DC2626]' : 'text-[#1E8E3E]'}`}>{ind.trend}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-[16px] border border-[#F2E8DC] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-[#1E1E1E]">Timeline du chantier</h2>
              <div className="flex items-center gap-3 text-[10px] text-[#6B6B6B]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#1E8E3E]" /> Terminé</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F06B21]" /> En cours</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#9CA3AF]" /> À venir</span>
              </div>
            </div>
            <div className="flex items-start gap-0 overflow-x-auto pb-2">
              {TIMELINE.map((t, i) => (
                <div key={i} className="flex flex-col items-center min-w-[80px]">
                  <div className="flex items-center w-full">
                    {i > 0 && (
                      <div className={`flex-1 h-0.5 ${t.done || TIMELINE[i - 1].done ? 'bg-[#1E8E3E]' : 'bg-[#EADBC8]'}`} />
                    )}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 ${
                      t.done
                        ? 'bg-[#1E8E3E] border-[#1E8E3E]'
                        : (t as any).active
                        ? 'bg-[#F06B21] border-[#F06B21]'
                        : 'bg-white border-[#EADBC8]'
                    }`}>
                      {t.done ? (
                        <Check size={12} className="text-white" strokeWidth={2.5} />
                      ) : (t as any).active ? (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[#EADBC8]" />
                      )}
                    </div>
                    {i < TIMELINE.length - 1 && (
                      <div className={`flex-1 h-0.5 ${t.done ? 'bg-[#1E8E3E]' : 'bg-[#EADBC8]'}`} />
                    )}
                  </div>
                  <p className="text-[10px] font-medium text-[#1E1E1E] text-center mt-1.5 leading-tight">{t.label}</p>
                  <p className="text-[9px] text-[#9CA3AF] text-center">{t.date}</p>
                </div>
              ))}
            </div>
            <button className="mt-2 flex items-center gap-1 text-[11px] font-medium text-[#F06B21] hover:text-[#D95B17] transition-colors">
              Voir toute la timeline <ArrowRight size={11} />
            </button>
          </div>
        </div>

        {/* ── Right panel (1/3) ── */}
        <div className="w-[280px] shrink-0 space-y-4">

          {/* Actions rapides */}
          <div className="bg-white rounded-[16px] border border-[#F2E8DC] p-4">
            <h2 className="text-[13px] font-semibold text-[#1E1E1E] mb-3">Actions rapides</h2>
            <button
              onClick={() => setUploadStep(uploadStep === 'idle' ? 'idle' : 'idle')}
              className="w-full flex items-center justify-center gap-2 bg-[#F06B21] hover:bg-[#D95B17] text-white text-[12px] font-semibold py-2.5 rounded-[10px] mb-2 transition-colors"
            >
              <Plus size={14} strokeWidth={2.5} /> Ajouter un document
            </button>
            <div className="space-y-1">
              {[
                { icon: FileText, label: 'Nouvelle facture fournisseur' },
                { icon: CheckCircle, label: 'Nouveau compte-rendu' },
                { icon: Euro, label: 'Créer un devis' },
              ].map((a, i) => (
                <button key={i} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-[#3C3C3C] hover:bg-[#FAF6F2] rounded-[8px] transition-colors">
                  <Plus size={12} className="text-[#F06B21]" strokeWidth={2.5} />
                  {a.label}
                </button>
              ))}
              <button className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-[#6B6B6B] hover:bg-[#FAF6F2] rounded-[8px] transition-colors">
                <MoreHorizontal size={14} /> Plus d'actions…
              </button>
            </div>
          </div>

          {/* Équipe affectée */}
          <div className="bg-white rounded-[16px] border border-[#F2E8DC] p-4">
            <h2 className="text-[13px] font-semibold text-[#1E1E1E] mb-3">Équipe affectée</h2>
            <div className="space-y-3">
              {TEAM.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#EADBC8] flex items-center justify-center shrink-0">
                    <User size={13} className="text-[#A45A2C]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#1E1E1E] truncate leading-tight">{m.name}</p>
                    <p className="text-[10px] text-[#6B6B6B] truncate">{m.role}</p>
                  </div>
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                    style={{ backgroundColor: m.tagColor + '22', color: m.tagColor }}
                  >
                    {m.tag}
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-3 flex items-center gap-1 text-[11px] font-medium text-[#F06B21] hover:text-[#D95B17] transition-colors">
              Voir toute l'équipe <ArrowRight size={11} />
            </button>
          </div>

          {/* Planning du chantier mini */}
          <div className="bg-white rounded-[16px] border border-[#F2E8DC] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-semibold text-[#1E1E1E]">Planning du chantier</h2>
              <span className="text-[11px] text-[#6B6B6B]">21 – 27 avr.</span>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Maison Dupont', team: 'Gros œuvre', color: '#A45A2C', bg: '#E8DCC5' },
                { label: 'Villa des Pins', team: 'Charpente', color: '#F06B21', bg: '#FDE9DB' },
                { label: 'Maison Dupont', team: 'Isolation', color: '#6B91B5', bg: '#DCE9F2' },
              ].map((e, i) => (
                <div key={i} className="rounded-[8px] px-2.5 py-1.5" style={{ backgroundColor: e.bg }}>
                  <p className="text-[11px] font-semibold" style={{ color: e.color }}>{e.label}</p>
                  <p className="text-[10px]" style={{ color: e.color + 'aa' }}>{e.team}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/planning')}
              className="mt-3 flex items-center gap-1 text-[11px] font-medium text-[#F06B21] hover:text-[#D95B17] transition-colors"
            >
              Voir le planning complet <ArrowRight size={11} />
            </button>
          </div>

          {/* Alertes */}
          <div className="bg-white rounded-[16px] border border-[#F2E8DC] p-4">
            <h2 className="text-[13px] font-semibold text-[#1E1E1E] mb-3">Alertes</h2>
            <div className="space-y-3">
              {ALERTS_CHANTIER.map((a, i) => {
                const Icon = a.icon
                return (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-[6px] flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: a.bg }}>
                      <Icon size={11} style={{ color: a.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[#1E1E1E] leading-tight">{a.label}</p>
                      <p className="text-[10px] text-[#6B6B6B]">{a.sub}</p>
                    </div>
                    <span className="text-[10px] text-[#9CA3AF] shrink-0">{a.time}</span>
                  </div>
                )
              })}
            </div>
            <button className="mt-3 flex items-center gap-1 text-[11px] font-medium text-[#F06B21] hover:text-[#D95B17] transition-colors">
              Voir toutes les alertes <ArrowRight size={11} />
            </button>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-[16px] border border-[#F2E8DC] p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[13px] font-semibold text-[#1E1E1E]">Notes</h2>
              <button className="text-[#6B6B6B] hover:text-[#1E1E1E] transition-colors">
                <Pencil size={13} />
              </button>
            </div>
            <p className="text-[12px] text-[#3C3C3C] leading-relaxed">
              Rappel : vérifier la livraison des fenêtres le 28/04.
            </p>
            <p className="text-[10px] text-[#9CA3AF] mt-2">Modifié par {chantier.chefChantier}, il y a 1h</p>
          </div>

          {/* Upload facture (si autorisé) */}
          {canUpload && (
            <div className="bg-white rounded-[16px] border border-[#F2E8DC] p-4">
              <h2 className="text-[13px] font-semibold text-[#1E1E1E] mb-3 flex items-center gap-2">
                <Upload size={13} className="text-[#F06B21]" /> Ajouter une facture
              </h2>
              {uploadStep === 'idle' && (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-[10px] p-4 text-center cursor-pointer transition-all ${
                    isDragActive ? 'border-[#F06B21] bg-[#FDEBDD]' : 'border-[#EADBC8] hover:border-[#F06B21] hover:bg-[#FDEBDD]/40'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload size={20} className={`mx-auto mb-2 ${isDragActive ? 'text-[#F06B21]' : 'text-[#C8B18C]'}`} />
                  <p className="text-[11px] font-medium text-[#6B6B6B]">
                    {isDragActive ? 'Déposez ici…' : 'Glissez un PDF ou photo'}
                  </p>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">ou cliquez pour sélectionner</p>
                </div>
              )}
              {uploadStep === 'uploading' && (
                <div className="text-center py-4">
                  <div className="w-8 h-8 border-3 border-[#FDEBDD] border-t-[#F06B21] rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-[11px] text-[#6B6B6B]">Upload en cours…</p>
                </div>
              )}
              {uploadStep === 'analyzing' && (
                <div className="text-center py-4">
                  <div className="w-8 h-8 bg-[#FDEBDD] rounded-full flex items-center justify-center mx-auto mb-2">
                    <Sparkles size={16} className="text-[#F06B21] animate-pulse" />
                  </div>
                  <p className="text-[11px] text-[#6B6B6B]">Analyse IA…</p>
                </div>
              )}
              {uploadStep === 'result' && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] font-medium text-[#1E1E1E]">Extraction terminée</span>
                    <span className="text-[10px] bg-[#E6F4EA] text-[#1E8E3E] px-1.5 py-0.5 rounded-full font-semibold">{extracted.confidence}%</span>
                  </div>
                  <div className="space-y-2 mb-3">
                    {[
                      { label: 'Fournisseur', key: 'fournisseur' as const },
                      { label: 'N° facture', key: 'numeroFacture' as const },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-[10px] text-[#6B6B6B] mb-0.5">{f.label}</label>
                        <input
                          className="w-full px-2 py-1.5 rounded-[8px] border border-[#F2E8DC] text-[11px] focus:outline-none focus:ring-1 focus:ring-[#F06B21]"
                          value={extracted[f.key]}
                          onChange={e => setExtracted(x => ({ ...x, [f.key]: e.target.value }))}
                        />
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-[#6B6B6B] mb-0.5">Montant HT</label>
                        <input
                          type="number"
                          className="w-full px-2 py-1.5 rounded-[8px] border border-[#F2E8DC] text-[11px] focus:outline-none focus:ring-1 focus:ring-[#F06B21]"
                          value={extracted.montantHT}
                          onChange={e => setExtracted(x => ({ ...x, montantHT: parseFloat(e.target.value) || 0, montantTTC: (parseFloat(e.target.value) || 0) * (1 + x.tva / 100) }))}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#6B6B6B] mb-0.5">TVA %</label>
                        <input
                          type="number"
                          className="w-full px-2 py-1.5 rounded-[8px] border border-[#F2E8DC] text-[11px] focus:outline-none focus:ring-1 focus:ring-[#F06B21]"
                          value={extracted.tva}
                          onChange={e => setExtracted(x => ({ ...x, tva: parseInt(e.target.value) || 0, montantTTC: x.montantHT * (1 + (parseInt(e.target.value) || 0) / 100) }))}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleValidate}
                      className="flex-1 bg-[#F06B21] hover:bg-[#D95B17] text-white font-semibold py-2 rounded-[8px] text-[11px] transition-colors flex items-center justify-center gap-1"
                    >
                      <Check size={13} /> Valider
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-2 rounded-[8px] border border-[#F2E8DC] text-[#6B6B6B] hover:bg-[#FAF6F2] text-[11px] transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              )}
              {uploadStep === 'done' && (
                <div className="text-center py-4">
                  <div className="w-8 h-8 bg-[#E6F4EA] rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle size={16} className="text-[#1E8E3E]" />
                  </div>
                  <p className="text-[11px] font-semibold text-[#1E1E1E]">Facture validée !</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
