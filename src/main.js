const geocodeUrl = 'https://geocoding-api.open-meteo.com/v1/search';
const forecastUrl = 'https://api.open-meteo.com/v1/forecast';

const elements = {
  cityInput: document.getElementById('city-input'),
  searchButton: document.getElementById('search-button'),
  statusMessage: document.getElementById('status-message'),
  weatherResult: document.getElementById('weather-result'),
  forecastGrid: document.getElementById('forecast-grid'),
  recommendations: document.getElementById('recommendations'),
};

const weatherCodeLabels = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with heavy hail',
};

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function setStatus(message, isError = false) {
  elements.statusMessage.textContent = message;
  elements.statusMessage.classList.toggle('error', isError);
}

function showElement(el) {
  el.classList.remove('hidden');
}

function hideElement(el) {
  el.classList.add('hidden');
}

function buildWeatherCard(city, location, current, timezone) {
  const condition = weatherCodeLabels[current.weathercode] || 'Unknown conditions';
  return `
    <div class="result-card">
      <h2>${city}, ${location}</h2>
      <div class="current-weather">
        <div>
          <p class="large-temp">${Math.round(current.temperature)}°C</p>
          <p>${condition}</p>
        </div>
        <div class="weather-details">
          <p><strong>Wind:</strong> ${current.windspeed} km/h</p>
          <p><strong>Wind dir:</strong> ${current.winddirection}°</p>
          <p><strong>Time:</strong> ${new Date(current.time).toLocaleString(undefined, { timeStyle: 'short', dateStyle: 'short' })}</p>
          <p><strong>Zone:</strong> ${timezone}</p>
        </div>
      </div>
    </div>
  `;
}

function buildForecastCard(date, weathercode, maxTemp, minTemp, precipitation) {
  return `
    <article class="forecast-card">
      <h3>${formatDate(date)}</h3>
      <p class="forecast-condition">${weatherCodeLabels[weathercode] || 'Forecast'}</p>
      <p><strong>High:</strong> ${Math.round(maxTemp)}°C</p>
      <p><strong>Low:</strong> ${Math.round(minTemp)}°C</p>
      <p><strong>Precip:</strong> ${precipitation.toFixed(1)} mm</p>
    </article>
  `;
}

function buildRecommendations(dailySummary) {
  const notes = [];
  if (dailySummary.precipitation_sum.some((precip) => precip > 10)) {
    notes.push('Rain likely; bring an umbrella and waterproof layers.');
  }
  if (dailySummary.temperature_2m_max.some((t) => t >= 30)) {
    notes.push('Hot conditions ahead; stay hydrated and avoid midday sun.');
  }
  if (dailySummary.temperature_2m_min.some((t) => t <= 0)) {
    notes.push('Cold nights expected; pack warm clothes for early mornings.');
  }
  if (notes.length === 0) {
    notes.push('Mild weather expected. Enjoy your plans with a light jacket.');
  }

  return notes.map((note) => `<li>${note}</li>`).join('');
}

async function lookupCity(city) {
  const url = new URL(geocodeUrl);
  url.searchParams.set('name', city);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'en');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Geocoding API request failed');
  }
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error('City not found. Please try a different search.');
  }
  return data.results[0];
}

async function fetchForecast(lat, lon) {
  const url = new URL(forecastUrl);
  url.searchParams.set('latitude', lat);
  url.searchParams.set('longitude', lon);
  url.searchParams.set('current_weather', 'true');
  url.searchParams.set('daily', 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum');
  url.searchParams.set('timezone', 'auto');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Forecast API request failed');
  }
  return response.json();
}

async function handleSearch() {
  const city = elements.cityInput.value.trim();
  if (!city) {
    setStatus('Please enter a city name before searching.', true);
    return;
  }

  setStatus('Finding city and loading weather data...', false);
  hideElement(elements.weatherResult);
  hideElement(elements.forecastGrid);
  hideElement(elements.recommendations);

  try {
    const geocode = await lookupCity(city);
    const forecast = await fetchForecast(geocode.latitude, geocode.longitude);

    elements.weatherResult.innerHTML = buildWeatherCard(
      geocode.name,
      geocode.country,
      forecast.current_weather,
      forecast.timezone
    );

    const forecastHtml = forecast.daily.time
      .map((date, index) =>
        buildForecastCard(
          date,
          forecast.daily.weathercode[index],
          forecast.daily.temperature_2m_max[index],
          forecast.daily.temperature_2m_min[index],
          forecast.daily.precipitation_sum[index]
        )
      )
      .join('');
    elements.forecastGrid.innerHTML = forecastHtml;

    elements.recommendations.innerHTML = `
      <div class="result-card">
        <h2>Planning recommendations</h2>
        <ul>${buildRecommendations(forecast.daily)}</ul>
      </div>
    `;

    setStatus(`Weather for ${geocode.name}, ${geocode.country} loaded successfully.`);
    showElement(elements.weatherResult);
    showElement(elements.forecastGrid);
    showElement(elements.recommendations);
  } catch (error) {
    setStatus(error.message || 'Unable to load weather data.', true);
  }
}

function init() {
  elements.searchButton.addEventListener('click', handleSearch);
  elements.cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  });
}

init();
