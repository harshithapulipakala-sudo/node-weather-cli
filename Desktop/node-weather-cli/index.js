// Weather CLI Application using Node.js
const https = require('https');

// Get city from command line
const city = process.argv[2];

if (!city) {
  console.log('Please provide a city name.');
  console.log('Example: node index.js "New York"');
  process.exit(1);
}

// Helper function to make HTTPS requests
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';

      if (res.statusCode !== 200) {
        reject(new Error('Request failed'));
      }

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error('Invalid JSON'));
        }
      });
    }).on('error', reject);
  });
}

async function getWeather(city) {
  try {
    // 1️ Get latitude & longitude
    const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const geoData = await fetchJSON(geoURL);

    if (!geoData.results || geoData.results.length === 0) {
      console.log(` City "${city}" not found.`);
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // 2️⃣ Get weather data
    const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const weatherData = await fetchJSON(weatherURL);

    const current = weatherData.current_weather;

    // 3️⃣ Display result
    console.log(` Weather in ${name}, ${country}`);
    console.log(` Temperature: ${current.temperature}°C`);
    console.log(`Wind Speed: ${current.windspeed} km/h`);
    console.log(` Wind Direction: ${current.winddirection}°`);
    console.log(` Time: ${current.time}`);

  } catch (error) {
    console.log(' Failed to fetch weather data.');
  }
}

getWeather(city);
