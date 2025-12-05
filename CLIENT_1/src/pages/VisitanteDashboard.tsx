import React from "react";
import { Drawer } from "@mui/material";
import Mapa from "../components/MapaVisitante";
import LeftSidebar from "../components/LeftSidebar";

interface DashboardProps {
  sidebarOpen: boolean;
  onSidebarClose: () => void;
}

export default function Dashboard({ sidebarOpen, onSidebarClose }: DashboardProps) {
  return (
    <div
      style={{
        height: "calc(100vh - 64px)", // 🔹 Resta la altura del Navbar global (64px aprox)
        overflow: "hidden", // 🔹 Evita scroll innecesario
        position: "relative",
      }}
    >
      {/* 🗺️ Mapa ocupa todo el espacio disponible */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        <Mapa />
      </div>

      {/* 📋 Drawer lateral */}
      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={onSidebarClose}
        PaperProps={{
          sx: {
            width: 300,
            backgroundColor: "#f9fafb",
            color: "#111827",
            padding: 3,
          },
        }}
      >
        <LeftSidebar onClose={onSidebarClose} />
      </Drawer>
    </div>
  );
}
