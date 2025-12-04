import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "../services/api";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import batmanImg from "../assets/batman.png";
import { FooterControlesVisitantes } from "./FooterControles";

// Fix icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Icono del visitante
const batmanIcon = L.icon({
  iconUrl: batmanImg,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
});

// Icono de lugares
const lugarIcon = L.divIcon({
  className: "custom-lugar-icon",
  html: `<div style="font-size: 28px;">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

// Usuario simulado
const USUARIO_SIMULADO_ID = 1;

export default function MapaVisitante() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const [rutaCargada, setRutaCargada] = useState<[number, number][]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  // ID de la ruta actualmente cargada (o null si no hay)
  const [rutaGuardadaId, setRutaGuardadaId] = useState<number | null>(null);
  // Puntos de la ruta cargada como pares [lat, lon]
  const [puntos, setPuntos] = useState<[number, number][]>([]);

  const marcadorUsuarioRef = useRef<L.Marker | null>(null);
  const lugaresLayerRef = useRef<L.LayerGroup | null>(null);

  // =============================
  // Cargar lugares
  // =============================
  const cargarLugares = async () => {
    try {
      const resp = await api.getLugares();

      const data = Array.isArray(resp)
        ? resp
        : Array.isArray(resp.data)
        ? resp.data
        : Array.isArray(resp.result)
        ? resp.result
        : [];

      const map = mapRef.current;
      if (!map) return;

      if (!lugaresLayerRef.current) {
        lugaresLayerRef.current = L.layerGroup().addTo(map);
      } else {
        lugaresLayerRef.current.clearLayers();
      }

      data.forEach((lugar: any) => {
        L.marker(
          [parseFloat(lugar.Latitud), parseFloat(lugar.Longitud)],
          { icon: lugarIcon }
        )
          .addTo(lugaresLayerRef.current!)
          .bindPopup(`<b>${lugar.Nombre}</b><br>${lugar.Descripcion || ""}`);
      });

    } catch (err) {
      console.error("Error cargando lugares:", err);
    }
  };

  // =============================
  // Inicializar mapa
  // =============================
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current).setView(
      [5.794425, -73.062991],
      17
    );
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    iniciarUbicacionUsuario();

    return () => map.remove();
  }, []);

  // =============================
  // Ubicación del visitante
  // =============================
  const iniciarUbicacionUsuario = () => {
    const map = mapRef.current;
    if (!map || !navigator.geolocation) return;

    navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        if (!marcadorUsuarioRef.current) {
          marcadorUsuarioRef.current = L.marker([latitude, longitude], {
            icon: batmanIcon,
          })
            .addTo(map)
            .bindPopup("🦇 Tu ubicación");

          map.setView([latitude, longitude], 16);
        } else {
          marcadorUsuarioRef.current.setLatLng([latitude, longitude]);
        }

        try {
          await api.postUbicacion({
            IdUsuario: USUARIO_SIMULADO_ID,
            Latitud: latitude,
            Longitud: longitude,
          });
        } catch (e) {
          console.warn("Error guardando ubicación:", e);
        }
      },
      (err) => console.error("Geolocalización error:", err),
      { enableHighAccuracy: true }
    );
  };

  // =============================
  // Cargar ruta desde BD
  // =============================
  // =============================
// Cargar ruta desde BD
// =============================
const cargarRuta = async () => {
  try {
    const rutas = await api.getRutas();
    if (!Array.isArray(rutas) || rutas.length === 0)
      return alert("No hay rutas guardadas.");

    const lista = rutas.map((r: any) => `${r.IdRuta}: ${r.Nombre}`).join("\n");
    const input = prompt(`Selecciona el ID de la ruta:\n${lista}`);

    const id = Number(input);
    if (!id || isNaN(id)) return;

    const detalle = await api.getRutaDetalle(id);
    if (!Array.isArray(detalle) || detalle.length === 0)
      return alert("Esta ruta no tiene puntos guardados.");

    // Convertir puntos a coords
    const coords: [number, number][] = detalle.map((p: any) => [
      parseFloat(p.Latitud),
      parseFloat(p.Longitud),
    ]);

    setRutaCargada(coords);
    setRutaGuardadaId(id);
    setPuntos(coords);

    const map = mapRef.current;
    if (!map) return;

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }

    polylineRef.current = L.polyline(coords, { color: "blue" }).addTo(map);
    map.fitBounds(polylineRef.current.getBounds());

    alert(`Ruta cargada correctamente.`);
  } catch (err) {
    console.error("Error cargando ruta:", err);
    alert("Error cargando ruta.");
  }
};

// =============================
// Limpiar ruta
// =============================
const limpiarRuta = () => {
  setRutaCargada([]);
  setRutaGuardadaId(null);
  setPuntos([]);

  if (polylineRef.current && mapRef.current) {
    mapRef.current.removeLayer(polylineRef.current);
    polylineRef.current = null;
  }
};



  // =============================
  // Simular ruta cargada
  // =============================
  const simular = () => {
    const map = mapRef.current;
    if (!map || rutaCargada.length === 0)
      return alert("Debe cargar una ruta para simular.");

    let i = 0;
    const marker = L.marker(rutaCargada[0]).addTo(map);

    const intervalo = setInterval(() => {
      if (i >= rutaCargada.length) {
        clearInterval(intervalo);
        marker.bindPopup("🚩 Fin de ruta").openPopup();
        return;
      }
      marker.setLatLng(rutaCargada[i]);
      i++;
    }, 800);
  };

  // =============================
  // Render
  // =============================
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      ></div>

      <FooterControlesVisitantes
        onCargar={cargarRuta}
        onLimpiar={limpiarRuta}
        onCargarLugares={cargarLugares}
        onSimular={simular}
        rutaGuardadaId={rutaGuardadaId}
        puntos={puntos}
        guardando={false}
      />
    </div>
  );
}
