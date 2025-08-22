// Centralized error messages following DRY principle

export const ERROR_MESSAGES = {
  INVALID_HEX:
    "Invalid flight tracking data. Please search for the flight again.",
  FLIGHT_DATA_UNAVAILABLE:
    "Flight data not available. The flight may have ended or be out of range.",
  GENERAL_ERROR: "Unable to load flight data. Please try again later.",
  FLIGHT_NOT_FOUND:
    "Flight not found. Please check the flight number and try again.",
  FLIGHT_NO_HEX:
    "Flight found but detailed tracking is not available. This might be a scheduled flight that hasn't taken off yet.",
  SEARCH_ERROR: "Unable to search for flight. Please try again later.",
  NO_FLIGHT_DATA: "Flight information is currently unavailable.",
} as const;

export const SUCCESS_MESSAGES = {
  FLIGHT_FOUND: "✅ Flight found, navigating to details page",
  FLIGHT_DATA_LOADED: "✅ Flight data loaded successfully",
} as const;

export const LOADING_MESSAGES = {
  SEARCHING: "Searching...",
  LOADING_DETAILS: "Loading flight details...",
  CHECK_FLIGHT_STATUS: "CHECK FLIGHT STATUS",
} as const;
