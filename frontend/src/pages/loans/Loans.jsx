import { lazy, Suspense } from "react";
import { BanknoteArrowDown, CircleDollarSign, FileCheck2, HandCoins, Plus, Timer } from "lucide-react";
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

const LoanChart = lazy(() => import("../dashboard/LoanChart"));

const portfolioTrend = [
  { mes: "Ene", cartera: 680 },
  { mes: "Feb", cartera: 720 },
  { mes: "Mar", cartera: 755 },
  { mes: "Abr", cartera: 790 },
  { mes: "May", cartera: 835 },
  { mes: "Jun", cartera: 880 },
];

const loans = [
  { number: "PRE-0019", associate: "Edgar Peñalosa Hernández", product: "Crédito libre inversión", amount: "$ 8.000.000", term: "24 meses", status: "En estudio", requestedAt: "02 may. 2026" },
  { number: "PRE-0020", associate: "María Camila Ulloa", product: "Crédito educativo", amount: "$ 12.500.000", term: "36 meses", status: "Aprobado", requestedAt: "30 abr. 2026" },
  { number: "PRE-0021", associate: "José Manuel Veltrán", product: "Crédito de consumo", amount: "$ 5.200.000", term: "18 meses", status: "Pendiente", requestedAt: "28 abr. 2026" },
  { number: "PRE-0022", associate: "Comercializadora Andina S.A.S.", product: "Crédito empresarial", amount: "$ 42.000.000", term: "48 meses", status: "Desembolsado", requestedAt: "26 abr. 2026" },
  { number: "PRE-0023", associate: "Liliana Rodríguez Mora", product: "Crédito libre inversión", amount: "$ 3.800.000", term: "12 meses", status: "Rechazado", requestedAt: "19 abr. 2026" },
];

const summaryCards = [
  { title: "Solicitudes activas", value: "42", subtitle: "8 nuevas esta semana", icon: <Timer size={28} />, color: "bg-blue-50 text-blue-600" },
  { title: "Préstamos aprobados", value: "28", subtitle: "6 aprobados este mes", icon: <FileCheck2 size={28} />, color: "bg-emerald-50 text-emerald-600" },
  { title: "Cartera vigente", value: "$880 M", subtitle: "7% frente al mes anterior", icon: <CircleDollarSign size={28} />, color: "bg-violet-50 text-violet-600" },
  { title: "Desembolsos del mes", value: "$94 M", subtitle: "12 operaciones realizadas", icon: <BanknoteArrowDown size={28} />, color: "bg-amber-50 text-amber-600" },
];

const loanFilters = [
  { id: "status", label: "Estado", ariaLabel: "Filtrar por estado", options: ["Todos", "Pendiente", "En estudio", "Aprobado", "Desembolsado", "Rechazado"] },
  { id: "type", label: "Tipo de préstamo", ariaLabel: "Filtrar por tipo de préstamo", options: ["Todos", "Crédito de consumo", "Crédito educativo", "Crédito libre inversión", "Crédito empresarial"] },
  { id: "advisor", label: "Asesor", ariaLabel: "Filtrar por asesor", options: ["Todos", "Carlos Ramírez", "Laura Gómez", "Andrés Torres"] },
];

const statusVariant = { Pendiente: "warning", "En estudio": "neutral", Aprobado: "success", Desembolsado: "success", Rechazado: "neutral" };

export default function Loans() {
  return (
    <PageContainer>
      <PageHeader eyebrow="Gestión de préstamos" title="Préstamos" subtitle="Gestiona las solicitudes, aprobaciones y desembolsos de préstamos." action={<Button><Plus size={18} strokeWidth={2.5} />Nuevo préstamo</Button>} />
      <SummaryCards items={summaryCards} />

      <section className="grid gap-5 xl:grid-cols-3">
        <DataSection className="p-6 xl:col-span-2" description="Evolución de la cartera vigente durante los últimos seis meses." headerClassName="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between" title="Estado de la cartera" titleClassName="text-lg font-extrabold tracking-tight text-slate-900" action={<div className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">+$200 M acumulados</div>}><div className="mt-5"><Suspense fallback={<Loader label="Cargando evolución..." />}><LoanChart data={portfolioTrend} dataKey="cartera" gradientId="portfolio-volume" label="Cartera vigente" valueSuffix="millones" /></Suspense></div></DataSection>
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-extrabold tracking-tight text-slate-900">Atención requerida</h2><p className="mt-1 text-sm font-medium text-slate-500">Tareas pendientes de gestión.</p></div><div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600"><HandCoins size={21} /></div></div>
          <div className="mt-6 divide-y divide-slate-100"><div className="flex items-center justify-between gap-4 py-3 pt-0"><p className="text-sm font-semibold text-slate-600">Solicitudes pendientes</p><Badge variant="warning">12</Badge></div><div className="flex items-center justify-between gap-4 py-3"><p className="text-sm font-semibold text-slate-600">Documentos por validar</p><Badge variant="warning">5</Badge></div><div className="flex items-center justify-between gap-4 py-3"><p className="text-sm font-semibold text-slate-600">Desembolsos programados</p><Badge variant="neutral">3</Badge></div><div className="flex items-center justify-between gap-4 py-3 pb-0"><p className="text-sm font-semibold text-slate-600">Cuotas vencidas</p><Badge variant="warning">2</Badge></div></div>
        </Card>
      </section>

      <FilterBar filters={loanFilters} gridClassName="xl:grid-cols-[minmax(0,1.8fr)_minmax(10rem,0.65fr)_minmax(12rem,0.8fr)_minmax(10rem,0.7fr)_auto]" idPrefix="loans" searchAriaLabel="Buscar préstamo" searchLabel="Buscar préstamo" searchPlaceholder="Número o nombre del asociado" />
      <DataSection className="overflow-hidden p-0" description={`${loans.length} préstamos registrados.`} headerClassName="border-b border-slate-200 px-6 py-5" title="Listado de préstamos">
        {loans.length === 0 ? <EmptyState icon={<HandCoins size={24} />} title="Aún no hay préstamos registrados" description="Cuando registres un préstamo, su información aparecerá en este listado." action={<Button><Plus size={18} strokeWidth={2.5} />Nuevo préstamo</Button>} /> : (
          <Table className="min-w-300">
            <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4">Número</th><th className="px-6 py-4">Asociado</th><th className="px-6 py-4">Producto</th><th className="px-6 py-4">Monto</th><th className="px-6 py-4">Plazo</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4">Fecha solicitud</th><th className="px-6 py-4 text-right">Acciones</th></tr></thead>
            <tbody className="divide-y divide-slate-200">{loans.map((loan) => <tr className="transition hover:bg-slate-50/70" key={loan.number}><td className="px-6 py-4 text-sm font-extrabold text-slate-800">{loan.number}</td><td className="px-6 py-4 text-sm font-bold text-slate-800">{loan.associate}</td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{loan.product}</td><td className="px-6 py-4 text-sm font-extrabold text-slate-800">{loan.amount}</td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{loan.term}</td><td className="px-6 py-4"><Badge variant={statusVariant[loan.status]}>{loan.status}</Badge></td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{loan.requestedAt}</td><td className="px-6 py-4"><ActionMenu label={loan.number} /></td></tr>)}</tbody>
          </Table>
        )}
      </DataSection>
    </PageContainer>
  );
}
