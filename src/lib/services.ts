import memoize from 'lodash.memoize';
import throttle from 'lodash.throttle';
import { Api } from './api';
import type { HijriDate, HijriDateAnchor } from './types';
import { getHijriDateFromAnchor } from './utils';
import { LocalStorageCache } from './utils/cache';

export const getCountries = memoize(Api.getCountries);
export const getCities = memoize(Api.getCities);
export const getMosques = memoize(Api.getMosques, (countryId, cityId) => `${countryId}:${cityId}`);

export const getTimings = Api.getTimings;

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
