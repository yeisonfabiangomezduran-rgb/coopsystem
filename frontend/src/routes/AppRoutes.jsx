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

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
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
      </Routes>
    </BrowserRouter>
  );
}
