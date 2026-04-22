import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@/lib/store'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ChantiersPage } from '@/pages/ChantiersPage'
import { ChantierDetailPage } from '@/pages/ChantierDetailPage'
import { ClientsPage } from '@/pages/ClientsPage'
import { FacturesPage } from '@/pages/FacturesPage'
import { EmailsPage } from '@/pages/EmailsPage'
import { PlanningPage } from '@/pages/PlanningPage'

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chantiers" element={<ChantiersPage />} />
            <Route path="/chantiers/:id" element={<ChantierDetailPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/factures" element={<FacturesPage />} />
            <Route path="/emails" element={<EmailsPage />} />
            <Route path="/planning" element={<PlanningPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
