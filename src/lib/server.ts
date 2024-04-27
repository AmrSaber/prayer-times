import { mkdir } from 'fs/promises';

import { createCache } from 'cache-manager';
import sqliteStore from 'cache-manager-sqlite';

export async function getCacheStore() {
  await mkdir('cache', { recursive: true });
  return createCache(sqliteStore.create({ path: 'cache/cache.db', name: 'api' }));
}
