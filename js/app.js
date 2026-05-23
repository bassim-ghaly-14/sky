import API from './api.js';
import UI from './ui.js';
import { CONFIG } from './config.js';

class App {
  constructor() {
    this.searchInput = null;
    this.suggestions = null;
    this.debounceTimer = null;

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
    this.suggestions = document.getElementById('search-suggestions');
  }

  bindEvents() {
    this.searchInput.addEventListener('input', (e) => {
      clearTimeout(this.debounceTimer);

      const query = e.target.value.trim();

      this.debounceTimer = setTimeout(() => {
        if (query) this.handleSearch(query);
        else this.suggestions.hidden = true;
      }, CONFIG.DEBOUNCE_DELAY);
    });

    this.suggestions.addEventListener('click', (e) => {
      const item = e.target.closest('.search__suggestion');
      if (!item) return;

      this.fetchWeatherByCoords(item.dataset.lat, item.dataset.lon);
      this.searchInput.value = item.textContent;
      this.suggestions.hidden = true;
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search')) {
        this.suggestions.hidden = true;
      }
    });
  }

  async handleSearch(query) {
    try {
      const locations = await API.searchLocations(query);
      UI.renderSuggestions(locations);
    } catch (err) {
      console.error(err);
    }
  }

  async loadInitialWeather() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          this.fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        () => this.loadLastCity()
      );
    } else {
      this.loadLastCity();
    }
  }

  loadLastCity() {
    const lastCity = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_CITY);

    if (lastCity) {
      this.fetchWeatherByCity(lastCity);
    } else {
      UI.showError('Search for a city to get started');
    }
  }

  async fetchWeatherByCity(city) {
    UI.showLoading();

    try {
      const data = await API.getCurrentWeatherByCity(city);
      this.displayWeather(data);
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