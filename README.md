## Prayer Times

Simple, light-weight svelte website to quickly display prayer times for Cambridge, UK and other places.

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

The application now uses node server, but serves static files (so no SSR for the any page so far). This enables using APIs later on.
