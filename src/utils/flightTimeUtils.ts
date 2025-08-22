/**
 * Parse time string to get HH:MM format
 * Handles both FlightView format "HH:MM, Mon DD" and ISO format "2025-08-22T23:05:00-05:00"
 */
export const parseTimeString = (timeString: string | null) => {
  if (!timeString) {
    console.log("🕐 parseTimeString: Received null/empty timeString");
    return null;
  }

  try {
    console.log("🕐 parseTimeString: Parsing:", timeString);

    // Check format type based on structure
    if (timeString.includes(",")) {
      // Check if it's PlaneFinder format: "22/08/2025, 21:13:00"
      if (timeString.match(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}/)) {
        // PlaneFinder format - extract time part after comma
        const timePart = timeString.split(",")[1].trim(); // "21:13:00"
        const result = timePart.substring(0, 5); // "21:13"
        console.log("🕐 parseTimeString: PlaneFinder format result:", result);
        return result;
      } else {
        // FlightView format - extract time part before comma (e.g., "23:05" from "23:05, Aug 22")
        const result = timeString.split(",")[0].trim();
        console.log("🕐 parseTimeString: FlightView format result:", result);
        return result;
      }
    }

    // Assume it's ISO format - extract time portion
    const date = new Date(timeString);
    if (isNaN(date.getTime())) {
      console.log("🕐 parseTimeString: Invalid date format");
      return null;
    }

    // For ISO format, extract time directly from string to avoid timezone conversion
    const timeMatch = timeString.match(/T(\d{2}:\d{2})/);
    if (timeMatch) {
      const result = timeMatch[1];
      console.log(
        "🕐 parseTimeString: ISO format result:",
        result,
        "from:",
        timeString
      );
      return result;
    }

    // If we have a UTC timestamp (ending with Z), use UTC methods
    if (timeString.endsWith("Z")) {
      const hours = String(date.getUTCHours()).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");
      const result = `${hours}:${minutes}`;
      console.log(
        "🕐 parseTimeString: UTC result:",
        result,
        "from:",
        timeString
      );
      return result;
    }

    // For times with timezone offset, use the original timezone
    const offsetMatch = timeString.match(/([+-]\d{2}:\d{2})$/);
    if (offsetMatch) {
      // Extract time portion before timezone
      const timePart = timeString.match(/T(\d{2}:\d{2})/);
      if (timePart) {
        const result = timePart[1];
        console.log(
          "🕐 parseTimeString: Timezone-aware result:",
          result,
          "from:",
          timeString
        );
        return result;
      }
    }

    // Fallback: format the date object in local time
    const result = date.toTimeString().slice(0, 5);
    console.log(
      "🕐 parseTimeString: Fallback result:",
      result,
      "from:",
      timeString
    );
    return result;
  } catch (error) {
    console.log("🕐 parseTimeString: Error parsing:", error);
    return null;
  }
};

/**
 * Calculate delay between scheduled and estimated times
 * Returns { delayMinutes, delayText, colorClass }
 */
export const calculateDelayInfo = (
  scheduledTime: string | null,
  estimatedTime: string | null
) => {
  console.log("🕐 calculateDelayInfo: Input data:", {
    scheduled: scheduledTime,
    estimated: estimatedTime,
  });

  // If no estimated time, assume on time
  if (!scheduledTime) {
    return {
      delayMinutes: 0,
      delayText: "On time",
      colorClass: "text-[#179C3C]",
    };
  }

  // If no estimated time but have scheduled, assume on time
  if (!estimatedTime) {
    return {
      delayMinutes: 0,
      delayText: "On time",
      colorClass: "text-[#179C3C]",
    };
  }

  // If times are the same, on time
  if (scheduledTime === estimatedTime) {
    return {
      delayMinutes: 0,
      delayText: "On time",
      colorClass: "text-[#179C3C]",
    };
  }

  try {
    const scheduled = parseTimeString(scheduledTime);
    const estimated = parseTimeString(estimatedTime);

    console.log("🕐 calculateDelayInfo: Parsed times:", {
      scheduledParsed: scheduled,
      estimatedParsed: estimated,
    });

    if (!scheduled || !estimated) {
      return {
        delayMinutes: 0,
        delayText: "On time",
        colorClass: "text-[#179C3C]",
      };
    }

    // Parse hours and minutes
    const [scheduledHours, scheduledMinutes] = scheduled.split(":").map(Number);
    const [estimatedHours, estimatedMinutes] = estimated.split(":").map(Number);

    // Convert to total minutes for easier calculation
    const scheduledTotalMinutes = scheduledHours * 60 + scheduledMinutes;
    const estimatedTotalMinutes = estimatedHours * 60 + estimatedMinutes;

    const delayMinutes = estimatedTotalMinutes - scheduledTotalMinutes;

    console.log("🕐 calculateDelayInfo: Calculation:", {
      scheduledHours,
      scheduledMinutes,
      estimatedHours,
      estimatedMinutes,
      scheduledTotalMinutes,
      estimatedTotalMinutes,
      delayMinutes,
    });

    if (delayMinutes > 0) {
      // Late - use red color #D81C1F
      return {
        delayMinutes,
        delayText: `${delayMinutes}m Late`,
        colorClass: "text-[#D81C1F]",
      };
    } else if (delayMinutes < 0) {
      // Early - use green color #179C3C
      return {
        delayMinutes: Math.abs(delayMinutes),
        delayText: `${Math.abs(delayMinutes)}m Early`,
        colorClass: "text-[#179C3C]",
      };
    } else {
      // On time - use green color #179C3C
      return {
        delayMinutes: 0,
        delayText: "On time",
        colorClass: "text-[#179C3C]",
      };
    }
  } catch {
    return {
      delayMinutes: 0,
      delayText: "On time",
      colorClass: "text-[#179C3C]",
    };
  }
};

/**
 * Calculate time remaining until departure/arrival
 * Returns formatted string like "14h 5m" or null if not applicable
 */
export const calculateTimeRemaining = (
  targetDateTime: string | null,
  label: "Departs" | "Arrives" = "Departs"
): string | null => {
  console.log("⏰ calculateTimeRemaining DEBUG:", { targetDateTime, label });
  if (!targetDateTime) return null;

  try {
    const targetDate = new Date(targetDateTime);
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();

    if (diffMs <= 0) return null; // Already passed

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours > 0) {
      return `${label} in ${hours}h ${minutes}m`;
    } else {
      return `${label} in ${minutes}m`;
    }
  } catch {
    return null;
  }
};

/**
 * Convert PlaneFinder timestamp to Date object
 */
export const parsePlaneFinderTimestamp = (
  timestamp: number | null
): Date | null => {
  if (!timestamp) return null;
  return new Date(timestamp * 1000);
};

/**
 * Enhanced delay calculation that uses PlaneFinder data for "In Air" and "Landed" flights
 * and FlightView data for "Scheduled", "Departed", and "Arrived" flights
 */
export const calculateEnhancedDelayInfo = (
  flightData: any, // UnifiedFlightData with potential PlaneFinder data
  type: "departure" | "arrival"
) => {
  // Check if we have PlaneFinder data
  const hasPlaneFinder = flightData._raw?.payload?.status;

  // Use PlaneFinder for "In Air" and "Landed" flights
  // Use FlightView for "Scheduled", "Departed", and "Arrived" flights
  const shouldUsePlaneFinder =
    hasPlaneFinder &&
    (flightData.status === "In Air" || flightData.status === "Landed") &&
    (flightData.liveData || flightData.hex);

  if (shouldUsePlaneFinder) {
    console.log(
      `🔄 Using PlaneFinder timestamps for ${type} delay calculation (Status: ${flightData.status})`
    );
    // Use PlaneFinder timestamps for active/landed flights
    return calculatePlaneFinderDelay(flightData, type);
  } else {
    console.log(
      `🔄 Using FlightView data for ${type} delay calculation (Status: ${flightData.status})`
    );
    // Use FlightView data for scheduled/departed/arrived flights
    if (type === "departure") {
      return calculateDelayInfo(
        flightData.departure.scheduled,
        flightData.departure.estimated
      );
    } else {
      return calculateDelayInfo(
        flightData.arrival.scheduled,
        flightData.arrival.estimated
      );
    }
  }
};

/**
 * Calculate delay using PlaneFinder timestamps
 */
const calculatePlaneFinderDelay = (
  flightData: any,
  type: "departure" | "arrival"
) => {
  // Access PlaneFinder raw data if available
  const planeFinderData = flightData._raw?.payload?.status;

  if (!planeFinderData) {
    // Fallback to FlightView calculation
    if (type === "departure") {
      return calculateDelayInfo(
        flightData.departure.scheduled,
        flightData.departure.estimated
      );
    } else {
      return calculateDelayInfo(
        flightData.arrival.scheduled,
        flightData.arrival.estimated
      );
    }
  }

  let scheduledTimestamp: number | null;
  let actualTimestamp: number | null;
  let estimatedTimestamp: number | null;

  if (type === "departure") {
    scheduledTimestamp = planeFinderData.departureTimeScheduled;
    actualTimestamp = planeFinderData.departureTimeActual;
    estimatedTimestamp = planeFinderData.departureTimeEstimated;
  } else {
    scheduledTimestamp = planeFinderData.arrivalTimeScheduled;
    actualTimestamp = planeFinderData.arrivalTimeActual;
    estimatedTimestamp = planeFinderData.arrivalTimeEstimated;
  }

  if (!scheduledTimestamp) {
    return {
      delayMinutes: 0,
      delayText: "On time",
      colorClass: "text-[#179C3C]",
    };
  }

  // Use actual time if available, otherwise estimated, otherwise scheduled
  const compareTimestamp =
    actualTimestamp || estimatedTimestamp || scheduledTimestamp;

  if (compareTimestamp === scheduledTimestamp) {
    return {
      delayMinutes: 0,
      delayText: "On time",
      colorClass: "text-[#179C3C]",
    };
  }

  // Calculate delay in minutes
  const delaySeconds = compareTimestamp - scheduledTimestamp;
  const delayMinutes = Math.round(delaySeconds / 60);

  console.log(`⏰ PlaneFinder ${type} delay calculation:`, {
    scheduled: new Date(scheduledTimestamp * 1000).toISOString(),
    compare: new Date(compareTimestamp * 1000).toISOString(),
    delayMinutes,
  });

  if (delayMinutes > 0) {
    // Late
    return {
      delayMinutes,
      delayText: `${delayMinutes}m Late`,
      colorClass: "text-[#D81C1F]",
    };
  } else if (delayMinutes < 0) {
    // Early
    return {
      delayMinutes: Math.abs(delayMinutes),
      delayText: `${Math.abs(delayMinutes)}m Early`,
      colorClass: "text-[#179C3C]",
    };
  } else {
    // On time
    return {
      delayMinutes: 0,
      delayText: "On time",
      colorClass: "text-[#179C3C]",
    };
  }
};

/**
 * Enhanced time display that uses PlaneFinder timestamps for "In Air" and "Landed" flights
 * and FlightView data for other statuses
 */
export const getEnhancedTimeDisplayProps = (
  flightData: any,
  type: "departure" | "arrival"
) => {
  console.log(
    `🕐 getEnhancedTimeDisplayProps: Processing ${type} for flight ${flightData.flightNumber}`
  );

  const hasPlaneFinder = flightData._raw?.payload?.status;
  let displayTime: string | null;
  let timeColorClass: string;

  // Use PlaneFinder for "In Air" and "Landed" flights only
  const shouldUsePlaneFinder =
    hasPlaneFinder &&
    (flightData.status === "In Air" || flightData.status === "Landed") &&
    (flightData.liveData || flightData.hex);

  console.log(
    `🕐 getEnhancedTimeDisplayProps: shouldUsePlaneFinder=${shouldUsePlaneFinder}, status=${
      flightData.status
    }, hasPlaneFinder=${!!hasPlaneFinder}`
  );

  if (shouldUsePlaneFinder) {
    // Use PlaneFinder data
    const planeFinderData = flightData._raw.payload.status;
    let actualTimestamp: number | null;
    let estimatedTimestamp: number | null;
    let scheduledTimestamp: number | null;

    if (type === "departure") {
      actualTimestamp = planeFinderData.departureTimeActual;
      estimatedTimestamp = planeFinderData.departureTimeEstimated;
      scheduledTimestamp = planeFinderData.departureTimeScheduled;
    } else {
      actualTimestamp = planeFinderData.arrivalTimeActual;
      estimatedTimestamp = planeFinderData.arrivalTimeEstimated;
      scheduledTimestamp = planeFinderData.arrivalTimeScheduled;
    }

    console.log(
      `🕐 getEnhancedTimeDisplayProps: PlaneFinder ${type} timestamps:`,
      {
        actual: actualTimestamp,
        estimated: estimatedTimestamp,
        scheduled: scheduledTimestamp,
        actualDate: actualTimestamp
          ? new Date(actualTimestamp * 1000).toISOString()
          : null,
        estimatedDate: estimatedTimestamp
          ? new Date(estimatedTimestamp * 1000).toISOString()
          : null,
        scheduledDate: scheduledTimestamp
          ? new Date(scheduledTimestamp * 1000).toISOString()
          : null,
      }
    );

    // Use best available time
    const bestTimestamp =
      actualTimestamp || estimatedTimestamp || scheduledTimestamp;
    if (bestTimestamp) {
      const date = parsePlaneFinderTimestamp(bestTimestamp);
      if (date) {
        // Get airport timezone info
        const airportTimezone =
          type === "departure"
            ? flightData._raw?.payload?.status?.departureAirport?.Timezone
            : flightData._raw?.payload?.status?.arrivalAirport?.Timezone;

        // Get DST info to adjust timezone
        const dstInfo =
          type === "departure"
            ? planeFinderData.departureAirport?.DST
            : planeFinderData.arrivalAirport?.DST;

        console.log(
          `🕐 getEnhancedTimeDisplayProps: Airport timezone offset: ${airportTimezone} hours, DST: ${dstInfo} for ${type}`
        );

        if (airportTimezone !== undefined && airportTimezone !== null) {
          // Adjust for DST if active
          // DST "A" typically means DST is active, add 1 hour to the offset
          let adjustedOffset = airportTimezone;
          if (dstInfo === "A") {
            adjustedOffset = airportTimezone + 1;
            console.log(
              `🕐 getEnhancedTimeDisplayProps: DST active, adjusting offset from ${airportTimezone} to ${adjustedOffset}`
            );
          }

          // Apply timezone offset to UTC time
          const utcTime = date.getTime();
          const localTime = new Date(utcTime + adjustedOffset * 60 * 60 * 1000);
          const hours = String(localTime.getUTCHours()).padStart(2, "0");
          const minutes = String(localTime.getUTCMinutes()).padStart(2, "0");
          displayTime = `${hours}:${minutes}`;

          console.log(
            `🕐 getEnhancedTimeDisplayProps: Converted UTC ${date.toISOString()} to local ${displayTime} (base offset: ${airportTimezone}h, DST adjusted: ${adjustedOffset}h)`
          );
        } else {
          // Fallback to UTC if no timezone info
          const hours = String(date.getUTCHours()).padStart(2, "0");
          const minutes = String(date.getUTCMinutes()).padStart(2, "0");
          displayTime = `${hours}:${minutes}`;

          console.log(
            `🕐 getEnhancedTimeDisplayProps: No timezone info, using UTC: ${displayTime}`
          );
        }
      } else {
        displayTime = null;
      }
      console.log(
        `🕐 getEnhancedTimeDisplayProps: Using PlaneFinder timestamp ${bestTimestamp} -> ${displayTime} (UTC: ${date?.toISOString()})`
      );
    } else {
      displayTime = null;
      console.log(
        `🕐 getEnhancedTimeDisplayProps: No PlaneFinder timestamp available`
      );
    }

    // Determine color based on delay
    const delayInfo = calculateEnhancedDelayInfo(flightData, type);
    if (delayInfo.delayMinutes > 0) {
      timeColorClass = "text-[#D81C1F]"; // Late
    } else if (delayInfo.delayMinutes < 0) {
      timeColorClass = "text-[#179C3C]"; // Early
    } else {
      timeColorClass = "text-[#000000]"; // On time
    }
  } else {
    // Fallback to FlightView data
    const scheduledTime =
      type === "departure"
        ? flightData.departure.scheduled
        : flightData.arrival.scheduled;
    const estimatedTime =
      type === "departure"
        ? flightData.departure.estimated
        : flightData.arrival.estimated;

    console.log(
      `🕐 getEnhancedTimeDisplayProps: Using FlightView ${type} data:`,
      {
        scheduled: scheduledTime,
        estimated: estimatedTime,
        parsedScheduled: parseTimeString(scheduledTime),
        parsedEstimated: parseTimeString(estimatedTime),
      }
    );

    const originalProps = getTimeDisplayProps(scheduledTime, estimatedTime);
    displayTime = originalProps.displayTime;
    timeColorClass = originalProps.timeColorClass;

    console.log(`🕐 getEnhancedTimeDisplayProps: FlightView result:`, {
      displayTime,
      timeColorClass,
      delayMinutes: originalProps.delayInfo.delayMinutes,
    });
  }

  const delayInfo = calculateEnhancedDelayInfo(flightData, type);

  console.log(`🕐 getEnhancedTimeDisplayProps: Final ${type} result:`, {
    displayTime,
    timeColorClass,
    delayMinutes: delayInfo.delayMinutes,
    delayText: delayInfo.delayText,
    delayColorClass: delayInfo.colorClass,
  });

  return {
    displayTime,
    timeColorClass,
    delayInfo,
  };
};

/**
 * Get scheduled time for display, ensuring timezone consistency with actual time
 * When using PlaneFinder data, convert scheduled time to same timezone as actual time
 */
export const getScheduledTimeForDisplay = (
  flightData: any,
  type: "departure" | "arrival"
): string | null => {
  const hasPlaneFinder = flightData._raw?.payload?.status;

  // Use PlaneFinder for "In Air" and "Landed" flights
  const shouldUsePlaneFinder =
    hasPlaneFinder &&
    (flightData.status === "In Air" || flightData.status === "Landed") &&
    (flightData.liveData || flightData.hex);

  if (shouldUsePlaneFinder) {
    // Use PlaneFinder scheduled timestamp with airport timezone
    const planeFinderData = flightData._raw.payload.status;
    let scheduledTimestamp: number | null;

    if (type === "departure") {
      scheduledTimestamp = planeFinderData.departureTimeScheduled;
    } else {
      scheduledTimestamp = planeFinderData.arrivalTimeScheduled;
    }

    if (scheduledTimestamp) {
      const date = parsePlaneFinderTimestamp(scheduledTimestamp);
      if (date) {
        // Get airport timezone info
        const airportTimezone =
          type === "departure"
            ? planeFinderData.departureAirport?.Timezone
            : planeFinderData.arrivalAirport?.Timezone;

        // Get DST info to adjust timezone
        const dstInfo =
          type === "departure"
            ? planeFinderData.departureAirport?.DST
            : planeFinderData.arrivalAirport?.DST;

        if (airportTimezone !== undefined && airportTimezone !== null) {
          // Adjust for DST if active
          let adjustedOffset = airportTimezone;
          if (dstInfo === "A") {
            adjustedOffset = airportTimezone + 1;
            console.log(
              `🕐 getScheduledTimeForDisplay: DST active, adjusting offset from ${airportTimezone} to ${adjustedOffset}`
            );
          }

          // Apply timezone offset to UTC time
          const utcTime = date.getTime();
          const localTime = new Date(utcTime + adjustedOffset * 60 * 60 * 1000);
          const hours = String(localTime.getUTCHours()).padStart(2, "0");
          const minutes = String(localTime.getUTCMinutes()).padStart(2, "0");
          const result = `${hours}:${minutes}`;

          console.log(
            `🕐 getScheduledTimeForDisplay: PlaneFinder ${type} scheduled ${scheduledTimestamp} -> ${result} (base offset: ${airportTimezone}h, DST adjusted: ${adjustedOffset}h)`
          );
          return result;
        }
      }
    }
  }

  // Fallback to FlightView data
  const scheduledTime =
    type === "departure"
      ? flightData.departure.scheduled
      : flightData.arrival.scheduled;

  const result = parseTimeString(scheduledTime);
  console.log(
    `🕐 getScheduledTimeForDisplay: FlightView ${type} scheduled -> ${result}`
  );
  return result;
};

/**
 * Calculate flight duration between departure and arrival times
 */
export const calculateFlightDuration = (
  departureTime: string | null,
  arrivalTime: string | null
): string | null => {
  if (!departureTime || !arrivalTime) return null;

  try {
    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);

    if (isNaN(departure.getTime()) || isNaN(arrival.getTime())) return null;

    const diffMs = arrival.getTime() - departure.getTime();
    if (diffMs <= 0) return null;

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return `${hours}h ${minutes}m`;
  } catch {
    return null;
  }
};

/**
 * Enhanced flight duration calculation that handles timezone-aware data
 */
export const calculateEnhancedFlightDuration = (
  flightData: any
): string | null => {
  const hasPlaneFinder = flightData._raw?.payload?.status;

  // Use PlaneFinder for "In Air" and "Landed" flights
  const shouldUsePlaneFinder =
    hasPlaneFinder &&
    (flightData.status === "In Air" || flightData.status === "Landed") &&
    (flightData.liveData || flightData.hex);

  if (shouldUsePlaneFinder) {
    // Use PlaneFinder timestamps (UTC) for accurate calculation
    const planeFinderData = flightData._raw.payload.status;

    // Get best available times
    const departureTimestamp =
      planeFinderData.departureTimeActual ||
      planeFinderData.departureTimeEstimated ||
      planeFinderData.departureTimeScheduled;

    const arrivalTimestamp =
      planeFinderData.arrivalTimeActual ||
      planeFinderData.arrivalTimeEstimated ||
      planeFinderData.arrivalTimeScheduled;

    if (departureTimestamp && arrivalTimestamp) {
      // Calculate duration using UTC timestamps (no timezone conversion needed for duration)
      const diffSeconds = arrivalTimestamp - departureTimestamp;
      const diffMinutes = Math.floor(diffSeconds / 60);
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;

      const result = `${hours}h ${minutes}m`;

      console.log(
        `🕐 calculateEnhancedFlightDuration: PlaneFinder calculation:`,
        {
          departureTimestamp,
          arrivalTimestamp,
          departureUTC: new Date(departureTimestamp * 1000).toISOString(),
          arrivalUTC: new Date(arrivalTimestamp * 1000).toISOString(),
          diffSeconds,
          diffMinutes,
          result,
        }
      );

      return result;
    }
  }

  // Fallback to FlightView data using best available times
  const departureTime =
    flightData.departure.estimated || flightData.departure.scheduled;
  const arrivalTime =
    flightData.arrival.estimated || flightData.arrival.scheduled;

  console.log(`🕐 calculateEnhancedFlightDuration: FlightView calculation:`, {
    departureTime,
    arrivalTime,
  });

  return calculateFlightDuration(departureTime, arrivalTime);
};

/**
 * Get consistent time display for both departure and arrival
 * Shows one time if on time, two times (strikethrough + new) if delayed/early
 */
export const getConsistentTimeDisplay = (
  actualTime: string | null,
  scheduledTime: string | null,
  delayMinutes: number
) => {
  const hasDelay = delayMinutes !== 0;

  console.log(`🕐 getConsistentTimeDisplay:`, {
    actualTime,
    scheduledTime,
    delayMinutes,
    hasDelay,
  });

  if (!hasDelay || !scheduledTime || actualTime === scheduledTime) {
    // On time: show only one time
    return {
      showSingleTime: true,
      primaryTime: actualTime || scheduledTime,
      secondaryTime: null,
      shouldStrikethrough: false,
    };
  } else {
    // Delayed/Early: show strikethrough scheduled + new actual time
    return {
      showSingleTime: false,
      primaryTime: actualTime,
      secondaryTime: scheduledTime,
      shouldStrikethrough: true,
    };
  }
};

/**
 * Get the display time with appropriate color based on delay
 */
export const getTimeDisplayProps = (
  scheduledTime: string | null,
  estimatedTime: string | null
) => {
  const displayTime = parseTimeString(estimatedTime || scheduledTime);
  const delayInfo = calculateDelayInfo(scheduledTime, estimatedTime);

  // Color the time based on delay status
  // Default black #000000, late red #D81C1F, early green #179C3C
  let timeColorClass = "text-[#000000]"; // Default black
  if (delayInfo.delayMinutes > 0) {
    timeColorClass = "text-[#D81C1F]"; // Late - red
  } else if (delayInfo.delayMinutes < 0) {
    timeColorClass = "text-[#179C3C]"; // Early - green
  }

  return {
    displayTime,
    timeColorClass,
    delayInfo,
  };
};
