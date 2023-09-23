import { writable } from 'svelte/store';
import type { Mosque } from '../types/pure';

const selectedMosqueKey = 'selected-mosque';

let mosque: Mosque | null = null;

const savedValue = localStorage.getItem(selectedMosqueKey);
if (savedValue != null) {
	try {
		mosque = JSON.parse(savedValue);
	} catch {
		// nothing, leave it null
	}
}

export const selectedMosque = writable(mosque);

selectedMosque.subscribe((value) => {
	localStorage.setItem(selectedMosqueKey, JSON.stringify(value));
});
