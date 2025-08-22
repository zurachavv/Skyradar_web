import { UnifiedFlightData } from "@/types/api.types";

interface FlightLiveDataProps {
  flightData: UnifiedFlightData;
}

const FlightLiveData = ({ flightData }: FlightLiveDataProps) => {
  if (!flightData.liveData) {
    return null;
  }

  const { liveData } = flightData;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-2">Live Tracking</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Altitude</p>
          <p className="font-medium">{liveData.altitude.toLocaleString()} ft</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Speed</p>
          <p className="font-medium">{liveData.speed} kts</p>
        </div>
        {liveData.heading && (
          <div>
            <p className="text-sm text-gray-600">Heading</p>
            <p className="font-medium">{liveData.heading}°</p>
          </div>
        )}
        {liveData.position && (
          <div>
            <p className="text-sm text-gray-600">Position</p>
            <p className="font-medium text-xs">
              {liveData.position.lat.toFixed(4)},{" "}
              {liveData.position.lng.toFixed(4)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightLiveData;
