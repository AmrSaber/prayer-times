## Prayer Times

Simple, light-weight svelte website to quickly display prayer times for Cambridge, UK and other places.

### Where the times come from

The server picks one source for the selected location and returns a normalized day. The default source is [my-masjid.com](https://my-masjid.com). These locations use another source:

| Location                   | Source                                                           |
| -------------------------- | ---------------------------------------------------------------- |
| Cambridge Central Mosque   | [cambridgecentralmosque.org](https://cambridgecentralmosque.org) |
| Egypt (by city, no mosque) | [dar-alifta.org](https://www.dar-alifta.org/ar/prayer)           |

If the mosque's own site fails, the app falls back to my-masjid and says so in the footer. Hijri dates come from [moonsighting.org.uk](https://moonsighting.org.uk) (UK) and Dar al-Ifta (Egypt).

To add a source, create a provider in `src/lib/server/providers/` and add it to the list in `providers/index.ts`. Each provider exports a pure `parse` function that is tested against a saved page in `providers/fixtures/`.

App is currently hosted at: [prayer.amrsaber.io](https://prayer.amrsaber.io).

> The code has been rewritten in svelte, old vanilla website code can be found on `old-vanilla` branch.

### Running the project

First of all, make sure to install project's dependencies

```bash
npm install
```

To run the project for development use

```bash
npm run dev
```

To build the project for production, use

```bash
npm run build
```

Then to run the application use

```
node build
```

The pages are static (no SSR), and the node server hosts the API in `src/routes/api` and caches upstream responses in SQLite. The server code uses `bun:sqlite`, so run the dev server with Bun: `bun --bun vite dev`.
