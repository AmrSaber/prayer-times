import { Language } from '$lib/i18n/enums';
import { derived } from 'svelte/store';
import type { TimingsResponse } from '../types';
import type { City, Country } from '../types/pure';
import { createPersistentStore } from './utils';

// User selections
export const selectedCountry = createPersistentStore<Country>('user::selection::country');
export const selectedCity = createPersistentStore<City>('user::selection::city');
export const selectedMosqueId = createPersistentStore<string>('user::selection::mosque-id');

/** Identifies the current selection, or null while it is incomplete (a city-based provider has no mosque). */
export const selectionKey = derived([selectedCountry, selectedCity, selectedMosqueId], ([country, city, mosque]) => {
  if (country == null || city == null || (mosque == null && !city.complete)) return null;
  return `${country.id}:${city.id}:${mosque ?? ''}`;
});

// User settings
export const selectedLanguage = createPersistentStore<Language>('user::settings::language', Language.EN);
export const showTimerSeconds = createPersistentStore<boolean>('user::settings::show-timer-seconds', true);

// Last response (with the selection it belongs to), so the app still shows something when offline
export const lastTimings = createPersistentStore<{ key: string; response: TimingsResponse }>('cache::last-timings');
