const transactions = [
  {
    id: "TRX-0019",
    associate: "Edgar Peñalosa Hernández",
    concept: "Pago de cuota PRE-0042",
    type: "Ingreso",
    amount: "$ 850.000",
    status: "Confirmada",
    date: "02 may. 2026 · 10:24 a. m.",
  },
  {
    id: "TRX-0020",
    associate: "María Camila Ulloa",
    concept: "Desembolso PRE-0020",
    type: "Egreso",
    amount: "$ 8.000.000",
    status: "Pendiente",
    date: "02 may. 2026 · 09:48 a. m.",
  },
  {
    id: "TRX-0021",
    associate: "José Manuel Veltrán",
    concept: "Aporte de asociado",
    type: "Ingreso",
    amount: "$ 500.000",
    status: "Confirmada",
    date: "02 may. 2026 · 09:12 a. m.",
  },
  {
    id: "TRX-0022",
    associate: "Comercializadora Andina S.A.S.",
    concept: "Pago de servicios",
    type: "Egreso",
    amount: "$ 275.000",
    status: "Anulada",
    date: "02 may. 2026 · 08:35 a. m.",
  },
  {
    id: "TRX-0023",
    associate: "Liliana Rodríguez Mora",
    concept: "Consignación de ahorros",
    type: "Ingreso",
    amount: "$ 1.250.000",
    status: "Confirmada",
    date: "01 may. 2026 · 04:16 p. m.",
  },
];

const summaryCards = [
  {
    title: "Ingresos del día",
    value: "$12,8 M",
    subtitle: "24 movimientos registrados",
    icon: "ArrowUpRight",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Egresos del día",
    value: "$9,4 M",
    subtitle: "11 movimientos registrados",
    icon: "ArrowDownLeft",
    color: "bg-violet-50 text-violet-600",
  },
  {
    title: "Saldo disponible",
    value: "$450 M",
    subtitle: "Después de movimientos del día",
    icon: "ReceiptText",
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Operaciones esta semana",
    value: "128",
    subtitle: "3% más que la semana anterior",
    icon: "CircleDollarSign",
    color: "bg-amber-50 text-amber-600",
  },
];

const transactionFilters = [
  {
    id: "type",
    label: "Tipo",
    ariaLabel: "Filtrar por tipo de transacción",
    options: ["Todos", "Ingreso", "Egreso"],
  },
  {
    id: "status",
    label: "Estado",
    ariaLabel: "Filtrar por estado",
    options: ["Todos", "Confirmada", "Pendiente", "Anulada"],
  },
  {
    id: "period",
    label: "Periodo",
    ariaLabel: "Filtrar por periodo",
    options: ["Hoy", "Esta semana", "Este mes"],
  },
];

const statusVariant = {
  Confirmada: "success",
  Pendiente: "warning",
  Anulada: "neutral",
};

const typeVariant = {
  Ingreso: "text-emerald-600",
  Egreso: "text-violet-600",
};

export function getTransactions() {
  return transactions;
}

export function getTransactionSummaryCards() {
  return summaryCards;
}

export function getTransactionFilters() {
  return transactionFilters;
}

export function getTransactionStatusVariant() {
  return statusVariant;
}

export function getTransactionTypeVariant() {
  return typeVariant;
}
