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

  getWeatherIconClass(code, isDay = true) {
    const prefix = isDay ? 'wi-owm-day' : 'wi-owm-night';

    if (code >= 200 && code < 300) return `${prefix}-${code}`;
    if (code >= 300 && code < 600) return `${prefix}-${code}`;
    if (code >= 600 && code < 700) return `${prefix}-${code}`;
    if (code >= 700 && code < 800) return `${prefix}-${code}`;
    if (code === 800) return `${prefix}-800`;
    if (code > 800) return `${prefix}-${code}`;

    return 'wi-na';
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

    this.elements.weatherIcon.className =
      `weather__icon wi ${this.getWeatherIconClass(weatherCode, isDay)}`;

    this.elements.tempValue.textContent = Math.round(main.temp);
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

        return `
          <div class="weather__forecast-item">
            <div class="weather__forecast-day">
              ${new Date(day.dt_txt).toLocaleDateString('en-US', {
                weekday: 'short'
              })}
            </div>

            <i class="weather__forecast-icon wi ${this.getWeatherIconClass(weatherCode, isDay)}"></i>

            <div class="weather__forecast-temp">
              ${Math.round(day.main.temp)}°C
            </div>
          </div>
        `;
      })
      .join('');
  }

  renderSuggestions(locations) {
    if (!locations || !locations.length) {
      this.elements.suggestions.hidden = true;
      return;
    }

    this.elements.suggestions.innerHTML = locations
      .map(
        loc => `
        <div class="search__suggestion" data-lat="${loc.lat}" data-lon="${loc.lon}">
          ${loc.name}${loc.state ? ', ' + loc.state : ''}, ${loc.country}
        </div>
      `
      )
      .join('');

    this.elements.suggestions.hidden = false;
  }
}

export default new UI();