// Vercel Serverless Function — proxies OpenWeatherMap requests so the API
// key stays server-side (set as the OPENWEATHER_API_KEY environment
// variable in Vercel; locally in a gitignored .env file used by
// `vercel dev`).
//
// The frontend (js/api.js) calls e.g.:
//   /api/openweather?path=data/2.5/weather&q=London&units=metric&lang=en
// This function validates the path against an allowlist, forwards only
// known parameters, appends the secret appid, and relays the upstream
// response (including its HTTP status) back unchanged.

// NOTE: The environment-variable check is intentionally placed BEFORE the
// path-validation check. If it came after, a missing key would look like a
// 400 "Invalid API path" on every request and could be mistaken for a routing
// bug instead of the missing OPENWEATHER_API_KEY configuration it really is.

const ALLOWED_PATHS = new Set([
  'data/2.5/weather',
  'data/2.5/forecast',
  'geo/1.0/direct'
]);

const ALLOWED_PARAMS = new Set(['q', 'lat', 'lon', 'units', 'lang', 'limit']);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return res
      .status(500)
      .json({ message: 'OpenWeatherMap API key is not configured (set OPENWEATHER_API_KEY).' });
  }

  const path = req.query.path;

  if (!ALLOWED_PATHS.has(path)) {
    return res.status(400).json({ message: 'Invalid API path' });
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(req.query)) {
    if (key !== 'path' && ALLOWED_PARAMS.has(key)) {
      params.set(key, String(value));
    }
  }

  params.set('appid', apiKey);

  const base = path.startsWith('geo/')
    ? 'https://api.openweathermap.org/geo/1.0'
    : 'https://api.openweathermap.org/data/2.5';

  try {
    const response = await fetch(`${base}/${path}?${params.toString()}`);
    const body = await response.text();

    res
      .status(response.status)
      .setHeader('Content-Type', 'application/json')
      .send(body);
  } catch (err) {
    res.status(502).json({ message: 'Upstream request to OpenWeatherMap failed' });
  }
}