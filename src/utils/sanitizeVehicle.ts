/**
 * Helper to sanitize vehicle info strings and eliminate any legacy 'fleet' or 'e-bike' strings
 */
export function sanitizeVehicleInfo(info?: string | null): string {
  if (!info) return 'Unassigned E-Shuttle';
  let cleaned = info
    .replace(/Unassigned\s+Fleet\s+E-Bike/gi, 'Unassigned E-Shuttle')
    .replace(/Unassigned\s+Fleet\s+E-Shuttle/gi, 'Unassigned E-Shuttle')
    .replace(/Fleet\s+E-Bike/gi, 'E-Shuttle')
    .replace(/Fleet\s+E-Shuttle/gi, 'E-Shuttle')
    .replace(/E-Bike/gi, 'E-Shuttle')
    .replace(/\bfleet\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned || cleaned === 'Unassigned' || cleaned === 'Unassigned E-') {
    return 'Unassigned E-Shuttle';
  }
  return cleaned;
}
