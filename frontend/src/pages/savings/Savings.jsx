import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CircleDollarSign,
  Eye,
  Landmark,
  Pencil,
  Plus,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataSection from "../../components/ui/DataSection";
import EmptyState from "../../components/ui/EmptyState";
import FilterBar from "../../components/ui/FilterBar";
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
  createSavingsAccount,
  getSavingsAccountById,
  getSavingsAccounts,
  updateSavingsAccountStatus,
} from "../../services/savingsService";

const statusLabels = {
  ACTIVE: "Activa",
  BLOCKED: "Bloqueada",
  CLOSED: "Cerrada",
};

const statusVariant = {
  Activa: "success",
  Bloqueada: "warning",
  Cerrada: "neutral",
};

const accountStatuses = ["ACTIVE", "BLOCKED", "CLOSED"];

const savingFilters = [
  {
    id: "status",
    label: "Estado",
    ariaLabel: "Filtrar por estado",
    options: ["Todos", "Activa", "Bloqueada", "Cerrada"],
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  })
    .format(Number(value || 0))
    .replace("COP", "$ ");
}

function formatOpeningDate(value) {
  if (!value) return "No disponible";

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date(value))
    .replace(/\./g, "");
}

function getAssociateName(associate) {
  return [associate.firstName, associate.lastName].filter(Boolean).join(" ");
}

function mapAccount(account, associatesById) {
  return {
    id: account.id,
    code: account.accountNumber,
    associateId: account.associateId,
    associate: associatesById.get(account.associateId) || "Asociado no disponible",
    balance: account.balance,
    statusCode: account.status,
    status: statusLabels[account.status] || account.status,
    openedAt: formatOpeningDate(account.openedAt),
    openedAtRaw: account.openedAt,
  };
}

function getErrorMessage(error, fallback) {
  const status = error.response?.status;

  if (status === 400) return "La solicitud contiene datos inválidos.";
  if (status === 401) return "Tu sesión no es válida. Inicia sesión nuevamente.";
  if (status === 403) return "No tienes permisos para realizar esta acción.";
  if (status === 404) return "La cuenta de ahorro no existe o fue eliminada.";
  if (status === 409) return "No fue posible completar la operación por un conflicto de datos.";
  if (status === 500) return "El servidor no pudo completar la operación. Inténtalo más tarde.";

  return fallback;
}

export default function Savings() {
  const [savingsAccounts, setSavingsAccounts] = useState([]);
  const [associates, setAssociates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isUnavailableActionOpen, setIsUnavailableActionOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [statusToUpdate, setStatusToUpdate] = useState("");
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { associateId: "" } });

  const loadSavingsData = useCallback(async () => {
    setLoadError("");
    setIsLoading(true);

    try {
      const [accounts, associateList] = await Promise.all([
        getSavingsAccounts(),
        associateService.getAll(),
      ]);
      const associatesById = new Map(
        associateList.map((associate) => [associate.id, getAssociateName(associate)])
      );

      setAssociates(associateList);
      setSavingsAccounts(accounts.map((account) => mapAccount(account, associatesById)));
    } catch (error) {
      console.error("Error cargando cuentas de ahorro:", error);
      const message = getErrorMessage(error, "No fue posible cargar las cuentas de ahorro. Inténtalo de nuevo.");
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
        const [accounts, associateList] = await Promise.all([
          getSavingsAccounts(),
          associateService.getAll(),
        ]);
        const associatesById = new Map(
          associateList.map((associate) => [associate.id, getAssociateName(associate)])
        );

        if (mounted) {
          setAssociates(associateList);
          setSavingsAccounts(accounts.map((account) => mapAccount(account, associatesById)));
        }
      } catch (error) {
        console.error("Error cargando cuentas de ahorro:", error);
        if (mounted) {
          const message = getErrorMessage(error, "No fue posible cargar las cuentas de ahorro. Inténtalo de nuevo.");
          setLoadError(message);
          notifyError(message);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredAccounts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es-CO");

    return savingsAccounts.filter((account) => {
      const matchesSearch = !normalizedSearch || [account.code, account.associate]
        .some((value) => value.toLocaleLowerCase("es-CO").includes(normalizedSearch));
      return matchesSearch && (statusFilter === "Todos" || account.status === statusFilter);
    });
  }, [savingsAccounts, search, statusFilter]);

  const summaryCards = useMemo(() => {
    const activeAccounts = savingsAccounts.filter((account) => account.status === "Activa");
    const totalBalance = savingsAccounts.reduce(
      (total, account) => total + Number(account.balance || 0),
      0
    );
    const currentMonth = new Date().toISOString().slice(0, 7);
    const openingsThisMonth = savingsAccounts.filter(
      (account) => account.openedAtRaw?.slice(0, 7) === currentMonth
    ).length;

    return [
      { title: "Total cuentas", value: savingsAccounts.length.toString(), subtitle: "Registradas en la cooperativa", icon: <WalletCards size={28} />, color: "bg-blue-50 text-blue-600" },
      { title: "Cuentas activas", value: activeAccounts.length.toString(), subtitle: "Del total registrado", icon: <Landmark size={28} />, color: "bg-emerald-50 text-emerald-600" },
      { title: "Saldo total", value: formatCurrency(totalBalance), subtitle: "Saldo de las cuentas registradas", icon: <CircleDollarSign size={28} />, color: "bg-violet-50 text-violet-600" },
      { title: "Aperturas este mes", value: openingsThisMonth.toString(), subtitle: "Cuentas registradas este mes", icon: <Plus size={28} />, color: "bg-amber-50 text-amber-600" },
    ];
  }, [savingsAccounts]);

  function openCreateModal() {
    reset({ associateId: "" });
    setIsCreateOpen(true);
  }

  function closeCreateModal() {
    reset();
    setIsCreateOpen(false);
  }

  async function getAccountWithAssociate(id) {
    const account = await getSavingsAccountById(id);
    let associate = associates.find(
      (currentAssociate) => currentAssociate.id === account.associateId
    );

    if (!associate) {
      associate = await associateService.getById(account.associateId);
    }

    return mapAccount(
      account,
      new Map([[associate.id, getAssociateName(associate)]])
    );
  }

  async function handleView(id) {
    try {
      const account = await getAccountWithAssociate(id);
      setSelectedAccount(account);
      setIsDetailOpen(true);
    } catch (error) {
      console.error("Error consultando cuenta de ahorro:", error);
      notifyError(getErrorMessage(error, "No fue posible consultar la cuenta de ahorro."));
    }
  }

  function handleEdit(id) {
    const account = savingsAccounts.find((currentAccount) => currentAccount.id === id);
    setSelectedAccount(account || null);
    setIsUnavailableActionOpen(true);
  }

  async function handleStatus(id) {
    try {
      const account = await getAccountWithAssociate(id);
      setSelectedAccount(account);
      setStatusToUpdate(account.statusCode);
      setIsStatusOpen(true);
    } catch (error) {
      console.error("Error consultando cuenta de ahorro:", error);
      notifyError(getErrorMessage(error, "No fue posible consultar la cuenta de ahorro."));
    }
  }

  async function submitStatusUpdate() {
    if (!selectedAccount || !statusToUpdate) return;

    try {
      setIsStatusSubmitting(true);
      await updateSavingsAccountStatus(selectedAccount.id, statusToUpdate);
      setIsStatusOpen(false);
      setSelectedAccount(null);
      setStatusToUpdate("");
      notifySuccess("Estado de la cuenta actualizado correctamente.");
      await loadSavingsData();
    } catch (error) {
      console.error("Error actualizando estado de la cuenta:", error);
      notifyError(getErrorMessage(error, "No fue posible actualizar el estado de la cuenta."));
    } finally {
      setIsStatusSubmitting(false);
    }
  }

  function closeSelectedModal() {
    setIsDetailOpen(false);
    setIsStatusOpen(false);
    setIsUnavailableActionOpen(false);
    setSelectedAccount(null);
    setStatusToUpdate("");
  }

  async function onSubmit({ associateId }) {
    try {
      await createSavingsAccount({ associateId: Number(associateId) });
      closeCreateModal();
      notifySuccess("Cuenta de ahorro creada correctamente.");
      await loadSavingsData();
    } catch (error) {
      console.error("Error creando cuenta de ahorro:", error);
      notifyError(getErrorMessage(error, "No fue posible crear la cuenta de ahorro."));
    }
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("Todos");
  }

  return (
    <>
      <PageContainer>
        <PageHeader
          eyebrow="Gestión de ahorros"
          title="Ahorros"
          subtitle="Gestiona las cuentas de ahorro y consulta su comportamiento."
          action={<Button onClick={openCreateModal}><Plus size={18} strokeWidth={2.5} />Nueva cuenta</Button>}
        />

        <SummaryCards items={summaryCards} />

        <DataSection
          className="p-6"
          description="El backend actual no expone histórico de saldos para construir esta gráfica."
          title="Comportamiento del ahorro"
          titleClassName="text-lg font-extrabold tracking-tight text-slate-900"
        >
          <EmptyState
            icon={<CircleDollarSign size={24} />}
            title="Histórico no disponible"
            description="Los totales mostrados arriba se calculan con las cuentas registradas actualmente."
          />
        </DataSection>

        <FilterBar
          filters={savingFilters}
          gridClassName="xl:grid-cols-[minmax(0,1.8fr)_minmax(11rem,0.7fr)_auto]"
          idPrefix="savings"
          onChange={(id, value) => setStatusFilter(value)}
          onReset={clearFilters}
          onSearchChange={setSearch}
          searchAriaLabel="Buscar cuenta o asociado"
          searchLabel="Buscar cuenta o asociado"
          searchPlaceholder="Número de cuenta o asociado"
          values={{ status: statusFilter }}
          searchValue={search}
        />

        <DataSection
          className="overflow-hidden p-0"
          description={`${savingsAccounts.length} cuentas registradas.`}
          headerClassName="border-b border-slate-200 px-6 py-5"
          title="Cuentas de ahorro"
        >
          {isLoading ? <Loader label="Cargando cuentas de ahorro..." /> : loadError ? (
            <EmptyState icon={<WalletCards size={24} />} title="No fue posible cargar las cuentas" description={loadError} action={<Button onClick={loadSavingsData}>Reintentar</Button>} />
          ) : savingsAccounts.length === 0 ? (
            <EmptyState icon={<WalletCards size={24} />} title="No hay cuentas de ahorro registradas." description="Cuando registres una cuenta, su información aparecerá en este listado." action={<Button onClick={openCreateModal}><Plus size={18} strokeWidth={2.5} />Nueva cuenta</Button>} />
          ) : filteredAccounts.length === 0 ? (
            <EmptyState icon={<WalletCards size={24} />} title="No hay cuentas para mostrar" description="Ajusta los filtros para ver las cuentas registradas." />
          ) : (
            <Table className="min-w-275">
              <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4">Código</th><th className="px-6 py-4">Asociado</th><th className="px-6 py-4">Saldo</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4">Fecha apertura</th><th className="px-6 py-4 text-right">Acciones</th></tr></thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAccounts.map((account) => (
                  <tr className="transition hover:bg-slate-50/70" key={account.id}>
                    <td className="px-6 py-4 text-sm font-extrabold text-slate-800">{account.code}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{account.associate}</td>
                    <td className="px-6 py-4 text-sm font-extrabold text-slate-800">{formatCurrency(account.balance)}</td>
                    <td className="px-6 py-4"><Badge variant={statusVariant[account.status] || "neutral"}>{account.status}</Badge></td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">{account.openedAt}</td>
                    <td className="px-6 py-4"><div className="flex justify-end gap-1">
                      <Button aria-label={`Ver ${account.code}`} onClick={() => handleView(account.id)} size="icon" title="Ver" variant="ghost"><Eye size={18} /></Button>
                      <Button aria-label={`Editar ${account.code}`} onClick={() => handleEdit(account.id)} size="icon" title="Editar" variant="ghost"><Pencil size={17} /></Button>
                      <Button aria-label={`Cambiar estado de ${account.code}`} onClick={() => handleStatus(account.id)} size="icon" title="Cambiar estado" variant="ghost"><ShieldCheck size={18} /></Button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </DataSection>
      </PageContainer>

      <Modal isOpen={isCreateOpen} onClose={closeCreateModal} size="md" title="Nueva cuenta de ahorro">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Asociado</span>
            <select {...register("associateId", { required: "El asociado es obligatorio" })} aria-invalid={errors.associateId ? "true" : "false"} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100">
              <option value="">Selecciona un asociado</option>
              {associates.map((associate) => <option key={associate.id} value={associate.id}>{getAssociateName(associate)}</option>)}
            </select>
            {errors.associateId && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.associateId.message}</p>}
          </label>
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">El número de cuenta, saldo inicial, estado y fecha de apertura son generados por el backend.</p>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4"><Button onClick={closeCreateModal} type="button" variant="secondary">Cancelar</Button><Button disabled={isSubmitting} type="submit">{isSubmitting ? "Guardando..." : "Guardar"}</Button></div>
        </form>
      </Modal>

      <Modal isOpen={isDetailOpen} onClose={closeSelectedModal} size="md" title="Detalle de cuenta de ahorro">
        {selectedAccount && <div className="space-y-4">
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-lg font-extrabold text-slate-900">{selectedAccount.associate}</p><p className="mt-1 text-sm font-semibold text-slate-500">{selectedAccount.code}</p></div>
          <div className="grid gap-3 md:grid-cols-2">
            <DetailItem label="Número de cuenta" value={selectedAccount.code} />
            <DetailItem label="ID del asociado" value={selectedAccount.associateId} />
            <DetailItem label="Saldo" value={formatCurrency(selectedAccount.balance)} />
            <div className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-bold text-slate-500">Estado</p><div className="mt-1"><Badge variant={statusVariant[selectedAccount.status] || "neutral"}>{selectedAccount.status}</Badge></div></div>
            <DetailItem label="Fecha de apertura" value={selectedAccount.openedAt} />
          </div>
          <div className="flex justify-end border-t border-slate-200 pt-4"><Button onClick={closeSelectedModal} type="button" variant="secondary">Cerrar</Button></div>
        </div>}
      </Modal>

      <Modal isOpen={isUnavailableActionOpen} onClose={closeSelectedModal} size="sm" title="Acción no disponible">
        {selectedAccount && <div className="space-y-4"><p className="text-sm font-semibold text-slate-600">La edición de cuentas de ahorro todavía no está disponible en el backend.</p><div className="flex justify-end"><Button onClick={closeSelectedModal} type="button" variant="secondary">Cerrar</Button></div></div>}
      </Modal>

      <Modal isOpen={isStatusOpen} onClose={closeSelectedModal} size="sm" title="Cambiar estado">
        {selectedAccount && <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-600">¿Desea cambiar el estado de la cuenta <span className="font-extrabold text-slate-900">{selectedAccount.code}</span>?</p>
          <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Nuevo estado</span>
            <select className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" onChange={(event) => setStatusToUpdate(event.target.value)} value={statusToUpdate}>
              {accountStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
            </select>
          </label>
          <div className="flex justify-end gap-3"><Button onClick={closeSelectedModal} type="button" variant="secondary">Cancelar</Button><Button disabled={isStatusSubmitting} onClick={submitStatusUpdate} type="button">{isStatusSubmitting ? "Guardando..." : "Confirmar"}</Button></div>
        </div>}
      </Modal>

      <ToastProvider />
    </>
  );
}

function DetailItem({ label, value }) {
  return <div className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value}</p></div>;
}
