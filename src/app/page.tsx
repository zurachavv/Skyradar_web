import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-16">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-skyradar-black mb-2">
              SkyRadar
            </h1>
            <p className="text-xl text-gray-600">Track flights in real-time</p>
          </div>

          <div className="mb-8">
            <p className="text-lg text-gray-700 mb-4">
              Get all flight updates by SMS for free
            </p>
            <p className="text-sm text-gray-500">
              100% free, no credit card required
            </p>
          </div>

          <Link
            href="/search-flight"
            className="inline-block w-full bg-skyradar-green text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-green-600 transition-colors"
          >
            Track a Flight
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center text-skyradar-black mb-8">
            Why choose SkyRadar?
          </h2>

          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-skyradar-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-skyradar-black">
                  Real-time Tracking
                </h3>
                <p className="text-gray-600 text-sm">
                  Track flights live with accurate position data
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-skyradar-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-skyradar-black">
                  SMS Updates
                </h3>
                <p className="text-gray-600 text-sm">
                  Get notifications directly to your phone
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-skyradar-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-skyradar-black">
                  Completely Free
                </h3>
                <p className="text-gray-600 text-sm">
                  No hidden costs or credit card required
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
