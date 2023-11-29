import type {
	City,
	Country,
	IqamahTimings,
	JumahSalahIqamahTiming,
	MasjidDetails,
	MasjidSettings,
	Mosque,
	SalahTiming
} from './types/pure';
import { cacheFunc, cacheFuncAsync } from './utils';
import { InMemoryCache, LocalStorageCache } from './utils/cache';

const BASE_URL = 'https://time.my-masjid.com/api';

// Not currently used, but here for reference
export type Response<T> = {
	error: string;
	hasError: boolean;
	message: string;
	model: T;
};

export type TimingsModel = {
	masjidDetails: MasjidDetails;
	masjidSettings: MasjidSettings;
	salahTimings: SalahTiming[];
	iqamahTimings: IqamahTimings;
	jumahSalahIqamahTimings: JumahSalahIqamahTiming[];
	lastUpdatedAt: string;
};

export async function getCountries(): Promise<Country[]> {
	return cacheFunc(InMemoryCache, 'countries', async function fetchCountries() {
		const response = await fetch(`${BASE_URL}/Country/GetAllCountries`, {
			headers: { 'Content-Type': 'application/json' }
		});

		return await response.json().then((d) => d.model as Country[]);
	});
}

export async function getCities(countryId: number): Promise<City[]> {
	return cacheFunc(InMemoryCache, `countries:${countryId}:cities`, async function fetchCities() {
		const response = await fetch(`${BASE_URL}/City/GetCitiesByCountryId?CountryId=${countryId}`, {
			headers: { 'Content-Type': 'application/json' }
		});

		return await response.json().then((d) => d.model as City[]);
	});
}

export async function getMosques(countryId: number, cityId: number): Promise<Mosque[]> {
	return cacheFunc(
		InMemoryCache,
		`countries:${countryId}:cities:${cityId}:mosques`,
		async function fetchMosques() {
			const response = await fetch(
				`${BASE_URL}/Masjid/SearchMasjidByLocation?CountryId=${countryId}&CityId=${cityId}`,
				{ headers: { 'Content-Type': 'application/json' } }
			);

			return await response.json().then((d) => d.model as Mosque[]);
		}
	);
}

export async function getTimings(mosqueId: string): Promise<TimingsModel> {
	const thisYear = new Date().getFullYear();
	return cacheFuncAsync(
		LocalStorageCache,
		`timings::${thisYear}::${mosqueId}`,
		async function fetchTimings() {
			const response = await fetch(
				`${BASE_URL}/TimingsInfoScreen/GetMasjidTimings?GuidId=${mosqueId}`,
				{ headers: { 'Content-Type': 'application/json' } }
			);

			return await response.json().then((d) => d.model as TimingsModel);
		}
	);
}
