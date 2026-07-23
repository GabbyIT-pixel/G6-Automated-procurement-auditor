type ClassValue = string | number | null | undefined | false | Record<string, boolean | undefined>;

/** Minimal className combinator (clsx-style) so we avoid an extra dependency. */
export function cn(...values: ClassValue[]): string {
  const classes: string[] = [];
  for (const value of values) {
    if (!value) continue;
    if (typeof value === 'string' || typeof value === 'number') {
      classes.push(String(value));
    } else {
      for (const key in value) {
        if (value[key]) classes.push(key);
      }
    }
  }
  return classes.join(' ');
}
