// Import types from centralized location
import {
  FlightData,
  FlightSummaryResponse,
  FlightViewResponse,
  UnifiedFlightData,
  ApiError,
} from "@/types/api.types";
import {
  parseFlightNumber,
  formatDateForFlightView,
} from "@/utils/flightNumberUtils";
import {
  transformFlightViewResponse,
  transformPlaneFinderResponse,
} from "@/utils/apiTransforms";

// Re-export for backward compatibility
export type { FlightData, UnifiedFlightData };

/**
 * Fetch flight data from FlightView API
 * Uses IATA code + number + date format
 * Returns UnifiedFlightData format
 */
export const fetchFlightViewData = async (
  flightNumber: string,
  departureDate?: string
): Promise<UnifiedFlightData | null> => {
  try {
    console.log(
      "🚀 FlightView: Starting fetch for:",
      flightNumber,
      departureDate ? `on ${departureDate}` : ""
    );

    // Use our Next.js API route to avoid CORS issues
    let apiUrl = `/api/flight?flight=${encodeURIComponent(flightNumber)}`;
    if (departureDate) {
      apiUrl += `&departureDate=${encodeURIComponent(departureDate)}`;
    }

    console.log("🔍 FlightView: Calling API route:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📡 FlightView: API route response status:", response.status);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      console.error(
        "❌ FlightView API route error:",
        response.status,
        errorData
      );
      return null;
    }

    const responseData = await response.json();

    // Check if we need to use PlaneFinder as fallback
    if (responseData.usePlaneFinder) {
      console.log("🔄 FlightView: Flight ended, using PlaneFinder fallback...");
      return await fetchWithPlaneFinderFallback(flightNumber);
    }

    const unifiedData: UnifiedFlightData = responseData;

    console.log("✅ FlightView: Successfully fetched flight data");
    console.log("🎯 FlightView unified data:", {
      flightNumber: unifiedData.flightNumber,
      airline: unifiedData.airline,
      status: unifiedData.status,
      route: `${unifiedData.airports.departure.code} → ${unifiedData.airports.arrival.code}`,
    });

    return unifiedData;
  } catch (error) {
    console.error("💥 FlightView API fetch failed:", error);
    return null;
  }
};

/**
 * Fallback function to use PlaneFinder when FlightView flight is null
 */
const fetchWithPlaneFinderFallback = async (
  flightNumber: string
): Promise<UnifiedFlightData | null> => {
  try {
    console.log("🔄 PlaneFinder Fallback: Starting for flight:", flightNumber);

    // Get aircraft hex from FlightRadar24
    const hex = await getAircraftHex(flightNumber);
    if (!hex || hex === "unknown") {
      console.log("⚠️ PlaneFinder Fallback: No hex found for", flightNumber);
      return null;
    }

    console.log("✈️ PlaneFinder Fallback: Found hex:", hex);

    // Get flight data from PlaneFinder
    const planefinderData = await fetchFlightDataByHex(hex, flightNumber);
    if (!planefinderData) {
      console.log("⚠️ PlaneFinder Fallback: No data found for hex:", hex);
      return null;
    }

    // Transform PlaneFinder data to UnifiedFlightData format
    const unifiedData = transformPlaneFinderResponse(planefinderData);

    console.log("✅ PlaneFinder Fallback: Successfully transformed data:", {
      flightNumber: unifiedData.flightNumber,
      airline: unifiedData.airline,
      status: unifiedData.status,
      source: unifiedData.source,
    });

    return unifiedData;
  } catch (error) {
    console.error("💥 PlaneFinder Fallback failed:", error);
    return null;
  }
};

export const getAircraftHex = async (
  flightNumber: string
): Promise<string | null> => {
  try {
    // Use a wider search window to catch flights that might have taken off yesterday
    // Start from beginning of yesterday, end at end of tomorrow
    const today = new Date();
    const startOfYesterday = new Date(today);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0); // Start of yesterday (00:00:00)

    const endOfTomorrow = new Date(today);
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 2);
    endOfTomorrow.setHours(0, 0, 0, 0); // Start of day after tomorrow (gives us full tomorrow)

    // Format dates to match the working curl example: 2025-08-21T13:17:14Z
    const flightDatetimeFrom = startOfYesterday
      .toISOString()
      .replace(/\.\d{3}Z$/, "Z");
    const flightDatetimeTo = endOfTomorrow
      .toISOString()
      .replace(/\.\d{3}Z$/, "Z");

    console.log("🔍 Starting FlightRadar24 API call for flight:", flightNumber);
    console.log("📅 Search period (expanded window):", {
      from: flightDatetimeFrom,
      to: flightDatetimeTo,
      explanation:
        "Searching from start of yesterday to end of tomorrow to catch all flights",
    });

    const apiUrl = `https://fr24api.flightradar24.com/api/flight-summary/light?flight_datetime_from=${encodeURIComponent(
      flightDatetimeFrom
    )}&flight_datetime_to=${encodeURIComponent(
      flightDatetimeTo
    )}&flights=${flightNumber}`;

    console.log("🌐 FlightRadar24 API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept-Version": "v1",
        Accept: "application/json",
        Authorization:
          "Bearer 0198cdbf-9720-7057-8479-3e0490b96973|nYmX8pGd5LSae3fplYUO4rWf0t2ajC1pvfrV8VGeed4c9f5c",
      },
      mode: "cors", // Explicitly set CORS mode
    });

    console.log("📡 FlightRadar24 API Response status:", response.status);
    console.log(
      "📡 FlightRadar24 API Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ FlightRadar24 API error response:", errorText);
      console.error("❌ Request details that failed:", {
        url: apiUrl,
        headers: {
          "Accept-Version": "v1",
          Accept: "application/json",
          Authorization:
            "Bearer 0198cdbf-9720-7057-8479-3e0490b96973|nYmX8pGd5LSae3fplYUO4rWf0t2ajC1pvfrV8VGeed4c9f5c",
        },
      });
      throw new Error(
        `FlightRadar24 API error! status: ${response.status} - ${errorText}`
      );
    }

    const responseText = await response.text();
    console.log("📄 FlightRadar24 API Raw Response:", responseText);

    let data: FlightSummaryResponse;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(
        "❌ Failed to parse FlightRadar24 response as JSON:",
        parseError
      );
      throw new Error("Invalid JSON response from FlightRadar24");
    }

    console.log("📊 FlightRadar24 API Parsed Data:", data);

    if (data.data && data.data.length > 0) {
      const flightInfo = data.data[data.data.length - 1];
      console.log("✈️ Found flight info from FlightRadar24:", {
        flight: flightInfo.flight,
        hex: flightInfo.hex,
        callsign: flightInfo.callsign,
        aircraft: flightInfo.type,
        registration: flightInfo.reg,
        route: `${flightInfo.orig_icao} → ${flightInfo.dest_icao}`,
        takeoff: flightInfo.datetime_takeoff,
        flightEnded: flightInfo.flight_ended,
      });
      console.log("🔑 Extracted aircraft hex:", flightInfo.hex);
      return flightInfo.hex;
    }

    console.log(
      "⚠️ No flight data found in FlightRadar24 response for:",
      flightNumber
    );
    console.log(
      "📋 Response data array length:",
      data.data ? data.data.length : "undefined"
    );
    return null;
  } catch (error) {
    console.error("💥 Error fetching aircraft hex:", error);
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      console.error(
        "🚫 This looks like a CORS error - FlightRadar24 API might not allow browser requests"
      );
    }
    return null;
  }
};

export const fetchFlightDataByHex = async (
  aircraftHex: string,
  flightNumber: string
): Promise<FlightData | null> => {
  console.log("🚀 Fetching flight data directly with hex:", {
    aircraftHex,
    flightNumber,
  });

  try {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const planefinderUrl = `https://planefinder.net/api/v3/aircraft/live/metadata/0/${aircraftHex}/${currentTimestamp}/${flightNumber}`;

    console.log("🛩️ PlaneFinder API call details:", {
      flightNumber,
      aircraftHex,
      timestamp: currentTimestamp,
      url: planefinderUrl,
    });

    const response = await fetch(planefinderUrl);
    console.log("📡 PlaneFinder API Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ PlaneFinder API error response:", errorText);
      throw new Error(
        `PlaneFinder API error! status: ${response.status} - ${errorText}`
      );
    }

    const responseText = await response.text();
    console.log(
      "📄 PlaneFinder API Raw Response:",
      responseText.substring(0, 500) + "..."
    );

    let data: FlightData;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(
        "❌ Failed to parse PlaneFinder response as JSON:",
        parseError
      );
      throw new Error("Invalid JSON response from PlaneFinder");
    }

    if (!data.success) {
      console.error("❌ PlaneFinder API returned success: false");
      throw new Error("Flight data not found in PlaneFinder");
    }

    console.log("✅ Successfully fetched flight data by hex");
    console.log("🎯 Result summary:", {
      flightNumber,
      aircraftHex,
      hasLivePosition: !!(
        data.payload.dynamic?.lat && data.payload.dynamic?.lon
      ),
      hasAirportData: !!(
        data.payload.status.departureAirport &&
        data.payload.status.arrivalAirport
      ),
    });

    return data;
  } catch (error) {
    console.error("💥 Flight data fetch by hex failed:", error);
    return null;
  }
};

/**
 * Original flight data fetch function using PlaneFinder API
 */
export const fetchFlightData = async (
  flightNumber: string
): Promise<FlightData | null> => {
  console.log("🚀 Starting flight data fetch process for:", flightNumber);

  try {
    // Step 1: Get aircraft hex from FlightRadar24
    console.log("📡 Step 1: Getting aircraft hex from FlightRadar24...");
    const aircraftHex = await getAircraftHex(flightNumber);

    if (!aircraftHex) {
      console.error(
        "❌ Step 1 failed: Could not find aircraft hex for flight:",
        flightNumber
      );
      console.log(
        "💡 This usually means the flight hasn't taken off yet or has already landed"
      );
      return null;
    }

    console.log("✅ Step 1 completed: Aircraft hex obtained:", aircraftHex);

    // Step 2: Get flight details from PlaneFinder using the hex
    const flightData = await fetchFlightDataByHex(aircraftHex, flightNumber);

    // Add the hex to the static data if it's missing
    if (flightData && flightData.payload.static) {
      flightData.payload.static.hex = aircraftHex;
    }

    return flightData;
  } catch (error) {
    console.error("💥 Overall flight data fetch failed:", error);
    return null;
  }
};

// Enhanced flight data function removed - logic moved to flight page component for simplicity

/**
 * Alias for FlightView API - for backward compatibility
 */
export const fetchUnifiedFlightData = async (
  flightNumber: string
): Promise<UnifiedFlightData | null> => {
  return await fetchFlightViewData(flightNumber);
};
