import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminUpload.css";

export default function AdminUpload() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setMessage("");
    } else {
      setMessage("Por favor selecciona un archivo PDF válido");
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("pdf", selectedFile);

    try {
      const response = await fetch("http://localhost:5000/api/upload-pdf", {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        setMessage("✅ PDF subido exitosamente");
        setSelectedFile(null);
        document.getElementById("pdf-input").value = "";
      } else {
        setMessage("❌ Error al subir el PDF");
      }
    } catch (error) {
      setMessage("❌ Error de conexión");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-wrap">
      <h2>📁 Administrador - Subir PDF</h2>
      
      <div className="upload-section">
        <div className="upload-area">
          <input
            type="file"
            id="pdf-input"
            accept=".pdf"
            onChange={handleFileChange}
            className="file-input"
          />
          <label htmlFor="pdf-input" className="file-label">
            {selectedFile ? (
              <div className="file-selected">
                <span className="file-icon">📄</span>
                <span className="file-name">{selectedFile.name}</span>
                <span className="file-size">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ) : (
              <div className="file-placeholder">
                <span className="upload-icon">📤</span>
                <p>Haz clic para seleccionar un PDF</p>
                <small>Formatos permitidos: PDF</small>
              </div>
            )}
          </label>
        </div>

        {selectedFile && (
          <div className="upload-controls">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="upload-btn"
            >
              {uploading ? "Subiendo..." : "Subir PDF"}
            </button>
            <button
              onClick={() => {
                setSelectedFile(null);
                document.getElementById("pdf-input").value = "";
                setMessage("");
              }}
              className="cancel-btn"
            >
              Cancelar
            </button>
          </div>
        )}

        {message && (
          <div className={`message ${message.includes("✅") ? "success" : "error"}`}>
            {message}
          </div>
        )}
      </div>

      <button className="back" type="button" onClick={() => navigate("/")}>
        Volver
      </button>
      <a href="" target="" className="created">Created by: Kevin Rivas</a>
    </div>
  );
}
