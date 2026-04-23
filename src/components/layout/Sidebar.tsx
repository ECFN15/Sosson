import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  HardHat,
  Users,
  FileText,
  Mail,
  Calendar,
  BarChart2,
  UsersRound,
  Settings,
  Folder,
  ChevronDown,
} from 'lucide-react'
import { logout } from '@/lib/auth'
import { useApp } from '@/lib/store'
import { roleLabels } from '@/data/users'
import { SossonBrand } from '@/components/brand/SossonLogo'

/**
 * Sidebar desktop — spec canonique `design-tokens.md` §7.1.
 * - w-[232px] fixe, fond anthracite `#1E1E1E`.
 * - Item actif : fond enrichi `#2A1A0D` + liseré orange 3px à gauche.
 * - Brand block orange + wordmark "SOSSON / MAISON BOIS".
 * - Footer utilisateur (avatar + rôle + chevron).
 */

const navMain = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/chantiers', icon: HardHat, label: 'Chantiers' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/documents', icon: Folder, label: 'Documents' },
  { to: '/factures', icon: FileText, label: 'Factures' },
  { to: '/emails', icon: Mail, label: 'Emails' },
  { to: '/planning', icon: Calendar, label: 'Planning' },
  { to: '/rapports', icon: BarChart2, label: 'Rapports' },
]

const navSecondary = [
  { to: '/equipe', icon: UsersRound, label: 'Équipe' },
  { to: '/parametres', icon: Settings, label: 'Paramètres' },
]

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
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
  const { user, setUser } = useApp()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    setUser(null)
    navigate('/login')
  }

  return (
    <aside className="w-[232px] h-screen bg-[#1E1E1E] text-white flex flex-col shrink-0">
      {/* Brand block */}
      <div className="px-5 pt-6 pb-6">
        <SossonBrand variant="light" className="w-full" />
      </div>

      {/* Nav principale */}
      <nav className="flex-1 overflow-y-auto px-3 flex flex-col gap-0.5">
        {navMain.map(item => (
          <NavItem key={item.to} {...item} />
        ))}

        {/* Séparateur */}
        <div className="my-2 border-t border-[#2A2A2A]" />

        {/* Nav secondaire */}
        {navSecondary.map(item => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Footer utilisateur */}
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
