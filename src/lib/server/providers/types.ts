import type { Day, Location, Selection, Source } from '$lib/types';
import type { City } from '$lib/types/pure';

export type Provider = Source & {
  /** Whether this provider serves the selected location. Providers are tried in order. */
  matches(selection: Selection): boolean;

  /** Cities to list for the countries this provider serves, when my-masjid's catalog is not used. */
  cities?: City[];

  getTimings(selection: Selection, date: string): Promise<{ location: Location; day: Day }>;
};
