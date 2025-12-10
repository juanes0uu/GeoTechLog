import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "../services/apiMapa";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import FooterVisitante from "./FooterVisitante";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// 📍 Icono para lugares
const lugarIcon = L.divIcon({
  className: "custom-lugar-icon",
  html: `<div style="font-size: 28px;">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

export default function MapaVisitante() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const polylineRef = useRef<L.Polyline | null>(null);
  const lugaresLayerRef = useRef<L.LayerGroup | null>(null);

  const [puntos, setPuntos] = useState<[number, number][]>([]);
  const [lugares, setLugares] = useState<any[]>([]);
  const [recorridoActivo, setRecorridoActivo] = useState(false);
  const [rutaActual, setRutaActual] = useState<[number, number][]>([]);
  const [mensaje, setMensaje] = useState("");
  const [usuarioId, setUsuarioId] = useState<string>(""); // 👈 NUEVO: guardar ID del usuario

  const wsRef = useRef<WebSocket | null>(null);
  const markerUsuarioRef = useRef<L.Marker | null>(null);
  const indiceRef = useRef(0); // índice del punto actual en la ruta

  // --------------------------------------------------------------------
  // 🗺 Inicializar Mapa
  // --------------------------------------------------------------------
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

    return () => map.remove();
  }, []);

  // --------------------------------------------------------------------
  // 🔌 Conectar WebSocket y recibir ubicaciones EN TIEMPO REAL
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: number;

    const connectWS = () => {
      ws = new WebSocket("ws://localhost:8080/ws");
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ Visitante conectado al WS");
        
        // 👇 OBTENER DATOS REALES DEL USUARIO LOGUEADO
        const usuarioStorage = localStorage.getItem("usuario");
        let usuario = { 
          id: `visitante-${Date.now()}`, 
          nombre: "Visitante", 
          email: "",
          userId: "" // Para el ID real de la BD
        };
        
        if (usuarioStorage) {
          try {
            const parsed = JSON.parse(usuarioStorage);
            usuario = {
              id: `visitante-${parsed.id || Date.now()}`, // ID único para WS
              nombre: parsed.nombre || "Visitante",
              email: parsed.email || "",
              userId: parsed.id?.toString() || "" // ID real de la BD
            };
          } catch (e) {
            console.error("Error parsing usuario:", e);
          }
        }

        // Guardar el ID del usuario para usarlo en las funciones
        setUsuarioId(usuario.id);

        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: "register",
            role: "visitante",
            userId: usuario.id, // ID único para el WebSocket
            dbUserId: usuario.userId, // ID de la base de datos
            userName: usuario.nombre, // Nombre real
            email: usuario.email // Email real
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Mensaje recibido del servidor:", data);
        } catch (error) {
          // Silenciar errores de parseo
        }
      };

      ws.onerror = (error) => {
        console.error("❌ Error en WebSocket:", error);
        if (ws && ws.readyState !== WebSocket.CLOSING && ws.readyState !== WebSocket.CLOSED) {
          ws.close();
        }
      };

      ws.onclose = () => {
        console.log("⚠️ WS visitante desconectado, reintentando en 2s...");
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
        }
        reconnectTimeout = window.setTimeout(() => {
          if (document.visibilityState === 'visible') {
            console.log("🔄 Intentando reconexión...");
            connectWS();
          }
        }, 2000);
      };
    };

    if (document.visibilityState === 'visible') {
      connectWS();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && (!ws || ws.readyState === WebSocket.CLOSED)) {
        console.log("📱 Pestaña visible, reconectando...");
        connectWS();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) {
        ws.onclose = null;
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      wsRef.current = null;
    };
  }, []);

  // --------------------------------------------------------------------
  // ✏️ Dibujar ruta en tiempo real
  // --------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !rutaActual) return;

    if (polylineRef.current) {
      polylineRef.current.setLatLngs(rutaActual);
    } else {
      polylineRef.current = L.polyline(rutaActual, { color: "blue" }).addTo(map);
    }

    if (rutaActual.length > 0) {
      map.fitBounds(polylineRef.current.getBounds());
    }
  }, [rutaActual]);

  // --------------------------------------------------------------------
  // 📌 Cargar lugares de la BD
  // --------------------------------------------------------------------
  const cargarLugares = async () => {
    try {
      const resp = await api.getLugares();
      const data = Array.isArray(resp) ? resp : resp.data ?? [];
      setLugares(data);

      const map = mapRef.current;
      if (!map) return;

      if (lugaresLayerRef.current) {
        lugaresLayerRef.current.clearLayers();
      } else {
        lugaresLayerRef.current = L.layerGroup().addTo(map);
      }

      data.forEach((lugar: any) => {
        L.marker(
          [parseFloat(lugar.Latitud), parseFloat(lugar.Longitud)],
          { icon: lugarIcon }
        )
          .addTo(lugaresLayerRef.current!)
          .bindPopup(`<b>${lugar.Nombre}</b><br>${lugar.Descripcion ?? ""}`);
      });
    } catch (err) {
      console.error("Error cargando lugares:", err);
    }
  };

  // --------------------------------------------------------------------
  // 📂 Cargar ruta guardada
  // --------------------------------------------------------------------
  const cargarRuta = async () => {
    try {
      const rutas = await api.getRutas();
      if (!Array.isArray(rutas) || rutas.length === 0)
        return alert("No hay rutas disponibles.");

      const lista = rutas.map((r: any) => `${r.IdRuta}: ${r.Nombre}`).join("\n");
      const input = prompt(`Selecciona ID de ruta:\n${lista}`);
      const id = Number(input);
      if (!id || isNaN(id)) return;

      const detalle = await api.getRutaDetalle(id);
      if (!Array.isArray(detalle) || detalle.length === 0)
        return alert("Esta ruta no tiene puntos.");

      const coords = detalle.map((p: any) => [
        parseFloat(p.Latitud),
        parseFloat(p.Longitud),
      ]) as [number, number][];

      setPuntos(coords);

      const map = mapRef.current;
      if (!map) return;

      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
      }

      polylineRef.current = L.polyline(coords, { color: "blue" }).addTo(map);

      if (coords.length > 0) {
        map.fitBounds(polylineRef.current.getBounds());
      }

    } catch (err) {
      console.error("Error cargando ruta:", err);
    }
  };

  // --------------------------------------------------------------------
  // 🧹 Limpiar ruta
  // --------------------------------------------------------------------
  const limpiar = () => {
    setPuntos([]);
    setRutaActual([]);
    setRecorridoActivo(false);

    if (polylineRef.current && mapRef.current) {
      mapRef.current.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
  };

  // --------------------------------------------------------------------
  // 🆕 Enviar ubicación RANDOM - CORREGIDO
  // --------------------------------------------------------------------
  const enviarRandom = () => {
    if (!rutaActual || rutaActual.length === 0 || !wsRef.current) return;

    const index = indiceRef.current;
    const [latBase, lngBase] = rutaActual[index];

    const desviacionLat = (Math.random() - 0.5) * 0.00005;
    const desviacionLng = (Math.random() - 0.5) * 0.00005;

    const lat = latBase + desviacionLat;
    const lng = lngBase + desviacionLng;

    // ✅ VALIDACIÓN LOCAL DE RUTA
    if (recorridoActivo && !estaEnRuta(lat, lng)) {
      setMensaje("⚠️ Estás fuera de la ruta!");
    } else {
      setMensaje("");
    }

    // Enviar al WS - USAR EL ID REAL DEL USUARIO
    if (wsRef.current.readyState === WebSocket.OPEN && usuarioId) {
      wsRef.current.send(
        JSON.stringify({
          type: "location",
          userId: usuarioId, // 👈 ID REAL del usuario
          position: { lat, lng },
        })
      );
    }

    // Actualizar marker
    const map = mapRef.current;
    if (!map) return;

    if (markerUsuarioRef.current) {
      markerUsuarioRef.current.setLatLng([lat, lng]);
    } else {
      markerUsuarioRef.current = L.marker([lat, lng]).addTo(map);
    }

    map.setView([lat, lng], 17);

    // Guardar en puntos para la polilínea
    setPuntos((prev) => [...prev, [lat, lng]]);

    // Avanzar al siguiente índice
    indiceRef.current = (index + 1) % rutaActual.length;
  };

  // --------------------------------------------------------------------
  // 🆕 Enviar ubicación REAL - CORREGIDO
  // --------------------------------------------------------------------
  const enviarUbicacionReal = () => {
    if (!navigator.geolocation) {
      return alert("Tu navegador no soporta geolocalización.");
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // ✅ VALIDACIÓN LOCAL DE RUTA
        if (recorridoActivo && !estaEnRuta(lat, lng)) {
          setMensaje("⚠️ Estás fuera de la ruta!");
        } else {
          setMensaje("");
        }

        const map = mapRef.current;
        if (!map) return;

        // Enviar con el ID REAL del usuario
        if (wsRef.current?.readyState === WebSocket.OPEN && usuarioId) {
          wsRef.current.send(
            JSON.stringify({
              type: "location",
              userId: usuarioId, // 👈 ID REAL del usuario
              position: { lat, lng },
            })
          );
        }

        if (markerUsuarioRef.current) {
          markerUsuarioRef.current.setLatLng([lat, lng]);
        } else {
          markerUsuarioRef.current = L.marker([lat, lng]).addTo(map);
        }

        map.setView([lat, lng], 17);
      },
      (err) => console.error("Error obteniendo ubicación:", err),
      { enableHighAccuracy: true }
    );
  };

  // --------------------------------------------------------------------
  // 🔹 Funciones de recorrido
  // --------------------------------------------------------------------
  const iniciarRecorrido = async () => {
    try {
      const rutas = await api.getRutas();
      if (!Array.isArray(rutas) || rutas.length === 0) return alert("No hay rutas.");

      const lista = rutas.map((r: any) => `${r.IdRuta}: ${r.Nombre}`).join("\n");
      const input = prompt(`Elige ID de ruta:\n${lista}`);
      const id = Number(input);
      if (!id || isNaN(id)) return;

      const detalle = await api.getRutaDetalle(id);
      if (!Array.isArray(detalle) || detalle.length === 0) return alert("Ruta sin puntos.");

      const coords = detalle.map((p: any) => [parseFloat(p.Latitud), parseFloat(p.Longitud)]) as [number, number][];
      setRutaActual(coords);
      setPuntos(coords);
      setRecorridoActivo(true);

      // 🟢 Dibujar polilínea inmediatamente
      const map = mapRef.current;
      if (!map) return;

      // Eliminar polilínea anterior
      if (polylineRef.current) map.removeLayer(polylineRef.current);

      // Crear nueva polilínea
      polylineRef.current = L.polyline(coords, { color: "blue" }).addTo(map);

      // Centrar y ajustar mapa
      if (coords.length > 0) map.fitBounds(polylineRef.current.getBounds());

      await cargarLugares();
      alert("🏁 Recorrido iniciado! Ahora puedes moverte por la ruta.");
    } catch (err) {
      console.error("Error iniciando recorrido:", err);
    }
  };

  const estaEnRuta = (lat: number, lng: number) => {
    if (!rutaActual || rutaActual.length === 0) return true;

    const umbral = 0.000017; // ~3 metros
    return rutaActual.some(([rLat, rLng]) =>
      Math.sqrt((lat - rLat) ** 2 + (lng - rLng) ** 2) <= umbral
    );
  };

  // --------------------------------------------------------------------
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {mensaje && (
        <div style={{
          position: "absolute",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(255,0,0,0.8)",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: 6,
          zIndex: 1000,
        }}>
          {mensaje}
        </div>
      )}

      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: "100%", borderRadius: "8px", overflow: "hidden" }}
      ></div>

      <FooterVisitante
        onCargar={cargarRuta}
        onCargarLugares={cargarLugares}
        onSimular={() => {}}
        onLimpiar={limpiar}
        onEnviarUbicacionReal={enviarUbicacionReal}
        onEnviarRandom={enviarRandom}
        onIniciarRecorrido={iniciarRecorrido}
        puntos={puntos}
      />
    </div>
  );
}