import { CONFIG, configReady } from './config.js';

// Environment decision lives here and in config.js only:
// - Local static-server development (CONFIG.API_KEY set from the
//   gitignored js/config.local.js): calls OpenWeatherMap directly.
//   Note: a client-side key is visible in browser network requests —
//   it is NOT secret.
// - Vercel (no client key): calls the serverless proxy, which injects
//   the key server-side.
class WeatherAPI {
  constructor() {
    this.proxyUrl = CONFIG.API_PROXY_URL;
    this.owmRoot = CONFIG.BASE_URL;
  }

  _url(path, params) {
    const search = new URLSearchParams(params).toString();

    if (!CONFIG.API_KEY) {
      // Local mode with no usable js/config.local.js: requests would
      // otherwise hit /api/openweather on a static server (404) and the
      // app would look broken. Fail loudly through the existing error UI.
      if (CONFIG.IS_LOCAL_DEV) {
        throw new Error(
          'No local API key found. Copy js/config.local.example.js to js/config.local.js and add your OpenWeatherMap key (see README).'
        );
      }

      return `${this.proxyUrl}?path=${path}&${search}`;
    }

    return `${this.owmRoot}/${path}?${search}&appid=${CONFIG.API_KEY}`;
  }

  async _fetch(url) {
    await configReady;

    const response = await fetch(url);

    if (!response.ok) {
      const msg =
        response.status === 404
          ? 'City not found'
          : `API Error: ${response.status}`;

      throw new Error(msg);
    }

    return response.json();
  }

  async searchLocations(query) {
    await configReady;

    if (!query || query.length < 2) return [];

    const url = this._url('geo/1.0/direct', {
      q: query,
      limit: 5
    });

    return this._fetch(url);
  }

  async getCurrentWeatherByCity(city) {
    await configReady;

    return this._fetch(
      this._url('data/2.5/weather', {
        q: city,
        units: CONFIG.UNITS,
        lang: CONFIG.LANG
      })
    );
  }

  async getForecastByCity(city) {
    await configReady;

    return this._fetch(
      this._url('data/2.5/forecast', {
        q: city,
        units: CONFIG.UNITS,
        lang: CONFIG.LANG
      })
    );
  }

  async getCurrentWeatherByCoords(lat, lon) {
    await configReady;

    return this._fetch(
      this._url('data/2.5/weather', {
        lat,
        lon,
        units: CONFIG.UNITS,
        lang: CONFIG.LANG
      })
    );
  }

  async getForecastByCoords(lat, lon) {
    await configReady;

    return this._fetch(
      this._url('data/2.5/forecast', {
        lat,
        lon,
        units: CONFIG.UNITS,
        lang: CONFIG.LANG
      })
    );
  }
}

export default new WeatherAPI();