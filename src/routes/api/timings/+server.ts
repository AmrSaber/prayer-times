import { GUID, ID, ISO_DATE, param, respond } from '$lib/server/http';
import { getTimings } from '$lib/server/providers';

export const GET = ({ url }) => {
  const selection = {
    country: Number(param(url, 'country', ID)),
    city: Number(param(url, 'city', ID)),
    mosque: param(url, 'mosque', GUID),
  };
  const date = param(url, 'date', ISO_DATE);

  return respond(() => getTimings(selection, date));
};
