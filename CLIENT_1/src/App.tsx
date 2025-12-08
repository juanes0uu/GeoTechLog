// App.tsx
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Login from "./components/Login";
import RegisterPage from "./components/Register";
import SeguimientoAdmin from "./pages/SeguimientoAdmin";

import Dashboard from "./pages/Dashboard";
import Perfil from "./pages/Perfil";
import Info from "./pages/Info";
import Contacto from "./pages/Contacto";
import Configuracion from "./pages/Configuracion";
import VisitanteDashboard from "./pages/VisitanteDashboard";

import Navbar from "./components/Navbar";

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // ✔ Correcto: React detecta cambios en la ruta
  const hideNavbarPaths = ["/", "/register"];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {showNavbar && (
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
      )}

      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* App */}
        <Route
          path="/dashboard"
          element={
            <Dashboard
              sidebarOpen={sidebarOpen}
              onSidebarClose={() => setSidebarOpen(false)}
            />
          }
        />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/info" element={<Info />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/visitante" element={<VisitanteDashboard />} />
        <Route path="/seguimiento" element={<SeguimientoAdmin />} />

      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
