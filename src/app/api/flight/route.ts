import { NextRequest, NextResponse } from "next/server";
import {
  parseFlightNumber,
  formatDateForFlightView,
} from "@/utils/flightNumberUtils";
import { transformFlightViewResponse } from "@/utils/apiTransforms";
import { FlightViewResponse, UnifiedFlightData } from "@/types/api.types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const flightNumber = searchParams.get("flight");
  const requestedDepartureDate = searchParams.get("departureDate");

  if (!flightNumber) {
    return NextResponse.json(
      { error: "Flight number is required" },
      { status: 400 }
    );
  }

  try {
    console.log(
      "🔄 API Route: Fetching flight data for:",
      flightNumber,
      requestedDepartureDate ? `on ${requestedDepartureDate}` : ""
    );

    const parsedFlight = parseFlightNumber(flightNumber);
    // Use provided date or default to today
    const departureDate = requestedDepartureDate || formatDateForFlightView();

    if (!parsedFlight.iata) {
      console.log("⚠️ API Route: Invalid flight number format:", flightNumber);
      return NextResponse.json(
        { error: "Invalid flight number format" },
        { status: 400 }
      );
    }

    const apiUrl = `https://app-api.flightview.com/api/v2/flight/${parsedFlight.iata}/${parsedFlight.number}?departureDate=${departureDate}`;

    console.log("🔍 API Route: FlightView API call:", {
      originalFlight: flightNumber,
      parsedIATA: parsedFlight.iata,
      parsedNumber: parsedFlight.number,
      departureDate,
      url: apiUrl,
    });

    // Make the request from the server-side (no CORS issues)
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        accept: "*/*",
        "accept-language": "en-GB",
        origin: "https://www.flightview.com",
        referer: "https://www.flightview.com/",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    console.log(
      "📡 API Route: FlightView API Response status:",
      response.status
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ API Route: FlightView API error:",
        response.status,
        errorText
      );
      return NextResponse.json(
        { error: `FlightView API error: ${response.status}` },
        { status: response.status }
      );
    }

    const responseText = await response.text();
    console.log("📄 API Route: Raw response length:", responseText.length);

    let data: FlightViewResponse;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(
        "❌ API Route: Failed to parse FlightView response as JSON:",
        parseError
      );
      return NextResponse.json(
        { error: "Invalid JSON response from FlightView API" },
        { status: 500 }
      );
    }

    // Check if we have no data at all
    if (
      data.emptyResults ||
      (!data.flight && (!data.flights || data.flights.length === 0))
    ) {
      console.log("⚠️ API Route: No flight data found for:", flightNumber);
      return NextResponse.json(
        { error: "No flight data found" },
        { status: 404 }
      );
    }

    // If flight is null but we have flights array, flight might have ended
    if (!data.flight && data.flights && data.flights.length > 0) {
      console.log(
        "📡 API Route: Flight is null but flights array has data, flight might have ended"
      );
      console.log(
        "🔄 API Route: Attempting to use PlaneFinder API as fallback..."
      );

      // Return a special response indicating we should try PlaneFinder
      return NextResponse.json({
        usePlaneFinder: true,
        flights: data.flights,
        flightNumber: flightNumber,
      });
    }

    console.log("✅ API Route: Successfully fetched flight data");
    const unifiedData = transformFlightViewResponse(data);

    console.log("🎯 API Route: Transformed flight data:", {
      flightNumber: unifiedData.flightNumber,
      airline: unifiedData.airline,
      status: unifiedData.status,
      route: `${unifiedData.airports.departure.code} → ${unifiedData.airports.arrival.code}`,
    });

    return NextResponse.json(unifiedData);
  } catch (error) {
    console.error("💥 API Route: Flight data fetch failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
