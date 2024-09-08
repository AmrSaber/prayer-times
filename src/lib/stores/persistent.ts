import { Language } from '$lib/i18n/enums';
import type { City, Country, Mosque, MosqueDetails } from '../types/pure';
import { createPersistentStore } from './utils';

// User selections
export const selectedCountry = createPersistentStore<Country>('user::selection::country');
export const selectedCity = createPersistentStore<City>('user::selection::city');
export const selectedMosqueId = createPersistentStore<string>('user::selection::mosque-id');

// User settings
export const selectedLanguage = createPersistentStore<Language>('user::settings::language', Language.EN);
export const showTimerSeconds = createPersistentStore<boolean>('user::settings::show-timer-seconds', true);

export const selectedMosque = createPersistentStore<MosqueDetails>('cache::selected-mosque');

// Recents
export const recentCountries = createPersistentStore<Country[]>('cache::countries::recent', []);
export const getRecentCities = (country: Country) =>
  createPersistentStore<City[]>(`cache::countries::${country.id}::cities`, []);
export const getRecentMosques = (city: City) =>
  createPersistentStore<Mosque[]>(`cache::countries::cities::${city.id}::mosques`);
