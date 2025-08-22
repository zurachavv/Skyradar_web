// Shared component types following DRY and SOLID principles

export interface NavbarProps {
  showBack?: boolean;
  title: string;
  flightCode?: string;
  airline?: string;
  onBack?: () => void;
}

export interface MapProps {
  flightRoute?: {
    departure: { lat: number; lng: number };
    arrival: { lat: number; lng: number };
  } | null;
  livePosition?: {
    lat: number;
    lng: number;
    heading?: number;
    trackAngle?: number;
  } | null;
  flightStatus?: "Scheduled" | "Departed" | "In Air" | "Landed" | "Arrived";
}

export interface ScreenLayoutProps {
  navbar: NavbarProps;
  map: MapProps;
  children: React.ReactNode;
  className?: string;
}

// Flight screen specific props
export interface FlightScreenNavbarProps extends NavbarProps {
  flightCode: string;
  airline: string;
}

export interface FlightScreenMapProps extends MapProps {
  flightRoute: {
    departure: { lat: number; lng: number };
    arrival: { lat: number; lng: number };
  } | null;
  livePosition: {
    lat: number;
    lng: number;
    heading?: number;
    trackAngle?: number;
  } | null;
}
