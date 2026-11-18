import type { Selection, TimingsResponse } from '#lib/types/index.ts';
import type { City } from '#lib/types/pure.ts';
import { cambridgeMosque } from './cambridge-mosque';
import { darAlifta } from './dar-alifta';
import { getCities as getMyMasjidCities, myMasjid } from './my-masjid';
import type { Provider } from './types';

// Order matters: the first provider that matches wins, so keep the catch-all my-masjid last.
const providers: Provider[] = [darAlifta, cambridgeMosque, myMasjid];

export async function getTimings(selection: Selection, date: string): Promise<TimingsResponse> {
  const provider = providers.find((p) => p.matches(selection)) ?? myMasjid;

  try {
    return await respondWith(provider, selection, date);
  } catch (err) {
    // A mosque's own website can break; its my-masjid listing is the safety net
    if (provider === myMasjid || selection.mosque == null) throw err;

    console.error(`${provider.name} failed, falling back to ${myMasjid.name}:`, err);
    return { ...(await respondWith(myMasjid, selection, date)), fallback: true };
  }
}

async function respondWith(provider: Provider, selection: Selection, date: string): Promise<TimingsResponse> {
  const { location, day } = await provider.getTimings(selection, date);
  return { location, day, source: { name: provider.name, nameAr: provider.nameAr, url: provider.url } };
}

/** Reload the data of every provider that opts into prefetching. One failing provider doesn't stop the others. */
export async function refreshPrefetched(date: string): Promise<void> {
  for (const provider of providers.filter((p) => p.prefetch)) {
    try {
      await provider.refresh?.(date);
    } catch (err) {
      console.error(`refreshing ${provider.name} failed:`, err);
    }
  }
}

/** The cities to list for a country: the owning provider's own list, otherwise my-masjid's. */
export async function getCities(country: number): Promise<City[]> {
  const owner = providers.find((p) => p.cities != null && p.matches({ country, city: 0 }));
  return owner?.cities ?? getMyMasjidCities(country);
}
