import { respond } from '#lib/server/http.ts';
import { getCountries } from '#lib/server/providers/my-masjid.ts';

export const GET = () => respond(getCountries, { maxAgeSeconds: 3600 });
