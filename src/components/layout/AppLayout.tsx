import { Outlet, Navigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useApp } from '@/lib/store'

/**
 * Shell canonique (design-tokens.md §8.1).
 * Sidebar anthracite fixe (gauche) + Topbar blanche (haut) + Outlet scrollable sur fond `paper-50`.
 */
export function AppLayout() {
  const { user } = useApp()

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen bg-[#FAF6F2] text-[#1E1E1E]">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
