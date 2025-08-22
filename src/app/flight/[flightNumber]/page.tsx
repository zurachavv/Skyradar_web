"use client";

import { useParams, useRouter } from "next/navigation";
import MapContainer from "@/components/MapContainer";
import FlightNavbar from "@/components/flight-page/FlightNavbar";
import FlightHeader from "@/components/flight-header/FlightHeader";
import FlightLoadingState from "@/components/flight-page/FlightLoadingState";
import FlightErrorState from "@/components/flight-page/FlightErrorState";
import FlightStatusSection from "@/components/flight-page/FlightStatusSection";
import FlightAircraftInfo from "@/components/flight-page/FlightAircraftInfo";
import FlightLiveData from "@/components/flight-page/FlightLiveData";
import { useFlightData } from "@/hooks/useFlightData";

export default function FlightPage() {
  const params = useParams();
  const router = useRouter();
  const flightNumber = decodeURIComponent(params.flightNumber as string);

  // Use custom hook for all flight data logic
  const { flightData, statusData, displayConfig, mapData, loading, error } =
    useFlightData(flightNumber);

  const handleBack = () => {
    router.push("/search-flight");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <FlightNavbar
          title="Flight Status"
          flightCode={flightNumber}
          airline=""
          onBack={handleBack}
        />

        <div className="h-[300px] w-full">
          <MapContainer />
        </div>

        <main className="flex-1">
          <FlightLoadingState />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <FlightNavbar
          title="Flight Status"
          flightCode={flightNumber}
          airline=""
          onBack={handleBack}
        />

        <div className="h-[300px] w-full">
          <MapContainer />
        </div>

        <main className="flex-1">
          <FlightErrorState error={error} onRetry={handleBack} />
        </main>
      </div>
    );
  }

  if (!flightData || !statusData || !displayConfig) {
    return (
      <div className="min-h-screen bg-white">
        <FlightNavbar
          title="Flight Status"
          flightCode={flightData?.flightNumber || flightNumber}
          airline={flightData?.airline || ""}
          onBack={handleBack}
        />

        <div className="h-[300px] w-full">
          <MapContainer />
        </div>

        <main className="flex-1">
          <FlightErrorState
            error="No flight data available"
            onRetry={handleBack}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <FlightNavbar
        title="Flight Status"
        flightCode={flightData.flightNumber}
        airline={flightData.airline}
        onBack={handleBack}
      />

      {/* Map Section */}
      <div className="h-[300px] w-full">
        <MapContainer
          flightRoute={
            mapData?.showRoute &&
            mapData.departureCoords &&
            mapData.arrivalCoords
              ? {
                  departure: mapData.departureCoords,
                  arrival: mapData.arrivalCoords,
                }
              : undefined
          }
          livePosition={
            mapData?.showLivePosition && mapData.livePosition
              ? mapData.livePosition
              : undefined
          }
          flightStatus={
            flightData.status as
              | "Scheduled"
              | "Departed"
              | "In Air"
              | "Landed"
              | "Arrived"
              | undefined
          }
        />
      </div>

      {/* Content Section */}
      <main className="flex-1">
        <div className="px-4 py-6 space-y-6">
          {/* Flight Header */}
          <FlightHeader flightData={flightData} />

          {/* Flight Status Section */}
          <FlightStatusSection
            flightData={flightData}
            statusData={statusData}
            displayConfig={displayConfig}
          />

          {/* Aircraft Info */}
          <FlightAircraftInfo flightData={flightData} />

          {/* Live Data Section (only show when available) */}
          <FlightLiveData flightData={flightData} />
        </div>
      </main>
    </div>
  );
}
