import { NextRequest, NextResponse } from "next/server";
import { WeatherResponse } from "@/types/api.types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const airportIata = searchParams.get("airport");

  if (!airportIata) {
    return NextResponse.json(
      { error: "Airport IATA code is required" },
      { status: 400 }
    );
  }

  try {
    console.log("🌤️ API Route: Fetching weather data for:", airportIata);

    // FlightView weather API URL
    const weatherApiUrl = `https://app-api.flightview.com/api/weather/${airportIata}/`;

    console.log("🌤️ API Route: Calling FlightView weather API:", weatherApiUrl);

    const response = await fetch(weatherApiUrl, {
      method: "GET",
      headers: {
        origin: "https://www.flightview.com",
        "user-agent": "Mozilla/5.0 (compatible; FlightTracker/1.0)",
        accept: "application/json",
      },
    });

    console.log(
      "🌤️ API Route: FlightView weather API Response status:",
      response.status
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ API Route: FlightView weather API error:",
        response.status,
        errorText
      );
      return NextResponse.json(
        { error: `FlightView weather API error: ${response.status}` },
        { status: response.status }
      );
    }

    const responseText = await response.text();
    console.log(
      "📄 API Route: Raw weather response length:",
      responseText.length
    );

    let data: WeatherResponse;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(
        "❌ API Route: Failed to parse weather response as JSON:",
        parseError
      );
      return NextResponse.json(
        { error: "Invalid JSON response from FlightView weather API" },
        { status: 500 }
      );
    }

    console.log("✅ API Route: Successfully fetched weather data");
    console.log("🌤️ API Route: Weather summary:", {
      location: data.location,
      temperature: data.temperature,
      temperatureUnits: data.temperatureUnits,
      phrase: data.phrase,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("💥 API Route: Weather data fetch failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
