// Central config for the SKY app, including the environment decision for
// how OpenWeatherMap is reached:
//
// - Vercel (production): all requests go through the small serverless
//   function in api/openweather.js, which reads the key from the
//   OPENWEATHER_API_KEY environment variable. The browser never sees the
//   key and never requests js/config.local.js.
// - Local development (VS Code Live Server / any static server on
//   localhost): there is no serverless runtime, so the app calls
//   OpenWeatherMap directly using the key from the gitignored
//   js/config.local.js (see js/config.local.example.js). A client-side
//   key is NOT secret — it is visible in browser network requests.
//
// app.js and the UI never need to know which path is in use; the choice
// lives here and in js/api.js only.
const IS_LOCAL_DEV =
  typeof location !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(location.hostname);

// Only loaded when serving locally. On Vercel this file does not exist
// and is never fetched, so production keeps working without it.
//
// NOTE: this deliberately uses a promise (configReady) instead of
// top-level await. Top-level await is newer than ES modules themselves
// (Chrome 89+/Safari 15+) and a module graph containing it fails to
// evaluate AT ALL in older browsers — silently killing app.js before
// it can register any listeners (a "dead page"). import() alone works
// in every ES-module browser, and the API layer simply awaits readiness.
export const CONFIG = {
  // The serverless proxy that fronts the OpenWeatherMap APIs (Vercel).
  API_PROXY_URL: '/api/openweather',

  // OpenWeatherMap root (local static-server development); the full
  // endpoint path (e.g. data/2.5/weather) is appended by js/api.js.
  BASE_URL: 'https://api.openweathermap.org',

  // When truthy, js/api.js calls OpenWeatherMap directly with this key
  // (local development only). When null, requests go through the proxy.
  // Set asynchronously by configReady below (local mode only).
  API_KEY: null,

  IS_LOCAL_DEV,

  // App settings
  UNITS: 'metric', // metric = Celsius, imperial = Fahrenheit
  LANG: 'en',
  DEBOUNCE_DELAY: 500, // ms for search input debounce

  // LocalStorage keys
  STORAGE_KEYS: {
    LAST_CITY: 'sky_last_city',
    LAST_COORDS: 'sky_last_coords'
  }
};

// Resolves once local configuration (if any) has been applied to
// CONFIG.API_KEY. js/api.js awaits this before building request URLs.
export const configReady = IS_LOCAL_DEV
  ? import('./config.local.js')
      .then((m) => {
        CONFIG.API_KEY = m.API_KEY || null;
      })
      .catch(() => {
        // js/config.local.js missing or unreadable — see README setup.
        // CONFIG.API_KEY stays null; js/api.js surfaces a clear setup
        // error instead of leaving the app in a silent proxy mode.
        CONFIG.API_KEY = null;
      })
  : Promise.resolve();
