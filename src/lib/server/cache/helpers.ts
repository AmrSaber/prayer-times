import { mkdir } from 'fs/promises';
import { SqliteCache } from './cache';

function createCacheStore() {
  let cache: SqliteCache;

  return async function get() {
    if (cache == null) {
      await mkdir('cache', { recursive: true });
      cache = new SqliteCache();
    }

    return cache;
  };
}

export const getCacheStore = createCacheStore();

/** Return the cached value for `key`, or load it and cache it for `ttlMs`. */
export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const store = await getCacheStore();

  const hit = store.get<T>(key);
  if (hit != null) return hit;

  const value = await load();
  store.set(key, value, { expiresAt: Date.now() + ttlMs });
  return value;
}
