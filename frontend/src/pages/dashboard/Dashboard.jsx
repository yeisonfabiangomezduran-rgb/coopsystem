import { useEffect, useState } from "react";
import {
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button";
import DataSection from "../../components/ui/DataSection";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import Table from "../../components/ui/Table";

import {
  getDashboardReport,
  getTransactionsReport,
} from "../../services/reportService";

function formatMovementDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  })
    .format(date)
    .replace(/\./g, "");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  })
    .format(Number(value || 0))
    .replace("COP", "$ ");
}

export default function Dashboard() {
  const [activeModal, setActiveModal] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(false);
  const [transactionsError, setTransactionsError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    let isCurrent = true;

    async function loadDashboard() {
      try {
        setIsDashboardLoading(true);
        setDashboardError(false);

        const report = await getDashboardReport();

        if (isCurrent) {
          setDashboard(report);
        }
      } catch (error) {
        console.error("Error cargando dashboard:", error);

        if (isCurrent) {
          setDashboardError(true);
        }
      } finally {
        if (isCurrent) {
          setIsDashboardLoading(false);
        }
      }
    }

    async function loadTransactions() {
      try {
        setIsTransactionsLoading(true);
        setTransactionsError(false);

        const data = await getTransactionsReport();

        if (isCurrent) {
          const orderedTransactions = [...(data ?? [])].sort(
            (first, second) =>
              new Date(second.date).getTime() -
              new Date(first.date).getTime()
          );

          setTransactions(orderedTransactions);
        }
      } catch (error) {
        console.error("Error cargando transacciones del dashboard:", error);

        if (isCurrent) {
          setTransactionsError(true);
          setTransactions([]);
        }
      } finally {
        if (isCurrent) {
          setIsTransactionsLoading(false);
        }
      }
    }

    void loadDashboard();
    void loadTransactions();

    return () => {
      isCurrent = false;
    };
  }, [reloadKey]);

  const recentTransactions = transactions.slice(0, 5);

  function retryDashboard() {
    setIsDashboardLoading(true);
    setIsTransactionsLoading(true);
    setDashboardError(false);
    setTransactionsError(false);
    setReloadKey((current) => current + 1);
  }

  function goTo(route) {
    setActiveModal(null);
    navigate(route);
  }

  return (
    <>
      <PageContainer>
        <PageHeader
          aside={
            <p className="rounded-lg border border-[#dce5ed] bg-white px-3 py-2 text-sm font-medium text-[#536273]">
              Información en tiempo real
            </p>
          }
          eyebrow="Resumen institucional"
          subtitle="Información consolidada de los principales indicadores operativos y financieros."
          title="Resumen institucional"
        />

        {isDashboardLoading ? (
          <div className="py-8">
            <Loader label="Cargando indicadores institucionales..." />
          </div>
        ) : dashboardError ? (
          <div className="py-8 text-center">
            <p className="text-base font-bold text-[#1B2A41]">
              No fue posible cargar los indicadores.
            </p>

            <Button
              className="mt-4"
              onClick={retryDashboard}
              variant="secondary"
            >
              Reintentar
            </Button>
          </div>
        ) : null}

        <section className="mt-8">
  <DataSection
    title="Estado operativo"
    description="Resumen actual de las principales operaciones de la cooperativa."
  >
    <div className="mt-8 grid grid-cols-1 divide-y divide-[#dce5ed] md:grid-cols-3 md:divide-x md:divide-y-0">
      
      {/* Préstamos */}
      <div className="px-1 py-2 md:px-8 md:first:pl-0">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#718096]">
          Préstamos vigentes
        </p>

        <p className="mt-3 text-5xl font-extrabold tracking-tight text-[#1B2A41]">
          {dashboard?.activeLoans ?? 0}
        </p>

        <p className="mt-2 text-sm font-medium leading-6 text-[#536273]">
          Créditos desembolsados actualmente registrados en el sistema.
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#718096]">
          <span className="h-2 w-2 rounded-full bg-[#718096]" />
          Estado actual
        </div>
      </div>

      {/* Ahorros */}
      <div className="px-1 py-6 md:px-8 md:py-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#718096]">
          Cuentas de ahorro activas
        </p>

        <p className="mt-3 text-5xl font-extrabold tracking-tight text-[#16805C]">
          {dashboard?.activeSavingsAccounts ?? 0}
        </p>

        <p className="mt-2 text-sm font-medium leading-6 text-[#536273]">
          Productos de ahorro registrados actualmente como activos.
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#16805C]">
          <span className="h-2 w-2 rounded-full bg-[#16805C]" />
          Productos activos
        </div>
      </div>

      {/* Transacciones */}
      <div className="px-1 py-6 md:px-8 md:py-2 md:last:pr-0">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#718096]">
          Transacciones registradas
        </p>

        <p className="mt-3 text-5xl font-extrabold tracking-tight text-[#1B2A41]">
          {dashboard?.totalTransactions ?? 0}
        </p>

        <p className="mt-2 text-sm font-medium leading-6 text-[#536273]">
          Operaciones financieras registradas en el sistema.
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#1B2A41]">
          <span className="h-2 w-2 rounded-full bg-[#1B2A41]" />
          Movimientos registrados
        </div>
      </div>
    </div>

    {/* Acciones */}
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#dce5ed] pt-6">
      <div>
        <p className="text-sm font-bold text-[#1B2A41]">
          Consulta la operación que necesites
        </p>

        <p className="mt-1 text-xs font-medium text-[#718096]">
          Accede directamente a préstamos y movimientos financieros.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => goTo("/prestamos")}
          variant="secondary"
        >
          Ver préstamos
          <ArrowRight size={16} />
        </Button>

        <Button
          onClick={() => goTo("/transacciones")}
          variant="secondary"
        >
          Ver transacciones
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  </DataSection>
</section>

        <DataSection
          className="overflow-hidden p-0"
          description="Últimas transacciones reales registradas en el sistema."
          title="Actividad reciente"
          action={
            <button
              className="inline-flex items-center gap-1.5 text-left text-sm font-bold text-blue-600 transition hover:text-blue-700"
              onClick={() => setActiveModal("movements")}
              type="button"
            >
              Ver movimientos
              <ArrowRight size={16} />
            </button>
          }
        >
          {isTransactionsLoading ? (
            <div className="p-6">
              <Loader label="Cargando transacciones..." />
            </div>
          ) : transactionsError ? (
            <div className="p-6 text-center">
              <p className="text-sm font-bold text-[#1B2A41]">
                No fue posible cargar las transacciones.
              </p>
              <Button
                className="mt-4"
                onClick={retryDashboard}
                size="sm"
                variant="secondary"
              >
                Reintentar
              </Button>
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-sm font-medium text-[#536273]">
              No hay transacciones registradas.
            </div>
          ) : (
            <Table className="min-w-[900px]">
              <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-5">Número</th>
                  <th className="px-6 py-5">Movimiento</th>
                  <th className="px-6 py-5">Valor</th>
                  <th className="px-6 py-5">Usuario</th>
                  <th className="px-6 py-5">Fecha</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {recentTransactions.map((item) => (
                  <tr
                    className="transition hover:bg-slate-50/70"
                    key={`${item.number}-${item.date}`}
                  >
                    <td className="px-6 py-5 text-sm font-extrabold text-slate-800">
                      {item.number || "—"}
                    </td>

                    <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                      {item.type || "—"}
                    </td>

                    <td className="px-6 py-5 text-sm font-extrabold text-slate-800">
                      {formatCurrency(item.amount)}
                    </td>

                    <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                      {item.user || "Sistema"}
                    </td>

                    <td className="px-6 py-5 text-sm font-semibold text-slate-600">
                      {formatMovementDate(item.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </DataSection>
      </PageContainer>

      <Modal
        isOpen={activeModal === "movements"}
        onClose={() => setActiveModal(null)}
        size="lg"
        title="Últimos movimientos del sistema"
      >
        <p className="text-sm font-medium text-slate-500">
          Transacciones reales registradas en el sistema, ordenadas de la más
          reciente a la más antigua.
        </p>

        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-sm font-medium text-slate-500">
              No hay transacciones registradas.
            </div>
          ) : (
            <Table className="min-w-[760px]">
              <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Número</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Usuario</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {transactions.map((movement) => (
                  <tr
                    className="transition hover:bg-slate-50/70"
                    key={`${movement.number}-${movement.date}`}
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                      {formatMovementDate(movement.date)}
                    </td>

                    <td className="px-4 py-4 text-sm font-extrabold text-slate-800">
                      {movement.number || "—"}
                    </td>

                    <td className="px-4 py-4 text-sm font-extrabold text-slate-800">
                      {movement.type || "—"}
                    </td>

                    <td className="px-4 py-4 text-sm font-extrabold text-slate-800">
                      {formatCurrency(movement.amount)}
                    </td>

                    <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                      {movement.user || "Sistema"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <Button onClick={() => goTo("/transacciones")}>
            Ir a Transacciones
            <ArrowRight size={17} />
          </Button>
        </div>
      </Modal>
    </>
  );
}
