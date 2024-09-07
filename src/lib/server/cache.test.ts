import { sleep } from 'bun';
import { describe, expect, test } from 'bun:test';
import { SqliteCache } from './cache';

const MEMORY_PATH = ':memory:';

describe('SqliteCache Tests', () => {
  test('set/get works', () => {
    const cache = new SqliteCache(MEMORY_PATH);

    const key = 'my-key';
    const value = 'my-value';

    cache.set(key, value);
    expect(cache.get<string>(key)).toEqual(value);
  });

  test('getting unset value', () => {
    const cache = new SqliteCache(MEMORY_PATH);
    expect(cache.get('no-there')).toBe(undefined);
  });

  test('delete works', () => {
    const cache = new SqliteCache(MEMORY_PATH);

    const key = 'my-key';
    const value = 'my-value';

    cache.set(key, value);
    expect(cache.get<string>(key)).toEqual(value);

    cache.delete(key);
    expect(cache.get(key)).toEqual(undefined);
  });

  test('cleaning expired works', () => {
    const cache = new SqliteCache(MEMORY_PATH);

    const key = 'my-key';
    const value = 'my-value';

    cache.set(key, value, { expiresAt: 0 });
    expect(cache.get(key)).toEqual(undefined);
  });

  test('ttl works', async () => {
    const cache = new SqliteCache(MEMORY_PATH);

    const key = 'my-key';
    const value = 'my-value';
    const ttl = 100;

    cache.set(key, value, { expiresAt: Date.now() + ttl });
    expect(cache.get<string>(key)).toEqual(value);

    await sleep(ttl + 50);

    expect(cache.get(key)).toEqual(undefined);
  });

  test('reset works', async () => {
    const cache = new SqliteCache(MEMORY_PATH);

    cache.set('key-1', 'value-1');
    cache.set('key-2', 'value-2');

    expect(cache.get<string>('key-1')).toEqual('value-1');
    expect(cache.get<string>('key-2')).toEqual('value-2');

    cache.reset();

    expect(cache.get('key-1')).toEqual(undefined);
    expect(cache.get('key-2')).toEqual(undefined);

    cache.set('some-key', 'some-value');
    expect(cache.get<string>('some-key')).toEqual('some-value');
  });
});
