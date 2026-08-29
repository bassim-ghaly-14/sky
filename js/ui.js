import { CONFIG } from './config.js';
import { getWeatherIconMarkup } from './icons.js';

/** Escapes a string for safe insertion into innerHTML. */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str ?? '');
  return div.innerHTML;
}

class UI {
  constructor() {
    this.elements = {};

    this.initElements();
  }

  init() {
    this.initElements();
  }

  initElements() {
    this.elements = {
      loading: document.getElementById('loading'),
      error: document.getElementById('error'),
      errorMessage: document.querySelector('.state__message'),
      content: document.getElementById('weather-content'),
      suggestions: document.getElementById('search-suggestions'),
      searchInput: document.getElementById('search-input'),

      locationName: document.getElementById('location-name'),
      locationDate: document.getElementById('location-date'),
      weatherIcon: document.getElementById('weather-icon'),
      tempValue: document.getElementById('temp-value'),
      tempUnit: document.getElementById('temp-unit'),
      weatherDescription: document.getElementById('weather-description'),
      humidityValue: document.getElementById('humidity-value'),
      windValue: document.getElementById('wind-value'),
      forecastList: document.getElementById('forecast-list')
    };
  }

  showLoading() {
    this.hideAll();
    this.elements.loading.hidden = false;
  }

  showError(message) {
    this.hideAll();
    this.elements.error.hidden = false;
    this.elements.errorMessage.textContent = message;
  }

  showContent() {
    this.hideAll();
    this.elements.content.hidden = false;
  }

  hideAll() {
    if (this.elements.loading) this.elements.loading.hidden = true;
    if (this.elements.error) this.elements.error.hidden = true;
    if (this.elements.content) this.elements.content.hidden = true;
  }

  /** Degree symbol matching CONFIG.UNITS, so it can't drift out of sync with the numbers shown. */
  getUnitSymbol() {
    return CONFIG.UNITS === 'imperial' ? '°F' : '°C';
  }

  formatTemp(value) {
    return `${Math.round(value)}${this.getUnitSymbol()}`;
  }

  renderCurrentWeather(data) {
    const { name, sys, weather, main, wind } = data;

    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const weatherCode = weather[0].id;
    const iconCode = weather[0].icon;
    const isDay = iconCode.includes('d');

    this.elements.locationName.textContent = `${name}, ${sys.country}`;
    this.elements.locationDate.textContent = date;

    this.elements.weatherIcon.innerHTML = getWeatherIconMarkup(weatherCode, isDay);

    this.elements.tempValue.textContent = Math.round(main.temp);
    this.elements.tempUnit.textContent = this.getUnitSymbol();
    this.elements.weatherDescription.textContent = weather[0].description;
    this.elements.humidityValue.textContent = `${main.humidity}%`;
    this.elements.windValue.textContent = `${Math.round(wind.speed)} m/s`;
  }

  renderForecast(list) {
    const daily = list.filter(item =>
      item.dt_txt.includes('12:00:00')
    );

    this.elements.forecastList.innerHTML = daily
      .slice(0, 5)
      .map(day => {
        const weatherCode = day.weather[0].id;
        const isDay = day.weather[0].icon.includes('d');
        const dayLabel = new Date(day.dt_txt).toLocaleDateString('en-US', {
          weekday: 'short'
        });

        return `
          <div class="weather__forecast-item">
            <div class="weather__forecast-day">
              ${dayLabel}
            </div>

            <i class="weather__forecast-icon" aria-hidden="true">${getWeatherIconMarkup(weatherCode, isDay)}</i>

            <div class="weather__forecast-temp">
              ${this.formatTemp(day.main.temp)}
            </div>
          </div>
        `;
      })
      .join('');
  }

  /**
   * Renders the suggestions listbox. Each item gets a stable id
   * (`suggestion-N`) and `role="option"` so app.js can drive keyboard
   * navigation via aria-activedescendant.
   */
  renderSuggestions(locations) {
    if (!locations || !locations.length) {
      this.elements.suggestions.hidden = true;
      this.elements.suggestions.innerHTML = '';
      this.elements.searchInput.setAttribute('aria-expanded', 'false');
      this.elements.searchInput.removeAttribute('aria-activedescendant');
      return;
    }

    this.elements.suggestions.innerHTML = locations
      .map((loc, index) => {
        const label = `${loc.name}${loc.state ? ', ' + loc.state : ''}, ${loc.country}`;
        return `
        <div
          id="suggestion-${index}"
          class="search__suggestion"
          role="option"
          aria-selected="false"
          data-index="${index}"
          data-lat="${loc.lat}"
          data-lon="${loc.lon}"
        >
          ${escapeHtml(label)}
        </div>
      `;
      })
      .join('');

    this.elements.suggestions.hidden = false;
    this.elements.searchInput.setAttribute('aria-expanded', 'true');
  }

  /** Shows a non-interactive message row inside the suggestions panel (empty results, search failure). */
  renderSuggestionsMessage(message) {
    this.elements.suggestions.innerHTML = `<div class="search__suggestion--message">${escapeHtml(message)}</div>`;
    this.elements.suggestions.hidden = false;
    this.elements.searchInput.setAttribute('aria-expanded', 'true');
    this.elements.searchInput.removeAttribute('aria-activedescendant');
  }

  closeSuggestions() {
    this.elements.suggestions.hidden = true;
    this.elements.suggestions.innerHTML = '';
    this.elements.searchInput.setAttribute('aria-expanded', 'false');
    this.elements.searchInput.removeAttribute('aria-activedescendant');
  }

  /** Highlights the suggestion at `index` (or clears highlighting for -1) and updates aria-activedescendant. */
  highlightSuggestion(index) {
    const items = this.elements.suggestions.querySelectorAll('.search__suggestion');

    items.forEach(item => {
      item.classList.remove('search__suggestion--active');
      item.setAttribute('aria-selected', 'false');
    });

    if (index < 0 || index >= items.length) {
      this.elements.searchInput.removeAttribute('aria-activedescendant');
      return;
    }

    const active = items[index];
    active.classList.add('search__suggestion--active');
    active.setAttribute('aria-selected', 'true');
    this.elements.searchInput.setAttribute('aria-activedescendant', active.id);
  }

  getSuggestionCount() {
    return this.elements.suggestions.querySelectorAll('.search__suggestion').length;
  }
}

export default new UI();
