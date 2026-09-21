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