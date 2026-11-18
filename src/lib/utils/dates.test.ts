import type { HijriDateAnchor } from '#lib/types/index.ts';
import { describe, expect, test } from 'bun:test';
import { DateTime } from 'luxon';
import { getHijriDateFromAnchor, getHijriMonthFromNumber as getMonth, londonToday, msUntilLondon } from './dates';

describe('Dates utils tests', () => {
  describe('getHijriDateFromAnchor', () => {
    function getAnchor({ month = 0, day = 15, gregorianDate = '2024-01-01' } = {}): HijriDateAnchor {
      return { hijriDate: { day, month: getMonth(month), year: 1446 }, gregorianDate };
    }

    test('Null anchor', () => {
      expect(getHijriDateFromAnchor(null, '2024-01-01')).toBeNil();
    });

    test('End of gregorian year', () => {
      const anchor = getAnchor({ gregorianDate: '2024-12-31' });
      const hijriDate = getHijriDateFromAnchor(anchor, '2025-01-05');

      expect(hijriDate).not.toBeNil();
      expect(hijriDate?.day).toEqual(anchor.hijriDate.day + 5);
    });

    describe('Invalid dates', () => {
      test('Current day is in the past', () => {
        const anchor = getAnchor();
        const hijriDate = getHijriDateFromAnchor(anchor, '1990-01-01');

        expect(hijriDate).toBeNil();
      });

      const invalidDateValues = ['not-a-date', 'not a date', 123, null, undefined];

      test('Invalid saved gregorian date', () => {
        const targetDate = '2024-01-10';

        invalidDateValues.forEach((value) => {
          const anchor = getAnchor();

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          anchor.gregorianDate = value;
          expect(getHijriDateFromAnchor(anchor, targetDate)).toBeNil();
        });
      });

      test('Invalid current gregorian date', () => {
        const anchor = getAnchor();

        invalidDateValues.forEach((value) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          expect(getHijriDateFromAnchor(anchor, value)).toBeNil();
        });
      });
    });

    describe('Middle of hijri month', () => {
      test('To same day', () => {
        const anchor = getAnchor();
        const hijriDate = getHijriDateFromAnchor(anchor, anchor.gregorianDate);

        expect(hijriDate).toEqual(anchor.hijriDate);
      });

      test('To middle of same month', () => {
        const anchor = getAnchor();
        const hijriDate = getHijriDateFromAnchor(anchor, '2024-01-11');

        expect(hijriDate).toEqual({ ...anchor.hijriDate, day: anchor.hijriDate.day + 10 });
      });

      test('To end of same month', () => {
        const anchor = getAnchor();
        const hijriDate = getHijriDateFromAnchor(anchor, '2024-01-16');

        expect(hijriDate).toBeNil();
      });

      test('To next month', () => {
        const anchor = getAnchor();
        const hijriDate = getHijriDateFromAnchor(anchor, '2024-02-01');

        expect(hijriDate).toBeNil();
      });

      test('months jump', () => {
        const anchor = getAnchor();
        const hijriDate = getHijriDateFromAnchor(anchor, '2024-06-01');

        expect(hijriDate).toBeNil();
      });
    });

    describe('End of hijri month', () => {
      test('To same day', () => {
        const anchor = getAnchor({ day: 30 });
        const hijriDate = getHijriDateFromAnchor(anchor, anchor.gregorianDate);

        expect(hijriDate).toEqual(anchor.hijriDate);
      });

      test('To next month', () => {
        const anchor = getAnchor({ day: 30 });
        const hijriDate = getHijriDateFromAnchor(anchor, '2024-01-15');

        expect(hijriDate).toEqual({ ...anchor.hijriDate, month: getMonth(1), day: 14 });
      });

      test('To end of next month', () => {
        const anchor = getAnchor({ day: 30 });

        // Up until 29th is known
        expect(getHijriDateFromAnchor(anchor, '2024-01-30')).toEqual({
          ...anchor.hijriDate,
          month: getMonth(1),
          day: 29,
        });

        // 30 is unknown
        expect(getHijriDateFromAnchor(anchor, '2024-01-31')).toBeNil();
      });

      test('To months jump', () => {
        const anchor = getAnchor({ day: 30 });
        expect(getHijriDateFromAnchor(anchor, '2024-06-01')).toBeNil();
      });

      test('On last day of year', () => {
        const anchor = getAnchor({ day: 30, month: 11 });
        const hijriDate = getHijriDateFromAnchor(anchor, '2024-01-15');

        expect(hijriDate).toEqual({ day: 14, month: getMonth(0), year: anchor.hijriDate.year + 1 });
      });
    });
  });
});

describe('London time helpers', () => {
  const at = (iso: string) => DateTime.fromISO(iso, { zone: 'utc' }) as DateTime<true>;

  test('londonToday follows London, not UTC', () => {
    expect(londonToday(new Date('2026-07-01T23:30:00Z'))).toBe('2026-07-02'); // BST is UTC+1
    expect(londonToday(new Date('2026-12-01T23:30:00Z'))).toBe('2026-12-01');
  });

  test('msUntilLondon rolls over to the next day', () => {
    expect(msUntilLondon(0, 5, at('2026-12-01T00:00:00Z'))).toBe(5 * 60 * 1000);
    expect(msUntilLondon(0, 5, at('2026-12-01T00:05:00Z'))).toBe(24 * 60 * 60 * 1000);
    expect(msUntilLondon(0, 0, at('2026-12-01T23:00:00Z'))).toBe(60 * 60 * 1000);
  });

  test('msUntilLondon handles the clock change', () => {
    // 2026-03-29 has only 23 hours in London
    expect(msUntilLondon(0, 0, at('2026-03-29T00:00:00Z'))).toBe(23 * 60 * 60 * 1000);
  });
});
