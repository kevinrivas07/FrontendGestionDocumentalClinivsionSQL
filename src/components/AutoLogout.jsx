import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AutoLogout = ({ onLogout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    let timer;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      // ⏱️ 2 minutos de inactividad
      timer = setTimeout(() => {
        onLogout();
        navigate("/login");
      }, 120000);
    };

    // eventos que "reinician" el contador
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keypress", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer(); // arrancar el contador al cargar

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keypress", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [navigate, onLogout]);

  return null;
};

export default AutoLogout;
