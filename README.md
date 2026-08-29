# SKY Weather

A dependency-free, single-page weather app that shows current conditions and a 5-day forecast for any city, powered by the OpenWeatherMap API.

## Overview

SKY is a static front-end weather application built entirely with vanilla HTML, CSS, and JavaScript (ES modules). It loads the current conditions and a five-day outlook for a place — using the browser's current location when permitted, a previously saved city or coordinates on later visits, or a city typed into the search box.

The technical approach is deliberately minimal: a small set of modular ES modules with no framework, no bundler, and no runtime dependencies, plus a single small Vercel serverless function (`api/openweather.js`) that fronts the OpenWeatherMap API so the API key stays server-side. All weather and geocoding data comes from OpenWeatherMap via that proxy. See [API & Configuration](#api--configuration) and [Security Notes](#security-notes) for details.

## Features

- **Current weather** — temperature (°C), condition description, humidity, and wind speed (m/s) for the selected city.
- **5-day forecast** — one entry per day derived from the noon (`12:00:00`) observations of the 3-hour forecast, each with a weekday label, an icon, and a rounded temperature.
- **Geolocation** — on first load, requests the browser location and shows its weather automatically; falls back cleanly when unavailable or denied.
- **City search with autocomplete** — debounced (500 ms) suggestions from the OpenWeatherMap Geocoding API, requiring at least 2 characters.
- **Keyboard-accessible suggestions** — Arrow Up/Down navigate the listbox, Enter selects, and Escape closes it.
- **Persistence & fallback** — remembers the last searched city and last known coordinates in `localStorage`; used when geolocation is denied or unavailable.
- **Loading & error states** — a skeleton placeholder while fetching and clear on-screen messages, including a prompt to add an API key when none is configured and a "city not found" message for bad searches.
- **Responsive layout** — CSS Grid, Flexbox, and media queries for mobile, tablet, and desktop.
- **Original inline SVG weather icons** — no icon font, no external icon requests; condition codes are mapped to icons including day/night variants.
- **Accessibility baseline** — semantic markup, a hidden page heading, ARIA combobox/listbox roles, a driven `aria-activedescendant`, and live status regions (details in [Accessibility](#10-accessibility)).

## Tech Stack

| Technology | Purpose |
| --- | --- |
| HTML5 | Application structure; SEO and Open Graph metadata |
| CSS3 | Styling and layout (CSS Grid + Flexbox), CSS custom properties, glassmorphism via `backdrop-filter`, responsive behavior |
| JavaScript (ES modules) | Application logic, split across separate modules |
| OpenWeatherMap API | Current weather, 5-day/3-hour forecast, and geocoding data |
| Cloudinary | Hosting of the logo, favicon, and social-share image (referenced by URL) |

The project has **no package dependencies, no bundler, and no build step** — there is no `package.json`, and the app runs as plain ES modules.

## How It Works

```
User
  ↓
SKY App (js/app.js)
  ↓
Geolocation  OR  Saved city/coords  OR  City search
  ↓
Vercel serverless proxy (api/openweather.js) → injects OPENWEATHER_API_KEY
  ↓
OpenWeatherMap API
  ↓
Current weather + 5-day forecast
  ↓
Rendering (js/ui.js) → on-screen weather content
```

- **Initialization** — `js/app.js` runs on `DOMContentLoaded`, wires up the search UI, and loads the initial weather. If the configured API key is still the placeholder, the app shows a setup message and skips the initial fetch (which would otherwise fail with a confusing 401) while still binding the search UI.
- **Geolocation flow** — if `navigator.geolocation` is available, the app requests the current position and fetches weather by coordinates. On denial or unavailability it falls back to the hook below.
- **Fallback order** — the last searched city (`localStorage`), then the last known coordinates, then a "Search for a city to get started" prompt.
- **City search flow** — typing at least 2 characters triggers a debounced call to the geocoding endpoint; results populate an autocomplete listbox. Selecting a suggestion fetches weather for that place's coordinates. A stale-response guard ignores out-of-order responses.
- **Forecast retrieval** — the current-weather and 5-day/3-hour forecast endpoints are fetched in parallel (`Promise.all`); the UI keeps only the `12:00:00` entries and shows the first five as the daily outlook.
- **Persistence** — a successful coordinate lookup saves the coordinates, and a successful city search saves the city name, for later visits.
- **UI rendering** — `js/ui.js` updates the current-weather panel and forecast list, toggling between loading, error, and content states.

## Project Structure

```
SKY/
├── .gitignore
├── .env.example
├── README.md
├── index.html
├── api/
│   └── openweather.js      ← Vercel serverless proxy (injects the API key server-side)
├── css/
│   └── style.css
└── js/
    ├── app.js
    ├── api.js
    ├── config.js
    ├── icons.js
    └── ui.js
```

Key files:

- **`index.html`** — application markup, SEO/Open Graph metadata, loading/error/weather states, and the entry `<script type="module" src="./js/app.js">`.
- **`js/app.js`** — bootstrap and orchestration: initializes the UI, debounces and drives the search/autocomplete, handles geolocation, coordinates, and fallback, and fetches + persists weather.
- **`js/api.js`** — thin wrapper around the OpenWeatherMap endpoints (current weather, forecast, geocoding), routed through the serverless proxy, including error mapping for non-OK responses.
- **`js/config.js`** — central configuration (proxy URL, units, language, debounce delay, storage keys).
- **`api/openweather.js`** — Vercel serverless function that proxies OpenWeatherMap requests and injects the API key from the `OPENWEATHER_API_KEY` environment variable; the key never reaches the browser.
- **`js/icons.js`** — original inline SVG weather icons and the mapping from OpenWeatherMap condition codes (plus day/night) to those icons.
- **`js/ui.js`** — DOM rendering: current weather, 5-day forecast, suggestions listbox, and loading/error states.
- **`css/style.css`** — all styling: design tokens, glassmorphism surfaces, grid/flex layout, and responsive media queries.

## API & Configuration

SKY uses OpenWeatherMap and requires an account with an API key. It calls three endpoints:

| Endpoint | Base URL | Purpose |
| --- | --- | --- |
| Current weather | `https://api.openweathermap.org/data/2.5/weather` | Current conditions (temperature, description, humidity, wind) |
| 5-day / 3-hour forecast | `https://api.openweathermap.org/data/2.5/forecast` | 3-hourly forecast, reduced to daily entries by the UI |
| Geocoding | `https://api.openweathermap.org/geo/1.0/direct` | City search suggestions (`limit=5`) |

The application also passes `units=metric` (Celsius) and `lang=en` on weather and forecast requests.

The API key handling is environment-aware, with the decision isolated in `js/config.js` and `js/api.js`:

- **Vercel (production):** the key is **not** stored in the frontend at all. `js/api.js` calls the small Vercel serverless function (`api/openweather.js`), which reads the key from the `OPENWEATHER_API_KEY` environment variable, appends it as the `appid` parameter server-side, and relays the response. The browser never sees the key and never requests `js/config.local.js`.
- **Local static-server development** (VS Code Live Server, `python3 -m http.server`, etc.): there is no serverless runtime, so on `localhost`/`127.0.0.1` the app calls OpenWeatherMap directly using the key from the gitignored `js/config.local.js`. **A client-side key is not secret** — it is visible to anyone inspecting network requests in the browser; this only keeps it out of source control.

**Vercel setup:** in your Vercel project, set an environment variable `OPENWEATHER_API_KEY` (Production, Preview, and Development scopes) to your OpenWeatherMap key, then redeploy. No other configuration is needed — Vercel auto-detects the `api/` directory and serves the project as a static site plus serverless function.

> **Note:** OpenWeatherMap rejects requests to `api.openweathermap.org` without a key, and the proxy forwards the upstream HTTP status, so a missing or invalid key surfaces as an on-screen `API Error: 401` rather than a silent failure.

## Getting Started

### Clone

```shell
git clone https://github.com/bassim-ghaly-14/sky.git
cd sky
```

### Configuration

Two setup paths, matching the two run modes below:

**Local static-server development** (VS Code Live Server, etc.) uses a local key file:

```shell
cp js/config.local.example.js js/config.local.js
```

Then edit `js/config.local.js` and replace the placeholder with your OpenWeatherMap API key. `js/config.local.js` is listed in `.gitignore` and must never be committed. Note that this key is shipped to the browser and is therefore **not secret** (visible in network requests).

**Vercel CLI development and production** use an environment variable instead:

```shell
cp .env.example .env
```

Edit `.env` with your key (gitignored, never commit it), and set the same `OPENWEATHER_API_KEY` variable in your Vercel project's environment settings (see [API & Configuration](#api--configuration)). With this workflow no key ever reaches the browser.

### Run

**Option A — simple static server (frontend work):** VS Code Live Server, or:

```shell
python3 -m http.server
# or
npx serve .
```

Requires `js/config.local.js` (see Configuration above). Requests go directly to OpenWeatherMap — no serverless function is involved. If the file is missing, the app boots but API calls fail.

**Option B — Vercel CLI (tests the serverless proxy locally):**

```shell
npx vercel dev
```

Loads `.env` and runs the `api/openweather.js` function locally, mirroring production. Requires `.env` (see Configuration above). On the printed local URL (e.g. `http://localhost:3000`) the app detects localhost and — if `js/config.local.js` exists — will use it directly; remove that file if you want to exercise the proxy path locally.

Serving the app from a non-localhost origin without the serverless function is not supported: `/api/openweather` only exists under Vercel (or `vercel dev`).

## Browser / Compatibility Notes

The implementation relies on modern browser APIs and requires a browser that supports them:

- **ES modules** — the app is loaded as an ES module and must be served over HTTP.
- **Geolocation** — used for first-load location; the app falls back cleanly when unsupported or denied (Geolocation also requires a secure context such as `https` or `localhost`).
- **`localStorage`** — persistence of the last city and coordinates.
- **`fetch`** — all API calls.
- **CSS `backdrop-filter`** (with `-webkit-` prefix) and CSS custom properties — used for the glass/translucent surfaces; browsers without support fall back to the solid background colors.

No Internet Explorer or older-browser support is provided, and no compatibility polyfills are included.

## Accessibility

Accessibility work present in the code:

- A visually hidden page heading (`<h1 class="sr-only">SKY Weather</h1>`).
- Semantic landmarks (`<header>`, `<main>`, `<section>`), a labeled search input, and `aria-hidden="true"` on decorative weather icons.
- A search input with `role="combobox"`, `aria-expanded`, `aria-controls`, and `aria-autocomplete="list"`, wired to a `role="listbox"` of `role="option"` items.
- Keyboard navigation in the listbox — Arrow Up/Down move the highlight, driven through `aria-activedescendant`; Enter selects; Escape closes.
- Loading and error states use `role="status"` with `aria-live="polite"` so screen readers announce them.
- User-provided values (suggestion labels and messages) are HTML-escaped before insertion.

The UI is largely keyboard-operable and screen-reader-aware, but it has **not** been formally audited against WCAG and no automated accessibility tooling runs in the project.

## Performance

The code makes several concrete performance choices:

- **No runtime dependencies and no build pipeline** — the app ships as plain ES modules.
- **Debounced, guarded geocoding search** — a 500 ms debounce plus a stale-response guard avoids redundant and out-of-order API calls.
- **Original inline SVG icons** — small local SVGs that inherit their color via `currentColor`; no icon font and no third-party icon network requests.
- **Logo, favicon, and social-share imagery hosted on Cloudinary** — the rest of the UI is CSS/SVG only.
- **Single stylesheet** — one CSS file with no external framework.

## Security Notes

- The API key is **never** sent to the browser. All OpenWeatherMap requests go through the `api/openweather.js` serverless function, which reads the key from the `OPENWEATHER_API_KEY` environment variable and injects it server-side.
- The key is provided via environment variables: `OPENWEATHER_API_KEY` in Vercel for production, and a gitignored `.env` file for local development (`npx vercel dev`). `.env` is listed in `.gitignore`.
- `js/config.local.js` is also still listed in `.gitignore`. **Important:** any API key previously committed to Git (the old `js/config.local.js`) remains in Git history indefinitely and must be treated as compromised — rotate it on the OpenWeatherMap dashboard, and run `git rm --cached js/config.local.js` if it is still tracked locally.
- The proxy allowlists only the three OpenWeatherMap paths the app uses (`data/2.5/weather`, `data/2.5/forecast`, `geo/1.0/direct`) and only known query parameters, so it cannot be abused as a general open proxy.
- Even with the key server-side, the OpenWeatherMap API usage itself is visible to users (they can see requests to your proxy endpoint). Restrict and monitor the key on the OpenWeatherMap dashboard (rate limits) as additional protection.

## Testing / Verification

The repository contains **no automated test suite** — no unit, integration, or browser tests, and no validation or lint scripts (there is no `package.json`). The app has not been audited with Lighthouse or similar tools within this project. Verification so far is manual browser testing.

## Known Limitations

- Proxy endpoint adds a small amount of latency compared to direct OpenWeatherMap calls.
- Dependency on OpenWeatherMap service availability and free-tier rate limits.
- Reliance on browser geolocation permission and a secure context; denied/unsupported access degrades to saved city/coords or a search prompt.
- No build tooling, so there is no server-side templating or offline packaging.
- No automated browser/unit test suite.
- Any API key previously committed to Git history (the old `js/config.local.js`) must be rotated.

## Future Improvements

These are aspirational ideas, clearly distinct from what is implemented today:

- Dark/light theme toggle.
- Unit switching between Celsius and Fahrenheit.
- Historic trend charts (e.g., with Chart.js).
- PWA support for offline use.
- An automated unit-test suite.

## License

No license has been specified yet.