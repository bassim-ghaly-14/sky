import API from './api.js';
import UI from './ui.js';
import { CONFIG } from './config.js';

class App {
  searchInput = null;
  debounceTimer = null;

  // Guards against out-of-order debounced search responses (a slow
  // earlier request resolving after a faster later one).
  searchSeq = 0;

  constructor() {
    this.init();
  }

  init() {
    // important: initialize UI after DOM is ready
    UI.init();

    this.bindDom();
    this.bindEvents();
    this.loadInitialWeather();
  }

  bindDom() {
    this.searchInput = document.getElementById('search-input');
  }

  bindEvents() {
    this.searchInput.addEventListener('input', (e) => {
      clearTimeout(this.debounceTimer);

      const query = e.target.value.trim();

      // If the current value exactly matches a suggestion label, the user
      // picked (or typed) an existing option — resolve it to coordinates
      // and stop, so we don't send a redundant geocoding request for a
      // city we already know.
      const match = UI.getOptionByValue(query);
      if (match) {
        this.selectOption(match);
        return;
      }

      this.debounceTimer = setTimeout(() => {
        if (query) this.handleSearch(query);
        else UI.closeSuggestions();
      }, CONFIG.DEBOUNCE_DELAY);
    });

    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Dismiss the (native) suggestion popup / any status message.
        UI.closeSuggestions();
      }
    });
  }

  selectOption(option) {
    this.fetchWeatherByCoords(option.dataset.lat, option.dataset.lon);
    UI.closeSuggestions();
  }

  async handleSearch(query) {
    const seq = ++this.searchSeq;

    try {
      const locations = await API.searchLocations(query);

      // A newer search has started since this one was sent — ignore
      // this now-stale response instead of overwriting fresher results.
      if (seq !== this.searchSeq) return;

      if (locations?.length) {
        UI.renderSuggestions(locations);
      } else {
        UI.renderSuggestionsMessage('No matching cities found');
      }
    } catch (err) {
      if (seq !== this.searchSeq) return;
      console.error(err);
      UI.renderSuggestionsMessage("Couldn't load suggestions — try again");
    }
  }

  async loadInitialWeather() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          this.fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        () => this.loadFallback()
      );
    } else {
      this.loadFallback();
    }
  }

  /** Used when geolocation is unavailable or denied: last searched city, then last known coords, then a prompt. */
  loadFallback() {
    const lastCity = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_CITY);

    if (lastCity) {
      this.fetchWeatherByCity(lastCity);
      return;
    }

    const lastCoords = this.getLastCoords();

    if (lastCoords) {
      this.fetchWeatherByCoords(lastCoords.lat, lastCoords.lon);
      return;
    }

    UI.showError('Search for a city to get started');
  }

  getLastCoords() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_COORDS);
      return raw ? JSON.parse(raw) : null;
    } catch {
      // Reading or parsing the persisted coordinates can fail (e.g.
      // storage disabled in privacy mode, or corrupt JSON). This is
      // non-critical: returning null simply falls through to the
      // "search for a city" prompt, so the error is intentionally ignored.
      return null;
    }
  }

  async fetchWeatherByCity(city) {
    UI.showLoading();

    try {
      const [current, forecast] = await Promise.all([
        API.getCurrentWeatherByCity(city),
        API.getForecastByCity(city)
      ]);

      this.displayWeather(current, forecast);
      localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_CITY, city);
    } catch (err) {
      UI.showError(err.message);
    }
  }

  async fetchWeatherByCoords(lat, lon) {
    UI.showLoading();

    try {
      const [current, forecast] = await Promise.all([
        API.getCurrentWeatherByCoords(lat, lon),
        API.getForecastByCoords(lat, lon)
      ]);

      this.displayWeather(current, forecast);
      localStorage.setItem(
        CONFIG.STORAGE_KEYS.LAST_COORDS,
        JSON.stringify({ lat, lon })
      );
    } catch (err) {
      UI.showError(err.message);
    }
  }

  displayWeather(current, forecast) {
    UI.renderCurrentWeather(current);

    if (forecast) UI.renderForecast(forecast.list);

    UI.showContent();
  }
}

document.addEventListener('DOMContentLoaded', () => new App());
