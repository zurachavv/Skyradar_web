// API Response Types - Single source of truth for all external API interfaces

// ===== FlightView API Types =====
export interface FlightViewResponse {
  flights: FlightViewFlightData[];
  flight: FlightViewFlight | null;
  emptyResults: boolean;
}

export interface FlightViewFlightData {
  airline: string;
  airlineCode: string;
  flightNumber: number;
  status: number;
  displayStatus: string;
  departureTime: string;
  departureAirportName: string;
  departureAirportCode: string;
  arrivalTime: string;
  arrivalAirportName: string;
  arrivalAirportCode: string;
  timeRemaining: string | null;
}

export interface FlightViewFlight {
  arrival: FlightViewArrival;
  departure: FlightViewDeparture;
  titles: FlightViewTitles;
  aircraft: FlightViewAircraft;
  flightStatus: string;
  showMap: boolean;
  scheduleInstanceKey: string;
  previousFlight: any | null;
}

export interface FlightViewArrival {
  timeRemaining: string;
  onGroundTime: string | null;
  inGateTime: string | null;
  gate: string;
  baggage: string;
  arrivalDateTime: string;
  airport: string;
  airportCity: string;
  airportCode: string;
  airportCountryCode: string;
  airportSlug: string;
  scheduledTime: string;
  estimatedTime: string;
  terminal: string;
}

export interface FlightViewDeparture {
  offGroundTime: string;
  outGateTime: string | null;
  gate: string;
  departureDateTime: string;
  airport: string;
  airportCity: string;
  airportCode: string;
  airportCountryCode: string;
  airportSlug: string;
  scheduledTime: string;
  estimatedTime: string | null;
  terminal: string;
}

export interface FlightViewTitles {
  main: string;
  sub: string | null;
}

export interface FlightViewAircraft {
  id: number;
  code: string;
  name: string;
}

// ===== PlaneFinder API Types (Existing) =====
export interface FlightData {
  success: boolean;
  payload: {
    aircraft: {
      adshex: string;
      model: string;
      series: string;
      registration: string;
      typeCode: string;
      manufacturer: string;
      airline: string;
      airlineICAO: string;
      type: string;
    } | null;
    static: {
      iata: string;
      icao: string;
      hex: string;
      flightNumber: {
        carrier: string;
        flightNumber: number;
      };
      carrier: string;
      departureAirportIATA: string;
      arrivalAirportIATA: string;
      serviceType: string;
    } | null;
    dynamic: {
      selectedAltitude: number | null;
      barometer: number | null;
      magneticHeading: number | null;
      rollAngle: number | null;
      groundSpeed: number | null;
      indicatedAirSpeed: number | null;
      trueAirSpeed: number | null;
      mach: number | null;
      trackAngle: number | null;
      targetHeading: number | null;
      windSpeed: number | null;
      windDirection: number | null;
      outsideAirTemperature: number | null;
      vertRate: number | null;
      lat: number | null;
      lon: number | null;
      altitude: number | null;
      heading: number | null;
      speed: number | null;
      airlineCode: string | null;
      reg: string | null;
      callsign: string | null;
      flightNumber: string | null;
    };
    status: {
      departureAirportIATA: string;
      arrivalAirportIATA: string;
      divertAirportIATA?: string | null;
      departureTerminalScheduled?: string | null;
      departureTerminalActual?: string | null;
      departureGateScheduled?: string | null;
      departureGateActual?: string | null;
      arrivalTerminalScheduled?: string | null;
      arrivalTerminalActual?: string | null;
      arrivalGateScheduled?: string | null;
      arrivalGateActual?: string | null;
      departureGate?: string | null;
      arrivalGate?: string | null;
      arrivalTimeActual?: number | null;
      arrivalTimeScheduled?: number | null;
      arrivalTimeEstimated?: number | null;
      departureTimeActual?: number | null;
      departureTimeScheduled?: number | null;
      departureTimeEstimated?: number | null;
      bestDepartureTime?: number | null;
      bestArrivalTime?: number | null;
      departureTerminal?: string | null;
      arrivalTerminal?: string | null;
      arrivalBaggageBelt?: string | null;
      lastUpdateTime?: string | null;
      registration?: string | null;
      aircraftType?: string | null;
      flightNumber?: string | null;
      airlineCode?: string | null;
      departureAirport?: {
        Name: string;
        City: string;
        IATA: string;
        ICAO: string;
        Latitude: number;
        Longitude: number;
        Country: string;
        Timezone: number;
        DST: string;
        Important: number;
        tzName: string;
        Major: number;
      };
      arrivalAirport?: {
        Name: string;
        City: string;
        IATA: string;
        ICAO: string;
        Latitude: number;
        Longitude: number;
        Country: string;
        Timezone: number;
        DST: string;
        Important: number;
        tzName: string;
        Major: number;
      };
    };
  };
}

// ===== FlightRadar24 API Types =====
export interface FlightSummaryResponse {
  data: Array<{
    fr24_id: string;
    flight: string;
    callsign: string;
    operating_as: string;
    painted_as: string;
    type: string;
    reg: string;
    orig_icao: string;
    datetime_takeoff: string;
    dest_icao: string;
    dest_icao_actual: string;
    datetime_landed: string | null;
    hex: string;
    first_seen: string;
    last_seen: string;
    flight_ended: boolean;
  }>;
}

// ===== Unified Flight Data Types =====
// This is what our components will use - normalized from different APIs
// Weather API Types
export interface WeatherResponse {
  location: string;
  phrase: string;
  temperature: number;
  temperatureUnits: string;
  heatIndex: number;
  heatIndexUnits: string;
  windChill: number;
  windChillUnits: string;
  relativeHumidity: number;
  relativeHumidityUnits: string;
  windDirection: string;
  windSpeed: number;
  windSpeedUnits: string;
  pressure: number;
  pressureUnits: string;
  visibility: number;
  visibilityUnits: string;
  feelsLikeTemperature: number;
  feelsLikeTemperatureUnits: string;
  icon: string;
  timeStamp: string;
}

export interface UnifiedFlightData {
  // Basic flight info
  flightNumber: string;
  airline: string;
  aircraftType: string;
  status: string;
  airlineICAO?: string; // ICAO code for airline logo

  // Times
  departure: {
    scheduled: string | null;
    estimated: string | null;
    actual: string | null;
    gate: string | null;
    terminal: string | null;
  };

  arrival: {
    scheduled: string | null;
    estimated: string | null;
    actual: string | null;
    gate: string | null;
    terminal: string | null;
    timeRemaining?: string | null;
  };

  // Airports
  airports: {
    departure: {
      code: string;
      name: string;
      city: string;
      country?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    arrival: {
      code: string;
      name: string;
      city: string;
      country?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
  };

  // Live tracking data (when available)
  liveData?: {
    position: {
      lat: number;
      lng: number;
    };
    altitude: number;
    speed: number;
    heading: number;
    trackAngle?: number;
  };

  // Source metadata
  source: "flightview" | "planefinder" | "flightradar24";
  hex?: string; // For PlaneFinder API
  _raw?: any; // Raw API response for enhanced calculations
}

// ===== Flight Number Parsing Types =====
export interface ParsedFlightNumber {
  iata: string;
  number: string;
  original: string;
}

// ===== API Error Types =====
export interface ApiError {
  message: string;
  status?: number;
  source: string;
}
