// Central config for the SKY app.
//
// The API key itself lives in js/config.local.js (gitignored — see
// js/config.local.example.js and the README "Getting Started" section
// for setup instructions). It is NOT hardcoded here so it can't be
// accidentally committed again.
//
// Note: a frontend-only app has no way to keep an API key truly secret —
// anything shipped to the browser is visible in the network tab to
// anyone who looks. Keeping it out of source control avoids it living
// permanently in git history, but for real production use it should
// also be restricted on the OpenWeatherMap dashboard (HTTP referrer
// and/or rate limits).
import { API_KEY } from './config.local.js';

export const CONFIG = {
  API_KEY,

  // Base URLs for OpenWeatherMap APIs
  BASE_URL: 'https://api.openweathermap.org/data/2.5',
  GEO_URL: 'https://api.openweathermap.org/geo/1.0',

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
