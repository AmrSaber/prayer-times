import { Timing } from '../types';
import type { DayTimings } from '../types/pure';

export function getMidnight(dayTimings: DayTimings | null): Timing | null {
	if (dayTimings == null) return null;

	const sunset = dayTimings.sunset.start;
	const fajr = dayTimings.fajr.start;

	const midnight = new Timing();

	midnight.hours = (sunset.hours + fajr.hours + 24) / 2;
	midnight.minutes = (sunset.minutes + fajr.minutes) / 2;

	return midnight.normalize();
}

export function getLastThirdOfNight(dayTimings: DayTimings | null): Timing | null {
	if (dayTimings == null) return null;

	const sunset = dayTimings.sunset.start;
	const fajr = dayTimings.fajr.start;

	const hoursThird = ((fajr.hours + 24 - sunset.hours) % 24) / 3;
	const minutesThird = ((fajr.minutes + 60 - sunset.minutes) % 60) / 3;

	const lastThird = new Timing();
	lastThird.hours = sunset.hours + 2 * hoursThird;
	lastThird.minutes = sunset.minutes + 2 * minutesThird;

	return lastThird.normalize();
}

export function getNextDay(): Date {
	const nextDay = new Date();
	nextDay.setDate(nextDay.getDate() + 1);
	nextDay.setHours(0, 0, 0, 0);

	return nextDay;
}
