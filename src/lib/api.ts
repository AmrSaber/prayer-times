import type { HijriDate } from './types';
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
import type { CachedMeta } from './utils/cache';

const MY_MASJID_BASE_URL = 'https://time.my-masjid.com/api';

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

export const MyMasjidApi = {
	async getCountries(): Promise<Country[]> {
		const response = await fetch(`${MY_MASJID_BASE_URL}/Country/GetAllCountries`, {
			headers: { 'Content-Type': 'application/json' }
		});

		return await response.json().then((d) => d.model as Country[]);
	},

	async getCities(countryId: number): Promise<City[]> {
		const response = await fetch(
			`${MY_MASJID_BASE_URL}/City/GetCitiesByCountryId?CountryId=${countryId}`,
			{
				headers: { 'Content-Type': 'application/json' }
			}
		);

		return await response.json().then((d) => d.model as City[]);
	},

	async getMosques(countryId: number, cityId: number): Promise<Mosque[]> {
		const response = await fetch(
			`${MY_MASJID_BASE_URL}/Masjid/SearchMasjidByLocation?CountryId=${countryId}&CityId=${cityId}`,
			{ headers: { 'Content-Type': 'application/json' } }
		);

		return await response.json().then((d) => d.model as Mosque[]);
	},

	async getTimings(mosqueId: string): Promise<TimingsModel & CachedMeta> {
		const response = await fetch(
			`${MY_MASJID_BASE_URL}/TimingsInfoScreen/GetMasjidTimings?GuidId=${mosqueId}`,
			{ headers: { 'Content-Type': 'application/json' } }
		);

		return await response.json().then((d) => d.model);
	}
};

export const OwnApi = {
	async getHijriDate(countryId: number): Promise<HijriDate> {
		const response = await fetch(`/api/hijri-date/${countryId}`);
		return await response.json();
	}
};
