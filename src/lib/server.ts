import { createCache } from 'cache-manager';
import sqliteStore from 'cache-manager-sqlite';

export function getCacheStore() {
  return createCache(sqliteStore.create({ path: 'cache.db', name: 'api' }));
}
