import memoize from 'lodash.memoize';
import { MyMasjidApi, OwnApi } from './api';
import type { HijriDate, HijriDateAnchor } from './types';
import { getHijriDateFromAnchor } from './utils';
import { LocalStorageCache } from './utils/cache';

export const getCountries = memoize(MyMasjidApi.getCountries);
export const getCities = memoize(MyMasjidApi.getCities);
export const getMosques = memoize(MyMasjidApi.getMosques, (countryId, cityId) => `${countryId}:${cityId}`);

export const getTimings = memoize(MyMasjidApi.getTimings);

export async function getHijriDate(countryId: number): Promise<HijriDate> {
  const cacheKey = `api::hijri-date::${countryId}`;
  let cachedDate = LocalStorageCache.get<HijriDateAnchor>(cacheKey);
  if (cachedDate?.gregorianDate == null) cachedDate = null; // TODO: remove in later version - this is here for backward compatibility

  const currentDate = new Date().toISOString();

  let hijriDate = getHijriDateFromAnchor(cachedDate, currentDate);
  if (hijriDate != null) return hijriDate;
  hijriDate = await OwnApi.getHijriDate(countryId)!;

  const dateAnchor: HijriDateAnchor = { hijriDate, gregorianDate: currentDate };
  LocalStorageCache.set(cacheKey, dateAnchor);

  return hijriDate;
}
