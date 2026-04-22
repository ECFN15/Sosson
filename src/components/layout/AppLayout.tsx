import { Outlet, Navigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useApp } from '@/lib/store'

export function AppLayout() {
  const { user } = useApp()

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
