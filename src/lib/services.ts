import memoize from 'lodash.memoize';
import { MyMasjidApi, OwnApi } from './api';
import type { HijriDate } from './types';
import { getNextDay } from './utils';
import { LocalStorageCache, type CachedMeta } from './utils/cache';

export const getCountries = memoize(MyMasjidApi.getCountries);
export const getCities = memoize(MyMasjidApi.getCities);
export const getMosques = memoize(MyMasjidApi.getMosques, (countryId, cityId) => `${countryId}:${cityId}`);

export const getTimings = memoize(MyMasjidApi.getTimings);

export async function getHijriDate(countryId: number): Promise<HijriDate> {
  const cacheKey = `api::hijri-date::${countryId}`;
  if (!LocalStorageCache.has(cacheKey)) {
    const date = (await OwnApi.getHijriDate(countryId)) as HijriDate & CachedMeta;
    date.expiresAt = getNextDay().valueOf();

    LocalStorageCache.set(cacheKey, date);
  }

  return LocalStorageCache.get(cacheKey) as HijriDate;
}
