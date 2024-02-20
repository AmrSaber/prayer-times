import memoize from 'lodash.memoize';
import { MyMasjidApi } from './api';

export const getCountries = memoize(MyMasjidApi.getCountries);
export const getCities = memoize(MyMasjidApi.getCities);
export const getMosques = memoize(
	MyMasjidApi.getMosques,
	(countryId, cityId) => `${countryId}:${cityId}`
);

export const getTimings = memoize(MyMasjidApi.getTimings);
