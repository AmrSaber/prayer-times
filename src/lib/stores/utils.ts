import { LocalStorageCache } from '$lib/utils/cache';
import { writable } from 'svelte/store';

export function createPersistentStore<T>(persistanceKey: string, initialValue?: T) {
  if (!LocalStorageCache.has(persistanceKey)) LocalStorageCache.set(persistanceKey, initialValue);
  const initial = LocalStorageCache.get(persistanceKey) as T | undefined;

  const { set, subscribe } = writable<T | undefined | null>(initial);

  window.addEventListener('storage', (event) => {
    if (event.key !== persistanceKey) return;
    set(LocalStorageCache.get(persistanceKey) as T);
  });

  return {
    set(value: T | undefined | null) {
      set(value);
      LocalStorageCache.set(persistanceKey, value);
    },
    subscribe,
  };
}
