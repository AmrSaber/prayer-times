import { error, json } from '@sveltejs/kit';

export const ID = /^\d+$/;
export const GUID = /^[\w-]{1,64}$/;
export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Read a query parameter, rejecting the request when it is missing or malformed. */
export function param(url: URL, name: string, pattern: RegExp): string {
  const value = url.searchParams.get(name);
  if (value == null || !pattern.test(value)) throw error(400, `invalid ${name}`);
  return value;
}

/** Run `work` and answer with its result as JSON, or with 502 when an upstream fails. */
export async function respond<T>(work: () => Promise<T>, { maxAgeSeconds = 0 } = {}): Promise<Response> {
  try {
    const headers = maxAgeSeconds > 0 ? { 'cache-control': `public, max-age=${maxAgeSeconds}` } : undefined;
    return json(await work(), { headers });
  } catch (err) {
    console.error(err);
    return json({ error: 'upstream unavailable' }, { status: 502 });
  }
}
