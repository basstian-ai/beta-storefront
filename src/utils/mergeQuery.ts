export function mergeQueryString(current: string, next: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams(current);
  Object.entries(next).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  });
  return params.toString();
}
