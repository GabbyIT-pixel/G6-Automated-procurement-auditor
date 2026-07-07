import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ContractsPage from './pages/contracts/ContractsPage';
import AlertsPage from './pages/alerts/AlertsPage';
import SettingsPage from './pages/settings/SettingsPage';
import AppShell from './components/layout/AppShell';
import type { User } from './types';

const getStoredUser = (): User | null => {
  const stored = localStorage.getItem('pa_user');
  return stored ? JSON.parse(stored) : null;
};

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
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage user={user} />} />
        <Route path="/contracts" element={<ContractsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/settings" element={<SettingsPage user={user} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}

export default App;
