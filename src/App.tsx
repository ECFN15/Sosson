import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@/lib/store'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ChantiersPage } from '@/pages/ChantiersPage'
import { ChantierDetailPage } from '@/pages/ChantierDetailPage'
import { ClientsPage } from '@/pages/ClientsPage'
import { ClientDetailPage } from '@/pages/ClientDetailPage'
import { FacturesPage } from '@/pages/FacturesPage'
import { EmailsPage } from '@/pages/EmailsPage'
import { PlanningPage } from '@/pages/PlanningPage'
import { PrevisionnelPage } from '@/pages/PrevisionnelPage'
import { StatistiquesPage } from '@/pages/StatistiquesPage'
import { SossonDocsPage } from '@/pages/SossonDocsPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'

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
            <Route path="/clients/:id" element={<ClientDetailPage />} />
            <Route path="/documents" element={<PlaceholderPage title="Documents" />} />
            <Route path="/factures" element={<FacturesPage />} />
            <Route path="/previsionnel" element={<PrevisionnelPage />} />
            <Route path="/statistiques" element={<StatistiquesPage />} />
            <Route path="/emails" element={<EmailsPage />} />
            <Route path="/planning" element={<PlanningPage />} />
            <Route path="/rapports" element={<PlaceholderPage title="Rapports" />} />
            <Route path="/documentation" element={<SossonDocsPage />} />
            <Route path="/equipe" element={<PlaceholderPage title="Équipe" />} />
            <Route path="/parametres" element={<PlaceholderPage title="Paramètres" />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
