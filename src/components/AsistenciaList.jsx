import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/AsistenciaList.css";

export default function AsistenciaList() {
  const navigate = useNavigate();
  const [asistencias, setAsistencias] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token"); // ✅ Obtener token para ver asistencias si es admin o usuario
        const res = await axios.get("http://localhost:5000/api/asistencia", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAsistencias(res.data);
      } catch (err) {
        console.error("❌ Error cargando asistencias:", err);
      }
    };
    fetchData();
  }, []);

  const descargarPDF = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/asistencia/${id}/pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Asistencia_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("❌ Error al descargar PDF:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    const fecha = new Date(dateString);
    return fecha.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="alist-wrap">
      <img
        src={new URL("../assets/clinicavision.jpg", import.meta.url).href}
        alt="Clínica de la Visión"
        className="home-hero-img"
      />
      <h2>📂 Asistencias Guardadas</h2>

      {asistencias.length === 0 ? (
        <p className="alist-empty">No hay registros guardados</p>
      ) : (
        <ul className="alist-list">
          {asistencias.map((a) => (
            <li key={a._id} className="alist-item">
              <div className="alist-info">
                <strong className="alist-topic">{a.tema || "Sin tema"}</strong>
                <span className="alist-date">{formatDate(a.fecha)}</span>
                {a.creadoPor && (
                  <small className="alist-user">
                    👤 {a.creadoPor.username || "Desconocido"}
                  </small>
                )}
              </div>
              <button
                className="download-btn"
                onClick={() => descargarPDF(a._id)}
              >
                ⬇️ Descargar PDF
              </button>
            </li>
          ))}
        </ul>
      )}

      <button className="back" type="button" onClick={() => navigate("/")}>
        Volver
      </button>
      <a href="#" className="created">
        Created by: Kevin Rivas
      </a>
    </div>
  );
}
