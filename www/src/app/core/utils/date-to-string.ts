export function dateToString(date?: Date): string {
  return date ? date.toISOString() : '';
}
