import { lazy, Suspense, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { CircleDollarSign, Landmark, Plus, WalletCards } from "lucide-react";
import ActionMenu from "../../components/ui/ActionMenu";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
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
const savingTrend = [{ mes: "Ene", ahorro: 920 }, { mes: "Feb", ahorro: 990 }, { mes: "Mar", ahorro: 1060 }, { mes: "Abr", ahorro: 1120 }, { mes: "May", ahorro: 1210 }, { mes: "Jun", ahorro: 1280 }];
const initialSavingsAccounts = [
  { code: "AHO-0019", associate: "Edgar Peñalosa Hernández", type: "Ahorro programado", balance: 2500000, status: "Activa", openedAt: "02 may. 2026", openedDate: "2026-05-02", observations: "" },
  { code: "AHO-0020", associate: "María Camila Ulloa", type: "Ahorro a la vista", balance: 8750000, status: "Activa", openedAt: "30 abr. 2026", openedDate: "2026-04-30", observations: "" },
  { code: "AHO-0021", associate: "José Manuel Veltrán", type: "Ahorro programado", balance: 1250000, status: "Bloqueada", openedAt: "28 abr. 2026", openedDate: "2026-04-28", observations: "" },
  { code: "AHO-0022", associate: "Comercializadora Andina S.A.S.", type: "Ahorro empresarial", balance: 14200000, status: "Activa", openedAt: "26 abr. 2026", openedDate: "2026-04-26", observations: "" },
  { code: "AHO-0023", associate: "Liliana Rodríguez Mora", type: "Ahorro a la vista", balance: 680000, status: "Inactiva", openedAt: "19 abr. 2026", openedDate: "2026-04-19", observations: "" },
];
const savingTypes = ["Ahorro a la vista", "Ahorro programado", "Ahorro empresarial"];
const savingStatuses = ["Activa", "Inactiva", "Bloqueada"];
const savingFilters = [
  { id: "type", label: "Tipo de ahorro", ariaLabel: "Filtrar por tipo de ahorro", options: ["Todos", ...savingTypes] },
  { id: "status", label: "Estado", ariaLabel: "Filtrar por estado", options: ["Todos", ...savingStatuses] },
];
const statusVariant = { Activa: "success", Inactiva: "neutral", Bloqueada: "warning" };

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value).replace("COP", "$ ");
}

function formatOpeningDate(value) {
  return new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)).replace(/\./g, "");
}

function getCurrentDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function Savings() {
  const [savingsAccounts, setSavingsAccounts] = useState(initialSavingsAccounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [nextId, setNextId] = useState(() => Math.max(...initialSavingsAccounts.map((account) => Number(account.code.split("-")[1])), 0) + 1);
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({
    defaultValues: { associate: "", type: "", balance: "", observations: "" },
  });

  const associateOptions = useMemo(
    () => initialAssociates.map((associate) => `${associate.firstName} ${associate.lastName}`),
    [],
  );

  const summaryCards = useMemo(() => {
    const activeAccounts = savingsAccounts.filter((account) => account.status === "Activa");
    const totalBalance = savingsAccounts.reduce((total, account) => total + account.balance, 0);
    const currentMonth = new Date().toISOString().slice(0, 7);
    const openingsThisMonth = savingsAccounts.filter((account) => account.openedDate.startsWith(currentMonth)).length;

    return [
      { title: "Total cuentas", value: savingsAccounts.length.toString(), subtitle: "Registradas en la cooperativa", icon: <WalletCards size={28} />, color: "bg-blue-50 text-blue-600" },
      { title: "Cuentas activas", value: activeAccounts.length.toString(), subtitle: "Del total registrado", icon: <Landmark size={28} />, color: "bg-emerald-50 text-emerald-600" },
      { title: "Saldo total", value: formatCurrency(totalBalance), subtitle: "Saldo de las cuentas registradas", icon: <CircleDollarSign size={28} />, color: "bg-violet-50 text-violet-600" },
      { title: "Aperturas este mes", value: openingsThisMonth.toString(), subtitle: "Cuentas registradas este mes", icon: <Plus size={28} />, color: "bg-amber-50 text-amber-600" },
    ];
  }, [savingsAccounts]);

  function openCreateModal() {
    reset({ associate: "", type: "", balance: "", observations: "" });
    setSelectedAccount(null);
    setIsModalOpen(true);
  }

  function openEditModal(account) {
    setSelectedAccount(account);
    setValue("associate", account.associate);
    setValue("type", account.type);
    setValue("balance", account.balance);
    setValue("observations", account.observations);
    setIsModalOpen(true);
  }

  function openDetailModal(account) {
    setSelectedAccount(account);
    setIsDetailOpen(true);
  }

  function openConfirmStatusModal(account) {
    setSelectedAccount(account);
    setPendingStatus(account.status === "Activa" ? "Inactiva" : "Activa");
    setIsConfirmOpen(true);
  }

  function handleCloseModal() {
    reset();
    setIsModalOpen(false);
    setSelectedAccount(null);
  }

  function handleCloseDetail() {
    setIsDetailOpen(false);
    setSelectedAccount(null);
  }

  function handleCloseConfirm() {
    setIsConfirmOpen(false);
    setSelectedAccount(null);
    setPendingStatus(null);
  }

  function handleActionMenuClick(event, account) {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.title === "Ver") openDetailModal(account);
    if (button.title === "Editar") openEditModal(account);
    if (button.title === "Más opciones") openConfirmStatusModal(account);
  }

  function onSubmit(data) {
    const openedDate = selectedAccount ? selectedAccount.openedDate : getCurrentDate();
    const account = {
      code: selectedAccount?.code ?? `AHO-${String(nextId).padStart(4, "0")}`,
      associate: data.associate,
      type: data.type,
      balance: Number(data.balance),
      status: selectedAccount?.status ?? "Activa",
      openedAt: selectedAccount?.openedAt ?? formatOpeningDate(openedDate),
      openedDate,
      observations: data.observations.trim(),
    };

    setSavingsAccounts((current) => selectedAccount ? current.map((currentAccount) => currentAccount.code === selectedAccount.code ? account : currentAccount) : [account, ...current]);
    if (!selectedAccount) setNextId((currentId) => currentId + 1);
    reset();
    setIsModalOpen(false);
    setSelectedAccount(null);
    notifySuccess(selectedAccount ? "Cuenta de ahorro actualizada correctamente." : "Cuenta de ahorro creada correctamente.");
  }

  function changeStatus() {
    if (!selectedAccount) return;
    setSavingsAccounts((current) => current.map((account) => account.code === selectedAccount.code ? { ...account, status: pendingStatus } : account));
    handleCloseConfirm();
    notifySuccess("Estado de la cuenta actualizado correctamente.");
  }

  return (
    <>
      <PageContainer>
        <PageHeader eyebrow="Gestión de ahorros" title="Ahorros" subtitle="Gestiona las cuentas de ahorro y consulta su comportamiento." action={<Button onClick={openCreateModal}><Plus size={18} strokeWidth={2.5} />Nueva cuenta</Button>} />
        <SummaryCards items={summaryCards} />
        <DataSection className="p-6" description="Evolución del saldo total durante los últimos seis meses." headerClassName="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between" title="Comportamiento del ahorro" titleClassName="text-lg font-extrabold tracking-tight text-slate-900" action={<div className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">+$360 M acumulados</div>}><div className="mt-5"><Suspense fallback={<Loader label="Cargando evolución..." />}><LoanChart data={savingTrend} dataKey="ahorro" gradientId="savings-volume" label="Ahorro total" valueSuffix="millones" /></Suspense></div></DataSection>
        <FilterBar filters={savingFilters} gridClassName="xl:grid-cols-[minmax(0,1.8fr)_minmax(12rem,0.8fr)_minmax(11rem,0.7fr)_auto]" idPrefix="savings" />
        <DataSection className="overflow-hidden p-0" description={`${savingsAccounts.length} cuentas registradas.`} headerClassName="border-b border-slate-200 px-6 py-5" title="Cuentas de ahorro">
          {savingsAccounts.length === 0 ? <EmptyState icon={<WalletCards size={24} />} title="Aún no hay cuentas de ahorro" description="Cuando registres una cuenta, su información aparecerá en este listado." action={<Button onClick={openCreateModal}><Plus size={18} strokeWidth={2.5} />Nueva cuenta</Button>} /> : (
            <Table className="min-w-275">
              <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4">Código</th><th className="px-6 py-4">Asociado</th><th className="px-6 py-4">Producto</th><th className="px-6 py-4">Saldo</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4">Fecha apertura</th><th className="px-6 py-4 text-right">Acciones</th></tr></thead>
              <tbody className="divide-y divide-slate-200">{savingsAccounts.map((account) => <tr className="transition hover:bg-slate-50/70" key={account.code}><td className="px-6 py-4 text-sm font-extrabold text-slate-800">{account.code}</td><td className="px-6 py-4 text-sm font-bold text-slate-800">{account.associate}</td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{account.type}</td><td className="px-6 py-4 text-sm font-extrabold text-slate-800">{formatCurrency(account.balance)}</td><td className="px-6 py-4"><Badge variant={statusVariant[account.status]}>{account.status}</Badge></td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{account.openedAt}</td><td className="px-6 py-4"><div onClick={(event) => handleActionMenuClick(event, account)}><ActionMenu label={account.code} /></div></td></tr>)}</tbody>
            </Table>
          )}
        </DataSection>
      </PageContainer>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="md" title={selectedAccount ? "Editar cuenta de ahorro" : "Nueva cuenta de ahorro"}>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Asociado</span>
              <select {...register("associate", { required: "El asociado es obligatorio" })} aria-invalid={errors.associate ? "true" : "false"} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100">
                <option value="">Selecciona un asociado</option>
                {associateOptions.map((associate) => <option key={associate} value={associate}>{associate}</option>)}
              </select>
              {errors.associate && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.associate.message}</p>}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Tipo de ahorro</span>
              <select {...register("type", { required: "El tipo de ahorro es obligatorio" })} aria-invalid={errors.type ? "true" : "false"} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100">
                <option value="">Selecciona un tipo</option>
                {savingTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
              {errors.type && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.type.message}</p>}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Depósito inicial</span>
              <Input {...register("balance", { required: "El depósito inicial es obligatorio", min: { value: 0, message: "El depósito no puede ser negativo" } })} aria-invalid={errors.balance ? "true" : "false"} min="0" placeholder="0" type="number" />
              {errors.balance && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.balance.message}</p>}
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Observaciones</span>
            <textarea {...register("observations")} className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="Registra las observaciones de la cuenta" />
          </label>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <Button onClick={handleCloseModal} type="button" variant="secondary">Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDetailOpen} onClose={handleCloseDetail} size="md" title="Detalle de cuenta de ahorro">
        {selectedAccount && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-lg font-extrabold text-slate-900">{selectedAccount.associate}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">{selectedAccount.code}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-bold text-slate-500">Tipo de ahorro</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedAccount.type}</p></div>
              <div className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-bold text-slate-500">Saldo</p><p className="mt-1 text-sm font-semibold text-slate-800">{formatCurrency(selectedAccount.balance)}</p></div>
              <div className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-bold text-slate-500">Estado</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedAccount.status}</p></div>
              <div className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-bold text-slate-500">Fecha de apertura</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedAccount.openedAt}</p></div>
            </div>
            {selectedAccount.observations && <div className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-bold text-slate-500">Observaciones</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedAccount.observations}</p></div>}
          </div>
        )}
      </Modal>

      <Modal isOpen={isConfirmOpen} onClose={handleCloseConfirm} size="sm" title="Cambiar estado">
        {selectedAccount && <div className="space-y-4"><p className="text-sm font-semibold text-slate-600">¿Deseas cambiar el estado de la cuenta <span className="font-extrabold text-slate-900">{selectedAccount.code}</span> a <span className="font-extrabold text-slate-900">{pendingStatus}</span>?</p><div className="flex justify-end gap-3"><Button onClick={handleCloseConfirm} type="button" variant="secondary">Cancelar</Button><Button onClick={changeStatus} type="button">Confirmar</Button></div></div>}
      </Modal>

      <ToastProvider />
    </>
  );
}
