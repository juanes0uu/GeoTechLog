  // src/components/Navbar.tsx
  import React from "react";
  import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Avatar,
    Menu,
    MenuItem,
  } from "@mui/material";
  import MenuIcon from "@mui/icons-material/Menu";
  import AccountCircleIcon from "@mui/icons-material/AccountCircle";
  import { useNavigate } from "react-router-dom";

  interface NavbarProps {
    onMenuClick: () => void;
  }

  export default function Navbar({ onMenuClick }: NavbarProps) {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
      setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    return (
      <AppBar position="static" sx={{ backgroundColor: "#2e7d32" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton color="inherit" onClick={onMenuClick}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">GeoTech</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Typography
              sx={{ cursor: "pointer" }}
              onClick={() => {
                if (usuario?.rol === 1) {
                  navigate("/dashboard");     // Admin
                } else {
                  navigate("/visitante");     // Visitante
                }
              }}
            >
              Explorar
            </Typography>

            <Typography sx={{ cursor: "pointer" }} onClick={() => navigate("/info")}>
              Info
            </Typography>
            <Typography sx={{ cursor: "pointer" }} onClick={() => navigate("/contacto")}>
              Contacto
            </Typography>
                  {usuario?.rol === 1 && (
              <Typography
                sx={{ cursor: "pointer" }}
                onClick={() => navigate("/seguimiento")}
              >
                Seguimiento
              </Typography>
            )}



            <IconButton onClick={handleMenuOpen}>
              <Avatar alt="Perfil" src="/avatar.png">
                <AccountCircleIcon />
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={() => navigate("/perfil")}>Perfil</MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate("/configuracion");
                }}
              >
                Configuración
              </MenuItem>
              <MenuItem onClick={() => navigate("/")}>Cerrar sesión</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }
