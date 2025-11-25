// client1/src/components/MapBackground.tsx
import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Importa las imágenes correctamente (sin require)
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const DEFAULT_CENTER: [number, number] = [5.82, -73.03];
const DEFAULT_ZOOM = 16;

// Corrige los iconos por defecto de Leaflet (sin usar any)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

type Props = {
  center?: [number, number];
  zoom?: number;
  locked?: boolean; // si es true, desactiva la interacción
  children?: React.ReactNode; // para superponer formularios o tarjetas
};

export default function MapBackground({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  locked = true,
  children,
}: Props) {
  return (
    <div className="w-full h-screen relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={!locked}
        dragging={!locked}
        doubleClickZoom={!locked}
        zoomControl={!locked}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <Marker position={center} />
      </MapContainer>

      {/* overlay para contenido (formularios, etc.) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-md p-4 pointer-events-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
