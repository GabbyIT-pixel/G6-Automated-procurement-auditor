import { LayoutDashboard, BellRing, FileText, Settings, ShieldCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/contracts', label: 'Contracts', icon: FileText },
  { to: '/alerts', label: 'Alerts', icon: BellRing },
  { to: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  userName: string;
}

export default function Sidebar({ userName }: SidebarProps) {
  return (
    <aside className="hidden w-72 flex-col justify-between rounded-[24px] border border-slate-200/80 bg-white/80 p-6 shadow-soft backdrop-blur md:flex">
      <div>
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Procurement Auditor</p>
            <p className="text-sm text-slate-500">Enterprise oversight</p>
          </div>
        </div>

        <nav className="space-y-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">{userName}</p>
        <p className="mt-1 text-sm text-slate-500">Government auditor</p>
      </div>
    </aside>
  );
}
