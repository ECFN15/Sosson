import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  HardHat,
  Users,
  FileText,
  Mail,
  Calendar,
  LogOut,
  Building2,
} from 'lucide-react'
import { logout } from '@/lib/auth'
import { useApp } from '@/lib/store'
import { roleLabels } from '@/data/users'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chantiers', icon: HardHat, label: 'Chantiers' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/factures', icon: FileText, label: 'Factures' },
  { to: '/emails', icon: Mail, label: 'Emails' },
  { to: '/planning', icon: Calendar, label: 'Planning' },
]

export function Sidebar() {
  const { user, setUser } = useApp()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    setUser(null)
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">Sosson</div>
            <div className="text-slate-400 text-xs">Gestion chantiers</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-orange-500 text-white font-medium'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
            {user?.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {user?.prenom} {user?.nom}
            </div>
            <div className="text-xs text-slate-400">
              {user ? roleLabels[user.role] : ''}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm w-full px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
