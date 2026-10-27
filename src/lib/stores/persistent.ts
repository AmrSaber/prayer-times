import { Language } from '$lib/i18n/enums';
import type { TimingsResponse } from '../types';
import type { City, Country } from '../types/pure';
import { createPersistentStore } from './utils';

// User selections
export const selectedCountry = createPersistentStore<Country>('user::selection::country');
export const selectedCity = createPersistentStore<City>('user::selection::city');
export const selectedMosqueId = createPersistentStore<string>('user::selection::mosque-id');

// User settings
export const selectedLanguage = createPersistentStore<Language>('user::settings::language', Language.EN);
export const showTimerSeconds = createPersistentStore<boolean>('user::settings::show-timer-seconds', true);

// Last response (with the selection it belongs to), so the app still shows something when offline
export const lastTimings = createPersistentStore<{ mosqueId: string; response: TimingsResponse }>(
  'cache::last-timings',
);
