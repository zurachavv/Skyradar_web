"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";

interface MapContainerProps {
  className?: string;
  flightRoute?: {
    departure: { lat: number; lng: number };
    arrival: { lat: number; lng: number };
  };
  livePosition?: {
    lat: number;
    lng: number;
    heading?: number;
    trackAngle?: number;
  };
  flightStatus?: "Scheduled" | "Departed" | "In Air" | "Landed" | "Arrived";
}

const MapContainer: React.FC<MapContainerProps> = ({
  className,
  flightRoute,
  livePosition,
  flightStatus,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    // Set the access token
    mapboxgl.accessToken =
      "pk.eyJ1Ijoic2t5cmFkYXIiLCJhIjoiY21kbjRmYnlmMTc0aDJxczV2NHZ1ZW85bCJ9.uD6ec9tv3LUJwuu8gnZ5_A";

    if (mapContainer.current) {
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [-74.5, 40], // Default to NYC area
          zoom: 9,
          attributionControl: false,
        });

        // Handle map load
        map.current.on("load", () => {
          setMapLoaded(true);
          console.log("Map loaded successfully");

          // Add map elements based on flight status
          if (flightRoute) {
            updateMapForFlightStatus(
              map.current!,
              flightRoute,
              flightStatus,
              livePosition
            );
          }
        });

        // Handle map errors
        map.current.on("error", (e) => {
          console.error("Map error:", e);
          setError("Failed to load map");
        });

        // Add navigation control
        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
      } catch (err) {
        console.error("Map initialization error:", err);
        setError("Failed to initialize map");
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map when flight data changes
  useEffect(() => {
    if (map.current && mapLoaded && flightRoute) {
      updateMapForFlightStatus(
        map.current,
        flightRoute,
        flightStatus,
        livePosition
      );
    }
  }, [flightRoute, flightStatus, livePosition, mapLoaded]);

  // Main function to update map based on flight status
  const updateMapForFlightStatus = useCallback(
    (
      mapInstance: mapboxgl.Map,
      route: NonNullable<MapContainerProps["flightRoute"]>,
      status: string | undefined,
      position: MapContainerProps["livePosition"]
    ) => {
      // Clear existing map elements
      clearMapElements(mapInstance);

      if (status === "Scheduled" || status === "Arrived") {
        addAirportPins(mapInstance, route);
        addRouteLine(mapInstance, route);
        fitMapToRoute(mapInstance, route);
      } else if (
        status === "Departed" ||
        status === "In Air" ||
        status === "Landed"
      ) {
        addRouteLine(mapInstance, route);

        if (position) {
          addPlaneIcon(mapInstance, position, route);
        } else {
          addAirportPins(mapInstance, route);
          fitMapToRoute(mapInstance, route);
        }
      } else {
        addAirportPins(mapInstance, route);
        addRouteLine(mapInstance, route);
        fitMapToRoute(mapInstance, route);
      }
    },
    []
  ); // Empty deps array - helper functions are stable

  // Clear all existing map elements
  const clearMapElements = (mapInstance: mapboxgl.Map) => {
    const sources = ["route", "departure", "arrival", "live-plane"];
    const layers = ["route", "departure", "arrival", "live-plane"];

    layers.forEach((layerId) => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.removeLayer(layerId);
      }
    });

    sources.forEach((sourceId) => {
      if (mapInstance.getSource(sourceId)) {
        mapInstance.removeSource(sourceId);
      }
    });
  };

  // Add airport pins (for Scheduled/Arrived flights)
  const addAirportPins = (
    mapInstance: mapboxgl.Map,
    route: NonNullable<MapContainerProps["flightRoute"]>
  ) => {
    try {
      // Add departure airport pin
      mapInstance.addSource("departure", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {
            type: "departure",
          },
          geometry: {
            type: "Point",
            coordinates: [route.departure.lng, route.departure.lat],
          },
        },
      });

      mapInstance.addLayer({
        id: "departure",
        type: "circle",
        source: "departure",
        paint: {
          "circle-radius": 8,
          "circle-color": "#179C3C",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });
      // Add arrival airport pin
      mapInstance.addSource("arrival", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {
            type: "arrival",
          },
          geometry: {
            type: "Point",
            coordinates: [route.arrival.lng, route.arrival.lat],
          },
        },
      });

      mapInstance.addLayer({
        id: "arrival",
        type: "circle",
        source: "arrival",
        paint: {
          "circle-radius": 8,
          "circle-color": "#FF6B9D",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });
    } catch (error) {
      console.error("❌ Error adding airport pins:", error);
    }
  };

  // Add route line
  const addRouteLine = (
    mapInstance: mapboxgl.Map,
    route: NonNullable<MapContainerProps["flightRoute"]>
  ) => {
    try {
      mapInstance.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [route.departure.lng, route.departure.lat],
              [route.arrival.lng, route.arrival.lat],
            ],
          },
        },
      });

      mapInstance.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#179C3C",
          "line-width": 2,
          "line-opacity": 0.6,
        },
      });
    } catch (error) {
      console.error("❌ Error adding route line:", error);
    }
  };

  // Add plane icon (for active flights)
  const addPlaneIcon = (
    mapInstance: mapboxgl.Map,
    position: NonNullable<MapContainerProps["livePosition"]>,
    route: NonNullable<MapContainerProps["flightRoute"]>
  ) => {
    console.log("✈️ Adding plane icon at position:", position);

    // Calculate plane rotation
    const bearing =
      position.trackAngle ||
      position.heading ||
      calculateBearing({ lat: position.lat, lng: position.lng }, route.arrival);

    console.log("🧭 Plane bearing:", bearing);

    // Load plane image if not already loaded
    if (!mapInstance.hasImage("plane-icon")) {
      mapInstance.loadImage("/plane.png", (error, image) => {
        if (error) {
          console.error("Error loading plane image:", error);
          return;
        }
        if (image) {
          mapInstance.addImage("plane-icon", image);
          addPlaneMarkerToMap(mapInstance, position, bearing);
        }
      });
    } else {
      addPlaneMarkerToMap(mapInstance, position, bearing);
    }
  };

  // Add plane marker to map
  const addPlaneMarkerToMap = (
    mapInstance: mapboxgl.Map,
    position: NonNullable<MapContainerProps["livePosition"]>,
    bearing: number
  ) => {
    mapInstance.addSource("live-plane", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {
          bearing: bearing,
        },
        geometry: {
          type: "Point",
          coordinates: [position.lng, position.lat],
        },
      },
    });

    mapInstance.addLayer({
      id: "live-plane",
      type: "symbol",
      source: "live-plane",
      layout: {
        "icon-image": "plane-icon",
        "icon-size": 0.08,
        "icon-rotate": bearing,
        "icon-rotation-alignment": "map",
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
    });

    // Center map on plane position
    mapInstance.setCenter([position.lng, position.lat]);
    mapInstance.setZoom(8);
  };

  // Fit map to show entire route
  const fitMapToRoute = (
    mapInstance: mapboxgl.Map,
    route: NonNullable<MapContainerProps["flightRoute"]>
  ) => {
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([route.departure.lng, route.departure.lat]);
    bounds.extend([route.arrival.lng, route.arrival.lat]);

    mapInstance.fitBounds(bounds, {
      padding: 50,
      maxZoom: 6,
    });
  };

  const addFlightRoute = (
    mapInstance: mapboxgl.Map,
    route: NonNullable<MapContainerProps["flightRoute"]>
  ) => {
    console.log("🗺️ Adding flight route to map:", {
      departure: `${route.departure.lat}, ${route.departure.lng}`,
      arrival: `${route.arrival.lat}, ${route.arrival.lng}`,
      distance:
        calculateDistance(route.departure, route.arrival).toFixed(2) + " km",
    });

    // Remove existing route if any
    if (mapInstance.getSource("route")) {
      mapInstance.removeLayer("route");
      mapInstance.removeSource("route");
    }
    if (mapInstance.getSource("departure")) {
      mapInstance.removeLayer("departure");
      mapInstance.removeSource("departure");
    }
    if (mapInstance.getSource("arrival")) {
      mapInstance.removeLayer("arrival");
      mapInstance.removeSource("arrival");
    }

    // Add route line
    mapInstance.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [route.departure.lng, route.departure.lat],
            [route.arrival.lng, route.arrival.lat],
          ],
        },
      },
    });

    mapInstance.addLayer({
      id: "route",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#FF6B9D",
        "line-width": 3,
      },
    });

    // Add departure airport marker
    mapInstance.addSource("departure", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [route.departure.lng, route.departure.lat],
        },
      },
    });

    mapInstance.addLayer({
      id: "departure",
      type: "circle",
      source: "departure",
      paint: {
        "circle-radius": 8,
        "circle-color": "#179C3C",
      },
    });

    // Add arrival airport marker
    mapInstance.addSource("arrival", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [route.arrival.lng, route.arrival.lat],
        },
      },
    });

    mapInstance.addLayer({
      id: "arrival",
      type: "circle",
      source: "arrival",
      paint: {
        "circle-radius": 8,
        "circle-color": "#FF6B9D",
      },
    });

    // Fit map to route bounds
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([route.departure.lng, route.departure.lat]);
    bounds.extend([route.arrival.lng, route.arrival.lat]);

    mapInstance.fitBounds(bounds, {
      padding: 50,
      maxZoom: 6,
    });
  };

  const calculateBearing = (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number }
  ): number => {
    const toRadians = (deg: number) => (deg * Math.PI) / 180;
    const toDegrees = (rad: number) => (rad * 180) / Math.PI;

    const lat1 = toRadians(start.lat);
    const lat2 = toRadians(end.lat);
    const deltaLng = toRadians(end.lng - start.lng);

    const x = Math.sin(deltaLng) * Math.cos(lat2);
    const y =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

    const bearing = toDegrees(Math.atan2(x, y));
    return (bearing + 360) % 360; // Normalize to 0-360
  };

  const calculateDistance = (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number }
  ): number => {
    const toRadians = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // Earth's radius in kilometers

    const lat1 = toRadians(start.lat);
    const lat2 = toRadians(end.lat);
    const deltaLat = toRadians(end.lat - start.lat);
    const deltaLng = toRadians(end.lng - start.lng);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometers
  };

  const addLivePlane = (
    mapInstance: mapboxgl.Map,
    position: NonNullable<MapContainerProps["livePosition"]>,
    destination: { lat: number; lng: number }
  ) => {
    // Use actual heading from flight data, prefer trackAngle over heading
    // trackAngle is the actual direction of travel, heading is the direction plane is pointing
    const actualHeading =
      position.trackAngle ||
      position.heading ||
      calculateBearing({ lat: position.lat, lng: position.lng }, destination);

    console.log("🛩️ Adding live plane to map:", {
      position: `${position.lat}, ${position.lng}`,
      trackAngle: position.trackAngle || "N/A",
      heading: position.heading || "N/A",
      actualHeading: actualHeading.toFixed(1) + "°",
      distanceToDestination:
        calculateDistance(position, destination).toFixed(2) + " km",
    });

    // Remove existing plane if any
    if (mapInstance.getSource("live-plane")) {
      mapInstance.removeLayer("live-plane");
      mapInstance.removeSource("live-plane");
    }

    // Load plane image if not already loaded
    if (!mapInstance.hasImage("plane-icon")) {
      mapInstance.loadImage("/plane.png", (error, image) => {
        if (error) {
          console.error("Error loading plane image:", error);
          return;
        }
        if (image) {
          mapInstance.addImage("plane-icon", image);
          addPlaneMarker(mapInstance, position, actualHeading);
        }
      });
    } else {
      addPlaneMarker(mapInstance, position, actualHeading);
    }
  };

  const addPlaneMarker = (
    mapInstance: mapboxgl.Map,
    position: NonNullable<MapContainerProps["livePosition"]>,
    bearing: number
  ) => {
    // Add plane position source
    mapInstance.addSource("live-plane", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {
          bearing: bearing,
        },
        geometry: {
          type: "Point",
          coordinates: [position.lng, position.lat],
        },
      },
    });

    // Add plane layer with rotation
    mapInstance.addLayer({
      id: "live-plane",
      type: "symbol",
      source: "live-plane",
      layout: {
        "icon-image": "plane-icon",
        "icon-size": 0.08, // Smaller size for better visibility
        "icon-rotate": bearing, // Rotate based on actual heading/track angle
        "icon-rotation-alignment": "map",
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
    });

    // Center map on plane position
    mapInstance.setCenter([position.lng, position.lat]);
    mapInstance.setZoom(8);
  };

  if (error) {
    return (
      <div
        className={`w-full ${className} flex items-center justify-center bg-gray-100`}
        style={{ height: "300px" }}
      >
        <div className="text-center">
          <p className="text-red-500 mb-2">Map Error</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        className={`w-full ${className}`}
        style={{ height: "300px" }}
      />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-skyradar-green mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapContainer;
