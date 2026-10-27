import type { HijriDate, MosqueOption, Selection, TimingsResponse } from './types';
import type { City, Country } from './types/pure';

export const Api = {
  getCountries: () => get<Country[]>('/api/countries'),

  getCities: (countryId: number) => get<City[]>(`/api/cities?country=${countryId}`),

  getMosques: (countryId: number, cityId: number) =>
    get<MosqueOption[]>(`/api/mosques?country=${countryId}&city=${cityId}`),

  getTimings: ({ country, city, mosque }: Selection, date: string) =>
    get<TimingsResponse>(
      `/api/timings?country=${country}&city=${city}${mosque ? `&mosque=${mosque}` : ''}&date=${date}`,
    ),

  getHijriDate: (countryId: number) => get<HijriDate>(`/api/hijri-date/${countryId}`),
};

async function get<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path} responded ${response.status}`);
  return response.json();
}
