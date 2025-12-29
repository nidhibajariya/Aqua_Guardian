import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  title: string;
  severity: number;
  description?: string;
}

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

interface MapComponentProps {
  points: MapPoint[];
  center?: [number, number];
  zoom?: number;
}

const MapComponent: React.FC<MapComponentProps> = ({
  points,
  center = [20.5937, 78.9629], // India centroid
  zoom = 4,
}) => {
  if (typeof window === 'undefined') {
    return <div className="w-full h-full rounded-xl border border-border bg-muted" />;
  }

  return (
    <MapContainer
      className="w-full h-full rounded-xl border border-border"
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((point) => (
        <Marker key={point.id} position={[point.lat, point.lng]} icon={markerIcon}>
          <Popup>
            <div className="space-y-1">
              <p className="font-semibold">{point.title}</p>
              <p className="text-sm text-muted-foreground">{point.description}</p>
              <p className="text-xs text-warning font-medium">
                Severity Score: {point.severity}%
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;

