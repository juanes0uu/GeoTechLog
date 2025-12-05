import React from "react";
import { Box, Button } from "@mui/material";

interface Props {
  onCargar: () => void;
  onCargarLugares: () => void;
  onSimular: () => void;
  onLimpiar: () => void;
  onEnviarRandom: () => void;
  onEnviarUbicacionReal: () => void;
  onIniciarRecorrido: () => void;
  puntos: [number, number][];
}

const FooterVisitante: React.FC<Props> = ({
  onCargar,
  onCargarLugares,
  onSimular,
  onLimpiar,
  onEnviarRandom,
  onEnviarUbicacionReal,
  onIniciarRecorrido,
  puntos,
}) => {
  return (
    <Box sx={{
      position: "absolute",
      bottom: 16,
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: 3,
      boxShadow: "0px 4px 20px rgba(0,0,0,0.25)",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 1,
      px: 2,
      py: 1.5,
      zIndex: 1000,
      width: "95%",
      maxWidth: 500,
    }}>
      <Button variant="contained" color="secondary" onClick={onCargar} size="small" sx={{ flex: "1 1 140px" }}>
        📂 Cargar ruta
      </Button>

      <Button variant="contained" color="success" disabled={puntos.length === 0} onClick={onSimular} size="small" sx={{ flex: "1 1 140px" }}>
        ▶️ Recorrer
      </Button>

      <Button variant="contained" color="primary" onClick={onCargarLugares} size="small" sx={{ flex: "1 1 140px" }}>
        📌 Lugares
      </Button>

      <Button variant="contained" color="info" onClick={onEnviarUbicacionReal} size="small" sx={{ flex: "1 1 140px" }}>
        📡 Mi ubicación
      </Button>

      <Button variant="contained" color="warning" onClick={onEnviarRandom} size="small" sx={{ flex: "1 1 140px" }}>
        🎲 Random
      </Button>

      <Button variant="contained" color="secondary" onClick={onIniciarRecorrido} size="small" sx={{ flex: "1 1 140px" }}>
        🏁 Iniciar Recorrido
      </Button>

      <Button variant="outlined" color="error" onClick={onLimpiar} size="small" sx={{ flex: "1 1 140px" }}>
        🧹 Limpiar
      </Button>
    </Box>
  );
};

export default FooterVisitante;
