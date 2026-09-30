import api from "./api";

function getResponseData(response) {
  return response.data.data;
}

/**
 * Obtiene los indicadores generales del sistema.
 */
export async function getDashboardReport() {
  return getResponseData(
    await api.get("/reports/dashboard")
  );
}

/**
 * Obtiene el reporte real de asociados.
 */
export async function getAssociatesReport() {
  return getResponseData(
    await api.get("/reports/associates")
  );
}

/**
 * Obtiene el reporte real de cuentas de ahorro.
 */
export async function getSavingsReport() {
  return getResponseData(
    await api.get("/reports/savings")
  );
}

/**
 * Obtiene el reporte real de préstamos.
 */
export async function getLoansReport() {
  return getResponseData(
    await api.get("/reports/loans")
  );
}

/**
 * Obtiene el reporte real de transacciones.
 */
export async function getTransactionsReport() {
  return getResponseData(
    await api.get("/reports/transactions")
  );
}