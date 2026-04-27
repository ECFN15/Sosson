import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  Euro,
  FileText,
  FileSpreadsheet,
  HardHat,
  Home,
  Keyboard,
  ListChecks,
  Mail,
  Menu,
  MessageSquare,
  MapPin,
  Mic,
  MoreHorizontal,
  Pencil,
  Plus,
  ReceiptText,
  Share2,
  ShieldCheck,
  Sparkles,
  Sun,
  Upload,
  UsersRound,
  WifiOff,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { emails, useApp } from '@/lib/store'
import { categorieLabels } from '@/data/factures'
import { getChantierCover, getChantierGallery } from '@/data/media'
import type { CategorieDepense } from '@/data/factures'
import type { Chantier } from '@/data/chantiers'
import type { Client } from '@/data/clients'

const DONUT_COLORS: Record<string, string> = {
  bois_materiaux: '#F06B21',
  sous_traitance: '#1E1E1E',
  quincaillerie: '#A45A2C',
  carburant: '#C8B18C',
  location_materiel: '#EADBC8',
  plomberie: '#F89A62',
  electricite: '#6B6B6B',
  peinture: '#3C3C3C',
}

const tabs = ['Vue d’ensemble', 'Documents', 'Factures', 'Emails', 'Planning', 'Rapports', 'Photos', 'Équipe', 'Infos chantier']

const lots = [
  { label: 'Gros œuvre', pct: 100, color: '#1E8E3E' },
  { label: 'Charpente', pct: 75, color: '#1E8E3E' },
  { label: 'Isolation', pct: 60, color: '#F06B21' },
  { label: 'Bardage', pct: 40, color: '#F06B21' },
  { label: 'Menuiseries', pct: 0, color: '#D7D0C8' },
]

const timeline = [
  { label: 'Devis signé', date: '10/12/2025', status: 'done' },
  { label: 'Préparation', date: '15/12/2025', status: 'done' },
  { label: 'Démarrage chantier', date: '12/01/2026', status: 'done' },
  { label: 'Fondations', date: '28/01/2026', status: 'done' },
  { label: 'Élévation murs', date: '15/02/2026', status: 'done' },
  { label: 'Charpente', date: '10/03/2026', status: 'active' },
  { label: 'Isolation', date: '25/03/2026', status: 'active' },
  { label: 'Bardage', date: '15/04/2026', status: 'todo' },
  { label: 'Menuiseries', date: '05/05/2026', status: 'todo' },
  { label: 'Livraison', date: 'Mai 2026', status: 'todo' },
] as const

const activities = [
  { icon: ReceiptText, bg: '#E6F4EA', color: '#1E8E3E', title: 'Facture validée – Bois & Matériaux', sub: '842,50 € – Catégorie : Bois', time: 'Il y a 10 min' },
  { icon: Camera, bg: '#E6F4EA', color: '#1E8E3E', title: 'Compte-rendu ajouté par Paul Martin', sub: 'Avancement fondations + photos (3)', time: 'Il y a 45 min' },
  { icon: Mail, bg: '#FAF6F2', color: '#1E1E1E', title: 'Email reçu – Demande de devis extension', sub: 'Leroy Construction', time: 'Il y a 1 h' },
  { icon: FileText, bg: '#FAF6F2', color: '#1E1E1E', title: 'Devis envoyé – Extension bois 20m²', sub: 'Devis n° DEV-2026-0158', time: 'Il y a 2 h' },
  { icon: CheckCircle2, bg: '#E6F4EA', color: '#1E8E3E', title: 'Paiement fournisseur enregistré', sub: 'Bois & Matériaux – 1 250,00 €', time: 'Il y a 1 j' },
]

const documents = [
  { name: 'Plan_Masse_V2.pdf', type: 'PDF – 1.2 Mo', time: 'Il y a 2 h', color: '#DC2626' },
  { name: 'Devis_EXTENSION_BOIS.pdf', type: 'PDF – 890 Ko', time: 'Il y a 5 h', color: '#DC2626' },
  { name: 'Facture_Bois_Materiaux.pdf', type: 'PDF – 1.1 Mo', time: 'Hier', color: '#1E8E3E' },
  { name: 'Plan_Fondations.dwg', type: 'DWG – 2.5 Mo', time: 'Hier', color: '#6B91B5' },
  { name: 'Attestation_RT2020.pdf', type: 'PDF – 560 Ko', time: 'Il y a 2 j', color: '#6B91B5' },
]

const deadlines = [
  { day: '23', month: 'AVR.', title: 'Livraison matériaux', sub: '23 avril 2026 à 10:30' },
  { day: '05', month: 'MAI', title: 'Réunion de chantier', sub: '5 mai 2026 à 09:00' },
  { day: '15', month: 'MAI', title: 'Contrôle isolation', sub: '15 mai 2026 à 14:00' },
]

const team = [
  { name: 'Jean Dupont', role: 'Conducteur de travaux', tag: 'Responsable', tagClass: 'bg-[#E6F4EA] text-[#1E8E3E]' },
  { name: 'Paul Martin', role: 'Chef d’équipe', tag: 'Terrain', tagClass: 'bg-[#DCE9F2] text-[#3C3C3C]' },
  { name: 'Lucas Bernard', role: 'Charpentier', tag: 'Terrain', tagClass: 'bg-[#DCE9F2] text-[#3C3C3C]' },
  { name: 'Sophie Leroy', role: 'Assistante de gestion', tag: 'Bureau', tagClass: 'bg-[#FEF3C7] text-[#B45309]' },
]

const indicators = [
  { label: 'Délai', value: 'J-32', sub: 'vs planning', chip: '+2 jours' },
  { label: 'Qualité', value: '100%', sub: 'Réserves levées' },
  { label: 'Sécurité', value: '0', sub: 'Incident' },
  { label: 'Heures effectuées', value: '320 h', sub: 'vs prévision 350 h', chip: '-8%' },
  { label: 'Heures à venir', value: '180 h', sub: 'Prévisionnelles' },
]

const budgetCurve = [
  { month: 'Janv.', real: 0, target: 0 },
  { month: 'Fév.', real: 21000, target: 24000 },
  { month: 'Mars', real: 42000, target: 45000 },
  { month: 'Avr.', real: 64000, target: 68000 },
  { month: 'Mai', real: 79000, target: 90000 },
  { month: 'Juin', real: 103000, target: 113000 },
  { month: 'Juil.', real: 118000, target: 130000 },
  { month: 'Août', real: 137000, target: 141000 },
  { month: 'Sept.', real: 140000, target: 143000 },
  { month: 'Oct.', real: 145000, target: 148000 },
]

function formatEuros(value: number) {
  return `${Math.round(value).toLocaleString('fr-FR')} €`
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-[20px] border border-[#F2E8DC] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${className}`}>
      {children}
    </section>
  )
}

function LinkButton({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" className="inline-flex items-center gap-1.5 rounded-[10px] px-1 py-1 text-[12px] font-medium text-[#1E1E1E] hover:bg-[#FAF6F2]">
      {children}
      <ArrowRight className="h-3.5 w-3.5 text-[#6B6B6B]" strokeWidth={1.75} />
    </button>
  )
}

function ProjectPhoto({ src }: { src: string }) {
  return (
    <div className="relative h-full min-h-[220px] overflow-hidden rounded-[14px] border border-[#F2E8DC] bg-[#EADBC8]">
      <img src={src} alt="Photo du chantier" className="h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E]/18 via-transparent to-transparent" />
    </div>
  )
}

function PhotoTile({ src }: { src: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] border border-[#F2E8DC] bg-[#EADBC8]">
      <img src={src} alt="Photo récente du chantier" className="h-full w-full object-cover" loading="lazy" />
    </div>
  )
}

function KpiCard({
  label,
  value,
  sub,
  children,
}: {
  label: string
  value: string
  sub?: string
  children?: React.ReactNode
}) {
  return (
    <Card className="min-h-[126px] p-5">
      <p className="text-[12px] font-medium text-[#3C3C3C]">{label}</p>
      <div className="mt-3 text-[24px] font-bold leading-none tracking-tight text-[#1E1E1E]">{value}</div>
      {children}
      {sub && <p className="mt-3 text-[11px] text-[#6B6B6B]">{sub}</p>}
    </Card>
  )
}

type MobileTab = 'report' | 'photos' | 'activity'

const mobileTabs: Array<{ key: MobileTab; label: string }> = [
  { key: 'report', label: 'Compte-rendu' },
  { key: 'photos', label: 'Photos (12)' },
  { key: 'activity', label: 'Activité' },
]

const mobileCrew = [
  { initials: 'JD', name: 'Jean Dupont', role: 'Conducteur de travaux' },
  { initials: 'LB', name: 'Lucas Bernard', role: 'Charpentier' },
  { initials: 'PM', name: 'Paul Martin', role: "Chef d'équipe" },
]

const mobileSteps = [
  { label: 'Début bardage', date: '22 avril 2026' },
  { label: 'Livraison linteaux', date: '22 avril 2026' },
  { label: 'Réunion client', date: '25 avril 2026' },
]

const mobileActivity = [
  {
    kind: 'report',
    title: 'Compte-rendu ajouté',
    author: 'Jean Dupont',
    time: "Aujourd'hui à 14:30",
    text: "Pose de l'ossature terminée. Début du bardage demain matin. Prévoir livraison linteaux.",
    action: 'Voir le compte-rendu',
  },
  {
    kind: 'photos',
    title: '4 photos ajoutées',
    author: 'Lucas Bernard',
    time: "Aujourd'hui à 11:15",
    action: 'Voir les photos',
  },
  {
    kind: 'document',
    title: 'Document ajouté',
    author: 'Paul Martin',
    time: 'Hier à 16:45',
    text: 'Plan_Masse_V2.pdf',
    action: 'Voir le document',
  },
  {
    kind: 'progress',
    title: 'Avancement mis à jour',
    author: 'Jean Dupont',
    time: 'Hier à 16:30',
    action: "Voir l'historique",
  },
  {
    kind: 'comment',
    title: 'Commentaire',
    author: 'Sophie Leroy',
    time: 'Hier à 15:20',
    text: 'Pensez à vérifier la livraison des menuiseries.',
    action: 'Voir le commentaire',
  },
]

function MobileCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-[16px] border border-[#F2E8DC] bg-white ${className}`}>
      {children}
    </section>
  )
}

function MobilePhotoTile({ src, small = false }: { src: string; small?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-[12px] border border-[#F2E8DC] bg-[#EADBC8] ${small ? 'aspect-square' : 'aspect-square'}`}>
      <img src={src} alt="Photo terrain du chantier" className="h-full w-full object-cover" loading="lazy" />
    </div>
  )
}

function MobileHeader({ chantier, active, onTabChange }: { chantier: Chantier; active: MobileTab; onTabChange: (tab: MobileTab) => void }) {
  return (
    <header className={`${active === 'report' ? 'bg-[#1E1E1E] text-white' : 'bg-white text-[#1E1E1E]'} sticky top-0 z-30 border-b border-[#F2E8DC]`}>
      <div className="flex h-14 items-center gap-3 px-4">
        <button type="button" className="grid h-10 w-10 place-items-center rounded-full">
          <ArrowRight className="h-5 w-5 rotate-180" strokeWidth={1.75} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[16px] font-semibold">{chantier.nom}</h1>
          <p className={`mt-0.5 flex items-center gap-1 text-[11px] ${active === 'report' ? 'text-[#C9C9C9]' : 'text-[#6B6B6B]'}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-[#1E8E3E]" />
            En cours
          </p>
        </div>
        <button type="button" className="h-10 rounded-[10px] bg-[#F06B21] px-3 text-[13px] font-semibold text-white">
          Enregistrer
        </button>
      </div>
      <nav className="grid grid-cols-3">
        {mobileTabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`border-b-2 px-2 py-3 text-[13px] font-medium ${
              active === tab.key
                ? 'border-[#F06B21] text-[#F06B21]'
                : active === 'report'
                  ? 'border-transparent text-[#C9C9C9]'
                  : 'border-transparent text-[#1E1E1E]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  )
}

function MobileBottomNav() {
  const items = [
    { icon: Home, label: 'Accueil', active: false },
    { icon: HardHat, label: 'Chantiers', active: true },
    { icon: Bell, label: 'Notifications', active: false, badge: true },
    { icon: Menu, label: 'Menu', active: false },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid h-16 grid-cols-5 items-center border-t border-[#F2E8DC] bg-white px-3">
      {items.slice(0, 2).map(item => {
        const Icon = item.icon
        return (
          <button key={item.label} type="button" className={`flex flex-col items-center gap-1 text-[10px] font-medium ${item.active ? 'text-[#F06B21]' : 'text-[#6B6B6B]'}`}>
            <Icon className="h-5 w-5" strokeWidth={1.75} />
            {item.label}
          </button>
        )
      })}
      <button type="button" className="mx-auto -mt-7 grid h-14 w-14 place-items-center rounded-full bg-[#F06B21] text-white shadow-[0_8px_24px_rgba(240,107,33,0.35)] ring-4 ring-[#FAF6F2]">
        <Plus className="h-6 w-6" strokeWidth={2.25} />
      </button>
      {items.slice(2).map(item => {
        const Icon = item.icon
        return (
          <button key={item.label} type="button" className="relative flex flex-col items-center gap-1 text-[10px] font-medium text-[#6B6B6B]">
            <span className="relative">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
              {item.badge && <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#F06B21] px-1 text-[9px] font-bold text-white">3</span>}
            </span>
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}

function MobileReportTab({ progress }: { progress: number }) {
  return (
    <main className="space-y-3 px-4 pb-24 pt-4">
      <MobileCard className="p-4">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#FAF6F2]">
            <CalendarDays className="h-5 w-5 text-[#1E1E1E]" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Aujourd'hui</h2>
            <p className="mt-1 text-[12px] text-[#6B6B6B]">21 avril 2026 à 14:30</p>
          </div>
        </div>
        <div className="mt-5">
          <p className="text-[12px] text-[#6B6B6B]">Avancement des travaux</p>
          <p className="mt-2 text-[14px] font-medium text-[#1E1E1E]">Gros œuvre</p>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <p className="text-[13px] text-[#6B6B6B]">Avancement</p>
          <p className="text-[18px] font-semibold text-[#1E1E1E]">{progress}%</p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F2E8DC]">
          <div className="h-full rounded-full bg-[#F06B21]" style={{ width: `${progress}%` }} />
        </div>
      </MobileCard>

      <MobileCard className="p-4">
        <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Météo</h2>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#FDEBDD]">
              <Sun className="h-5 w-5 text-[#F06B21]" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[20px] font-semibold text-[#1E1E1E]">18°C</p>
              <p className="text-[12px] text-[#6B6B6B]">Ensoleillé</p>
            </div>
          </div>
          <p className="flex items-center gap-1 text-[12px] text-[#6B6B6B]">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
            Le Mans
          </p>
        </div>
      </MobileCard>

      <MobileCard className="p-4">
        <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Équipe sur site</h2>
        <div className="mt-4 space-y-3">
          {mobileCrew.map(member => (
            <div key={member.name} className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#EADBC8] text-[12px] font-semibold text-[#1E1E1E]">{member.initials}</div>
              <div>
                <p className="text-[14px] font-medium text-[#1E1E1E]">{member.name}</p>
                <p className="text-[12px] text-[#6B6B6B]">{member.role}</p>
              </div>
            </div>
          ))}
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F2E8DC] bg-white text-[13px] font-medium text-[#1E1E1E]">+2</div>
        </div>
        <button type="button" className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium text-[#1E1E1E]">
          Voir toute l'équipe
          <ArrowRight className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
        </button>
      </MobileCard>

      <MobileCard className="p-4">
        <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Prise de notes</h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { icon: Keyboard, label: 'Clavier', active: false },
            { icon: Mic, label: 'Dictée', active: true },
            { icon: ClipboardCheck, label: 'Modèle', active: false },
          ].map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                type="button"
                className={`flex h-[66px] flex-col items-center justify-center gap-1.5 rounded-[14px] border text-[12px] font-medium ${
                  item.active ? 'border-[#F06B21] bg-[#F06B21] text-white' : 'border-[#F2E8DC] bg-white text-[#1E1E1E]'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
                {item.label}
              </button>
            )
          })}
        </div>
        <div className="mt-4 flex h-12 items-center gap-3 rounded-[14px] border border-[#F2E8DC] bg-white px-3">
          <button type="button" className="grid h-8 w-8 place-items-center rounded-full border border-[#F06B21] text-[#F06B21]">
            <span className="h-3 w-3 rounded-sm border-x-2 border-[#F06B21]" />
          </button>
          <div className="flex flex-1 items-center gap-0.5">
            {Array.from({ length: 34 }).map((_, index) => (
              <span key={index} className="w-0.5 rounded-full bg-[#9CA3AF]" style={{ height: `${8 + ((index * 7) % 22)}px` }} />
            ))}
          </div>
          <span className="text-[12px] text-[#6B6B6B]">00:45</span>
        </div>
        <div className="mt-4 rounded-[12px] border border-[#F2E8DC] bg-[#FDEBDD]/40 p-4 text-[14px] leading-[1.55] text-[#1E1E1E]">
          <p>Pose de l'ossature terminée.</p>
          <p>Début du bardage demain matin.</p>
          <p>Prévoir livraison linteaux.</p>
          <p className="mt-3">Réunion avec le client prévue vendredi pour validation menuiseries.</p>
        </div>
        <h3 className="mt-5 text-[14px] font-semibold text-[#1E1E1E]">Tags</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ['Gros œuvre', 'bg-[#E6F4EA] text-[#1E8E3E]'],
            ['Bardage', 'bg-[#FDEBDD] text-[#F06B21]'],
            ['Livraison', 'bg-[#DCE9F2] text-[#315A78]'],
          ].map(([label, style]) => (
            <span key={label} className={`rounded-[8px] px-3 py-1.5 text-[12px] font-medium ${style}`}>{label}</span>
          ))}
          <button type="button" className="grid h-8 w-8 place-items-center rounded-[8px] border border-[#F2E8DC] text-[#6B6B6B]">
            <Plus className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </MobileCard>

      <button type="button" className="h-12 w-full rounded-[14px] bg-[#F06B21] text-[14px] font-semibold text-white">
        Enregistrer le compte-rendu
      </button>
      <p className="flex items-center justify-center gap-1.5 text-[12px] text-[#1E8E3E]">
        <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
        Enregistré automatiquement
      </p>
    </main>
  )
}

function MobilePhotosTab({ chantier }: { chantier: Chantier }) {
  const gallery = getChantierGallery(chantier.id)

  return (
    <main className="space-y-5 px-4 pb-40 pt-5">
      <section>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[17px] font-semibold text-[#1E1E1E]">Photos du chantier</h2>
            <p className="mt-2 text-[13px] text-[#6B6B6B]">12 photos</p>
          </div>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-[13px] font-medium text-[#1E1E1E]">
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            Ajouter
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, index) => (
            <MobilePhotoTile key={index} src={gallery[index % gallery.length]} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[17px] font-semibold text-[#1E1E1E]">Documents liés</h2>
        <div className="mt-3 space-y-2">
          {[
            { icon: FileText, name: 'Plan_Masse_V2.pdf', type: 'PDF · 1.2 Mo', color: '#DC2626' },
            { icon: FileSpreadsheet, name: 'Planning_Intervention.xlsx', type: 'XLSX · 240 Ko', color: '#1E8E3E' },
          ].map(doc => {
            const Icon = doc.icon
            return (
              <MobileCard key={doc.name} className="flex items-center gap-3 p-3">
                <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#FAF6F2]">
                  <Icon className="h-5 w-5" style={{ color: doc.color }} strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-[#1E1E1E]">{doc.name}</p>
                  <p className="mt-1 text-[12px] text-[#6B6B6B]">{doc.type}</p>
                </div>
                <MoreHorizontal className="h-5 w-5 rotate-90 text-[#1E1E1E]" strokeWidth={1.75} />
              </MobileCard>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="text-[17px] font-semibold text-[#1E1E1E]">Localisation</h2>
        <MobileCard className="mt-3 overflow-hidden">
          <div className="relative h-28 bg-[#EADBC8] bg-[linear-gradient(135deg,#FAF6F2_25%,transparent_25%),linear-gradient(225deg,#FAF6F2_25%,transparent_25%),linear-gradient(45deg,#F2E8DC_25%,transparent_25%),linear-gradient(315deg,#F2E8DC_25%,#EADBC8_25%)] bg-[length:38px_38px]">
            <MapPin className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 fill-[#F06B21] text-[#F06B21]" strokeWidth={1.75} />
          </div>
          <div className="p-4">
            <p className="text-[13px] font-medium text-[#1E1E1E]">{chantier.adresse}</p>
            <button type="button" className="mt-2 inline-flex items-center gap-2 text-[13px] font-medium text-[#1E1E1E]">
              Voir sur la carte
              <ArrowRight className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
            </button>
          </div>
        </MobileCard>
      </section>

      <MobileCard className="p-4">
        <h2 className="text-[17px] font-semibold text-[#1E1E1E]">Prochaines étapes</h2>
        <div className="mt-4 space-y-4">
          {mobileSteps.map(step => (
            <div key={step.label} className="flex items-center gap-3">
              <ListChecks className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
              <span className="flex-1 text-[14px] text-[#1E1E1E]">{step.label}</span>
              <span className="text-[12px] text-[#6B6B6B]">{step.date}</span>
            </div>
          ))}
        </div>
        <button type="button" className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium text-[#1E1E1E]">
          Voir le planning complet
          <ArrowRight className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
        </button>
      </MobileCard>

      <div className="fixed bottom-16 left-0 right-0 z-30 rounded-t-[24px] bg-[#1E1E1E] px-5 pb-5 pt-4 text-white">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-[14px] font-semibold">
            <WifiOff className="h-4 w-4" strokeWidth={1.75} />
            Mode hors-ligne
          </p>
          <span className="text-[11px] text-[#C9C9C9]">En attente · 3 fichiers</span>
        </div>
        <p className="mt-2 text-[12px] leading-5 text-[#C9C9C9]">Vous travaillez hors connexion. Les données seront synchronisées lors du prochain accès à internet.</p>
        <button type="button" className="mt-4 h-11 w-full rounded-[12px] bg-[#F06B21] text-[13px] font-semibold text-white">Synchroniser maintenant</button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[#8A8A8A]">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#1E8E3E]" strokeWidth={1.75} />
          Dernière synchronisation : Hier à 18:45
        </p>
      </div>
    </main>
  )
}

function MobileActivityIcon({ kind }: { kind: string }) {
  const config = {
    report: { icon: Camera, color: '#F06B21', bg: '#FDEBDD' },
    photos: { icon: Camera, color: '#1E1E1E', bg: '#FAF6F2' },
    document: { icon: FileText, color: '#315A78', bg: '#DCE9F2' },
    progress: { icon: CheckCircle2, color: '#1E8E3E', bg: '#E6F4EA' },
    comment: { icon: MessageSquare, color: '#1E1E1E', bg: '#FAF6F2' },
  }[kind] ?? { icon: CircleDot, color: '#6B6B6B', bg: '#FAF6F2' }
  const Icon = config.icon

  return (
    <div className="relative z-10 grid h-10 w-10 place-items-center rounded-full border border-[#F2E8DC] bg-white">
      <div className="grid h-8 w-8 place-items-center rounded-full" style={{ backgroundColor: config.bg }}>
        <Icon className="h-4 w-4" style={{ color: config.color }} strokeWidth={1.75} />
      </div>
    </div>
  )
}

function MobileActivityTab({ chantier, client, progress }: { chantier: Chantier; client?: Client; progress: number }) {
  const gallery = getChantierGallery(chantier.id)

  return (
    <main className="space-y-3 px-4 pb-24 pt-5">
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-[#EADBC8]" />
        <div className="space-y-6">
          {mobileActivity.map((item, index) => (
            <article key={`${item.kind}-${index}`} className="relative grid grid-cols-[40px_minmax(0,1fr)] gap-4">
              <div className={`absolute left-[3px] top-2 h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-[#F06B21]' : index === 3 ? 'bg-[#1E8E3E]' : 'bg-[#C9C9C9]'}`} />
              <MobileActivityIcon kind={item.kind} />
              <div className="pb-2">
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">{item.title}</h2>
                <p className="mt-1 text-[12px] text-[#6B6B6B]">Par {item.author}</p>
                <p className="mt-1 text-[13px] text-[#6B6B6B]">{item.time}</p>
                {(item.text || item.kind === 'photos' || item.kind === 'progress') && (
                  <MobileCard className="mt-3 p-4">
                    {item.text && <p className="text-[14px] leading-[1.55] text-[#3C3C3C]">{item.text}</p>}
                    {(item.kind === 'report' || item.kind === 'photos') && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {[0, 1, 2].map(photoIndex => (
                          <MobilePhotoTile key={photoIndex} src={gallery[(photoIndex + index) % gallery.length]} small />
                        ))}
                      </div>
                    )}
                    {item.kind === 'progress' && (
                      <div className="mt-1">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[12px] text-[#6B6B6B]">Avancement</span>
                          <span className="text-[16px] font-semibold text-[#1E1E1E]">{progress}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-[#F2E8DC]">
                          <div className="h-full rounded-full bg-[#F06B21]" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )}
                    <button type="button" className="mt-3 text-[13px] font-semibold text-[#F06B21]">{item.action}</button>
                  </MobileCard>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
      <button type="button" className="inline-flex items-center gap-2 text-[13px] font-medium text-[#1E1E1E]">
        Voir toute l'activité
        <ArrowRight className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
      </button>

      <MobileCard className="p-4">
        <h2 className="text-[17px] font-semibold text-[#1E1E1E]">Informations chantier</h2>
        <div className="mt-4 space-y-4">
          {[
            ['Client', client?.nom ?? 'Dupont Jean'],
            ['Adresse', chantier.adresse],
            ['Type de projet', client?.type === 'public' ? 'Bâtiment public' : client?.type === 'professionnel' ? 'Projet professionnel' : 'Maison individuelle'],
            ['Responsable', chantier.chefChantier],
            ['Conducteur de travaux', 'Paul Martin'],
          ].map(([label, value]) => (
            <div key={label} className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 text-[13px]">
              <span className="text-[#1E1E1E]">{label}</span>
              <span className="text-[#6B6B6B]">{value}</span>
            </div>
          ))}
        </div>
        <button type="button" className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium text-[#1E1E1E]">
          Voir la fiche chantier
          <ArrowRight className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
        </button>
      </MobileCard>
    </main>
  )
}

function MobileChantierView({ chantier, client, progress }: { chantier: Chantier; client?: Client; progress: number }) {
  const [active, setActive] = useState<MobileTab>('report')

  return (
    <div className="min-h-dvh bg-white text-[#1E1E1E]">
      <MobileHeader chantier={chantier} active={active} onTabChange={setActive} />
      {active === 'report' && <MobileReportTab progress={progress} />}
      {active === 'photos' && <MobilePhotosTab chantier={chantier} />}
      {active === 'activity' && <MobileActivityTab chantier={chantier} client={client} progress={progress} />}
      <MobileBottomNav />
    </div>
  )
}

export function ChantierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { chantiers, factures, clients } = useApp()
  const [showUploadHint, setShowUploadHint] = useState(false)
  const [activeDesktopTab, setActiveDesktopTab] = useState(tabs[0])

  const chantier = chantiers.find(item => item.id === id)

  const chantierFactures = useMemo(
    () => factures.filter(facture => facture.chantierId === id),
    [factures, id]
  )

  if (!chantier) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#FAF6F2] p-8">
        <Card className="max-w-md p-8 text-center">
          <h1 className="text-[22px] font-semibold text-[#1E1E1E]">Chantier introuvable</h1>
          <p className="mt-2 text-sm text-[#6B6B6B]">Le dossier demandé n’existe pas dans le store local.</p>
          <button
            type="button"
            onClick={() => navigate('/chantiers')}
            className="mt-5 inline-flex items-center gap-2 rounded-[14px] bg-[#F06B21] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#D95B17]"
          >
            Retour aux chantiers
          </button>
        </Card>
      </div>
    )
  }

  const client = clients.find(item => item.id === chantier.clientId)
  const chantierEmails = emails.filter(email => email.chantierId === chantier.id)
  const progress = Math.min(Math.round((chantier.depensesEngagees / chantier.budgetPrevisionnel) * 100), 100)
  const rawProgress = Math.round((chantier.depensesEngagees / chantier.budgetPrevisionnel) * 100)
  const margin = chantier.budgetPrevisionnel - chantier.depensesEngagees
  const marginPercent = Math.round((margin / chantier.budgetPrevisionnel) * 100)
  const coverImage = getChantierCover(chantier.id)
  const galleryImages = getChantierGallery(chantier.id)

  const donutData = Object.entries(
    chantierFactures
      .filter(facture => facture.statut === 'validee')
      .reduce<Record<string, number>>((acc, facture) => {
        acc[facture.categorie] = (acc[facture.categorie] ?? 0) + facture.montantTTC
        return acc
      }, {})
  )
    .map(([category, amount]) => ({
      name: categorieLabels[category as CategorieDepense] ?? category,
      value: Math.round(amount),
      pct: Math.max(1, Math.round((amount / Math.max(chantier.depensesEngagees, 1)) * 100)),
      color: DONUT_COLORS[category] ?? '#C8B18C',
    }))
    .sort((a, b) => b.value - a.value)

  const financialData = donutData.length
    ? donutData
    : [
        { name: 'Bois', value: Math.round(chantier.depensesEngagees * 0.38), pct: 38, color: '#F06B21' },
        { name: 'Sous-traitance', value: Math.round(chantier.depensesEngagees * 0.24), pct: 24, color: '#1E1E1E' },
        { name: 'Quincaillerie', value: Math.round(chantier.depensesEngagees * 0.15), pct: 15, color: '#A45A2C' },
        { name: 'Carburant', value: Math.round(chantier.depensesEngagees * 0.08), pct: 8, color: '#C8B18C' },
        { name: 'Autres', value: Math.round(chantier.depensesEngagees * 0.15), pct: 15, color: '#EADBC8' },
      ]

  return (
    <>
    <div className="lg:hidden">
      <MobileChantierView chantier={chantier} client={client} progress={progress} />
    </div>
    <div className="hidden min-h-full bg-[#FAF6F2] lg:block">
      <div className="border-b border-[#F2E8DC] bg-white px-6 py-5 xl:px-8">
        <div className="mb-4 flex items-center gap-2 text-[12px] font-medium text-[#6B6B6B]">
          <button type="button" onClick={() => navigate('/chantiers')} className="hover:text-[#F06B21]">
            Chantiers
          </button>
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span className="text-[#1E1E1E]">{chantier.nom}</span>
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[30px] font-semibold leading-tight tracking-tight text-[#1E1E1E]">{chantier.nom}</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F4EA] px-3 py-1 text-[11px] font-semibold text-[#1E8E3E]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1E8E3E]" />
                {chantier.statut === 'en_cours' ? 'En cours' : chantier.statut === 'cloture' ? 'Clôturé' : 'En attente'}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-[#3C3C3C]">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
                {chantier.adresse}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
                Démarrage : {new Date(chantier.dateDebut).toLocaleDateString('fr-FR')}
              </span>
              <span className="inline-flex items-center gap-2">
                <UsersRound className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
                Livraison prévue : {new Date(chantier.dateFinPrevue).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#F2E8DC] bg-white px-4 text-sm font-medium text-[#1E1E1E] hover:bg-[#FAF6F2]">
              <Share2 className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
              Partager
            </button>
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[14px] bg-[#1E1E1E] px-4 text-sm font-semibold text-white hover:bg-black">
              Actions
              <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="mt-6 flex gap-6 overflow-x-auto border-b border-[#F2E8DC]">
          {tabs.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveDesktopTab(tab)}
              className={`shrink-0 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeDesktopTab === tab ? 'border-[#F06B21] text-[#F06B21]' : 'border-transparent text-[#3C3C3C] hover:text-[#1E1E1E]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 px-6 py-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:px-8 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <main className="min-w-0 space-y-5">
          {activeDesktopTab !== tabs[0] && (
            <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-[13px] font-semibold text-[#1E1E1E]">{activeDesktopTab}</p>
                <p className="mt-1 text-[12px] text-[#6B6B6B]">Aperçu démo activé: les données détaillées restent disponibles dans les blocs ci-dessous.</p>
              </div>
              <span className="rounded-[6px] bg-[#FDEBDD] px-2.5 py-1 text-[11px] font-semibold text-[#F06B21]">Onglet actif</span>
            </Card>
          )}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
            <KpiCard label="Avancement" value={`${progress}%`}>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#F2E8DC]">
                <div className="h-full rounded-full bg-[#F06B21]" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-3 text-[11px] font-semibold text-[#1E8E3E]">+8% vs semaine dernière</p>
            </KpiCard>
            <KpiCard label="Budget total" value={formatEuros(chantier.budgetPrevisionnel)} sub="HT" />
            <KpiCard label="Dépenses engagées" value={formatEuros(chantier.depensesEngagees)} sub={`${rawProgress}% du budget`} />
            <KpiCard label="Marge prévisionnelle" value={formatEuros(margin)} sub={`${marginPercent}%`} />
            <KpiCard label="Prochaine échéance" value="Livraison matériaux">
              <p className="mt-3 text-[11px] text-[#6B6B6B]">23 avril 2026 à 10:30</p>
              <div className="mt-2">
                <LinkButton>Voir le planning</LinkButton>
              </div>
            </KpiCard>
          </div>

          <div className="grid gap-5 2xl:grid-cols-[1.05fr_1fr]">
            <Card className="p-5">
              <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Informations principales</h2>
              <div className="mt-4 grid gap-5 lg:grid-cols-[190px_minmax(0,1fr)]">
                <div>
                  <ProjectPhoto src={coverImage} />
                  <button type="button" className="mt-3 h-10 w-full rounded-[10px] border border-[#F2E8DC] bg-white text-[12px] font-medium text-[#1E1E1E] hover:bg-[#FAF6F2]">
                    Voir toutes les photos
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    ['Client', client?.nom ?? 'Client non renseigné'],
                    ['Adresse', chantier.adresse],
                    ['Type de projet', client?.type === 'public' ? 'Bâtiment public' : client?.type === 'professionnel' ? 'Projet professionnel' : 'Maison individuelle'],
                    ['Surface', '148 m²'],
                    ['Responsable', chantier.chefChantier],
                    ['Conducteur de travaux', 'Paul Martin'],
                    ['Architecte', 'Atelier B'],
                  ].map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[102px_minmax(0,1fr)] gap-3 text-[13px]">
                      <span className="text-[#6B6B6B]">{label}</span>
                      <span className="font-medium text-[#1E1E1E]">{value}</span>
                    </div>
                  ))}
                  <div className="pt-1 text-[13px] leading-5 text-[#3C3C3C]">
                    <span className="mb-1 block text-[#6B6B6B]">Description</span>
                    {chantier.description}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['ossature bois', 'maison individuelle', '2026'].map(tag => (
                      <span key={tag} className="rounded-[6px] bg-[#F1E6D6] px-2.5 py-1 text-[11px] font-medium text-[#3C3C3C]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Synthèse financière</h2>
                <button type="button" className="inline-flex items-center gap-2 rounded-[10px] border border-[#F2E8DC] bg-white px-3 py-1.5 text-[12px] font-medium text-[#6B6B6B] hover:bg-[#FAF6F2]">
                  Ce mois
                  <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-[210px_minmax(0,1fr)]">
                <div className="relative flex justify-center">
                  <PieChart width={210} height={210}>
                    <Pie
                      data={financialData}
                      cx={105}
                      cy={105}
                      innerRadius={66}
                      outerRadius={94}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="#FFFFFF"
                      strokeWidth={3}
                    >
                      {financialData.map(item => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[22px] font-semibold text-[#1E1E1E]">{formatEuros(chantier.depensesEngagees)}</span>
                    <span className="text-[11px] text-[#6B6B6B]">Dépenses engagées</span>
                  </div>
                </div>

                <div className="space-y-3 self-center">
                  {financialData.slice(0, 6).map(item => (
                    <div key={item.name} className="grid grid-cols-[minmax(0,1fr)_48px_78px] items-center gap-3 text-[12px]">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="truncate text-[#3C3C3C]">{item.name}</span>
                      </div>
                      <span className="text-right font-medium text-[#6B6B6B]">{item.pct}%</span>
                      <span className="text-right font-medium text-[#3C3C3C]">{formatEuros(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <LinkButton>Voir le détail des dépenses</LinkButton>
              </div>
            </Card>
          </div>

          <div className="grid gap-5 2xl:grid-cols-[1fr_1.35fr_0.9fr]">
            <Card className="p-5">
              <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Avancement par lot</h2>
              <div className="mt-5 space-y-4">
                {lots.map(lot => (
                  <div key={lot.label}>
                    <div className="mb-2 flex items-center justify-between text-[13px]">
                      <span className="text-[#3C3C3C]">{lot.label}</span>
                      <span className="font-medium text-[#1E1E1E]">{lot.pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#F2E8DC]">
                      <div className="h-full rounded-full" style={{ width: `${lot.pct}%`, backgroundColor: lot.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <LinkButton>Voir le détail des lots</LinkButton>
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Dépenses vs prévisionnel</h2>
                <div className="flex gap-4 text-[11px] text-[#6B6B6B]">
                  <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 bg-[#F06B21]" /> Réelles</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 border-t border-dashed border-[#6B6B6B]" /> Prévisionnel</span>
                </div>
              </div>
              <div className="h-[210px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={budgetCurve} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#6B6B6B' }} axisLine={false} tickLine={false} tickFormatter={value => `${Number(value) / 1000}k €`} />
                    <Tooltip
                      formatter={value => [`${formatEuros(Number(value ?? 0))}`, '']}
                      contentStyle={{ borderRadius: 12, border: '1px solid #F2E8DC', fontSize: 12 }}
                    />
                    <Area type="monotone" dataKey="target" stroke="#6B6B6B" strokeDasharray="4 4" strokeWidth={1.5} fill="transparent" />
                    <Area type="monotone" dataKey="real" stroke="#F06B21" strokeWidth={2} fill="#FDEBDD" fillOpacity={0.35} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <LinkButton>Voir l’analyse complète</LinkButton>
            </Card>

            <Card className="p-5">
              <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Échéances clés</h2>
              <div className="mt-4 space-y-4">
                {deadlines.map(item => (
                  <div key={`${item.day}-${item.title}`} className="grid grid-cols-[42px_minmax(0,1fr)_48px] items-center gap-3">
                    <div className="rounded-[10px] bg-[#FDEBDD] px-2 py-2 text-center">
                      <div className="text-[18px] font-bold leading-none text-[#1E1E1E]">{item.day}</div>
                      <div className="mt-1 text-[9px] font-semibold text-[#F06B21]">{item.month}</div>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[#1E1E1E]">{item.title}</p>
                      <p className="mt-1 truncate text-[11px] text-[#6B6B6B]">{item.sub}</p>
                    </div>
                    <span className="rounded-[6px] bg-[#FAF6F2] px-2 py-1 text-center text-[10px] font-medium text-[#6B6B6B]">À venir</span>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <LinkButton>Voir le planning</LinkButton>
              </div>
            </Card>
          </div>

          <div className="grid gap-5 2xl:grid-cols-[1fr_1.15fr]">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Activité récente</h2>
                <LinkButton>Voir toute l’activité</LinkButton>
              </div>
              <div className="mt-5 space-y-4">
                {activities.map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={{ backgroundColor: item.bg }}>
                        <Icon className="h-4 w-4" style={{ color: item.color }} strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-[#1E1E1E]">{item.title}</p>
                        <p className="mt-1 truncate text-[12px] text-[#6B6B6B]">{item.sub}</p>
                      </div>
                      <span className="shrink-0 text-[11px] text-[#9CA3AF]">{item.time}</span>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Derniers documents</h2>
                <LinkButton>Voir tous les documents</LinkButton>
              </div>
              <div className="mt-5 space-y-4">
                {documents.map(item => (
                  <div key={item.name} className="grid grid-cols-[34px_minmax(0,1fr)_70px] items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#FAF6F2]">
                      <FileText className="h-4 w-4" style={{ color: item.color }} strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[#1E1E1E]">{item.name}</p>
                      <p className="mt-1 truncate text-[11px] text-[#6B6B6B]">{item.type}</p>
                    </div>
                    <span className="text-right text-[11px] text-[#9CA3AF]">{item.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Photos récentes</h2>
              <LinkButton>Voir toutes les photos</LinkButton>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {galleryImages.slice(0, 4).map(image => (
                <PhotoTile key={image} src={image} />
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Indicateurs clés</h2>
              <LinkButton>Voir tous les indicateurs</LinkButton>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-5">
              {indicators.map(item => (
                <div key={item.label} className="border-r border-[#F2E8DC] pr-4 last:border-r-0">
                  <p className="text-[12px] text-[#6B6B6B]">{item.label}</p>
                  <p className="mt-2 text-[22px] font-semibold leading-none text-[#1E1E1E]">{item.value}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[11px] text-[#6B6B6B]">{item.sub}</span>
                    {item.chip && <span className="rounded-full bg-[#E6F4EA] px-2 py-0.5 text-[10px] font-semibold text-[#1E8E3E]">{item.chip}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Timeline du chantier</h2>
              <div className="flex items-center gap-4 text-[11px] text-[#6B6B6B]">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#1E8E3E]" /> Terminé</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#F06B21]" /> En cours</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#9CA3AF]" /> À venir</span>
              </div>
            </div>
            <div className="overflow-x-auto pb-3">
              <div className="grid min-w-[920px] grid-cols-10 items-start">
                {timeline.map((item, index) => {
                  const isDone = item.status === 'done'
                  const isActive = item.status === 'active'
                  const nextItem = timeline[index + 1]
                  const segmentClass =
                    nextItem && item.status === 'done' && nextItem.status === 'done'
                      ? 'bg-[#1E8E3E]'
                      : nextItem && (item.status === 'active' || nextItem.status === 'active')
                        ? 'bg-[#F06B21]'
                        : 'bg-[#EADBC8]'

                  return (
                    <div key={item.label} className="relative flex flex-col items-center text-center">
                      {nextItem && <span className={`absolute left-1/2 top-[13px] z-0 h-0.5 w-full ${segmentClass}`} />}
                      <div
                        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-white ${
                          isDone ? 'bg-[#1E8E3E]' : isActive ? 'bg-[#F06B21]' : 'bg-[#C9C9C9]'
                        }`}
                      >
                        {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : isActive ? <CircleDot className="h-3.5 w-3.5" strokeWidth={2.5} /> : <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                      <p className="mt-3 max-w-[90px] text-[11px] font-medium leading-tight text-[#1E1E1E]">{item.label}</p>
                      <p className="mt-1 text-[10px] text-[#6B6B6B]">{item.date}</p>
                    </div>
                  )
                })}
              </div>
            </div>
            <LinkButton>Voir toute la timeline</LinkButton>
          </Card>
        </main>

        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Actions rapides</h2>
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => setShowUploadHint(value => !value)}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#F06B21] px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-[#D95B17]"
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
                Ajouter un document
              </button>
              {[
                { icon: ReceiptText, label: 'Nouvelle facture fournisseur' },
                { icon: ClipboardCheck, label: 'Nouveau compte-rendu' },
                { icon: Euro, label: 'Créer un devis' },
              ].map(item => {
                const Icon = item.icon
                return (
                  <button key={item.label} type="button" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[12px] border border-[#F2E8DC] bg-white px-3 text-sm font-medium text-[#1E1E1E] hover:bg-[#FAF6F2]">
                    <Icon className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
                    {item.label}
                  </button>
                )
              })}
              <button type="button" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[12px] border border-[#F2E8DC] bg-white px-3 text-sm font-medium text-[#1E1E1E] hover:bg-[#FAF6F2]">
                Plus d’actions
                <MoreHorizontal className="h-4 w-4 text-[#6B6B6B]" strokeWidth={1.75} />
              </button>
            </div>
            {showUploadHint && (
              <div className="mt-4 rounded-[14px] border border-dashed border-[#EADBC8] bg-[#FAF6F2] p-4 text-center">
                <Upload className="mx-auto h-5 w-5 text-[#F06B21]" strokeWidth={1.75} />
                <p className="mt-2 text-[12px] font-medium text-[#1E1E1E]">Zone document prête</p>
                <p className="mt-1 text-[11px] text-[#6B6B6B]">Le branchement Storage viendra avec le flux documentaire.</p>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Équipe affectée</h2>
            <div className="mt-4 space-y-4">
              {team.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EADBC8] text-[12px] font-bold text-[#1E1E1E]">
                    {index === 0 ? 'JD' : index === 1 ? 'PM' : index === 2 ? 'LB' : 'SL'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-[#1E1E1E]">{item.name}</p>
                    <p className="mt-0.5 truncate text-[11px] text-[#6B6B6B]">{item.role}</p>
                  </div>
                  <span className={`rounded-[6px] px-2 py-1 text-[10px] font-semibold ${item.tagClass}`}>{item.tag}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <LinkButton>Voir toute l’équipe</LinkButton>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Planning du chantier</h2>
              <button type="button" className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#F2E8DC] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#6B6B6B]">
                Semaine
                <ChevronDown className="h-3 w-3" strokeWidth={1.75} />
              </button>
            </div>
            <p className="mt-3 text-[12px] text-[#3C3C3C]">21 – 27 avril 2026</p>
            <div className="mt-4 grid grid-cols-7 overflow-hidden rounded-[12px] border border-[#F2E8DC] text-[10px] text-[#6B6B6B]">
              {['Lun 21', 'Mar 22', 'Mer 23', 'Jeu 24', 'Ven 25', 'Sam 26', 'Dim 27'].map(day => (
                <div key={day} className="border-r border-[#F2E8DC] bg-[#FAF6F2] px-2 py-2 text-center last:border-r-0">
                  {day}
                </div>
              ))}
              <div className="col-span-3 border-t border-[#F2E8DC] bg-[#E6F4EA] px-2 py-2 text-[#1E8E3E]">
                <p className="font-semibold">Gros œuvre</p>
                <p>Maison Dupont</p>
              </div>
              <div className="col-span-4 border-t border-[#F2E8DC] bg-[#DCE9F2] px-2 py-2 text-[#3C3C3C]">
                <p className="font-semibold">Charpente</p>
                <p>Villa des Pins</p>
              </div>
              <div className="col-span-4 col-start-2 border-t border-[#F2E8DC] bg-[#FDE9DB] px-2 py-2 text-[#F06B21]">
                <p className="font-semibold">Isolation</p>
                <p>Maison Dupont</p>
              </div>
            </div>
            <div className="mt-4">
              <LinkButton>Voir le planning complet</LinkButton>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Alertes</h2>
            <div className="mt-4 space-y-4">
              {[
                { icon: AlertTriangle, title: 'Dépassement de budget prévisionnel', sub: 'Le chantier dépasse le budget de 12%.', time: 'Il y a 2 h' },
                { icon: ReceiptText, title: 'Facture non rattachée', sub: '2 factures en attente de rattachement.', time: 'Il y a 5 h' },
                { icon: FileText, title: 'Document manquant', sub: 'Attestation d’assurance à fournir.', time: 'Il y a 1 j' },
              ].map(item => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#FDEBDD] text-[#F06B21]">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-[#1E1E1E]">{item.title}</p>
                      <p className="mt-1 text-[11px] leading-4 text-[#6B6B6B]">{item.sub}</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-[#9CA3AF]">{item.time}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4">
              <LinkButton>Voir toutes les alertes</LinkButton>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Notes</h2>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#6B6B6B] hover:bg-[#FAF6F2] hover:text-[#1E1E1E]" aria-label="Modifier la note">
                <Pencil className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
            <p className="mt-3 text-[13px] leading-5 text-[#3C3C3C]">Rappel : vérifier la livraison des fenêtres le 28/04.</p>
            <p className="mt-3 text-[11px] text-[#9CA3AF]">Modifié par {chantier.chefChantier}, il y a 1 h</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#FDEBDD] text-[#F06B21]">
                <Sparkles className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-[14px] font-semibold text-[#1E1E1E]">Vue IA chantier</h2>
                <p className="mt-1 text-[12px] leading-5 text-[#6B6B6B]">
                  {chantierEmails.length} emails liés, {chantierFactures.length} factures suivies et marge à surveiller cette semaine.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { icon: Mail, value: chantierEmails.length, label: 'Emails' },
                { icon: ReceiptText, value: chantierFactures.length, label: 'Factures' },
                { icon: ShieldCheck, value: 0, label: 'Incidents' },
              ].map(item => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="rounded-[12px] bg-[#FAF6F2] px-2 py-3">
                    <Icon className="mx-auto h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                    <p className="mt-2 text-[16px] font-semibold text-[#1E1E1E]">{item.value}</p>
                    <p className="text-[10px] text-[#6B6B6B]">{item.label}</p>
                  </div>
                )
              })}
            </div>
          </Card>
        </aside>
      </div>
    </div>
    </>
  )
}
