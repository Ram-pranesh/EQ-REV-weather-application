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
    const apiKey = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY;
    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?q=${encodeURIComponent(city)}` +
      `&appid=${apiKey}` +
      `&units=metric`;

    const response = await fetch(url);
    const data = await response.json();

    if (response.status === 404 || data.cod === "404" || data.cod === 404) {
      return res.status(404).json({ error: "City not found" });
    }

    if (!response.ok) {
      console.log("Weather API error:", response.status, data);
      return res.status(500).json({ error: "Unable to fetch weather data" });
    }

    res.json({
      city: data.name,
      country: data.sys ? data.sys.country : "",
      temperature: Math.round(data.main.temp),
      description: data.weather && data.weather[0] ? data.weather[0].description : "",
      icon: data.weather && data.weather[0] ? data.weather[0].icon : "",
      humidity: data.main.humidity,
      wind: data.wind ? Math.round(data.wind.speed * 10) / 10 : 0,
      feelsLike: Math.round(data.main.feels_like),
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Unable to fetch weather data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});