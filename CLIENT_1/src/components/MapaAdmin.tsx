import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

export default function MapaAdmin() {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const polylineRef = useRef<L.Polyline | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    const [usuarios, setUsuarios] = useState<
        Record<string, [number, number][]>
    >({});
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string>("");

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

   /* 🔌 WebSocket ADMIN */
    useEffect(() => {
        let ws: WebSocket | null = null;
        let reconnectTimeout: number;

        const connectWS = () => {
            ws = new WebSocket("ws://localhost:8080/ws");

            ws.onopen = () => {
                console.log("🧑‍💼 Admin conectado al WS");
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: "register", role: "admin" }));
                }
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === "update") {
                        const { userId, position } = data;
                        setUsuarios((prev) => ({
                            ...prev,
                            [userId]: [...(prev[userId] || []), [position.lat, position.lng]],
                        }));
                    }
                } catch (err) {
                    // Ignorar errores de parseo para no ensuciar consola
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
    }, []);



    /* 🧭 Dibujar en el mapa */
    useEffect(() => {
        if (!usuarioSeleccionado || !mapRef.current) return;

        const puntos = usuarios[usuarioSeleccionado];
        if (!puntos || puntos.length === 0) return;

        const map = mapRef.current;

        if (!polylineRef.current) {
        polylineRef.current = L.polyline(puntos, {
            color: "red",
        }).addTo(map);
        } else {
        polylineRef.current.setLatLngs(puntos);
        }

        const ultimo = puntos[puntos.length - 1];

        if (!markerRef.current) {
        markerRef.current = L.marker(ultimo).addTo(map);
        } else {
        markerRef.current.setLatLng(ultimo);
        }

        map.panTo(ultimo);
    }, [usuarios, usuarioSeleccionado]);

    return (
        <div style={{ height: "100%", width: "100%" }}>
        {/* 🎯 Selector */}
        <div style={{ padding: 10, background: "#222", color: "#fff" }}>
            <label>👤 Visitante:&nbsp;</label>
            <select
            value={usuarioSeleccionado}
            onChange={(e) => {
                setUsuarioSeleccionado(e.target.value);
                polylineRef.current = null;
                markerRef.current = null;
            }}
            >
            <option value="">Seleccione…</option>
            {Object.keys(usuarios).map((id) => (
                <option key={id} value={id}>
                {id}
                </option>
            ))}
            </select>
        </div>

        {/* 🗺️ Mapa */}
        <div
            ref={containerRef}
            style={{ height: "calc(100% - 50px)", width: "100%" }}
        />
        </div>
    );
}
