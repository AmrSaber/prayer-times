import type { Selection, TimingsResponse } from '$lib/types';
import { myMasjid } from './my-masjid';
import type { Provider } from './types';

// Order matters: the first provider that matches wins, so keep the catch-all my-masjid last.
const providers: Provider[] = [myMasjid];

export async function getTimings(selection: Selection, date: string): Promise<TimingsResponse> {
  const provider = providers.find((p) => p.matches(selection)) ?? myMasjid;
  const { location, day } = await provider.getTimings(selection, date);

  return { location, day, source: { name: provider.name, url: provider.url } };
}
