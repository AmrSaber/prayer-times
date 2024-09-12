import type { HijriDateAnchor } from '$lib/types';
import { describe, expect, test } from 'bun:test';
import { getHijriDateFromAnchor, getHijriMonthFromNumber as getMonth } from './dates';

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
