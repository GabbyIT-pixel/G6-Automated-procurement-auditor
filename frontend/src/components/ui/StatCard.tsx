import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  trend?: { value: string; direction: 'up' | 'down'; positive?: boolean };
  accent?: 'brand' | 'danger' | 'success' | 'warning' | 'neutral';
  delay?: number;
  children?: ReactNode;
}

const accentStyles: Record<NonNullable<StatCardProps['accent']>, string> = {
  brand: 'bg-brand-50 text-brand-600',
  danger: 'bg-rose-50 text-rose-600',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  neutral: 'bg-slate-100 text-slate-600',
};

export default function StatCard({ label, value, detail, icon: Icon, trend, accent = 'brand', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      className="group rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105', accentStyles[accent])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {trend ? (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-semibold',
              trend.positive === false ? 'text-rose-600' : 'text-emerald-600',
            )}
          >
            {trend.direction === 'up' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {trend.value}
          </span>
        ) : null}
        {detail ? <p className="text-xs text-slate-500">{detail}</p> : null}
      </div>
    </motion.div>
  );
}
