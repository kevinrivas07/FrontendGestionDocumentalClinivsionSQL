import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";
import "../styles/AsistenciaForm.css";

export default function AsistenciaForm() {
  const navigate = useNavigate();
  const sigPadRef = useRef(null);

  // 🔒 Verificar si hay token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión para registrar asistencias");
      navigate("/login");
    }
  }, [navigate]);

  const [form, setForm] = useState({
    fecha: "",
    tema: "",
    responsable: "",
    cargo: "",
    modalidad: "",
    sede: "",
    horaInicio: "",
    horaFin: "",
    asistentes: [{ nombre: "", cargo: "", firma: "" }],
  });

  const [sigOpenIndex, setSigOpenIndex] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAsistenteChange = (i, e) => {
    const newAs = [...form.asistentes];
    newAs[i][e.target.name] = e.target.value;
    setForm({ ...form, asistentes: newAs });
  };

  const addAsistente = () => {
    if (form.asistentes.length < 25) {
      setForm({
        ...form,
        asistentes: [...form.asistentes, { nombre: "", cargo: "", firma: "" }],
      });
    }
  };

  const removeAsistente = (i) => {
    const newAs = form.asistentes.filter((_, idx) => idx !== i);
    setForm({ ...form, asistentes: newAs });
  };

  const openFirma = (i) => {
    setSigOpenIndex(i);
  };

  const clearFirma = () => {
    if (sigPadRef.current) sigPadRef.current.clear();
  };

  const saveFirma = () => {
    if (!sigPadRef.current) return;
    const dataURL = sigPadRef.current.toDataURL("image/png");
    const newAs = [...form.asistentes];
    newAs[sigOpenIndex].firma = dataURL;
    setForm({ ...form, asistentes: newAs });
    setSigOpenIndex(null);
  };

  // ✅ Envío del formulario con token JWT
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Sesión expirada. Vuelve a iniciar sesión.");
        navigate("/login");
        return;
      }

      const res = await axios.post("http://localhost:5000/api/asistencia", form, {
        responseType: "blob",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // 📄 Descargar PDF
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Lista_Asistencia.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();

      alert("✅ Asistencia registrada correctamente.");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("❌ Error al generar PDF:", err);
      if (err.response?.status === 401) {
        alert("No autorizado. Por favor, inicia sesión nuevamente.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert("Error al generar PDF. Revisa consola.");
      }
    }
  };

  return (
    <div className="asistencia-wrap">
      <img
        src={new URL("../assets/clinicavision.jpg", import.meta.url).href}
        alt="Clínica de la Visión"
        className="home-img"
      />
      <h2>📋 Lista de Asistencia</h2>

      <form onSubmit={handleSubmit} className="asistencia-form">
        <div className="fila-datos">
          <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
          <input type="text" name="tema" placeholder="Tema" value={form.tema} onChange={handleChange} required />
          <input type="text" name="responsable" placeholder="Responsable" value={form.responsable} onChange={handleChange} required />
          <input type="text" name="cargo" placeholder="Cargo" value={form.cargo} onChange={handleChange} />
          <input type="text" name="modalidad" placeholder="Modalidad" value={form.modalidad} onChange={handleChange} />
          <input type="text" name="sede" placeholder="Sede" value={form.sede} onChange={handleChange} />
          <div className="horas">
            <span className="hour">Hora inicio</span>
            <input type="time" name="horaInicio" value={form.horaInicio} onChange={handleChange} />
            <span className="hour">Hora Fin</span>
            <input type="time" name="horaFin" value={form.horaFin} onChange={handleChange} />
          </div>
        </div>

        <h3>👥 Asistentes</h3>
        <div className="asistentes-list">
          {form.asistentes.map((a, i) => (
            <div className="asistente-row" key={i}>
              <div className="cols">
                <span className="num">{i + 1}</span>
                <input name="nombre" placeholder="Nombre completo" value={a.nombre} onChange={(e) => handleAsistenteChange(i, e)} />
                <input name="cargo" placeholder="Cargo" value={a.cargo} onChange={(e) => handleAsistenteChange(i, e)} />
              </div>

              <div className="firma-controls">
                {a.firma ? (
                  <img src={a.firma} alt={`firma-${i}`} className="firma-preview" />
                ) : (
                  <div className="firma-placeholder">sin firma</div>
                )}

                <div className="f-buttons">
                  <button type="button" onClick={() => openFirma(i)}>Firmar</button>
                  <button type="button" onClick={() => {
                    const newAs = [...form.asistentes];
                    newAs[i].firma = "";
                    setForm({ ...form, asistentes: newAs });
                  }}>Borrar firma</button>
                  <button type="button" onClick={() => removeAsistente(i)}>Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="controls">
          <button type="button" onClick={addAsistente}>➕ Agregar asistente</button>
          <button type="submit">Generar PDF</button>
          <button type="button" className="back-btn" onClick={() => navigate("/")}>Volver</button>
        </div>
      </form>

      {sigOpenIndex !== null && (
        <div className="firma-modal">
          <div className="firma-box">
            <h4>Firma: asistente {sigOpenIndex + 1}</h4>
            <SignatureCanvas
              ref={sigPadRef}
              penColor="black"
              canvasProps={{ width: 400, height: 120, className: "sigCanvas" }}
            />
            <div className="modal-controls">
              <button onClick={clearFirma} type="button">Borrar</button>
              <button onClick={saveFirma} type="button">Guardar firma</button>
              <button onClick={() => setSigOpenIndex(null)} type="button">Cerrar</button>
            </div>
          </div>
        </div>
      )}
      <a href="" target="" className="created-asist">Created by: Kevin Rivas</a>
    </div>
  );
}