import { Routes, Route, Navigate } from "react-router-dom";
import { AuthBootstrap } from "./components/AuthBootstrap";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";

export default function App() {
  return (
    <AppShell>
      <AuthBootstrap>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student", "faculty"]}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthBootstrap>
    </AppShell>
  );
}
