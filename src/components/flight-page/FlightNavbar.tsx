"use client";

interface FlightNavbarProps {
  title: string;
  flightCode: string;
  airline: string;
  onBack: () => void;
}

const FlightNavbar = ({
  title,
  flightCode,
  airline,
  onBack,
}: FlightNavbarProps) => {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          {flightCode && (
            <p className="text-sm text-gray-600">
              {flightCode} • {airline}
            </p>
          )}
        </div>

        <div className="w-6 h-6">
          <div className="space-y-1">
            <div className="w-6 h-0.5 bg-gray-600"></div>
            <div className="w-6 h-0.5 bg-gray-600"></div>
            <div className="w-6 h-0.5 bg-gray-600"></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default FlightNavbar;
