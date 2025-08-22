import {
  FlightViewResponse,
  FlightData,
  UnifiedFlightData,
} from "@/types/api.types";

/**
 * Parse FlightView time format to ISO string
 * Converts "22:06, Aug 22" to proper ISO format using departure date context
 */
const parseFlightViewTime = (
  timeString: string | null,
  contextDate: string
): string | null => {
  if (!timeString || !contextDate) return null;

  try {
    // Extract timezone from context date (e.g., "2025-08-22T22:06:00-04:00")
    const contextDateTime = new Date(contextDate);
    const year = contextDateTime.getFullYear();

    // Parse "22:06, Aug 22" format
    const [time, dateStr] = timeString.split(", ");
    const [hours, minutes] = time.split(":").map(Number);

    // Parse "Aug 22" to get month and day
    const monthMap: Record<string, number> = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };

    const [monthStr, dayStr] = dateStr.split(" ");
    const month = monthMap[monthStr];
    const day = parseInt(dayStr);

    if (month === undefined || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
      return contextDate; // Fallback to context date
    }

    // Create new date with parsed time in same timezone as context
    const parsedDate = new Date(year, month, day, hours, minutes);

    // Get timezone offset from context date
    const timezoneMatch = contextDate.match(/([+-]\d{2}:\d{2})$/);
    const timezone = timezoneMatch ? timezoneMatch[1] : "";

    // Format as ISO string with timezone
    const isoString = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}T${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:00${timezone}`;

    return isoString;
  } catch (error) {
    console.warn("Failed to parse FlightView time:", timeString, error);
    return contextDate; // Fallback to context date
  }
};

/**
 * Transform FlightView API response to unified format
 */
export const transformFlightViewResponse = (
  response: FlightViewResponse
): UnifiedFlightData => {
  const { flight } = response;

  if (!flight) {
    throw new Error("Flight data is null in FlightView response");
  }

  // Parse scheduled and estimated times properly
  const departureScheduled = flight.departure.departureDateTime;
  const departureEstimated = parseFlightViewTime(
    flight.departure.estimatedTime,
    flight.departure.departureDateTime
  );

  const arrivalScheduled = flight.arrival.arrivalDateTime;
  const arrivalEstimated = parseFlightViewTime(
    flight.arrival.estimatedTime,
    flight.arrival.arrivalDateTime
  );

  // Extract airline info from title like "American Airlines (AA) 176"
  const titleParts = flight.titles.main.split(" ");
  const airlineCodeMatch = flight.titles.main.match(/\(([A-Z0-9]{2,3})\)/);
  const airlineCode = airlineCodeMatch ? airlineCodeMatch[1] : "";
  const flightNumberMatch = flight.titles.main.match(
    /\([A-Z0-9]{2,3}\)\s*(\d+)/
  );
  const flightNumber = flightNumberMatch
    ? flightNumberMatch[1]
    : titleParts[titleParts.length - 1];

  // Extract airline name (everything before the parentheses)
  const airlineName = flight.titles.main
    .replace(/\s*\([A-Z0-9]{2,3}\).*$/, "")
    .trim();

  return {
    flightNumber: `(${airlineCode}) ${flightNumber}`, // Store with airline code for easier parsing
    airline: airlineName,
    aircraftType: flight.aircraft.name,
    status: flight.flightStatus,
    // FlightView doesn't provide ICAO code directly, will be added when live data is merged

    departure: {
      scheduled: departureScheduled,
      estimated: departureEstimated,
      actual: flight.departure.outGateTime,
      gate: flight.departure.gate,
      terminal: flight.departure.terminal,
    },

    arrival: {
      scheduled: arrivalScheduled,
      estimated: arrivalEstimated,
      actual: flight.arrival.inGateTime,
      gate: flight.arrival.gate,
      terminal: flight.arrival.terminal,
      timeRemaining: flight.arrival.timeRemaining,
    },

    airports: {
      departure: {
        code: flight.departure.airportCode,
        name: flight.departure.airport,
        city: flight.departure.airportCity,
        country: flight.departure.airportCountryCode,
      },
      arrival: {
        code: flight.arrival.airportCode,
        name: flight.arrival.airport,
        city: flight.arrival.airportCity,
        country: flight.arrival.airportCountryCode,
      },
    },

    source: "flightview",
  };
};

/**
 * Transform PlaneFinder API response to unified format
 */
export const transformPlaneFinderResponse = (
  response: FlightData
): UnifiedFlightData => {
  const { payload } = response;

  return {
    flightNumber: payload.static?.iata || payload.status.flightNumber || "",
    airline: payload.aircraft?.airline || "",
    aircraftType: payload.aircraft?.type || payload.status.aircraftType || "",
    status: "In Flight", // PlaneFinder doesn't provide explicit status
    airlineICAO: payload.aircraft?.airlineICAO || undefined,

    departure: {
      scheduled: payload.status.departureTimeScheduled
        ? new Date(
            payload.status.departureTimeScheduled * 1000
          ).toLocaleString()
        : null,
      estimated: payload.status.departureTimeEstimated
        ? new Date(
            payload.status.departureTimeEstimated * 1000
          ).toLocaleString()
        : null,
      actual: payload.status.departureTimeActual
        ? new Date(payload.status.departureTimeActual * 1000).toLocaleString()
        : null,
      gate: payload.status.departureGate || null,
      terminal: payload.status.departureTerminal || null,
    },

    arrival: {
      scheduled: payload.status.arrivalTimeScheduled
        ? new Date(payload.status.arrivalTimeScheduled * 1000).toLocaleString()
        : null,
      estimated: payload.status.arrivalTimeEstimated
        ? new Date(payload.status.arrivalTimeEstimated * 1000).toLocaleString()
        : null,
      actual: payload.status.arrivalTimeActual
        ? new Date(payload.status.arrivalTimeActual * 1000).toLocaleString()
        : null,
      gate: payload.status.arrivalGate || null,
      terminal: payload.status.arrivalTerminal || null,
    },

    airports: {
      departure: {
        code:
          payload.status.departureAirport?.IATA ||
          payload.status.departureAirportIATA,
        name: payload.status.departureAirport?.Name || "",
        city: payload.status.departureAirport?.City || "",
        country: payload.status.departureAirport?.Country,
        coordinates: payload.status.departureAirport
          ? {
              lat: payload.status.departureAirport.Latitude,
              lng: payload.status.departureAirport.Longitude,
            }
          : undefined,
      },
      arrival: {
        code:
          payload.status.arrivalAirport?.IATA ||
          payload.status.arrivalAirportIATA,
        name: payload.status.arrivalAirport?.Name || "",
        city: payload.status.arrivalAirport?.City || "",
        country: payload.status.arrivalAirport?.Country,
        coordinates: payload.status.arrivalAirport
          ? {
              lat: payload.status.arrivalAirport.Latitude,
              lng: payload.status.arrivalAirport.Longitude,
            }
          : undefined,
      },
    },

    // Live tracking data
    liveData:
      payload.dynamic?.lat && payload.dynamic?.lon
        ? {
            position: {
              lat: payload.dynamic.lat,
              lng: payload.dynamic.lon,
            },
            altitude: payload.dynamic.altitude || 0,
            speed: payload.dynamic.speed || payload.dynamic.groundSpeed || 0,
            heading: payload.dynamic.heading || 0,
            trackAngle: payload.dynamic.trackAngle || undefined,
          }
        : undefined,

    source: "planefinder",
    hex: payload.static?.hex,
  };
};
