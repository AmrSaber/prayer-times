import type { Selection, TimingsResponse } from '$lib/types';
import type { City } from '$lib/types/pure';
import { darAlifta } from './dar-alifta';
import { getCities as getMyMasjidCities, myMasjid } from './my-masjid';
import type { Provider } from './types';

// Order matters: the first provider that matches wins, so keep the catch-all my-masjid last.
const providers: Provider[] = [darAlifta, myMasjid];

export async function getTimings(selection: Selection, date: string): Promise<TimingsResponse> {
  const provider = providers.find((p) => p.matches(selection)) ?? myMasjid;
  const { location, day } = await provider.getTimings(selection, date);

  return { location, day, source: { name: provider.name, nameAr: provider.nameAr, url: provider.url } };
}

/** The cities to list for a country: the owning provider's own list, otherwise my-masjid's. */
export async function getCities(country: number): Promise<City[]> {
  const owner = providers.find((p) => p.cities != null && p.matches({ country, city: 0 }));
  return owner?.cities ?? getMyMasjidCities(country);
}
