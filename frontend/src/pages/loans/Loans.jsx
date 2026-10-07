import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  BanknoteArrowDown,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  FileText,
  Plus,
  Search,
  X,
} from "lucide-react";

import AssociateSearch from "../../components/ui/AssociateSearch";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import ToastProvider from "../../components/ui/ToastProvider";
import { notifyError, notifySuccess } from "../../components/ui/toastNotifications";

import api from "../../services/api";
import associateService from "../../services/associateService";
import {
  approveLoan,
  createLoan,
  disburseLoan,
  getLoanByNumber,
  getLoanInstallments,
  getLoansByAssociateId,
  payLoanInstallment,
  rejectLoan,
} from "../../services/loanService";

const statusLabels = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  DISBURSED: "Desembolsado",
  PAID: "Pagado",
  CANCELLED: "Cancelado",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  })
    .format(Number(value || 0))
    .replace("COP", "$ ");
}

function formatDate(value) {
  if (!value) return null;

  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
        .format(date)
        .replace(/\./g, "");
}

function getAssociateName(associate) {
  return [associate?.firstName, associate?.lastName]
    .filter(Boolean)
    .join(" ");
}

function mapLoan(loan, associateName = "Asociado no disponible") {
  return {
    ...loan,
    number: loan.loanNumber,
    associate: associateName,
    statusLabel: statusLabels[loan.status] || loan.status,
  };
}

function getErrorMessage(error, fallback) {
  const data = error.response?.data;

  if (error.response?.status === 404) {
    return "Crédito no encontrado";
  }

  return data?.errors?.[0] ?? data?.message ?? fallback;
}

function statusStyle(status) {
  if (status === "DISBURSED") {
    return {
      variant: "neutral",
      className: "bg-[#EAF2F8] text-[#245B8F] ring-[#cfe0ed]",
    };
  }

  if (status === "PENDING") return { variant: "warning" };

  if (status === "PAID" || status === "APPROVED") {
    return { variant: "success" };
  }

  return { variant: "neutral" };
}

function summarizeInstallments(installments = []) {
  const pending = installments.filter((item) => item.status === "PENDING");
  const paid = installments.filter((item) => item.status === "PAID");
  const next = pending[0];

  const balance = pending.reduce(
    (total, item) =>
      total +
      Math.max(
        Number(item.totalPayment || 0) - Number(item.paidAmount || 0),
        0
      ),
    0
  );

  return { pending, paid, next, balance };
}

function DetailItem({ label, value, accent = false }) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div className="rounded-lg border border-[#dce5ed] bg-white p-4">
      <p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[#536273]">
        {label}
      </p>
      <p
        className={`mt-1.5 text-sm font-extrabold ${
          accent ? "text-[#16805C]" : "text-[#1B2A41]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#1B2A41]">
        {label}
      </span>

      {children}

      {error && (
        <p className="mt-1 text-sm font-semibold text-[#D92D20]">
          {error}
        </p>
      )}
    </label>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#EAF2F8] text-[#163A63]">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#536273]">
            {label}
          </p>

          <p className="mt-1 truncate text-xl font-extrabold text-[#1B2A41]">
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function Loans() {
  const [associates, setAssociates] = useState([]);
  const [kpis, setKpis] = useState(null);

  const [query, setQuery] = useState("");
  const [associateSuggestions, setAssociateSuggestions] = useState([]);
  const [selectedSearchAssociate, setSelectedSearchAssociate] = useState(null);

  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  const [matchingLoans, setMatchingLoans] = useState([]);
  const [resultLoan, setResultLoan] = useState(null);
  const [resultSummary, setResultSummary] = useState(null);

  const [statusLoan, setStatusLoan] = useState(null);
  const [historyLoan, setHistoryLoan] = useState(null);
  const [history, setHistory] = useState([]);

  const [detailLoan, setDetailLoan] = useState(null);

  const [paymentLoan, setPaymentLoan] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState("INSTALLMENT");

  const [actionLoan, setActionLoan] = useState(null);
  const [actionType, setActionType] = useState("");
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAssociate, setSelectedAssociate] = useState(null);
  const [associateError, setAssociateError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      amount: "",
      interestRate: "",
      termMonths: "",
    },
  });

  /* =========================
     INDICADORES
  ========================= */

  async function loadKpis() {
    try {
      const response = await api.get("/reports/dashboard");
      setKpis(response.data?.data ?? null);
    } catch {
      setKpis(null);
    }
  }

  useEffect(() => {
    let active = true;

    api
      .get("/reports/dashboard")
      .then((response) => {
        if (active) {
          setKpis(response.data?.data ?? null);
        }
      })
      .catch(() => {
        if (active) {
          setKpis(null);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  /* =========================
     AUTOCOMPLETADO ASOCIADOS
  ========================= */

  useEffect(() => {
    const value = query.trim();

    if (
      selectedSearchAssociate ||
      value.length < 2 ||
      /^\d+$/.test(value)
    ) {
      return undefined;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        const response = await associateService.search(value, 5);

        if (!controller.signal.aborted) {
          setAssociateSuggestions(response ?? []);
        }
      } catch (error) {
        if (
          error.name !== "CanceledError" &&
          error.code !== "ERR_CANCELED"
        ) {
          setAssociateSuggestions([]);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, selectedSearchAssociate]);

  /* =========================
     LIMPIAR BUSQUEDA
  ========================= */

  function clearSearch() {
    setQuery("");
    setSearched(false);
    setSearching(false);
    setAssociateSuggestions([]);
    setSelectedSearchAssociate(null);
    setResultLoan(null);
    setResultSummary(null);
    setMatchingLoans([]);
    setSearchMessage("");
  }

  /* =========================
     CONSULTAR CREDITOS DEL ASOCIADO
  ========================= */

  async function selectAssociate(associate) {
    setSelectedSearchAssociate(associate);
    setQuery(getAssociateName(associate));
    setAssociateSuggestions([]);
    setSearched(true);
    setSearching(true);
    setResultLoan(null);
    setResultSummary(null);
    setSearchMessage("");
    setMatchingLoans([]);

    try {
      const loans = await getLoansByAssociateId(associate.id);

      const mappedLoans = loans.map((loan) =>
        mapLoan(loan, getAssociateName(associate))
      );

      setMatchingLoans(mappedLoans);

      if (!mappedLoans.length) {
        setSearchMessage("El asociado no tiene créditos registrados.");
      }
    } catch (error) {
      setSearchMessage(
        getErrorMessage(
          error,
          "No fue posible consultar los créditos del asociado."
        )
      );
    } finally {
      setSearching(false);
    }
  }

  /* =========================
     BUSQUEDA POR NUMERO
  ========================= */

  async function handleSearch(event) {
    event.preventDefault();

    const value = query.trim();

    setSearched(true);
    setSearchMessage("");
    setResultLoan(null);
    setResultSummary(null);
    setMatchingLoans([]);
    setAssociateSuggestions([]);

    if (!value) {
      setSearchMessage(
        "Ingresa un número de crédito o selecciona un asociado."
      );
      return;
    }

    if (selectedSearchAssociate) {
      await selectAssociate(selectedSearchAssociate);
      return;
    }

    setSearching(true);

    try {
      const loan = await getLoanByNumber(value);

      let associate;

      try {
        associate = await associateService.getById(loan.associateId);
      } catch {
        associate = null;
      }

      const mappedLoan = mapLoan(
        loan,
        associate ? getAssociateName(associate) : "Asociado no disponible"
      );

      setResultLoan(mappedLoan);

      try {
        const installments = await getLoanInstallments(mappedLoan.id);
        setResultSummary(summarizeInstallments(installments));
      } catch {
        setResultSummary(null);
      }
    } catch (error) {
      if (error.response?.status === 404 && /^\d+$/.test(value)) {
        try {
          const associate = await associateService.getById(Number(value));
          await selectAssociate(associate);
        } catch {
          setSearchMessage(
            "No encontramos un crédito ni un asociado con ese número."
          );
        }
      } else {
        setSearchMessage(
          error.response?.status === 404
            ? "Crédito no encontrado. Busca por el nombre del asociado."
            : "No fue posible consultar el crédito. Inténtalo nuevamente."
        );
      }
    } finally {
      setSearching(false);
    }
  }

  /* =========================
     CRONOGRAMA
  ========================= */

  async function getSchedule(loan) {
    const [currentLoan, installments] = await Promise.all([
      getLoanDetailsWithAssociate(loan),
      getLoanInstallments(loan.id),
    ]);

    return {
      loan: currentLoan,
      installments,
    };
  }

  async function getLoanDetailsWithAssociate(loan) {
    if (selectedSearchAssociate) {
      return mapLoan(loan, getAssociateName(selectedSearchAssociate));
    }

    try {
      const associate = await associateService.getById(loan.associateId);

      return mapLoan(loan, getAssociateName(associate));
    } catch {
      return mapLoan(loan);
    }
  }

  /* =========================
     ESTADO
  ========================= */

  async function openStatus() {
    try {
      const data = await getSchedule(resultLoan);
      setStatusLoan(data);
    } catch (error) {
      notifyError(
        getErrorMessage(
          error,
          "No fue posible consultar el estado del crédito."
        )
      );
    }
  }

  /* =========================
     HISTORIAL
  ========================= */

  async function openHistory() {
    try {
      const data = await getSchedule(resultLoan);

      setHistoryLoan(data.loan);

      setHistory(
        data.installments.filter(
          (installment) =>
            installment.status === "PAID" ||
            Number(installment.paidAmount || 0) > 0
        )
      );
    } catch (error) {
      notifyError(
        getErrorMessage(
          error,
          "No fue posible consultar el historial de pagos."
        )
      );
    }
  }

  /* =========================
     PAGO
  ========================= */

  async function openPayment() {
    try {
      const { loan, installments } = await getSchedule(resultLoan);

      const pending = installments.filter(
        (installment) => installment.status === "PENDING"
      );

      if (!pending.length) {
        notifyError("El préstamo no tiene saldo pendiente.");
        return;
      }

      const remainingBalance = Number(
        pending
          .reduce(
            (total, installment) =>
              total +
              Math.max(
                Number(installment.totalPayment || 0) -
                  Number(installment.paidAmount || 0),
                0
              ),
            0
          )
          .toFixed(2)
      );

      setPaymentLoan({
        ...loan,
        remainingBalance,
        nextInstallment: pending[0],
        pending,
      });

      setPaymentAmount(
        Number(pending[0].totalPayment || 0).toFixed(2)
      );
      setPaymentType("INSTALLMENT");
    } catch (error) {
      notifyError(
        getErrorMessage(
          error,
          "No fue posible preparar el pago del crédito."
        )
      );
    }
  }

  async function submitPayment(event) {
    event.preventDefault();

    const amount = Number(Number(paymentAmount).toFixed(2));

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > paymentLoan.remainingBalance
    ) {
      notifyError(
        "Ingresa un valor de pago válido dentro del saldo pendiente."
      );
      return;
    }

    try {
      await payLoanInstallment(paymentLoan.id, {
        amount,
        paymentType,
      });

      notifySuccess(
        amount === paymentLoan.remainingBalance
          ? "Préstamo pagado completamente."
          : "Pago registrado correctamente."
      );

      setPaymentLoan(null);
      setPaymentAmount("");
      setPaymentType("INSTALLMENT");

      await loadKpis();

      if (selectedSearchAssociate) {
        await selectAssociate(selectedSearchAssociate);
      }
    } catch (error) {
      notifyError(
        getErrorMessage(error, "No fue posible registrar el pago.")
      );
    }
  }

  /* =========================
     APROBAR / RECHAZAR / DESEMBOLSAR
  ========================= */

  async function submitLoanAction() {
    const actions = {
      approve: approveLoan,
      reject: rejectLoan,
      disburse: disburseLoan,
    };

    const action = actions[actionType];

    if (!actionLoan || !action) return;

    try {
      setIsActionSubmitting(true);

      await action(actionLoan.id);

      notifySuccess("Estado del préstamo actualizado correctamente.");

      setActionLoan(null);
      setActionType("");

      await loadKpis();

      if (selectedSearchAssociate) {
        await selectAssociate(selectedSearchAssociate);
      }
    } catch (error) {
      notifyError(
        getErrorMessage(
          error,
          "No fue posible actualizar el préstamo."
        )
      );
    } finally {
      setIsActionSubmitting(false);
    }
  }

  /* =========================
     CREAR PRESTAMO
  ========================= */

  async function openCreateModal() {
    reset({
      amount: "",
      interestRate: "",
      termMonths: "",
    });

    setSelectedAssociate(null);
    setAssociateError("");
    setIsCreateOpen(true);

    try {
      if (!associates.length) {
        const data = await associateService.getAll();
        setAssociates(data);
      }
    } catch (error) {
      notifyError(
        getErrorMessage(
          error,
          "No fue posible cargar los asociados."
        )
      );
    }
  }

  function closeCreateModal() {
    reset();
    setSelectedAssociate(null);
    setAssociateError("");
    setIsCreateOpen(false);
  }

  async function submitCreate(data) {
    if (!selectedAssociate) {
      setAssociateError("Selecciona un asociado para continuar.");
      return;
    }

    try {
      await createLoan({
        associateId: selectedAssociate.id,
        amount: Number(data.amount),
        interestRate: Number(data.interestRate),
        termMonths: Number(data.termMonths),
      });

      closeCreateModal();

      notifySuccess("Préstamo solicitado correctamente.");

      await loadKpis();

      if (
        selectedSearchAssociate &&
        selectedSearchAssociate.id === selectedAssociate.id
      ) {
        await selectAssociate(selectedSearchAssociate);
      }
    } catch (error) {
      notifyError(
        getErrorMessage(
          error,
          "No fue posible crear el préstamo."
        )
      );
    }
  }

  const scheduleSummary = statusLoan
    ? summarizeInstallments(statusLoan.installments)
    : null;

  return (
    <>
      <PageContainer>
        <PageHeader
          eyebrow="Gestión de préstamos"
          title="Préstamos"
          subtitle="Consulta y gestiona la información de los créditos de los asociados."
          action={
            <Button onClick={openCreateModal}>
              <Plus size={18} />
              Nuevo préstamo
            </Button>
          }
        />

        {/* INDICADORES */}
        {kpis && (
          <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<BanknoteArrowDown size={20} />}
              label="Dinero prestado"
              value={formatCurrency(kpis.disbursedAmount)}
            />

            <StatCard
              icon={<CircleDollarSign size={20} />}
              label="Cartera vigente"
              value={formatCurrency(kpis.outstandingPrincipal)}
            />

            <StatCard
              icon={<CreditCard size={20} />}
              label="Créditos activos"
              value={kpis.activeLoans ?? 0}
            />

            <StatCard
              icon={<ClipboardList size={20} />}
              label="Total de créditos"
              value={kpis.totalLoans ?? 0}
            />
          </div>
        )}

        {/* BUSCADOR */}
        <Card className="border-t-4 border-t-[#163A63] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#EAF2F8] text-[#163A63]">
              <Search size={20} />
            </div>

            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-[#1B2A41]">
                Consultar crédito
              </h2>

              <p className="mt-1 text-sm font-medium text-[#536273]">
                Busca un asociado para consultar únicamente sus créditos.
              </p>
            </div>
          </div>

          <form
            className="mt-5 flex flex-col gap-3 sm:flex-row"
            onSubmit={handleSearch}
          >
            <div className="relative flex-1">
              <Input
                aria-label="Buscar asociado"
                leadingAdornment={<Search size={18} />}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedSearchAssociate(null);
                  setSearched(false);
                  setResultLoan(null);
                  setResultSummary(null);
                  setMatchingLoans([]);
                  setSearchMessage("");
                }}
                placeholder="Escribe el nombre del asociado..."
                value={query}
              />

              {/* AUTOCOMPLETADO */}
              {associateSuggestions.length > 0 && (
                <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-[#dce5ed] bg-white shadow-xl">
                  {associateSuggestions.map((associate) => (
                    <button
                      key={associate.id}
                      type="button"
                      onClick={() => void selectAssociate(associate)}
                      className="flex w-full items-center justify-between border-b border-[#edf1f4] px-4 py-3 text-left last:border-b-0 hover:bg-[#F4F6F8]"
                    >
                      <span className="font-bold text-[#1B2A41]">
                        {getAssociateName(associate)}
                      </span>

                      <span className="ml-3 shrink-0 text-xs font-extrabold text-[#536273]">
                        {associate.code || `ID ${associate.id}`}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              className="w-full sm:w-auto"
              disabled={searching}
              type="submit"
            >
              <Search size={18} />
              {searching ? "Buscando..." : "Buscar"}
            </Button>

            {(query || searched) && (
              <Button
                className="w-full sm:w-auto"
                onClick={clearSearch}
                type="button"
                variant="secondary"
              >
                <X size={17} />
                Limpiar
              </Button>
            )}
          </form>

          <p className="mt-3 text-xs font-medium text-[#536273]">
            Ej.: Orlando Enrique, ASO-0001 o número de crédito
          </p>
        </Card>

        {/* RESULTADOS */}
        {searching ? (
          <Card>
            <Loader label="Consultando créditos..." />
          </Card>
        ) : searchMessage ? (
          <Card>
            <EmptyState
              icon={<Search size={28} />}
              title={
                searchMessage.includes("no tiene créditos")
                  ? "Sin créditos registrados"
                  : "Consulta de crédito"
              }
              description={searchMessage}
              action={
                <Button onClick={clearSearch} variant="secondary">
                  Nueva consulta
                </Button>
              }
            />
          </Card>
        ) : matchingLoans.length > 0 ? (
          <Card>
            <div className="border-b border-[#dce5ed] pb-4">
              <h2 className="text-xl font-extrabold text-[#1B2A41]">
                Créditos de{" "}
                {selectedSearchAssociate
                  ? getAssociateName(selectedSearchAssociate)
                  : "el asociado"}
              </h2>

              <p className="mt-1 text-sm font-medium text-[#536273]">
                Selecciona un crédito para consultar su información.
              </p>
            </div>

            <div className="mt-4 grid gap-3">
              {matchingLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="flex flex-col gap-4 rounded-lg border border-[#dce5ed] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-extrabold text-[#1B2A41]">
                      Crédito {loan.number}
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#536273]">
                      {loan.associate}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[#536273]">
                      Monto:{" "}
                      <span className="text-[#1B2A41]">
                        {formatCurrency(loan.amount)}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge {...statusStyle(loan.status)}>
                      {loan.statusLabel}
                    </Badge>

                    <Button
                      variant="secondary"
                      onClick={() => {
                        void (async () => {
                          try {
                            const mappedLoan = mapLoan(
                              loan,
                              selectedSearchAssociate
                                ? getAssociateName(selectedSearchAssociate)
                                : loan.associate
                            );

                            setMatchingLoans([]);
                            setResultLoan(mappedLoan);

                            try {
                              const installments =
                                await getLoanInstallments(mappedLoan.id);

                              setResultSummary(
                                summarizeInstallments(installments)
                              );
                            } catch {
                              setResultSummary(null);
                            }
                          } catch {
                            notifyError(
                              "No fue posible consultar el crédito seleccionado."
                            );
                          }
                        })();
                      }}
                    >
                      Consultar crédito
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : resultLoan ? (
          <LoanResult
            loan={resultLoan}
            summary={resultSummary}
            onDetail={() => setDetailLoan(resultLoan)}
            onHistory={openHistory}
            onPayment={openPayment}
            onStatus={openStatus}
            onAction={(type) => {
              setActionLoan(resultLoan);
              setActionType(type);
            }}
          />
        ) : !searched ? (
          <Card>
            <EmptyState
              icon={<Search size={28} />}
              title="Consulta un crédito"
              description="Escribe el nombre de un asociado para ver sus créditos."
            />
          </Card>
        ) : null}
      </PageContainer>

      {/* NUEVO PRESTAMO */}
      <Modal
        isOpen={isCreateOpen}
        onClose={closeCreateModal}
        size="lg"
        title="Nuevo préstamo"
      >
        <form
          className="space-y-5"
          onSubmit={handleSubmit(submitCreate)}
        >
          <AssociateSearch
            associates={associates}
            selectedAssociate={selectedAssociate}
            onClear={() => {
              setSelectedAssociate(null);
              setAssociateError("");
            }}
            onSelect={(associate) => {
              setSelectedAssociate(associate);
              setAssociateError("");
            }}
          />

          {associateError && (
            <p className="text-sm font-semibold text-[#D92D20]">
              {associateError}
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <Field
              error={errors.amount?.message}
              label="Monto"
            >
              <Input
                {...register("amount", {
                  required: "El monto es obligatorio",
                  min: {
                    value: 1,
                    message: "Ingresa un valor mayor a cero",
                  },
                })}
                min="1"
                type="number"
              />
            </Field>

            <Field
              error={errors.interestRate?.message}
              label="Tasa de interés"
            >
              <Input
                {...register("interestRate", {
                  required: "La tasa es obligatoria",
                  min: {
                    value: 0.01,
                    message: "La tasa debe ser mayor a cero",
                  },
                })}
                min="0.01"
                step="0.01"
                type="number"
              />
            </Field>

            <Field
              error={errors.termMonths?.message}
              label="Plazo (meses)"
            >
              <Input
                {...register("termMonths", {
                  required: "El plazo es obligatorio",
                  min: {
                    value: 1,
                    message: "El plazo debe ser mayor a cero",
                  },
                })}
                min="1"
                type="number"
              />
            </Field>
          </div>

          <div className="flex justify-end gap-3 border-t border-[#dce5ed] pt-4">
            <Button
              onClick={closeCreateModal}
              type="button"
              variant="secondary"
            >
              Cancelar
            </Button>

            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Guardando..." : "Guardar solicitud"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DETALLE */}
      <Modal
        isOpen={Boolean(detailLoan)}
        onClose={() => setDetailLoan(null)}
        size="lg"
        title="Detalle del crédito"
      >
        {detailLoan && <LoanDetails loan={detailLoan} />}
      </Modal>

      {/* ESTADO */}
      <Modal
        isOpen={Boolean(statusLoan)}
        onClose={() => setStatusLoan(null)}
        size="lg"
        title="Estado del crédito"
      >
        {statusLoan && scheduleSummary && (
          <div className="space-y-5">
            <CreditSummary
              loan={statusLoan.loan}
              summary={scheduleSummary}
            />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem
                label="Cuotas pagadas"
                value={scheduleSummary.paid.length}
              />

              <DetailItem
                label="Cuotas pendientes"
                value={scheduleSummary.pending.length}
              />

              <DetailItem
                label="Próxima cuota"
                value={
                  scheduleSummary.next
                    ? formatCurrency(scheduleSummary.next.totalPayment)
                    : null
                }
              />

              <DetailItem
                label="Fecha próxima cuota"
                value={
                  scheduleSummary.next
                    ? formatDate(scheduleSummary.next.dueDate)
                    : null
                }
              />

              <DetailItem
                accent
                label="Saldo pendiente"
                value={formatCurrency(scheduleSummary.balance)}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* HISTORIAL */}
      <Modal
        isOpen={Boolean(historyLoan)}
        onClose={() => {
          setHistoryLoan(null);
          setHistory([]);
        }}
        size="lg"
        title="Historial de pagos"
      >
        {historyLoan &&
          (history.length ? (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.installmentNumber}
                  className="grid gap-2 rounded-lg border border-[#dce5ed] p-4 sm:grid-cols-5"
                >
                  <DetailItem
                    label="Fecha"
                    value={formatDate(item.paidAt)}
                  />

                  <DetailItem
                    label="Cuota"
                    value={item.installmentNumber}
                  />

                  <DetailItem
                    label="Valor pagado"
                    value={formatCurrency(item.paidAmount)}
                  />

                  <DetailItem
                    label="Saldo"
                    value={formatCurrency(item.remainingBalance)}
                  />

                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[#536273]">
                      Estado
                    </p>

                    <Badge
                      className="mt-1.5"
                      variant="success"
                    >
                      Pagada
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<ClipboardList size={26} />}
              title="No hay pagos registrados"
              description="Este crédito no tiene pagos disponibles en su cronograma."
            />
          ))}
      </Modal>

      {/* PAGO */}
      <Modal
        isOpen={Boolean(paymentLoan)}
        onClose={() => {
          setPaymentLoan(null);
          setPaymentAmount("");
          setPaymentType("INSTALLMENT");
        }}
        size="sm"
        title="Pagar crédito"
      >
        {paymentLoan && (
          <form className="space-y-5" onSubmit={submitPayment}>
            <div className="rounded-lg bg-[#F4F6F8] p-4">
              <p className="font-extrabold text-[#1B2A41]">
                {paymentLoan.number}
              </p>

              <p className="mt-1 text-sm font-medium text-[#536273]">
                {paymentLoan.associate}
              </p>

              <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.09em] text-[#536273]">
                Saldo pendiente
              </p>

              <p className="mt-1 text-xl font-extrabold text-[#16805C]">
                {formatCurrency(paymentLoan.remainingBalance)}
              </p>
            </div>

            <Field label="Tipo de pago">
              <select
                className="min-h-10 w-full rounded-lg border border-[#c9d5df] bg-white px-3 text-sm font-medium text-[#1B2A41] outline-none focus:border-[#1769E0] focus:ring-3 focus:ring-[#EAF2F8]"
                value={paymentType}
                onChange={(event) => {
                  const type = event.target.value;

                  setPaymentType(type);

                  setPaymentAmount(
                    type === "FULL_PAYMENT"
                      ? Number(paymentLoan.remainingBalance).toFixed(2)
                      : type === "INSTALLMENT"
                      ? Number(
                          paymentLoan.nextInstallment.totalPayment || 0
                        ).toFixed(2)
                      : ""
                  );
                }}
              >
                <option value="INSTALLMENT">
                  Pago de cuota
                </option>

                <option value="PRINCIPAL_ABATEMENT">
                  Abono a capital
                </option>

                <option value="FULL_PAYMENT">
                  Pago total
                </option>
              </select>
            </Field>

            <Field label="Valor a pagar">
              <Input
                max={paymentLoan.remainingBalance}
                min="0.01"
                onChange={(event) =>
                  setPaymentAmount(event.target.value)
                }
                required
                step="0.01"
                type="number"
                value={paymentAmount}
              />
            </Field>

            <div className="flex justify-end gap-3 border-t border-[#dce5ed] pt-4">
              <Button
                onClick={() => setPaymentLoan(null)}
                type="button"
                variant="secondary"
              >
                Cancelar
              </Button>

              <Button type="submit">
                Continuar con el pago
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ACCIONES */}
      <Modal
        isOpen={Boolean(actionLoan)}
        onClose={() => {
          if (!isActionSubmitting) {
            setActionLoan(null);
            setActionType("");
          }
        }}
        size="sm"
        title="Confirmar acción"
      >
        {actionLoan && (
          <div className="space-y-5">
            <p className="text-sm font-medium text-[#536273]">
              ¿Confirmas{" "}
              {actionType === "approve"
                ? "la aprobación"
                : actionType === "reject"
                ? "el rechazo"
                : "el desembolso"}{" "}
              del crédito{" "}
              <strong className="text-[#1B2A41]">
                {actionLoan.number}
              </strong>
              ?
            </p>

            <div className="flex justify-end gap-3 border-t border-[#dce5ed] pt-4">
              <Button
                disabled={isActionSubmitting}
                onClick={() => {
                  setActionLoan(null);
                  setActionType("");
                }}
                variant="secondary"
              >
                Cancelar
              </Button>

              <Button
                disabled={isActionSubmitting}
                onClick={submitLoanAction}
              >
                {isActionSubmitting
                  ? "Procesando..."
                  : "Confirmar"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ToastProvider />
    </>
  );
}

function LoanResult({
  loan,
  summary,
  onDetail,
  onHistory,
  onPayment,
  onStatus,
  onAction,
}) {
  const status = statusStyle(loan.status);

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,.8fr)]">
      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 border-b border-[#dce5ed] bg-[#fbfcfd] px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#245B8F]">
              Resultado de la consulta
            </p>

            <h2 className="mt-1 text-xl font-extrabold text-[#1B2A41]">
              Información del crédito
            </h2>

            <p className="mt-1 text-sm font-medium text-[#536273]">
              {loan.number}
            </p>
          </div>

          <Badge {...status}>{loan.statusLabel}</Badge>
        </div>

        <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem
            label="Número de crédito"
            value={loan.number}
          />

          <DetailItem
            label="Asociado"
            value={loan.associate}
          />

          <DetailItem
            label="Monto original"
            value={formatCurrency(loan.amount)}
          />

          <DetailItem
            label="Tasa"
            value={
              loan.interestRate != null
                ? `${loan.interestRate}%`
                : null
            }
          />

          <DetailItem
            label="Plazo"
            value={
              loan.termMonths != null
                ? `${loan.termMonths} meses`
                : null
            }
          />

          <DetailItem
            label="Fecha de aprobación"
            value={formatDate(loan.approvedAt)}
          />

          <DetailItem
            accent
            label="Saldo pendiente"
            value={
              summary
                ? formatCurrency(summary.balance)
                : null
            }
          />

          <DetailItem
            label="Próxima cuota"
            value={
              summary?.next
                ? formatCurrency(summary.next.totalPayment)
                : null
            }
          />

          <DetailItem
            label="Fecha próxima cuota"
            value={
              summary?.next
                ? formatDate(summary.next.dueDate)
                : null
            }
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-extrabold text-[#1B2A41]">
          Acciones del crédito
        </h2>

        <p className="mt-1 text-sm font-medium text-[#536273]">
          Gestiona la información disponible del crédito.
        </p>

        <div className="mt-5 grid gap-2">
          <Button onClick={onPayment}>
            <CreditCard size={17} />
            Pagar crédito
          </Button>

          <Button onClick={onStatus} variant="secondary">
            <CircleDollarSign size={17} />
            Ver estado del crédito
          </Button>

          <Button onClick={onHistory} variant="secondary">
            <ClipboardList size={17} />
            Historial de pagos
          </Button>

          <Button onClick={onDetail} variant="secondary">
            <FileText size={17} />
            Ver detalle del crédito
          </Button>

          {loan.status === "PENDING" && (
            <>
              <Button
                onClick={() => onAction("approve")}
                variant="secondary"
              >
                Aprobar crédito
              </Button>

              <Button
                onClick={() => onAction("reject")}
                variant="ghost"
                className="border border-[#D92D20] text-[#D92D20] hover:bg-[#FEF3F2] hover:text-[#B42318]"
              >
                Rechazar crédito
              </Button>
            </>
          )}

          {loan.status === "APPROVED" && (
            <Button
              onClick={() => onAction("disburse")}
              variant="secondary"
            >
              <BanknoteArrowDown size={17} />
              Desembolsar crédito
            </Button>
          )}
        </div>
      </Card>
    </section>
  );
}

function CreditSummary({ loan }) {
  const status = statusStyle(loan.status);

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-[#F4F6F8] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[#536273]">
          Estado actual
        </p>

        <p className="mt-1 text-lg font-extrabold text-[#1B2A41]">
          {loan.number}
        </p>
      </div>

      <Badge {...status}>{loan.statusLabel}</Badge>
    </div>
  );
}

function LoanDetails({ loan }) {
  const status = statusStyle(loan.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg bg-[#F4F6F8] p-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[#536273]">
            Asociado
          </p>

          <p className="mt-1 font-extrabold text-[#1B2A41]">
            {loan.associate}
          </p>
        </div>

        <Badge {...status}>{loan.statusLabel}</Badge>
      </div>

      <section>
        <h3 className="text-sm font-extrabold uppercase tracking-[0.1em] text-[#245B8F]">
          Datos del crédito
        </h3>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <DetailItem
            label="Número de crédito"
            value={loan.number}
          />

          <DetailItem
            label="Estado"
            value={loan.statusLabel}
          />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-extrabold uppercase tracking-[0.1em] text-[#245B8F]">
          Información del asociado
        </h3>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <DetailItem
            label="Asociado"
            value={loan.associate}
          />

          <DetailItem
            label="ID del asociado"
            value={loan.associateId}
          />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-extrabold uppercase tracking-[0.1em] text-[#245B8F]">
          Condiciones del crédito
        </h3>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <DetailItem
            label="Monto original"
            value={formatCurrency(loan.amount)}
          />

          <DetailItem
            label="Tasa de interés"
            value={
              loan.interestRate != null
                ? `${loan.interestRate}%`
                : null
            }
          />

          <DetailItem
            label="Plazo"
            value={
              loan.termMonths != null
                ? `${loan.termMonths} meses`
                : null
            }
          />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-extrabold uppercase tracking-[0.1em] text-[#245B8F]">
          Fechas
        </h3>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <DetailItem
            label="Fecha de solicitud"
            value={formatDate(loan.requestedAt)}
          />

          <DetailItem
            label="Fecha de aprobación / desembolso"
            value={formatDate(loan.approvedAt)}
          />
        </div>
      </section>
    </div>
  );
}