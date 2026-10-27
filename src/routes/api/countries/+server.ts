import { respond } from '$lib/server/http';
import { getCountries } from '$lib/server/providers/my-masjid';

export const GET = () => respond(getCountries, { maxAgeSeconds: 3600 });
