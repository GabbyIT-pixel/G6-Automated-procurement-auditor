import { Suspense, lazy, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import AppShell from './components/layout/AppShell';
import { Skeleton } from './components/ui';
import type { User } from './types';

const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const ContractsPage = lazy(() => import('./pages/contracts/ContractsPage'));
const AlertsPage = lazy(() => import('./pages/alerts/AlertsPage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));

const getStoredUser = (): User | null => {
  const stored = localStorage.getItem('pa_user');
  return stored ? JSON.parse(stored) : null;
};

function PageFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(getStoredUser);

  if (!user) {
    return <LoginPage onAuthenticated={setUser} />;
  }

  return (
    <AppShell
      user={user}
      onLogout={() => {
        localStorage.removeItem('pa_token');
        localStorage.removeItem('pa_user');
        setUser(null);
      }}
    >
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage user={user} />} />
          <Route path="/contracts" element={<ContractsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/settings" element={<SettingsPage user={user} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}

export default App;

