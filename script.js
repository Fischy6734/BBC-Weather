document.addEventListener('DOMContentLoaded', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            showContainer();
            fetchWeatherByLocation(lat, lon);
            setInterval(() => {
                fetchWeatherByLocation(lat, lon);
            }, 60000); // Update every 60 seconds
        }, error => {
            showErrorNotification();
            console.error('Error fetching location:', error);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

function showContainer() {
    const container = document.getElementById('container');
    container.classList.remove('hidden');
    container.classList.add('show');
}

function fetchWeatherByLocation(lat, lon) {
    showFetchNotification();
    const currentWeatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit&timezone=auto`;
    const dailyWeatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,windspeed_10m_max&temperature_unit=fahrenheit&timezone=auto`;

    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data.current_weather);
            showUpdateNotification();
            updateBackground(data.current_weather.weathercode);
        })
        .catch(error => {
            showErrorNotification();
            console.error('Error fetching current weather data:', error);
        });

    fetch(dailyWeatherUrl)
        .then(response => response.json())
        .then(data => {
            displayDailyWeather(data.daily);
            showUpdateNotification();
        })
        .catch(error => {
            showErrorNotification();
            console.error('Error fetching daily weather data:', error);
        });
}

function getWeatherEmoji(weatherCode) {
    switch (weatherCode) {
        case 0:
            return '☀️'; // Clear sky
        case 1:
        case 2:
        case 3:
            return '🌤️'; // Mainly clear, partly cloudy, overcast
        case 45:
        case 48:
            return '🌫️'; // Fog, depositing rime fog
        case 51:
        case 53:
        case 55:
            return '🌦️'; // Drizzle
        case 56:
        case 57:
            return '🌧️'; // Freezing drizzle
        case 61:
        case 63:
        case 65:
            return '🌧️'; // Rain
        case 66:
        case 67:
            return '🌨️'; // Freezing rain
        case 71:
        case 73:
        case 75:
            return '❄️'; // Snow fall
        case 77:
            return '🌨️'; // Snow grains
        case 80:
        case 81:
        case 82:
            return '🌧️'; // Rain showers
        case 85:
        case 86:
            return '❄️'; // Snow showers
        case 95:
            return '⛈️'; // Thunderstorm
        case 96:
        case 99:
            return '⛈️'; // Thunderstorm with hail
        default:
            return '❓'; // Unknown weather code
    }
}

function displayCurrentWeather(currentWeather) {
    const todayWeather = document.getElementById('today-weather');
    if (currentWeather) {
        const temperature = currentWeather.temperature;
        const feelsLike = currentWeather.temperature; // Assuming feels like temperature is the same for this example
        const windSpeed = currentWeather.windspeed;
        const weatherCode = currentWeather.weathercode;

        todayWeather.innerHTML = `
            <h2>Today's Weather</h2>
            <p>Current Temperature: ${temperature}°F</p>
            <p>Feels Like: ${feelsLike}°F</p>
            <p>Current Wind Speed: ${windSpeed} m/s</p>
            <p>Weather: ${getWeatherEmoji(weatherCode)}</p>
        `;
    } else {
        todayWeather.innerHTML = `<p>Unable to fetch current weather data.</p>`;
    }
}

function displayDailyWeather(dailyWeather) {
    const weatherInfo = document.getElementById('weather-info');
    if (dailyWeather) {
        const days = dailyWeather.time;
        const maxTemps = dailyWeather.temperature_2m_max;
        const minTemps = dailyWeather.temperature_2m_min;
        const precipitations = dailyWeather.precipitation_sum;
        const weatherCodes = dailyWeather.weathercode;
        const windSpeeds = dailyWeather.windspeed_10m_max;

        let weatherContent = '';
        for (let i = 0; i < days.length; i++) {
            weatherContent += `
                <div class="day-forecast">
                    <h3>${new Date(days[i]).toLocaleDateString()}</h3>
                    <p>Max Temp: ${maxTemps[i]}°F</p>
                    <p>Min Temp: ${minTemps[i]}°F</p>
                    <p>Precipitation: ${precipitations[i]} mm</p>
                    <p>Weather: ${getWeatherEmoji(weatherCodes[i])}</p>
                    <p>Max Wind Speed: ${windSpeeds[i]} m/s</p>
                </div>
            `;
        }

        weatherInfo.innerHTML = weatherContent;
    } else {
        weatherInfo.innerHTML = `<p>Unable to fetch daily weather data.</p>`;
    }
}

function showUpdateNotification() {
    const notification = document.getElementById('update-notification');
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function showFetchNotification() {
    const notification = document.getElementById('fetch-notification');
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function showErrorNotification() {
    const notification = document.getElementById('error-notification');
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function updateBackground(weatherCode) {
    const background = document.getElementById('background');
    background.innerHTML = ''; // Clear existing weather elements

    if (weatherCode === 0) {
        const sun = document.createElement('div');
        sun.className = 'sun';
        background.appendChild(sun);
    } else if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) {
        const rain = document.createElement('div');
        rain.className = 'rain';
        background.appendChild(rain);
    } else if ([1, 2, 3].includes(weatherCode)) {
        const clouds = document.createElement('div');
        clouds.className = 'clouds';

        const cloud1 = document.createElement('div');
        cloud1.className = 'cloud cloud1';
        clouds.appendChild(cloud1);

        const cloud2 = document.createElement('div');
        cloud2.className = 'cloud cloud2';
        clouds.appendChild(cloud2);

        background.appendChild(clouds);
    }
}