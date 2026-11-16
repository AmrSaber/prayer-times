import throttle from 'lodash.throttle';
import { Api } from './api';
import type { HijriDate, HijriDateAnchor, Selection } from './types';
import { getHijriDateFromAnchor } from './utils';
import { cachedToday, LocalStorageCache } from './utils/cache';

// Kept in local storage for the rest of the day so anything already viewed still works offline
export const getCountries = () => cachedToday('countries', Api.getCountries);
export const getCities = (countryId: number) => cachedToday(`cities::${countryId}`, () => Api.getCities(countryId));
export const getMosques = (countryId: number, cityId: number) =>
  cachedToday(`mosques::${countryId}::${cityId}`, () => Api.getMosques(countryId, cityId));
export const getTimings = (selection: Selection, date: string) =>
  cachedToday(`timings::${selection.country}::${selection.city}::${selection.mosque ?? ''}::${date}`, () =>
    Api.getTimings(selection, date),
  );

// Throttled so that calling it on every tick is safe
const fetchHijriDate = throttle(Api.getHijriDate, 5_000);

export async function getHijriDate(countryId: number): Promise<HijriDate> {
  const cacheKey = `api::hijri-date::${countryId}`;
  let cachedDate = LocalStorageCache.get<HijriDateAnchor>(cacheKey);
  if (cachedDate?.gregorianDate == null) cachedDate = null;

  const currentDate = new Date().toISOString();

  let hijriDate = getHijriDateFromAnchor(cachedDate, currentDate);
  if (hijriDate != null) return hijriDate;
  hijriDate = (await fetchHijriDate(countryId))!;

  const dateAnchor: HijriDateAnchor = { hijriDate, gregorianDate: currentDate };
  LocalStorageCache.set(cacheKey, dateAnchor);

  return hijriDate;
}
