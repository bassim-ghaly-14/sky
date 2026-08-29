import API from './api.js';
import UI from './ui.js';
import { CONFIG } from './config.js';

const PLACEHOLDER_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';

class App {
  constructor() {
    this.searchInput = null;
    this.suggestions = null;
    this.debounceTimer = null;

    // Guards against out-of-order debounced search responses (a slow
    // earlier request resolving after a faster later one).
    this.searchSeq = 0;

    // Keyboard navigation state for the suggestions listbox.
    this.activeSuggestionIndex = -1;
    this.currentLocations = [];

    this.init();
  }

  init() {
    // important: initialize UI after DOM is ready
    UI.init();

    if (CONFIG.API_KEY === PLACEHOLDER_KEY) {
      UI.showError(
        'Add your OpenWeatherMap API key in js/config.local.js to use SKY (copy js/config.local.example.js and see the README).'
      );
      // Still bind events so the app becomes usable the moment a real
      // key is added and the page is reloaded — but skip the initial
      // weather fetch, which would only fail with a confusing 401.
      this.bindDom();
      this.bindEvents();
      return;
    }

    this.bindDom();
    this.bindEvents();
    this.loadInitialWeather();
  }

  bindDom() {
    this.searchInput = document.getElementById('search-input');
    this.suggestions = document.getElementById('search-suggestions');
  }

  bindEvents() {
    this.searchInput.addEventListener('input', (e) => {
      clearTimeout(this.debounceTimer);

      const query = e.target.value.trim();

      this.debounceTimer = setTimeout(() => {
        if (query) this.handleSearch(query);
        else this.closeSuggestions();
      }, CONFIG.DEBOUNCE_DELAY);
    });

    this.searchInput.addEventListener('keydown', (e) => this.handleSearchKeydown(e));

    this.suggestions.addEventListener('click', (e) => {
      const item = e.target.closest('.search__suggestion');
      if (!item) return;

      this.selectSuggestion(item);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search')) {
        this.closeSuggestions();
      }
    });
  }

  handleSearchKeydown(e) {
    const count = UI.getSuggestionCount();

    if (e.key === 'Escape') {
      if (!this.suggestions.hidden) {
        e.stopPropagation();
        this.closeSuggestions();
      }
      return;
    }

    if (this.suggestions.hidden || count === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeSuggestionIndex = (this.activeSuggestionIndex + 1) % count;
      UI.highlightSuggestion(this.activeSuggestionIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeSuggestionIndex =
        (this.activeSuggestionIndex - 1 + count) % count;
      UI.highlightSuggestion(this.activeSuggestionIndex);
    } else if (e.key === 'Enter') {
      if (this.activeSuggestionIndex < 0) return;
      e.preventDefault();
      const item = this.suggestions.querySelector(
        `.search__suggestion[data-index="${this.activeSuggestionIndex}"]`
      );
      if (item) this.selectSuggestion(item);
    }
  }

  selectSuggestion(item) {
    this.fetchWeatherByCoords(item.dataset.lat, item.dataset.lon);
    this.searchInput.value = item.textContent.trim();
    this.closeSuggestions();
  }

  closeSuggestions() {
    UI.closeSuggestions();
    this.activeSuggestionIndex = -1;
    this.currentLocations = [];
  }

  async handleSearch(query) {
    const seq = ++this.searchSeq;

    try {
      const locations = await API.searchLocations(query);

      // A newer search has started since this one was sent — ignore
      // this now-stale response instead of overwriting fresher results.
      if (seq !== this.searchSeq) return;

      this.activeSuggestionIndex = -1;
      this.currentLocations = locations;

      if (locations && locations.length) {
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
    } catch (err) {
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
