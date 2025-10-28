// src/components/DotacionesForm.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";
import "../styles/DotacionesForm.css";

export default function DotacionesForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fecha: "",
    nombre: "",
    cedula: "",
    cargo: "",
    elementos: [{ nombre: "", cantidad: "" }],
    firma: "",
  });

  const sigPadRef = useRef(null);
  const [firmaAbierta, setFirmaAbierta] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleElementoChange = (i, e) => {
    const nuevos = [...form.elementos];
    nuevos[i][e.target.name] = e.target.value;
    setForm({ ...form, elementos: nuevos });
  };

  const agregarElemento = () => {
    setForm({ ...form, elementos: [...form.elementos, { nombre: "", cantidad: "" }] });
  };

  const eliminarElemento = (i) => {
    const nuevos = form.elementos.filter((_, idx) => idx !== i);
    setForm({ ...form, elementos: nuevos });
  };

  const guardarFirma = () => {
    const dataURL = sigPadRef.current.toDataURL("image/png");
    setForm({ ...form, firma: dataURL });
    setFirmaAbierta(false);
  };

  const borrarFirma = () => sigPadRef.current.clear();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/dotaciones", form, {
        responseType: "blob",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Entrega_Dotacion.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("❌ Error al generar PDF:", err);
      alert("Error al generar PDF");
    }
  };

  return (
    <div className="dotaciones-form-wrap">
      <div className="dotaciones-form-container">
        <h2>📦 Entrega de Dotación</h2>
        <form onSubmit={handleSubmit} className="dotaciones-form">
          <div className="form-row">
            <input 
              type="date" 
              name="fecha" 
              value={form.fecha} 
              onChange={handleChange} 
              className="form-input"
              required 
            />
            <input 
              type="text" 
              name="nombre" 
              placeholder="Nombre del colaborador" 
              value={form.nombre} 
              onChange={handleChange} 
              className="form-input"
              required 
            />
          </div>
          
          <div className="form-row">
            <input 
              type="text" 
              name="cedula" 
              placeholder="Cédula" 
              value={form.cedula} 
              onChange={handleChange} 
              className="form-input"
              required 
            />
            <input 
              type="text" 
              name="cargo" 
              placeholder="Cargo" 
              value={form.cargo} 
              onChange={handleChange} 
              className="form-input"
            />
          </div>

          <div className="elementos-section">
            <h3>Elementos Entregados</h3>
            {form.elementos.map((el, i) => (
              <div key={i} className="elemento-item">
                <input
                  name="cantidad"
                  type="number"
                  placeholder="Cantidad"
                  value={el.cantidad}
                  onChange={(e) => handleElementoChange(i, e)}
                  className="form-input"
                />
                <input
                  name="nombre"
                  type="text"
                  placeholder="Elemento"
                  value={el.nombre}
                  onChange={(e) => handleElementoChange(i, e)}
                  className="form-input"
                />
                <button 
                  type="button" 
                  onClick={() => eliminarElemento(i)}
                  className="remove-elemento-btn"
                >
                  ❌ Eliminar
                </button>
              </div>
            ))}
            <button 
              type="button" 
              onClick={agregarElemento}
              className="add-elemento-btn"
            >
              ➕ Agregar elemento
            </button>
          </div>

          <div className="firma-section">
            <h3>✍️ Firma del colaborador</h3>
            {form.firma ? (
              <div className="firma-preview">
                <img src={form.firma} alt="firma" />
              </div>
            ) : (
              <button 
                type="button" 
                onClick={() => setFirmaAbierta(true)}
                className="firma-btn"
              >
                Agregar Firma
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="submit" className="submit-btn">📄 Generar PDF</button>
            <button type="button" onClick={() => navigate("/")} className="back-btn">← Volver</button>
          </div>
        </form>

        {firmaAbierta && (
          <div className="firma-canvas-container">
            <h3>Firma Digital</h3>
            <SignatureCanvas 
              ref={sigPadRef} 
              penColor="black" 
              canvasProps={{ width: 400, height: 120 }} 
            />
            <div className="firma-controls">
              <button onClick={borrarFirma} className="firma-btn secondary">🗑️ Borrar</button>
              <button onClick={guardarFirma} className="firma-btn">💾 Guardar Firma</button>
              <button onClick={() => setFirmaAbierta(false)} className="firma-btn secondary">❌ Cerrar</button>
            </div>
          </div>
        )}
      </div>
      <a href="" target="" className="created">Created by: Kevin Rivas</a>
    </div>
  );
}
