import { GUID, ID, ISO_DATE, param, respond } from '$lib/server/http';
import { getTimings } from '$lib/server/providers';

export const GET = ({ url }) => {
  const selection = {
    country: Number(param(url, 'country', ID)),
    city: Number(param(url, 'city', ID)),
    // Absent for countries whose provider is city-based
    mosque: url.searchParams.has('mosque') ? param(url, 'mosque', GUID) : null,
  };
  const date = param(url, 'date', ISO_DATE);

  return respond(() => getTimings(selection, date));
};
