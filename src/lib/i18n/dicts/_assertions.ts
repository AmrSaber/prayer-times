import { assert } from '$lib/utils';
import arDict from './ar';
import enDict from './en';

// Assert that languages dictionaries contain same values
{
  const arKeys = new Set(Object.keys(arDict));
  const enKeys = new Set(Object.keys(enDict));

  const dictsUnion = arKeys.union(enKeys);
  const dictsIntersection = arKeys.intersection(enKeys);
  const difference = dictsUnion.difference(dictsIntersection);
  assert(difference.size == 0, `i18n dictionaries have difference [${[...difference].join(', ')}]`);
}
