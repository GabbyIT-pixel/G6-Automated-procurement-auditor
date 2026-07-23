import { cn } from '../../lib/cn';

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '');
  return initials.join('') || '?';
}

const palette = [
  'bg-brand-100 text-brand-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
];

function hashToIndex(value: string, mod: number) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash % mod;
}

export default function Avatar({ name, size = 'md', className }: { name: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' } as const;
  const colorClass = palette[hashToIndex(name, palette.length)];
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold', sizes[size], colorClass, className)}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}
