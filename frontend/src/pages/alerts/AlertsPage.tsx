import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { dashboardApi } from '../../lib/api';
import type { RiskLevel } from '../../types';
import { Card, CardEyebrow, CardTitle, EmptyState, RiskBadge } from '../../components/ui';
import { cn } from '../../lib/cn';

const FILTERS: Array<RiskLevel | 'All'> = ['All', 'Critical', 'High', 'Medium', 'Low'];

const toNumber = (value: unknown) => (typeof value === 'number' ? value : Number(value ?? 0));

export default function AlertsPage() {
  const [filter, setFilter] = useState<RiskLevel | 'All'>('All');
  const { data, isLoading } = useQuery({
    queryKey: ['alerts-page'],
    queryFn: () => dashboardApi.alerts(1, 12).then((res) => res.data),
  });

  const alerts = data?.alerts ?? [];
  const filteredAlerts = useMemo(
    () => (filter === 'All' ? alerts : alerts.filter((alert) => alert.risk_level === filter)),
    [alerts, filter],
  );

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardEyebrow>Alerts</CardEyebrow>
            <CardTitle>Review queue</CardTitle>
            <p className="mt-2 max-w-xl text-sm text-slate-500">
              Prioritize medium, high, and critical procurement deviations that require follow-up.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter alerts by risk level">
            {FILTERS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFilter(level)}
                aria-pressed={filter === level}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                  filter === level ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton h-28 animate-shimmer rounded-2xl border border-slate-200/70 bg-slate-100" />
          ))
        ) : filteredAlerts.length === 0 ? (
          <Card>
            <EmptyState
              icon={filter === 'All' ? <ShieldOff className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
              title={filter === 'All' ? 'No alerts right now' : `No ${filter.toLowerCase()} risk alerts`}
              description="New anomalies will appear here automatically once flagged by the audit engine."
            />
          </Card>
        ) : (
          filteredAlerts.map((alert, index) => (
            <motion.div
              key={alert.alert_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.3 }}
            >
              <Card hoverable>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <p className="text-lg font-semibold tracking-tight text-slate-900">{alert.supplier_name}</p>
                      <RiskBadge level={alert.risk_level} />
                    </div>
                    <p className="mt-1.5 text-sm text-slate-500">
                      {alert.item_name} &middot; {alert.item_code}
                    </p>
                    <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700">
                      Estimated overpayment: KES {alert.estimated_overpayment_kes.toLocaleString()}
                    </p>
                  </div>
                  <div className="shrink-0 text-left lg:text-right">
                    <p className="text-2xl font-semibold tabular-nums text-slate-900">{toNumber(alert.variance_pct).toFixed(1)}%</p>
                    <p className="text-xs text-slate-500">variance vs. benchmark</p>
                    <p className="mt-2 text-xs text-slate-400">{new Date(alert.flagged_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

