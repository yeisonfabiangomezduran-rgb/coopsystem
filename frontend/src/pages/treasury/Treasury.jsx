import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Banknote, Calculator, CheckCircle2, CircleAlert, Landmark, LockKeyhole, Plus, WalletCards } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import DataSection from "../../components/ui/DataSection";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import SummaryCards from "../../components/ui/SummaryCards";
import Table from "../../components/ui/Table";
import ToastProvider from "../../components/ui/ToastProvider";
import { notifySuccess } from "../../components/ui/toastNotifications";

const initialMovements = [
  { id: "CAJ-0019", date: "2026-07-20", time: "10:24 a. m.", type: "Ingreso", description: "Ajuste operativo autorizado", amount: 250000, user: "Ana Gómez", status: "Completado" },
  { id: "CAJ-0020", date: "2026-07-20", time: "09:48 a. m.", type: "Egreso", description: "Ajuste por fondo de caja menor", amount: 125000, user: "Carlos Ruiz", status: "Completado" },
  { id: "CAJ-0021", date: "2026-07-20", time: "08:00 a. m.", type: "Apertura", description: "Apertura de caja principal", amount: 1000000, user: "Ana Gómez", status: "Completado" },
];

const statusVariant = { Abierta: "success", Cerrada: "neutral", Completado: "success", Correcto: "success", "Diferencia encontrada": "warning" };

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value).replace("COP", "$ ");
}

function getDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getTime() {
  return new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit" }).format(new Date());
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`)).replace(/\./g, "");
}

export default function Treasury() {
  const [cash, setCash] = useState({ status: "Abierta", openedAt: "08:00 a. m.", closedAt: "—", responsible: "Ana Gómez", initialBalance: 1000000, currentBalance: 1125000 });
  const [movements, setMovements] = useState(initialMovements);
  const [modal, setModal] = useState(null);
  const [initialBalance, setInitialBalance] = useState("");
  const [countedBalance, setCountedBalance] = useState("");
  const [adjustment, setAdjustment] = useState({ type: "Ingreso", reason: "", amount: "", observations: "" });
  const [observations, setObservations] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [nextId, setNextId] = useState(22);

  const dayTotals = useMemo(() => movements.filter((movement) => movement.status === "Completado").reduce((totals, movement) => ({ income: totals.income + (movement.type === "Ingreso" ? movement.amount : 0), expense: totals.expense + (movement.type === "Egreso" ? movement.amount : 0) }), { income: 0, expense: 0 }), [movements]);
  const expectedBalance = cash.initialBalance + dayTotals.income - dayTotals.expense;
  const countedValue = Number(countedBalance || expectedBalance);
  const difference = countedValue - expectedBalance;

  function resetModal() {
    setModal(null);
    setInitialBalance("");
    setCountedBalance("");
    setAdjustment({ type: "Ingreso", reason: "", amount: "", observations: "" });
    setObservations("");
  }

  function appendMovement(type, description, amount, status = "Completado") {
    const movement = { id: `CAJ-${String(nextId).padStart(4, "0")}`, date: getDate(), time: getTime(), type, description, amount, user: "Usuario actual", status };
    setMovements((current) => [movement, ...current]);
    setNextId((current) => current + 1);
  }

  function saveOpen() {
    const amount = Number(initialBalance);
    if (!amount) return;
    setIsSaving(true);
    setTimeout(() => {
      setCash({ status: "Abierta", openedAt: getTime(), closedAt: "—", responsible: "Usuario actual", initialBalance: amount, currentBalance: amount });
      appendMovement("Apertura", "Apertura de caja principal", amount);
      setIsSaving(false);
      resetModal();
      notifySuccess("Caja abierta correctamente.");
    }, 250);
  }

  function saveClose() {
    setIsSaving(true);
    setTimeout(() => {
      setCash((current) => ({ ...current, status: "Cerrada", closedAt: getTime(), currentBalance: countedValue }));
      appendMovement("Cierre", "Cierre de caja principal", countedValue, difference === 0 ? "Completado" : "Diferencia encontrada");
      setIsSaving(false);
      resetModal();
      notifySuccess("Caja cerrada correctamente.");
    }, 250);
  }

  function saveAdjustment() {
    const amount = Number(adjustment.amount);
    if (!adjustment.reason.trim() || !amount) return;
    setIsSaving(true);
    setTimeout(() => {
      appendMovement(adjustment.type, `Ajuste: ${adjustment.reason.trim()}`, amount);
      setCash((current) => ({ ...current, currentBalance: current.currentBalance + (adjustment.type === "Ingreso" ? amount : -amount) }));
      setIsSaving(false);
      resetModal();
      notifySuccess("Ajuste de caja registrado correctamente.");
    }, 250);
  }

  function saveAudit() {
    appendMovement("Arqueo", "Arqueo de caja realizado", 0, difference === 0 ? "Correcto" : "Diferencia encontrada");
    resetModal();
    notifySuccess(difference === 0 ? "Arqueo correcto." : "Arqueo registrado con diferencia.");
  }

  const isOpen = cash.status === "Abierta";
  const summaryCards = [
    { title: "Caja", value: cash.status, subtitle: isOpen ? "Operación disponible" : "Pendiente de apertura", icon: <WalletCards size={28} />, color: isOpen ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600" },
    { title: "Efectivo disponible", value: formatCurrency(cash.currentBalance), subtitle: "Saldo actual de caja", icon: <Banknote size={28} />, color: "bg-blue-50 text-blue-600" },
    { title: "Ingresos del día", value: formatCurrency(dayTotals.income), subtitle: "Ajustes positivos completados", icon: <ArrowUpRight size={28} />, color: "bg-emerald-50 text-emerald-600" },
    { title: "Egresos del día", value: formatCurrency(dayTotals.expense), subtitle: "Ajustes negativos completados", icon: <ArrowDownRight size={28} />, color: "bg-violet-50 text-violet-600" },
  ];

  return <><PageContainer><PageHeader eyebrow="Administración de caja" subtitle="Controla la apertura, cierre, arqueos y ajustes de la caja de la cooperativa." title="Tesorería" /><SummaryCards items={summaryCards} />
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,.8fr)]"><DataSection action={<Badge variant={statusVariant[cash.status]}>{cash.status}</Badge>} className="p-6" description="Información operativa de la caja principal." headerClassName="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between" title="Estado de caja" titleClassName="text-lg font-extrabold tracking-tight text-slate-900"><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-bold text-slate-500">Hora apertura</p><p className="mt-1 text-sm font-extrabold text-slate-800">{cash.openedAt}</p></div><div className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-bold text-slate-500">Hora cierre</p><p className="mt-1 text-sm font-extrabold text-slate-800">{cash.closedAt}</p></div><div className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-bold text-slate-500">Responsable</p><p className="mt-1 text-sm font-extrabold text-slate-800">{cash.responsible}</p></div><div className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-bold text-slate-500">Saldo inicial</p><p className="mt-1 text-sm font-extrabold text-slate-800">{formatCurrency(cash.initialBalance)}</p></div><div className="rounded-xl border border-slate-200 p-4 sm:col-span-2"><p className="text-sm font-bold text-slate-500">Saldo actual</p><p className="mt-1 text-xl font-extrabold text-slate-900">{formatCurrency(cash.currentBalance)}</p></div></div></DataSection>
      <Card className="p-6"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><Landmark size={21} /></div><div><h2 className="text-lg font-extrabold tracking-tight text-slate-900">Acciones principales</h2><p className="mt-1 text-sm font-medium text-slate-500">Operaciones exclusivas de caja.</p></div></div><div className="mt-6 grid gap-2"><Button disabled={isOpen} onClick={() => setModal("open")} variant="secondary"><Plus size={17} />Abrir caja</Button><Button disabled={!isOpen} onClick={() => setModal("close")} variant="secondary"><LockKeyhole size={17} />Cerrar caja</Button><Button disabled={!isOpen} onClick={() => { setCountedBalance(""); setModal("audit"); }} variant="secondary"><Calculator size={17} />Realizar arqueo</Button><Button disabled={!isOpen} onClick={() => setModal("adjustment")}><Plus size={17} />Registrar ajuste</Button></div></Card></section>
    <DataSection className="overflow-hidden p-0" description="Aperturas, cierres, arqueos y ajustes registrados en caja." headerClassName="border-b border-slate-200 px-6 py-5" title="Historial de caja"><Table className="min-w-[940px]"><thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4">Fecha</th><th className="px-6 py-4">Hora</th><th className="px-6 py-4">Tipo</th><th className="px-6 py-4">Descripción</th><th className="px-6 py-4">Valor</th><th className="px-6 py-4">Usuario</th><th className="px-6 py-4">Estado</th></tr></thead><tbody className="divide-y divide-slate-200">{movements.map((movement) => <tr className="transition hover:bg-slate-50/70" key={movement.id}><td className="px-6 py-4 text-sm font-semibold text-slate-600">{formatDate(movement.date)}</td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{movement.time}</td><td className="px-6 py-4 text-sm font-extrabold text-slate-800">{movement.type}</td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{movement.description}</td><td className="px-6 py-4 text-sm font-extrabold text-slate-800">{formatCurrency(movement.amount)}</td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{movement.user}</td><td className="px-6 py-4"><Badge variant={statusVariant[movement.status] ?? "neutral"}>{movement.status}</Badge></td></tr>)}</tbody></Table></DataSection>
  </PageContainer>
  <Modal isOpen={modal === "open"} onClose={resetModal} size="md" title="Abrir caja">{isSaving ? <Loader label="Abriendo caja..." /> : <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); saveOpen(); }}><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Saldo inicial</span><Input min="1" onChange={(event) => setInitialBalance(event.target.value)} placeholder="0" required type="number" value={initialBalance} /></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Observaciones</span><textarea className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" onChange={(event) => setObservations(event.target.value)} placeholder="Observaciones de apertura" value={observations} /></label><div className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">Fecha, hora y usuario se registrarán automáticamente. Estado: <span className="font-extrabold text-slate-800">Abierta</span></div><div className="flex justify-end gap-3 border-t border-slate-200 pt-4"><Button onClick={resetModal} variant="secondary">Cancelar</Button><Button type="submit">Abrir caja</Button></div></form>}</Modal>
  <Modal isOpen={modal === "close"} onClose={resetModal} size="md" title="Cerrar caja">{isSaving ? <Loader label="Cerrando caja..." /> : <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); saveClose(); }}><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 p-3"><p className="text-xs font-bold text-slate-500">Saldo inicial</p><p className="mt-1 text-sm font-extrabold text-slate-800">{formatCurrency(cash.initialBalance)}</p></div><div className="rounded-xl border border-slate-200 p-3"><p className="text-xs font-bold text-slate-500">Ingresos</p><p className="mt-1 text-sm font-extrabold text-emerald-700">{formatCurrency(dayTotals.income)}</p></div><div className="rounded-xl border border-slate-200 p-3"><p className="text-xs font-bold text-slate-500">Egresos</p><p className="mt-1 text-sm font-extrabold text-violet-700">{formatCurrency(dayTotals.expense)}</p></div><div className="rounded-xl border border-slate-200 p-3"><p className="text-xs font-bold text-slate-500">Saldo esperado</p><p className="mt-1 text-sm font-extrabold text-slate-800">{formatCurrency(expectedBalance)}</p></div></div><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Saldo contado</span><Input min="0" onChange={(event) => setCountedBalance(event.target.value)} placeholder={expectedBalance.toString()} required type="number" value={countedBalance} /></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Observaciones</span><textarea className="min-h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" onChange={(event) => setObservations(event.target.value)} placeholder="Observaciones de cierre" value={observations} /></label><div className={`rounded-xl p-4 text-sm font-bold ${difference === 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>Diferencia: {formatCurrency(difference)}</div><div className="flex justify-end gap-3 border-t border-slate-200 pt-4"><Button onClick={resetModal} variant="secondary">Cancelar</Button><Button type="submit">Cerrar caja</Button></div></form>}</Modal>
  <Modal isOpen={modal === "adjustment"} onClose={resetModal} size="md" title="Registrar ajuste">{isSaving ? <Loader label="Registrando ajuste..." /> : <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); saveAdjustment(); }}><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Tipo</span><select className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" onChange={(event) => setAdjustment({ ...adjustment, type: event.target.value })} value={adjustment.type}><option>Ingreso</option><option>Egreso</option></select></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Motivo</span><Input onChange={(event) => setAdjustment({ ...adjustment, reason: event.target.value })} placeholder="Describe el motivo del ajuste" required value={adjustment.reason} /></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Valor</span><Input min="1" onChange={(event) => setAdjustment({ ...adjustment, amount: event.target.value })} placeholder="0" required type="number" value={adjustment.amount} /></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Observaciones</span><textarea className="min-h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" onChange={(event) => setAdjustment({ ...adjustment, observations: event.target.value })} placeholder="Observaciones del ajuste" value={adjustment.observations} /></label><div className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">Número de ajuste, fecha, hora y usuario se generarán automáticamente.</div><div className="flex justify-end gap-3 border-t border-slate-200 pt-4"><Button onClick={resetModal} variant="secondary">Cancelar</Button><Button type="submit">Guardar ajuste</Button></div></form>}</Modal>
  <Modal isOpen={modal === "audit"} onClose={resetModal} size="md" title="Arqueo de caja"><div className="space-y-4"><div className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-bold text-slate-500">Saldo esperado</p><p className="mt-1 text-xl font-extrabold text-slate-900">{formatCurrency(expectedBalance)}</p></div><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Saldo contado</span><Input min="0" onChange={(event) => setCountedBalance(event.target.value)} placeholder={expectedBalance.toString()} type="number" value={countedBalance} /></label><div className={`rounded-xl p-4 ${difference === 0 ? "bg-emerald-50" : "bg-amber-50"}`}><div className="flex items-center gap-2"><span className={difference === 0 ? "text-emerald-700" : "text-amber-700"}>{difference === 0 ? <CheckCircle2 size={19} /> : <CircleAlert size={19} />}</span><p className={`text-sm font-extrabold ${difference === 0 ? "text-emerald-700" : "text-amber-700"}`}>{difference === 0 ? "Correcto" : "Diferencia encontrada"}</p></div><p className="mt-2 text-sm font-semibold text-slate-700">Diferencia: {formatCurrency(difference)}</p></div><div className="flex justify-end gap-3 border-t border-slate-200 pt-4"><Button onClick={resetModal} variant="secondary">Cancelar</Button><Button onClick={saveAudit}>Registrar arqueo</Button></div></div></Modal><ToastProvider /></>;
}
