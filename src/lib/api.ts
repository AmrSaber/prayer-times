import type {
	IqamahTimings,
	JumahSalahIqamahTiming,
	MasjidDetails,
	MasjidSettings,
	Mosque,
	SalahTiming
} from './types/pure';

const BASE_URL = 'https://time.my-masjid.com/api';

const UK_ID = '53';
const CAMBRIDGE_ID = '20245';

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

// In-memory cache
const cache: Record<string, unknown> = {};

export async function fetchMosques(): Promise<Mosque[]> {
	const cacheKey = 'mosques';
	if (cache[cacheKey] == null) {
		const response = await fetch(
			`${BASE_URL}/Masjid/SearchMasjidByLocation?CountryId=${UK_ID}&CityId=${CAMBRIDGE_ID}`,
			{ headers: { 'Content-Type': 'application/json' } }
		);

		cache[cacheKey] = await response.json().then((d) => d.model as Mosque[]);
	}

	return cache[cacheKey] as Mosque[];
}

export async function fetchTimings(mosqueId: string): Promise<TimingsModel> {
	const thisYear = new Date().getFullYear();
	const cacheKey = `timings::${thisYear}::${mosqueId}`;

	if (localStorage.getItem(cacheKey) == null) {
		const response = await fetch(
			`${BASE_URL}/TimingsInfoScreen/GetMasjidTimings?GuidId=${mosqueId}`
		);

		const data = await response.json().then((d) => d.model as TimingsModel);

		localStorage.setItem(cacheKey, JSON.stringify(data));
	}

	return JSON.parse(localStorage.getItem(cacheKey)!);
}
