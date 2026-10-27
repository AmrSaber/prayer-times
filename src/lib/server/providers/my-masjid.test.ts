import { describe, expect, test } from 'bun:test';
import { toDay, toLocation, type TimingsModel } from './my-masjid';

const model = {
  masjidDetails: { name: 'Masjid Al Ikhlas & Cambridge Islamic Center', city: 'Cambridge', country: 'United Kingdom' },
  masjidSettings: { jumahTime: '13:00' },
  salahTimings: [
    {
      day: 27,
      month: 10,
      fajr: '05:10',
      shouruq: '06:47',
      zuhr: '11:48',
      asr: '14:49',
      maghrib: '16:42',
      isha: '18:05',
      iqamah_Fajr: '06:00',
      iqamah_Zuhr: '13:00',
      iqamah_Asr: '15:30',
      iqamah_Maghrib: '16:42',
      iqamah_Isha: '19:45',
    },
  ],
} as unknown as TimingsModel;

describe('my-masjid provider', () => {
  test('maps a day of the timetable', () => {
    const day = toDay(model, '2026-10-27');

    expect(day.date).toEqual('2026-10-27');
    expect(day.fajr).toEqual({ start: '05:10', congregation: '06:00' });
    expect(day.maghrib).toEqual({ start: '16:42', congregation: '16:42' });
    expect(day.sunrise).toEqual('06:47');
    expect(day.jumah).toEqual('13:00');
  });

  test('throws when the day is missing', () => {
    expect(() => toDay(model, '2026-10-28')).toThrow();
  });

  test('keeps the first mosque name only', () => {
    expect(toLocation(model.masjidDetails)).toEqual({
      title: 'Masjid Al Ikhlas',
      subtitle: 'Cambridge, United Kingdom',
    });
  });
});
