export const ONLINE_MS = 120000;
export const RECENT_MS = 30 * 24 * 60 * 60 * 1000;

export function activityTs(p: any): number {
  const t = p?.lastActive ? new Date(p.lastActive).getTime() : 0;
  return Number.isFinite(t) && t > 0 ? t : 0;
}

export function isOnlineNow(p: any): boolean {
  const ts = activityTs(p);
  return ts > 0 && Date.now() - ts < ONLINE_MS;
}

function idOf(p: any): string {
  return String(p?.id || p?.$id || '');
}

export function pickRecentlyActive<T extends { lastActive?: string; id?: string; $id?: string }>(
  list: T[],
  count?: number,
  minRecent: number = count ?? 9,
): T[] {
  const seen = new Map<string, T>();
  for (const p of list || []) {
    const id = idOf(p);
    if (!id || seen.has(id)) continue;
    if (activityTs(p) <= 0) continue;
    seen.set(id, p);
  }
  const all = [...seen.values()].sort((a, b) => {
    const aOn = isOnlineNow(a) ? 0 : 1;
    const bOn = isOnlineNow(b) ? 0 : 1;
    if (aOn !== bOn) return aOn - bOn;
    const d = activityTs(b) - activityTs(a);
    if (d !== 0) return d;
    return idOf(a).localeCompare(idOf(b));
  });
  const recent = all.filter(p => Date.now() - activityTs(p) <= RECENT_MS);
  const base = recent.length >= minRecent ? recent : all;
  return typeof count === 'number' ? base.slice(0, count) : base;
}
