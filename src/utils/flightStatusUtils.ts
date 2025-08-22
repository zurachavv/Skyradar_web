import {
  FlightStatus,
  FlightStatusData,
  FlightDisplayConfig,
  FlightMapData,
  StatusDisplayRules,
} from "@/types/flightStatus.types";
import { UnifiedFlightData } from "@/types/api.types";

// Configuration rules for each flight status
const STATUS_RULES: StatusDisplayRules = {
  Scheduled: {
    showPlane: false,
    showRoute: true,
    primaryTimeType: "departure",
    statusPrefix: "Gate departure in",
  },
  Departed: {
    showPlane: true,
    showRoute: true,
    primaryTimeType: "arrival",
    statusPrefix: "Landing in",
  },
  "In Air": {
    showPlane: true,
    showRoute: true,
    primaryTimeType: "arrival",
    statusPrefix: "Landing in",
  },
  Landed: {
    showPlane: true,
    showRoute: true,
    primaryTimeType: "arrival",
    statusPrefix: "Arrived at",
  },
  Arrived: {
    showPlane: false,
    showRoute: true,
    primaryTimeType: "arrival",
    statusPrefix: "Arrived",
  },
};

/**
 * Normalize flight status from various API sources
 * Single Responsibility: Convert different status formats to our standard
 */
export const normalizeFlightStatus = (
  status: string,
  flightData?: UnifiedFlightData
): FlightStatus => {
  const normalizedStatus = status.toLowerCase().trim();

  // Map common status variations to our standard statuses
  const statusMap: Record<string, FlightStatus> = {
    scheduled: "Scheduled",
    "on time": "Scheduled",
    departed: "Departed",
    "in air": "In Air",
    "in flight": "In Air",
    airborne: "In Air",
    flying: "In Air",
    landed: "Landed",
    arrived: "Arrived",
    completed: "Arrived",
  };

  const mappedStatus = statusMap[normalizedStatus];
  if (mappedStatus) {
    return mappedStatus;
  }

  // Fallback: analyze flight data to determine status
  if (flightData) {
    const now = new Date();
    const scheduledDeparture = flightData.departure.scheduled
      ? new Date(flightData.departure.scheduled)
      : null;
    const actualDeparture = flightData.departure.actual
      ? new Date(flightData.departure.actual)
      : null;
    const scheduledArrival = flightData.arrival.scheduled
      ? new Date(flightData.arrival.scheduled)
      : null;
    const actualArrival = flightData.arrival.actual
      ? new Date(flightData.arrival.actual)
      : null;

    if (actualArrival && actualArrival <= now) {
      return "Arrived";
    }
    if (scheduledArrival && scheduledArrival <= now && !actualArrival) {
      return "Landed";
    }
    if (actualDeparture && actualDeparture <= now) {
      return "In Air";
    }
    if (scheduledDeparture && scheduledDeparture <= now && !actualDeparture) {
      return "Departed";
    }
  }

  // Default fallback
  return "Scheduled";
};

/**
 * Calculate time remaining until departure/arrival
 * Single Responsibility: Time calculation logic
 */
export const calculateTimeRemaining = (
  targetTime: string | null,
  fallbackTime?: string | null
): string | null => {
  const timeToUse = targetTime || fallbackTime;
  if (!timeToUse) return null;

  try {
    let target: Date;

    // Check if it's PlaneFinder format: "22/08/2025, 22:37:00"
    if (timeToUse.match(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}/)) {
      const [datePart, timePart] = timeToUse.split(", ");
      const [day, month, year] = datePart.split("/").map(Number);
      const [hours, minutes, seconds] = timePart.split(":").map(Number);
      target = new Date(year, month - 1, day, hours, minutes, seconds);
    } else {
      // Assume ISO format
      target = new Date(timeToUse);
    }

    if (isNaN(target.getTime())) return null;

    const now = new Date();
    const diffMs = target.getTime() - now.getTime();

    if (diffMs <= 0) return null;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  } catch {
    return null;
  }
};

/**
 * Calculate delay information
 * Single Responsibility: Delay calculation
 * Can compare scheduled vs estimated (for future flights) or scheduled vs actual (for completed flights)
 */
export const calculateDelay = (
  scheduled: string | null,
  compareTime: string | null
): { onTime: boolean; delayMinutes: number } => {
  if (!scheduled || !compareTime) {
    return { onTime: true, delayMinutes: 0 };
  }

  try {
    const scheduledTime = new Date(scheduled);
    const comparisonTime = new Date(compareTime);

    // Check if dates are valid
    if (isNaN(scheduledTime.getTime()) || isNaN(comparisonTime.getTime())) {
      console.warn("Invalid date format in delay calculation:", {
        scheduled,
        compareTime,
      });
      return { onTime: true, delayMinutes: 0 };
    }

    const diffMs = comparisonTime.getTime() - scheduledTime.getTime();
    const delayMinutes = Math.floor(diffMs / (1000 * 60));

    return {
      onTime: delayMinutes <= 15, // 15 minutes tolerance
      delayMinutes: Math.max(0, delayMinutes),
    };
  } catch (error) {
    console.warn("Error calculating delay:", error);
    return { onTime: true, delayMinutes: 0 };
  }
};

/**
 * Generate flight status data from unified flight data
 * Single Responsibility: Status data extraction
 */
export const extractFlightStatusData = (
  flightData: UnifiedFlightData
): FlightStatusData => {
  console.log("📊 extractFlightStatusData DEBUG:", {
    source: flightData.source,
    status: flightData.status,
    departure: flightData.departure,
    arrival: flightData.arrival,
  });
  const status = normalizeFlightStatus(flightData.status, flightData);
  const rules =
    (STATUS_RULES as any)[status] || (STATUS_RULES as any)["Scheduled"];

  let timeRemaining: string | null = null;
  let onTime = true;
  let delayMinutes = 0;

  // Calculate time remaining based on status
  if (status === "Scheduled") {
    // For scheduled flights, prefer estimated time if available, otherwise use scheduled
    const departureTime =
      flightData.departure.estimated || flightData.departure.scheduled;
    timeRemaining = calculateTimeRemaining(departureTime);

    console.log("🕐 Scheduled flight time calculation:", {
      scheduled: flightData.departure.scheduled,
      estimated: flightData.departure.estimated,
      timeUsed: departureTime,
      timeRemaining,
    });

    // Check if there's a delay for scheduled flights
    if (flightData.departure.scheduled && flightData.departure.estimated) {
      const delayInfo = calculateDelay(
        flightData.departure.scheduled,
        flightData.departure.estimated
      );
      onTime = delayInfo.onTime;
      delayMinutes = delayInfo.delayMinutes;
    }
  } else if (status === "Departed" || status === "In Air") {
    // Both Departed and In Air should show remaining time to arrival
    timeRemaining =
      flightData.arrival.timeRemaining ||
      calculateTimeRemaining(
        flightData.arrival.estimated || flightData.arrival.scheduled
      );

    console.log("🛫 Departed/In Air time calculation:", {
      status,
      arrivalScheduled: flightData.arrival.scheduled,
      arrivalEstimated: flightData.arrival.estimated,
      timeRemaining,
    });
  }

  // Calculate delay for arrival status (both Landed and Arrived)
  if (status === "Arrived" || status === "Landed") {
    const delayInfo = calculateDelay(
      flightData.arrival.scheduled,
      flightData.arrival.actual || flightData.arrival.estimated
    );
    onTime = delayInfo.onTime;
    delayMinutes = delayInfo.delayMinutes;
  }

  return {
    status,
    timeRemaining,
    gate:
      rules.primaryTimeType === "departure"
        ? flightData.departure.gate
        : flightData.arrival.gate,
    terminal:
      rules.primaryTimeType === "departure"
        ? flightData.departure.terminal
        : flightData.arrival.terminal,
    scheduledTime:
      rules.primaryTimeType === "departure"
        ? flightData.departure.scheduled
        : flightData.arrival.scheduled,
    actualTime:
      rules.primaryTimeType === "departure"
        ? flightData.departure.actual
        : flightData.arrival.actual,
    estimatedTime:
      rules.primaryTimeType === "departure"
        ? flightData.departure.estimated
        : flightData.arrival.estimated,
    onTime,
    delayMinutes,
  };
};

/**
 * Generate display configuration based on flight status
 * Single Responsibility: Display rules application
 */
export const getFlightDisplayConfig = (
  statusData: FlightStatusData
): FlightDisplayConfig => {
  const rules =
    (STATUS_RULES as any)[statusData.status] ||
    (STATUS_RULES as any)["Scheduled"];

  let statusMessage = rules.statusPrefix;
  let timeDisplay: string | undefined;

  // Build status message based on status type
  switch (statusData.status) {
    case "Scheduled":
      if (statusData.timeRemaining) {
        statusMessage = `${rules.statusPrefix} ${statusData.timeRemaining}`;

        // Add delay information if applicable
        if (
          !statusData.onTime &&
          statusData?.delayMinutes &&
          statusData.delayMinutes > 0
        ) {
          statusMessage += ` (${statusData.delayMinutes} min delay)`;
        }
      } else {
        statusMessage = "Scheduled";
      }
      break;

    case "Departed":
      if (statusData.timeRemaining) {
        statusMessage = `${rules.statusPrefix} ${statusData.timeRemaining}`;
      } else {
        statusMessage = "Departed";
      }
      break;

    case "In Air":
      if (statusData.timeRemaining) {
        statusMessage = `${rules.statusPrefix} ${statusData.timeRemaining}`;
      } else {
        statusMessage = "In Air";
      }
      break;

    case "Landed":
      // Show arrival time like "Arrived" status
      const arrivalTime =
        statusData.actualTime ||
        statusData.estimatedTime ||
        statusData.scheduledTime;
      if (arrivalTime) {
        try {
          const arrivalDate = new Date(arrivalTime);
          const timeStr = arrivalDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          statusMessage = `${rules.statusPrefix} ${timeStr}`;

          // Add delay information if applicable
          if (
            !statusData.onTime &&
            statusData?.delayMinutes &&
            statusData.delayMinutes > 0
          ) {
            statusMessage += ` (${statusData.delayMinutes} min late)`;
          }
        } catch {
          statusMessage = rules.statusPrefix;
        }
      } else {
        statusMessage = "Just landed";
      }
      break;

    case "Arrived":
      if (statusData.onTime) {
        statusMessage = "Arrived on time";
      } else {
        statusMessage = `Arrived ${statusData.delayMinutes} min late`;
      }
      break;
  }

  return {
    showPlane: rules.showPlane,
    showAirports: true, // Always show airports
    statusMessage,
    timeDisplay,
    priority: rules.primaryTimeType,
  };
};

/**
 * Generate map configuration based on flight status
 * Single Responsibility: Map display rules
 */
export const getFlightMapData = (
  flightData: UnifiedFlightData,
  statusData: FlightStatusData
): FlightMapData => {
  const rules =
    (STATUS_RULES as any)[statusData.status] ||
    (STATUS_RULES as any)["Scheduled"];

  return {
    showLivePosition: rules.showPlane && !!flightData.liveData,
    showRoute: rules.showRoute,
    departureCoords: flightData.airports.departure.coordinates,
    arrivalCoords: flightData.airports.arrival.coordinates,
    livePosition: flightData.liveData
      ? {
          lat: flightData.liveData.position.lat,
          lng: flightData.liveData.position.lng,
          heading: flightData.liveData.heading,
          trackAngle: flightData.liveData.trackAngle,
        }
      : undefined,
  };
};

/**
 * Check if we should fetch live position data
 * Single Responsibility: Live data requirements
 */
export const shouldFetchLivePosition = (status: FlightStatus): boolean => {
  return status === "In Air" || status === "Departed" || status === "Landed";
};
