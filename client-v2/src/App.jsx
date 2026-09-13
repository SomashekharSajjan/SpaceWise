import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Duplicates from "./pages/Duplicates";
import GmailCleanup from "./pages/GmailCleanup";
import Login from "./pages/Login";
import DriveCleanup from "./pages/DriveCleanup";
import DriveDuplicates from "./pages/DriveDuplicates";
import DriveTrash from "./pages/DriveTrash";
import Settings from "./pages/Settings";
import Files from "./pages/Files";



// ==========================================
// Protected Route
// ==========================================
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ==========================================
// App
// ==========================================
function App() {
  return (
    <Routes>

      {/* ==========================================
          LOGIN
      ========================================== */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* ==========================================
          DASHBOARD
      ========================================== */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* ==========================================
          MY FILES
      ========================================== */}
      <Route
        path="/files"
        element={
          <ProtectedRoute>
            <Files />
          </ProtectedRoute>
        }
      />
  
      {/* ==========================================
          GMAIL CLEANUP
      ========================================== */}
      <Route
        path="/gmail-cleanup"
        element={
          <ProtectedRoute>
            <GmailCleanup />
          </ProtectedRoute>
        }
      />

      {/* ==========================================
          DRIVE CLEANUP
      ========================================== */}
      <Route
        path="/drive-cleanup"
        element={
          <ProtectedRoute>
            <DriveCleanup />
          </ProtectedRoute>
        }
      />

      {/* ==========================================
          SETTINGS
      ========================================== */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* ==========================================
          DRIVE TRASH
      ========================================== */}
      <Route
        path="/drive-trash"
        element={
          <ProtectedRoute>
            <DriveTrash />
          </ProtectedRoute>
        }
      />

      {/* ==========================================
          DRIVE DUPLICATES
      ========================================== */}
      <Route
        path="/drive-duplicates"
        element={
          <ProtectedRoute>
            <DriveDuplicates />
          </ProtectedRoute>
        }
      />

      {/* ==========================================
          DUPLICATE FILES
      ========================================== */}
      <Route
        path="/duplicates"
        element={
          <ProtectedRoute>
            <Duplicates />
          </ProtectedRoute>
        }
      />

      {/* ==========================================
          UNKNOWN URL
      ========================================== */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

export default App;