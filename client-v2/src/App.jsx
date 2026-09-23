import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";

// Lazy-load protected pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Duplicates = lazy(() => import("./pages/Duplicates"));
const GmailCleanup = lazy(() => import("./pages/GmailCleanup"));
const DriveCleanup = lazy(() => import("./pages/DriveCleanup"));
const DriveDuplicates = lazy(() => import("./pages/DriveDuplicates"));
const DriveTrash = lazy(() => import("./pages/DriveTrash"));
const Settings = lazy(() => import("./pages/Settings"));
const Files = lazy(() => import("./pages/Files"));

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
// Loading Screen
// ==========================================
function PageLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0b0d",
        color: "#ffffff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      Loading SpaceWise...
    </div>
  );
}

// ==========================================
// App
// ==========================================
function App() {
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}

export default App;