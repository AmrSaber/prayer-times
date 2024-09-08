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
