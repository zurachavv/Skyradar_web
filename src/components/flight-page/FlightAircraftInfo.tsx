import { UnifiedFlightData } from "@/types/api.types";

interface FlightAircraftInfoProps {
  flightData: UnifiedFlightData;
}

const FlightAircraftInfo = ({ flightData }: FlightAircraftInfoProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-2">Aircraft Information</h3>
      <div className="space-y-1">
        <p className="text-sm">
          <span className="text-gray-600">Aircraft:</span>{" "}
          <span className="font-medium">{flightData.aircraftType}</span>
        </p>
        <p className="text-sm">
          <span className="text-gray-600">Airline:</span>{" "}
          <span className="font-medium">{flightData.airline}</span>
        </p>
        <p className="text-sm">
          <span className="text-gray-600">Flight:</span>{" "}
          <span className="font-medium">{flightData.flightNumber}</span>
        </p>
        {flightData.airlineICAO && (
          <p className="text-sm">
            <span className="text-gray-600">Airline Code:</span>{" "}
            <span className="font-medium">{flightData.airlineICAO}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default FlightAircraftInfo;
