// src/pages/SeguimientoAdmin.tsx
import { useState } from "react";
import MapaAdmin from "../components/MapaAdmin";
import UserStatusPanel from "../components/UserStatusPanel";
import { Box } from "@mui/material";

// Define el tipo aquí (debería estar en un archivo types.ts compartido)
type VisitorInfo = {
  name: string;
  email: string;
  dbUserId?: string;
  positions: [number, number][];
  lastUpdate: Date;
  active: boolean;
};

export default function SeguimientoAdmin() {
  const [visitors, setVisitors] = useState<Record<string, VisitorInfo>>({});
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <Box sx={{ 
      height: "calc(100vh - 64px)", 
      display: "flex", 
      gap: 2,
      p: 2,
      bgcolor: '#f5f5f5'
    }}>
      {/* Mapa - Ocupa 3 partes del espacio */}
      <Box sx={{ 
        flex: 3, 
        height: "100%",
        borderRadius: 1,
        overflow: "hidden",
        boxShadow: 1
      }}>
        <MapaAdmin 
          visitors={visitors}
          setVisitors={setVisitors}
          usuarioSeleccionado={selectedUserId}
          setUsuarioSeleccionado={setSelectedUserId}
        />
      </Box>

      {/* Panel de usuarios - Ocupa 1 parte del espacio */}
      <Box sx={{ 
        flex: 1, 
        height: "100%", 
        minWidth: 350,
        borderRadius: 1,
        overflow: "hidden",
        boxShadow: 1
      }}>
        <UserStatusPanel
          visitors={visitors}
          loading={loading}
          onRefresh={handleRefresh}
          onSelectVisitor={setSelectedUserId}
          selectedUserId={selectedUserId}
        />
      </Box>
    </Box>
  );
}