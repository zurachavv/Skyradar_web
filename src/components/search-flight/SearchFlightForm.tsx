"use client";

import { useState } from "react";
import { LOADING_MESSAGES } from "@/constants/errorMessages";

interface SearchFlightFormProps {
  onSubmit: (flightNumber: string, departureDate: string) => void;
  loading: boolean;
  error: string | null;
}

const SearchFlightForm = ({
  onSubmit,
  loading,
  error,
}: SearchFlightFormProps) => {
  const [flightNumber, setFlightNumber] = useState("");
  const [dateOption, setDateOption] = useState<"today" | "tomorrow" | "custom">(
    "today"
  );
  const [customDate, setCustomDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  // Get formatted dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]; // YYYY-MM-DD format
  };

  const getSelectedDate = () => {
    switch (dateOption) {
      case "today":
        return formatDate(today);
      case "tomorrow":
        return formatDate(tomorrow);
      case "custom":
        return customDate || formatDate(today);
      default:
        return formatDate(today);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightNumber.trim()) return;
    onSubmit(flightNumber.trim(), getSelectedDate());
  };

  const handleCustomDateSelect = () => {
    setDateOption("custom");
    setShowCalendar(true);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header Text */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-skyradar-black mb-2">
          Get all flight updates by SMS for free
        </h2>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
            placeholder="Type your flight number"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-skyradar-green focus:border-transparent text-lg"
            disabled={loading}
          />
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Departure Date
          </label>
          <div className="grid grid-cols-3 gap-2">
            {/* Today Option */}
            <button
              type="button"
              onClick={() => setDateOption("today")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateOption === "today"
                  ? "bg-skyradar-green text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              disabled={loading}
            >
              Today
            </button>

            {/* Tomorrow Option */}
            <button
              type="button"
              onClick={() => setDateOption("tomorrow")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateOption === "tomorrow"
                  ? "bg-skyradar-green text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              disabled={loading}
            >
              Tomorrow
            </button>

            {/* Custom Date Option */}
            <button
              type="button"
              onClick={handleCustomDateSelect}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateOption === "custom"
                  ? "bg-skyradar-green text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              disabled={loading}
            >
              Pick Date
            </button>
          </div>

          {/* Calendar Picker */}
          {dateOption === "custom" && (
            <div className="mt-2">
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                min={formatDate(today)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-skyradar-green focus:border-transparent"
                disabled={loading}
              />
            </div>
          )}

          {/* Selected Date Display */}
          <p className="text-xs text-gray-500 mt-1">
            Selected: {new Date(getSelectedDate()).toLocaleDateString()}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !flightNumber.trim()}
          className="w-full bg-skyradar-green text-white py-3 px-6 rounded-lg font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {LOADING_MESSAGES.SEARCHING}
            </>
          ) : (
            LOADING_MESSAGES.CHECK_FLIGHT_STATUS
          )}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </form>

      {/* Info Text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          100% free, no credit card required
        </p>
      </div>
    </div>
  );
};

export default SearchFlightForm;
