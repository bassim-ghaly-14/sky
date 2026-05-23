# SKY Weather App

A clean, responsive weather application built with Vanilla JavaScript, HTML5, and CSS3.  
Get real-time weather and 5-day forecasts for any city worldwide using the OpenWeatherMap API.

![SKY Weather App Screenshot](assets/preview.png)

## Features

- **Smart City Search**: Debounced search with autocomplete suggestions using OpenWeatherMap Geocoding API
- **Current Weather**: Temperature, humidity, wind speed, and weather conditions
- **5-Day Forecast**: Daily forecast with icons and temperatures
- **Geolocation Support**: Automatically loads weather for your current location on first visit
- **Local Storage**: Remembers your last searched city
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Loading & Error States**: Clean UX with skeleton loading and clear error messages
- **No Dependencies**: Built with pure Vanilla JS - no frameworks or libraries

## Tech Stack

- **Frontend**: Vanilla JavaScript ES6+, HTML5, CSS3
- **Architecture**: Modular ES6 modules with separation of concerns
- **API**: OpenWeatherMap Current Weather, 5-Day Forecast, and Geocoding API
- **Styling**: BEM methodology, CSS Variables, CSS Grid & Flexbox

## Project Structure

SKY/
├── index.html
├── /css
│ └── style.css
├── /js
│ ├── config.js
│ ├── api.js
│ ├── ui.js
│ └── app.js
└── /assets

## Getting Started

### Prerequisites

- A free API key from [OpenWeatherMap](https://openweathermap.org/api)
- A modern browser with ES6 module support
- Live Server extension or similar for local development

## Usage

1. Allow location access to get weather for your current position
2. Type a city or country name in the search bar
3. Select from the dropdown suggestions for accurate results
4. View current weather and 5-day forecast instantly

## API Reference

This project uses the following OpenWeatherMap endpoints:

- `GET /geo/1.0/direct` - City/Location search
- `GET /data/2.5/weather` - Current weather data
- `GET /data/2.5/forecast` - 5-day weather forecast

## Key Concepts Demonstrated

- _REST API Consumption_: Fetching and handling JSON responses
- _Async/Await_: Managing asynchronous operations cleanly
- _Debouncing_: Optimizing API calls on user input
- _Modular JavaScript_: Separation of concerns with ES6 modules
- _Error Handling_: Graceful failure with user-friendly messages
- _Local Storage_: Client-side data persistence
- _Responsive Design_: Mobile-first CSS approach

## Future Improvements

- [ ] Dark/Light mode toggle
- [ ] Unit switching between Celsius and Fahrenheit
- [ ] Weather charts using http://Chart.js
- \*\*] PWA support for offline usage
- [ ] Unit tests with Jest

## License

## This project is open source and available under the MIT License.

### Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](link-to-issues).
