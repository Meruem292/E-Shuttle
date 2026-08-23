export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  type: string;
  modifier?: string;
  streetName?: string;
  location: [number, number]; // [lat, lng]
}

export interface RouteResult {
  coordinates: [number, number][]; // [lat, lng] for Leaflet
  distanceKm: number;
  durationMinutes: number;
  steps: RouteStep[];
}

// In-memory cache for fast repeated route lookups
const routeCache = new Map<string, RouteResult>();

export const fetchRoadRoute = async (
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<RouteResult> => {
  const cacheKey = `${startLat.toFixed(4)},${startLng.toFixed(4)}_${endLat.toFixed(4)},${endLng.toFixed(4)}`;
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSRM HTTP error ${response.status}`);
    }

    const data = await response.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const rawCoords: [number, number][] = route.geometry.coordinates; // [lng, lat]
      const coordinates: [number, number][] = rawCoords.map(([lng, lat]) => [lat, lng]);

      const steps: RouteStep[] = [];
      if (route.legs && route.legs.length > 0 && route.legs[0].steps) {
        route.legs[0].steps.forEach((st: any) => {
          const type = st.maneuver?.type || 'straight';
          const modifier = st.maneuver?.modifier || '';
          const street = st.name ? st.name : 'road';
          let instruction = 'Head straight';

          if (type === 'depart') {
            instruction = `Head ${modifier ? modifier : 'forward'} on ${street}`;
          } else if (type === 'arrive') {
            instruction = `Arrive at destination on ${street}`;
          } else if (type === 'turn' || type === 'end of road' || type === 'fork') {
            instruction = `Turn ${modifier ? modifier : ''} onto ${street}`.replace(/\s+/g, ' ');
          } else if (type === 'roundabout') {
            instruction = `At roundabout, take exit onto ${street}`;
          } else if (street && street !== 'road') {
            instruction = `Continue onto ${street}`;
          }

          const loc: [number, number] = st.maneuver?.location
            ? [st.maneuver.location[1], st.maneuver.location[0]]
            : [startLat, startLng];

          steps.push({
            instruction: instruction.trim(),
            distanceMeters: Math.round(st.distance || 0),
            durationSeconds: Math.round(st.duration || 0),
            type,
            modifier,
            streetName: st.name,
            location: loc,
          });
        });
      }

      const result: RouteResult = {
        coordinates,
        distanceKm: parseFloat((route.distance / 1000).toFixed(2)),
        durationMinutes: Math.max(1, Math.round(route.duration / 60)),
        steps,
      };

      routeCache.set(cacheKey, result);
      return result;
    }
  } catch (error) {
    console.warn('OSRM routing API error, falling back to interpolated path:', error);
  }

  // Fallback: Generate an interpolated multi-point road-like curve path if API is unreachable
  return generateFallbackRoadPath(startLat, startLng, endLat, endLng);
};

// Fallback path generator creates realistic intermediate waypoints along city grid
function generateFallbackRoadPath(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): RouteResult {
  const stepsCount = 8;
  const coordinates: [number, number][] = [];

  // Create L-shaped / Manhattan grid curve to simulate city streets instead of straight line
  const midLat = endLat;
  const midLng = startLng;

  // Leg 1: Vertical
  for (let i = 0; i <= stepsCount / 2; i++) {
    const t = i / (stepsCount / 2);
    const lat = startLat + (midLat - startLat) * t;
    const lng = startLng;
    coordinates.push([lat, lng]);
  }

  // Leg 2: Horizontal
  for (let i = 1; i <= stepsCount / 2; i++) {
    const t = i / (stepsCount / 2);
    const lat = endLat;
    const lng = midLng + (endLng - midLng) * t;
    coordinates.push([lat, lng]);
  }

  // Rough distance calculation
  const R = 6371; // Earth radius in km
  const dLat = ((endLat - startLat) * Math.PI) / 180;
  const dLng = ((endLng - startLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((startLat * Math.PI) / 180) *
      Math.cos((endLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distKm = parseFloat((R * c * 1.3).toFixed(2)); // ~1.3 street detour factor

  const steps: RouteStep[] = [
    {
      instruction: 'Head towards destination',
      distanceMeters: Math.round(distKm * 500),
      durationSeconds: 120,
      type: 'depart',
      location: [startLat, startLng],
    },
    {
      instruction: 'Turn onto main avenue',
      distanceMeters: Math.round(distKm * 500),
      durationSeconds: 120,
      type: 'turn',
      modifier: 'right',
      location: [midLat, midLng],
    },
    {
      instruction: 'Arrive at destination',
      distanceMeters: 0,
      durationSeconds: 0,
      type: 'arrive',
      location: [endLat, endLng],
    },
  ];

  return {
    coordinates,
    distanceKm: distKm,
    durationMinutes: Math.max(1, Math.round((distKm / 20) * 60)), // ~20 km/h e-bike speed
    steps,
  };
}
