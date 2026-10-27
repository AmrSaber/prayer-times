import { cached } from '$lib/server/cache';
import { EGYPT_ID, HIJRI_MONTHS } from '$lib/constants';
import type { Day, HijriDate, Selection } from '$lib/types';
import * as cheerio from 'cheerio';
import { DAR_ALIFTA_CITIES } from './dar-alifta-cities';
import type { Provider } from './types';

const BASE_URL = 'https://www.dar-alifta.org/ar/Prayer/GetPrayer';
const DAY_MS = 24 * 60 * 60 * 1000;

// Dar al-Ifta serves one page per city holding the whole month, prints no iqamah and has no Jumuah time.
export const darAlifta: Provider = {
  name: 'dar-alifta.org',
  nameAr: 'دار الإفتاء المصرية',
  url: 'https://www.dar-alifta.org/ar/prayer',

  matches: (selection: Selection) => selection.country === EGYPT_ID,

  cities: DAR_ALIFTA_CITIES.map((city) => ({ id: city.id, name: city.en, nameAr: city.ar, complete: true })),

  async getTimings(selection: Selection, date: string) {
    const city = DAR_ALIFTA_CITIES.find((c) => c.id === selection.city);
    if (city == null) throw new Error(`unknown Egyptian city ${selection.city}`);

    const html = await fetchPage(city.ar, date);

    return {
      location: { title: city.en, titleAr: city.ar, subtitle: 'Egypt', subtitleAr: 'مصر' },
      day: parseDay(html, date),
    };
  },
};

/** Today's Hijri date as printed by Dar al-Ifta; it is the same for every city. */
export async function getDarAliftaHijriDate(date: string): Promise<HijriDate> {
  return parseHijriDate(await fetchPage(DAR_ALIFTA_CITIES[0].ar, date));
}

// The page is cached per city and date so the Hijri date it prints is never stale.
function fetchPage(city: string, date: string): Promise<string> {
  return cached(`dar-alifta::${city}::${date}`, DAY_MS, async () => {
    const response = await fetch(`${BASE_URL}?town=${encodeURIComponent(city)}`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`dar-alifta responded ${response.status}`);
    return response.text();
  });
}

const GREGORIAN_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'ابريل',
  'مايو',
  'يونيو',
  'يوليو',
  'اغسطس',
  'سبتمبر',
  'اكتوبر',
  'نوفمبر',
  'ديسمبر',
];

/** Pick `date` (`YYYY-MM-DD`) out of the month table. Throws when the page does not cover that day. */
export function parseDay(html: string, date: string): Day {
  const [year, month, dayOfMonth] = date.split('-').map(Number);
  const $ = cheerio.load(html);

  for (const row of $('#content tbody tr').toArray()) {
    const cells = $(row)
      .find('td')
      .toArray()
      .map((cell) => $(cell).text());
    if (cells.length !== 7) continue;

    const label = cells[0].match(/(\d+)\s+(\S+)\s+(\d{4})/);
    if (label == null) continue;

    const [, rowDay, rowMonth, rowYear] = label;
    if (Number(rowDay) !== dayOfMonth) continue;

    // The page only covers the current month, so make sure that it is the requested one
    if (GREGORIAN_MONTHS.indexOf(normalize(rowMonth)) + 1 !== month || Number(rowYear) !== year) {
      throw new Error(`dar-alifta page does not cover ${date}`);
    }

    return toDay(date, cells.slice(1));
  }

  throw new Error(`dar-alifta page has no row for ${date}`);
}

// The AM/PM markers on the page are unreliable (Zuhr is printed as PM at 11:39), so the hour is placed by prayer.
function toDay(date: string, [fajr, sunrise, zuhr, asr, maghrib, isha]: string[]): Day {
  const day: Day = {
    date,
    fajr: { start: toTime(fajr, (h) => h) },
    sunrise: toTime(sunrise, (h) => h),
    zuhr: { start: toTime(zuhr, (h) => (h < 10 ? h + 12 : h)) },
    asr: { start: toTime(asr, afternoon) },
    maghrib: { start: toTime(maghrib, afternoon) },
    isha: { start: toTime(isha, afternoon) },
  };

  const inOrder = [day.fajr.start, day.sunrise, day.zuhr.start, day.asr.start, day.maghrib.start, day.isha.start];
  if (inOrder.some((time, i) => i > 0 && time <= inOrder[i - 1])) {
    throw new Error(`dar-alifta times are not in order: ${inOrder.join(', ')}`);
  }

  return day;
}

const afternoon = (hour: number) => (hour < 12 ? hour + 12 : hour);

function toTime(text: string, toHour24: (hour: number) => number): string {
  const match = text.match(/(\d{1,2})\s*:\s*(\d{2})/);
  if (match == null) throw new Error(`unreadable dar-alifta time "${text}"`);

  const [hour, minute] = [toHour24(Number(match[1])), Number(match[2])];
  if (hour > 23 || minute > 59) throw new Error(`invalid dar-alifta time "${text}"`);

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

const HIJRI_MONTH_NAMES = [
  ['محرم'],
  ['صفر'],
  ['ربيع الأول'],
  ['ربيع الآخر', 'ربيع الثاني'],
  ['جمادى الأولى'],
  ['جمادى الآخرة', 'جمادى الثانية'],
  ['رجب'],
  ['شعبان'],
  ['رمضان'],
  ['شوال'],
  ['ذو القعدة', 'ذي القعدة'],
  ['ذو الحجة', 'ذي الحجة'],
].map((names) => names.map(normalize));

/** Read the Hijri date printed in the page header, for example "16 جُمادى الأولى 1448 هـ". */
export function parseHijriDate(html: string): HijriDate {
  const $ = cheerio.load(html);
  const text = $('.headerprayer_today h1')
    .last()
    .text()
    .replace(/\ufeff/g, '');

  const match = text.match(/(\d+)\s+(.+?)\s+(\d{4})\s*هـ/);
  if (match == null) throw new Error(`unreadable dar-alifta hijri date "${text}"`);

  const monthIndex = HIJRI_MONTH_NAMES.findIndex((names) => names.includes(normalize(match[2])));
  if (monthIndex < 0) throw new Error(`unknown hijri month "${match[2]}"`);

  return { day: Number(match[1]), month: HIJRI_MONTHS[monthIndex], year: Number(match[3]) };
}

/** Drop diacritics and fold the Arabic letter variants that the site spells inconsistently. */
function normalize(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}
