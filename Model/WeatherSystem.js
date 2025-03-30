import WeatherStatus from "../Enums/WeatherStatus.js";

export default class WeatherSystem {
    constructor() {
        this.API_KEY = "f9721e7a66d8e62e83952fbe42fe8141";
        this.currentWeather = null;
        this.currentTemperature = null;
        this.isPrecipitation = false;
        this.cityName = "London"; // Default city
        
        // Start with initial weather fetch
        this.fetchWeatherData().catch(error => {
            console.error("Error on initial weather fetch:", error);
            // Set default values if initial fetch fails
            this.currentWeather = "Clear";
            this.currentTemperature = 20;
            this.isPrecipitation = false;
        });
        
        // Set up auto-refresh every 10 minutes
        setInterval(() => this.fetchWeatherData(), 600000);
    }

    // Get the current temperature
    getTemperature() {
        return this.currentTemperature;
    }

    // Check if there is any precipitation (rain or snow)
    hasPrecipitation() {
        return this.isPrecipitation;
    }

    // Set the city to get weather for
    setCity(cityName) {
        this.cityName = cityName;
        return this.fetchWeatherData();
    }

    // Get the current weather status
    getWeatherStatus() {
        if (!this.currentWeather) return WeatherStatus.COLD; // Default

        const weatherMain = this.currentWeather.toLowerCase();
        
        if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) {
            return WeatherStatus.RAINING;
        } else if (weatherMain.includes('snow')) {
            return WeatherStatus.SNOWING;
        } else if (this.currentTemperature > 25) { // If temperature is above 25°C
            return WeatherStatus.HOT;
        } else {
            return WeatherStatus.COLD;
        }
    }

    // Check if there is any precipitation based on weather type
    _checkForPrecipitation() {
        if (!this.currentWeather) return false;
        
        const weatherMain = this.currentWeather.toLowerCase();
        return weatherMain.includes('rain') || 
               weatherMain.includes('drizzle') || 
               weatherMain.includes('snow');
    }

    // Fetch coords for a city using the Geocoding API
    async fetchCityCoords() {
        try {
            const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${this.cityName}&limit=1&appid=${this.API_KEY}`;
            
            const response = await fetch(geoApiUrl);
            
            if (!response.ok) {
                throw new Error(`Error fetching city data: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Check if we got a valid result
            if (data && data.length > 0) {
                return {
                    lat: data[0].lat,
                    lon: data[0].lon
                };
            } else {
                throw new Error('City not found');
            }
        } catch (error) {
            console.error('Error getting city coordinates:', error);
            // Return London coordinates as fallback
            return {
                lat: 51.5074,
                lon: -0.1278
            };
        }
    }

    // Fetch weather data using the Weather API
    async fetchWeatherData() {
        try {
            // First get coordinates for the city
            const coords = await this.fetchCityCoords();
            
            // Then fetch the weather using those coordinates
            const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${this.API_KEY}`;
            
            const response = await fetch(weatherApiUrl);
            
            if (!response.ok) {
                throw new Error(`Error fetching weather data: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Extract and store the weather information
            if (data && data.weather && data.weather.length > 0) {
                this.currentWeather = data.weather[0].main;
                this.currentTemperature = data.main.temp;
                this.isPrecipitation = this._checkForPrecipitation();
                
                return {
                    status: this.getWeatherStatus(),
                    temperature: this.currentTemperature,
                    isPrecipitation: this.isPrecipitation
                };
            } else {
                throw new Error('Weather data not available');
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
            
            // If this is the first fetch (no temperature set yet), set defaults
            if (this.currentTemperature === null) {
                this.currentWeather = "Clear";
                this.currentTemperature = 20;
                this.isPrecipitation = false;
            }
            
            throw error;
        }
    }
}