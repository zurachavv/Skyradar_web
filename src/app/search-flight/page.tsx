"use client";

import MapContainer from "@/components/MapContainer";
import SearchNavbar from "@/components/search-flight/SearchNavbar";
import SearchFlightForm from "@/components/search-flight/SearchFlightForm";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchFlightViewData } from "@/services/flightService";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants/errorMessages";

export default function SearchFlightPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFlightSubmit = async (
    flightNumber: string,
    departureDate: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      console.log(
        "🚀 Starting flight search for:",
        flightNumber,
        "on",
        departureDate
      );

      // Try FlightView API first with departure date
      const flightData = await fetchFlightViewData(flightNumber, departureDate);

      if (flightData) {
        console.log(SUCCESS_MESSAGES.FLIGHT_FOUND);

        // Navigate to simplified flight route
        router.push(`/flight/${encodeURIComponent(flightNumber)}`);
      } else {
        setError(ERROR_MESSAGES.FLIGHT_NOT_FOUND);
      }
    } catch (err) {
      console.error("❌ Error searching for flight:", err);
      setError(ERROR_MESSAGES.SEARCH_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <SearchNavbar title="SkyRadar" />

      {/* Map Section */}
      <div className="h-[300px] w-full">
        <MapContainer />
      </div>

      {/* Content Section */}
      <main className="flex-1">
        <SearchFlightForm
          onSubmit={handleFlightSubmit}
          loading={loading}
          error={error}
        />
      </main>
    </div>
  );
}
