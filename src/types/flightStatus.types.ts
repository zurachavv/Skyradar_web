// Flight Status Types - Single source of truth for all status-related interfaces

export type FlightStatus =
  | "Scheduled"
  | "Departed"
  | "In Air"
  | "Landed"
  | "Arrived";

export interface FlightStatusData {
  status: FlightStatus;
  timeRemaining?: string | null;
  gate?: string | null;
  terminal?: string | null;
  scheduledTime?: string | null;
  actualTime?: string | null;
  estimatedTime?: string | null;
  onTime?: boolean;
  delayMinutes?: number;
}

export interface FlightDisplayConfig {
  showPlane: boolean;
  showAirports: boolean;
  statusMessage: string;
  timeDisplay?: string;
  priority: "departure" | "arrival" | "none";
}

export interface FlightMapData {
  showLivePosition: boolean;
  showRoute: boolean;
  departureCoords?: { lat: number; lng: number };
  arrivalCoords?: { lat: number; lng: number };
  livePosition?: {
    lat: number;
    lng: number;
    heading?: number;
    trackAngle?: number;
  };
}

// Status-based rendering configuration
export interface StatusDisplayRules {
  [K in FlightStatus]: {
    showPlane: boolean;
    showRoute: boolean;
    primaryTimeType: "departure" | "arrival" | "remaining";
    statusPrefix: string;
  };
}
