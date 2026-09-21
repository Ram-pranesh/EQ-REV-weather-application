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