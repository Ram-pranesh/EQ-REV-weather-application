1. Architecture
text
Browser (React)  →  Express backend  →  OpenWeatherMap API
                 ←                   ←
React shows the UI and never sees the API key.
Express holds the API key, calls OpenWeatherMap, and returns only the fields we need.
OpenWeatherMap provides the raw weather data.
2. Folder Structure
text
weather-app/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── components/
│   │       ├── Search.jsx
│   │       └── WeatherCard.jsx
│   ├── index.html
│   ├── vite.config.js      ← one extra file (forwards /api to the backend)
│   └── package.json
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
└── README.md
3. Backend Code

backend/server.js

javascript
require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/api/weather", async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: "City is required" });
  }

  try {
    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?q=${encodeURIComponent(city)}` +
      `&appid=${process.env.OPENWEATHER_API_KEY}` +
      `&units=metric`;

    const response = await fetch(url);
    const data = await response.json();

    if (response.status === 404) {
      return res.status(404).json({ error: "City not found" });
    }

    if (!response.ok) {
      return res.status(500).json({ error: "Unable to fetch weather data" });
    }

    // Send back only what the frontend needs
    res.json({
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      wind: data.wind.speed,
      feelsLike: Math.round(data.main.feels_like),
    });
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch weather data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
4. Frontend Code

frontend/index.html

html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Weather App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

frontend/src/main.jsx

jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

frontend/src/App.jsx

jsx
import { useState } from "react";
import Search from "./components/Search";
import WeatherCard from "./components/WeatherCard";

function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(city) {
    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const data = await response.json();

      if (response.status === 404) {
        setError("City not found");
      } else if (!response.ok) {
        setError("Unable to fetch weather data");
      } else {
        setWeather(data);
      }
    } catch (err) {
      setError("Unable to fetch weather data");
    }

    setLoading(false);
  }

  return (
    <div className="container">
      <h1>Weather App</h1>
      <Search onSearch={handleSearch} />

      {loading && <p className="message">Loading...</p>}
      {error && <p className="message error">{error}</p>}
      {weather && <WeatherCard weather={weather} />}
    </div>
  );
}

export default App;

frontend/src/components/Search.jsx

jsx
import { useState } from "react";

function Search({ onSearch }) {
  const [city, setCity] = useState("");

  function handleSubmit(e) {
    e.preventDefault(); // stop the page from reloading
    if (city.trim() === "") return;
    onSearch(city.trim());
  }

  return (
    <form className="search" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
}

export default Search;

frontend/src/components/WeatherCard.jsx

jsx
function WeatherCard({ weather }) {
  return (
    <div className="card">
      <h2>
        {weather.city}, {weather.country}
      </h2>

      <img
        src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
        alt={weather.description}
      />

      <p className="temp">{weather.temperature}°C</p>
      <p className="description">{weather.description}</p>

      <div className="details">
        <p>Humidity: {weather.humidity}%</p>
        <p>Wind: {weather.wind} m/s</p>
        <p>Feels like: {weather.feelsLike}°C</p>
      </div>
    </div>
  );
}

export default WeatherCard;
5. CSS

frontend/src/index.css

css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #f3f4f6;
  color: #222;
}

.container {
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}

.search {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.search input {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.search button {
  padding: 10px 16px;
  font-size: 16px;
  color: #fff;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.search button:hover {
  background: #1d4ed8;
}

.card {
  background: #fff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.temp {
  margin: 0;
  font-size: 48px;
  font-weight: bold;
}

.description {
  margin: 4px 0 16px;
  text-transform: capitalize;
  color: #555;
}

.details p {
  margin: 6px 0;
}

.message {
  color: #555;
}

.error {
  color: #dc2626;
}
6. package.json Files

backend/package.json

json
{
  "name": "weather-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "express": "^4.19.2"
  }
}

frontend/package.json

json
{
  "name": "weather-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.0"
  }
}

frontend/vite.config.js (the small extra file)

javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});

This forwards any request starting with /api to your Express server. That is why React can call fetch("/api/weather?...") with no full URL and no CORS setup.

7. .env Example

backend/.env

env
OPENWEATHER_API_KEY=your_api_key_here
PORT=5000

Replace your_api_key_here with your OpenWeatherMap key. Don't commit this file to Git (add .env and node_modules to a .gitignore).

8. How to Run

Open two terminals.

Terminal 1: backend

bash
cd weather-app/backend
npm install
npm start

Terminal 2: frontend

bash
cd weather-app/frontend
npm install
npm run dev

Open the URL Vite prints (usually http://localhost:5173) and search for a city.

Requirements: Node.js 18 or newer. Node 18+ has fetch built in, so the backend needs no extra HTTP library.

Troubleshooting: If every search shows "Unable to fetch weather data", your key may not be active yet. New OpenWeatherMap keys can take up to a couple of hours to activate. Check the backend terminal, or open http://localhost:5000/api/weather?city=Chennai directly in the browser to test the backend on its own.

9. Request Flow

Say you type Chennai and press Enter:

Search.jsx: the form's onSubmit fires (pressing Enter submits a form automatically). It calls onSearch("Chennai"), which is handleSearch in App.jsx.
App.jsx: handleSearch sets loading to true, so "Loading..." appears. It then runs fetch("/api/weather?city=Chennai").
Vite proxy: the request goes to the dev server, which forwards it to http://localhost:5000/api/weather?city=Chennai.
server.js: Express reads req.query.city and builds the OpenWeatherMap URL with the API key from .env, then calls fetch(url).
OpenWeatherMap replies with a large JSON object (coordinates, pressure, sunrise, and so on).
server.js picks out only the 8 fields we need and sends them with res.json(...).
App.jsx receives the JSON and calls setWeather(data). React re-renders, and <WeatherCard weather={weather} /> appears with the data.

If the city doesn't exist, OpenWeatherMap returns 404, Express passes the 404 on, and React shows "City not found". If the backend is down or the network fails, fetch throws an error, the catch block runs, and React shows "Unable to fetch weather data".

10. Important Code, Explained Simply

Backend (server.js)

require("dotenv").config() reads .env and makes its values available as process.env.OPENWEATHER_API_KEY. This keeps the secret key out of the code.
app.get("/api/weather", ...) creates the endpoint. When the browser asks for that URL, this function runs.
req.query.city gets the city value from ?city=Chennai.
encodeURIComponent(city) makes the city safe to put in a URL, for example turning "New York" into "New%20York".
units=metric makes OpenWeatherMap return Celsius instead of Kelvin.
await fetch(url) calls OpenWeatherMap and waits for the reply. async/await lets asynchronous code read top to bottom.
response.status === 404 means the city wasn't found. !response.ok covers other failures such as a bad API key.
res.json({...}) builds a small, clean object from the big response, so React never has to know OpenWeatherMap's format.
try/catch catches crashes such as no internet, so the server always sends back a proper error.

Frontend

useState lets a component remember values. When one changes, React re-renders the screen.
weather holds the result (null at first).
loading is true while waiting for the backend.
error holds the error message.
handleSearch in App.jsx resets the state, calls the backend, and sets either the weather or an error message.
{loading && <p>Loading...</p>} means "show this only if loading is true". The weather and error lines work the same way.
Search.jsx keeps its own city state for the input box. value={city} and onChange keep the input and state in sync. When you submit, it passes the city up to App through the onSearch prop.
e.preventDefault() stops the browser's default behavior of reloading the page when a form is submitted.
WeatherCard.jsx only displays data. It gets everything through the weather prop and has no logic of its own.
The icon URL https://openweathermap.org/img/wn/01d@2x.png is OpenWeatherMap's icon service. The backend sends the code (01d) and React builds the image URL from it.

Why Express in the middle? If React called OpenWeatherMap directly, the API key would be visible in the browser (DevTools → Network) and anyone could steal it. With the backend in the middle, the key stays on the server.

If you want, I can also package this into a downloadable zip, or add a .gitignore and README.md for submission.

i get this proxy error unable to fetch data http proxy error: /api/weather?city=chennai

Diagnosing a Vite proxy connection error.

That error means the Vite dev server (frontend) couldn't reach your Express backend. The request never got as far as OpenWeatherMap, so it's a connection problem, not an API key problem. Work through these in order.

Step 1: Is the backend running?

In the backend terminal (weather-app/backend), you should see:

text
Server running on http://localhost:5000

If you see an error instead, or nothing, fix that first:

Cannot find module 'express' or 'dotenv': run npm install inside the backend folder.
fetch is not defined: your Node version is below 18. Check with node -v and update if needed.
Make sure you run npm start from inside the backend folder, not the project root.
Step 2: Test the backend directly

With the backend running, open this in your browser:

text
http://localhost:5000/api/weather?city=Chennai
You see weather JSON: the backend is fine, so the problem is the proxy (go to Step 3).
You see {"error":"Unable to fetch weather data"}: the backend is reachable, but the API key is wrong or not activated yet. Check backend/.env.
The page can't be reached: the backend isn't running or is on a different port (go to Step 4).
Step 3: Fix the proxy (very common on Windows and Node 18+)

Newer Node versions resolve localhost to the IPv6 address ::1, while Express may only be listening on IPv4, so Vite gets ECONNREFUSED. Use 127.0.0.1 instead.

frontend/vite.config.js

javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://127.0.0.1:5000",
    },
  },
});

Stop and restart npm run dev. Vite doesn't pick up config changes automatically.

Step 4: Port 5000 may be taken

If you're on a Mac, port 5000 is used by the AirPlay Receiver by default, which causes exactly this error. On any OS, another app could also be using it. Switch to port 5001:

backend/.env

env
OPENWEATHER_API_KEY=your_api_key_here
PORT=5001

frontend/vite.config.js

javascript
"/api": "http://127.0.0.1:5001",

Restart both the backend and the frontend.

Step 5: Check the .env file
It must be named exactly .env (not .env.txt), and it must be inside the backend folder.
There should be no quotes or spaces around the values: OPENWEATHER_API_KEY=abc123.
Still stuck?

Look at the Vite terminal (the frontend one). Just under the proxy error it usually prints the real reason, such as ECONNREFUSED, ECONNRESET, or ENOTFOUND. If it still fails, send me that line along with what the backend terminal shows, and I can pinpoint it.

Diagnosing a backend API failure with added logging.

That response means the backend is running, but something inside the try block failed and the catch hid the reason. Make the server print the real error.

Step 1: Replace server/server.js completely

This version is the WeatherAPI code with logging added:

javascript
require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT || 5050;

app.get("/", (req, res) => {
  res.send("Weather backend is running");
});

app.get("/api/weather", async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: "City is required" });
  }

  try {
    const url =
      `https://api.weatherapi.com/v1/current.json` +
      `?key=${process.env.WEATHER_API_KEY}` +
      `&q=${encodeURIComponent(city)}`;

    const response = await fetch(url);
    const data = await response.json();

    // Code 1006 means "No matching location found"
    if (data.error && data.error.code === 1006) {
      return res.status(404).json({ error: "City not found" });
    }

    if (!response.ok) {
      console.log("WeatherAPI error:", response.status, data);
      return res.status(500).json({ error: "Unable to fetch weather data" });
    }

    res.json({
      city: data.location.name,
      country: data.location.country,
      temperature: Math.round(data.current.temp_c),
      description: data.current.condition.text,
      icon: "https:" + data.current.condition.icon,
      humidity: data.current.humidity,
      wind: Math.round((data.current.wind_kph / 3.6) * 10) / 10,
      feelsLike: Math.round(data.current.feelslike_c),
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Unable to fetch weather data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
Step 2: Restart and trigger the error
powershell
# Ctrl+C to stop the old server, then:
npm start

Open http://localhost:5050/api/weather?city=Chennai again and look at the PowerShell window running npm start. It will now print the real reason.

Step 3: Match the message to the fix
Backend terminal shows	Cause	Fix
WeatherAPI error: 401 ... code: 2006	The key value in .env is wrong. You renamed the variable, but the value may still be your old OpenWeatherMap key.	Paste your WeatherAPI.com key into WEATHER_API_KEY= in .env, then restart
WeatherAPI error: 403 ... code: 2008	Key is disabled	Check your WeatherAPI.com account and email verification
Server error: TypeError: fetch failed	Node can't reach the internet or the API	Check Wi-Fi, VPN, or firewall. Try a mobile hotspot.
Server error: TypeError: Cannot read properties of undefined (reading ...)	Field name mismatch in the response	Send me the full message
fetch is not defined	Node is older than 18	Run node -v and update Node
The most likely cause

Your .env originally held your OpenWeatherMap key, and you only renamed the variable. If the value is still the OpenWeatherMap key, WeatherAPI rejects it with error 2006 even though Key loaded: YES appears. To check, open this in your browser with the key from your .env:

text
https://api.weatherapi.com/v1/current.json?key=THE_KEY_FROM_ENV&q=Chennai

If it returns API key is invalid, get the correct key from your WeatherAPI.com dashboard and put that in .env.

Send me this if it's still failing

Paste the exact line(s) the npm start terminal prints after you open the URL (hide your key if it appears). That message identifies the problem.

i get this Server running on http://localhost:5050
WeatherAPI error: 401 { error: { code: 2006, message: 'API key is invalid.' } }
WeatherAPI error: 401 { error: { code: 2006, message: 'API key is invalid.' } }
Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
1:26:38 pm [vite] http proxy error: /api/weather?city=delhi
AggregateError [ECONNREFUSED]: 
    at internalConnectMultiple (node:net:1139:18)
    at afterConnectMultiple (node:net:1714:7)

Diagnosing a weather API key configuration error.

You have two separate problems. The backend log shows the key issue, and the Vite log shows a port issue. Fix them in this order.

Problem 1: API key is invalid (error 2006)

The variable name is now correct, but the value in server/.env isn't a valid WeatherAPI.com key. This is almost certainly your old OpenWeatherMap key, which WeatherAPI rejects. The two services issue different keys.

Go to https://www.weatherapi.com and sign up or log in. Verify your email if asked.
Copy the key from your dashboard.
Test it in the browser before touching your code:
text
   https://api.weatherapi.com/v1/current.json?key=PASTE_KEY_HERE&q=Chennai

You must get weather JSON here. If you get error 2006, the key is still wrong, so recopy it. Fix this first, because nothing else will work until this URL works.
4. Put that same key in server/.env:

env
   WEATHER_API_KEY=paste_the_weatherapi_key_here
   PORT=5050

No quotes, no spaces.
5. Restart the backend (Ctrl+C, then npm start).
6. Open http://localhost:5050/api/weather?city=Chennai. It should now return weather JSON.

Problem 2: Vite ECONNREFUSED

Your backend clearly runs on port 5050, since it printed the 401 errors when you opened it in the browser. Vite failed to connect, so its proxy is pointing at the wrong address. The AggregateError mentioning multiple connection attempts is the typical sign of a localhost target or a wrong port.

Open frontend/vite.config.js and make it exactly this:

javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://127.0.0.1:5050",
    },
  },
});

Then stop and restart the frontend (Ctrl+C, then npm run dev). Vite doesn't reload this file on its own.

Also check that the backend terminal is still running when you search. If you closed it or it crashed, you get ECONNREFUSED every time