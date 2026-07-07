import { Bell, LogOut, Menu } from 'lucide-react';
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import type { User } from '../../types';

interface AppShellProps {
  user: User;
  onLogout: () => void;
  children: ReactNode;
}

export default function AppShell({ user, onLogout, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-transparent p-4 text-slate-900 lg:p-6">
      <div className="mx-auto flex max-w-7xl gap-4 rounded-[28px] border border-slate-200/80 bg-white/70 p-3 shadow-soft backdrop-blur">
        <Sidebar userName={user.full_name} />

        <div className="flex min-h-[calc(100vh-3rem)] flex-1 flex-col rounded-[24px] bg-slate-50/80 p-3 sm:p-6">
          <header className="mb-6 flex items-center justify-between rounded-[20px] border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm sm:px-6">
            <div>
              <p className="text-sm font-medium text-slate-500">Public Health Procurement Oversight</p>
              <h1 className="text-lg font-semibold text-slate-900">Automated Auditor Workspace</h1>
            </div>

            <div className="flex items-center gap-3">
              <button className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-blue-200 hover:text-blue-600">
                <Bell className="h-4 w-4" />
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-red-200 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
              <button className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 md:hidden">
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
