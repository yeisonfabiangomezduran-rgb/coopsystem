import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleDollarSign,
  Plus,
  ReceiptText,
} from "lucide-react";

import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataSection from "../../components/ui/DataSection";
import EmptyState from "../../components/ui/EmptyState";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import SummaryCards from "../../components/ui/SummaryCards";
import Table from "../../components/ui/Table";
import ToastProvider from "../../components/ui/ToastProvider";
import {
  notifyError,
  notifySuccess,
} from "../../components/ui/toastNotifications";

import associateService from "../../services/associateService";
import { getSavingsAccounts } from "../../services/savingsService";
import {
  deposit,
  getTransactionsByAccount,
  withdraw,
} from "../../services/transactionService";


// ======================================================
// TIPOS DE TRANSACCIÓN
// ======================================================

const transactionLabels = {
  DEPOSIT: "Consignación",
  WITHDRAW: "Retiro",
  TRANSFER: "Transferencia",
  LOAN_DISBURSEMENT: "Desembolso de préstamo",
};


// ======================================================
// FORMATO DE MONEDA
// ======================================================

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  })
    .format(Number(value || 0))
    .replace("COP", "$ ");
}


// ======================================================
// FORMATO DE FECHA
// ======================================================

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}


// ======================================================
// MANEJO DE ERRORES
// ======================================================

function getErrorMessage(error, fallback) {
  const response = error.response?.data;

  return (
    response?.errors?.[0] ||
    response?.message ||
    error.message ||
    fallback
  );
}


// ======================================================
// COMPARAR FECHAS
// ======================================================

function isSameDate(value, filter) {
  return !filter || (value && value.slice(0, 10) === filter);
}


// ======================================================
// COMPONENTE
// ======================================================

export default function Transactions() {
  // ====================================================
  // ESTADOS
  // ====================================================

  const [accounts, setAccounts] = useState([]);
  const [associates, setAssociates] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [accountFilter, setAccountFilter] = useState("Todos");


  // ====================================================
  // FORMULARIO
  // ====================================================

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: "",
      savingsAccountId: "",
      amount: "",
    },
  });

  const selectedType = useWatch({
    control,
    name: "type",
  });


  // ====================================================
  // MAPA DE ASOCIADOS
  // ====================================================

  const associateById = useMemo(
    () =>
      new Map(
        associates.map((associate) => [
          associate.id,
          associate,
        ])
      ),
    [associates]
  );


  // ====================================================
  // MAPA DE CUENTAS
  // ====================================================

  const accountById = useMemo(
    () =>
      new Map(
        accounts.map((account) => [
          account.id,
          account,
        ])
      ),
    [accounts]
  );


  // ====================================================
  // CARGAR CUENTAS
  // ====================================================

  const loadAccounts = useCallback(async () => {
    const response = await getSavingsAccounts();

    setAccounts(response || []);

    return response || [];
  }, []);


  // ====================================================
  // CARGAR TRANSACCIONES
  // ====================================================

  const loadTransactions = useCallback(
    async (accountsToLoad) => {
      const histories = await Promise.all(
        accountsToLoad.map(async (account) => {
          const history = await getTransactionsByAccount(
            account.id
          );

          return (history || []).map(
            (transaction, index) => ({
              ...transaction,

              savingsAccountId: account.id,

              accountNumber:
                account.accountNumber,

              rowKey:
                `${account.id}-${transaction.transactionDate}-${transaction.transactionType}-${index}`,
            })
          );
        })
      );

      setTransactions(
        histories
          .flat()
          .sort(
            (a, b) =>
              new Date(b.transactionDate) -
              new Date(a.transactionDate)
          )
      );
    },
    []
  );


  // ====================================================
  // CARGAR TODA LA INFORMACIÓN
  // ====================================================

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [loadedAccounts] = await Promise.all([
        loadAccounts(),
        associateService
          .getAll()
          .then(setAssociates),
      ]);

      await loadTransactions(loadedAccounts);
    } catch (error) {
      console.error(error);

      notifyError(
        getErrorMessage(
          error,
          "No fue posible cargar las transacciones."
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [loadAccounts, loadTransactions]);


  // ====================================================
  // CARGAR AL ABRIR LA PÁGINA
  // ====================================================

  useEffect(() => {
    const loadTimer = window.setTimeout(
      loadData,
      0
    );

    return () =>
      window.clearTimeout(loadTimer);
  }, [loadData]);


  // ====================================================
  // AGREGAR NOMBRE DEL ASOCIADO
  // ====================================================

  const enrichedTransactions = useMemo(
    () =>
      transactions.map((transaction) => {
        const account = accountById.get(
          transaction.savingsAccountId
        );

        const associate = account
          ? associateById.get(account.associateId)
          : null;

        return {
          ...transaction,

          associateName: associate
            ? `${associate.firstName} ${associate.lastName}`
            : "Asociado no disponible",
        };
      }),
    [
      accountById,
      associateById,
      transactions,
    ]
  );


  // ====================================================
  // FILTRAR TRANSACCIONES
  // ====================================================

  const filteredTransactions = useMemo(() => {
    const normalizedSearch =
      search.trim().toLocaleLowerCase("es-CO");

    return enrichedTransactions.filter(
      (transaction) => {
        const matchesSearch =
          !normalizedSearch ||
          [
            transaction.accountNumber,
            transaction.associateName,
            transaction.transactionType,
          ]
            .filter(Boolean)
            .some((value) =>
              value
                .toLocaleLowerCase("es-CO")
                .includes(normalizedSearch)
            );

        return (
          matchesSearch &&
          isSameDate(
            transaction.transactionDate,
            dateFilter
          ) &&
          (typeFilter === "Todos" ||
            transaction.transactionType ===
              typeFilter) &&
          (accountFilter === "Todos" ||
            String(
              transaction.savingsAccountId
            ) === accountFilter)
        );
      }
    );
  }, [
    accountFilter,
    dateFilter,
    enrichedTransactions,
    search,
    typeFilter,
  ]);


  // ====================================================
  // TARJETAS RESUMEN
  // ====================================================

  const summaryCards = useMemo(() => {
    const today = new Date()
      .toISOString()
      .slice(0, 10);

    const todayTransactions =
      transactions.filter(
        (transaction) =>
          isSameDate(
            transaction.transactionDate,
            today
          )
      );

    const income =
      todayTransactions
        .filter((transaction) =>
          [
            "DEPOSIT",
            "LOAN_DISBURSEMENT",
          ].includes(
            transaction.transactionType
          )
        )
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount),
          0
        );

    const expense =
      todayTransactions
        .filter(
          (transaction) =>
            transaction.transactionType ===
            "WITHDRAW"
        )
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount),
          0
        );

    return [
      {
        title: "Total de transacciones",
        value: String(transactions.length),
        subtitle: "Movimientos registrados",
        icon: <ReceiptText size={28} />,
        color:
          "bg-blue-50 text-blue-600",
      },

      {
        title: "Ingresos del día",
        value: formatCurrency(income),
        subtitle: "Movimientos de hoy",
        icon: <ArrowUpRight size={28} />,
        color:
          "bg-emerald-50 text-emerald-600",
      },

      {
        title: "Egresos del día",
        value: formatCurrency(expense),
        subtitle: "Movimientos de hoy",
        icon: <ArrowDownLeft size={28} />,
        color:
          "bg-violet-50 text-violet-600",
      },

      {
        title: "Saldo neto",
        value: formatCurrency(
          income - expense
        ),
        subtitle: "Resultado de la jornada",
        icon: (
          <CircleDollarSign size={28} />
        ),
        color:
          "bg-amber-50 text-amber-600",
      },
    ];
  }, [transactions]);


  // ====================================================
  // ABRIR MODAL
  // ====================================================

  function openCreateModal() {
    reset({
      type: "",
      savingsAccountId: "",
      amount: "",
    });

    setIsModalOpen(true);
  }


  // ====================================================
  // CERRAR MODAL
  // ====================================================

  function closeModal() {
    if (!isSaving) {
      setIsModalOpen(false);
    }
  }


  // ====================================================
  // GUARDAR TRANSACCIÓN
  // ====================================================

  async function onSubmit(data) {
    const amount = Number(data.amount);

    // Validaciones adicionales
    if (!data.type) {
      notifyError(
        "Selecciona el tipo de transacción."
      );
      return;
    }

    if (!data.savingsAccountId) {
      notifyError(
        "Selecciona una cuenta de ahorro."
      );
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      notifyError(
        "El monto debe ser mayor a cero."
      );
      return;
    }

    // Solo permitimos consignación y retiro
    if (
      data.type !== "DEPOSIT" &&
      data.type !== "WITHDRAW"
    ) {
      notifyError(
        "Tipo de transacción no válido."
      );
      return;
    }

    setIsSaving(true);

    try {
      const operation =
        data.type === "DEPOSIT"
          ? deposit
          : withdraw;

      const response = await operation(
        data.savingsAccountId,
        amount
      );

      notifySuccess(
        response?.message ||
          (
            data.type === "DEPOSIT"
              ? "Consignación realizada correctamente."
              : "Retiro realizado correctamente."
          )
      );

      setIsModalOpen(false);

      // Actualizar cuentas
      const refreshedAccounts =
        await loadAccounts();

      // Actualizar movimientos
      await loadTransactions(
        refreshedAccounts
      );

      // Limpiar formulario
      reset({
        type: "",
        savingsAccountId: "",
        amount: "",
      });

    } catch (error) {
      console.error(error);

      notifyError(
        getErrorMessage(
          error,
          "No fue posible realizar la operación."
        )
      );
    } finally {
      setIsSaving(false);
    }
  }


  // ====================================================
  // LIMPIAR FILTROS
  // ====================================================

  function clearFilters() {
    setSearch("");
    setDateFilter("");
    setTypeFilter("Todos");
    setAccountFilter("Todos");
  }


  // ====================================================
  // RENDER
  // ====================================================

  return (
    <>
      <PageContainer>

        {/* ============================================
            ENCABEZADO
        ============================================ */}

        <PageHeader
          action={
            <Button
              onClick={openCreateModal}
            >
              <Plus
                size={18}
                strokeWidth={2.5}
              />

              Nueva transacción
            </Button>
          }
          eyebrow="Gestión de transacciones"
          subtitle="Consulta los movimientos registrados en las cuentas de ahorro."
          title="Transacciones"
        />


        {/* ============================================
            TARJETAS RESUMEN
        ============================================ */}

        <SummaryCards
          items={summaryCards}
        />


        {/* ============================================
            FILTROS
        ============================================ */}

        <DataSection
          className="p-5 sm:p-6"
          title="Filtros"
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_minmax(10rem,.8fr)_minmax(10rem,.8fr)_minmax(12rem,.9fr)_auto] xl:items-end">

            {/* BUSCAR */}

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Buscar
              </span>

              <Input
                aria-label="Buscar por cuenta, asociado o tipo"
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Cuenta, asociado o tipo"
                value={search}
              />
            </label>


            {/* FECHA */}

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Fecha
              </span>

              <Input
                aria-label="Filtrar por fecha"
                onChange={(event) =>
                  setDateFilter(
                    event.target.value
                  )
                }
                type="date"
                value={dateFilter}
              />
            </label>


            {/* TIPO */}

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Tipo
              </span>

              <select
                className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
                onChange={(event) =>
                  setTypeFilter(
                    event.target.value
                  )
                }
                value={typeFilter}
              >
                <option value="Todos">
                  Todos
                </option>

                {Object.entries(
                  transactionLabels
                ).map(
                  ([value, label]) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {label}
                    </option>
                  )
                )}
              </select>
            </label>


            {/* CUENTA */}

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Cuenta
              </span>

              <select
                className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
                onChange={(event) =>
                  setAccountFilter(
                    event.target.value
                  )
                }
                value={accountFilter}
              >
                <option value="Todos">
                  Todas
                </option>

                {accounts.map(
                  (account) => {
                    const associate =
                      associateById.get(
                        account.associateId
                      );

                    const associateName =
                      associate
                        ? `${associate.firstName} ${associate.lastName}`
                        : "Asociado no disponible";

                    return (
                      <option
                        key={account.id}
                        value={account.id}
                      >
                        {associateName}
                      </option>
                    );
                  }
                )}
              </select>
            </label>


            {/* LIMPIAR */}

            <Button
              className="w-full xl:w-auto"
              onClick={clearFilters}
              variant="secondary"
            >
              Limpiar filtros
            </Button>

          </div>
        </DataSection>


        {/* ============================================
            HISTORIAL
        ============================================ */}

        <DataSection
          className="overflow-hidden p-0"
          description={`${filteredTransactions.length} transacciones encontradas.`}
          headerClassName="border-b border-slate-200 px-6 py-5"
          title="Historial de movimientos"
        >

          {isLoading ? (

            <Loader
              label="Cargando transacciones..."
            />

          ) : filteredTransactions.length ===
            0 ? (

            <EmptyState
              action={
                <Button
                  onClick={openCreateModal}
                >
                  <Plus
                    size={18}
                    strokeWidth={2.5}
                  />

                  Nueva transacción
                </Button>
              }
              description="Ajusta los filtros o registra una consignación o retiro."
              icon={
                <ReceiptText size={24} />
              }
              title="No hay transacciones para mostrar"
            />

          ) : (

            <Table className="min-w-[950px]">

              <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500">

                <tr>

                  <th className="px-6 py-4">
                    Fecha y hora
                  </th>

                  <th className="px-6 py-4">
                    Tipo
                  </th>

                  <th className="px-6 py-4">
                    Asociado
                  </th>

                  <th className="px-6 py-4">
                    Cuenta
                  </th>

                  <th className="px-6 py-4">
                    Valor
                  </th>

                  <th className="px-6 py-4">
                    Saldo anterior
                  </th>

                  <th className="px-6 py-4">
                    Saldo actual
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-200">

                {filteredTransactions.map(
                  (transaction) => (

                    <tr
                      className="transition hover:bg-slate-50/70"
                      key={transaction.rowKey}
                    >

                      <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                        {formatDateTime(
                          transaction.transactionDate
                        )}
                      </td>


                      <td className="px-6 py-4">

                        <Badge
                          variant={
                            transaction.transactionType ===
                            "WITHDRAW"
                              ? "warning"
                              : "success"
                          }
                        >
                          {
                            transactionLabels[
                              transaction
                                .transactionType
                            ] ||
                              transaction.transactionType
                          }
                        </Badge>

                      </td>


                      <td className="px-6 py-4 text-sm font-bold text-slate-800">
                        {
                          transaction.associateName
                        }
                      </td>


                      <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                        {
                          transaction.accountNumber
                        }
                      </td>


                      <td className="px-6 py-4 text-sm font-extrabold text-slate-800">
                        {formatCurrency(
                          transaction.amount
                        )}
                      </td>


                      <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                        {formatCurrency(
                          transaction.previousBalance
                        )}
                      </td>


                      <td className="px-6 py-4 text-sm font-extrabold text-slate-800">
                        {formatCurrency(
                          transaction.currentBalance
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </Table>

          )}

        </DataSection>

      </PageContainer>


      {/* ==============================================
          MODAL NUEVA TRANSACCIÓN
      ============================================== */}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        size="lg"
        title="Nueva transacción"
      >

        <form
          className="space-y-5"
          onSubmit={handleSubmit(
            onSubmit
          )}
        >

          {/* ========================================
              TIPO + CUENTA
          ======================================== */}

          <div className="grid gap-4 md:grid-cols-2">

            {/* TIPO DE TRANSACCIÓN */}

            <label className="block">

              <span className="mb-2 block text-sm font-bold text-slate-700">
                Tipo de transacción
              </span>

              <select
                {...register("type", {
                  required:
                    "Selecciona un tipo de transacción",
                })}
                aria-invalid={
                  errors.type
                    ? "true"
                    : "false"
                }
                className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
              >

                <option value="">
                  Selecciona un tipo
                </option>

                <option value="DEPOSIT">
                  Consignación
                </option>

                <option value="WITHDRAW">
                  Retiro
                </option>

              </select>


              {errors.type && (
                <p className="mt-1 text-sm font-semibold text-rose-600">
                  {errors.type.message}
                </p>
              )}

            </label>


            {/* CUENTA DE AHORRO */}

            <label className="block">

              <span className="mb-2 block text-sm font-bold text-slate-700">
                Cuenta de ahorro
              </span>

              <select
                {...register(
                  "savingsAccountId",
                  {
                    required:
                      "Selecciona una cuenta",
                  }
                )}
                aria-invalid={
                  errors.savingsAccountId
                    ? "true"
                    : "false"
                }
                className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
              >

                <option value="">
                  Selecciona una cuenta
                </option>


                {accounts.map(
                  (account) => {

                    const associate =
                      associateById.get(
                        account.associateId
                      );

                    const associateName =
                      associate
                        ? `${associate.firstName} ${associate.lastName}`
                        : "Asociado no disponible";


                    return (
                      <option
                        key={account.id}
                        value={account.id}
                      >
                        {`${associateName} · ${formatCurrency(
                          account.balance
                        )}`}
                      </option>
                    );

                  }
                )}

              </select>


              {errors.savingsAccountId && (
                <p className="mt-1 text-sm font-semibold text-rose-600">
                  {
                    errors
                      .savingsAccountId
                      .message
                  }
                </p>
              )}

            </label>

          </div>


          {/* ========================================
              MONTO
          ======================================== */}

          {selectedType && (

            <label className="block">

              <span className="mb-2 block text-sm font-bold text-slate-700">
                Monto
              </span>

              <Input
                {...register("amount", {
                  required:
                    "Ingresa el monto",

                  min: {
                    value: 0.01,
                    message:
                      "El monto debe ser mayor a cero",
                  },
                })}
                aria-invalid={
                  errors.amount
                    ? "true"
                    : "false"
                }
                min="0.01"
                placeholder="0"
                step="0.01"
                type="number"
              />


              {errors.amount && (
                <p className="mt-1 text-sm font-semibold text-rose-600">
                  {
                    errors.amount.message
                  }
                </p>
              )}

            </label>

          )}


          {/* ========================================
              BOTONES
          ======================================== */}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">

            <Button
              disabled={isSaving}
              onClick={closeModal}
              type="button"
              variant="secondary"
            >
              Cancelar
            </Button>


            <Button
              disabled={isSaving}
              type="submit"
            >
              {isSaving
                ? "Guardando..."
                : "Guardar transacción"}
            </Button>

          </div>

        </form>

      </Modal>


      {/* ==============================================
          TOASTS
      ============================================== */}

      <ToastProvider />

    </>
  );
}