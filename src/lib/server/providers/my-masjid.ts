import { cached } from '$lib/server/cache';
import type { Day, Location, MosqueOption, Selection } from '$lib/types';
import type {
  City,
  Country,
  IqamahTimings,
  JumahSalahIqamahTiming,
  MasjidSettings,
  Mosque,
  MosqueDetails,
  SalahTiming,
} from '$lib/types/pure';
import type { Provider } from './types';

const BASE_URL = 'https://time.my-masjid.com/api';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export type TimingsModel = {
  masjidDetails: MosqueDetails;
  masjidSettings: MasjidSettings;
  salahTimings: SalahTiming[];
  iqamahTimings: IqamahTimings;
  jumahSalahIqamahTimings: JumahSalahIqamahTiming[];
  lastUpdatedAt: string;
};

/** The default provider: it serves every mosque listed on my-masjid.com. */
export const myMasjid: Provider = {
  name: 'my-masjid.com',
  url: 'https://my-masjid.com',

  matches: () => true,

  async getTimings(selection: Selection, date: string) {
    if (selection.mosque == null) throw new Error('mosque is required');

    const model = await cached(`my-masjid::timings::${selection.mosque}`, HOUR_MS, () =>
      get<TimingsModel>(`TimingsInfoScreen/GetMasjidTimings?GuidId=${encodeURIComponent(selection.mosque!)}`),
    );

    return { location: toLocation(model.masjidDetails), day: toDay(model, date) };
  },
};

export function getCountries(): Promise<Country[]> {
  return cached('my-masjid::countries', DAY_MS, () => get<Country[]>('Country/GetAllCountries'));
}

export function getCities(countryId: number): Promise<City[]> {
  return cached(`my-masjid::cities::${countryId}`, DAY_MS, () =>
    get<City[]>(`City/GetCitiesByCountryId?CountryId=${countryId}`),
  );
}

export function getMosques(countryId: number, cityId: number): Promise<MosqueOption[]> {
  return cached(`my-masjid::mosques::${countryId}::${cityId}`, HOUR_MS, async () => {
    const mosques = await get<Mosque[]>(`Masjid/SearchMasjidByLocation?CountryId=${countryId}&CityId=${cityId}`);
    return mosques.map((mosque) => ({ id: mosque.guidId, name: mosque.name }));
  });
}

export function toLocation(details: MosqueDetails): Location {
  return {
    title: details.name.split('&').at(0)!.trim(),
    subtitle: `${details.city}, ${details.country}`,
  };
}

/** Pick one day (`YYYY-MM-DD`) out of the year-long my-masjid timetable. */
export function toDay(model: TimingsModel, date: string): Day {
  const [, month, day] = date.split('-').map(Number);

  const timing = model.salahTimings.find((t) => t.day == day && t.month == month);
  if (timing == null) throw new Error(`no timings for ${date}`);

  return {
    date,
    fajr: { start: timing.fajr, congregation: timing.iqamah_Fajr },
    sunrise: timing.shouruq,
    zuhr: { start: timing.zuhr, congregation: timing.iqamah_Zuhr },
    asr: { start: timing.asr, congregation: timing.iqamah_Asr },
    maghrib: { start: timing.maghrib, congregation: timing.iqamah_Maghrib },
    isha: { start: timing.isha, congregation: timing.iqamah_Isha },
    jumah: model.masjidSettings.jumahTime,
  };
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}/${path}`, { headers: { 'Content-Type': 'application/json' } });
  if (!response.ok) throw new Error(`my-masjid ${path} responded ${response.status}`);

  const body = await response.json();
  if (body.model == null) throw new Error(`my-masjid ${path} returned no model`);
  return body.model as T;
}
