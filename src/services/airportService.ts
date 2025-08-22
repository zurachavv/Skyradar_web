interface AirportCoordinates {
  lat: number;
  lng: number;
}

/**
 * Fetch airport coordinates from a free aviation API
 * Uses the Aviation Stack API (free tier available)
 */
export const fetchAirportCoordinates = async (
  airportCode: string
): Promise<AirportCoordinates | null> => {
  try {
    console.log("🌍 Fetching coordinates for airport:", airportCode);
    
    // Use a free aviation API endpoint
    const apiUrl = `https://api.aviationapi.com/v1/airports?apt=${airportCode}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.warn(`⚠️ Aviation API error for ${airportCode}:`, response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.length > 0 && data[0].lat && data[0].lon) {
      const coordinates = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
      
      console.log(`✅ Found coordinates for ${airportCode}:`, coordinates);
      return coordinates;
    }
    
    console.warn(`⚠️ No coordinates found for ${airportCode}`);
    return null;
  } catch (error) {
    console.error(`❌ Error fetching coordinates for ${airportCode}:`, error);
    return null;
  }
};

/**
 * Batch fetch coordinates for multiple airports
 */
export const fetchMultipleAirportCoordinates = async (
  airportCodes: string[]
): Promise<Record<string, AirportCoordinates>> => {
  const coordinates: Record<string, AirportCoordinates> = {};
  
  console.log("🌍 Batch fetching coordinates for airports:", airportCodes);
  
  // Fetch coordinates for each airport (with small delay to avoid rate limiting)
  for (const code of airportCodes) {
    const coords = await fetchAirportCoordinates(code);
    if (coords) {
      coordinates[code] = coords;
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`✅ Batch fetch complete. Found ${Object.keys(coordinates).length}/${airportCodes.length} airports`);
  return coordinates;
};
