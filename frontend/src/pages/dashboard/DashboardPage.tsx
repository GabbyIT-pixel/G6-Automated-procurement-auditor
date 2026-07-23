import { motion } from 'framer-motion';
import { BadgeCheck, CircleDollarSign, FileStack, ShieldAlert, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../lib/api';
import type { User } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardEyebrow, CardHeader, EmptyState, RiskBadge, Skeleton, StatCard } from '../../components/ui';

interface DashboardPageProps {
  user: User;
}

const RISK_COLORS: Record<string, string> = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#f43f5e',
  Critical: '#be123c',
};

const toNumber = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const cardTransition = { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const };

export default function DashboardPage({ user }: DashboardPageProps) {
  const { data: contractsData, isLoading: contractsLoading } = useQuery({
    queryKey: ['contracts-dashboard'],
    queryFn: () => dashboardApi.contracts(1, 8).then((res) => res.data),
  });
  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts-dashboard'],
    queryFn: () => dashboardApi.alerts(1, 8).then((res) => res.data),
  });
  const { data: benchmarksData, isLoading: benchmarksLoading } = useQuery({
    queryKey: ['benchmarks-dashboard'],
    queryFn: () => dashboardApi.benchmarks().then((res) => res.data),
  });

  const stats = useMemo(() => {
    const contracts = contractsData?.contracts ?? [];
    const alerts = alertsData?.alerts ?? [];
    const totalValue = contracts.reduce((sum, contract) => sum + toNumber(contract.awarded_unit_price) * toNumber(contract.quantity), 0);
    const highRisk = alerts.filter((alert) => alert.risk_level === 'High' || alert.risk_level === 'Critical').length;
    const avgVariance = alerts.length
      ? alerts.reduce((sum, alert) => sum + toNumber(alert.variance_pct), 0) / alerts.length
      : 0;

    return [
      {
        label: 'Contracts reviewed',
        value: contracts.length.toString(),
        detail: 'Latest ledger entries',
        icon: FileStack,
        accent: 'brand' as const,
      },
      {
        label: 'High-risk alerts',
        value: highRisk.toString(),
        detail: 'Needs immediate review',
        icon: ShieldAlert,
        accent: 'danger' as const,
      },
      {
        label: 'Avg. variance',
        value: `${avgVariance.toFixed(1)}%`,
        detail: 'Against KEMSA benchmark',
        icon: TrendingUp,
        accent: 'warning' as const,
      },
      {
        label: 'Estimated spend',
        value: `KES ${Math.round(totalValue).toLocaleString()}`,
        detail: 'On latest contracts',
        icon: CircleDollarSign,
        accent: 'success' as const,
      },
    ];
  }, [alertsData, contractsData]);

  const trend = useMemo(() => {
    const contracts = contractsData?.contracts ?? [];
    const totals = contracts.reduce<Record<string, number>>((acc, contract) => {
      const key = new Date(contract.contract_date).toLocaleString('en', { month: 'short' });
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(totals).slice(0, 6).map(([month, count]) => ({ month, count }));
  }, [contractsData]);

  const riskBreakdown = useMemo(() => {
    const alerts = alertsData?.alerts ?? [];
    const counts = alerts.reduce<Record<string, number>>((acc, alert) => {
      acc[alert.risk_level] = (acc[alert.risk_level] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value, color: RISK_COLORS[name] ?? '#94a3b8' }));
  }, [alertsData]);

  const recentAlerts = alertsData?.alerts ?? [];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={cardTransition}
        className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-6 shadow-card sm:p-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-grid-slate bg-[length:28px_28px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardEyebrow>Overview</CardEyebrow>
            <h2 className="mt-1.5 text-3xl font-semibold tracking-tight text-slate-900">Welcome back, {user.full_name.split(' ')[0]}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Review procurement activity, benchmark variance, and priority alerts from one enterprise workspace.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            Live database synced with the backend API
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} delay={index * 0.05} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div>
              <p className="text-sm font-semibold text-slate-900">Spending trend</p>
              <p className="text-sm text-slate-500">Contracts by month</p>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">Updated daily</span>
          </CardHeader>
          {contractsLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : trend.length === 0 ? (
            <EmptyState title="No contract activity yet" description="Contract trends will appear once records are submitted." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eef0f5" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px -12px rgba(15,23,42,0.25)', fontSize: 13 }}
                />
                <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2.5} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div>
              <p className="text-sm font-semibold text-slate-900">Risk distribution</p>
              <p className="text-sm text-slate-500">Current alert mix</p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">Priority</span>
          </CardHeader>
          {alertsLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : riskBreakdown.length === 0 ? (
            <EmptyState title="No alerts yet" description="Anomalies will appear here as soon as they're detected." />
          ) : (
            <div className="flex h-64 items-center gap-4">
              <ResponsiveContainer width="60%" height={220}>
                <PieChart>
                  <Pie data={riskBreakdown} dataKey="value" nameKey="name" innerRadius={48} outerRadius={82} paddingAngle={4} strokeWidth={0}>
                    {riskBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 text-sm">
                {riskBreakdown.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-600">
                      {entry.name}: <span className="font-medium text-slate-900">{entry.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between px-6 pb-4 pt-6">
            <div>
              <p className="text-sm font-semibold text-slate-900">Recent alerts</p>
              <p className="text-sm text-slate-500">Priority review queue</p>
            </div>
            <a href="/alerts" className="text-sm font-medium text-brand-600 transition hover:text-brand-700">
              View all
            </a>
          </div>
          <div className="divide-y divide-slate-100">
            {alertsLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between px-6 py-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))
            ) : recentAlerts.length === 0 ? (
              <EmptyState title="No priority alerts" description="Flagged contracts will show up here as anomalies are detected." />
            ) : (
              recentAlerts.slice(0, 4).map((alert) => (
                <div key={alert.alert_id} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50/80">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{alert.supplier_name}</p>
                    <p className="mt-0.5 truncate text-sm text-slate-500">
                      {alert.item_name} &middot; {toNumber(alert.variance_pct).toFixed(1)}% variance
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <RiskBadge level={alert.risk_level} />
                    <p className="text-xs text-slate-400">{new Date(alert.flagged_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between px-6 pb-4 pt-6">
            <div>
              <p className="text-sm font-semibold text-slate-900">Benchmarks</p>
              <p className="text-sm text-slate-500">Reference prices from KEMSA</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{benchmarksData?.count ?? 0}</span>
          </div>
          <div className="divide-y divide-slate-100">
            {benchmarksLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between px-6 py-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))
            ) : (benchmarksData?.benchmarks ?? []).length === 0 ? (
              <EmptyState title="No benchmarks configured" description="Reference prices will show up here once seeded." />
            ) : (
              (benchmarksData?.benchmarks ?? []).slice(0, 4).map((benchmark) => (
                <div key={benchmark.baseline_id} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50/80">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{benchmark.item_name}</p>
                    <p className="mt-0.5 truncate text-sm text-slate-500">{benchmark.category}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-slate-900">KES {benchmark.reference_price_kes.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">{benchmark.unit_of_measure}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

