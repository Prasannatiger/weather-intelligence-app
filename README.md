# Weather Intelligence App

A deployable Weather Intelligence App using the Open-Meteo Geocoding and Forecast APIs. This repository is configured for a Vite build and Cloudflare Pages deployment.

## App Features

- Search cities via Open-Meteo geocoding.
- Fetch current weather and 7-day forecast.
- Show weather condition summaries and forecast cards.
- Display planning recommendations.
- Handle invalid city searches and API errors gracefully.

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the local URL shown by Vite.

## Build

```bash
npm run build
```

The production output is generated into `dist/`.

## Cloudflare Pages Deployment

Use the following build configuration in Cloudflare Pages:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

### Recommended Cloudflare Pages setup

1. Connect Cloudflare Pages to this GitHub repository.
2. Configure the build settings above.
3. Deploy and verify the generated `pages.dev` URL.

## Testing the App

Validate the deployed app by performing:

- At least two valid city searches, for example `London` and `Tokyo`.
- One invalid search, for example `NotACityXYZ`, to confirm the error state.

## Notes for Submission

- Confirm the GitHub repository is connected directly from Google AI Studio App Build.
- Confirm the Cloudflare Pages site is linked to the repository and uses `npm run build` / `dist`.
- Capture deployment logs, Pages URL, and evidence screenshots.
- Do not include private API keys; the app uses only public Open-Meteo endpoints.
