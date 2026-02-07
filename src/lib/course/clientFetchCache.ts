type CacheEntry<T> = {
  data: T | null;
  ts: number;
  promise: Promise<T> | null;
  lastAttempt: number;
  lastError: Error | null;
};

const cache = new Map<string, CacheEntry<unknown>>();

type CacheOptions = {
  staleOk?: boolean;
  cooldownMs?: number;
};

export async function cachedFetchJson<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const staleOk = options.staleOk ?? true;
  const cooldownMs = options.cooldownMs ?? 3000;
  const now = Date.now();
  const existing = cache.get(key) as CacheEntry<T> | undefined;

  if (existing?.data && now - existing.ts < ttlMs) {
    return existing.data;
  }

  if (existing?.promise) {
    return existing.promise;
  }

  if (existing?.lastAttempt && now - existing.lastAttempt < cooldownMs) {
    if (existing.data && staleOk) return existing.data;
    throw existing.lastError ?? new Error("request cooldown");
  }

  const promise = fetcher()
    .then((data) => {
      cache.set(key, { data, ts: Date.now(), promise: null, lastAttempt: now, lastError: null });
      return data;
    })
    .catch((err) => {
      if (existing?.data && staleOk) {
        cache.set(key, {
          data: existing.data,
          ts: existing.ts,
          promise: null,
          lastAttempt: now,
          lastError: err instanceof Error ? err : new Error("fetch error"),
        });
        return existing.data;
      }
      cache.set(key, {
        data: existing?.data ?? null,
        ts: existing?.ts ?? 0,
        promise: null,
        lastAttempt: now,
        lastError: err instanceof Error ? err : new Error("fetch error"),
      });
      throw err;
    });

  cache.set(key, {
    data: existing?.data ?? null,
    ts: existing?.ts ?? 0,
    promise,
    lastAttempt: now,
    lastError: existing?.lastError ?? null,
  });
  return promise;
}

export function invalidateCache(key: string) {
  cache.delete(key);
}
