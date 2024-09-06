import { sleep } from 'bun';
import { describe, expect, test } from 'bun:test';
import { SqliteCache } from './cache';

describe('SqliteCache Tests', () => {
  test('set/get works', () => {
    const cache = new SqliteCache(':memory:');

    const key = 'my-key';
    const value = 'my-value';

    cache.set(key, value);
    expect(cache.get<string>(key)).toEqual(value);
  });

  test('getting unset value', () => {
    const cache = new SqliteCache(':memory:');
    expect(cache.get('no-there')).toBe(undefined);
  });

  test('delete works', () => {
    const cache = new SqliteCache(':memory:');

    const key = 'my-key';
    const value = 'my-value';

    cache.set(key, value);
    expect(cache.get<string>(key)).toEqual(value);

    cache.delete(key);
    expect(cache.get(key)).toEqual(undefined);
  });

  test('cleaning expired works', () => {
    const cache = new SqliteCache(':memory:');

    const key = 'my-key';
    const value = 'my-value';

    cache.set(key, value, { expiresAt: 0 });
    expect(cache.get(key)).toEqual(undefined);
  });

  test('ttl works', async () => {
    const cache = new SqliteCache(':memory:');

    const key = 'my-key';
    const value = 'my-value';
    const ttl = 100;

    cache.set(key, value, { expiresAt: Date.now() + ttl });
    expect(cache.get<string>(key)).toEqual(value);

    await sleep(ttl);

    expect(cache.get(key)).toEqual(undefined);
  });
});
