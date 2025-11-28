import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // reutilizamos los estilos del login

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    Nombre: "",
    Email: "",
    Documento: "",
    Password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

     try {
      
 const response = await fetch("http://localhost:8080/usuarios", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    Nombre: formData.Nombre,
    Email: formData.Email,
    Documento: formData.Documento,
    Password: formData.Password,
  }),
});

      const data = await response.json();

      if (response.ok) {
        alert("Registro exitoso. Ahora puedes iniciar sesión.");
        navigate("/");
      } else {
        alert(`Error: ${data.error || "No se pudo registrar"}`);
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
          Crear cuenta en <span className="highlight">GeoTech</span>
        </h2>
        <p className="login-subtitle">Regístrate para acceder al sistema</p>

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <input
              type="text"
              name="Nombre"
              placeholder="Nombre completo"
              value={formData.Nombre}
              onChange={handleChange}
              required
            />
          </div>
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
              type="text"
              name="Documento"
              placeholder="Documento de identidad"
              value={formData.Documento}
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
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div className="register-section">
          <p>¿Ya tienes cuenta?</p>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => navigate("/")}
          >
            Iniciar sesión
          </button>
        </div>

        <p className="footer-text">© 2025 GeoTech. Todos los derechos reservados.</p>
      </div>
    </div>
  );
};

export default Register;
