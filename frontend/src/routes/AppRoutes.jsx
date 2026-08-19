import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import Associates from "../pages/associates/Associates";
import Savings from "../pages/savings/Savings";
import Loans from "../pages/loans/Loans";
import Transactions from "../pages/transactions/Transactions";
import Configuration from "../pages/configuration/Configuration";
import Reports from "../pages/reports/Reports";
import Treasury from "../pages/treasury/Treasury";
import Users from "../pages/users/Users";
import { AuthProvider } from "../context/AuthContext";
import Login from "../pages/auth/Login";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="asociados" element={<Associates />} />
              <Route path="ahorros" element={<Savings />} />
              <Route path="prestamos" element={<Loans />} />
              <Route path="transacciones" element={<Transactions />} />
              <Route path="reportes" element={<Reports />} />
              <Route path="usuarios" element={<Users />} />
              <Route path="configuracion" element={<Configuration />} />
              <Route path="tesoreria" element={<Treasury />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
