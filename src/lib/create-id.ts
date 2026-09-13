/**
 * Collision-resistant id for rows created on this device (e.g. `wks_lx3k9a2b7fq1c`).
 * Only `[a-z0-9_]`, so ids are safe to use inside photo file names.
 */
export function createId(prefix: string): string {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10).padEnd(8, "0");
  return `${prefix}_${time}${random}`;
}
