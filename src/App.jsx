import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import RegisterAdmin from "./components/RegisterAdmin";
import Home from "./components/Home";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import AutoLogout from "./components/AutoLogout";
import AsistenciaForm from "./components/AsistenciaForm";
import AsistenciaList from "./components/AsistenciaList";
import AdminUpload from "./components/AdminUpload";
import AdminDashboard from "./components/AdminDashboard";
import DotacionesForm from "./components/DotacionesForm";
import DotacionesList from "./components/DotacionesList";

import "./App.css";

// 🔑 Helpers
const getTokenPayload = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const isLoggedIn = () => {
  const payload = getTokenPayload();
  return !!payload?.id; // ✅ corregido (antes era userId)
};

const isAdmin = () => {
  const payload = getTokenPayload();
  return payload?.role === "admin";
};

// 🔒 Rutas protegidas
const ProtectedRoute = ({ children, adminOnly = false }) => {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin()) return <Navigate to="/home" replace />;
  return children;
};

function App() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 🏠 Raíz */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 🔐 Autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-admin" element={<RegisterAdmin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/dotaciones" element={<DotacionesForm />} />
          <Route path="/dotaciones-list" element={<DotacionesList />} />

          {/* 👨‍💼 Panel de administrador */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminUpload />
              </ProtectedRoute>
            }
          />

          {/* 📋 Asistencia */}
          <Route
            path="/asistencia"
            element={
              <ProtectedRoute>
                <AsistenciaForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/asistencias"
            element={
              <ProtectedRoute>
                <AsistenciaList />
              </ProtectedRoute>
            }
          />

          {/* 🏡 Vista usuario */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
