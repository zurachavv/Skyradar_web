import {
  FlightStatusData,
  FlightDisplayConfig,
} from "@/types/flightStatus.types";

interface FlightStatusDisplayProps {
  statusData: FlightStatusData;
  displayConfig: FlightDisplayConfig;
  className?: string;
}

/**
 * Status Display Component following Single Responsibility Principle
 * Only handles status message rendering
 */
const FlightStatusDisplay = ({
  statusData,
  displayConfig,
  className = "",
}: FlightStatusDisplayProps) => {
  const getStatusColor = (status: string): string => {
    const colorMap = {
      Scheduled: "text-blue-600",
      Departed: "text-yellow-600",
      "In Air": "text-green-600",
      Landed: "text-purple-600",
      Arrived: "text-gray-600",
    };

    return colorMap[status as keyof typeof colorMap] || "text-gray-600";
  };

  const getStatusIcon = (status: string): JSX.Element => {
    const iconMap = {
      Scheduled: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      Departed: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
      ),
      "In Air": (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
      ),
      Landed: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a.5.5 0 00-.707-.707L11 10.586 8.707 8.293a.5.5 0 00-.707.707l2.5 2.5a.5.5 0 00.707 0l3.5-3.5z"
            clipRule="evenodd"
          />
        </svg>
      ),
      Arrived: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
    };

    return iconMap[status as keyof typeof iconMap] || iconMap["Scheduled"];
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${getStatusColor(statusData.status)}`}>
        {getStatusIcon(statusData.status)}
      </div>

      <div>
        <p className={`font-medium ${getStatusColor(statusData.status)}`}>
          {displayConfig.statusMessage}
        </p>

        {/* Additional status details */}
        {statusData.gate && (
          <p className="text-sm text-gray-500">
            Gate {statusData.gate}
            {statusData.terminal && ` • Terminal ${statusData.terminal}`}
          </p>
        )}
      </div>
    </div>
  );
};

export default FlightStatusDisplay;
