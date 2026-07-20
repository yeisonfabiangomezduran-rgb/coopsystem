import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, Plus, ReceiptText } from "lucide-react";
import AssociateSearch from "../../components/ui/AssociateSearch";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataSection from "../../components/ui/DataSection";
import EmptyState from "../../components/ui/EmptyState";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import SummaryCards from "../../components/ui/SummaryCards";
import Table from "../../components/ui/Table";
import ToastProvider from "../../components/ui/ToastProvider";
import { notifySuccess } from "../../components/ui/toastNotifications";
import transactionTypes from "../../data/catalogs/transactionTypes";
import { initialAssociates } from "../../mock/associates";

const initialTransactions = [
  { number: "TRX-0019", date: "2026-07-20", time: "10:24 a. m.", type: "Pago de cuota", associateCode: "ASO-0019", associate: "Edgar Peñalosa Hernández", document: "1.019.243.765", account: "PRE-0042", amount: 850000, status: "Completada", user: "Laura Gómez", direction: "income" },
  { number: "TRX-0020", date: "2026-07-20", time: "09:48 a. m.", type: "Desembolso de préstamo", associateCode: "ASO-0020", associate: "María Camila Ulloa", document: "1.024.981.376", account: "AHO-0020", amount: 8000000, status: "Pendiente", user: "Carlos Ruiz", direction: "expense" },
  { number: "TRX-0021", date: "2026-07-20", time: "09:12 a. m.", type: "Consignación", associateCode: "ASO-0021", associate: "José Manuel Veltrán", document: "79.852.911", account: "AHO-0021", amount: 500000, status: "Completada", user: "Laura Gómez", direction: "income" },
  { number: "TRX-0022", date: "2026-07-19", time: "04:16 p. m.", type: "Retiro", associateCode: "ASO-0023", associate: "Liliana Rodríguez Mora", document: "52.184.067", account: "AHO-0023", amount: 275000, status: "Anulada", user: "Carlos Ruiz", direction: "expense" },
  { number: "TRX-0023", date: "2026-07-19", time: "11:02 a. m.", type: "Ajuste", associateCode: "ASO-0022", associate: "Comercializadora Andina S.A.S.", document: "901.625.184-7", account: "AHO-0022", amount: 1250000, status: "Completada", user: "Laura Gómez", direction: "income" },
];

const accountOptions = {
  "ASO-0019": ["AHO-0019", "PRE-0042"],
  "ASO-0020": ["AHO-0020", "PRE-0020"],
  "ASO-0021": ["AHO-0021", "PRE-0021"],
  "ASO-0022": ["AHO-0022", "PRE-0022"],
  "ASO-0023": ["AHO-0023", "PRE-0023"],
  "ASO-0024": ["AHO-0024", "PRE-0024"],
};

const statusVariant = { Completada: "success", Pendiente: "warning", Anulada: "neutral" };

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value).replace("COP", "$ ");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`)).replace(/\./g, "");
}

function getToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getTime() {
  return new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit" }).format(new Date());
}

function directionFor(type) {
  return ["Retiro", "Desembolso de préstamo"].includes(type) ? "expense" : "income";
}

function needsAssociate(type) {
  return type !== "Desembolso de préstamo";
}

function needsAccount(type) {
  return ["Consignación", "Retiro", "Desembolso de préstamo", "Ajuste"].includes(type);
}

function needsLoan(type) {
  return ["Pago de cuota", "Desembolso de préstamo"].includes(type);
}

export default function Transactions() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssociate, setSelectedAssociate] = useState(null);
  const [associateError, setAssociateError] = useState("");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [associateFilter, setAssociateFilter] = useState("Todos");
  const [nextNumber, setNextNumber] = useState(() => Math.max(...initialTransactions.map((transaction) => Number(transaction.number.slice(4)))) + 1);
  const { control, register, handleSubmit, reset, setValue, formState: { errors } } = useForm({ defaultValues: { type: "", account: "", loan: "", amount: "", observations: "" } });
  const selectedType = useWatch({ control, name: "type" });

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es-CO");
    return transactions.filter((transaction) => {
      const matchesSearch = !normalizedSearch || [transaction.number, transaction.document, transaction.associate].some((value) => value.toLocaleLowerCase("es-CO").includes(normalizedSearch));
      return matchesSearch
        && (!dateFilter || transaction.date === dateFilter)
        && (typeFilter === "Todos" || transaction.type === typeFilter)
        && (statusFilter === "Todos" || transaction.status === statusFilter)
        && (associateFilter === "Todos" || transaction.associateCode === associateFilter);
    });
  }, [associateFilter, dateFilter, search, statusFilter, transactions, typeFilter]);

  const summaryCards = useMemo(() => {
    const today = getToday();
    const todayTransactions = transactions.filter((transaction) => transaction.date === today && transaction.status === "Completada");
    const incomes = todayTransactions.filter((transaction) => transaction.direction === "income").reduce((total, transaction) => total + transaction.amount, 0);
    const expenses = todayTransactions.filter((transaction) => transaction.direction === "expense").reduce((total, transaction) => total + transaction.amount, 0);
    return [
      { title: "Total de transacciones", value: transactions.length.toString(), subtitle: "Movimientos registrados", icon: <ReceiptText size={28} />, color: "bg-blue-50 text-blue-600" },
      { title: "Ingresos del día", value: formatCurrency(incomes), subtitle: "Operaciones completadas hoy", icon: <ArrowUpRight size={28} />, color: "bg-emerald-50 text-emerald-600" },
      { title: "Egresos del día", value: formatCurrency(expenses), subtitle: "Operaciones completadas hoy", icon: <ArrowDownLeft size={28} />, color: "bg-violet-50 text-violet-600" },
      { title: "Saldo neto", value: formatCurrency(incomes - expenses), subtitle: "Resultado de la jornada", icon: <CircleDollarSign size={28} />, color: "bg-amber-50 text-amber-600" },
    ];
  }, [transactions]);

  function openCreateModal() {
    reset({ type: "", account: "", loan: "", amount: "", observations: "" });
    setSelectedAssociate(null);
    setAssociateError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    reset();
    setSelectedAssociate(null);
    setAssociateError("");
    setIsModalOpen(false);
  }

  function handleTypeChange(event) {
    setValue("type", event.target.value);
    setValue("account", "");
    setValue("loan", "");
    setAssociateError("");
    if (event.target.value === "Desembolso de préstamo") setSelectedAssociate(null);
  }

  function clearFilters() {
    setSearch("");
    setDateFilter("");
    setTypeFilter("Todos");
    setStatusFilter("Todos");
    setAssociateFilter("Todos");
  }

  function onSubmit(data) {
    const nowDate = getToday();
    const associate = selectedAssociate;
    if (needsAssociate(data.type) && !associate) {
      setAssociateError("Selecciona un asociado para registrar la transacción.");
      return;
    }
    const reference = data.loan || data.account || "Sin referencia";
    const transaction = {
      number: `TRX-${String(nextNumber).padStart(4, "0")}`,
      date: nowDate,
      time: getTime(),
      type: data.type,
      associateCode: associate?.code ?? "",
      associate: associate ? `${associate.firstName} ${associate.lastName}` : "No aplica",
      document: associate?.documentNumber ?? "No aplica",
      account: reference,
      amount: Number(data.amount || 0),
      status: "Completada",
      user: "Usuario actual",
      direction: directionFor(data.type),
      observations: data.observations?.trim() ?? "",
    };
    setTransactions((current) => [transaction, ...current]);
    setNextNumber((current) => current + 1);
    closeModal();
    notifySuccess("Transacción registrada correctamente.");
  }

  const availableAccounts = selectedAssociate ? accountOptions[selectedAssociate.code]?.filter((reference) => reference.startsWith("AHO")) ?? [] : [];
  const availableLoans = selectedAssociate ? accountOptions[selectedAssociate.code]?.filter((reference) => reference.startsWith("PRE")) ?? [] : ["PRE-0020", "PRE-0021", "PRE-0022", "PRE-0023", "PRE-0024"];
  const requiresAssociate = needsAssociate(selectedType);

  return (
    <>
      <PageContainer>
        <PageHeader action={<Button onClick={openCreateModal}><Plus size={18} strokeWidth={2.5} />Nueva transacción</Button>} eyebrow="Gestión de transacciones" subtitle="Registra, consulta y controla los movimientos financieros de la cooperativa." title="Transacciones" />
        <SummaryCards items={summaryCards} />

        <DataSection className="p-5 sm:p-6" title="Filtros">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_minmax(10rem,.8fr)_minmax(10rem,.8fr)_minmax(10rem,.8fr)_minmax(12rem,.9fr)_auto] xl:items-end">
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Buscar transacción</span><Input aria-label="Buscar por número, documento o nombre" onChange={(event) => setSearch(event.target.value)} placeholder="Número, documento o nombre" value={search} /></label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Fecha</span><Input aria-label="Filtrar por fecha" onChange={(event) => setDateFilter(event.target.value)} type="date" value={dateFilter} /></label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Tipo</span><select className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" onChange={(event) => setTypeFilter(event.target.value)} value={typeFilter}><option>Todos</option>{transactionTypes.map((type) => <option key={type.value}>{type.label}</option>)}</select></label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Estado</span><select className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option>Todos</option><option>Completada</option><option>Pendiente</option><option>Anulada</option></select></label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Asociado</span><select className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" onChange={(event) => setAssociateFilter(event.target.value)} value={associateFilter}><option value="Todos">Todos</option>{initialAssociates.map((associate) => <option key={associate.code} value={associate.code}>{`${associate.firstName} ${associate.lastName}`}</option>)}</select></label>
            <Button className="w-full xl:w-auto" onClick={clearFilters} variant="secondary">Limpiar filtros</Button>
          </div>
        </DataSection>

        <DataSection className="overflow-hidden p-0" description={`${filteredTransactions.length} transacciones encontradas.`} headerClassName="border-b border-slate-200 px-6 py-5" title="Historial de movimientos">
          {filteredTransactions.length === 0 ? <EmptyState action={<Button onClick={openCreateModal}><Plus size={18} strokeWidth={2.5} />Nueva transacción</Button>} description="Ajusta los filtros o registra una nueva operación." icon={<ReceiptText size={24} />} title="No hay transacciones para mostrar" /> : (
            <Table className="min-w-[1100px]"><thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4">Número</th><th className="px-6 py-4">Fecha y hora</th><th className="px-6 py-4">Tipo</th><th className="px-6 py-4">Asociado</th><th className="px-6 py-4">Cuenta</th><th className="px-6 py-4">Valor</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4">Usuario</th></tr></thead><tbody className="divide-y divide-slate-200">{filteredTransactions.map((transaction) => <tr className="transition hover:bg-slate-50/70" key={transaction.number}><td className="px-6 py-4 text-sm font-extrabold text-slate-800">{transaction.number}</td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{`${formatDate(transaction.date)} · ${transaction.time}`}</td><td className="px-6 py-4 text-sm font-bold text-slate-800">{transaction.type}</td><td className="px-6 py-4 text-sm font-bold text-slate-800">{transaction.associate}</td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{transaction.account}</td><td className="px-6 py-4 text-sm font-extrabold text-slate-800">{formatCurrency(transaction.amount)}</td><td className="px-6 py-4"><Badge variant={statusVariant[transaction.status]}>{transaction.status}</Badge></td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{transaction.user}</td></tr>)}</tbody></Table>
          )}
        </DataSection>
      </PageContainer>

      <Modal isOpen={isModalOpen} onClose={closeModal} size="lg" title="Nueva transacción">
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Tipo de transacción</span><select aria-invalid={errors.type ? "true" : "false"} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" onChange={handleTypeChange} value={selectedType}><option value="">Selecciona un tipo</option>{transactionTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select>{errors.type && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.type.message}</p>}<input type="hidden" {...register("type", { required: "Selecciona el tipo de transacción" })} /></label>

          {selectedType && <>
            {requiresAssociate && <AssociateSearch associates={initialAssociates} onClear={() => { setSelectedAssociate(null); setValue("account", ""); setValue("loan", ""); }} onSelect={(associate) => { setSelectedAssociate(associate); setAssociateError(""); }} searchInputId="transaction-associate-search" selectedAssociate={selectedAssociate} />}
            {requiresAssociate && !selectedAssociate && <p className="text-sm font-semibold text-rose-600">{associateError || "Selecciona un asociado para continuar."}</p>}
            <div className="grid gap-4 md:grid-cols-2">
              {needsAccount(selectedType) && <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">{selectedType === "Desembolso de préstamo" ? "Cuenta destino" : "Cuenta"}</span><select {...register("account", { required: "Selecciona la cuenta" })} aria-invalid={errors.account ? "true" : "false"} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" disabled={requiresAssociate && !selectedAssociate}><option value="">Selecciona una cuenta</option>{availableAccounts.map((account) => <option key={account}>{account}</option>)}</select>{errors.account && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.account.message}</p>}</label>}
              {needsLoan(selectedType) && <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Préstamo</span><select {...register("loan", { required: "Selecciona el préstamo" })} aria-invalid={errors.loan ? "true" : "false"} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" disabled={selectedType === "Pago de cuota" && !selectedAssociate}><option value="">Selecciona un préstamo</option>{availableLoans.map((loan) => <option key={loan}>{loan}</option>)}</select>{errors.loan && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.loan.message}</p>}</label>}
              {selectedType !== "Desembolso de préstamo" && <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Valor</span><Input {...register("amount", { required: "Ingresa el valor", min: { value: 1, message: "El valor debe ser mayor a cero" } })} aria-invalid={errors.amount ? "true" : "false"} min="1" placeholder="0" type="number" />{errors.amount && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.amount.message}</p>}</label>}
            </div>
            {["Consignación", "Retiro", "Ajuste"].includes(selectedType) && <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Observaciones</span><textarea {...register("observations")} className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="Registra las observaciones de la operación" /></label>}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-extrabold text-slate-900">Resumen de la operación</p><div className="mt-3 grid gap-2 text-sm font-semibold text-slate-600 sm:grid-cols-2"><p>Tipo: <span className="text-slate-800">{selectedType}</span></p><p>Estado: <span className="text-slate-800">Completada</span></p><p>Número: <span className="text-slate-800">{`TRX-${String(nextNumber).padStart(4, "0")}`}</span></p><p>Fecha y hora: <span className="text-slate-800">{`${formatDate(getToday())} · ${getTime()}`}</span></p><p>Usuario: <span className="text-slate-800">Usuario actual</span></p></div></div>
          </>}
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4"><Button onClick={closeModal} type="button" variant="secondary">Cancelar</Button><Button type="submit">Guardar transacción</Button></div>
        </form>
      </Modal>
      <ToastProvider />
    </>
  );
}
