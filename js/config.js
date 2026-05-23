// Central config for the SKY app
export const CONFIG = {
  API_KEY: '51c21b5e9719203d2798b78b96082f24',
  
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