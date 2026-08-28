import { AdminSettings, LocationOption } from '../types';

export const DEFAULT_FARE_SETTINGS: AdminSettings = {
  baseFare: 0,
  pricePerKm: 0,
  minimumFare: 0,
  initialSearchRadiusKm: 5,
  appLogoUrl: '',
};

export function calculateFare(_distanceKm?: number, _settings?: AdminSettings): number {
  return 0; // 100% Free Shuttle Service
}

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 decimal place
}

export function estimateDurationMinutes(distanceKm: number): number {
  // Average e-bike shuttle speed: ~20 km/h + 2 min buffer
  const minutes = Math.ceil((distanceKm / 20) * 60) + 2;
  return Math.max(minutes, 3);
}

// Default urban location hubs for quick pickup/destination selection
export const POPULAR_LOCATIONS: LocationOption[] = [
  {
    name: 'Central E-Shuttle Hub',
    address: '100 Main Transit Plaza, Business District',
    latitude: 14.5547,
    longitude: 121.0244,
  },
  {
    name: 'Metropolitan Tech Park',
    address: '45 Innovation Way, BGC North',
    latitude: 14.5518,
    longitude: 121.0492,
  },
  {
    name: 'Greenbelt Terminal',
    address: 'Legazpi Street, Makati City',
    latitude: 14.552,
    longitude: 121.0205,
  },
  {
    name: 'University Campus Gate 1',
    address: 'Katipunan Avenue, Education Center',
    latitude: 14.6393,
    longitude: 121.0772,
  },
  {
    name: 'Bayfront Station',
    address: 'Seaside Boulevard, Commercial Center',
    latitude: 14.5352,
    longitude: 120.9822,
  },
  {
    name: 'Suburban Residential Hub',
    address: 'Block 12 Avenue B, Vista Homes',
    latitude: 14.5682,
    longitude: 121.0312,
  },
];
