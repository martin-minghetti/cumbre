/**
 * Returns true only for paths that are safe to use as a same-origin redirect target.
 * Rejects schemes (http:, https:, javascript:), protocol-relative (//), and empty/non-/ paths.
 */
export function isSafeRelative(path: string | null | undefined): boolean {
  if (!path || typeof path !== 'string') return false;
  if (path[0] !== '/') return false;
  if (path.startsWith('//')) return false;
  return true;
}
