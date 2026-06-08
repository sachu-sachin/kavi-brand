/**
 * Minimal in-memory fixed-window rate limiter.
 * Suitable for a single Node process (Hostinger managed Node) — no Redis needed.
 * Not shared across instances; if the app is ever horizontally scaled, swap the
 * backing store.
 */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (store.size > 5000) {
    for (const [k, v] of store) {
      if (v.resetAt <= now) store.delete(k);
    }
  }

  const entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}
