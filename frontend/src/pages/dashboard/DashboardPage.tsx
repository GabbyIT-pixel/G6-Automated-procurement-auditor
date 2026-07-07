import { motion } from 'framer-motion';
import { ArrowUpRight, BadgeCheck, CircleDollarSign, ShieldAlert, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../lib/api';
import type { User } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface DashboardPageProps {
  user: User;
}

const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444'];

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
    const totalValue = contracts.reduce((sum, contract) => sum + contract.awarded_unit_price * contract.quantity, 0);
    const highRisk = alerts.filter((alert) => alert.risk_level === 'High' || alert.risk_level === 'Critical').length;
    const avgVariance = alerts.length
      ? alerts.reduce((sum, alert) => sum + alert.variance_pct, 0) / alerts.length
      : 0;

    return [
      { label: 'Contracts reviewed', value: contracts.length.toString(), detail: 'Latest ledger entries', icon: FileTextIcon },
      { label: 'High-risk alerts', value: highRisk.toString(), detail: 'Needs immediate review', icon: ShieldAlert },
      { label: 'Avg. variance', value: `${avgVariance.toFixed(1)}%`, detail: 'Against KEMSA benchmark', icon: TrendingUp },
      { label: 'Estimated spend', value: `KES ${Math.round(totalValue).toLocaleString()}`, detail: 'On latest contracts', icon: CircleDollarSign },
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
    return Object.entries(counts).map(([name, value], idx) => ({ name, value, color: COLORS[idx % COLORS.length] }));
  }, [alertsData]);

  const recentAlerts = alertsData?.alerts ?? [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Overview</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Welcome back, {user.full_name}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Review procurement activity, benchmark variance, and priority alerts from one enterprise workspace.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4" />
              Live database synced with the backend API
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
                  <p className="mt-2 text-sm text-slate-500">{stat.detail}</p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Spending trend</p>
              <p className="text-sm text-slate-500">Contracts by month</p>
            </div>
            <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">Updated daily</div>
          </div>
          {contractsLoading ? (
            <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#2563EB" fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Risk distribution</p>
              <p className="text-sm text-slate-500">Current alert mix</p>
            </div>
            <div className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">Priority</div>
          </div>
          {alertsLoading ? (
            <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
          ) : (
            <div className="flex h-64 items-center gap-4">
              <ResponsiveContainer width="60%" height={220}>
                <PieChart>
                  <Pie data={riskBreakdown} dataKey="value" innerRadius={45} outerRadius={80} paddingAngle={3}>
                    {riskBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 text-sm">
                {riskBreakdown.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-600">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Recent alerts</p>
              <p className="text-sm text-slate-500">Priority review queue</p>
            </div>
            <button className="text-sm font-medium text-blue-600">View all</button>
          </div>
          <div className="space-y-3">
            {recentAlerts.slice(0, 4).map((alert) => (
              <div key={alert.alert_id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{alert.supplier_name}</p>
                  <p className="text-sm text-slate-500">{alert.item_name} · {alert.variance_pct.toFixed(1)}% variance</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{alert.risk_level}</p>
                  <p className="text-sm text-slate-500">{new Date(alert.flagged_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Benchmarks</p>
              <p className="text-sm text-slate-500">Reference prices from KEMSA</p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">{benchmarksData?.count ?? 0}</div>
          </div>
          {benchmarksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => <div key={item} className="h-12 animate-pulse rounded-2xl bg-slate-100" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {(benchmarksData?.benchmarks ?? []).slice(0, 4).map((benchmark) => (
                <div key={benchmark.baseline_id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{benchmark.item_name}</p>
                    <p className="text-sm text-slate-500">{benchmark.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">KES {benchmark.reference_price_kes.toLocaleString()}</p>
                    <p className="text-sm text-slate-500">{benchmark.unit_of_measure}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FileTextIcon() {
  return <ArrowUpRight className="h-5 w-5" />;
}
