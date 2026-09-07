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
      searchStatus: document.getElementById('search-status'),
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
   * Populates the native datalist. Each <option> carries the city label as
   * its value (so a picked option sets the input to that exact label) plus
   * data-lat/data-lon, letting app.js resolve the chosen city to its exact
   * coordinates without a second geocoding request.
   */
  renderSuggestions(locations) {
    this.elements.suggestions.innerHTML = '';
    this.elements.searchStatus.hidden = true;

    if (!locations?.length) return;

    this.elements.suggestions.innerHTML = locations
      .map((loc) => {
        const label = `${loc.name}${loc.state ? ', ' + loc.state : ''}, ${loc.country}`;
        return `
        <option
          data-lat="${loc.lat}"
          data-lon="${loc.lon}"
        >${escapeHtml(label)}</option>
      `;
      })
      .join('');
  }

  /** Shows a non-interactive message for empty results / search failure via the live status region. */
  renderSuggestionsMessage(message) {
    this.elements.suggestions.innerHTML = '';
    this.elements.searchStatus.textContent = message;
    this.elements.searchStatus.hidden = false;
  }

  /** Returns the datalist <option> whose label/value matches `value`, or null. */
  getOptionByValue(value) {
    if (!value) return null;

    const options = this.elements.suggestions.options;

    for (let i = 0; i < options.length; i += 1) {
      if (options[i].value === value) return options[i];
    }

    return null;
  }

  closeSuggestions() {
    this.elements.suggestions.innerHTML = '';
    this.elements.searchStatus.hidden = true;
  }
}

export default new UI();
