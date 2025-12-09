import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Avatar,
  Button,
  Paper,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

interface Usuario {
  IdUsuario: number;
  Nombre: string;
  Email: string;
  Documento: string;
//   Telefono: string;
//   Rol: string;
  }

export default function Perfil() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // Estados para editar
  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState({ Nombre: "", Email: "", Documento: "" });

  const [mensaje, setMensaje] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [tipoSnackbar, setTipoSnackbar] = useState<"success" | "error">("success");

  useEffect(() => {
    // Obtiene el usuario desde localStorage
    const userStorage = JSON.parse(localStorage.getItem("usuario") || "null");

    if (!userStorage) {
      console.error("⚠ No se encontró un usuario en localStorage");
      setCargando(false);
      return;
    }

    // Usa el ID del usuario real
    fetch(`http://localhost:8080/usuarios/${userStorage.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsuario(data.data);
        }
      })
      .catch((err) => console.error("Error al cargar usuario:", err))
      .finally(() => setCargando(false));
  }, []);

  const handleOpenEdit = () => {
    if (usuario) {
      setEditData({
        Nombre: usuario.Nombre,
        Email: usuario.Email,
        Documento: usuario.Documento,
      });
      setOpenEdit(true);
    }
  };

  const handleCloseEdit = () => setOpenEdit(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleGuardarCambios = async () => {
    if (!usuario) return;

    try {
      const res = await fetch(`http://localhost:8080/usuarios/${usuario.IdUsuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      const data = await res.json();

      if (data.success) {
        setUsuario({ ...usuario, ...editData });
        setMensaje("Perfil actualizado correctamente");
        setTipoSnackbar("success");
      } else {
        setMensaje("Error al actualizar el perfil");
        setTipoSnackbar("error");
      }
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      setMensaje("Error en la conexión con el servidor");
      setTipoSnackbar("error");
    } finally {
      setOpenSnackbar(true);
      setOpenEdit(false);
    }
  };

  if (cargando) {
    return (
      <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!usuario) {
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h6" color="error">
          No se encontró el usuario.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex", flexDirection: "column" }}>
      <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", p: 3 }}>
        <Paper elevation={4} sx={{ width: "100%", maxWidth: 500, p: 4, borderRadius: 3, textAlign: "center" }}>
          <Avatar
            alt={usuario.Nombre}
            src="/assets/user.png"
            sx={{ width: 120, height: 120, margin: "0 auto", mb: 2 }}
          />

          <Typography variant="h6" fontWeight="bold">{usuario.Nombre}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{usuario.Email}</Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body1"><strong>Documento:</strong> {usuario.Documento}</Typography>
          <Typography variant="body1" sx={{ mb: 3 }}><strong>ID Usuario:</strong> {usuario.IdUsuario}</Typography>

          <Divider sx={{ my: 2 }} />

          <Button variant="contained" startIcon={<EditIcon />} 
          sx={{
              backgroundColor: "#2e7d32",
              "&:hover": { backgroundColor: "#256428" },
            }}
             onClick={handleOpenEdit}>
            Editar perfil
          </Button>
        </Paper>
      </Box>

      {/* MODAL DE EDICIÓN */}
      <Dialog open={openEdit} onClose={handleCloseEdit}>
        <DialogTitle>Editar Perfil</DialogTitle>
        <DialogContent>
          <TextField margin="dense" name="Nombre" label="Nombre" fullWidth value={editData.Nombre} onChange={handleChange} />
          <TextField margin="dense" name="Email" label="Correo electrónico" fullWidth value={editData.Email} onChange={handleChange} />
          <TextField margin="dense" name="Documento" label="Documento" fullWidth value={editData.Documento} onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} color="error">Cancelar</Button>
          <Button onClick={handleGuardarCambios} variant="contained" color="success">Guardar cambios</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity={tipoSnackbar}>{mensaje}</Alert>
      </Snackbar>
    </Box>
  );
}
