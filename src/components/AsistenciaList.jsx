import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/AsistenciaList.css";

export default function AsistenciaList() {
  const navigate = useNavigate();
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/asistencia", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAsistencias(res.data);
      } catch (err) {
        console.error("❌ Error cargando asistencias:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const descargarPDF = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/asistencia/${id}/pdf`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
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
      alert("Error al descargar el PDF");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    const fecha = new Date(dateString);
    return fecha.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="alist-wrap">
      <div className="alist-container">
        {/* Imagen exactamente como la tenías */}
        <img
          src={new URL("../assets/clinicavision.jpg", import.meta.url).href}
          alt="Clínica de la Visión"
          className="home-hero-img"
        />
        
        {/* Header */}
        <div className="alist-header">
          <h2>📂 Asistencias Guardadas</h2>
          <button className="back-btn" type="button" onClick={() => navigate("/")}>
            ← Volver
          </button>
        </div>

        {/* Contador */}
        <div className="alist-counter">
          <span>{asistencias.length} registro{asistencias.length !== 1 ? 's' : ''} encontrado{asistencias.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Contenido principal */}
        <div className="alist-content">
          {loading ? (
            <div className="alist-loading">
              <div className="loading-spinner"></div>
              <p>Cargando asistencias...</p>
            </div>
          ) : asistencias.length === 0 ? (
            <div className="alist-empty">
              <div className="empty-icon">📋</div>
              <p>No hay registros de asistencia guardados</p>
              <button className="create-btn" onClick={() => navigate("/asistencia")}>
                ➕ Crear primera asistencia
              </button>
            </div>
          ) : (
            <div className="alist-table-container">
              <table className="alist-table">
                <thead>
                  <tr>
                    <th>Tema</th>
                    <th>Fecha</th>
                    <th>Responsable</th>
                    <th>Usuario</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {asistencias.map((a) => (
                    <tr key={a._id} className="alist-row">
                      <td data-label="Tema">
                        <strong className="alist-topic">{a.tema || "Sin tema"}</strong>
                      </td>
                      <td data-label="Fecha">
                        <span className="alist-date">{formatDate(a.fecha)}</span>
                      </td>
                      <td data-label="Responsable">
                        <span className="alist-responsable">{a.responsable || "No especificado"}</span>
                      </td>
                      <td data-label="Usuario">
                        <span className="alist-user">
                          👤 {a.usuarioCreador?.username || "Desconocido"}
                        </span>
                      </td>
                      <td data-label="Acciones">
                        <button
                          className="download-btn"
                          onClick={() => descargarPDF(a._id)}
                          title="Descargar PDF"
                        >
                          ⬇️ PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="alist-footer">
          <a href="#" className="created">
            Created by: Kevin Rivas
          </a>
        </div>
      </div>
    </div>
  );
}