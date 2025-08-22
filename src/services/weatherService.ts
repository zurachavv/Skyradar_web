import { WeatherResponse } from "@/types/api.types";

/**
 * Convert Fahrenheit to Celsius
 */
export const fahrenheitToCelsius = (fahrenheit: number): number => {
  return Math.round((fahrenheit - 32) * (5 / 9));
};

/**
 * Fetch weather data for an airport using IATA code
 */
export const fetchAirportWeather = async (
  airportIata: string
): Promise<WeatherResponse | null> => {
  try {
    const apiUrl = `/api/weather?airport=${encodeURIComponent(airportIata)}`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const weatherData: WeatherResponse = await response.json();
    return weatherData;
  } catch (error) {
    return null;
  }
};

/**
 * Get formatted temperature string with both F and C
 */
export const getFormattedTemperature = (
  temperature: number,
  units: string
): string => {
  if (units === "F") {
    const celsius = fahrenheitToCelsius(temperature);
    return `${celsius}°C`;
  }
  return `${temperature}°${units}`;
};

/**
 * Get weather icon URL based on icon code
 */
export const getWeatherIconUrl = (iconCode: string): string => {
  // FlightView weather icons are typically 2-digit codes
  // You might need to map these to actual icon URLs or use a weather icon library
  return `/weather-icons/${iconCode}.png`;
};
