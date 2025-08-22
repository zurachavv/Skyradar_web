import { UnifiedFlightData } from "@/types/api.types";

interface FlightHeaderProps {
  flightData: UnifiedFlightData;
}

// Removed extractAirlineCode function - we now use ICAO directly from PlaneFinder API

/**
 * Format departure date for display using the flight's original timezone
 */
const formatFlightDate = (dateString: string | null): string => {
  if (!dateString) return "";

  try {
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const monthNames = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];

    let date: Date;

    // Check if it's PlaneFinder format: "22/08/2025, 21:13:00"
    if (dateString.match(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}/)) {
      // Parse PlaneFinder format
      const [datePart] = dateString.split(",");
      const [day, month, year] = datePart.trim().split("/").map(Number);
      date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
    } else {
      // Assume ISO format (e.g., "2025-08-22T22:06:00-04:00")
      date = new Date(dateString);

      // Extract timezone from the original string to preserve airport timezone
      const timezoneMatch = dateString.match(/([+-]\d{2}:\d{2})$/);
      if (timezoneMatch) {
        const [, sign, hours, minutes] =
          timezoneMatch[0].match(/([+-])(\d{2}):(\d{2})/) || [];
        if (sign && hours && minutes) {
          const offsetMinutes =
            (parseInt(hours) * 60 + parseInt(minutes)) *
            (sign === "+" ? 1 : -1);
          const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
          date = new Date(utcTime + offsetMinutes * 60000);
        }
      }
    }

    if (isNaN(date.getTime())) {
      return "";
    }

    const dayName = dayNames[date.getDay()];
    const day = date.getDate();
    const monthName = monthNames[date.getMonth()];

    return `${dayName}, ${day} ${monthName}`;
  } catch {
    return "";
  }
};

const FlightHeader = ({ flightData }: FlightHeaderProps) => {
  // Debug: Log all flight data
  console.log("🔴 FlightHeader DEBUG:", {
    flightNumber: flightData.flightNumber,
    airline: flightData.airline,
    airlineICAO: flightData.airlineICAO,
    departure: flightData.departure,
    arrival: flightData.arrival,
    airports: flightData.airports,
    source: flightData.source,
  });

  // Use ICAO from flight data - should always be available from PlaneFinder API
  const icaoCode = flightData.airlineICAO;

  if (!icaoCode) {
    console.warn("⚠️ No airline ICAO code found in flight data");
    return null; // Don't render header without proper airline info
  }

  // Initialize display variables first
  let fullFlightNumber: string;
  let displayAirline = flightData.airline;
  let displayICAO = icaoCode;

  // Extract flight number and airline info for display
  const flightNumberMatch = flightData.flightNumber?.match(
    /\(([A-Z0-9]+)\)\s*(\d+)/
  );

  if (flightNumberMatch) {
    // FlightView format: "(B6) 1111"
    fullFlightNumber = `${flightNumberMatch[1]}${flightNumberMatch[2]}`;
  } else {
    // PlaneFinder format: "AA4582" - extract prefix
    const directMatch = flightData.flightNumber?.match(/^([A-Z]{2,3})(\d+)$/);
    if (directMatch) {
      const airlinePrefix = directMatch[1];
      fullFlightNumber = flightData.flightNumber;

      // Map common airline prefixes to proper names and ICAO codes
      const airlineMap: Record<string, { name: string; icao: string }> = {
        AA: { name: "American Airlines", icao: "AAL" },
        B6: { name: "JetBlue Airways", icao: "JBU" },
        DL: { name: "Delta Air Lines", icao: "DAL" },
        UA: { name: "United Airlines", icao: "UAL" },
        WN: { name: "Southwest Airlines", icao: "SWA" },
        AS: { name: "Alaska Airlines", icao: "ASA" },
        NK: { name: "Spirit Airlines", icao: "NKS" },
        F9: { name: "Frontier Airlines", icao: "FFT" },
      };

      if (airlineMap[airlinePrefix]) {
        console.log(
          `🏷️ Using marketing airline for ${airlinePrefix}: ${airlineMap[airlinePrefix].name}`
        );
        displayAirline = airlineMap[airlinePrefix].name;
        displayICAO = airlineMap[airlinePrefix].icao;
      }
    } else {
      fullFlightNumber = flightData.flightNumber || "";
    }
  }

  // Generate logo path and format date after airline mapping is complete
  const logoPath = `/logos/${displayICAO}.png`;
  const flightDate = formatFlightDate(flightData.departure.scheduled);

  console.log({ logoPath, displayAirline, displayICAO });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-start space-x-4">
        {/* Left side - Airline Logo */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src={logoPath}
              alt={displayAirline}
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to a generic plane icon if logo not found
                const target = e.target as HTMLImageElement;
                target.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23666' viewBox='0 0 20 20'%3E%3Cpath d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z'/%3E%3C/svg%3E";
              }}
            />
          </div>
        </div>

        {/* Right side - Flight Details */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Flight Number, ICAO Code, and Date */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {fullFlightNumber}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {displayICAO}
            </span>
            {flightDate && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                {flightDate}
              </span>
            )}
          </div>

          {/* Row 2: Route */}
          <div className="mb-1">
            <p className="text-lg font-semibold text-gray-900 truncate">
              {flightData.airports.departure.city} to{" "}
              {flightData.airports.arrival.city}
            </p>
          </div>

          {/* Row 3: Airline Name */}
          <div>
            <p className="text-sm text-gray-600 truncate">{displayAirline}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightHeader;
