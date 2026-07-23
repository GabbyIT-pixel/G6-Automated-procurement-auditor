import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, User as UserIcon, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Avatar from '../ui/Avatar';
import type { User } from '../../types';

interface AppShellProps {
  user: User;
  onLogout: () => void;
  children: ReactNode;
}

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Executive dashboard', subtitle: 'Public Health Procurement Oversight' },
  '/contracts': { title: 'Contracts', subtitle: 'Procurement ledger & submissions' },
  '/alerts': { title: 'Alerts', subtitle: 'Priority anomaly review queue' },
  '/settings': { title: 'Settings', subtitle: 'Profile & notification preferences' },
};

export default function AppShell({ user, onLogout, children }: AppShellProps) {
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const meta = pageMeta[location.pathname] ?? { title: 'Workspace', subtitle: 'Automated Auditor Workspace' };

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-transparent text-slate-900">
      <div className="hidden lg:block">
        <Sidebar userName={user.full_name} userRole={user.role} />
      </div>

      <AnimatePresence>
        {isMobileNavOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <motion.div
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="relative h-full"
            >
              <Sidebar userName={user.full_name} userRole={user.role} onNavigate={() => setIsMobileNavOpen(false)} />
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setIsMobileNavOpen(false)}
                className="absolute right-3 top-6 rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 px-4 py-3.5 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setIsMobileNavOpen(true)}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-slate-300 lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-500">{meta.subtitle}</p>
                <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900">{meta.title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <label className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-400 transition focus-within:border-brand-400 focus-within:bg-white md:flex">
                <Search className="h-4 w-4" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search…"
                  aria-label="Search"
                  className="w-40 bg-transparent text-slate-700 outline-none placeholder:text-slate-400 lg:w-56"
                />
              </label>

              <button
                type="button"
                aria-label="View notifications"
                className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-brand-200 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5 transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <Avatar name={user.full_name} size="sm" />
                  <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      role="menu"
                      className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-soft"
                    >
                      <div className="border-b border-slate-100 px-3 py-2.5">
                        <p className="truncate text-sm font-semibold text-slate-900">{user.full_name}</p>
                        <p className="truncate text-xs text-slate-500">{user.email}</p>
                      </div>
                      <a
                        href="/settings"
                        role="menuitem"
                        className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        <UserIcon className="h-4 w-4" /> Profile
                      </a>
                      <a
                        href="/settings"
                        role="menuitem"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Settings className="h-4 w-4" /> Settings
                      </a>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={onLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

