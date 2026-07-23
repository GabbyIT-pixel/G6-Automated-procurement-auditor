import { forwardRef } from 'react';
import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  invalid?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightSlot, invalid, ...props }, ref) => {
    return (
      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          className={cn(
            'h-11 w-full rounded-xl border bg-slate-50/70 px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400',
            'focus:border-brand-500 focus:bg-white focus:shadow-focus-ring',
            invalid ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200',
            leftIcon ? 'pl-10' : undefined,
            rightSlot ? 'pr-11' : undefined,
            className,
          )}
          aria-invalid={invalid || undefined}
          {...props}
        />
        {rightSlot ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{rightSlot}</span>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('mb-2 block text-sm font-medium text-slate-700', className)} {...props} />;
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs font-medium text-rose-600">{children}</p>;
}
