# SKY Weather

A dependency-free, single-page weather app that shows current conditions and a 5-day forecast for any city, powered by the OpenWeatherMap API.

## Overview

SKY is a static front-end weather application built entirely with vanilla HTML, CSS, and JavaScript (ES modules). It loads the current conditions and a five-day outlook for a place — using the browser's current location when permitted, a previously saved city or coordinates on later visits, or a city typed into the search box.

The technical approach is deliberately minimal: a small set of modular ES modules with no framework, no bundler, and no runtime dependencies. All weather and geocoding data comes from OpenWeatherMap. Because there is no backend, the API key lives in a local configuration file that is meant to be gitignored rather than hard-coded in the source. See [API & Configuration](#7-api--configuration) and [Security Notes](#12-security-notes) for the important caveats.

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
OpenWeatherMap API (js/api.js)
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
├── README.md
├── index.html
├── css/
│   └── style.css
└── js/
    ├── app.js
    ├── api.js
    ├── config.js
    ├── config.local.example.js
    ├── config.local.js        ← local config (listed in .gitignore)
    ├── icons.js
    └── ui.js
```

Key files:

- **`index.html`** — application markup, SEO/Open Graph metadata, loading/error/weather states, and the entry `<script type="module" src="./js/app.js">`.
- **`js/app.js`** — bootstrap and orchestration: initializes the UI, debounces and drives the search/autocomplete, handles geolocation, coordinates, and fallback, and fetches + persists weather.
- **`js/api.js`** — thin wrapper around the OpenWeatherMap endpoints (current weather, forecast, geocoding), including error mapping for non-OK responses.
- **`js/config.js`** — central configuration (base URLs, units, language, debounce delay, storage keys); imports the API key from `js/config.local.js`.
- **`js/config.local.example.js`** — template for the local, gitignored key file (see [Getting Started](#8-getting-started)).
- **`js/config.local.js`** — local, keyed configuration file (see [Git tracking note](#12-security-notes)).
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

The API key is **not** hard-coded in the main source. `js/config.js` imports it from `js/config.local.js`, which is listed in `.gitignore`. The setup workflow is:

1. Copy `js/config.local.example.js` to `js/config.local.js`.
2. Replace the placeholder `YOUR_OPENWEATHERMAP_API_KEY` with your own key.

> **Important:** API keys in a client-side application can never be truly secret — a key shipped to the browser is visible to anyone who inspects network requests. Local configuration only keeps it out of source control. The template (`js/config.local.example.js`) ships with a placeholder, but the repository's tracked `js/config.local.js` currently holds a real key value that must be treated as compromised. See [Security Notes](#12-security-notes) for the current tracking situation.

## Getting Started

### Clone

```shell
git clone https://github.com/bassim-ghaly-14/sky.git
cd sky
```

### Configuration

```shell
cp js/config.local.example.js js/config.local.js
```

Then edit `js/config.local.js` and replace the placeholder with your OpenWeatherMap API key.

### Run

This is a static ES-module application, so it must be served over HTTP — the `file://` protocol will not load ES modules correctly. Pick one option:

```shell
# Option A: Python's built-in server
python3 -m http.server

# Option B: Node's tiny static server
npx serve .
```

Then open the printed local URL (for example `http://localhost:8000`) in a browser.

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

- The API key is loaded from a local configuration file (`js/config.local.js`), keeping it out of the main source modules.
- `js/config.local.js` is listed in `.gitignore`, and `.gitignore` is present at the repository root. **However, `config.local.js` is currently still tracked by Git** — a gitignore rule does not untrack a file that was committed earlier. Until it is removed from tracking (`git rm --cached js/config.local.js`), it will keep appearing in the repository, and any key value it currently contains must be treated as compromised and rotated.
- Client-side API keys are still exposed to end users through network requests — local configuration alone does not make a key secret.
- For production, restrict the key in the OpenWeatherMap dashboard (HTTP-referrer allow-list and/or rate limits).
- Any API key previously committed to Git history remains there indefinitely and requires rotation and, if necessary, history cleanup.

No API key value is reproduced in this README.

## Testing / Verification

The repository contains **no automated test suite** — no unit, integration, or browser tests, and no validation or lint scripts (there is no `package.json`). The app has not been audited with Lighthouse or similar tools within this project. Verification so far is manual browser testing.

## Known Limitations

- Client-side API key exposure (no backend to protect it).
- Dependency on OpenWeatherMap service availability and free-tier rate limits.
- Reliance on browser geolocation permission and a secure context; denied/unsupported access degrades to saved city/coords or a search prompt.
- No backend and no build tooling, so there is no server-side templating or offline packaging.
- No automated browser/unit test suite.
- `js/config.local.js` is still tracked by Git despite the `.gitignore` rule, so the intended local-config workflow is not fully in effect until that file is untracked and any committed key is rotated.

## Future Improvements

These are aspirational ideas, clearly distinct from what is implemented today:

- Dark/light theme toggle.
- Unit switching between Celsius and Fahrenheit.
- Historic trend charts (e.g., with Chart.js).
- PWA support for offline use.
- An automated unit-test suite.

## License

No license has been specified yet.