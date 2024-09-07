export function getDaysDiff(d1: Date, d2: Date): number {
  const diffTime = Math.abs(d2.valueOf() - d1.valueOf());
  return Math.ceil(diffTime / (24 * 60 * 60 * 1000));
}

export function getDayOfYear(date: Date) {
  const diff = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0);
  return diff / DAY_MS;
}

export const DAY_MS = 24 * 60 * 60 * 1000;
