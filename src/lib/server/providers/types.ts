import type { Day, Location, Selection, Source } from '$lib/types';

export type Provider = Source & {
  /** Whether this provider serves the selected location. Providers are tried in order. */
  matches(selection: Selection): boolean;

  getTimings(selection: Selection, date: string): Promise<{ location: Location; day: Day }>;
};
