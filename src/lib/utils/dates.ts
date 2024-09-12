import { HIJRI_MONTHS } from '$lib/constants';
import type { HijriDate, HijriDateAnchor, Nullable } from '$lib/types';
import { DateTime, Interval } from 'luxon';
import { assert } from './polyfills';

export const DAY_MS = 24 * 60 * 60 * 1000;

export function getDaysDiff(d1: Date, d2: Date): number {
  const diffTime = Math.abs(d2.valueOf() - d1.valueOf());
  return Math.ceil(diffTime / (24 * 60 * 60 * 1000));
}

export function getHijriMonthNumber(month: string): number {
  assert(HIJRI_MONTHS.includes(month), `Invalid Hijri month "${month}"`);
  return HIJRI_MONTHS.indexOf(month);
}

export function getHijriMonthFromNumber(order: number): string {
  assert(Number.isInteger(order) && order < 12 && order >= 0, `Invalid month number "${order}"`);
  return HIJRI_MONTHS[order];
}

export function getHijriDateFromAnchor(
  anchor: Nullable<HijriDateAnchor>,
  currentGregorianIsoDate: string,
): Nullable<HijriDate> {
  if (anchor == null) return null;
  const { hijriDate, gregorianDate: savedGregorianIsoDate } = JSON.parse(JSON.stringify(anchor)) as HijriDateAnchor;

  // Assert valid hijri date
  assert(Number.isInteger(hijriDate.year), `Invalid hijri year ${hijriDate.year}`);
  assert(HIJRI_MONTHS.includes(hijriDate.month), `Invalid hijri month ${hijriDate.month}`);
  assert(
    Number.isInteger(hijriDate.day) && hijriDate.day <= 30 && hijriDate.day > 0,
    `Invalid hijri day ${hijriDate.day}`,
  );

  const savedGregorianDate = DateTime.fromISO(savedGregorianIsoDate).startOf('day');
  const currentGregorianDate = DateTime.fromISO(currentGregorianIsoDate).startOf('day');
  if (!savedGregorianDate.isValid || !currentGregorianDate.isValid) return null;

  const interval = Interval.fromDateTimes(savedGregorianDate, currentGregorianDate);
  if (!interval.isValid) return null;

  const daysDiff = interval.length('days');

  if (hijriDate.day == 30 && daysDiff > 0) {
    hijriDate.day = daysDiff;

    let finalMonthOrder = getHijriMonthNumber(hijriDate.month) + 1;
    if (finalMonthOrder == 12) {
      finalMonthOrder = 0;
      hijriDate.year++;
    }
    hijriDate.month = getHijriMonthFromNumber(finalMonthOrder);
  } else {
    hijriDate.day += daysDiff;
  }

  if (daysDiff == 0 || hijriDate.day < 30) return hijriDate;
  return null;
}
