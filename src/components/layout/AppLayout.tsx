import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useApp } from '@/lib/store'
import { canAccessPath } from '@/lib/accessControl'
import { getModuleMeta } from '@/lib/moduleMeta'

/**
 * Shell canonique (design-tokens.md §8.1).
 * Sidebar anthracite fixe (gauche) + Topbar blanche (haut) + Outlet scrollable sur fond `paper-50`.
 */
export function AppLayout() {
  const { user, authInitializing, authStatus, accessMatrix } = useApp()
  const location = useLocation()
  const moduleMeta = getModuleMeta(location.pathname)
  const ModuleIcon = moduleMeta.Icon

  if (authInitializing) {
    return (
      <div className="flex h-[100dvh] min-h-[360px] items-center justify-center bg-[#FAF6F2] p-6">
        <div className="w-full max-w-[360px] rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <p className="text-sm font-semibold text-[#1E1E1E]">Verification de la session</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#FAF6F2]">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-[#F06B21]" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    if (authStatus === 'missing-profile') return <Navigate to="/complete-profile" replace state={{ from: `${location.pathname}${location.search}` }} />
    if (authStatus === 'profile-pending') return <Navigate to="/profile-pending" replace />
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  }
  if (!canAccessPath(user.role, location.pathname, accessMatrix)) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div
      className="clean-saas-app flex h-screen bg-[#FAF6F2] text-[#1E1E1E]"
      data-module={moduleMeta.key}
    >
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <main className="relative flex flex-1 flex-col overflow-hidden">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#F2E8DC] bg-white px-4 lg:hidden">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F06B21]">
              {moduleMeta.eyebrow}
            </p>
            <h1 className="truncate text-[16px] font-semibold text-[#1E1E1E]">{moduleMeta.label}</h1>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#1E1E1E] text-[#F06B21]">
            <ModuleIcon className="h-5 w-5" strokeWidth={1.75} />
          </span>
        </div>
        <div className="hidden lg:block">
          <Topbar />
        </div>
        <div className="clean-saas-viewport flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
