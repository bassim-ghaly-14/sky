// Lightweight, dependency-free weather icons.
//
// Replaces the previous css/weather-icons.min.css approach, which shipped
// only a truncated license comment with no actual font/CSS rules and no
// font files, so no icon ever rendered. These are small original inline
// SVGs (no external font, no network request, no build step) that inherit
// their color from CSS via `currentColor`, so the existing
// `.weather__icon` / `.weather__forecast-icon` color and filter rules
// keep working unchanged.

const ICONS = {
  'clear-day': `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="13" fill="currentColor"/>
      <g stroke="currentColor" stroke-width="4" stroke-linecap="round">
        <line x1="32" y1="4" x2="32" y2="12"/>
        <line x1="32" y1="52" x2="32" y2="60"/>
        <line x1="4" y1="32" x2="12" y2="32"/>
        <line x1="52" y1="32" x2="60" y2="32"/>
        <line x1="12.3" y1="12.3" x2="17.9" y2="17.9"/>
        <line x1="46.1" y1="46.1" x2="51.7" y2="51.7"/>
        <line x1="12.3" y1="51.7" x2="17.9" y2="46.1"/>
        <line x1="46.1" y1="17.9" x2="51.7" y2="12.3"/>
      </g>
    </svg>`,

  'clear-night': `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 12a20 20 0 1 0 12 32 15 15 0 0 1-12-32z" fill="currentColor"/>
      <g fill="currentColor">
        <circle cx="50" cy="14" r="1.6"/>
        <circle cx="55" cy="22" r="1.1"/>
        <circle cx="44" cy="8" r="1.1"/>
      </g>
    </svg>`,

  'partly-cloudy-day': `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="10" fill="currentColor"/>
      <g stroke="currentColor" stroke-width="3.5" stroke-linecap="round">
        <line x1="24" y1="4" x2="24" y2="9"/>
        <line x1="8" y1="24" x2="13" y2="24"/>
        <line x1="11.2" y1="11.2" x2="14.7" y2="14.7"/>
        <line x1="36.8" y1="11.2" x2="33.3" y2="14.7"/>
      </g>
      <path d="M20 46a11 11 0 0 1 21.2-4.1A9.5 9.5 0 0 1 40 61H21a9 9 0 0 1-1-15z" fill="currentColor" opacity="0.9"/>
    </svg>`,

  'partly-cloudy-night': `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M38 8a13 13 0 0 0 6 24.6A10 10 0 0 1 34 24a10 10 0 0 1 4-8z" fill="currentColor"/>
      <path d="M20 46a11 11 0 0 1 21.2-4.1A9.5 9.5 0 0 1 40 61H21a9 9 0 0 1-1-15z" fill="currentColor" opacity="0.9"/>
    </svg>`,

  cloudy: `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 30a11 11 0 0 1 21.1-4.2A9.5 9.5 0 0 1 46 44H19a10 10 0 0 1-1-14z" fill="currentColor" opacity="0.55"/>
      <path d="M14 44a11 11 0 0 1 21.2-4.1A9.5 9.5 0 0 1 44 58H15a9 9 0 0 1-1-14z" fill="currentColor"/>
    </svg>`,

  rain: `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 34a11 11 0 0 1 21.2-4.1A9.5 9.5 0 0 1 44 48H15a9 9 0 0 1-1-14z" fill="currentColor"/>
      <g stroke="currentColor" stroke-width="3.5" stroke-linecap="round">
        <line x1="22" y1="52" x2="19" y2="60"/>
        <line x1="32" y1="52" x2="29" y2="60"/>
        <line x1="42" y1="52" x2="39" y2="60"/>
      </g>
    </svg>`,

  thunderstorm: `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 30a11 11 0 0 1 21.2-4.1A9.5 9.5 0 0 1 44 44H15a9 9 0 0 1-1-14z" fill="currentColor"/>
      <path d="M33 40 24 54h8l-4 10 15-18h-8l4-6z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`,

  snow: `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 30a11 11 0 0 1 21.2-4.1A9.5 9.5 0 0 1 44 44H15a9 9 0 0 1-1-14z" fill="currentColor"/>
      <g stroke="currentColor" stroke-width="3" stroke-linecap="round">
        <line x1="21" y1="49" x2="21" y2="59"/>
        <line x1="16.5" y1="54" x2="25.5" y2="54"/>
        <line x1="32" y1="49" x2="32" y2="59"/>
        <line x1="27.5" y1="54" x2="36.5" y2="54"/>
        <line x1="43" y1="49" x2="43" y2="59"/>
        <line x1="38.5" y1="54" x2="47.5" y2="54"/>
      </g>
    </svg>`,

  mist: `
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="20" r="9" fill="currentColor" opacity="0.85"/>
      <g stroke="currentColor" stroke-width="4" stroke-linecap="round">
        <line x1="8" y1="34" x2="56" y2="34"/>
        <line x1="14" y1="44" x2="50" y2="44"/>
        <line x1="8" y1="54" x2="56" y2="54"/>
      </g>
    </svg>`
};

/**
 * Maps an OpenWeatherMap condition code + day/night flag to one of the
 * icon keys above. Falls back to a generic cloud icon for any code the
 * app doesn't have a dedicated icon for.
 */
export function getWeatherIconKey(code, isDay = true) {
  if (code === 800) return isDay ? 'clear-day' : 'clear-night';
  if (code === 801 || code === 802) return isDay ? 'partly-cloudy-day' : 'partly-cloudy-night';
  if (code >= 803 && code <= 804) return 'cloudy';
  if (code >= 200 && code < 300) return 'thunderstorm';
  if (code >= 300 && code < 600) return 'rain';
  if (code >= 600 && code < 700) return 'snow';
  if (code >= 700 && code < 800) return 'mist';
  return 'cloudy';
}

export function getWeatherIconMarkup(code, isDay = true) {
  const key = getWeatherIconKey(code, isDay);
  return ICONS[key] || ICONS.cloudy;
}
