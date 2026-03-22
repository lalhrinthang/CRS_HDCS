/**
 * Calculate the distance between two geographic coordinates
 * using the Haversine formula.
 * 
 * WHY HAVERSINE?
 * The Earth is a sphere (roughly). You can't just do Pythagorean theorem
 * on latitude/longitude because the "grid" is curved. The Haversine formula
 * accounts for this curvature.
 * 
 * @returns Distance in meters
 */
export function haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371000; // Earth radius in meters
    const toRad  = (degrees: number) => degrees * (Math.PI / 180);
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    // Haversine formula
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    // Angular distance in radians
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}