import { beforeEach, describe, expect, test } from 'bun:test';
import { cachedToday, purgeStaleDaily } from './cache';
import { localToday } from './dates';

// Minimal localStorage stand-in (bun has none). Items are own properties, as in a browser.
class FakeStorage {
  getItem(key: string) {
    return Object.hasOwn(this, key) ? (this as unknown as Record<string, string>)[key] : null;
  }
  setItem(key: string, value: string) {
    (this as unknown as Record<string, string>)[key] = value;
  }
  removeItem(key: string) {
    delete (this as unknown as Record<string, string>)[key];
  }
}

let storage: FakeStorage;
beforeEach(() => {
  storage = new FakeStorage();
  Object.assign(globalThis, { localStorage: storage });
});

describe('daily client cache', () => {
  test('loads once per day', async () => {
    let loads = 0;
    const load = async () => ++loads;

    expect(await cachedToday('k', load)).toBe(1);
    expect(await cachedToday('k', load)).toBe(1);
  });

  test('a failed load throws and stores nothing', async () => {
    await expect(cachedToday('k', () => Promise.reject(new Error('offline')))).rejects.toThrow('offline');
    expect(Object.keys(storage)).toEqual([]);
  });

  test('purges only entries of other days', async () => {
    storage.setItem('cache::2000-01-01::old', '{}');
    storage.setItem('user::selection::country', '{}');
    await cachedToday('fresh', async () => 1);

    purgeStaleDaily();

    expect(Object.keys(storage).sort()).toEqual([`cache::${localToday()}::fresh`, 'user::selection::country']);
  });
});
