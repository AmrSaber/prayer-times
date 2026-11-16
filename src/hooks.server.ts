import '$lib/i18n/dicts/_assertions';
import { building } from '$app/environment';
import { refreshPrefetched } from '$lib/server/providers';
import { londonToday, msUntilLondon } from '$lib/utils/dates';

// Run shortly after the caches reset at midnight so the first visitor of the day hits a warm cache.
// FIXME: London time only; follow each provider's own time zone.
function scheduleDailyRefresh() {
  setTimeout(async () => {
    await refreshPrefetched(londonToday());
    scheduleDailyRefresh();
  }, msUntilLondon(0, 5));
}

if (!building) scheduleDailyRefresh();
