import {
  FlightStatusData,
  FlightDisplayConfig,
} from "@/types/flightStatus.types";
import FlightStatusDisplay from "@/components/flight-status/FlightStatusDisplay";
import FlightRouteInfo from "./FlightRouteInfo";
import { UnifiedFlightData } from "@/types/api.types";

interface FlightStatusSectionProps {
  flightData: UnifiedFlightData;
  statusData: FlightStatusData;
  displayConfig: FlightDisplayConfig;
}

const FlightStatusSection = ({
  flightData,
  statusData,
  displayConfig,
}: FlightStatusSectionProps) => {
  // Debug: Log all received data
  console.log("🟡 FlightStatusSection DEBUG:", {
    flightData: {
      flightNumber: flightData.flightNumber,
      status: flightData.status,
      airline: flightData.airline,
      source: flightData.source,
    },
    statusData,
    displayConfig,
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <FlightStatusDisplay
        statusData={statusData}
        displayConfig={displayConfig}
        className="mb-4"
      />
      <FlightRouteInfo flightData={flightData} />
    </div>
  );
};

export default FlightStatusSection;
