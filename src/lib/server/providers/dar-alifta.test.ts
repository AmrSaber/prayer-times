import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'fs';
import { parseDay, parseHijriDate } from './dar-alifta';

// Alexandria, October 2026 (Egypt moves its clocks back on the 30th)
const html = readFileSync(new URL('./fixtures/dar-alifta.html', import.meta.url), 'utf8');

describe('dar-alifta provider', () => {
  test('parses a normal day', () => {
    const day = parseDay(html, '2026-10-27');

    expect(day.fajr).toEqual({ start: '05:43' });
    expect(day.sunrise).toEqual('07:12');
    expect(day.zuhr).toEqual({ start: '12:44' });
    expect(day.asr).toEqual({ start: '15:52' });
    expect(day.maghrib).toEqual({ start: '18:16' });
    expect(day.isha).toEqual({ start: '19:35' });
    expect(day.jumah).toBeUndefined();
  });

  test('handles Zuhr printed as PM at 11:44 on the daylight saving day', () => {
    const day = parseDay(html, '2026-10-30');

    expect(day.fajr.start).toEqual('04:45');
    expect(day.zuhr.start).toEqual('11:44');
    expect(day.asr.start).toEqual('14:50');
  });

  test('rejects a date outside the page month', () => {
    expect(() => parseDay(html, '2026-11-02')).toThrow();
    expect(() => parseDay(html, '2025-10-27')).toThrow();
  });

  test('rejects a page without the table', () => {
    expect(() => parseDay('<html></html>', '2026-10-27')).toThrow();
  });

  test('rejects times that are out of order', () => {
    // Break only the 27th's row: its Fajr moves after sunrise
    const broken = html.replace(/(<td>\s*27\s+أكتوبر\s+2026 م<\/td>\s*<td>)05:43/, '$109:43');
    expect(() => parseDay(broken, '2026-10-27')).toThrow();
  });

  test('parses the hijri date', () => {
    expect(parseHijriDate(html)).toEqual({ day: 16, month: 'jumada-i', year: 1448 });
  });

  test('parses every hijri month spelling', () => {
    const page = (month: string) =>
      `<div class="headerprayer_today"><h1>x</h1><h1>\ufeff3 ${month}  1447 هـ</h1></div>`;
    const spellings = [
      'مُحَرَّم',
      'صفر',
      'ربيع الأول',
      'ربيع الآخر',
      'جُمادى الأولى',
      'جُمادى الآخرة',
      'رجب',
      'شعبان',
      'رمضان',
      'شوّال',
      'ذو القعدة',
      'ذو الحجة',
    ];
    const months = spellings.map((s) => parseHijriDate(page(s)).month);

    expect(months).toEqual([
      'muharram',
      'safar',
      'rabi-i',
      'rabi-ii',
      'jumada-i',
      'jumada-ii',
      'rajab',
      "sha'ban",
      'ramadan',
      'shawwal',
      "dhul-qa'dah",
      'dhul-hijjah',
    ]);
  });

  test('rejects an unknown hijri month', () => {
    expect(() => parseHijriDate('<div class="headerprayer_today"><h1>x</h1><h1>3 كذا 1447 هـ</h1></div>')).toThrow();
  });
});
