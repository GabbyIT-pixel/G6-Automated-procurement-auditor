import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../lib/api';

export default function AlertsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['alerts-page'],
    queryFn: () => dashboardApi.alerts(1, 12).then((res) => res.data),
  });

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Alerts</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Review queue</h2>
        <p className="mt-2 text-sm text-slate-500">Prioritize medium, high, and critical procurement deviations that require follow-up.</p>
      </div>

      <div className="space-y-3">
        {isLoading
          ? [1, 2, 3].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-[24px] border border-slate-200 bg-white shadow-sm" />
            ))
          : (data?.alerts ?? []).map((alert) => (
              <div key={alert.alert_id} className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{alert.supplier_name}</p>
                    <p className="mt-1 text-sm text-slate-500">{alert.item_name} · {alert.item_code}</p>
                    <p className="mt-3 text-sm text-slate-500">Estimated overpayment: KES {alert.estimated_overpayment_kes.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{alert.risk_level}</p>
                    <p className="mt-1 text-sm text-slate-500">Variance {(typeof alert.variance_pct === 'number' ? alert.variance_pct : Number(alert.variance_pct ?? 0)).toFixed(1)}%</p>
                    <p className="mt-1 text-sm text-slate-500">{new Date(alert.flagged_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
