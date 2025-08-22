import { ReactNode } from "react";
import MapContainer from "./MapContainer";
import { NavbarProps, MapProps, ScreenLayoutProps } from "@/types/components";

const Navbar = ({
  showBack,
  title,
  flightCode,
  airline,
  onBack,
}: NavbarProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {showBack && (
            <button
              onClick={onBack}
              className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          {!showBack && (
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="space-y-1">
                <div className="w-5 h-0.5 bg-gray-600"></div>
                <div className="w-5 h-0.5 bg-gray-600"></div>
                <div className="w-5 h-0.5 bg-gray-600"></div>
              </div>
            </button>
          )}
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-skyradar-black">{title}</h1>
          {flightCode && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{flightCode}</span>
              {airline && <span className="ml-2">{airline}</span>}
            </div>
          )}
        </div>
        <div className="w-11" /> {/* Spacer for centering */}
      </div>
    </header>
  );
};

const ScreenLayout = ({
  navbar,
  map,
  children,
  className = "",
}: ScreenLayoutProps) => {
  return (
    <div className={`min-h-screen bg-white ${className}`}>
      <Navbar {...navbar} />

      <div className="h-[300px] w-full">
        <MapContainer
          flightRoute={map.flightRoute || undefined}
          livePosition={map.livePosition || undefined}
          flightStatus={map.flightStatus}
        />
      </div>

      <main className="flex-1">{children}</main>
    </div>
  );
};

export default ScreenLayout;
