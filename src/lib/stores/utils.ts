import { writable } from 'svelte/store';

export function createPersistentStore<T>(persistanceKey: string, initialValue?: T) {
	let persistedValue: T | undefined;

	const savedString = localStorage.getItem(persistanceKey);
	if (savedString != null) {
		try {
			persistedValue = JSON.parse(savedString);
		} catch {
			// nothing, leave it undefined
		}
	}

	const { set, subscribe } = writable<T | undefined | null>(persistedValue ?? initialValue);

	subscribe((value) => {
		localStorage.setItem(persistanceKey, JSON.stringify(value));
	});

	return {
		set(value: T | undefined | null) {
			set(value);
			localStorage.setItem(persistanceKey, JSON.stringify(value));
		},
		subscribe
	};
}
