import type { Cache } from './cache';

export function cacheFunc<T>(cache: Cache, key: string, fn: () => T): T {
	if (!cache.has(key)) cache.set(key, fn());
	return cache.get(key) as T;
}

export async function cacheFuncAsync<T>(
	cache: Cache,
	key: string,
	fn: () => Promise<T>
): Promise<T> {
	if (!cache.has(key)) cache.set(key, await fn());
	return cache.get(key) as T;
}
