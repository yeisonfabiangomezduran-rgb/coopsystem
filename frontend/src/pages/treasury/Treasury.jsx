import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Landmark,
  RefreshCw,
  WalletCards,
} from "lucide-react";

import Button from "../../components/ui/Button";
import DataSection from "../../components/ui/DataSection";
import Loader from "../../components/ui/Loader";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Table from "../../components/ui/Table";

import api from "../../services/api";

function formatCurrency(value) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getResponseData(response) {
  return response?.data?.data;
}

export default function Treasury() {
  const [treasury, setTreasury] = useState(null);
  const [movements, setMovements] = useState([]);

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingDeposit, setSavingDeposit] = useState(false);
  const [savingWithdraw, setSavingWithdraw] = useState(false);
  const [loadingMovements, setLoadingMovements] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadTreasury() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/treasury");

      const data = getResponseData(response);

      setTreasury(data);
    } catch (err) {
      console.error("Error cargando Caja General:", err);

      setTreasury(null);

      setError(
        err?.response?.data?.message ||
          "No fue posible consultar la Caja General."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadMovements() {
    try {
      setLoadingMovements(true);

      const response = await api.get("/reports/treasury");

      const data = getResponseData(response);

      setMovements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando movimientos de tesorería:", err);
      setMovements([]);
    } finally {
      setLoadingMovements(false);
    }
  }

  useEffect(() => {
  const loadInitialData = async () => {
    try {
      setError("");

      const [treasuryResponse, movementsResponse] =
        await Promise.all([
          api.get("/treasury"),
          api.get("/reports/treasury"),
        ]);

      const treasuryData = getResponseData(treasuryResponse);
      const movementsData = getResponseData(movementsResponse);

      setTreasury(treasuryData);
      setMovements(
        Array.isArray(movementsData) ? movementsData : []
      );
    } catch (err) {
      console.error(
        "Error cargando información de tesorería:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "No fue posible cargar la información de tesorería."
      );
    } finally {
      setLoading(false);
      setLoadingMovements(false);
    }
  };

  void loadInitialData();
}, []);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  async function handleDeposit(event) {
    event.preventDefault();

    clearMessages();

    const amount = Number(depositAmount);

    if (!depositAmount || !Number.isFinite(amount) || amount <= 0) {
      setError("El monto debe ser mayor que cero.");
      return;
    }

    try {
      setSavingDeposit(true);

      const response = await api.post("/treasury/deposit", {
        amount,
      });

      const data = getResponseData(response);

      setTreasury(data);
      setDepositAmount("");

      setSuccess("Ingreso registrado correctamente.");

      await loadMovements();
    } catch (err) {
      console.error("Error registrando ingreso:", err);

      setError(
        err?.response?.data?.message ||
          "No fue posible registrar el ingreso."
      );
    } finally {
      setSavingDeposit(false);
    }
  }

  async function handleWithdraw(event) {
    event.preventDefault();

    clearMessages();

    const amount = Number(withdrawAmount);

    if (!withdrawAmount || !Number.isFinite(amount) || amount <= 0) {
      setError("El monto debe ser mayor que cero.");
      return;
    }

    const currentBalance = Number(treasury?.balance ?? 0);

    if (amount > currentBalance) {
      setError("El monto supera el saldo disponible en la Caja General.");
      return;
    }

    try {
      setSavingWithdraw(true);

      const response = await api.post("/treasury/withdraw", {
        amount,
      });

      const data = getResponseData(response);

      setTreasury(data);
      setWithdrawAmount("");

      setSuccess("Retiro registrado correctamente.");

      await loadMovements();
    } catch (err) {
      console.error("Error registrando retiro:", err);

      setError(
        err?.response?.data?.message ||
          "No fue posible registrar el retiro."
      );
    } finally {
      setSavingWithdraw(false);
    }
  }

  async function handleRefresh() {
    clearMessages();

    await Promise.all([loadTreasury(), loadMovements()]);

    setSuccess("Información actualizada correctamente.");
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader
          title="Tesorería"
          description="Administración de la Caja General"
        />

        <div className="py-10">
          <Loader />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Tesorería"
        description="Consulta y administración de la Caja General"
      />

      <div className="space-y-8">
        {/* Mensajes */}
        {(error || success) && (
          <div
            className={`border px-4 py-3 text-sm ${
              error
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-green-300 bg-green-50 text-green-700"
            }`}
          >
            {error || success}
          </div>
        )}

        {/* Información de Caja General */}
        <DataSection
          title="Caja General"
          description="Información actual registrada en el sistema"
        >
          {treasury ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="border border-gray-200 bg-white p-5">
                <div className="mb-3 flex items-center gap-3">
                  <Landmark size={22} />
                  <span className="text-sm font-medium text-gray-500">
                    Caja
                  </span>
                </div>

                <p className="text-lg font-semibold text-gray-900">
                  {treasury.name || "Caja General"}
                </p>
              </div>

              <div className="border border-gray-200 bg-white p-5">
                <div className="mb-3 flex items-center gap-3">
                  <WalletCards size={22} />
                  <span className="text-sm font-medium text-gray-500">
                    Saldo disponible
                  </span>
                </div>

                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(treasury.balance)}
                </p>
              </div>

              <div className="border border-gray-200 bg-white p-5">
                <div className="mb-3 flex items-center gap-3">
                  <Landmark size={22} />
                  <span className="text-sm font-medium text-gray-500">
                    Creada
                  </span>
                </div>

                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(treasury.createdAt)}
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              No fue posible obtener la información de la Caja General.
            </div>
          )}
        </DataSection>

        {/* Operaciones */}
        <DataSection
          title="Operaciones"
          description="Registra ingresos y retiros directamente sobre la Caja General"
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Ingreso */}
            <form
              onSubmit={handleDeposit}
              className="border border-gray-200 bg-white p-6"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-gray-200">
                  <ArrowUpRight size={20} />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Registrar ingreso
                  </h3>

                  <p className="text-sm text-gray-500">
                    Aumenta el saldo de la Caja General
                  </p>
                </div>
              </div>

              <label
                htmlFor="depositAmount"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Monto
              </label>

              <input
                id="depositAmount"
                type="number"
                min="0.01"
                step="0.01"
                value={depositAmount}
                onChange={(event) => setDepositAmount(event.target.value)}
                placeholder="Ingrese el monto"
                className="w-full border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
                disabled={savingDeposit}
              />

              <div className="mt-5">
                <Button
                  type="submit"
                  disabled={savingDeposit}
                  className="w-full"
                >
                  {savingDeposit ? "Registrando..." : "Registrar ingreso"}
                </Button>
              </div>
            </form>

            {/* Retiro */}
            <form
              onSubmit={handleWithdraw}
              className="border border-gray-200 bg-white p-6"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-gray-200">
                  <ArrowDownRight size={20} />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Registrar retiro
                  </h3>

                  <p className="text-sm text-gray-500">
                    Disminuye el saldo de la Caja General
                  </p>
                </div>
              </div>

              <label
                htmlFor="withdrawAmount"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Monto
              </label>

              <input
                id="withdrawAmount"
                type="number"
                min="0.01"
                step="0.01"
                value={withdrawAmount}
                onChange={(event) => setWithdrawAmount(event.target.value)}
                placeholder="Ingrese el monto"
                className="w-full border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
                disabled={savingWithdraw}
              />

              <div className="mt-5">
                <Button
                  type="submit"
                  disabled={savingWithdraw}
                  className="w-full"
                >
                  {savingWithdraw ? "Registrando..." : "Registrar retiro"}
                </Button>
              </div>
            </form>
          </div>
        </DataSection>

        {/* Movimientos reales */}
        <DataSection
          title="Movimientos de tesorería"
          description="Movimientos registrados por las operaciones reales del sistema"
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
            >
              <RefreshCw size={16} />
              Actualizar
            </Button>
          }
        >
          {loadingMovements ? (
            <div className="py-8">
              <Loader />
            </div>
          ) : movements.length === 0 ? (
            <div className="border border-gray-200 p-6 text-center text-sm text-gray-500">
              No hay movimientos registrados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table
                columns={[
                  ["Número", "number"],
                  ["Movimiento", "type"],
                  ["Fecha", "date"],
                  ["Valor", "amount"],
                  ["Usuario", "user"],
                  ["Saldo", "treasuryBalance"],
                ]}
                data={movements.map((item) => ({
                  ...item,
                  date: formatDate(item.date),
                  amount: formatCurrency(item.amount),
                  treasuryBalance: formatCurrency(
                    item.treasuryBalance
                  ),
                  user: item.user || "Sistema",
                }))}
              />
            </div>
          )}
        </DataSection>
      </div>
    </PageContainer>
  );
}