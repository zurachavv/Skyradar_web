interface FlightErrorStateProps {
  error: string;
  onRetry: () => void;
  retryButtonText?: string;
}

const FlightErrorState = ({
  error,
  onRetry,
  retryButtonText = "Search Another Flight",
}: FlightErrorStateProps) => {
  return (
    <div className="px-4 py-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-500 mb-4">
          <svg
            className="w-12 h-12 mx-auto"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-800 mb-2">
          Error Loading Flight
        </h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="bg-skyradar-green text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
        >
          {retryButtonText}
        </button>
      </div>
    </div>
  );
};

export default FlightErrorState;
