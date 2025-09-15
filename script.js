// Keep your existing API key if you already have one set.
const apiKey = typeof window.apiKey !== "undefined" ? window.apiKey : "bec2d83b22fe5cfc481bf85e54215d90";

async function getWeather() {
  const cityInput = document.getElementById('city');
  const city = cityInput.value.trim();

  const tempDivInfo = document.getElementById('temp-div');
  const weatherInfoDiv = document.getElementById('weather-info');
  const weatherIcon = document.getElementById('weather-icon');
  const hourlyForecastDiv = document.getElementById('hourly-forecast');

  // Clear previous output
  tempDivInfo.innerHTML = '';
  weatherInfoDiv.innerHTML = '';
  hourlyForecastDiv.innerHTML = '';
  weatherIcon.style.display = 'none';
  weatherIcon.removeAttribute('src');
  weatherIcon.removeAttribute('alt');

  if (!city) {
    weatherInfoDiv.innerHTML = `<p>Please enter a city.</p>`;
    return;
  }

  // Use imperial units for Fahrenheit
  const currentWeatherUrl =
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=imperial`;
  const forecastUrl =
    `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=imperial`;

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl)
    ]);

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    const currentCode = String(currentData.cod);
    if (currentCode !== '200') {
      const msg = currentData.message || 'Error fetching current weather.';
      weatherInfoDiv.innerHTML = `<p>${msg}</p>`;
      return;
    }

    displayWeather(currentData);

    const forecastCode = String(forecastData.cod);
    if (forecastCode !== '200' || !Array.isArray(forecastData.list)) {
      const msg = forecastData.message || 'Error fetching forecast.';
      const note = document.createElement('p');
      note.textContent = msg;
      hourlyForecastDiv.appendChild(note);
      return;
    }

    displayHourlyForecast(forecastData.list);
  } catch (err) {
    weatherInfoDiv.innerHTML = `<p>Network error. Please try again.</p>`;
    console.error(err);
  }
}

function displayWeather(data) {
  const tempDivInfo = document.getElementById('temp-div');
  const weatherInfoDiv = document.getElementById('weather-info');
  const weatherIcon = document.getElementById('weather-icon');

  const cityName = data.name;
  const temperature = Math.round(data.main?.temp);
  const description = data.weather?.[0]?.description || '—';
  const iconCode = data.weather?.[0]?.icon;

  if (iconCode) {
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    weatherIcon.src = iconUrl;
    weatherIcon.alt = description;
    weatherIcon.style.display = 'block';
  } else {
    weatherIcon.style.display = 'none';
  }

  // Show Fahrenheit
  tempDivInfo.innerHTML = isFinite(temperature) ? `<p>${temperature}°F</p>` : '';
  weatherInfoDiv.innerHTML = `
    <p>${cityName ?? ''}</p>
    <p>${description}</p>
  `;
}

function displayHourlyForecast(list) {
  const hourlyForecastDiv = document.getElementById('hourly-forecast');
  if (!Array.isArray(list)) return;

  const next24Hours = list.slice(0, 8);

  next24Hours.forEach(item => {
    const dateTime = new Date(item.dt * 1000);

    // Format time in 12-hour with am/pm
    let hours = dateTime.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const displayTime = `${hours} ${ampm}`;

    const temperature = Math.round(item.main?.temp);
    const iconCode = item.weather?.[0]?.icon;
    const iconUrl = iconCode ? `https://openweathermap.org/img/wn/${iconCode}.png` : '';

    const card = document.createElement('div');
    card.className = 'hourly-item';
    card.innerHTML = `
      <span>${displayTime}</span>
      ${iconUrl ? `<img src="${iconUrl}" alt="Hourly Weather Icon">` : ''}
      <span>${isFinite(temperature) ? `${temperature}°F` : '—'}</span>
    `;
    hourlyForecastDiv.appendChild(card);
  });
}

// Wire up UI
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('search-btn');
  const input = document.getElementById('city');

  btn.addEventListener('click', getWeather);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') getWeather();
  });
});
