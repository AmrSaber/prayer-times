import type { HijriDate } from '$lib/types/api.js';
import { InMemoryCache, type CachedMeta } from '$lib/utils/cache.js';
import { exclude } from '$lib/utils/objects.js';
import { json } from '@sveltejs/kit';
import * as cheerio from 'cheerio';

export async function GET({ params }) {
	const country = params.country.toLowerCase();

	if (country != 'uk') {
		return new Response(JSON.stringify({ error: `country ${country} not supported` }), {
			status: 501
		});
	}

	const cacheKey = `api::hijri-date::${country}`;
	if (InMemoryCache.has(cacheKey)) {
		const date = InMemoryCache.get(cacheKey) as HijriDate & CachedMeta;
		return json(exclude(date, ['expiresAt']));
	}

	const moonSightingPage = await fetch('https://www.moonsighting.org.uk');
	const $ = cheerio.load(await moonSightingPage.text());

	const dateParts =
		$('div.topbar.hijridate').text().toLowerCase().trim().split('|').at(1)?.trim().split(' ') ?? [];

	const date: HijriDate & CachedMeta = {
		day: Number(dateParts[1].replace(/[a-z]+/g, '')),
		month: dateParts[2],
		year: Number(dateParts[3])
	};

	const nextDay = new Date();
	nextDay.setDate(nextDay.getDate() + 1);
	nextDay.setHours(0, 0, 0, 0);

	date.expiresAt = nextDay.valueOf();

	InMemoryCache.set(cacheKey, date);

	return json(exclude(date, ['expiresAt']));
}
