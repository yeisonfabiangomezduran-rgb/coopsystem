import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import {
  CreditCard,
  Landmark,
  PiggyBank,
  Printer,
  Users,
  WalletCards,
} from "lucide-react";

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
import {
  getAssociatesReport,
  getDashboardReport,
  getLoansReport,
  getSavingsReport,
  getTransactionsReport,
  getTreasuryReport,
} from "../../services/reportService";

const LoanChart = lazy(() => import("../dashboard/LoanChart"));

const reportCategories = [
  {
    id: "associates",
    title: "Asociados",
    description:
      "Consulta afiliaciones, información documental y estado de los asociados.",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
  },
  {
    id: "savings",
    title: "Ahorros",
    description:
      "Revisa saldos, productos y estado de las cuentas de ahorro.",
    icon: PiggyBank,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "loans",
    title: "Préstamos",
    description:
      "Analiza la cartera, saldos pendientes y estado de los créditos.",
    icon: CreditCard,
    color: "bg-violet-50 text-violet-600",
  },
  {
    id: "transactions",
    title: "Transacciones",
    description:
      "Consulta las operaciones financieras registradas en la cooperativa.",
    icon: WalletCards,
    color: "bg-amber-50 text-amber-600",
  },
  {
    id: "treasury",
    title: "Tesorería",
    description:
      "Monitorea movimientos de caja y disponibilidad consolidada.",
    icon: Landmark,
    color: "bg-blue-50 text-blue-600",
  },
];

/*
 * DATOS TEMPORALES
 *
 * Estos datos todavía pertenecen a las tablas detalladas.
 * Los conectaremos al backend en los siguientes pasos.
 */
const reportData = {
  associates: [
    {
      code: "ASO-0019",
      name: "Edgar Peñalosa Hernández",
      document: "CC 1.019.243.765",
      status: "Activo",
      date: "2026-07-02",
      associate: "ASO-0019",
    },
    {
      code: "ASO-0020",
      name: "María Camila Ulloa",
      document: "CC 1.024.981.376",
      status: "Activo",
      date: "2026-06-30",
      associate: "ASO-0020",
    },
    {
      code: "ASO-0021",
      name: "José Manuel Veltrán",
      document: "CC 79.852.911",
      status: "Suspendido",
      date: "2026-06-28",
      associate: "ASO-0021",
    },
    {
      code: "ASO-0022",
      name: "Comercializadora Andina S.A.S.",
      document: "NIT 901.625.184-7",
      status: "Activo",
      date: "2026-06-26",
      associate: "ASO-0022",
    },
  ],

  savings: [
    {
      account: "AHO-0019",
      associateName: "Edgar Peñalosa Hernández",
      associate: "ASO-0019",
      balance: 2500000,
      status: "Activa",
      date: "2026-07-20",
    },
    {
      account: "AHO-0020",
      associateName: "María Camila Ulloa",
      associate: "ASO-0020",
      balance: 8750000,
      status: "Activa",
      date: "2026-07-19",
    },
    {
      account: "AHO-0021",
      associateName: "José Manuel Veltrán",
      associate: "ASO-0021",
      balance: 1250000,
      status: "Bloqueada",
      date: "2026-07-18",
    },
    {
      account: "AHO-0022",
      associateName: "Comercializadora Andina S.A.S.",
      associate: "ASO-0022",
      balance: 14200000,
      status: "Activa",
      date: "2026-07-17",
    },
  ],

  loans: [
    {
      number: "PRE-0042",
      associateName: "Edgar Peñalosa Hernández",
      associate: "ASO-0019",
      amount: 12000000,
      pending: 7500000,
      status: "Vigente",
      date: "2026-07-20",
    },
    {
      number: "PRE-0020",
      associateName: "María Camila Ulloa",
      associate: "ASO-0020",
      amount: 8000000,
      pending: 8000000,
      status: "En revisión",
      date: "2026-07-19",
    },
    {
      number: "PRE-0021",
      associateName: "José Manuel Veltrán",
      associate: "ASO-0021",
      amount: 5000000,
      pending: 3250000,
      status: "Vencido",
      date: "2026-07-18",
    },
    {
      number: "PRE-0022",
      associateName: "Comercializadora Andina S.A.S.",
      associate: "ASO-0022",
      amount: 25000000,
      pending: 18200000,
      status: "Vigente",
      date: "2026-07-17",
    },
  ],

  transactions: [
    {
      number: "TRX-0019",
      type: "Pago de cuota",
      date: "2026-07-20",
      amount: 850000,
      user: "Laura Gómez",
      status: "Completada",
      associate: "ASO-0019",
    },
    {
      number: "TRX-0020",
      type: "Desembolso",
      date: "2026-07-20",
      amount: 8000000,
      user: "Carlos Ruiz",
      status: "Completada",
      associate: "ASO-0020",
    },
    {
      number: "TRX-0021",
      type: "Consignación",
      date: "2026-07-19",
      amount: 500000,
      user: "Laura Gómez",
      status: "Completada",
      associate: "ASO-0021",
    },
    {
      number: "TRX-0022",
      type: "Retiro",
      date: "2026-07-18",
      amount: 275000,
      user: "Carlos Ruiz",
      status: "Anulada",
      associate: "ASO-0023",
    },
  ],

  treasury: [
    {
      number: "TES-0019",
      type: "Ingreso de caja",
      date: "2026-07-20",
      amount: 1350000,
      user: "Laura Gómez",
      status: "Completada",
      associate: "ASO-0019",
    },
    {
      number: "TES-0020",
      type: "Egreso de caja",
      date: "2026-07-19",
      amount: 750000,
      user: "Carlos Ruiz",
      status: "Completada",
      associate: "ASO-0020",
    },
    {
      number: "TES-0021",
      type: "Ajuste de caja",
      date: "2026-07-18",
      amount: 125000,
      user: "Laura Gómez",
      status: "Pendiente",
      associate: "ASO-0022",
    },
  ],
};

const columns = {
  associates: [
    ["Código", "code"],
    ["Nombre", "name"],
    ["Documento", "document"],
    ["Estado", "status"],
    ["Fecha ingreso", "date"],
  ],

  savings: [
    ["Cuenta", "account"],
    ["Asociado", "associateName"],
    ["Saldo", "balance"],
    ["Estado", "status"],
  ],

  loans: [
    ["Número", "number"],
    ["Asociado", "associateName"],
    ["Valor", "amount"],
    ["Saldo pendiente", "pending"],
    ["Estado", "status"],
  ],

  transactions: [
    ["Número", "number"],
    ["Tipo", "type"],
    ["Fecha", "date"],
    ["Valor", "amount"],
    ["Usuario", "user"],
  ],

  treasury: [
    ["Número", "number"],
    ["Movimiento", "type"],
    ["Fecha", "date"],
    ["Valor", "amount"],
    ["Usuario", "user"],
    ["Estado", "status"],
  ],
};

const chartOptions = {
  associates: {
    label: "Asociados",
    dataKey: "asociados",
    valueSuffix: "asociados",
    data: [
      { mes: "Ene", asociados: 280 },
      { mes: "Feb", asociados: 288 },
      { mes: "Mar", asociados: 296 },
      { mes: "Abr", asociados: 304 },
      { mes: "May", asociados: 316 },
      { mes: "Jun", asociados: 325 },
    ],
  },

  savings: {
    label: "Ahorros",
    dataKey: "ahorros",
    valueSuffix: "millones",
    data: [
      { mes: "Ene", ahorros: 920 },
      { mes: "Feb", ahorros: 990 },
      { mes: "Mar", ahorros: 1060 },
      { mes: "Abr", ahorros: 1120 },
      { mes: "May", ahorros: 1210 },
      { mes: "Jun", ahorros: 1280 },
    ],
  },

  loans: {
    label: "Préstamos",
    dataKey: "prestamos",
    valueSuffix: "millones",
    data: [
      { mes: "Ene", prestamos: 76 },
      { mes: "Feb", prestamos: 81 },
      { mes: "Mar", prestamos: 88 },
      { mes: "Abr", prestamos: 92 },
      { mes: "May", prestamos: 98 },
      { mes: "Jun", prestamos: 105 },
    ],
  },

  transactions: {
    label: "Transacciones",
    dataKey: "transacciones",
    valueSuffix: "operaciones",
    data: [
      { mes: "Ene", transacciones: 98 },
      { mes: "Feb", transacciones: 110 },
      { mes: "Mar", transacciones: 123 },
      { mes: "Abr", transacciones: 118 },
      { mes: "May", transacciones: 134 },
      { mes: "Jun", transacciones: 146 },
    ],
  },
};

const associateOptions = [
  ["ASO-0019", "Edgar Peñalosa Hernández"],
  ["ASO-0020", "María Camila Ulloa"],
  ["ASO-0021", "José Manuel Veltrán"],
  ["ASO-0022", "Comercializadora Andina S.A.S."],
  ["ASO-0023", "Liliana Rodríguez Mora"],
];

const statusVariant = {
  Activo: "success",
  Activa: "success",
  Vigente: "success",
  Completada: "success",
  Cancelado: "neutral",
  CANCELLED: "neutral",
  "En revisión": "warning",
  Pendiente: "warning",
  Suspendido: "warning",
  Bloqueada: "warning",
  Vencido: "neutral",
  Anulada: "neutral",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace("COP", "$ ");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date(`${value}T12:00:00`))
    .replace(/\./g, "");
}

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState("associates");
  const [chartType, setChartType] = useState("associates");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [status, setStatus] = useState("Todos");
  const [associate, setAssociate] = useState("Todos");

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // =========================================================
  // DASHBOARD REAL DEL BACKEND
  // =========================================================

  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const [associates, setAssociates] = useState([]);
  const [savings, setSavings] = useState([]);
  const [loans, setLoans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [treasury, setTreasury] = useState([]);

  // =========================================================
  // REPORTE DE ASOCIADOS
  // =========================================================

  useEffect(() => {
    async function loadAssociates() {
      try {
        const data = await getAssociatesReport();

        console.log(
          "Asociados recibidos desde backend:",
          data
        );

        const formattedAssociates = data.map((item) => ({
          ...item,
          date: item.entryDate,
          associate: item.code,
          status: item.status
            ? item.status.charAt(0).toUpperCase() +
              item.status.slice(1).toLowerCase()
            : "",
        }));

        setAssociates(formattedAssociates);
      } catch (error) {
        console.error(
          "Error cargando reporte de asociados:",
          error
        );

        setAssociates([]);
      }
    }

    if (selectedReport === "associates") {
      loadAssociates();
    }
  }, [selectedReport]);

  // =========================================================
  // REPORTE DE AHORROS
  // =========================================================

  useEffect(() => {
    async function loadSavings() {
      try {
        const data = await getSavingsReport();

        console.log(
          "Ahorros recibidos desde backend:",
          data
        );

        const formattedSavings = data.map((item) => ({
          ...item,
          date: item.openedAt,
          status:
            item.status === "ACTIVE"
              ? "Activa"
              : item.status,
        }));

        setSavings(formattedSavings);
      } catch (error) {
        console.error(
          "Error cargando reporte de ahorros:",
          error
        );

        setSavings([]);
      }
    }

    if (selectedReport === "savings") {
      loadSavings();
    }
  }, [selectedReport]);

  // =========================================================
  // REPORTE DE PRÉSTAMOS
  // =========================================================

  useEffect(() => {
    async function loadLoans() {
      try {
        const data = await getLoansReport();

        console.log(
          "Préstamos recibidos desde backend:",
          data
        );

        const formattedLoans = data.map((item) => ({
          ...item,
          number: item.loanNumber,
          associate: item.associateName,
          date: item.requestedAt,
          pending: item.outstandingBalance,
          status:
            item.status === "DISBURSED"
              ? "Vigente"
              : item.status === "CANCELLED"
                ? "Cancelado"
                : item.status,
        }));

        setLoans(formattedLoans);
      } catch (error) {
        console.error(
          "Error cargando reporte de préstamos:",
          error
        );

        setLoans([]);
      }
    }

    if (selectedReport === "loans") {
      loadLoans();
    }
  }, [selectedReport]);

  // =========================================================
  // REPORTE DE TRANSACCIONES
  // =========================================================

  useEffect(() => {
    async function loadTransactions() {
      try {
        const data = await getTransactionsReport();

        console.log(
          "Transacciones recibidas desde backend:",
          data
        );

        const transactionTypeLabels = {
          DEPOSIT: "Consignación",
          WITHDRAW: "Retiro",
          LOAN_DISBURSEMENT: "Desembolso de préstamo",
          LOAN_PAYMENT: "Pago de préstamo",
        };

        const formattedTransactions = data.map((item) => ({
          ...item,
          type:
            transactionTypeLabels[item.type] ??
            item.type,
          date: item.date,
          amount: item.amount,
          user: item.user || "Sistema",
        }));

        setTransactions(formattedTransactions);
      } catch (error) {
        console.error(
          "Error cargando reporte de transacciones:",
          error
        );

        setTransactions([]);
      }
    }

    if (selectedReport === "transactions") {
      loadTransactions();
    }
  }, [selectedReport]);

  // =========================================================
  // REPORTE DE TESORERÍA
  // =========================================================

  useEffect(() => {
    async function loadTreasury() {
      try {
        const data = await getTreasuryReport();

        console.log(
          "Tesorería recibida desde backend:",
          data
        );

        const treasuryTypeLabels = {
          "Egreso - Desembolso de préstamo":
            "Egreso - Desembolso de préstamo",
          "Ingreso - Pago de préstamo":
            "Ingreso - Pago de préstamo",
        };

        const formattedTreasury = data.map((item) => ({
          ...item,
          type:
            treasuryTypeLabels[item.type] ??
            item.type,
          date: item.date,
          amount: item.amount,
          user: item.user || "Sistema",
          status: "Completada",
        }));

        setTreasury(formattedTreasury);
      } catch (error) {
        console.error(
          "Error cargando reporte de tesorería:",
          error
        );

        setTreasury([]);
      }
    }

    if (selectedReport === "treasury") {
      loadTreasury();
    }
  }, [selectedReport]);

  // =========================================================
  // DASHBOARD
  // =========================================================

  useEffect(() => {
    async function loadDashboard() {
      try {
        setDashboardLoading(true);
        setDashboardError("");

        const data = await getDashboardReport();

        console.log(
          "Reporte recibido desde backend:",
          data
        );

        setDashboard(data);
      } catch (error) {
        console.error(
          "Error cargando dashboard de reportes:",
          error
        );

        setDashboardError(
          error?.response?.data?.message ||
            "No fue posible cargar los indicadores."
        );
      } finally {
        setDashboardLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const selectedCategory = reportCategories.find(
    (category) => category.id === selectedReport
  );

  // =========================================================
  // RESULTADOS
  // =========================================================

  const results = useMemo(() => {
    let sourceData = reportData[selectedReport];

    if (selectedReport === "associates") {
      sourceData = associates;
    }

    if (selectedReport === "savings") {
      sourceData = savings;
    }

    if (selectedReport === "loans") {
      sourceData = loans;
    }

    if (selectedReport === "transactions") {
      sourceData = transactions;
    }

    if (selectedReport === "treasury") {
      sourceData = treasury;
}

    return sourceData.filter((item) => {
      const matchesDate =
        (!startDate || item.date >= startDate) &&
        (!endDate || item.date <= endDate);

      const matchesStatus =
        status === "Todos" ||
        item.status === status;

      const matchesAssociate =
        associate === "Todos" ||
        !item.associate ||
        item.associate === associate;

      return (
        matchesDate &&
        matchesStatus &&
        matchesAssociate
      );
    });
  }, [
    associates,
    savings,
    loans,
    transactions,
    treasury,
    associate,
    endDate,
    selectedReport,
    startDate,
    status,
  ]);

  const chart = chartOptions[chartType];

  function chooseReport(id) {
    setSelectedReport(id);
    setStatus("Todos");
    setAssociate("Todos");
  }

  function clearFilters() {
    setStartDate("");
    setEndDate("");
    setStatus("Todos");
    setAssociate("Todos");
  }

  function exportReportToPDF() {
    const doc = new jsPDF({
      orientation:
        columns[selectedReport].length > 5
          ? "landscape"
          : "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const usableWidth = pageWidth - margin * 2;
    const reportColumns = columns[selectedReport];
    const columnWidth = usableWidth / reportColumns.length;

    const textValue = (item, key) => {
      const value = item?.[key];

      if (["amount", "pending", "balance"].includes(key)) {
        return value == null ? "" : formatCurrency(value);
      }

      if (key === "date") {
        return value ? formatDate(value) : "";
      }

      return value == null ? "" : String(value);
    };

    const drawHeader = () => {
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("CoopSystem", margin, 18);

      doc.setFontSize(12);
      doc.text(
        `Reporte de ${selectedCategory.title}`,
        margin,
        26
      );

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generado: ${new Date().toLocaleString("es-CO")}`,
        margin,
        32
      );

      doc.text(
        `Registros: ${results.length}`,
        pageWidth - margin,
        32,
        { align: "right" }
      );

      let x = margin;
      const headerY = 42;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);

      reportColumns.forEach(([label]) => {
        doc.text(
          String(label).substring(0, 18),
          x,
          headerY
        );
        x += columnWidth;
      });

      doc.line(
        margin,
        headerY + 2,
        pageWidth - margin,
        headerY + 2
      );
    };

    let y = 50;
    drawHeader();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);

    results.forEach((item) => {
      if (y > pageHeight - 15) {
        doc.addPage();
        drawHeader();
        y = 50;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
      }

      let x = margin;

      reportColumns.forEach(([, key]) => {
        const value = textValue(item, key);
        const lines = doc.splitTextToSize(
          value,
          Math.max(columnWidth - 2, 8)
        );

        doc.text(lines[0] ?? "", x, y);
        x += columnWidth;
      });

      y += 7;
    });

    doc.save(
      `reporte-${selectedReport}-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`
    );
  }

  function exportReportToExcel() {
  const reportColumns = columns[selectedReport];

  const excelData = results.map((item) => {
    const row = {};

    reportColumns.forEach(([label, key]) => {
      let value = item[key];

      if (["amount", "pending", "balance"].includes(key)) {
        value = Number(value ?? 0);
      }

      if (key === "date") {
        value = item[key] ?? "";
      }

      if (key === "status") {
        value = item[key] ?? "";
      }

      row[label] = value ?? "";
    });

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    selectedCategory.title.substring(0, 31)
  );

  worksheet["!cols"] = reportColumns.map(([label]) => ({
    wch: Math.max(label.length + 2, 18),
  }));

  XLSX.writeFile(
    workbook,
    `reporte-${selectedReport}-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`
  );
}

  function renderValue(item, key) {
    if (
      ["amount", "pending", "balance"].includes(key)
    ) {
      return formatCurrency(item[key]);
    }

    if (key === "date") {
      return formatDate(item[key]);
    }

    if (key === "status") {
      return (
        <Badge
          variant={
            statusVariant[item[key]] ?? "neutral"
          }
        >
          {item[key]}
        </Badge>
      );
    }

    return item[key];
  }

  return (
    <>
      <style>{`
        @media print {
          @page {
            margin: 12mm;
          }

          body * {
            visibility: hidden !important;
          }

          .print-report,
          .print-report * {
            visibility: visible !important;
          }

          .print-report {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          .print-actions {
            display: none !important;
          }

          .print-report table {
            width: 100% !important;
            min-width: 0 !important;
          }

          .print-report [class*="overflow"] {
            overflow: visible !important;
          }

          .print-report th,
          .print-report td {
            padding: 6px 8px !important;
            font-size: 10px !important;
          }
        }
      `}</style>

      <PageContainer>

        {/* =====================================================
            ENCABEZADO
        ===================================================== */}

        <PageHeader
          eyebrow="Centro de reportes gerenciales"
          subtitle="Consulta indicadores, tendencias y resultados operativos de la cooperativa."
          title="Reportes"
        />

        {/* =====================================================
            ERROR DEL DASHBOARD
        ===================================================== */}

        {dashboardError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {dashboardError}
          </div>
        )}

        {/* =====================================================
            INDICADORES REALES
        ===================================================== */}

        <SummaryCards
          items={[
            {
              title: "Total asociados",

              value: dashboardLoading
                ? "..."
                : dashboardError
                  ? "—"
                  : dashboard?.totalAssociates ?? 0,

              subtitle:
                "Registrados en la cooperativa",

              icon: <Users size={28} />,

              color:
                "bg-blue-50 text-blue-600",
            },

            {
              title: "Cuentas de ahorro",

              value: dashboardLoading
                ? "..."
                : dashboardError
                  ? "—"
                  : dashboard?.activeSavingsAccounts ?? 0,

              subtitle:
                "Productos de ahorro activos",

              icon: <PiggyBank size={28} />,

              color:
                "bg-emerald-50 text-emerald-600",
            },

            {
              title: "Total préstamos",

              value: dashboardLoading
                ? "..."
                : dashboardError
                  ? "—"
                  : dashboard?.activeLoans ?? 0,

              subtitle:
                "Créditos vigentes",

              icon: <CreditCard size={28} />,

              color:
                "bg-violet-50 text-violet-600",
            },

            {
              title: "Total transacciones",

              value: dashboardLoading
                ? "..."
                : dashboardError
                  ? "—"
                  : dashboard?.totalTransactions ?? 0,

              subtitle:
                "Movimientos registrados",

              icon: <WalletCards size={28} />,

              color:
                "bg-amber-50 text-amber-600",
            },
          ]}
        />

        {/* =====================================================
            CATEGORÍAS
        ===================================================== */}

        <DataSection
          className="p-6"
          description="Selecciona una categoría para consultar su información consolidada."
          title="Categorías de reportes"
          titleClassName="text-lg font-extrabold tracking-tight text-slate-900"
        >
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {reportCategories.map((category) => {
              const Icon = category.icon;

              return (
                <Card
                  className="flex h-full flex-col p-5"
                  key={category.id}
                >
                  <div
                    className={`grid h-11 w-11 place-items-center rounded-xl ${category.color}`}
                  >
                    <Icon size={21} />
                  </div>

                  <h3 className="mt-4 text-lg font-extrabold tracking-tight text-slate-900">
                    {category.title}
                  </h3>

                  <p className="mt-2 text-sm font-medium text-slate-500">
                    {category.description}
                  </p>

                  <Button
                    className="mt-5 w-full"
                    onClick={() =>
                      chooseReport(category.id)
                    }
                    size="sm"
                    variant={
                      selectedReport === category.id
                        ? "primary"
                        : "secondary"
                    }
                  >
                    Consultar
                  </Button>
                </Card>
              );
            })}
          </div>
        </DataSection>

        {/* =====================================================
            FILTROS
        ===================================================== */}

        <DataSection
          className="p-5 sm:p-6"
          title="Filtros generales"
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(10rem,.75fr)_minmax(10rem,.75fr)_minmax(12rem,.9fr)_minmax(10rem,.75fr)_minmax(12rem,.9fr)_auto] xl:items-end">

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Fecha inicial
              </span>

              <Input
                aria-label="Fecha inicial"
                onChange={(event) =>
                  setStartDate(event.target.value)
                }
                type="date"
                value={startDate}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Fecha final
              </span>

              <Input
                aria-label="Fecha final"
                onChange={(event) =>
                  setEndDate(event.target.value)
                }
                type="date"
                value={endDate}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Tipo de reporte
              </span>

              <select
                className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                onChange={(event) =>
                  chooseReport(event.target.value)
                }
                value={selectedReport}
              >
                {reportCategories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Estado
              </span>

              <select
                className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                value={status}
              >
                <option>Todos</option>

                {[
                  ...new Set(
                    (
                      selectedReport === "associates"
                        ? associates
                        : selectedReport === "savings"
                          ? savings
                          : selectedReport === "loans"
                            ? loans
                            : selectedReport === "transactions"
                              ? transactions
                              : reportData[selectedReport]
                    ).map((item) => item.status)
                  ),
                ].map((itemStatus) => (
                  <option
                    key={itemStatus}
                    value={itemStatus}
                  >
                    {itemStatus}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Asociado
              </span>

              <select
                className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                onChange={(event) =>
                  setAssociate(event.target.value)
                }
                value={associate}
              >
                <option value="Todos">
                  Todos
                </option>

                {(selectedReport === "associates"
                  ? associates.map((item) => [
                      item.code,
                      item.name,
                    ])
                  : selectedReport === "loans"
                    ? [
                        ...new Map(
                          loans.map((item) => [
                            item.associate,
                            item.associate,
                          ])
                        ),
                      ].map(([name]) => [
                        name,
                        name,
                      ])
                    : associateOptions
                ).map(([code, name]) => (
                  <option
                    key={code}
                    value={code}
                  >
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <Button
              className="w-full xl:w-auto"
              onClick={clearFilters}
              variant="secondary"
            >
              Limpiar filtros
            </Button>
          </div>
        </DataSection>

        {/* =====================================================
            TABLA
        ===================================================== */}

        <DataSection
          action={
            <div className="print-actions flex flex-wrap gap-2">

              <Button
                onClick={() =>
                  setIsPreviewOpen(true)
                }
                size="sm"
                variant="secondary"
              >
                Vista previa
              </Button>

              <Button
                onClick={() => window.print()}
                size="sm"
                variant="secondary"
              >
                <Printer size={16} />
                Imprimir
              </Button>

              <Button
                onClick={exportReportToPDF}
                size="sm"
                variant="secondary"
              >
                Exportar PDF
              </Button>

              <Button
                onClick={exportReportToExcel}
                size="sm"
                variant="secondary"
              >
                Exportar Excel
              </Button>

            </div>
          }
          className="print-report overflow-hidden p-0"
          description={`${results.length} registros para ${selectedCategory.title.toLowerCase()}.`}
          headerClassName="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 xl:flex-row xl:items-center xl:justify-between"
          title={`Reporte de ${selectedCategory.title.toLowerCase()}`}
        >
          <Table className="min-w-[760px]">

            <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500">
              <tr>
                {columns[selectedReport].map(
                  ([label]) => (
                    <th
                      className="px-6 py-4"
                      key={label}
                    >
                      {label}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {results.map((item) => (
                <tr
                  className="transition hover:bg-slate-50/70"
                  key={
                    item.code ??
                    item.account ??
                    item.number
                  }
                >
                  {columns[selectedReport].map(
                    ([label, key]) => (
                      <td
                        className="px-6 py-4 text-sm font-semibold text-slate-700"
                        key={label}
                      >
                        {renderValue(item, key)}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>

          </Table>
        </DataSection>

        {/* =====================================================
            GRÁFICAS
        ===================================================== */}

        <DataSection
          action={
            <div className="flex flex-wrap gap-2">
              {Object.entries(chartOptions).map(
                ([id, option]) => (
                  <Button
                    key={id}
                    onClick={() =>
                      setChartType(id)
                    }
                    size="sm"
                    variant={
                      chartType === id
                        ? "primary"
                        : "secondary"
                    }
                  >
                    {option.label}
                  </Button>
                )
              )}
            </div>
          }
          className="p-6"
          description="Evolución mensual de los principales indicadores operativos."
          headerClassName="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
          title="Estadísticas gerenciales"
          titleClassName="text-lg font-extrabold tracking-tight text-slate-900"
        >
          <div className="mt-5">
            <Suspense
              fallback={
                <Loader label="Cargando estadísticas..." />
              }
            >
              <LoanChart
                data={chart.data}
                dataKey={chart.dataKey}
                gradientId={`reports-${chartType}`}
                label={chart.label}
                valueSuffix={chart.valueSuffix}
              />
            </Suspense>
          </div>
        </DataSection>

      </PageContainer>

      {/* =======================================================
          MODAL VISTA PREVIA
      ======================================================= */}

      <Modal
        isOpen={isPreviewOpen}
        onClose={() =>
          setIsPreviewOpen(false)
        }
        size="lg"
        title={`Vista previa: ${selectedCategory.title}`}
      >
        <div className="space-y-4">

          <p className="text-sm font-medium text-slate-600">
            La vista previa incluye los{" "}
            {results.length} registros que cumplen
            los filtros seleccionados.
          </p>

          <div className="max-h-80 overflow-auto rounded-xl border border-slate-200">

            <Table className="min-w-[680px]">

              <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                <tr>
                  {columns[selectedReport].map(
                    ([label]) => (
                      <th
                        className="px-4 py-3"
                        key={label}
                      >
                        {label}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">

                {results.map((item) => (
                  <tr
                    key={
                      item.code ??
                      item.account ??
                      item.number
                    }
                  >
                    {columns[selectedReport].map(
                      ([label, key]) => (
                        <td
                          className="px-4 py-3 text-sm font-semibold text-slate-700"
                          key={label}
                        >
                          {renderValue(
                            item,
                            key
                          )}
                        </td>
                      )
                    )}
                  </tr>
                ))}

              </tbody>

            </Table>

          </div>

          <div className="flex justify-end">

            <Button
              onClick={() =>
                setIsPreviewOpen(false)
              }
              variant="secondary"
            >
              Cerrar
            </Button>

          </div>

        </div>
      </Modal>

      <ToastProvider />
    </>
  );
}