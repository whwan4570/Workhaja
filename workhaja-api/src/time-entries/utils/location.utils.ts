/**
 * Location utility functions for GPS coordinate calculations
 */

/**
 * Calculate the distance between two GPS coordinates using the Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in miles
 */
export function calculateDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Verify if a location is within the allowed radius from the store location
 * @param storeLat - Store latitude
 * @param storeLon - Store longitude
 * @param userLat - User latitude
 * @param userLon - User longitude
 * @param radiusMiles - Allowed radius in miles (default: 3)
 * @returns Object with verified status and distance in miles
 */
export function verifyLocation(
  storeLat: number | null,
  storeLon: number | null,
  userLat: number | null,
  userLon: number | null,
  radiusMiles: number = 3,
): { verified: boolean; distanceMiles: number | null } {
  // If store doesn't have GPS coordinates, cannot verify
  if (storeLat === null || storeLon === null) {
    return { verified: false, distanceMiles: null };
  }

  // If user didn't provide GPS coordinates, cannot verify
  if (userLat === null || userLon === null) {
    return { verified: false, distanceMiles: null };
  }

  // Calculate distance
  const distanceMiles = calculateDistanceMiles(
    storeLat,
    storeLon,
    userLat,
    userLon,
  );

  // Check if within radius
  const verified = distanceMiles <= radiusMiles;

  return { verified, distanceMiles };
}

