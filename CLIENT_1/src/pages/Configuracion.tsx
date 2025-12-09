// src/pages/Configuracion.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Configuracion() {
  const navigate = useNavigate();
  const usuarioId = 1; // Temporal
  const [notificaciones, setNotificaciones] = useState(true);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [password, setPassword] = useState("");

  // Cargar configuración actual del usuario
  useEffect(() => {
    fetch(`http://localhost:8080/usuarios/${usuarioId}`)
      .then((res) => res.json())
      .then((data) => {
        setNotificaciones(data.notificaciones ?? true);
        setModoOscuro(data.modoOscuro ?? false);
      })
      .catch((err) => console.error("Error al cargar usuario:", err));
  }, []);

  //  Guardar configuración
  const handleGuardar = async () => {
    const data = {
      notificaciones,
      modoOscuro,
      password: password || undefined,
    };

    const res = await fetch(`http://localhost:8080/usuarios/${usuarioId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      alert("✅ Configuración actualizada correctamente");
      setPassword("");
    } else {
      alert("❌ Error al actualizar la configuración");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Box sx={{ maxWidth: 900, mx: "auto", mt: 5, p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="#2e7d32">
          ⚙️ Configuración de Usuario
        </Typography>

        {/* Sección Preferencias */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Preferencias
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={notificaciones}
                  onChange={(e) => setNotificaciones(e.target.checked)}
                  color="success"
                />
              }
              label="Activar notificaciones"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={modoOscuro}
                  onChange={(e) => setModoOscuro(e.target.checked)}
                  color="success"
                />
              }
              label="Modo oscuro"
            />
          </CardContent>
        </Card>

        {/* Sección de seguridad */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Seguridad de la cuenta
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <TextField
              type="password"
              label="Nueva contraseña"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={handleGuardar}
              sx={{
                bgcolor: "#2e7d32",
                "&:hover": { bgcolor: "#256028" },
              }}
            >
              Guardar cambios
            </Button>
          </CardContent>
        </Card>

        {/* Sección Acerca de */}
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Acerca de GeoTech
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ color: "gray" }}>
              GeoTech es un proyecto enfocado en la visualización interactiva de rutas,
              empresas y recursos locales dentro de la Ciudadela Industrial de Duitama.
            </Typography>

            <Button
              variant="outlined"
              sx={{
                mt: 2,
                borderColor: "#2e7d32",
                color: "#2e7d32",
                "&:hover": { bgcolor: "#e8f5e9" },
              }}
              onClick={() => navigate("/")}
            >
              ← Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
