import { UK_ID } from '$lib/constants.js';
import type { HijriDate } from '$lib/types/api.js';
import { InMemoryCache } from '$lib/utils/cache.js';
import { exclude } from '$lib/utils/objects.js';
import { json } from '@sveltejs/kit';
import * as cheerio from 'cheerio';

export async function GET({ params }) {
  const country = params.country.toLowerCase();

  if (country != String(UK_ID)) {
    return new Response(JSON.stringify({ error: `country ${country} not supported` }), { status: 501 });
  }

  try {
    const ukDate = await fetch('https://worldtimeapi.org/api/timezone/Europe/London').then((d) => d.json());
    const dayOfYear = ukDate.day_of_year as number;

    const cacheKey = `api::hijri-date::${country}`;
    if (InMemoryCache.has(cacheKey)) {
      const date = InMemoryCache.get(cacheKey) as HijriDate;

      if (date.dayOfYear != dayOfYear) {
        InMemoryCache.delete(cacheKey);
      } else {
        return json(exclude(date, ['dayOfYear']));
      }
    }

    const date = await scrapMoonSightingUkHijriDate();
    date.dayOfYear = dayOfYear;

    InMemoryCache.set(cacheKey, date);

    return json(exclude(date, ['dayOfYear']));
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
