export type CachedMeta = { staleAt?: number; expireAt?: number };

export type Cache = {
	has: (key: string) => boolean;
	set: (key: string, value: unknown) => void;
	get: (key: string) => unknown;
};

export const LocalStorageCache: Cache = {
	has(key: string) {
		return localStorage.getItem(key) != null;
	},

	set(key: string, value: unknown) {
		localStorage.setItem(key, JSON.stringify(value));
	},

	get(key: string) {
		const savedString = localStorage.getItem(key);
		if (savedString == null) return undefined;

		try {
			return JSON.parse(savedString);
		} catch {
			return undefined;
		}
	}
};

export const InMemoryCache: Cache = new Map<string, unknown>();
