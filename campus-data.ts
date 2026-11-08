export type VehicleType = 'keke' | 'minibus';
export type Place = { id: string; name: string; lat: number; lng: number };
export type Driver = { id: string; name: string; type: VehicleType; lat: number; lng: number; wallet: number; online: boolean };

// Rough placeholder coordinates (approximate). Replace with your real campus points.
export const PLACES: Place[] = [
  { id: 'hostels', name: 'Hostels', lat: 9.0765, lng: 7.3986 },
  { id: 'cafeteria', name: 'Cafeteria', lat: 9.0775, lng: 7.3996 },
  { id: 'nlt', name: 'New Lecture Theatre', lat: 9.0785, lng: 7.3976 },
  { id: 'computing', name: 'Faculty of Computing', lat: 9.0795, lng: 7.4006 },
  { id: 'chapel', name: 'Chapel', lat: 9.0755, lng: 7.4006 },
  { id: 'mph', name: 'Multi-Purpose Hall', lat: 9.0775, lng: 7.4016 },
  { id: 'senate', name: 'Senate Building', lat: 9.0805, lng: 7.3986 },
];

export const DRIVERS: Driver[] = [
  { id: 'k1', name: 'Keke 01', type: 'keke', lat: 9.0768, lng: 7.3990, wallet: 500, online: true },
  { id: 'k2', name: 'Keke 02', type: 'keke', lat: 9.0790, lng: 7.4000, wallet: 50, online: true },
  { id: 'm1', name: 'Mini bus 01', type: 'minibus', lat: 9.0780, lng: 7.3980, wallet: 800, online: true },
];

export const SLOTS = ['6:15 am', '6:30 am', '6:45 am'];

export function fareBetween(a: string, b: string): number {
  const p = PLACES.find((x) => x.id === a), q = PLACES.find((x) => x.id === b);
  if (!p || !q) return 200;
  const km = Math.hypot((p.lat - q.lat) * 111, (p.lng - q.lng) * 110);
  return Math.min(500, Math.max(200, Math.round((200 + km * 300) / 50) * 50));
}
