import { UnifiedFlightData } from "@/types/api.types";
import {
  getTimeDisplayProps,
  calculateTimeRemaining,
  parseTimeString,
  calculateFlightDuration,
  calculateEnhancedFlightDuration,
  getEnhancedTimeDisplayProps,
  calculateEnhancedDelayInfo,
  getScheduledTimeForDisplay,
  getConsistentTimeDisplay,
} from "@/utils/flightTimeUtils";
import WeatherDisplay from "@/components/weather/WeatherDisplay";

interface FlightRouteInfoProps {
  flightData: UnifiedFlightData;
}

const FlightRouteInfo = ({ flightData }: FlightRouteInfoProps) => {
  // Debug logs for arrival time data
  console.log("🕐 FlightRouteInfo: Raw arrival time data:", {
    flightNumber: flightData.flightNumber,
    status: flightData.status,
    source: flightData.source,
    arrival: {
      scheduled: flightData.arrival.scheduled,
      estimated: flightData.arrival.estimated,
      actual: flightData.arrival.actual,
    },
    planefinderRaw: flightData._raw?.payload?.status
      ? {
          arrivalTimeScheduled:
            flightData._raw.payload.status.arrivalTimeScheduled,
          arrivalTimeEstimated:
            flightData._raw.payload.status.arrivalTimeEstimated,
          arrivalTimeActual: flightData._raw.payload.status.arrivalTimeActual,
        }
      : "No PlaneFinder data",
  });

  // Use enhanced time display that considers PlaneFinder data for active flights
  const departureTimeProps = getEnhancedTimeDisplayProps(
    flightData,
    "departure"
  );
  const arrivalTimeProps = getEnhancedTimeDisplayProps(flightData, "arrival");

  // Get consistent time display logic for both departure and arrival
  const departureDisplay = getConsistentTimeDisplay(
    departureTimeProps.displayTime,
    getScheduledTimeForDisplay(flightData, "departure"),
    departureTimeProps.delayInfo.delayMinutes
  );

  const arrivalDisplay = getConsistentTimeDisplay(
    arrivalTimeProps.displayTime,
    getScheduledTimeForDisplay(flightData, "arrival"),
    arrivalTimeProps.delayInfo.delayMinutes
  );

  // Debug logs for processed time display
  console.log("🕐 FlightRouteInfo: Processed arrival time props:", {
    displayTime: arrivalTimeProps.displayTime,
    timeColorClass: arrivalTimeProps.timeColorClass,
    delayInfo: arrivalTimeProps.delayInfo,
    parsedScheduled: parseTimeString(flightData.arrival.scheduled),
  });

  // Calculate time remaining using best available data
  const getBestTimeForRemaining = (type: "departure" | "arrival") => {
    // If we have PlaneFinder data, use it
    if (flightData._raw?.payload?.status) {
      const status = flightData._raw.payload.status;
      let timestamp: number | null;

      if (type === "departure") {
        timestamp =
          status.departureTimeActual ||
          status.departureTimeEstimated ||
          status.departureTimeScheduled;
      } else {
        timestamp =
          status.arrivalTimeActual ||
          status.arrivalTimeEstimated ||
          status.arrivalTimeScheduled;
      }

      if (timestamp) {
        return new Date(timestamp * 1000).toISOString();
      }
    }

    // Fallback to FlightView data
    if (type === "departure") {
      return flightData.departure.estimated || flightData.departure.scheduled;
    } else {
      return flightData.arrival.estimated || flightData.arrival.scheduled;
    }
  };

  const departureTimeRemaining = calculateTimeRemaining(
    getBestTimeForRemaining("departure"),
    "Departs"
  );

  const arrivalTimeRemaining = calculateTimeRemaining(
    getBestTimeForRemaining("arrival"),
    "Arrives"
  );

  // Calculate flight duration using enhanced timezone-aware logic
  const flightDuration = calculateEnhancedFlightDuration(flightData);

  // Debug: Compare with old calculation
  const oldFlightDuration = calculateFlightDuration(
    flightData.departure.scheduled,
    flightData.arrival.scheduled
  );

  console.log(`🕐 FlightRouteInfo: Flight duration comparison:`, {
    enhanced: flightDuration,
    old: oldFlightDuration,
    rawDeparture: flightData.departure.scheduled,
    rawArrival: flightData.arrival.scheduled,
  });

  return (
    <div className="border-t pt-4 space-y-3">
      {/* Departure Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </div>
          <div className="flex items-center space-x-2">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {flightData.airports.departure.code} •{" "}
                {flightData.airports.departure.city}
              </p>
              <p className="text-xs text-gray-500">
                {flightData.airports.departure.name}
              </p>
              <WeatherDisplay
                airportIata={flightData.airports.departure.code}
                airportCity={flightData.airports.departure.city}
              />
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center space-x-2">
            {departureDisplay.showSingleTime ? (
              // On time: show single time
              <span
                className={`text-2xl font-bold ${departureTimeProps.timeColorClass}`}
              >
                {departureDisplay.primaryTime || "--:--"}
              </span>
            ) : (
              // Delayed/Early: show strikethrough scheduled + new actual time
              <>
                <span className="text-sm text-gray-500 line-through">
                  {departureDisplay.secondaryTime || "--:--"}
                </span>
                <span
                  className={`text-2xl font-bold ${departureTimeProps.timeColorClass}`}
                >
                  {departureDisplay.primaryTime || "--:--"}
                </span>
              </>
            )}
            {flightData.departure.gate && (
              <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded text-sm font-medium">
                {flightData.departure.gate}
              </span>
            )}
          </div>
          {flightData.departure.terminal && (
            <p className="text-xs text-gray-500 mt-1">
              Terminal {flightData.departure.terminal}
            </p>
          )}
        </div>
      </div>

      <div className="text-center">
        <span className={departureTimeProps.delayInfo.colorClass}>
          {departureTimeProps.delayInfo.delayText}
        </span>
        {departureTimeRemaining && (
          <>
            <span className="text-[#686868]"> • </span>
            <span className="text-[#686868]">{departureTimeRemaining}</span>
          </>
        )}
      </div>

      {/* Flight Duration */}
      {flightDuration && (
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <span>{flightDuration}</span>
        </div>
      )}

      {/* Arrival Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <circle cx="10" cy="10" r="6" />
            </svg>
          </div>
          <div className="flex items-center space-x-2">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {flightData.airports.arrival.city}
                {flightData.airports.arrival.country &&
                  `, ${flightData.airports.arrival.country}`}
              </p>
              <p className="text-xs text-gray-500">
                {flightData.airports.arrival.name}
              </p>
              <WeatherDisplay
                airportIata={flightData.airports.arrival.code}
                airportCity={flightData.airports.arrival.city}
              />
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center space-x-2">
            {arrivalDisplay.showSingleTime ? (
              // On time: show single time
              <span
                className={`text-2xl font-bold ${arrivalTimeProps.timeColorClass}`}
              >
                {arrivalDisplay.primaryTime || "--:--"}
              </span>
            ) : (
              // Delayed/Early: show strikethrough scheduled + new actual time
              <>
                <span className="text-sm text-gray-500 line-through">
                  {arrivalDisplay.secondaryTime || "--:--"}
                </span>
                <span
                  className={`text-2xl font-bold ${arrivalTimeProps.timeColorClass}`}
                >
                  {arrivalDisplay.primaryTime || "--:--"}
                </span>
              </>
            )}
            {flightData.arrival.gate ? (
              <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded text-sm font-medium">
                {flightData.arrival.gate}
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-sm">
                -
              </span>
            )}
          </div>
          {flightData.arrival.terminal && (
            <p className="text-xs text-gray-500 mt-1">
              Terminal {flightData.arrival.terminal}
            </p>
          )}
        </div>
      </div>

      <div className="text-center">
        <span className={arrivalTimeProps.delayInfo.colorClass}>
          {arrivalTimeProps.delayInfo.delayText}
        </span>
        {arrivalTimeRemaining && (
          <>
            <span className="text-[#686868]"> • </span>
            <span className="text-[#686868]">{arrivalTimeRemaining}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default FlightRouteInfo;
