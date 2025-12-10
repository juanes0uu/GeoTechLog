// src/components/MapaAdmin.tsx - MODIFICADO
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Definir tipo para visitante
type VisitorInfo = {
  name: string;
  email: string;
  dbUserId?: string;
  positions: [number, number][];
  lastUpdate: Date;
  active: boolean;
};

interface MapaAdminProps {
  visitors: Record<string, VisitorInfo>;
  setVisitors: React.Dispatch<React.SetStateAction<Record<string, VisitorInfo>>>;
  usuarioSeleccionado: string;
  setUsuarioSeleccionado: React.Dispatch<React.SetStateAction<string>>;
}

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Colores diferentes para cada visitante
const visitorColors = [
  "#FF0000", // Rojo
  "#0000FF", // Azul
  "#008000", // Verde
  "#FFA500", // Naranja
  "#800080", // Púrpura
  "#FF1493", // Rosa
];

export default function MapaAdmin({ 
  visitors, 
  setVisitors, 
  usuarioSeleccionado, 
  setUsuarioSeleccionado 
}: MapaAdminProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const polylineRefs = useRef<Record<string, L.Polyline>>({});
  const markerRefs = useRef<Record<string, L.Marker>>({});

  /* 🗺️ Inicializar mapa */
  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current).setView([5.7944, -73.063], 16);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    return () => map.remove();
  }, []);

  /* 🔌 WebSocket ADMIN MEJORADO - USA setVisitors DEL PROP */
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: number;

    const connectWS = () => {
      ws = new WebSocket("ws://localhost:8080/ws");

      ws.onopen = () => {
        console.log("🧑‍💼 Admin conectado al WS");
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ 
            type: "register", 
            role: "admin",
            userName: "Administrador" 
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "new_visitor") {
            // Nuevo visitante conectado - USA setVisitors DEL PROP
            setVisitors(prev => ({
              ...prev,
              [data.userId]: {
                name: data.userName || `Visitante ${data.userId}`,
                email: data.email || "",
                dbUserId: data.dbUserId,
                positions: [],
                lastUpdate: new Date(),
                active: true
              }
            }));
            console.log(`🆕 Nuevo visitante: ${data.userName} (${data.userId})`);
          }
          else if (data.type === "visitor_left") {
            // Visitante desconectado - USA setVisitors DEL PROP
            setVisitors(prev => ({
              ...prev,
              [data.userId]: {
                ...prev[data.userId],
                active: false,
                lastUpdate: new Date()
              }
            }));
            console.log(`👋 Visitante desconectado: ${data.userId}`);
          }
          else if (data.type === "update") {
            // Actualización de ubicación - USA setVisitors DEL PROP
            const { userId, dbUserId, userName, position } = data;
            
            setVisitors(prev => {
              const visitor = prev[userId];
              if (!visitor) {
                // Si no existe, crear uno nuevo
                return {
                  ...prev,
                  [userId]: {
                    name: userName || `Visitante ${userId}`,
                    email: "",
                    dbUserId: dbUserId,
                    positions: [[position.lat, position.lng]],
                    lastUpdate: new Date(),
                    active: true
                  }
                };
              }
              
              return {
                ...prev,
                [userId]: {
                  ...visitor,
                  positions: [...visitor.positions, [position.lat, position.lng]],
                  lastUpdate: new Date(),
                  active: true
                }
              };
            });
          }
        } catch (err) {
          console.error("Error parsing WS message:", err);
        }
      };

      ws.onerror = () => {
        // Evitamos mostrar error feo en consola
      };

      ws.onclose = () => {
        console.log("⚠️ WS admin desconectado, reintentando en 2s...");
        reconnectTimeout = window.setTimeout(connectWS, 2000);
      };
    };

    connectWS();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws && ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [setVisitors]); // 👈 Agrega setVisitors como dependencia

  /* 🧭 Dibujar en el mapa - SOLO USUARIO SELECCIONADO */
  useEffect(() => {
    if (!usuarioSeleccionado || !mapRef.current) return;

    const visitor = visitors[usuarioSeleccionado];
    if (!visitor || visitor.positions.length === 0) return;

    const map = mapRef.current;
    const colorIndex = Object.keys(visitors).indexOf(usuarioSeleccionado) % visitorColors.length;
    const color = visitorColors[colorIndex];

    // Limpiar marcador y polilínea anteriores para este usuario
    if (markerRefs.current[usuarioSeleccionado]) {
      map.removeLayer(markerRefs.current[usuarioSeleccionado]);
    }
    if (polylineRefs.current[usuarioSeleccionado]) {
      map.removeLayer(polylineRefs.current[usuarioSeleccionado]);
    }

    // Crear nueva polilínea para este usuario
    const polyline = L.polyline(visitor.positions, {
      color: color,
      weight: 3,
      opacity: 0.8
    }).addTo(map);
    polylineRefs.current[usuarioSeleccionado] = polyline;

    // Crear marcador para la última posición
    const ultimo = visitor.positions[visitor.positions.length - 1];
    const marker = L.marker(ultimo, {
      title: visitor.name,
      alt: `Ubicación de ${visitor.name}`
    })
    .addTo(map)
    .bindPopup(`<b>${visitor.name}</b><br>Última actualización: ${visitor.lastUpdate.toLocaleTimeString()}`);
    
    markerRefs.current[usuarioSeleccionado] = marker;

    // Centrar mapa en la última posición
    map.panTo(ultimo);
  }, [visitors, usuarioSeleccionado]);

  // Limpiar todo al cambiar de usuario seleccionado
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Limpiar todos los layers anteriores
    Object.values(polylineRefs.current).forEach(polyline => {
      if (polyline && mapRef.current) {
        mapRef.current.removeLayer(polyline);
      }
    });
    Object.values(markerRefs.current).forEach(marker => {
      if (marker && mapRef.current) {
        mapRef.current.removeLayer(marker);
      }
    });
    
    polylineRefs.current = {};
    markerRefs.current = {};
  }, [usuarioSeleccionado]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      {/* 🎯 Selector MEJORADO */}
      <div style={{ 
        padding: 10, 
        background: "#222", 
        color: "#fff",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap"
      }}>
        <label>👤 Visitantes activos:&nbsp;</label>
        <select
          value={usuarioSeleccionado}
          onChange={(e) => {
            setUsuarioSeleccionado(e.target.value);
          }}
          style={{ padding: "5px 10px", borderRadius: "4px", minWidth: "200px" }}
        >
          <option value="">Seleccione un visitante…</option>
          {Object.entries(visitors).map(([id, visitor]) => (
            <option key={id} value={id}>
              {visitor.name} {visitor.active ? "🟢" : "🔴"} - {visitor.positions.length} puntos
            </option>
          ))}
        </select>
        
        {/* Información del visitante seleccionado */}
        {usuarioSeleccionado && visitors[usuarioSeleccionado] && (
          <div style={{ marginLeft: "auto", display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <span>
              <strong>{visitors[usuarioSeleccionado].name}</strong>
            </span>

          </div>
        )}
      </div>

      {/* 🗺️ Mapa */}
      <div
        ref={containerRef}
        style={{ height: "calc(100% - 50px)", width: "100%" }}
      />
    </div>
  );
}