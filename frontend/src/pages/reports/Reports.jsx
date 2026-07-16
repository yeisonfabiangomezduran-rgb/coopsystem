import { FileChartColumn, FileText, FolderKanban, Plus, Sparkles, TrendingUp } from "lucide-react";
import ActionMenu from "../../components/ui/ActionMenu";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import DataSection from "../../components/ui/DataSection";
import EmptyState from "../../components/ui/EmptyState";
import FilterBar from "../../components/ui/FilterBar";
import Loader from "../../components/ui/Loader";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import SummaryCards from "../../components/ui/SummaryCards";
import Table from "../../components/ui/Table";

const summaryCards = [
  { title: "Reportes generados", value: "128", subtitle: "Este mes", icon: <FileText size={28} />, color: "bg-blue-50 text-blue-600" },
  { title: "Reportes pendientes", value: "12", subtitle: "En cola", icon: <FolderKanban size={28} />, color: "bg-amber-50 text-amber-600" },
  { title: "Exportaciones realizadas", value: "84", subtitle: "Última semana", icon: <TrendingUp size={28} />, color: "bg-emerald-50 text-emerald-600" },
  { title: "Última actualización", value: "10:30 a. m.", subtitle: "Hoy", icon: <Sparkles size={28} />, color: "bg-violet-50 text-violet-600" },
];

const availableReports = [
  {
    name: "Reporte de asociados",
    description: "Resumen de asociados activos, nuevas afiliaciones y estado de cumplimiento.",
    lastGenerated: "Hoy · 09:15 a. m.",
  },
  {
    name: "Reporte de ahorros",
    description: "Detalle del saldo total, cuentas activas y evolución mensual del ahorro.",
    lastGenerated: "Ayer · 04:20 p. m.",
  },
  {
    name: "Reporte de préstamos",
    description: "Análisis de cartera, aprobación de solicitudes y morosidad.",
    lastGenerated: "Ayer · 01:10 p. m.",
  },
  {
    name: "Reporte de tesorería",
    description: "Movimientos de caja, flujo diario y saldo disponible consolidado.",
    lastGenerated: "Hace 2 días · 08:45 a. m.",
  },
  {
    name: "Reporte de transacciones",
    description: "Historial de operaciones, montos y estados de procesamiento.",
    lastGenerated: "Hace 2 días · 12:00 p. m.",
  },
];

const reportHistory = [
  { id: "RPT-0019", report: "Reporte de asociados", category: "Socios", generatedBy: "Ana Gómez", date: "02 may. 2026", status: "Disponible" },
  { id: "RPT-0020", report: "Reporte de ahorros", category: "Finanzas", generatedBy: "Carlos Ramírez", date: "02 may. 2026", status: "Procesando" },
  { id: "RPT-0021", report: "Reporte de préstamos", category: "Crédito", generatedBy: "Laura Gómez", date: "01 may. 2026", status: "Error" },
  { id: "RPT-0022", report: "Reporte de tesorería", category: "Caja", generatedBy: "Andrés Torres", date: "01 may. 2026", status: "Disponible" },
];

const statusVariant = {
  Disponible: "success",
  Procesando: "warning",
  Error: "neutral",
};

const reportFilters = [
  { id: "category", label: "Categoría", ariaLabel: "Filtrar por categoría", options: ["Todas", "Socios", "Finanzas", "Crédito", "Caja"] },
  { id: "period", label: "Periodo", ariaLabel: "Filtrar por periodo", options: ["Último mes", "Última semana", "Hoy"] },
  { id: "status", label: "Estado", ariaLabel: "Filtrar por estado", options: ["Todos", "Disponible", "Procesando", "Error"] },
];

export default function Reports() {
  return (
    <PageContainer>
      <PageHeader
        action={<Button><Plus size={18} strokeWidth={2.5} />Generar reporte</Button>}
        eyebrow="Gestión de reportes"
        subtitle="Consulta y analiza la información consolidada de la cooperativa."
        title="Reportes"
      />

      <SummaryCards items={summaryCards} />

      <DataSection
        className="p-6"
        description="Seleccione un tipo de reporte para visualizar su resumen ejecutivo."
        headerClassName="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
        title="Reportes disponibles"
        titleClassName="text-lg font-extrabold tracking-tight text-slate-900"
      >
        <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {availableReports.map((report) => (
            <Card key={report.name} className="flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <FileChartColumn size={21} />
                </div>
                <Badge variant="success">Disponible</Badge>
              </div>
              <h3 className="mt-4 text-lg font-extrabold tracking-tight text-slate-900">{report.name}</h3>
              <p className="mt-2 text-sm font-medium text-slate-500">{report.description}</p>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
                <span className="font-semibold">Última generación</span>
                <span className="font-bold text-slate-700">{report.lastGenerated}</span>
              </div>
              <Button className="mt-5 w-full" size="sm" variant="secondary">Generar</Button>
            </Card>
          ))}
        </div>
      </DataSection>

      <FilterBar
        filters={reportFilters}
        gridClassName="xl:grid-cols-[minmax(0,1.8fr)_minmax(12rem,0.8fr)_minmax(10rem,0.7fr)_minmax(10rem,0.7fr)_auto]"
        idPrefix="reports"
        searchAriaLabel="Buscar reporte"
        searchLabel="Buscar reporte"
        searchPlaceholder="Código o nombre del reporte"
      />

      <DataSection
        className="overflow-hidden p-0"
        description="Historial de reportes generados en el sistema."
        headerClassName="border-b border-slate-200 px-6 py-5"
        title="Historial de reportes"
      >
        {reportHistory.length === 0 ? (
          <EmptyState
            action={<Button><Plus size={18} strokeWidth={2.5} />Generar reporte</Button>}
            description="Cuando generes un reporte, aparecerá aquí su historial."
            icon={<FileText size={24} />}
            title="Aún no hay reportes generados"
          />
        ) : (
          <Table className="min-w-[320px]">
            <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Reporte</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Generado por</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reportHistory.map((report) => (
                <tr className="transition hover:bg-slate-50/70" key={report.id}>
                  <td className="px-6 py-4 text-sm font-extrabold text-slate-800">{report.id}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">{report.report}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">{report.category}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">{report.generatedBy}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">{report.date}</td>
                  <td className="px-6 py-4"><Badge variant={statusVariant[report.status]}>{report.status}</Badge></td>
                  <td className="px-6 py-4"><ActionMenu label={report.id} /></td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </DataSection>

      <Loader label="Preparando vista de reportes..." />
    </PageContainer>
  );
}
