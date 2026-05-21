import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  HardHat,
  Users,
  FileText,
  Mail,
  Calendar,
  BarChart2,
  TableProperties,
  LineChart,
  BookOpen,
  UsersRound,
  Handshake,
  Settings,
  Folder,
  ChevronDown,
  Clock3,
  Database,
} from 'lucide-react'
import { logout } from '@/lib/auth'
import { useApp } from '@/lib/store'
import { roleLabels } from '@/data/users'
import { SossonBrand } from '@/components/brand/SossonLogo'
import { canAccessPage } from '@/lib/accessControl'
import { useCurrentDateTime } from '@/lib/useCurrentDateTime'
import type { PagePermissionKey } from '@/lib/accessControl'

type NavEntry = {
  to: string
  icon: React.ElementType
  label: string
  accessKey: PagePermissionKey
}

const navMain: NavEntry[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', accessKey: 'dashboard' },
  { to: '/cowork', icon: Handshake, label: 'COWORK', accessKey: 'cowork' },
  { to: '/chantiers', icon: HardHat, label: 'Chantiers', accessKey: 'chantiers' },
  { to: '/clients', icon: Users, label: 'Clients', accessKey: 'clients' },
  { to: '/documents', icon: Folder, label: 'Documents', accessKey: 'documents' },
  { to: '/factures', icon: FileText, label: 'Factures', accessKey: 'factures' },
  { to: '/previsionnel', icon: TableProperties, label: 'Previsionnel', accessKey: 'previsionnel' },
  { to: '/statistiques', icon: LineChart, label: 'Statistiques', accessKey: 'statistiques' },
  { to: '/emails', icon: Mail, label: 'Emails', accessKey: 'emails' },
  { to: '/planning', icon: Calendar, label: 'Planning', accessKey: 'planning' },
  { to: '/rapports', icon: BarChart2, label: 'Rapports', accessKey: 'rapports' },
]

const navSecondary: NavEntry[] = [
  { to: '/moteur-dataflow', icon: Database, label: 'Moteur live', accessKey: 'moteur' },
  { to: '/documentation', icon: BookOpen, label: 'Documentation', accessKey: 'documentation' },
  { to: '/equipe', icon: UsersRound, label: 'Equipe', accessKey: 'equipe' },
  { to: '/parametres', icon: Settings, label: 'Parametres', accessKey: 'parametres' },
]

function NavItem({ to, icon: Icon, label }: NavEntry) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'group relative flex h-[40px] items-center gap-3 rounded-[12px] px-3',
          'text-[13px] font-medium transition-colors',
          isActive
            ? 'bg-[#2A1A0D] text-white ring-1 ring-[#F06B21]/20'
            : 'text-[#C9C9C9] hover:bg-[#2A2A2A] hover:text-white',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              aria-hidden="true"
              className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-[#F06B21]"
            />
          )}
          <span
            aria-hidden="true"
            className={[
              'grid h-7 w-7 shrink-0 place-items-center rounded-[10px] transition-colors',
              isActive ? 'bg-[#FDEBDD] text-[#F06B21]' : 'bg-[#262626] text-[#C9C9C9] group-hover:bg-[#303030] group-hover:text-white',
            ].join(' ')}
          >
            <Icon size={15} strokeWidth={1.75} />
          </span>
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  const { user, setUser, accessMatrix } = useApp()
  const navigate = useNavigate()
  const { date, time } = useCurrentDateTime()
  const visibleMain = navMain.filter(item => canAccessPage(user?.role, item.accessKey, accessMatrix))
  const visibleSecondary = navSecondary.filter(item => canAccessPage(user?.role, item.accessKey, accessMatrix))

  async function handleLogout() {
    await logout()
    setUser(null)
    navigate('/login')
  }

  return (
    <aside className="relative flex h-screen w-[252px] shrink-0 flex-col overflow-hidden bg-[#1E1E1E] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(240,107,33,0.12),rgba(240,107,33,0))]" />
      <div className="relative px-5 pb-5 pt-6">
        <SossonBrand variant="light" className="w-full" />
      </div>

      <div className="relative mx-3 mb-3 rounded-[18px] border border-[#2A2A2A] bg-[#242424] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A8A8A]">Aujourd'hui</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-[#2A1A0D] text-[#F06B21]">
            <Clock3 size={17} strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-[18px] font-semibold leading-tight text-white">{time}</p>
            <p className="truncate text-[11px] capitalize leading-tight text-[#C9C9C9]">{date}</p>
          </div>
        </div>
      </div>

      <nav className="relative flex flex-1 flex-col gap-1 overflow-y-auto px-3 pt-2">
        {visibleMain.map(item => (
          <NavItem key={item.to} {...item} />
        ))}

        <div className="my-3 border-t border-[#2A2A2A]" />

        {visibleSecondary.map(item => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      <div className="relative border-t border-[#2A2A2A] px-3 py-3">
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Menu utilisateur"
          className="flex w-full items-center gap-2.5 rounded-[14px] px-2 py-2 transition-colors hover:bg-[#2A2A2A]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#F06B21] text-[11px] font-bold text-white">
            {user?.avatar}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[13px] font-semibold text-white truncate leading-tight">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-[11px] text-[#8A8A8A] truncate leading-tight">
              {user ? roleLabels[user.role] : ''}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-[#8A8A8A] shrink-0" />
        </button>
      </div>
    </aside>
  )
}
