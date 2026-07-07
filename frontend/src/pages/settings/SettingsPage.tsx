import type { User } from '../../types';

interface SettingsPageProps {
  user: User;
}

export default function SettingsPage({ user }: SettingsPageProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Settings</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Profile and notification preferences</h2>
        <p className="mt-2 text-sm text-slate-500">This workspace is designed to expand into role-based settings, password changes, and alert preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Profile</h3>
          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Name</span><span className="font-medium text-slate-900">{user.full_name}</span></div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Email</span><span className="font-medium text-slate-900">{user.email}</span></div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"><span>Role</span><span className="font-medium text-slate-900">{user.role}</span></div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 px-4 py-3">Critical alerts</div>
            <div className="rounded-2xl border border-slate-200 px-4 py-3">Weekly oversight summary</div>
            <div className="rounded-2xl border border-slate-200 px-4 py-3">Monthly procurement reports</div>
          </div>
        </div>
      </div>
    </div>
  );
}
