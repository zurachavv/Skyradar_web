import { ParsedFlightNumber } from "@/types/api.types";

/**
 * Parse flight number to extract IATA code and number
 * Examples: AA176 -> {iata: "AA", number: "176", original: "AA176"}
 *          BA123 -> {iata: "BA", number: "123", original: "BA123"}
 */
export const parseFlightNumber = (flightNumber: string): ParsedFlightNumber => {
  const trimmed = flightNumber.trim().toUpperCase();

  // Match pattern: 2-3 letters followed by numbers
  const match = trimmed.match(/^([A-Z]{2,3})(\d+)$/);

  if (match) {
    return {
      iata: match[1],
      number: match[2],
      original: trimmed,
    };
  }

  // Fallback: if doesn't match standard pattern, treat first 2 chars as IATA
  if (trimmed.length >= 3) {
    return {
      iata: trimmed.substring(0, 2),
      number: trimmed.substring(2),
      original: trimmed,
    };
  }

  // Invalid format fallback
  return {
    iata: "",
    number: trimmed,
    original: trimmed,
  };
};

/**
 * Format current date for FlightView API
 * Returns: YYYY-MM-DD format
 */
export const formatDateForFlightView = (date: Date = new Date()): string => {
  return date.toISOString().split("T")[0];
};

/**
 * Validate if flight number has correct format
 */
export const isValidFlightNumber = (flightNumber: string): boolean => {
  const parsed = parseFlightNumber(flightNumber);
  return parsed.iata.length >= 2 && parsed.number.length > 0;
};
