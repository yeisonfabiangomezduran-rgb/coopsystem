import { lazy, Suspense, useMemo, useState } from "react";
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
import { notifySuccess } from "../../components/ui/toastNotifications";
import { initialAssociates } from "../../mock/associates";

const LoanChart = lazy(() => import("../dashboard/LoanChart"));

const portfolioTrend = [
  { mes: "Ene", cartera: 680 }, { mes: "Feb", cartera: 720 }, { mes: "Mar", cartera: 755 }, { mes: "Abr", cartera: 790 }, { mes: "May", cartera: 835 }, { mes: "Jun", cartera: 880 },
];

const initialLoans = [
  { number: "PRE-0019", associate: "Edgar Peñalosa Hernández", product: "Crédito libre inversión", amount: 8000000, term: 24, status: "En estudio", requestedAt: "02 may. 2026" },
  { number: "PRE-0020", associate: "María Camila Ulloa", product: "Crédito educativo", amount: 12500000, term: 36, status: "Aprobado", requestedAt: "30 abr. 2026" },
  { number: "PRE-0021", associate: "José Manuel Veltrán", product: "Crédito de consumo", amount: 5200000, term: 18, status: "Pendiente", requestedAt: "28 abr. 2026" },
  { number: "PRE-0022", associate: "Comercializadora Andina S.A.S.", product: "Crédito empresarial", amount: 42000000, term: 48, status: "Desembolsado", requestedAt: "26 abr. 2026" },
  { number: "PRE-0023", associate: "Liliana Rodríguez Mora", product: "Crédito libre inversión", amount: 3800000, term: 12, status: "Rechazado", requestedAt: "19 abr. 2026" },
];

const creditLines = [
  { name: "Crédito de consumo", annualRate: 20 },
  { name: "Crédito educativo", annualRate: 12 },
  { name: "Crédito libre inversión", annualRate: 18 },
  { name: "Crédito empresarial", annualRate: 16 },
];

const associateSummaries = {
  1: { totalSavings: 2500000, activeLoans: 1, pendingBalance: 3400000 },
  2: { totalSavings: 8750000, activeLoans: 0, pendingBalance: 0 },
  3: { totalSavings: 1250000, activeLoans: 1, pendingBalance: 1800000 },
  4: { totalSavings: 14200000, activeLoans: 2, pendingBalance: 24200000 },
  5: { totalSavings: 680000, activeLoans: 0, pendingBalance: 0 },
};

const loanFilters = [
  { id: "status", label: "Estado", ariaLabel: "Filtrar por estado", options: ["Todos", "Pendiente", "Pendiente de aprobación", "En estudio", "Aprobado", "Desembolsado", "Rechazado"] },
  { id: "type", label: "Tipo de préstamo", ariaLabel: "Filtrar por tipo de préstamo", options: ["Todos", ...creditLines.map((line) => line.name)] },
  { id: "advisor", label: "Asesor", ariaLabel: "Filtrar por asesor", options: ["Todos", "Carlos Ramírez", "Laura Gómez", "Andrés Torres"] },
];

const statusVariant = { Pendiente: "warning", "Pendiente de aprobación": "warning", "En estudio": "neutral", Aprobado: "success", Desembolsado: "success", Rechazado: "neutral" };

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value).replace("COP", "$ ");
}

function formatDate(date) {
  return new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" }).format(date).replace(/\./g, "");
}

function getAssociateSummary(associate) {
  return associateSummaries[associate.id] ?? {
    totalSavings: 1000000 + associate.id * 600000,
    activeLoans: associate.id % 3,
    pendingBalance: (associate.id % 3) * 2200000,
  };
}

function calculateLoan(creditLine, requestedAmount, term) {
  const amount = Number(requestedAmount);
  const months = Number(term);
  if (!creditLine || !Number.isFinite(amount) || amount <= 0 || !Number.isInteger(months) || months <= 0) return null;

  const monthlyRate = (1 + creditLine.annualRate / 100) ** (1 / 12) - 1;
  const monthlyInstallment = amount * (monthlyRate * (1 + monthlyRate) ** months) / ((1 + monthlyRate) ** months - 1);
  const totalPayment = monthlyInstallment * months;
  const firstPaymentDate = new Date();
  firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);

  return {
    annualRate: creditLine.annualRate,
    monthlyInstallment,
    totalInterest: totalPayment - amount,
    totalPayment,
    firstPaymentDate: formatDate(firstPaymentDate),
  };
}

export default function Loans() {
  const [loans, setLoans] = useState(initialLoans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssociate, setSelectedAssociate] = useState(null);
  const [associateError, setAssociateError] = useState("");
  const [creditLineName, setCreditLineName] = useState("");
  const [requestedAmount, setRequestedAmount] = useState("");
  const [term, setTerm] = useState("");
  const [nextNumber, setNextNumber] = useState(() => Math.max(...initialLoans.map((loan) => Number(loan.number.split("-")[1])), 0) + 1);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { creditLine: "", requestedAmount: "", term: "", destination: "", observations: "" } });

  const selectedCreditLine = creditLines.find((line) => line.name === creditLineName);
  const loanCalculation = useMemo(() => calculateLoan(selectedCreditLine, requestedAmount, term), [requestedAmount, term, selectedCreditLine]);
  const selectedAssociateSummary = selectedAssociate ? getAssociateSummary(selectedAssociate) : null;

  const summaryCards = useMemo(() => {
    const activeLoans = loans.filter((loan) => loan.status !== "Rechazado");
    const approvedLoans = loans.filter((loan) => loan.status === "Aprobado");
    const requestedPortfolio = activeLoans.reduce((total, loan) => total + loan.amount, 0);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthLoans = loans.filter((loan) => {
      const date = new Date(loan.requestedAt.replace(/\./g, ""));
      return Number.isNaN(date.getTime()) || (date.getMonth() === currentMonth && date.getFullYear() === currentYear);
    }).length;

    return [
      { title: "Solicitudes activas", value: activeLoans.length.toString(), subtitle: "En gestión de crédito", icon: <Timer size={28} />, color: "bg-blue-50 text-blue-600" },
      { title: "Préstamos aprobados", value: approvedLoans.length.toString(), subtitle: "Operaciones aprobadas", icon: <FileCheck2 size={28} />, color: "bg-emerald-50 text-emerald-600" },
      { title: "Cartera solicitada", value: formatCurrency(requestedPortfolio), subtitle: "Valor en solicitudes activas", icon: <CircleDollarSign size={28} />, color: "bg-violet-50 text-violet-600" },
      { title: "Solicitudes este mes", value: currentMonthLoans.toString(), subtitle: "Registradas recientemente", icon: <BanknoteArrowDown size={28} />, color: "bg-amber-50 text-amber-600" },
    ];
  }, [loans]);

  function openCreateModal() {
    reset({ creditLine: "", requestedAmount: "", term: "", destination: "", observations: "" });
    setSelectedAssociate(null);
    setAssociateError("");
    setCreditLineName("");
    setRequestedAmount("");
    setTerm("");
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    reset();
    setSelectedAssociate(null);
    setAssociateError("");
    setCreditLineName("");
    setRequestedAmount("");
    setTerm("");
    setIsModalOpen(false);
  }

  function onSubmit(data) {
    if (!selectedAssociate) {
      setAssociateError("Selecciona un asociado para continuar.");
      return;
    }
    if (!loanCalculation) return;

    const loan = {
      number: `PRE-${String(nextNumber).padStart(4, "0")}`,
      associate: `${selectedAssociate.firstName} ${selectedAssociate.lastName}`,
      product: data.creditLine,
      amount: Number(data.requestedAmount),
      term: Number(data.term),
      status: "Pendiente",
      requestedAt: formatDate(new Date()),
      destination: data.destination.trim(),
      observations: data.observations.trim(),
      ...loanCalculation,
    };

    setLoans((current) => [loan, ...current]);
    setNextNumber((current) => current + 1);
    handleCloseModal();
    notifySuccess("Solicitud de préstamo creada correctamente.");
  }

  return (
    <>
      <PageContainer>
        <PageHeader eyebrow="Gestión de préstamos" title="Préstamos" subtitle="Gestiona las solicitudes, aprobaciones y desembolsos de préstamos." action={<Button onClick={openCreateModal}><Plus size={18} strokeWidth={2.5} />Nuevo préstamo</Button>} />
        <SummaryCards items={summaryCards} />

        <section className="grid gap-5 xl:grid-cols-3">
          <DataSection className="p-6 xl:col-span-2" description="Evolución de la cartera vigente durante los últimos seis meses." headerClassName="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between" title="Estado de la cartera" titleClassName="text-lg font-extrabold tracking-tight text-slate-900" action={<div className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">+$200 M acumulados</div>}><div className="mt-5"><Suspense fallback={<Loader label="Cargando evolución..." />}><LoanChart data={portfolioTrend} dataKey="cartera" gradientId="portfolio-volume" label="Cartera vigente" valueSuffix="millones" /></Suspense></div></DataSection>
          <Card className="p-6"><div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-extrabold tracking-tight text-slate-900">Atención requerida</h2><p className="mt-1 text-sm font-medium text-slate-500">Tareas pendientes de gestión.</p></div><div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600"><HandCoins size={21} /></div></div><div className="mt-6 divide-y divide-slate-100"><div className="flex items-center justify-between gap-4 py-3 pt-0"><p className="text-sm font-semibold text-slate-600">Solicitudes pendientes</p><Badge variant="warning">{loans.filter((loan) => loan.status === "Pendiente de aprobación" || loan.status === "Pendiente").length}</Badge></div><div className="flex items-center justify-between gap-4 py-3"><p className="text-sm font-semibold text-slate-600">Documentos por validar</p><Badge variant="warning">5</Badge></div><div className="flex items-center justify-between gap-4 py-3"><p className="text-sm font-semibold text-slate-600">Desembolsos programados</p><Badge variant="neutral">{loans.filter((loan) => loan.status === "Aprobado").length}</Badge></div><div className="flex items-center justify-between gap-4 py-3 pb-0"><p className="text-sm font-semibold text-slate-600">Cuotas vencidas</p><Badge variant="warning">2</Badge></div></div></Card>
        </section>

        <FilterBar filters={loanFilters} gridClassName="xl:grid-cols-[minmax(0,1.8fr)_minmax(10rem,0.65fr)_minmax(12rem,0.8fr)_minmax(10rem,0.7fr)_auto]" idPrefix="loans" searchAriaLabel="Buscar préstamo" searchLabel="Buscar préstamo" searchPlaceholder="Número o nombre del asociado" />
        <DataSection className="overflow-hidden p-0" description={`${loans.length} préstamos registrados.`} headerClassName="border-b border-slate-200 px-6 py-5" title="Listado de préstamos">
          {loans.length === 0 ? <EmptyState icon={<HandCoins size={24} />} title="Aún no hay préstamos registrados" description="Cuando registres un préstamo, su información aparecerá en este listado." action={<Button onClick={openCreateModal}><Plus size={18} strokeWidth={2.5} />Nuevo préstamo</Button>} /> : (
            <Table className="min-w-300"><thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4">Número</th><th className="px-6 py-4">Asociado</th><th className="px-6 py-4">Producto</th><th className="px-6 py-4">Monto</th><th className="px-6 py-4">Plazo</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4">Fecha solicitud</th><th className="px-6 py-4 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-slate-200">{loans.map((loan) => <tr className="transition hover:bg-slate-50/70" key={loan.number}><td className="px-6 py-4 text-sm font-extrabold text-slate-800">{loan.number}</td><td className="px-6 py-4 text-sm font-bold text-slate-800">{loan.associate}</td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{loan.product}</td><td className="px-6 py-4 text-sm font-extrabold text-slate-800">{formatCurrency(loan.amount)}</td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{`${loan.term} meses`}</td><td className="px-6 py-4"><Badge variant={statusVariant[loan.status]}>{loan.status}</Badge></td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{loan.requestedAt}</td><td className="px-6 py-4"><ActionMenu label={loan.number} /></td></tr>)}</tbody></Table>
          )}
        </DataSection>
      </PageContainer>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="lg" title="Nuevo préstamo">
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <AssociateSearch associates={initialAssociates} onClear={() => { setSelectedAssociate(null); setAssociateError(""); }} onSelect={(associate) => { setSelectedAssociate(associate); setAssociateError(""); }} selectedAssociate={selectedAssociate} selectedSummary={selectedAssociateSummary} />
          {associateError && <p className="text-sm font-semibold text-rose-600">{associateError}</p>}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Línea de crédito</span><select {...register("creditLine", { required: "La línea de crédito es obligatoria", onChange: (event) => setCreditLineName(event.target.value) })} aria-invalid={errors.creditLine ? "true" : "false"} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"><option value="">Selecciona una línea</option>{creditLines.map((line) => <option key={line.name} value={line.name}>{line.name}</option>)}</select>{errors.creditLine && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.creditLine.message}</p>}</label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Valor solicitado</span><Input {...register("requestedAmount", { required: "El valor solicitado es obligatorio", min: { value: 1, message: "Ingresa un valor mayor a cero" }, onChange: (event) => setRequestedAmount(event.target.value) })} aria-invalid={errors.requestedAmount ? "true" : "false"} min="1" placeholder="0" type="number" />{errors.requestedAmount && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.requestedAmount.message}</p>}</label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Plazo</span><select {...register("term", { required: "El plazo es obligatorio", onChange: (event) => setTerm(event.target.value) })} aria-invalid={errors.term ? "true" : "false"} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"><option value="">Selecciona un plazo</option>{[6, 12, 18, 24, 36, 48, 60].map((months) => <option key={months} value={months}>{`${months} meses`}</option>)}</select>{errors.term && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.term.message}</p>}</label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Destino</span><Input {...register("destination")} placeholder="Destino del crédito" /></label>
          </div>
          <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Observaciones</span><textarea {...register("observations")} className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="Registra las observaciones de la solicitud" /></label>
          <div className="rounded-xl bg-slate-50 p-4"><div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-base font-extrabold text-slate-900">Resumen del préstamo</h3><p className="text-sm font-medium text-slate-500">Cálculo simulado según la línea y el plazo seleccionados.</p></div>{loanCalculation && <Badge variant="warning">Pendiente</Badge>}</div>{loanCalculation ? <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-xs font-bold text-slate-500">Número del préstamo</p><p className="mt-1 text-sm font-extrabold text-slate-800">{`PRE-${String(nextNumber).padStart(4, "0")}`}</p></div><div><p className="text-xs font-bold text-slate-500">Tasa de interés</p><p className="mt-1 text-sm font-extrabold text-slate-800">{`${loanCalculation.annualRate}% E.A.`}</p></div><div><p className="text-xs font-bold text-slate-500">Cuota mensual</p><p className="mt-1 text-sm font-extrabold text-slate-800">{formatCurrency(loanCalculation.monthlyInstallment)}</p></div><div><p className="text-xs font-bold text-slate-500">Total intereses</p><p className="mt-1 text-sm font-extrabold text-slate-800">{formatCurrency(loanCalculation.totalInterest)}</p></div><div><p className="text-xs font-bold text-slate-500">Total a pagar</p><p className="mt-1 text-sm font-extrabold text-slate-800">{formatCurrency(loanCalculation.totalPayment)}</p></div><div><p className="text-xs font-bold text-slate-500">Primer pago</p><p className="mt-1 text-sm font-extrabold text-slate-800">{loanCalculation.firstPaymentDate}</p></div><div><p className="text-xs font-bold text-slate-500">Estado inicial</p><div className="mt-1"><Badge variant="warning">Pendiente</Badge></div></div></div> : <p className="mt-4 text-sm font-semibold text-slate-500">Completa la línea de crédito, el valor y el plazo para ver el cálculo.</p>}</div>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4"><Button onClick={handleCloseModal} type="button" variant="secondary">Cancelar</Button><Button type="submit">Guardar solicitud</Button></div>
        </form>
      </Modal>

      <ToastProvider />
    </>
  );
}
