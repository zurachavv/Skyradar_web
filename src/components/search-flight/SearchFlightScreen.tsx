"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ScreenLayout from "../ScreenLayout";
import SearchFlightForm from "./SearchFlightForm";
import { fetchFlightViewData } from "@/services/flightService";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants/errorMessages";

const SearchFlightScreen = () => {
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

  const navbarProps = {
    title: "SkyRadar",
    showBack: false,
  };

  const mapProps = {
    flightRoute: null,
    livePosition: null,
  };

  return (
    <ScreenLayout navbar={navbarProps} map={mapProps}>
      <SearchFlightForm
        onSubmit={handleFlightSubmit}
        loading={loading}
        error={error}
      />
    </ScreenLayout>
  );
};

export default SearchFlightScreen;
