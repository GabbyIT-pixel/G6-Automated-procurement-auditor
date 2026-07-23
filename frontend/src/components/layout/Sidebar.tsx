import { LayoutDashboard, BellRing, FileText, Settings, ShieldCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import Avatar from '../ui/Avatar';

const groups = [
  {
    label: 'Overview',
    links: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Governance',
    links: [
      { to: '/contracts', label: 'Contracts', icon: FileText },
      { to: '/alerts', label: 'Alerts', icon: BellRing },
    ],
  },
  {
    label: 'Workspace',
    links: [{ to: '/settings', label: 'Settings', icon: Settings }],
  },
];

interface SidebarProps {
  userName: string;
  userRole?: string;
  onNavigate?: () => void;
}

export default function Sidebar({ userName, userRole, onNavigate }: SidebarProps) {
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col justify-between bg-slate-950 px-5 py-6 text-slate-100">
      <div>
        <div className="mb-9 flex items-center gap-3 px-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-glow">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-white">Procurement Auditor</p>
            <p className="text-xs text-slate-400">Enterprise oversight</p>
          </div>
        </div>

        <nav className="space-y-6" aria-label="Primary">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.links.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive ? (
                          <motion.span
                            layoutId="sidebar-active-indicator"
                            className="absolute -left-1 h-5 w-1 rounded-full bg-brand-400"
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          />
                        ) : null}
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {label}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <Avatar name={userName} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{userName}</p>
          <p className="truncate text-xs capitalize text-slate-400">{userRole ?? 'Government auditor'}</p>
        </div>
      </div>
    </aside>
  );
}

