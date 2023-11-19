// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/// <reference types="@sveltejs/kit" />

import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
	...build, // the app itself
	...files // everything in `static`
];

const EXCLUDED_CACHE_PATHS = [
	// Never cache time request, its caching is handled inside the app
	'TimingsInfoScreen/GetMasjidTimings',
	'manifest.json'
];

self.addEventListener('install', (event) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	self.skipWaiting();
	event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
	// ignore POST requests etc
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// If url path matches an excluded path, then always fetch
		const isExcludedResource = EXCLUDED_CACHE_PATHS.some((path) => url.pathname.includes(path));
		if (isExcludedResource) return fetch(event.request);

		// `build`/`files` can always be served from the cache
		if (ASSETS.includes(url.pathname)) return cache.match(url.pathname);

		// for everything else, try the network first, but
		// fall back to the cache if we're offline
		try {
			const response = await fetch(event.request);
			if (response.status === 200) cache.put(event.request, response.clone());
			return response;
		} catch {
			return cache.match(event.request);
		}
	}

	event.respondWith(respond());
});
