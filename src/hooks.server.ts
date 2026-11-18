import '#lib/i18n/dicts/_assertions.ts';
import { building } from '$app/env';
import { refreshPrefetched } from '#lib/server/providers/index.ts';
import { londonToday, msUntilLondon } from '#lib/utils/dates.ts';

// Run shortly after the caches reset at midnight so the first visitor of the day hits a warm cache.
// FIXME: London time only; follow each provider's own time zone.
function scheduleDailyRefresh() {
  setTimeout(
    async () => {
      await refreshPrefetched(londonToday());
      scheduleDailyRefresh();
    },
    msUntilLondon(0, 5),
  );
}

if (!building) scheduleDailyRefresh();
