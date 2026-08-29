# SKY Weather App

A clean, responsive weather application built with Vanilla JavaScript, HTML5, and CSS3.
Get real-time weather and 5-day forecasts for any city worldwide using the OpenWeatherMap API.

## Features

- **Smart City Search**: Debounced search with keyboard-navigable autocomplete suggestions using the OpenWeatherMap Geocoding API
- **Current Weather**: Temperature, humidity, wind speed, weather conditions, and a condition icon
- **5-Day Forecast**: Daily forecast with icons and temperatures — shown on every load path (geolocation, saved city, and manual search)
- **Geolocation Support**: Automatically loads weather for your current location on first visit
- **Local Storage**: Remembers your last searched city (and last known coordinates as a fallback)
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Loading & Error States**: Clean UX with skeleton loading and clear error messages
- **Accessible**: Keyboard-navigable search suggestions, `aria-live` state announcements, and a labeled page heading
- **No Dependencies**: Built with pure Vanilla JS - no frameworks, libraries, or build step

## Tech Stack

- **Frontend**: Vanilla JavaScript ES6+, HTML5, CSS3
- **Architecture**: Modular ES6 modules with separation of concerns
- **API**: OpenWeatherMap Current Weather, 5-Day Forecast, and Geocoding API
- **Styling**: BEM methodology, CSS Variables, CSS Grid & Flexbox
- **Icons**: Small original inline SVGs (no icon font, no external asset requests)

## Project Structure

```
SKY/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── config.js                  (imports the API key from config.local.js)
│   ├── config.local.example.js    (template — copy to config.local.js)
│   ├── config.local.js            (your API key — gitignored, not committed)
│   ├── api.js
│   ├── ui.js
│   ├── icons.js                   (inline SVG weather icons)
│   └── app.js
└── assets/
    └── images/
```

## Getting Started

### Prerequisites

- A free API key from [OpenWeatherMap](https://openweathermap.org/api)
- A modern browser with ES6 module support
- Live Server extension or similar for local development (the app uses ES modules, which most browsers block over `file://`, so it needs to be served over `http://`)

### Setup

1. Copy `js/config.local.example.js` to `js/config.local.js`.
2. Open `js/config.local.js` and replace `YOUR_OPENWEATHERMAP_API_KEY` with your own OpenWeatherMap API key.
3. Serve the folder with any static file server (e.g. the VS Code "Live Server" extension, or `npx serve`) and open it in a browser.

**A note on the API key:** this is a pure static frontend with no backend and no build step, so there is no way to keep an API key truly secret — anything shipped to the browser is visible to anyone inspecting network requests. Keeping the key in a gitignored `config.local.js` only keeps it out of version control; for a real deployment, also restrict the key on the OpenWeatherMap dashboard (HTTP referrer and/or rate limits).

## Usage

1. Allow location access to get weather for your current position
2. Type a city or country name in the search bar
3. Use the mouse, or the arrow keys + Enter, to select from the dropdown suggestions
4. View current weather and 5-day forecast instantly

## API Reference

This project uses the following OpenWeatherMap endpoints:

- `GET /geo/1.0/direct` - City/Location search
- `GET /data/2.5/weather` - Current weather data (by city name or coordinates)
- `GET /data/2.5/forecast` - 5-day weather forecast (by city name or coordinates)

## Key Concepts Demonstrated

- _REST API Consumption_: Fetching and handling JSON responses
- _Async/Await_: Managing asynchronous operations cleanly
- _Debouncing_: Optimizing API calls on user input, with a stale-response guard
- _Modular JavaScript_: Separation of concerns with ES6 modules
- _Error Handling_: Graceful failure with user-friendly messages
- _Local Storage_: Client-side data persistence
- _Responsive Design_: Mobile-first CSS approach
- _Accessibility_: Keyboard navigation and ARIA roles for a custom autocomplete widget

## Future Improvements

- [ ] Dark/Light mode toggle
- [ ] Unit switching between Celsius and Fahrenheit
- [ ] Weather charts using [Chart.js](https://www.chartjs.org/)
- [ ] PWA support for offline usage
- [ ] Unit tests with Jest

## License

This project is open source and available under the MIT License.

### Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](link-to-issues).
