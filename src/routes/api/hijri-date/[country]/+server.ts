import { getCacheStore } from '$lib/server';
import { HIJRI_SOURCES, today } from '$lib/server/hijri';
import type { HijriDateAnchor } from '$lib/types/api.js';
import { getHijriDateFromAnchor } from '$lib/utils/dates.js';
import { json } from '@sveltejs/kit';

export async function GET({ params }) {
  const country = params.country.toLowerCase();

  const source = HIJRI_SOURCES[country];
  if (source == null) {
    return new Response(JSON.stringify({ error: `country ${country} not supported` }), { status: 501 });
  }

  try {
    const cacheStore = await getCacheStore();
    const cacheKey = `api::hijri-date::${country}`;
    const cachedDate = cacheStore.get<HijriDateAnchor>(cacheKey);

    const now = today(source.timeZone);
    const currentDate = now.toISO()!;
    let hijriDate = getHijriDateFromAnchor(cachedDate, currentDate);
    if (hijriDate != null) return json(hijriDate);

    hijriDate = await source.fetch(now.toISODate()!);
    const anchor: HijriDateAnchor = { hijriDate, gregorianDate: currentDate };
    cacheStore.set(cacheKey, anchor);

    return json(hijriDate);
  } catch (err) {
    console.error('error getting hijri date: ' + err);
    return new Response(JSON.stringify({ error: `internal error` }), { status: 503 });
  }
}
