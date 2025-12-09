import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Email: "",
    Password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
Swal.fire({
  title: "Conectando...",
  html: "Estamos validando tus datos",
  allowOutsideClick: false,
  didOpen: () => {
    Swal.showLoading();
  }
});
    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Email: formData.Email,
          Password: formData.Password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const user = data.user;
       Swal.fire({
        icon: "success",
        title: `Bienvenido ${user.nombre}`,
        showConfirmButton: false,
        timer: 1800
      });

        localStorage.setItem("usuario", JSON.stringify(user));
        localStorage.setItem("token", data.token);

        // Redirección entre proyectos cabezona
        if (user.rol === 1) {
          navigate("/dashboard");
        } else {
          navigate("/visitante");
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Credenciales inválidas",
          confirmButtonColor: "#3085d6",
        });
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-background">
      <div className="earth-container">
        <div className="earth"></div>
        <div className="earth-glow"></div>
      </div>

      <div className="login-container">
        <h2 className="login-title">
          Bienvenido a <span className="highlight">GeoTech</span>
        </h2>
        <p className="login-subtitle">Inicia sesión para acceder al panel</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="email"
              name="Email"
              placeholder="Correo electrónico"
              value={formData.Email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              name="Password"
              placeholder="Contraseña"
              value={formData.Password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Conectando..." : "Entrar"}
          </button>
        </form>

        <div className="register-section">
          <p>¿No tienes cuenta?</p>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => navigate("/register")}
          >
            Registrarse
          </button>
        </div>

        <p className="footer-text">
          © 2025 GeoTech. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;
