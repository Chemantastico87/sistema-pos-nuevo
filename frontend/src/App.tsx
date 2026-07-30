import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './core/store/authStore';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { POSPage } from './pages/POSPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { InventoryPage } from './pages/InventoryPage';
import { CashPage } from './pages/CashPage';
import { CustomersPage } from './pages/CustomersPage';
import { TicketsPage } from './pages/TicketsPage';
import { AuditPage } from './pages/AuditPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { PluginsPage } from './pages/PluginsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SuperAdminPage } from './pages/SuperAdminPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { SystemHealthPage } from './pages/SystemHealthPage';
import { BackupsPage } from './pages/BackupsPage';
import { ErrorLogsPage } from './pages/ErrorLogsPage';
import { HelpPage } from './pages/HelpPage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { VendixAssistantPage } from './pages/VendixAssistantPage';
import { SystemDiagnosticsPage } from './pages/SystemDiagnosticsPage';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';

export const App: React.FC = () => {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [showWizard, setShowWizard] = useState(true);

  // Si no hay token o usuario válido, renderizar siempre la pantalla de Iniciar Sesión / Registro
  if (!token || !user) {
    return <LoginPage />;
  }

  const needsOnboarding = user && user.onboarding_completed === false && showWizard;

  return (
    <>
      {needsOnboarding && (
        <OnboardingWizard onFinish={() => setShowWizard(false)} />
      )}

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<POSPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="cash" element={<CashPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="plugins" element={<PluginsPage />} />
            <Route path="superadmin" element={<SuperAdminPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="health" element={<SystemHealthPage />} />
            <Route path="backups" element={<BackupsPage />} />
            <Route path="error-logs" element={<ErrorLogsPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="help-center" element={<HelpCenterPage />} />
            <Route path="vendix-assistant" element={<VendixAssistantPage />} />
            <Route path="diagnostics" element={<SystemDiagnosticsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};
