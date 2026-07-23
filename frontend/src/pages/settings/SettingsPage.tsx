import { useState } from 'react';
import { AlertOctagon, CalendarClock, FileBarChart } from 'lucide-react';
import type { User } from '../../types';
import { Avatar, Card, CardEyebrow, CardTitle } from '../../components/ui';
import { cn } from '../../lib/cn';

interface SettingsPageProps {
  user: User;
}

const notificationOptions = [
  { key: 'critical', label: 'Critical alerts', description: 'Immediate notice for high and critical risk contracts.', icon: AlertOctagon, defaultChecked: true },
  { key: 'weekly', label: 'Weekly oversight summary', description: 'A digest of contract activity and variance trends.', icon: CalendarClock, defaultChecked: true },
  { key: 'monthly', label: 'Monthly procurement reports', description: 'Aggregated benchmark performance across suppliers.', icon: FileBarChart, defaultChecked: false },
];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        checked ? 'bg-brand-600' : 'bg-slate-200',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

export default function SettingsPage({ user }: SettingsPageProps) {
  const [notifications, setNotifications] = useState(() =>
    Object.fromEntries(notificationOptions.map((option) => [option.key, option.defaultChecked])),
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardEyebrow>Settings</CardEyebrow>
        <CardTitle>Profile and notification preferences</CardTitle>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          This workspace is designed to expand into role-based settings, password changes, and alert preferences.
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-base font-semibold text-slate-900">Profile</h3>
          <div className="mt-5 flex items-center gap-4 rounded-xl bg-slate-50 p-4">
            <Avatar name={user.full_name} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{user.full_name}</p>
              <p className="truncate text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
              <span>Role</span>
              <span className="font-medium capitalize text-slate-900">{user.role}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
              <span>Member since</span>
              <span className="font-medium text-slate-900">{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-slate-900">Notifications</h3>
          <div className="mt-5 space-y-3">
            {notificationOptions.map(({ key, label, description, icon: Icon }) => (
              <div key={key} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3.5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{description}</p>
                  </div>
                </div>
                <Toggle
                  label={label}
                  checked={notifications[key]}
                  onChange={(value) => setNotifications((prev) => ({ ...prev, [key]: value }))}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

