import { CAMBRIDGE_CENTRAL_MOSQUE_ID } from '$lib/constants';
import { cached } from '$lib/server/cache';
import type { Day, Selection } from '$lib/types';
import * as cheerio from 'cheerio';
import type { Provider } from './types';

const PAGE_URL = 'https://cambridgecentralmosque.org/prayer-times';
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

// The mosque publishes its own timetable, which often differs from the one on my-masjid.
export const cambridgeMosque: Provider = {
  name: 'cambridgecentralmosque.org',
  url: PAGE_URL,

  matches: (selection: Selection) => selection.mosque === CAMBRIDGE_CENTRAL_MOSQUE_ID,

  async getTimings(_selection: Selection, date: string) {
    const html = await cached(`cambridge-mosque::${date}`, SIX_HOURS_MS, async () => {
      const response = await fetch(PAGE_URL, { signal: AbortSignal.timeout(10_000) });
      if (!response.ok) throw new Error(`cambridge-mosque responded ${response.status}`);
      return response.text();
    });

    return {
      location: {
        title: 'Cambridge Central Mosque',
        titleAr: 'مسجد كامبريدج المركزي',
        subtitle: 'Cambridge, United Kingdom',
        subtitleAr: 'كامبريدج، المملكة المتحدة',
      },
      day: parseDay(html, date),
    };
  },
};

/** Pick `date` (`YYYY-MM-DD`) out of the page, which lists today and the days after it. Throws when it is missing. */
export function parseDay(html: string, date: string): Day {
  const [year, month, dayOfMonth] = date.split('-');
  const pageDate = `${dayOfMonth}-${month}-${year}`;
  const $ = cheerio.load(html);

  for (const table of $('table').toArray()) {
    const heading = $(table).find('td[colspan="7"]').first().text();
    if (!heading.includes(pageDate)) continue;

    // Cells are: label, fajr, sunrise, zuhr, asr, maghrib, isha. Each prayer holds "begins" then "jama'at".
    const cells = $(table).find('tr').last().find('td').toArray().slice(1);
    if (cells.length !== 6) throw new Error(`cambridge-mosque row for ${date} has ${cells.length} cells`);

    const [fajr, sunrise, zuhr, asr, maghrib, isha] = cells.map(
      (cell) =>
        $(cell)
          .text()
          .match(/\d{2}:\d{2}/g) ?? [],
    );
    if (sunrise.length !== 1) throw new Error(`cambridge-mosque sunrise for ${date} is unreadable`);

    const prayer = ([start, congregation]: string[]) => {
      if (start == null) throw new Error(`cambridge-mosque is missing a prayer time for ${date}`);
      return { start, congregation };
    };

    const day: Day = {
      date,
      fajr: prayer(fajr),
      sunrise: sunrise[0],
      zuhr: prayer(zuhr),
      asr: prayer(asr),
      maghrib: prayer(maghrib),
      isha: prayer(isha),
      jumah: parseJumah(html),
    };

    assertInOrder(day);
    return day;
  }

  throw new Error(`cambridge-mosque page has no row for ${date}`);
}

/** The banner reads "JUM'A 12:15 & 13:00"; only the first Jumuah counts. */
function parseJumah(html: string): string | undefined {
  return html.match(/JUM['’]A\s+(\d{1,2}:\d{2})/)?.[1]?.padStart(5, '0');
}

function assertInOrder(day: Day) {
  const times = [day.fajr.start, day.sunrise, day.zuhr.start, day.asr.start, day.maghrib.start, day.isha.start];
  if (times.some((time, i) => i > 0 && time <= times[i - 1])) {
    throw new Error(`cambridge-mosque times are not in order: ${times.join(', ')}`);
  }
}
