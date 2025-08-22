"use client";

import { useState, useEffect } from "react";
import { WeatherResponse } from "@/types/api.types";
import {
  fetchAirportWeather,
  getFormattedTemperature,
} from "@/services/weatherService";

interface WeatherDisplayProps {
  airportIata: string;
  airportCity?: string;
}

const WeatherDisplay = ({ airportIata, airportCity }: WeatherDisplayProps) => {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeather = async () => {
      if (!airportIata) return;

      setLoading(true);
      setError(null);

      try {
        const weatherData = await fetchAirportWeather(airportIata);
        if (weatherData) {
          setWeather(weatherData);
        } else {
          setError("Weather data unavailable");
        }
      } catch (err) {
        console.error("Error fetching weather:", err);
        setError("Failed to load weather");
      } finally {
        setLoading(false);
      }
    };

    loadWeather();
  }, [airportIata]);

  if (loading) {
    return (
      <div className="flex items-center space-x-1 text-xs text-gray-500">
        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>Loading weather...</span>
      </div>
    );
  }

  if (error || !weather) {
    return null; // Don't show anything if weather fails
  }

  return (
    <div className="flex items-center space-x-2 text-xs text-gray-600">
      {/* Weather Icon */}
      <div className="flex items-center space-x-1">
        <svg
          className="h-4 w-4 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-medium">
          {getFormattedTemperature(
            weather.temperature,
            weather.temperatureUnits
          )}
        </span>
      </div>

      {/* Weather Phrase */}
      <span className="text-gray-500">{weather.phrase}</span>
    </div>
  );
};

export default WeatherDisplay;
