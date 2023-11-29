import type { City, Country, Mosque } from '../types/pure';
import { createPersistentStore } from './utils';

export const selectedCountry = createPersistentStore<Country>('selected-country');
export const selectedCity = createPersistentStore<City>('selected-city');
export const selectedMosque = createPersistentStore<Mosque>('selected-mosque');
