'use client';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { PLACES, type Driver } from '@/lib/campus-data';

export default function CampusMap({ drivers, selected = [] }: { drivers: Driver[]; selected?: string[] }) {
  return (
    <MapContainer center={[9.0780, 7.3995]} zoom={16} style={{ height: 320, borderRadius: 12 }}>
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {PLACES.map((p) => (
        <CircleMarker key={p.id} center={[p.lat, p.lng]} radius={9} pathOptions={{ color: selected.includes(p.id) ? '#0e4d52' : '#ffb400', fillOpacity: 0.8 }}>
          <Tooltip>{p.name} (approximate)</Tooltip>
        </CircleMarker>
      ))}
      {drivers.filter((d) => d.online).map((d) => (
        <CircleMarker key={d.id} center={[d.lat, d.lng]} radius={6} pathOptions={{ color: '#d62828', fillOpacity: 1 }}>
          <Tooltip>{d.name}</Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
