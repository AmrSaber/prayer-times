import type { Nullable } from '#lib/types/index.ts';
import { localToday } from './dates';

export type CachedMeta = { expiresAt?: number };

export type Cache = {
  has: (key: string) => boolean;
  set: (key: string, value: unknown) => void;
  get: <T>(key: string) => Nullable<T>;
  delete: (key: string) => void;
};

export const LocalStorageCache: Cache = {
  set(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  delete(key: string) {
    localStorage.removeItem(key);
  },

  get<T>(key: string): T | undefined {
    const savedString = localStorage.getItem(key);
    if (savedString == null) return undefined;

    try {
      const value = JSON.parse(savedString) as CachedMeta;

      if (value.expiresAt != null && value.expiresAt <= new Date().valueOf()) {
        this.delete(key);
        return undefined;
      }

      return value as T;
    } catch {
      return undefined;
    }
  },

  has(key: string): boolean {
    return this.get(key) != null;
  },
};

const cacheMap = new Map();
export const InMemoryCache: Cache = {
  set(key: string, value: unknown) {
    cacheMap.set(key, value);
  },

  delete(key: string) {
    cacheMap.delete(key);
  },

  get<T>(key: string): T | undefined {
    const value = cacheMap.get(key);
    if (value == null) return undefined;

    if (value?.expiresAt != null && value.expiresAt <= Date.now()) {
      this.delete(key);
      return undefined;
    }

    return value as T;
  },

  has(key: string): boolean {
    return this.get(key) != null;
  },
};

const DAILY_PREFIX = 'cache::';
const DAILY_KEY = /^cache::(\d{4}-\d{2}-\d{2})::/;

/** Return today's stored value for `key`, or load and store it. A failed load throws, even if older data exists. */
export async function cachedToday<T>(key: string, load: () => Promise<T>): Promise<T> {
  const storageKey = `${DAILY_PREFIX}${localToday()}::${key}`;

  const hit = LocalStorageCache.get<{ value: T }>(storageKey);
  if (hit != null) return hit.value;

  const value = await load();
  LocalStorageCache.set(storageKey, { value });
  return value;
}

/** Delete the daily entries of earlier days so they don't pile up in the browser. */
export function purgeStaleDaily(today = localToday()) {
  for (const key of Object.keys(localStorage)) {
    const date = DAILY_KEY.exec(key)?.[1];
    if (date != null && date !== today) localStorage.removeItem(key);
  }
}
