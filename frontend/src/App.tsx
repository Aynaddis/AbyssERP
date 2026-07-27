import { Suspense, lazy, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import { ToastContainer } from '@/components/ToastContainer';

// Each page is its own chunk, fetched only when that route is actually
// visited — otherwise a first-time visitor to /login would download every
// page in the app (charts, PDF generation, etc.) before seeing the login form.
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const InventoryPage = lazy(() => import('@/pages/InventoryPage'));
const PurchasingPage = lazy(() => import('@/pages/PurchasingPage'));
const SalesPage = lazy(() => import('@/pages/SalesPage'));
const FinancePage = lazy(() => import('@/pages/FinancePage'));
const HRPage = lazy(() => import('@/pages/HRPage'));
const AuditLogPage = lazy(() => import('@/pages/AuditLogPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="h-6 w-6 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin" />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    // Pressing Back/Forward can restore the page from the browser's
    // back-forward cache (bfcache) — a frozen snapshot of the JS heap from
    // before a logout, repainted without re-running any code. That snapshot
    // can still show "isAuthenticated: true" in memory even though logout()
    // already updated localStorage to logged-out. A full reload forces the
    // app to re-initialize and read the real, current auth state instead.
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        window.location.reload();
      }
    }
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
                  <Route path="/purchasing" element={<PurchasingPage />} />
                  <Route path="/hr" element={<HRPage />} />
                  <Route path="/finance" element={<FinancePage />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route path="/audit-log" element={<AuditLogPage />} />
                </Route>

                <Route path="/sales" element={<SalesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<Navigate to="/settings" replace />} />
              </Route>
            </Route>

            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <ToastContainer />
    </QueryClientProvider>
  );
}