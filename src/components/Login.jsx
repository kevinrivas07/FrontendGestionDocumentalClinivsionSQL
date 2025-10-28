import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/Login.css";
import clinicaImg from "../assets/clinica.png";
import deLaImg from "../assets/de la.png";
import visionImg from "../assets/vision.png";

const API_URL = "http://localhost:5000/api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const captchaRef = useRef(null);
  const slides = [clinicaImg, deLaImg, visionImg];

  // 🎨 Fondo
  useEffect(() => {
    document.body.classList.add("login-background");
    return () => document.body.classList.remove("login-background");
  }, []);

  // 🎞️ Carrusel automático
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(intervalId);
  }, [slides.length]);

  // 🔐 Si hay sesión activa, redirige según el rol
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token || !role) return;

      const parts = token.split(".");
      if (parts.length !== 3) {
        console.warn("⚠️ Token inválido, limpiando sesión");
        localStorage.clear();
        return;
      }

      const payload = JSON.parse(atob(parts[1]));
      console.log("🔍 Verificando sesión:", payload);

      if (!payload?.id) {
        localStorage.clear();
        return;
      }

      const normalizedRole = (payload.role || role).toLowerCase();
      const target =
        normalizedRole === "admin" ? "/admin/dashboard" : "/home";

      // Evita navegar en bucle
      if (location.pathname !== target) {
        console.log("➡️ Redirigiendo a:", target);
        navigate(target, { replace: true });
      }
    } catch (err) {
      console.error("⚠️ Error verificando token:", err);
      localStorage.clear();
    }
  }, [location.pathname, navigate]);

  // 🚀 Iniciar sesión
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, captcha: captchaToken }),
      });

      const data = await res.json();

      if (res.ok && data?.token) {
        // decodifica token y valida
        const parts = data.token.split(".");
        if (parts.length !== 3) throw new Error("Token inválido (formato)");

        const payload = JSON.parse(atob(parts[1]));
        console.log("✅ Token decodificado:", payload);

        if (!payload.id) throw new Error("Token inválido (sin ID)");

        // guardar sesión
        localStorage.setItem("token", data.token);
        const normalizedRole = (payload.role || data.role || "user").toLowerCase();
        localStorage.setItem("role", normalizedRole);
        localStorage.setItem("nombre", data.user?.username || username);

        const target =
          normalizedRole === "admin" ? "/admin/dashboard" : "/home";
        console.log("➡️ Redirigiendo tras login a:", target);

        navigate(target, { replace: true });
      } else {
        setError(data.msg || data.error || "Credenciales incorrectas.");
      }
    } catch (err) {
      console.error("❌ Error en login:", err);
      setError(
        err.message?.includes("Token inválido")
          ? "Token inválido."
          : "Error de conexión con el servidor."
      );
    } finally {
      try {
        captchaRef.current?.reset();
      } catch {}
      setCaptchaToken(null);
    }
  };

  return (
    <div className="main-container">
      {/* 🖼️ Carrusel de imágenes */}
      <div className="image-container">
        <div className="carousel">
          {slides.map((src, index) => (
            <div
              key={index}
              className={`carousel-slide ${index === currentSlide ? "active" : ""}`}
            >
              <img src={src} alt={`slide-${index + 1}`} className="carousel-image" />
            </div>
          ))}
          <div className="carousel-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                aria-label={`Ir al slide ${index + 1}`}
                className={`indicator-dot ${index === currentSlide ? "active" : ""}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 🔐 Formulario de login */}
      <div className="login-container">
        <div className="login-box">
          <img
            src={new URL("../assets/clinicavision.jpg", import.meta.url).href}
            alt="Clínica de la Visión"
            className="hero-img"
          />
          <h2>INICIO DE SESIÓN</h2>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="usuario">Usuario:</label>
              <input
                type="text"
                id="usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingrese su usuario"
                required
              />
            </div>

            <div className="input-group password-group">
              <label htmlFor="password">Contraseña:</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <button type="submit">Iniciar Sesión</button>
          </form>

          {error && <p className="error-message">{error}</p>}

          <p>
            ¿Olvidaste tu contraseña? <a href="/forgot-password">Recupérala</a>
          </p>
          <p>
            ¿No tienes cuenta? <a href="/register">Regístrate</a>
          </p>
        </div>
      </div>

      <a href="#" className="created">
        Created by: Kevin Rivas
      </a>
    </div>
  );
}

export default Login;
