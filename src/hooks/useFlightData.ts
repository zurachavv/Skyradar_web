import { useState, useEffect } from "react";
import { UnifiedFlightData } from "@/types/api.types";
import {
  FlightStatusData,
  FlightDisplayConfig,
  FlightMapData,
} from "@/types/flightStatus.types";
import {
  fetchFlightViewData,
  getAircraftHex,
  fetchFlightDataByHex,
} from "@/services/flightService";
import {
  extractFlightStatusData,
  getFlightDisplayConfig,
  getFlightMapData,
} from "@/utils/flightStatusUtils";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants/errorMessages";

interface UseFlightDataReturn {
  flightData: UnifiedFlightData | null;
  statusData: FlightStatusData | null;
  displayConfig: FlightDisplayConfig | null;
  mapData: FlightMapData | null;
  loading: boolean;
  error: string | null;
}

export const useFlightData = (flightNumber: string): UseFlightDataReturn => {
  const [flightData, setFlightData] = useState<UnifiedFlightData | null>(null);
  const [statusData, setStatusData] = useState<FlightStatusData | null>(null);
  const [displayConfig, setDisplayConfig] =
    useState<FlightDisplayConfig | null>(null);
  const [mapData, setMapData] = useState<FlightMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFlightData = async () => {
      if (!flightNumber) return;

      setLoading(true);
      setError(null);

      try {
        console.log("🔄 Loading flight data for:", flightNumber);

        // Step 1: Fetch FlightView data
        const flightViewData = await fetchFlightViewData(flightNumber);

        if (!flightViewData) {
          setError(ERROR_MESSAGES.FLIGHT_DATA_UNAVAILABLE);
          return;
        }

        console.log("✅ FlightView data loaded:", {
          status: flightViewData.status,
          route: `${flightViewData.airports.departure.code} → ${flightViewData.airports.arrival.code}`,
        });

        // Step 2: Always fetch hex and aircraft data for airline ICAO (needed for logo)
        console.log("📡 Fetching aircraft data for airline logo...");

        try {
          // Get hex from FlightRadar24
          const hex = await getAircraftHex(flightNumber);

          if (hex && hex !== "unknown") {
            console.log("✈️ Found hex, fetching aircraft data:", hex);

            // Get aircraft data from PlaneFinder
            const aircraftData = await fetchFlightDataByHex(hex, flightNumber);

            if (aircraftData) {
              // Always add the airline ICAO code for logo display
              if (aircraftData.payload.aircraft?.airlineICAO) {
                flightViewData.airlineICAO =
                  aircraftData.payload.aircraft.airlineICAO;
                console.log(
                  "✅ Airline ICAO added:",
                  aircraftData.payload.aircraft.airlineICAO
                );
              }

              // Check if we need live position for this status
              const needsLivePosition = [
                "Departed",
                "In Air",
                "Landed",
              ].includes(flightViewData.status);

              if (
                needsLivePosition &&
                aircraftData.payload.dynamic?.lat &&
                aircraftData.payload.dynamic?.lon
              ) {
                // Add live position data
                flightViewData.liveData = {
                  position: {
                    lat: aircraftData.payload.dynamic.lat,
                    lng: aircraftData.payload.dynamic.lon,
                  },
                  altitude: aircraftData.payload.dynamic.altitude || 0,
                  speed:
                    aircraftData.payload.dynamic.speed ||
                    aircraftData.payload.dynamic.groundSpeed ||
                    0,
                  heading: aircraftData.payload.dynamic.heading || 0,
                  trackAngle:
                    aircraftData.payload.dynamic.trackAngle || undefined,
                };

                console.log("✅ Live position also added:", {
                  lat: flightViewData.liveData.position.lat,
                  lng: flightViewData.liveData.position.lng,
                  altitude: flightViewData.liveData.altitude,
                });
              }

              // Store raw PlaneFinder data for enhanced delay calculations
              flightViewData._raw = aircraftData;

              // Add airport coordinates from PlaneFinder if FlightView doesn't have them
              if (
                aircraftData.payload.status.departureAirport &&
                !flightViewData.airports.departure.coordinates
              ) {
                flightViewData.airports.departure.coordinates = {
                  lat: aircraftData.payload.status.departureAirport.Latitude,
                  lng: aircraftData.payload.status.departureAirport.Longitude,
                };
                console.log(
                  "✅ Added departure coordinates from PlaneFinder:",
                  flightViewData.airports.departure.coordinates
                );
              }

              if (
                aircraftData.payload.status.arrivalAirport &&
                !flightViewData.airports.arrival.coordinates
              ) {
                flightViewData.airports.arrival.coordinates = {
                  lat: aircraftData.payload.status.arrivalAirport.Latitude,
                  lng: aircraftData.payload.status.arrivalAirport.Longitude,
                };
                console.log(
                  "✅ Added arrival coordinates from PlaneFinder:",
                  flightViewData.airports.arrival.coordinates
                );
              }
            }
          } else {
            console.log("⚠️ No hex found for", flightNumber);
          }
        } catch (aircraftError) {
          console.log("⚠️ Aircraft data fetch failed:", aircraftError);
        }

        // Debug airport coordinates before processing
        console.log("🏭 Final airport data before map processing:", {
          departure: {
            code: flightViewData.airports.departure.code,
            coordinates: flightViewData.airports.departure.coordinates,
            hasCoordinates: !!flightViewData.airports.departure.coordinates,
          },
          arrival: {
            code: flightViewData.airports.arrival.code,
            coordinates: flightViewData.airports.arrival.coordinates,
            hasCoordinates: !!flightViewData.airports.arrival.coordinates,
          },
        });

        // Step 3: Process flight data through status utilities
        const statusInfo = extractFlightStatusData(flightViewData);
        const displayInfo = getFlightDisplayConfig(statusInfo);
        const mapInfo = getFlightMapData(flightViewData, statusInfo);

        console.log("📊 Flight status processed:", {
          status: statusInfo.status,
          showPlane: displayInfo.showPlane,
          showLivePosition: mapInfo.showLivePosition,
          statusMessage: displayInfo.statusMessage,
        });

        setFlightData(flightViewData);
        setStatusData(statusInfo);
        setDisplayConfig(displayInfo);
        setMapData(mapInfo);

        console.log(SUCCESS_MESSAGES.FLIGHT_DATA_LOADED);
      } catch (err) {
        console.error("❌ Error loading flight data:", err);
        setError(ERROR_MESSAGES.GENERAL_ERROR);
      } finally {
        setLoading(false);
      }
    };

    loadFlightData();
  }, [flightNumber]);

  return {
    flightData,
    statusData,
    displayConfig,
    mapData,
    loading,
    error,
  };
};
