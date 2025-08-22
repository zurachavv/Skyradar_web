import { FlightData } from "@/services/flightService";
import { NavbarProps } from "@/types/components";

// Single Responsibility: Extract flight route data
export const extractFlightRoute = (flightData: FlightData | null) => {
  if (!flightData?.payload?.status?.departureAirport?.Latitude) {
    console.log("🗺️ No departure airport coordinates available");
    return null;
  }
  if (!flightData?.payload?.status?.arrivalAirport?.Latitude) {
    console.log("🗺️ No arrival airport coordinates available");
    return null;
  }

  const route = {
    departure: {
      lat: flightData.payload.status.departureAirport.Latitude,
      lng: flightData.payload.status.departureAirport.Longitude,
    },
    arrival: {
      lat: flightData.payload.status.arrivalAirport.Latitude,
      lng: flightData.payload.status.arrivalAirport.Longitude,
    },
  };

  console.log("🗺️ Airport coordinates:", {
    departure: `${route.departure.lat}, ${route.departure.lng}`,
    arrival: `${route.arrival.lat}, ${route.arrival.lng}`,
  });

  return route;
};

// Single Responsibility: Extract live position data
export const extractLivePosition = (flightData: FlightData | null) => {
  if (
    !flightData?.payload?.dynamic?.lat ||
    !flightData?.payload?.dynamic?.lon
  ) {
    console.log("✈️ No live position data available");
    return null;
  }

  const position = {
    lat: flightData.payload.dynamic.lat,
    lng: flightData.payload.dynamic.lon,
    heading: flightData.payload.dynamic.heading || undefined,
    trackAngle: flightData.payload.dynamic.trackAngle || undefined,
  };

  console.log("✈️ Live plane position:", {
    coordinates: `${position.lat}, ${position.lng}`,
    heading: position.heading,
    trackAngle: position.trackAngle,
  });

  return position;
};

// Single Responsibility: Extract flight info for navbar
export const extractFlightInfo = (
  flightData: FlightData | null,
  fallbackFlightNumber: string
): { flightCode: string; airline: string } => {
  if (!flightData) return { flightCode: fallbackFlightNumber, airline: "" };

  const { payload } = flightData;
  const staticData = payload?.static;
  const flightCode =
    staticData?.iata ||
    staticData?.icao ||
    payload?.status?.flightNumber ||
    fallbackFlightNumber;
  const airline = payload?.aircraft?.airline || "";

  return { flightCode, airline };
};

// Single Responsibility: Create navbar props for flight details
export const createFlightDetailsNavbarProps = (
  flightData: FlightData | null,
  flightNumber: string,
  onBack?: () => void
): NavbarProps => {
  const { flightCode, airline } = extractFlightInfo(flightData, flightNumber);

  return {
    title: "Flight Details",
    showBack: onBack !== undefined,
    onBack,
    flightCode,
    airline,
  };
};

// Single Responsibility: Validate hex format
export const isValidHex = (hex: string): boolean => {
  // Handle FlightView special case
  if (hex === "flightview") {
    return true;
  }

  return hex !== "unknown" && hex.length >= 4;
};
