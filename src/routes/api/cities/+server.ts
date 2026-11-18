import { ID, param, respond } from '#lib/server/http.ts';
import { getCities } from '#lib/server/providers/index.ts';

export const GET = ({ url }) => {
  const country = Number(param(url, 'country', ID));
  return respond(() => getCities(country), { maxAgeSeconds: 3600 });
};
