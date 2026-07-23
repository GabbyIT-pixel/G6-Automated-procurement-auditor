import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import type { RiskLevel } from '../../types';

type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'critical';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200',
  brand: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100',
  danger: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100',
  critical: 'bg-rose-600 text-white ring-1 ring-inset ring-rose-700',
};

const dotColors: Record<BadgeTone, string> = {
  neutral: 'bg-slate-500',
  brand: 'bg-brand-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  critical: 'bg-white',
};

export default function Badge({ className, tone = 'neutral', dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-none',
        tones[tone],
        className,
      )}
      {...props}
    >
      {dot ? <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[tone])} /> : null}
      {children}
    </span>
  );
}

const riskToneMap: Record<RiskLevel, BadgeTone> = {
  Low: 'success',
  Medium: 'warning',
  High: 'danger',
  Critical: 'critical',
};

export function RiskBadge({ level }: { level?: RiskLevel | string }) {
  const tone = riskToneMap[(level as RiskLevel) ?? 'Low'] ?? 'neutral';
  return (
    <Badge tone={tone} dot>
      {level ?? 'Low'}
    </Badge>
  );
}
