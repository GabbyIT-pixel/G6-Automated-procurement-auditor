import { cn } from '../../lib/cn';

export default function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton animate-shimmer rounded-lg bg-slate-100', className)} aria-hidden="true" />;
}

export function SkeletonRow({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-5 py-4">
          <Skeleton className="h-4 w-full max-w-[9rem]" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div className="w-full space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-11 w-11 rounded-xl" />
      </div>
    </div>
  );
}
