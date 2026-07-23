import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({ className, hoverable, padding = 'md', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/70 bg-white shadow-card',
        hoverable && 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover',
        paddings[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-5 flex items-center justify-between gap-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardEyebrow({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs font-semibold uppercase tracking-[0.14em] text-brand-600', className)} {...props}>
      {children}
    </p>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn('mt-1.5 text-2xl font-semibold tracking-tight text-slate-900', className)} {...props}>
      {children}
    </h2>
  );
}
