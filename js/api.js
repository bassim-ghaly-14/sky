import { CONFIG } from './config.js';

class WeatherAPI {
  constructor() {
    this.apiKey = CONFIG.API_KEY;
    this.baseUrl = CONFIG.BASE_URL;
    this.geoUrl = CONFIG.GEO_URL;
  }

  async _fetch(url) {
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
    if (!query || query.length < 2) return [];

    const url = `${this.geoUrl}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${this.apiKey}`;
    return this._fetch(url);
  }

  async getCurrentWeatherByCity(city) {
    const url = `${this.baseUrl}/weather?q=${encodeURIComponent(city)}&units=${CONFIG.UNITS}&lang=${CONFIG.LANG}&appid=${this.apiKey}`;
    return this._fetch(url);
  }

  async getCurrentWeatherByCoords(lat, lon) {
    const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&units=${CONFIG.UNITS}&lang=${CONFIG.LANG}&appid=${this.apiKey}`;
    return this._fetch(url);
  }

  async getForecastByCoords(lat, lon) {
    const url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&units=${CONFIG.UNITS}&lang=${CONFIG.LANG}&appid=${this.apiKey}`;
    return this._fetch(url);
  }
}

export default new WeatherAPI();