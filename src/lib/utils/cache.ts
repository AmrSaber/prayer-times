export type CachedMeta = { expiresAt?: number };

export type Cache = {
	has: (key: string) => boolean;
	set: (key: string, value: unknown) => void;
	get: (key: string) => unknown;
	delete: (key: string) => void;
};

export const LocalStorageCache: Cache = {
	set(key: string, value: unknown) {
		localStorage.setItem(key, JSON.stringify(value));
	},

	delete(key: string) {
		localStorage.removeItem(key);
	},

	get(key: string) {
		const savedString = localStorage.getItem(key);
		if (savedString == null) return undefined;

		try {
			const value = JSON.parse(savedString) as CachedMeta;

			if (value.expiresAt != null && value.expiresAt <= new Date().valueOf()) {
				this.delete(key);
				return undefined;
			}

			return value;
		} catch {
			return undefined;
		}
	},

	has(key: string) {
		return this.get(key) != null;
	}
};

const cacheMap = new Map();
export const InMemoryCache: Cache = {
	set(key: string, value: unknown) {
		cacheMap.set(key, value);
	},

	delete(key: string) {
		cacheMap.delete(key);
	},

	get(key: string) {
		const value = cacheMap.get(key);
		if (value == null) return undefined;

		if (value?.expiresAt != null && value.expiresAt <= Date.now()) {
			this.delete(key);
			return undefined;
		}

		return value;
	},

	has(key: string) {
		return this.get(key) != null;
	}
};
