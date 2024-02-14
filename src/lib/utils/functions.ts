import type { Cache, CachedMeta } from './cache';

export function cacheFunc<T>(cache: Cache, key: string, fn: () => T): T {
	if (!cache.has(key)) cache.set(key, fn());
	return cache.get(key) as T;
}

export async function cacheFuncAsync<T>(
	cache: Cache,
	key: string,
	fn: () => Promise<T>
): Promise<T> {
	const populateCache = async () => cache.set(key, await fn());
	if (!cache.has(key)) await populateCache();

	let cached = cache.get(key) as T & CachedMeta;

	// If stale, refresh in the background
	if (cached.staleAt != null && cached.staleAt <= new Date().valueOf()) populateCache();

	// If expired, call fn again and get latest value
	if (cached.expireAt != null && cached.expireAt <= new Date().valueOf()) {
		await populateCache();
		cached = cache.get(key) as T & CachedMeta;
	}

	return cached;
}
