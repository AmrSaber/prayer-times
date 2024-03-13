export function exclude<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
	const filteredEntries = Object.entries(obj).filter(([k]) => !(keys as string[]).includes(k));
	return Object.fromEntries(filteredEntries) as Omit<T, K>;
}
