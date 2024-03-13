import { Language } from './enums';

import arDict from './dicts/ar';
import enDict from './dicts/en';

export function getTranslator(language: Language) {
	return function t(path: string | null | undefined): string {
		if (path == null) return '';

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let dictionary: any;

		if (language === Language.EN) {
			dictionary = enDict;
		} else if (language === Language.AR) {
			dictionary = arDict;
		}

		return path.split('.').reduce((dict, key) => dict[key], dictionary);
	};
}
