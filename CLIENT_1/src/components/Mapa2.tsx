import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api, apiMapa } from "../services/apiMapa";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import batmanImg from "../assets/batman.png";
import FooterControles from "./FooterControles";

// 🔧 Fix de íconos por defecto de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// 🦇 Icono personalizado del usuario
const batmanIcon = L.icon({
  iconUrl: batmanImg,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -45],
});

// 📍 Ícono tipo pin para los lugares
const lugarIcon = L.divIcon({
  className: "custom-lugar-icon",
  html: `<div style="font-size: 28px;">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

// 👤 Usuario simulado
const USUARIO_SIMULADO_ID = 1;

export default function Mapa2() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [puntos, setPuntos] = useState<[number, number][]>([]);
  const [lugares, setLugares] = useState<any[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const marcadorUsuarioRef = useRef<L.Marker | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [rutaGuardadaId, setRutaGuardadaId] = useState<number | null>(null);
  const [modoCarga, setModoCarga] = useState(false);
  const [modoCrearLugar, setModoCrearLugar] = useState(false);
  const modoCrearLugarRef = useRef(false);
  const lugaresLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    modoCrearLugarRef.current = modoCrearLugar;
  }, [modoCrearLugar]);

  // ⚙️ Cargar todos los lugares guardados
  const cargarLugares = async () => {
    try {
      const resp = await api.getLugares();
      console.log("📦 Respuesta completa de la API:", resp);

      const data = Array.isArray(resp)
        ? resp
        : Array.isArray(resp.data)
        ? resp.data
        : Array.isArray(resp.result)
        ? resp.result
        : [];

      if (!Array.isArray(data) || data.length === 0) {
        console.warn("⚠️ No se encontraron lugares válidos en la respuesta.");
        return;
      }

      setLugares(data);
      const map = mapRef.current;
      if (!map) return;

      if (lugaresLayerRef.current) {
        lugaresLayerRef.current.clearLayers();
      } else {
        lugaresLayerRef.current = L.layerGroup().addTo(map);
      }

      data.forEach((lugar: any) => {
        const marker = L.marker(
          [parseFloat(lugar.Latitud), parseFloat(lugar.Longitud)],
          { icon: lugarIcon }
        ).bindPopup(`
          <b>${lugar.Nombre}</b><br>${lugar.Descripcion || "Sin descripción"}
        `);
        marker.addTo(lugaresLayerRef.current!);
      });

      console.log(`✅ ${data.length} lugares cargados en el mapa.`);
    } catch (err) {
      console.error("Error cargando lugares:", err);
    }
  };

  // 🗺️ Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current).setView([5.794425, -73.062991], 17);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    iniciarUbicacionUsuario();

    map.on("click", async (e: any) => {
      const { lat, lng } = e.latlng;

      // 🟢 Crear lugar
      if (modoCrearLugarRef.current) {
        const nombre = prompt("📝 Nombre del lugar:");
        if (!nombre) return alert("Debes ingresar un nombre.");
        const descripcion = prompt("📄 Descripción del lugar:") ?? "";

        try {
          const nuevoLugar = await api.postLugar({
            IdUsuario: USUARIO_SIMULADO_ID,
            Nombre: nombre,
            Descripcion: descripcion,
            Latitud: lat,
            Longitud: lng,
          });

          L.marker([lat, lng], { icon: lugarIcon })
            .addTo(lugaresLayerRef.current || map)
            .bindPopup(`<b>${nombre}</b><br>${descripcion}`)
            .openPopup();

          setLugares((prev) => [
            ...prev,
            {
              IdLugar: nuevoLugar.IdLugar,
              Nombre: nombre,
              Descripcion: descripcion,
              Latitud: lat,
              Longitud: lng,
            },
          ]);

          alert("✅ Lugar creado correctamente.");
        } catch (err) {
          console.error("Error creando lugar:", err);
          alert("❌ Error al crear el lugar: " + (err as any).message);
        } finally {
          modoCrearLugarRef.current = false;
          setModoCrearLugar(false);
        }
        return;
      }

      // 🟦 Agregar punto a la ruta
      if (!rutaGuardadaId) {
        setPuntos((prev) => [...prev, [lat, lng]]);
      }
    });

    return () => map.remove();
  }, []);

  // ✏️ Dibujar la ruta
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (polylineRef.current) map.removeLayer(polylineRef.current);
    if (puntos.length > 0) {
      polylineRef.current = L.polyline(puntos as L.LatLngExpression[], {
        color: "blue",
      }).addTo(map);

      if (puntos.length === 1 && !modoCarga) {
        map.setView(puntos[0], 17);
      } else if (modoCarga) {
        map.fitBounds(polylineRef.current.getBounds());
      }
    }
  }, [puntos, modoCarga]);

  // 📡 Ubicación del usuario
  const iniciarUbicacionUsuario = () => {
    const map = mapRef.current;
    if (!navigator.geolocation || !map) return;

    navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!marcadorUsuarioRef.current) {
          marcadorUsuarioRef.current = L.marker([latitude, longitude], {
            icon: batmanIcon,
          })
            .addTo(map)
            .bindPopup("🦇 Tu ubicación")
            .openPopup();
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
          console.error("Error guardando ubicación:", e);
        }
      },
      (err) => console.warn("Geolocalización error:", err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
  };

  // 💾 Guardar ruta
  const guardarRuta = async () => {
    if (puntos.length === 0) return alert("Primero debes marcar una ruta.");
    if (guardando) return;

    setGuardando(true);
    try {
      const nombre = `Ruta - ${new Date().toLocaleString()}`;
      const resRuta = await api.postRuta({
        IdUsuario: USUARIO_SIMULADO_ID,
        Nombre: nombre,
      });

      const idRuta = resRuta.IdRuta ?? resRuta.ruta?.IdRuta ?? null;
      if (!idRuta) throw new Error("No se pudo obtener el IdRuta.");

      const detalles = puntos.map((pt, idx) =>
        api.postRutaDetalle({
          IdRuta: idRuta,
          Latitud: pt[0],
          Longitud: pt[1],
          Orden: idx + 1,
        })
      );
      await Promise.all(detalles);

      setRutaGuardadaId(idRuta);
      alert(`✅ Ruta guardada correctamente. IdRuta = ${idRuta}`);

      // 🧹 Limpiar después de guardar
      setTimeout(() => {
        setPuntos([]);
        if (polylineRef.current && mapRef.current) {
          mapRef.current.removeLayer(polylineRef.current);
          polylineRef.current = null;
        }
        setRutaGuardadaId(null);
      }, 1200);
    } catch (err) {
      console.error("Error guardando ruta:", err);
      alert("Error al guardar la ruta: " + (err as any).message);
    } finally {
      setGuardando(false);
    }
  };

  // 📂 Cargar ruta
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

      const coords = detalle.map((p: any) => [
        parseFloat(p.Latitud),
        parseFloat(p.Longitud),
      ]) as [number, number][];
      setModoCarga(true);
      setPuntos(coords);
      alert(`📍 Ruta ${id} cargada correctamente.`);
      setTimeout(() => setModoCarga(false), 1000);
    } catch (err) {
      console.error("Error cargando ruta:", err);
      alert("Error al cargar la ruta: " + (err as any).message);
    }
  };

  // ▶️ Simular recorrido
  const simular = () => {
    const map = mapRef.current;
    if (!map || puntos.length === 0)
      return alert("No hay ruta definida.");
    let i = 0;
    const marcador = L.marker(puntos[0] as L.LatLngExpression).addTo(map);
    const intervalo = setInterval(() => {
      if (i >= puntos.length) {
        clearInterval(intervalo);
        marcador.bindPopup("🚩 Llegó al destino").openPopup();
        return;
      }
      marcador.setLatLng(puntos[i]);
      i++;
    }, 800);
  };

  // 🚶 Simular movimiento del usuario
  const simularMovimientoUsuario = () => {
    const map = mapRef.current;
    if (!map) return alert("El mapa no está listo aún.");

    if (!marcadorUsuarioRef.current) {
      alert("No hay marcador de usuario aún. Activa la ubicación o espera un momento.");
      return;
    }

    const recorrido = [
      { lat: 5.756, lon: -72.909 },
      { lat: 5.7565, lon: -72.9087 },
      { lat: 5.757, lon: -72.908 },
      { lat: 5.7573, lon: -72.9074 },
      { lat: 5.7577, lon: -72.907 },
      { lat: 5.758, lon: -72.9067 },
    ];

    let i = 0;
    const intervalo = setInterval(async () => {
      if (i >= recorrido.length) {
        clearInterval(intervalo);
        alert("🦇 Simulación de movimiento completada.");
        return;
      }

      const { lat, lon } = recorrido[i];
      marcadorUsuarioRef.current!.setLatLng([lat, lon]);
      map.panTo([lat, lon]);
      i++;

      try {
        await api.postUbicacion({
          IdUsuario: USUARIO_SIMULADO_ID,
          Latitud: lat,
          Longitud: lon,
        });
      } catch (e) {
        console.warn("Error simulando ubicación:", e);
      }
    }, 1500);
  };

  // 🧹 Limpiar ruta
  const limpiarRuta = () => {
    setPuntos([]);
    if (polylineRef.current && mapRef.current) {
      mapRef.current.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
  };

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

      <FooterControles 
        onGuardar={guardarRuta}
        onCargar={cargarRuta}
        onLimpiar={limpiarRuta}
        onCargarLugares={cargarLugares}
        onSimular={simular}
        onSimularMovimiento={simularMovimientoUsuario}
        onCrearLugar={() => {
          setModoCrearLugar(true);
          alert("🟢 Haz clic en el mapa para crear un lugar.");
        }}
        guardando={guardando}
        rutaGuardadaId={rutaGuardadaId}
        puntos={puntos}
      />
    </div>
  );
}
