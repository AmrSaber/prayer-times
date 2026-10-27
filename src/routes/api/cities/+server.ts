import { ID, param, respond } from '$lib/server/http';
import { getCities } from '$lib/server/providers/my-masjid';

export const GET = ({ url }) => {
  const country = Number(param(url, 'country', ID));
  return respond(() => getCities(country), { maxAgeSeconds: 3600 });
};
