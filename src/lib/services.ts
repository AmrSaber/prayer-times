import memoize from 'lodash.memoize';
import { MyMasjidApi, OwnApi } from './api';
import type { HijriDate, HijriDateAnchor } from './types';
import { getDayOfYear } from './utils';
import { LocalStorageCache } from './utils/cache';

export const getCountries = memoize(MyMasjidApi.getCountries);
export const getCities = memoize(MyMasjidApi.getCities);
export const getMosques = memoize(MyMasjidApi.getMosques, (countryId, cityId) => `${countryId}:${cityId}`);

export const getTimings = memoize(MyMasjidApi.getTimings);

export async function getHijriDate(countryId: number): Promise<HijriDate> {
  const cacheKey = `api::hijri-date::${countryId}`;
  const cachedDate = LocalStorageCache.get<HijriDateAnchor>(cacheKey);

  const currentDayOfYear = getDayOfYear(new Date());
  if (cachedDate != null) {
    const { hijriDate, gregorianDayOfYear } = cachedDate;
    const daysDiff = currentDayOfYear - gregorianDayOfYear;
    hijriDate.day += daysDiff;

    if (daysDiff >= 0 && hijriDate.day <= 29) return hijriDate;
  }

  const hijriDate = await OwnApi.getHijriDate(countryId)!;
  const dateAnchor: HijriDateAnchor = { hijriDate, gregorianDayOfYear: currentDayOfYear };
  LocalStorageCache.set(cacheKey, dateAnchor);

  return hijriDate;
}
