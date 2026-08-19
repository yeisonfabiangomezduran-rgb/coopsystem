import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BanknoteArrowDown, CircleDollarSign, FileCheck2, HandCoins, Plus, Timer } from "lucide-react";

import ActionMenu from "../../components/ui/ActionMenu";
import AssociateSearch from "../../components/ui/AssociateSearch";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import DataSection from "../../components/ui/DataSection";
import EmptyState from "../../components/ui/EmptyState";
import FilterBar from "../../components/ui/FilterBar";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import SummaryCards from "../../components/ui/SummaryCards";
import Table from "../../components/ui/Table";
import ToastProvider from "../../components/ui/ToastProvider";
import { notifyError, notifySuccess } from "../../components/ui/toastNotifications";
import associateService from "../../services/associateService";
import {
  approveLoan,
  createLoan,
  disburseLoan,
  getLoanById,
  getLoanInstallments,
  getLoans,
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

const statusVariant = {
  Pendiente: "warning",
  Aprobado: "success",
  Rechazado: "neutral",
  Desembolsado: "success",
  Pagado: "success",
  Cancelado: "neutral",
};

const loanFilters = [{
  id: "status",
  label: "Estado",
  ariaLabel: "Filtrar por estado",
  options: ["Todos", ...Object.values(statusLabels)],
}];

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0)).replace("COP", "$ ");
}

function formatDate(value) {
  if (!value) return "No disponible";

  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date).replace(/\./g, "");
}

function getAssociateName(associate) {
  return [associate.firstName, associate.lastName].filter(Boolean).join(" ");
}

function mapLoan(loan, associatesById) {
  return {
    ...loan,
    number: loan.loanNumber,
    associate: associatesById.get(loan.associateId) || "Asociado no disponible",
    statusLabel: statusLabels[loan.status] || loan.status,
  };
}

function getErrorMessage(error, fallback) {
  const response = error.response?.data;
  if (response?.errors?.[0]) return response.errors[0];
  if (response?.message) return response.message;

  const status = error.response?.status;
  if (status === 400) return "La solicitud contiene datos inválidos.";
  if (status === 401) return "Tu sesión no es válida. Inicia sesión nuevamente.";
  if (status === 403) return "No tienes permisos para realizar esta acción.";
  if (status === 404) return "El préstamo no existe o fue eliminado.";
  if (status === 409) return "No fue posible completar la operación por un conflicto de datos.";
  if (status === 500) return "El servidor no pudo completar la operación. Inténtalo más tarde.";
  return fallback;
}

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [associates, setAssociates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAssociate, setSelectedAssociate] = useState(null);
  const [associateError, setAssociateError] = useState("");
  const [detailLoan, setDetailLoan] = useState(null);
  const [installmentsLoan, setInstallmentsLoan] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [paymentLoan, setPaymentLoan] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [actionLoan, setActionLoan] = useState(null);
  const [actionType, setActionType] = useState("");
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const [isEditUnavailableOpen, setIsEditUnavailableOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { amount: "", interestRate: "", termMonths: "" },
  });

  const loadLoans = useCallback(async () => {
    setLoadError("");
    setIsLoading(true);
    try {
      const [loanList, associateList] = await Promise.all([getLoans(), associateService.getAll()]);
      const associatesById = new Map(associateList.map((associate) => [associate.id, getAssociateName(associate)]));
      setAssociates(associateList);
      setLoans(loanList.map((loan) => mapLoan(loan, associatesById)));
    } catch (error) {
      console.error("Error cargando préstamos:", error);
      const message = getErrorMessage(error, "No fue posible cargar los préstamos. Inténtalo de nuevo.");
      setLoadError(message);
      notifyError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [loanList, associateList] = await Promise.all([getLoans(), associateService.getAll()]);
        const associatesById = new Map(associateList.map((associate) => [associate.id, getAssociateName(associate)]));
        if (mounted) {
          setAssociates(associateList);
          setLoans(loanList.map((loan) => mapLoan(loan, associatesById)));
        }
      } catch (error) {
        console.error("Error cargando préstamos:", error);
        if (mounted) {
          const message = getErrorMessage(error, "No fue posible cargar los préstamos. Inténtalo de nuevo.");
          setLoadError(message);
          notifyError(message);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filteredLoans = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es-CO");
    return loans.filter((loan) => {
      const matchesSearch = !normalizedSearch || [loan.number, loan.associate]
        .some((value) => value.toLocaleLowerCase("es-CO").includes(normalizedSearch));
      return matchesSearch && (statusFilter === "Todos" || loan.statusLabel === statusFilter);
    });
  }, [loans, search, statusFilter]);

  const summaryCards = useMemo(() => {
    const pendingLoans = loans.filter((loan) => loan.status === "PENDING");
    const approvedLoans = loans.filter((loan) => loan.status === "APPROVED");
    const disbursedLoans = loans.filter((loan) => loan.status === "DISBURSED");
    const totalAmount = loans.reduce((total, loan) => total + Number(loan.amount || 0), 0);
    return [
      { title: "Préstamos pendientes", value: pendingLoans.length.toString(), subtitle: "Solicitudes por gestionar", icon: <Timer size={28} />, color: "bg-blue-50 text-blue-600" },
      { title: "Préstamos aprobados", value: approvedLoans.length.toString(), subtitle: "Pendientes de desembolso", icon: <FileCheck2 size={28} />, color: "bg-emerald-50 text-emerald-600" },
      { title: "Préstamos desembolsados", value: disbursedLoans.length.toString(), subtitle: "Con cronograma generado", icon: <HandCoins size={28} />, color: "bg-violet-50 text-violet-600" },
      { title: "Monto total", value: formatCurrency(totalAmount), subtitle: "Valor de los préstamos registrados", icon: <CircleDollarSign size={28} />, color: "bg-amber-50 text-amber-600" },
    ];
  }, [loans]);

  async function getLoanWithAssociate(id) {
    const loan = await getLoanById(id);
    let associate = associates.find((currentAssociate) => currentAssociate.id === loan.associateId);
    if (!associate) associate = await associateService.getById(loan.associateId);
    return mapLoan(loan, new Map([[associate.id, getAssociateName(associate)]]));
  }

  function openCreateModal() {
    reset({ amount: "", interestRate: "", termMonths: "" });
    setSelectedAssociate(null);
    setAssociateError("");
    setIsCreateOpen(true);
  }

  function closeCreateModal() {
    reset();
    setSelectedAssociate(null);
    setAssociateError("");
    setIsCreateOpen(false);
  }

  async function handleView(id) {
    try {
      setDetailLoan(await getLoanWithAssociate(id));
    } catch (error) {
      console.error("Error consultando préstamo:", error);
      notifyError(getErrorMessage(error, "No fue posible consultar el préstamo."));
    }
  }

  async function handleInstallments(id) {
    try {
      const [loan, schedule] = await Promise.all([getLoanWithAssociate(id), getLoanInstallments(id)]);
      setInstallmentsLoan(loan);
      setInstallments(schedule);
    } catch (error) {
      console.error("Error consultando cuotas:", error);
      notifyError(getErrorMessage(error, "No fue posible consultar las cuotas del préstamo."));
    }
  }

  async function openPaymentModal(id) {
    try {
        const [loan, schedule] = await Promise.all([
            getLoanWithAssociate(id),
            getLoanInstallments(id),
        ]);

        const pendingInstallments = schedule.filter(
            (installment) => installment.status === "PENDING"
        );

        if (pendingInstallments.length === 0) {
            notifyError("El préstamo no tiene saldo pendiente.");
            return;
        }

        const nextInstallment = pendingInstallments[0];

        // Tomamos el mayor saldo pendiente disponible en el cronograma.
        const remainingBalance = Math.max(
            ...pendingInstallments.map(
                (installment) => Number(installment.remainingBalance || 0)
            )
        );

        setPaymentLoan({
            ...loan,
            pendingInstallments,
            remainingBalance,
            nextInstallmentAmount: Number(
                nextInstallment.totalPayment || 0
            ),
        });

        // Por defecto propone el valor de la siguiente cuota,
        // pero el usuario puede modificarlo.
        setPaymentAmount(
            String(Number(nextInstallment.totalPayment || 0))
        );
    } catch (error) {
        console.error("Error preparando el pago:", error);

        notifyError(
            getErrorMessage(
                error,
                "No fue posible consultar el saldo pendiente del préstamo."
            )
        );
    }
}

  async function prepareLoanAction(id, type) {
    try {
      setActionLoan(await getLoanWithAssociate(id));
      setActionType(type);
    } catch (error) {
      console.error("Error consultando préstamo:", error);
      notifyError(getErrorMessage(error, "No fue posible consultar el préstamo."));
    }
  }

  async function submitLoanAction() {
    if (!actionLoan) return;
    const actions = { approve: approveLoan, reject: rejectLoan, disburse: disburseLoan };
    const messages = { approve: "Préstamo aprobado correctamente.", reject: "Préstamo rechazado correctamente.", disburse: "Préstamo desembolsado correctamente." };
    try {
      setIsActionSubmitting(true);
      await actions[actionType](actionLoan.id);
      setActionLoan(null);
      setActionType("");
      notifySuccess(messages[actionType]);
      await loadLoans();
    } catch (error) {
      if (actionType === "approve") {
        console.error("Error aprobando préstamo:", error);
        console.error("Estado HTTP:", error.response?.status);
        console.error("Respuesta del backend:", error.response?.data);
        console.error("Mensaje del error:", error.message);
      } else {
        console.error("Error actualizando préstamo:", error);
      }
      notifyError(getErrorMessage(error, "No fue posible actualizar el préstamo."));
    } finally {
      setIsActionSubmitting(false);
    }
  }

  async function submitPayment(event) {
    event.preventDefault();

    if (!paymentLoan) return;

    const amount = Number(paymentAmount);
    const remainingBalance = Number(
        paymentLoan.remainingBalance || 0
    );

    if (!Number.isFinite(amount) || amount <= 0) {
        notifyError("Ingresa un valor de pago válido.");
        return;
    }

    if (amount > remainingBalance) {
        notifyError(
            `El pago no puede ser superior al saldo pendiente de ${formatCurrency(
                remainingBalance
            )}.`
        );
        return;
    }

    try {
        await payLoanInstallment(paymentLoan.id, {
            amount,
        });

        setPaymentLoan(null);
        setPaymentAmount("");

        notifySuccess(
            amount === remainingBalance
                ? "Préstamo pagado completamente."
                : "Pago registrado correctamente."
        );

        await loadLoans();
    } catch (error) {
        console.error("Error registrando pago:", error);
        console.error("Estado HTTP:", error.response?.status);
        console.error("Respuesta del backend:", error.response?.data);

        notifyError(
            getErrorMessage(
                error,
                "No fue posible registrar el pago."
            )
        );
    }
}

  async function onSubmit({ amount, interestRate, termMonths }) {
    if (!selectedAssociate) {
      setAssociateError("Selecciona un asociado para continuar.");
      return;
    }
    try {
      await createLoan({ associateId: selectedAssociate.id, amount: Number(amount), interestRate: Number(interestRate), termMonths: Number(termMonths) });
      closeCreateModal();
      notifySuccess("Préstamo solicitado correctamente.");
      await loadLoans();
    } catch (error) {
      console.error("Error creando préstamo:", error);
      notifyError(getErrorMessage(error, "No fue posible crear el préstamo."));
    }
  }

  function getOptions(loan) {
    const options = [{ label: "Ver cuotas", onClick: () => handleInstallments(loan.id) }];
    if (loan.status === "PENDING") {
      options.push({ label: "Aprobar préstamo", onClick: () => prepareLoanAction(loan.id, "approve") });
      options.push({ label: "Rechazar préstamo", onClick: () => prepareLoanAction(loan.id, "reject") });
    }
    if (loan.status === "APPROVED") options.push({ label: "Desembolsar préstamo", onClick: () => prepareLoanAction(loan.id, "disburse") });
    if (loan.status === "DISBURSED") options.push({ label: "Registrar pago", onClick: () => openPaymentModal(loan.id) });
    return options;
  }

  return <>
    <PageContainer>
      <PageHeader eyebrow="Gestión de préstamos" title="Préstamos" subtitle="Gestiona las solicitudes, aprobaciones y desembolsos de préstamos." action={<Button onClick={openCreateModal}><Plus size={18} strokeWidth={2.5} />Nuevo préstamo</Button>} />
      <SummaryCards items={summaryCards} />
      <section className="grid gap-5 xl:grid-cols-3">
        <DataSection className="p-6 xl:col-span-2" description="El backend no expone histórico de cartera para construir una gráfica sin datos ficticios." title="Estado de la cartera"><EmptyState icon={<CircleDollarSign size={24} />} title="Histórico no disponible" description="Los indicadores se calculan con los préstamos registrados actualmente." /></DataSection>
        <Card className="p-6"><div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-extrabold tracking-tight text-slate-900">Atención requerida</h2><p className="mt-1 text-sm font-medium text-slate-500">Estados reales del portafolio.</p></div><div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600"><BanknoteArrowDown size={21} /></div></div><div className="mt-6 divide-y divide-slate-100"><Metric label="Solicitudes pendientes" value={loans.filter((loan) => loan.status === "PENDING").length} variant="warning" /><Metric label="Préstamos aprobados" value={loans.filter((loan) => loan.status === "APPROVED").length} variant="success" /><Metric label="Préstamos desembolsados" value={loans.filter((loan) => loan.status === "DISBURSED").length} variant="neutral" /></div></Card>
      </section>
      <FilterBar filters={loanFilters} gridClassName="xl:grid-cols-[minmax(0,1.8fr)_minmax(10rem,0.65fr)_auto]" idPrefix="loans" onChange={(_, value) => setStatusFilter(value)} onReset={() => { setSearch(""); setStatusFilter("Todos"); }} onSearchChange={setSearch} searchAriaLabel="Buscar préstamo" searchLabel="Buscar préstamo" searchPlaceholder="Número o asociado" searchValue={search} values={{ status: statusFilter }} />
      <DataSection className="overflow-hidden p-0" description={`${loans.length} préstamos registrados.`} headerClassName="border-b border-slate-200 px-6 py-5" title="Listado de préstamos">
        {isLoading ? <Loader label="Cargando préstamos..." /> : loadError ? <EmptyState icon={<HandCoins size={24} />} title="No fue posible cargar los préstamos" description={loadError} action={<Button onClick={loadLoans}>Reintentar</Button>} /> : loans.length === 0 ? <EmptyState icon={<HandCoins size={24} />} title="No hay préstamos registrados." description="Cuando registres un préstamo, su información aparecerá en este listado." action={<Button onClick={openCreateModal}><Plus size={18} strokeWidth={2.5} />Nuevo préstamo</Button>} /> : filteredLoans.length === 0 ? <EmptyState icon={<HandCoins size={24} />} title="No hay préstamos para mostrar" description="Ajusta los filtros para ver los préstamos registrados." /> : <Table className="min-w-300"><thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4">Número</th><th className="px-6 py-4">Asociado</th><th className="px-6 py-4">Monto</th><th className="px-6 py-4">Tasa</th><th className="px-6 py-4">Plazo</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4">Fecha solicitud</th><th className="px-6 py-4 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-slate-200">{filteredLoans.map((loan) => <tr className="transition hover:bg-slate-50/70" key={loan.id}><td className="px-6 py-4 text-sm font-extrabold text-slate-800">{loan.number}</td><td className="px-6 py-4 text-sm font-bold text-slate-800">{loan.associate}</td><td className="px-6 py-4 text-sm font-extrabold text-slate-800">{formatCurrency(loan.amount)}</td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{loan.interestRate}</td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{`${loan.termMonths} meses`}</td><td className="px-6 py-4"><Badge variant={statusVariant[loan.statusLabel] || "neutral"}>{loan.statusLabel}</Badge></td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{formatDate(loan.requestedAt)}</td><td className="px-6 py-4"><ActionMenu label={loan.number} onEdit={() => setIsEditUnavailableOpen(true)} onView={() => handleView(loan.id)} options={getOptions(loan)} /></td></tr>)}</tbody></Table>}
      </DataSection>
    </PageContainer>

    <Modal isOpen={isCreateOpen} onClose={closeCreateModal} size="lg" title="Nuevo préstamo"><form className="space-y-5" onSubmit={handleSubmit(onSubmit)}><AssociateSearch associates={associates} onClear={() => { setSelectedAssociate(null); setAssociateError(""); }} onSelect={(associate) => { setSelectedAssociate(associate); setAssociateError(""); }} selectedAssociate={selectedAssociate} />{associateError && <p className="text-sm font-semibold text-rose-600">{associateError}</p>}<div className="grid gap-4 md:grid-cols-3"><Field label="Monto" error={errors.amount?.message}><Input {...register("amount", { required: "El monto es obligatorio", min: { value: 1, message: "Ingresa un valor mayor a cero" } })} min="1" type="number" /></Field><Field label="Tasa de interés" error={errors.interestRate?.message}><Input {...register("interestRate", { required: "La tasa es obligatoria", min: { value: 0.01, message: "La tasa debe ser mayor a cero" } })} min="0.01" step="0.01" type="number" /></Field><Field label="Plazo (meses)" error={errors.termMonths?.message}><Input {...register("termMonths", { required: "El plazo es obligatorio", min: { value: 1, message: "El plazo debe ser mayor a cero" } })} min="1" type="number" /></Field></div><p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">El número, estado y fecha de solicitud son generados por el backend.</p><div className="flex justify-end gap-3 border-t border-slate-200 pt-4"><Button onClick={closeCreateModal} type="button" variant="secondary">Cancelar</Button><Button disabled={isSubmitting} type="submit">{isSubmitting ? "Guardando..." : "Guardar solicitud"}</Button></div></form></Modal>

    <Modal isOpen={Boolean(detailLoan)} onClose={() => setDetailLoan(null)} size="lg" title={`Préstamo ${detailLoan?.number ?? ""}`}>{detailLoan && <div className="space-y-5"><div className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><div><p className="text-sm font-bold text-slate-500">Asociado</p><p className="mt-1 text-base font-extrabold text-slate-900">{detailLoan.associate}</p></div><Badge variant={statusVariant[detailLoan.statusLabel] || "neutral"}>{detailLoan.statusLabel}</Badge></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><DetailItem label="Número de préstamo" value={detailLoan.number} /><DetailItem label="ID del asociado" value={detailLoan.associateId} /><DetailItem label="Monto" value={formatCurrency(detailLoan.amount)} /><DetailItem label="Tasa de interés" value={detailLoan.interestRate} /><DetailItem label="Plazo" value={`${detailLoan.termMonths} meses`} /><DetailItem label="Fecha de solicitud" value={formatDate(detailLoan.requestedAt)} /><DetailItem label="Fecha de aprobación" value={formatDate(detailLoan.approvedAt)} /></div><div className="flex justify-end border-t border-slate-200 pt-4"><Button onClick={() => setDetailLoan(null)} variant="secondary">Cerrar</Button></div></div>}</Modal>

    <Modal isOpen={Boolean(installmentsLoan)} onClose={() => { setInstallmentsLoan(null); setInstallments([]); }} size="lg" title={`Cuotas ${installmentsLoan?.number ?? ""}`}>{installmentsLoan && (installments.length === 0 ? <EmptyState icon={<HandCoins size={24} />} title="No hay cuotas registradas" description="El cronograma se genera automáticamente al desembolsar el préstamo." /> : <Table className="min-w-250"><thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Cuota</th><th className="px-4 py-3">Vencimiento</th><th className="px-4 py-3">Capital</th><th className="px-4 py-3">Interés</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Saldo</th><th className="px-4 py-3">Estado</th></tr></thead><tbody className="divide-y divide-slate-200">{installments.map((installment) => <tr key={installment.installmentNumber}><td className="px-4 py-3">{installment.installmentNumber}</td><td className="px-4 py-3">{formatDate(installment.dueDate)}</td><td className="px-4 py-3">{formatCurrency(installment.principal)}</td><td className="px-4 py-3">{formatCurrency(installment.interest)}</td><td className="px-4 py-3">{formatCurrency(installment.totalPayment)}</td><td className="px-4 py-3">{formatCurrency(installment.remainingBalance)}</td><td className="px-4 py-3"><Badge variant={installment.status === "PAID" ? "success" : "warning"}>{installment.status === "PAID" ? "Pagada" : "Pendiente"}</Badge></td></tr>)}</tbody></Table>)}</Modal>

    <Modal
    isOpen={Boolean(paymentLoan)}
    onClose={() => {
        setPaymentLoan(null);
        setPaymentAmount("");
    }}
    size="sm"
    title={`Registrar pago ${paymentLoan?.number ?? ""}`}
>
    {paymentLoan && (
        <form className="space-y-5" onSubmit={submitPayment}>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="space-y-2 text-sm">

                    <p>
                        <span className="font-bold text-slate-500">
                            Asociado:
                        </span>{" "}
                        <span className="font-extrabold text-slate-800">
                            {paymentLoan.associate}
                        </span>
                    </p>

                    <p>
                        <span className="font-bold text-slate-500">
                            Préstamo:
                        </span>{" "}
                        <span className="font-extrabold text-slate-800">
                            {paymentLoan.number}
                        </span>
                    </p>

                    <p>
                        <span className="font-bold text-slate-500">
                            Saldo pendiente:
                        </span>{" "}
                        <span className="font-extrabold text-emerald-600">
                            {formatCurrency(
                                paymentLoan.remainingBalance
                            )}
                        </span>
                    </p>

                    <p>
                        <span className="font-bold text-slate-500">
                            Próxima cuota:
                        </span>{" "}
                        <span className="font-extrabold text-slate-800">
                            {formatCurrency(
                                paymentLoan.nextInstallmentAmount
                            )}
                        </span>
                    </p>

                </div>
            </div>

            <Field label="Valor a pagar">
                <Input
                    min="0.01"
                    max={paymentLoan.remainingBalance}
                    onChange={(event) =>
                        setPaymentAmount(event.target.value)
                    }
                    required
                    step="0.01"
                    type="number"
                    value={paymentAmount}
                />
            </Field>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-700">
                    Puedes pagar una cuota, realizar un abono extraordinario
                    o cancelar completamente el saldo del préstamo.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">

                <Button
                    onClick={() =>
                        setPaymentAmount(
                            String(
                                paymentLoan.nextInstallmentAmount
                            )
                        )
                    }
                    type="button"
                    variant="secondary"
                >
                    Pagar cuota
                </Button>

                <Button
                    onClick={() =>
                        setPaymentAmount(
                            String(
                                paymentLoan.remainingBalance
                            )
                        )
                    }
                    type="button"
                >
                    Pagar todo
                </Button>

            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">

                <Button
                    onClick={() => {
                        setPaymentLoan(null);
                        setPaymentAmount("");
                    }}
                    type="button"
                    variant="secondary"
                >
                    Cancelar
                </Button>

                <Button type="submit">
                    Registrar pago
                </Button>

            </div>

        </form>
    )}
</Modal>

    <Modal isOpen={Boolean(actionLoan)} onClose={() => { if (!isActionSubmitting) { setActionLoan(null); setActionType(""); } }} size="sm" title="Confirmar acción">{actionLoan && <div className="space-y-5"><p className="text-sm font-medium text-slate-600">¿Confirmas {actionType === "approve" ? "la aprobación" : actionType === "reject" ? "el rechazo" : "el desembolso"} del préstamo <span className="font-extrabold text-slate-900">{actionLoan.number}</span>?</p>{actionType === "approve" && <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm"><p><span className="font-bold text-slate-500">Préstamo:</span> <span className="font-extrabold text-slate-800">{actionLoan.number}</span></p><p><span className="font-bold text-slate-500">Asociado:</span> <span className="font-extrabold text-slate-800">{actionLoan.associate}</span></p><p><span className="font-bold text-slate-500">Monto:</span> <span className="font-extrabold text-slate-800">{formatCurrency(actionLoan.amount)}</span></p></div>}<div className="flex justify-end gap-3 border-t border-slate-200 pt-4"><Button disabled={isActionSubmitting} onClick={() => { setActionLoan(null); setActionType(""); }} type="button" variant="secondary">Volver</Button><Button disabled={isActionSubmitting} onClick={submitLoanAction} type="button">{isActionSubmitting ? "Procesando..." : "Confirmar"}</Button></div></div>}</Modal>
    <Modal isOpen={isEditUnavailableOpen} onClose={() => setIsEditUnavailableOpen(false)} size="sm" title="Edición no disponible"><div className="space-y-4"><p className="text-sm font-semibold text-slate-600">La edición de préstamos todavía no está disponible en el backend.</p><div className="flex justify-end"><Button onClick={() => setIsEditUnavailableOpen(false)} type="button" variant="secondary">Cerrar</Button></div></div></Modal>
    <ToastProvider />
  </>;
}

function Metric({ label, value, variant }) {
  return <div className="flex items-center justify-between gap-4 py-3"><p className="text-sm font-semibold text-slate-600">{label}</p><Badge variant={variant}>{value}</Badge></div>;
}

function Field({ label, error, children }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>{children}{error && <p className="mt-1 text-sm font-semibold text-rose-600">{error}</p>}</label>;
}

function DetailItem({ label, value }) {
  return <div><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-1 text-sm font-extrabold text-slate-800">{value}</p></div>;
}
