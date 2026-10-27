import { EGYPT_ID, EGYPT_TIME_ZONE, UK_ID, UK_TIME_ZONE } from '$lib/constants';
import type { HijriDate } from '$lib/types';
import * as cheerio from 'cheerio';
import { DateTime } from 'luxon';
import { getDarAliftaHijriDate } from './providers/dar-alifta';

type HijriSource = {
  timeZone: string;
  /** Fetch today's Hijri date; `date` is today in the source's time zone (`YYYY-MM-DD`). */
  fetch(date: string): Promise<HijriDate>;
};

// Countries differ on moon sighting, so each one names the authority it follows.
export const HIJRI_SOURCES: Record<string, HijriSource> = {
  [UK_ID]: { timeZone: UK_TIME_ZONE, fetch: scrapeMoonSightingUk },
  [EGYPT_ID]: { timeZone: EGYPT_TIME_ZONE, fetch: getDarAliftaHijriDate },
};

export function today(timeZone: string): DateTime {
  return DateTime.now().setZone(timeZone);
}

async function scrapeMoonSightingUk(): Promise<HijriDate> {
  const moonSightingPage = await fetch('https://www.moonsighting.org.uk');
  const $ = cheerio.load(await moonSightingPage.text());

  const dateParts = $('div.topbar.hijridate').text().toLowerCase().trim().split('|').at(1)?.trim().split(' ') ?? [];

  if (dateParts.length == 0) throw new Error('Date unavailable');

  return {
    day: Number(dateParts[1].replace(/[a-z]+/g, '')),
    month: dateParts[2],
    year: Number(dateParts[3]),
  };
}
