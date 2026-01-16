import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";

import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Medicines from "./pages/Medicines";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";
import Users from "./pages/Users";
import Billing from "./pages/Billing"; // ✅ ADD

import { Toaster } from "@/components/ui/toaster";

export default function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <>
      <Routes>
        {/* ROOT */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* PUBLIC */}
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* PROTECTED */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />

            <Route
              element={
                <ProtectedRoute roles={["ADMIN", "PHARMACIST","STAFF"]} />
              }
            >
              <Route path="medicines" element={<Medicines />} />
            </Route>

            <Route element={<ProtectedRoute roles={["STAFF"]} />}>
              <Route path="billing" element={<Billing />} />
            </Route>

            <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
              <Route path="reports" element={<Reports />} />
            </Route>

            <Route
              element={<ProtectedRoute roles={["ADMIN", "PHARMACIST"]} />}
            >
              <Route path="audit" element={<Audit />} />
            </Route>

            <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
              <Route path="users" element={<Users />} />
            </Route>
          </Route>
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* TOASTER */}
      <Toaster />
    </>
  );
}
