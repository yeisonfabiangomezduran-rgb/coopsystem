import { ArrowDownRight, ArrowUpRight, Banknote, Landmark, Plus, ReceiptText, WalletCards } from "lucide-react";
import ActionMenu from "../../components/ui/ActionMenu";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import DataSection from "../../components/ui/DataSection";
import EmptyState from "../../components/ui/EmptyState";
import FilterBar from "../../components/ui/FilterBar";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import SummaryCards from "../../components/ui/SummaryCards";
import Table from "../../components/ui/Table";

const treasuryMovements = [
  { id: "MOV-0019", type: "Ingreso", concept: "Pago de cuota PRE-0042", amount: "$ 850.000", status: "Confirmado", date: "02 may. 2026 · 10:24 a. m.", user: "Ana Gómez" },
  { id: "MOV-0020", type: "Egreso", concept: "Desembolso PRE-0020", amount: "$ 8.000.000", status: "Confirmado", date: "02 may. 2026 · 09:48 a. m.", user: "Carlos Ramírez" },
  { id: "MOV-0021", type: "Ingreso", concept: "Aporte de asociado", amount: "$ 500.000", status: "Pendiente", date: "02 may. 2026 · 09:12 a. m.", user: "Ana Gómez" },
  { id: "MOV-0022", type: "Egreso", concept: "Pago de servicios", amount: "$ 275.000", status: "Confirmado", date: "02 may. 2026 · 08:35 a. m.", user: "Laura Gómez" },
  { id: "MOV-0023", type: "Ingreso", concept: "Consignación de ahorros", amount: "$ 1.250.000", status: "Anulado", date: "01 may. 2026 · 04:16 p. m.", user: "Andrés Torres" },
];

const summaryCards = [
  { title: "Caja general", value: "$450 M", subtitle: "Saldo al cierre de hoy", icon: <Landmark size={28} />, color: "bg-blue-50 text-blue-600" },
  { title: "Ingresos de hoy", value: "$12,8 M", subtitle: "24 movimientos registrados", icon: <ArrowUpRight size={28} />, color: "bg-emerald-50 text-emerald-600" },
  { title: "Egresos de hoy", value: "$9,4 M", subtitle: "11 movimientos registrados", icon: <ArrowDownRight size={28} />, color: "bg-violet-50 text-violet-600" },
  { title: "Saldo disponible", value: "$450 M", subtitle: "Después de movimientos del día", icon: <ReceiptText size={28} />, color: "bg-amber-50 text-amber-600" },
];

const treasuryFilters = [
  { id: "type", label: "Tipo", ariaLabel: "Filtrar por tipo", options: ["Todos", "Ingreso", "Egreso"] },
  { id: "status", label: "Estado", ariaLabel: "Filtrar por estado", options: ["Todos", "Confirmado", "Pendiente", "Anulado"] },
  { id: "period", label: "Fecha", ariaLabel: "Filtrar por fecha", options: ["Hoy", "Esta semana", "Este mes"] },
];

const statusVariant = { Confirmado: "success", Pendiente: "warning", Anulado: "neutral" };

export default function Treasury() {
  return (
    <PageContainer>
      <PageHeader eyebrow="Gestión de tesorería" title="Tesorería" subtitle="Controla los ingresos, egresos y el estado general de caja." action={<Button><Plus size={18} strokeWidth={2.5} />Registrar movimiento</Button>} />
      <SummaryCards items={summaryCards} />

      <section className="grid gap-5 xl:grid-cols-3">
        <DataSection className="p-6 xl:col-span-2" description="Información consolidada de los movimientos registrados hoy." headerClassName="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between" title="Resumen diario" titleClassName="text-lg font-extrabold tracking-tight text-slate-900" action={<p className="text-sm font-medium text-slate-500">02 may. 2026</p>}>
          <div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-emerald-50 p-5"><div className="flex items-center justify-between gap-4"><p className="text-sm font-bold text-emerald-700">Total ingresos</p><ArrowUpRight size={20} className="text-emerald-600" /></div><p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">$12,8 M</p><p className="mt-2 text-sm font-semibold text-emerald-700">24 movimientos confirmados</p></div><div className="rounded-xl bg-violet-50 p-5"><div className="flex items-center justify-between gap-4"><p className="text-sm font-bold text-violet-700">Total egresos</p><ArrowDownRight size={20} className="text-violet-600" /></div><p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">$9,4 M</p><p className="mt-2 text-sm font-semibold text-violet-700">11 movimientos confirmados</p></div></div>
          <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2"><div className="flex items-center justify-between gap-4"><p className="text-sm font-semibold text-slate-500">Saldo final</p><p className="text-lg font-extrabold text-emerald-600">$450 M</p></div><div className="flex items-center justify-between gap-4"><p className="text-sm font-semibold text-slate-500">Última actualización</p><p className="text-sm font-bold text-slate-800">10:24 a. m.</p></div></div>
        </DataSection>

        <Card className="p-6"><div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-extrabold tracking-tight text-slate-900">Estado de caja</h2><p className="mt-1 text-sm font-medium text-slate-500">Caja principal de la cooperativa.</p></div><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><WalletCards size={21} /></div></div><div className="mt-6 divide-y divide-slate-100"><div className="flex items-center justify-between gap-4 py-3 pt-0"><p className="text-sm font-semibold text-slate-600">Estado actual</p><Badge variant="success">Abierta</Badge></div><div className="flex items-center justify-between gap-4 py-3"><p className="text-sm font-semibold text-slate-600">Apertura</p><span className="text-sm font-bold text-slate-800">08:00 a. m.</span></div><div className="flex items-center justify-between gap-4 py-3"><p className="text-sm font-semibold text-slate-600">Último movimiento</p><span className="text-sm font-bold text-slate-800">10:24 a. m.</span></div><div className="flex items-center justify-between gap-4 py-3 pb-0"><p className="text-sm font-semibold text-slate-600">Responsable</p><span className="text-sm font-bold text-slate-800">Ana Gómez</span></div></div><div className="mt-6 border-t border-slate-100 pt-5"><h3 className="text-sm font-extrabold text-slate-900">Acciones rápidas</h3><div className="mt-3 grid grid-cols-2 gap-2"><Button className="w-full" size="sm" variant="secondary"><ArrowUpRight size={16} />Ingreso</Button><Button className="w-full" size="sm" variant="secondary"><ArrowDownRight size={16} />Egreso</Button></div></div></Card>
      </section>

      <DataSection className="overflow-hidden p-0" description="Últimos movimientos registrados en caja." title="Movimientos recientes" action={<p className="text-sm font-bold text-blue-600">Ver todos</p>}>
        <div className="divide-y divide-slate-200">{treasuryMovements.slice(0, 3).map((movement) => <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between" key={movement.id}><div className="flex items-center gap-3"><div className={`grid h-10 w-10 place-items-center rounded-xl ${movement.type === "Ingreso" ? "bg-emerald-50 text-emerald-600" : "bg-violet-50 text-violet-600"}`}>{movement.type === "Ingreso" ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}</div><div><p className="text-sm font-bold text-slate-800">{movement.concept}</p><p className="mt-0.5 text-xs font-medium text-slate-500">{movement.id} · {movement.date}</p></div></div><div className="flex items-center gap-4 sm:justify-end"><p className="text-sm font-extrabold text-slate-900">{movement.amount}</p><Badge variant={statusVariant[movement.status]}>{movement.status}</Badge></div></div>)}</div>
      </DataSection>

      <FilterBar filters={treasuryFilters} gridClassName="xl:grid-cols-[minmax(0,1.8fr)_minmax(12rem,0.8fr)_minmax(10rem,0.7fr)_minmax(10rem,0.7fr)_auto]" idPrefix="treasury" searchAriaLabel="Buscar movimiento" searchLabel="Buscar movimiento" searchPlaceholder="Código o concepto" />
      <DataSection className="overflow-hidden p-0" description={`${treasuryMovements.length} movimientos registrados.`} headerClassName="border-b border-slate-200 px-6 py-5" title="Movimientos de tesorería">
        {treasuryMovements.length === 0 ? <EmptyState icon={<Banknote size={24} />} title="Aún no hay movimientos registrados" description="Cuando registres un movimiento, su información aparecerá en este listado." action={<Button><Plus size={18} strokeWidth={2.5} />Registrar movimiento</Button>} /> : (
          <Table className="min-w-300"><thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4">Código</th><th className="px-6 py-4">Concepto</th><th className="px-6 py-4">Tipo</th><th className="px-6 py-4">Valor</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4">Fecha</th><th className="px-6 py-4">Usuario</th><th className="px-6 py-4 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-slate-200">{treasuryMovements.map((movement) => <tr className="transition hover:bg-slate-50/70" key={movement.id}><td className="px-6 py-4 text-sm font-extrabold text-slate-800">{movement.id}</td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{movement.concept}</td><td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 text-sm font-bold ${movement.type === "Ingreso" ? "text-emerald-600" : "text-violet-600"}`}>{movement.type === "Ingreso" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}{movement.type}</span></td><td className="px-6 py-4 text-sm font-extrabold text-slate-800">{movement.amount}</td><td className="px-6 py-4"><Badge variant={statusVariant[movement.status]}>{movement.status}</Badge></td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{movement.date}</td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{movement.user}</td><td className="px-6 py-4"><ActionMenu label={movement.id} /></td></tr>)}</tbody></Table>
        )}
      </DataSection>
    </PageContainer>
  );
}
