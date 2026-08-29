// 1. Copy this file to js/config.local.js (same folder).
// 2. Replace the placeholder below with your own free OpenWeatherMap
//    API key: https://openweathermap.org/api
//
// This key is used only for LOCAL development served from localhost
// (e.g. VS Code Live Server), where the Vercel serverless proxy is not
// running. On Vercel the app instead uses the OPENWEATHER_API_KEY
// environment variable via api/openweather.js and never loads this file.
//
// js/config.local.js is listed in .gitignore and must never be committed.
// IMPORTANT: a key shipped to a browser is NOT secret — anyone using the
// local site can see it in the network tab. This file only keeps the key
// out of source control.
export const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';