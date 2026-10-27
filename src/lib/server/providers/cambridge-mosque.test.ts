import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'fs';
import { parseDay } from './cambridge-mosque';

// Six days from Tuesday 27 October 2026, which includes the Friday
const html = readFileSync(new URL('./fixtures/cambridge-mosque.html', import.meta.url), 'utf8');

describe('cambridge-mosque provider', () => {
  test("parses a normal day with jama'at times", () => {
    const day = parseDay(html, '2026-10-27');

    expect(day.fajr).toEqual({ start: '05:09', congregation: '06:00' });
    expect(day.sunrise).toEqual('06:46');
    expect(day.zuhr).toEqual({ start: '11:48', congregation: '13:00' });
    expect(day.asr).toEqual({ start: '14:50', congregation: '15:30' });
    expect(day.maghrib).toEqual({ start: '16:43', congregation: '16:43' });
    expect(day.isha).toEqual({ start: '18:06', congregation: '20:00' });
  });

  test('takes the first Jumuah time from the banner', () => {
    expect(parseDay(html, '2026-10-27').jumah).toEqual('12:15');
  });

  test("has no Zuhr jama'at on Friday, where the Jumuah replaces it", () => {
    const day = parseDay(html, '2026-10-30');

    expect(day.zuhr.start).toEqual('11:48');
    expect(day.zuhr.congregation).toBeUndefined();
  });

  test('throws for a day the page does not list', () => {
    expect(() => parseDay(html, '2026-12-25')).toThrow();
    expect(() => parseDay(html, '2025-10-27')).toThrow();
  });

  test('throws on a page without timetable', () => {
    expect(() => parseDay('<html></html>', '2026-10-27')).toThrow();
  });

  test('throws when times are out of order', () => {
    const broken = html.replace(
      "<td style='width:15%'>05:09<br>06:00</td>",
      "<td style='width:15%'>09:09<br>06:00</td>",
    );
    expect(() => parseDay(broken, '2026-10-27')).toThrow();
  });
});
