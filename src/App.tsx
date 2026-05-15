import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@/lib/store'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ChantiersPage } from '@/pages/ChantiersPage'
import { ChantierDetailPage } from '@/pages/ChantierDetailPage'
import { ClientsPage } from '@/pages/ClientsPage'
import { ClientDetailPage } from '@/pages/ClientDetailPage'
import { DocumentsPage } from '@/pages/DocumentsPage'
import { FacturesPage } from '@/pages/FacturesPage'
import { EmailsPage } from '@/pages/EmailsPage'
import { PlanningPage } from '@/pages/PlanningPage'
import { PrevisionnelPage } from '@/pages/PrevisionnelPage'
import { StatistiquesPage } from '@/pages/StatistiquesPage'
import { SossonDocsPage } from '@/pages/SossonDocsPage'
import { EquipePage } from '@/pages/EquipePage'
import { EquipeProfilePage } from '@/pages/EquipeProfilePage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { useApp } from '@/lib/store'

const PrevisionnelSpreadsheetPage = lazy(() =>
  import('@/pages/PrevisionnelSpreadsheetPage').then(module => ({
    default: module.PrevisionnelSpreadsheetPage,
  })),
)

function RouteLoading() {
  return (
    <div className="flex h-[100dvh] min-h-[360px] items-center justify-center bg-[#FAF6F2] p-6">
      <div className="w-full max-w-[360px] rounded-[20px] border border-[#F2E8DC] bg-white p-5">
        <p className="text-sm font-semibold text-[#1E1E1E]">Chargement du tableur</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#FAF6F2]">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-[#F06B21]" />
        </div>
      </div>
    </div>
  )
}

function FullscreenProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useApp()

  if (!user) return <Navigate to="/login" replace />

  return children
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/previsionnel/tableur"
            element={
              <FullscreenProtectedRoute>
                <Suspense fallback={<RouteLoading />}>
                  <PrevisionnelSpreadsheetPage />
                </Suspense>
              </FullscreenProtectedRoute>
            }
          />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chantiers" element={<ChantiersPage />} />
            <Route path="/chantiers/:id" element={<ChantierDetailPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:id" element={<ClientDetailPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/factures" element={<FacturesPage />} />
            <Route path="/previsionnel" element={<PrevisionnelPage />} />
            <Route path="/statistiques" element={<StatistiquesPage />} />
            <Route path="/emails" element={<EmailsPage />} />
            <Route path="/planning" element={<PlanningPage />} />
            <Route path="/rapports" element={<PlaceholderPage title="Rapports" />} />
            <Route path="/documentation" element={<SossonDocsPage />} />
            <Route path="/equipe" element={<EquipePage />} />
            <Route path="/equipe/profils/:memberId" element={<EquipeProfilePage />} />
            <Route path="/parametres" element={<PlaceholderPage title="Paramètres" />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
