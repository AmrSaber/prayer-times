import { ID, param, respond } from '#lib/server/http.ts';
import { getMosques } from '#lib/server/providers/my-masjid.ts';

export const GET = ({ url }) => {
  const country = Number(param(url, 'country', ID));
  const city = Number(param(url, 'city', ID));
  return respond(() => getMosques(country, city), { maxAgeSeconds: 600 });
};
