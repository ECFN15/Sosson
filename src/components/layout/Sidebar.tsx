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
  Settings,
  Folder,
  ChevronDown,
} from 'lucide-react'
import { logout } from '@/lib/auth'
import { useApp } from '@/lib/store'
import { roleLabels } from '@/data/users'
import { SossonBrand } from '@/components/brand/SossonLogo'
import { canAccessPage } from '@/lib/accessControl'
import type { PagePermissionKey } from '@/lib/accessControl'

type NavEntry = {
  to: string
  icon: React.ElementType
  label: string
  accessKey: PagePermissionKey
}

const navMain: NavEntry[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', accessKey: 'dashboard' },
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
          'relative flex items-center gap-3 h-[38px] px-3 rounded-[10px]',
          'text-[13px] font-medium transition-colors',
          isActive
            ? 'bg-[#2A1A0D] text-white'
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
          <Icon
            size={16}
            strokeWidth={1.5}
            className={isActive ? 'text-[#F06B21]' : 'text-[#C9C9C9]'}
          />
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  const { user, setUser, accessMatrix } = useApp()
  const navigate = useNavigate()
  const visibleMain = navMain.filter(item => canAccessPage(user?.role, item.accessKey, accessMatrix))
  const visibleSecondary = navSecondary.filter(item => canAccessPage(user?.role, item.accessKey, accessMatrix))

  async function handleLogout() {
    await logout()
    setUser(null)
    navigate('/login')
  }

  return (
    <aside className="w-[232px] h-screen bg-[#1E1E1E] text-white flex flex-col shrink-0">
      <div className="px-5 pt-6 pb-8">
        <SossonBrand variant="light" className="w-full" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 flex flex-col gap-0.5 pt-2">
        {visibleMain.map(item => (
          <NavItem key={item.to} {...item} />
        ))}

        <div className="my-2 border-t border-[#2A2A2A]" />

        {visibleSecondary.map(item => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      <div className="border-t border-[#2A2A2A] px-3 py-3">
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Menu utilisateur"
          className="w-full flex items-center gap-2.5 hover:bg-[#2A2A2A] rounded-[10px] px-2 py-2 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#F06B21] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
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
