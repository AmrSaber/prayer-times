import { Language } from './enums';

import arDict from './dicts/ar';
import enDict from './dicts/en';

export function getTranslator(language: Language) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dictionary: any;

    if (language === Language.EN) {
      dictionary = enDict;
    } else if (language === Language.AR) {
      dictionary = arDict;
    }

  return function t(path: string | null | undefined): string {
    if (path == null) return '';

    const value = path.split('.').reduce((dict, key) => dict[key] ?? {}, dictionary);
    if (typeof value !== 'string') return `[${path}]`;
    return value;
  };
}

