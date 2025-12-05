// main.tsx o index.tsx
import React from "react";
import { createRoot } from "react-dom/client";

import "leaflet/dist/leaflet.css";


import App from "./App";

// 🟩 Fix icon paths for Leaflet (Vite bundling)
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* ❗ OJO: BrowserRouter ya está dentro de App  
        NO lo ponemos aquí para evitar doble enrutador */}
    <App />
  </React.StrictMode>
);

