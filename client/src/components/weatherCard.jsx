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