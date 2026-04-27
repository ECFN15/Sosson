import { useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  FolderOpen,
  HardHat,
  Lock,
  Mail,
  MoreHorizontal,
  Plus,
  Settings2,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react'
import { chantierImages } from '@/data/media'

type PageConfig = {
  title: string
  subtitle: string
  Icon: typeof FileText
  stats: Array<{ label: string; value: string; tone?: 'orange' | 'dark' | 'good' }>
  items: Array<{ title: string; meta: string; status: string }>
  sideTitle: string
  sideLines: string[]
}

const configs: Record<string, PageConfig> = {
  Documents: {
    title: 'Documents',
    subtitle: 'Classement rapide des devis, plans, comptes-rendus et pièces chantier.',
    Icon: FolderOpen,
    stats: [
      { label: 'Documents classés', value: '128', tone: 'orange' },
      { label: 'À relier', value: '7' },
      { label: 'Mis à jour cette semaine', value: '19', tone: 'good' },
    ],
    items: [
      { title: 'Plan_extension_Dupont.pdf', meta: 'Maison Dupont - Plans', status: 'Validé' },
      { title: 'CR_reunion_21_avril.docx', meta: 'Villa des Pins - Compte-rendu', status: 'À relire' },
      { title: 'Photos_bardage_lot_2.zip', meta: 'Extension Martin - Photos', status: 'Classé' },
      { title: 'Attestation_assurance_2026.pdf', meta: 'Administratif', status: 'Important' },
    ],
    sideTitle: 'Classement IA',
    sideLines: ['4 documents détectés comme urgents', '2 pièces liées à Maison Dupont', '1 doublon potentiel à fusionner'],
  },
  Rapports: {
    title: 'Rapports',
    subtitle: 'Vue synthèse pour piloter budget, avancement et risques opérationnels.',
    Icon: TrendingUp,
    stats: [
      { label: 'Marge prévisionnelle', value: '29%', tone: 'orange' },
      { label: 'Chantiers suivis', value: '4' },
      { label: 'Alertes ouvertes', value: '3', tone: 'dark' },
    ],
    items: [
      { title: 'Rapport hebdo direction', meta: 'Budget, marge, planning', status: 'Prêt' },
      { title: 'Analyse fournisseurs', meta: 'Dépenses par catégorie', status: 'À générer' },
      { title: 'Risques chantier', meta: 'Retards et dépassements', status: 'Prioritaire' },
      { title: 'Export comptable avril', meta: 'Factures validées', status: 'Brouillon' },
    ],
    sideTitle: 'Lecture rapide',
    sideLines: ['Dépenses en baisse de 8,3%', 'Marge sous surveillance sur 2 dossiers', 'Planning stable sur la semaine'],
  },
  'Équipe': {
    title: 'Équipe',
    subtitle: 'Disponibilités, rôles et affectations terrain de l’équipe Sosson.',
    Icon: Users,
    stats: [
      { label: 'Personnes actives', value: '12', tone: 'orange' },
      { label: 'Équipes terrain', value: '5' },
      { label: 'Absences semaine', value: '2', tone: 'dark' },
    ],
    items: [
      { title: 'Paul Martin', meta: 'Chef chantier - Maison Dupont', status: 'Terrain' },
      { title: 'Lucas Bernard', meta: 'Charpente - congés 21-24 avril', status: 'Absent' },
      { title: 'Sophie Leroy', meta: 'Menuiserie - atelier', status: 'Disponible' },
      { title: 'Patrick Sosson', meta: 'Gérant - validation factures', status: 'Décision' },
    ],
    sideTitle: 'Charge équipe',
    sideLines: ['Gros œuvre chargé cette semaine', 'Charpente disponible vendredi', 'Menuiserie en atelier mercredi'],
  },
  Paramètres: {
    title: 'Paramètres',
    subtitle: 'Réglages de démonstration pour les accès, notifications et préférences.',
    Icon: Settings2,
    stats: [
      { label: 'Projet actif', value: 'Sandbox', tone: 'orange' },
      { label: 'Rôles', value: '3' },
      { label: 'Sécurité', value: 'OK', tone: 'good' },
    ],
    items: [
      { title: 'Notifications email', meta: 'Alertes facture, chantier, planning', status: 'Actif' },
      { title: 'Mode sandbox', meta: 'Données de démonstration isolées', status: 'Actif' },
      { title: 'Export comptable', meta: 'Préférences fournisseur', status: 'À configurer' },
      { title: 'Accès équipe', meta: 'Gérant, assistante, chef chantier', status: 'Contrôlé' },
    ],
    sideTitle: 'Contrôle',
    sideLines: ['Authentification Firebase active', 'Données métier en transition SQL Connect', 'Aucun déploiement production'],
  },
}

const fallback = configs.Documents

function resolveConfig(title: string) {
  const normalized = title.toLowerCase()
  if (normalized.includes('rapport')) return configs.Rapports
  if (normalized.includes('quipe')) return configs['Équipe']
  if (normalized.includes('param')) return configs.Paramètres
  if (normalized.includes('document')) return configs.Documents
  return configs[title] ?? fallback
}

function toneClass(tone?: 'orange' | 'dark' | 'good') {
  if (tone === 'orange') return 'bg-[#FDEBDD] text-[#F06B21]'
  if (tone === 'good') return 'bg-[#E6F4EA] text-[#1E8E3E]'
  if (tone === 'dark') return 'bg-[#1E1E1E] text-white'
  return 'bg-[#FAF6F2] text-[#1E1E1E]'
}

function statusClass(status: string) {
  if (['Validé', 'Classé', 'Prêt', 'Disponible', 'Actif', 'OK'].some(word => status.includes(word))) return 'bg-[#E6F4EA] text-[#1E8E3E]'
  if (['Prioritaire', 'Important', 'Décision', 'Absent'].some(word => status.includes(word))) return 'bg-[#FDEBDD] text-[#F06B21]'
  return 'bg-[#FAF6F2] text-[#6B6B6B]'
}

export function PlaceholderPage({ title }: { title: string }) {
  const config = resolveConfig(title)
  const [selected, setSelected] = useState(config.items[0]?.title ?? '')
  const [enabled, setEnabled] = useState(true)
  const Icon = config.Icon
  const selectedItem = config.items.find(item => item.title === selected) ?? config.items[0]

  return (
    <div className="min-h-full bg-[#FAF6F2] p-6 xl:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-[16px] bg-[#FDEBDD] text-[#F06B21]">
            <Icon className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-[28px] font-semibold leading-tight text-[#1E1E1E]">{config.title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#3C3C3C]">{config.subtitle}</p>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-fit items-center gap-2 rounded-[14px] bg-[#F06B21] px-4 text-sm font-semibold text-white transition hover:bg-[#D95B17]"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Nouvelle action
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <main className="min-w-0 space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            {config.stats.map(stat => (
              <section key={stat.label} className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
                <span className={`inline-flex rounded-[8px] px-2.5 py-1 text-[11px] font-semibold ${toneClass(stat.tone)}`}>
                  {stat.label}
                </span>
                <p className="mt-4 text-[28px] font-semibold leading-none text-[#1E1E1E]">{stat.value}</p>
              </section>
            ))}
          </div>

          <section className="overflow-hidden rounded-[20px] border border-[#F2E8DC] bg-white">
            <div className="flex items-center justify-between border-b border-[#F2E8DC] px-5 py-4">
              <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Éléments récents</h2>
              <button type="button" className="grid h-8 w-8 place-items-center rounded-[10px] text-[#6B6B6B] hover:bg-[#FAF6F2]">
                <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
            <div className="divide-y divide-[#F2E8DC]">
              {config.items.map(item => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setSelected(item.title)}
                  className={`flex w-full items-center gap-4 px-5 py-4 text-left transition ${selected === item.title ? 'bg-[#F06B21]/[0.06]' : 'hover:bg-[#F9F7F3]'}`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#FAF6F2] text-[#F06B21]">
                    {config.title === 'Équipe' ? <UserRound className="h-5 w-5" strokeWidth={1.75} /> : <FileText className="h-5 w-5" strokeWidth={1.75} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-[#1E1E1E]">{item.title}</span>
                    <span className="block truncate text-[12px] text-[#6B6B6B]">{item.meta}</span>
                  </span>
                  <span className={`rounded-[6px] px-2.5 py-1 text-[11px] font-semibold ${statusClass(item.status)}`}>
                    {item.status}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Mail, title: 'Notifier', text: 'Prévenir les personnes concernées' },
              { icon: Download, title: 'Exporter', text: 'Préparer un fichier de synthèse' },
              { icon: CalendarDays, title: 'Planifier', text: 'Créer un rappel opérationnel' },
            ].map(action => {
              const ActionIcon = action.icon
              return (
                <button
                  key={action.title}
                  type="button"
                  className="rounded-[20px] border border-[#F2E8DC] bg-white p-5 text-left transition hover:border-[#EADBC8] hover:bg-[#F9F7F3]"
                >
                  <ActionIcon className="h-5 w-5 text-[#F06B21]" strokeWidth={1.75} />
                  <p className="mt-3 text-[14px] font-semibold text-[#1E1E1E]">{action.title}</p>
                  <p className="mt-1 text-[12px] text-[#6B6B6B]">{action.text}</p>
                </button>
              )
            })}
          </section>
        </main>

        <aside className="space-y-5">
          <section className="overflow-hidden rounded-[20px] border border-[#F2E8DC] bg-white">
            <div className="h-36 bg-[#EADBC8]">
              <img src={chantierImages[0]} alt="" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="p-5">
              <h2 className="text-[15px] font-semibold text-[#1E1E1E]">{config.sideTitle}</h2>
              <div className="mt-4 space-y-3">
                {config.sideLines.map(line => (
                  <div key={line} className="flex items-start gap-2 text-[13px] text-[#3C3C3C]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1E8E3E]" strokeWidth={1.75} />
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Sélection active</h2>
                <p className="mt-2 text-[13px] text-[#3C3C3C]">{selectedItem?.title}</p>
                <p className="mt-1 text-[12px] text-[#6B6B6B]">{selectedItem?.meta}</p>
              </div>
              <span className={`rounded-[6px] px-2.5 py-1 text-[11px] font-semibold ${statusClass(selectedItem?.status ?? '')}`}>
                {selectedItem?.status}
              </span>
            </div>
          </section>

          <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#FDEBDD] text-[#F06B21]">
                {config.title === 'Paramètres' ? <ShieldCheck className="h-5 w-5" strokeWidth={1.75} /> : <HardHat className="h-5 w-5" strokeWidth={1.75} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-[#1E1E1E]">Mode démo</p>
                <p className="text-[12px] text-[#6B6B6B]">Interactions locales activées</p>
              </div>
              <button
                type="button"
                onClick={() => setEnabled(value => !value)}
                className={`relative h-6 w-11 rounded-full transition ${enabled ? 'bg-[#F06B21]' : 'bg-[#EADBC8]'}`}
                aria-label="Basculer le mode demo"
              >
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${enabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-[12px] bg-[#FAF6F2] px-3 py-2 text-[12px] text-[#6B6B6B]">
              <Lock className="h-3.5 w-3.5" strokeWidth={1.75} />
              Sandbox uniquement, production non modifiée.
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
