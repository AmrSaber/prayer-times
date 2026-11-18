import type { Day, Location, Selection, Source } from '#lib/types/index.ts';
import type { City } from '#lib/types/pure.ts';

export type Provider = Source & {
  /** Whether this provider serves the selected location. Providers are tried in order. */
  matches(selection: Selection): boolean;

  /** Whether the daily job fetches this provider's data right after the cache resets, so the first visitor isn't slow. */
  prefetch?: boolean;

  /** Load the data that `prefetch` warms for `date` (`YYYY-MM-DD`). */
  refresh?(date: string): Promise<void>;

  /** Cities to list for the countries this provider serves, when my-masjid's catalog is not used. */
  cities?: City[];

  getTimings(selection: Selection, date: string): Promise<{ location: Location; day: Day }>;
};
