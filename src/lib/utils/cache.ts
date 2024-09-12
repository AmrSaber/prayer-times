import type { Nullable } from '$lib/types';

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
