import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // 👈 importamos los íconos


function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 estado para mostrar/ocultar
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- Indicador de seguridad ---
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    return strength;
  };
  const strength = getPasswordStrength(newPassword);

  const validatePassword = (password) => {
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    if (!/[A-Z]/.test(password)) return "Debe contener al menos una letra mayúscula";
    if (!/[a-z]/.test(password)) return "Debe contener al menos una letra minúscula";
    if (!/[0-9]/.test(password)) return "Debe contener al menos un número";
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) return "Debe contener al menos un carácter especial";
    return null;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.msg);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.msg || "Error al restablecer la contraseña");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Error en la conexión con el servidor");
    }
  };

  return (
    <div className="reset-container">
      <h2>Restablecer contraseña</h2>
      <form onSubmit={handleSubmit}>

        {/* Campo de nueva contraseña */}
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <span
            className="toggle-eye"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* Indicador de seguridad */}
        <div className="password-strength">
          <div className={`strength-bar ${strength >= 1 ? "active" : ""}`} />
          <div className={`strength-bar ${strength >= 2 ? "active" : ""}`} />
          <div className={`strength-bar ${strength >= 3 ? "active" : ""}`} />
          <div className={`strength-bar ${strength >= 4 ? "active" : ""}`} />
          <div className={`strength-bar ${strength >= 5 ? "active" : ""}`} />
        </div>
        <p className="strength-text">
          {strength === 0 && "Muy débil"}
          {strength === 1 && "Muy débil"}
          {strength === 2 && "Débil"}
          {strength === 3 && "Aceptable"}
          {strength === 4 && "Fuerte"}
          {strength === 5 && "Muy fuerte"}
        </p>


        {/* Campo de confirmar contraseña */}
        <div className="input-group">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirmar nueva contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <span
            className="toggle-eye"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button type="submit">Restablecer</button>
      </form>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default ResetPassword;
