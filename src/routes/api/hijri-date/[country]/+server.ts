import { json } from '@sveltejs/kit';
import * as cheerio from 'cheerio';

export async function GET({ params }) {
	const country = params.country.toLowerCase();

	if (country != 'uk')
		return new Response(JSON.stringify({ error: `country ${country} not supported` }), {
			status: 422
		});

	const moonSightingPage = await fetch('https://www.moonsighting.org.uk');
	const $ = cheerio.load(await moonSightingPage.text());

	const dateParts =
		$('div.topbar.hijridate').text().toLowerCase().trim().split('|').at(1)?.trim().split(' ') ?? [];

	return json({
		day: Number(dateParts[1].replace(/[a-z]+/g, '')),
		month: dateParts[2],
		year: Number(dateParts[3])
	});
}
