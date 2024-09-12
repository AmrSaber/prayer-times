import { UK_ID, UK_TIME_ZONE } from '$lib/constants.js';
import { getCacheStore } from '$lib/server';
import type { HijriDate, HijriDateAnchor } from '$lib/types/api.js';
import { getHijriDateFromAnchor } from '$lib/utils/dates.js';
import { json } from '@sveltejs/kit';
import * as cheerio from 'cheerio';
import { DateTime } from 'luxon';

export async function GET({ params }) {
  const country = params.country.toLowerCase();

  if (country != String(UK_ID)) {
    return new Response(JSON.stringify({ error: `country ${country} not supported` }), { status: 501 });
  }

  try {
    const cacheStore = await getCacheStore();
    const cacheKey = `api::hijri-date::${country}`;
    const cachedDate = cacheStore.get<HijriDateAnchor>(cacheKey);

    const currentDate = DateTime.now().setZone(UK_TIME_ZONE).toISO()!;
    let hijriDate = getHijriDateFromAnchor(cachedDate, currentDate);
    if (hijriDate != null) return json(hijriDate);

    hijriDate = await scrapMoonSightingUkHijriDate();
    const anchor: HijriDateAnchor = { hijriDate, gregorianDate: currentDate };
    cacheStore.set(cacheKey, anchor);

    return json(hijriDate);
  } catch (err) {
    console.error('error getting hijri date: ' + err);
    return new Response(JSON.stringify({ error: `internal error` }), { status: 503 });
  }
}

async function scrapMoonSightingUkHijriDate(): Promise<HijriDate> {
  const moonSightingPage = await fetch('https://www.moonsighting.org.uk');
  const $ = cheerio.load(await moonSightingPage.text());

  const dateParts = $('div.topbar.hijridate').text().toLowerCase().trim().split('|').at(1)?.trim().split(' ') ?? [];

  if (dateParts.length == 0) throw new Error('Date unavailable');

  const date: HijriDate = {
    day: Number(dateParts[1].replace(/[a-z]+/g, '')),
    month: dateParts[2],
    year: Number(dateParts[3]),
  };

  return date;
}
