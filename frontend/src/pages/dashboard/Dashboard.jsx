import { lazy, Suspense } from "react";
import { ArrowRight, CheckCircle2, CircleAlert, Clock3, HandCoins, Landmark, TrendingUp, Users, WalletCards } from "lucide-react";
import Card from "../../components/ui/Card";
import DataSection from "../../components/ui/DataSection";
import Loader from "../../components/ui/Loader";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import SummaryCards from "../../components/ui/SummaryCards";
import Table from "../../components/ui/Table";

const LoanChart = lazy(() => import("./LoanChart"));
const recentActivity = [
  { id: "ASO-0019", associate: "Edgar Peñalosa Hernández", action: "Apertura de cuenta de ahorros", amount: "$ 500.000", date: "02 may. 2026", status: "Completado" },
  { id: "PRE-0020", associate: "María Camila Ulloa", action: "Solicitud de préstamo", amount: "$ 8.000.000", date: "30 abr. 2026", status: "En revisión" },
  { id: "AHO-0021", associate: "José Manuel Veltrán", action: "Consignación de ahorros", amount: "$ 1.250.000", date: "02 may. 2026", status: "Completado" },
];
const summaryCards = [
  { title: "Asociados activos", value: "325", subtitle: "12 nuevos este mes", icon: <Users size={28} />, color: "bg-blue-50 text-blue-600" },
  { title: "Cuentas de ahorro", value: "318", subtitle: "8 aperturas hoy", icon: <WalletCards size={28} />, color: "bg-amber-50 text-amber-600" },
  { title: "Préstamos vigentes", value: "58", subtitle: "15 en revisión", icon: <HandCoins size={28} />, color: "bg-violet-50 text-violet-600" },
  { title: "Caja disponible", value: "$450 M", subtitle: "5% frente al mes anterior", icon: <Landmark size={28} />, color: "bg-emerald-50 text-emerald-600" },
];

export default function Dashboard() {
  return (
    <PageContainer>
      <PageHeader aside={<p className="text-sm font-medium text-slate-500">Actualizado hoy, 10:30 a. m.</p>} eyebrow="Resumen general" subtitle="Consulta el estado operativo de tu cooperativa." title="Panel de control" />
      <SummaryCards items={summaryCards} />
      <section className="grid gap-5 xl:grid-cols-3">
        <DataSection className="p-6 xl:col-span-2" description="Evolución durante los últimos seis meses." headerClassName="flex items-start justify-between gap-4" title="Solicitudes de préstamo" titleClassName="text-lg font-extrabold tracking-tight text-slate-900" action={<div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700"><TrendingUp size={16} /> +36%</div>}><div className="mt-5"><Suspense fallback={<Loader label="Cargando evolución..." />}><LoanChart /></Suspense></div></DataSection>
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-extrabold tracking-tight text-slate-900">Atención requerida</h2><p className="mt-1 text-sm font-medium text-slate-500">Tareas pendientes de gestión.</p></div><div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600"><CircleAlert size={21} /></div></div>
          <div className="mt-6 divide-y divide-slate-100"><div className="flex items-center justify-between gap-4 py-3 pt-0"><p className="text-sm font-semibold text-slate-600">Solicitudes por revisar</p><span className="text-lg font-extrabold text-slate-900">15</span></div><div className="flex items-center justify-between gap-4 py-3"><p className="text-sm font-semibold text-slate-600">Cuotas próximas a vencer</p><span className="text-lg font-extrabold text-slate-900">8</span></div><div className="flex items-center justify-between gap-4 py-3 pb-0"><p className="text-sm font-semibold text-slate-600">Documentos pendientes</p><span className="text-lg font-extrabold text-slate-900">4</span></div></div>
          <button className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition hover:text-blue-700">Gestionar pendientes <ArrowRight size={16} /></button>
        </Card>
      </section>
      <DataSection className="overflow-hidden p-0" description="Últimos movimientos registrados en el sistema." title="Actividad reciente" action={<button className="inline-flex items-center gap-1.5 text-left text-sm font-bold text-blue-600 transition hover:text-blue-700">Ver movimientos <ArrowRight size={16} /></button>}>
        <Table className="min-w-225"><thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-5">ID</th><th className="px-6 py-5">Asociado</th><th className="px-6 py-5">Movimiento</th><th className="px-6 py-5">Valor</th><th className="px-6 py-5">Estado</th><th className="px-6 py-5">Fecha</th></tr></thead><tbody className="divide-y divide-slate-200">{recentActivity.map((item) => { const completed = item.status === "Completado"; return <tr className="transition hover:bg-slate-50/70" key={item.id}><td className="px-6 py-5 text-sm font-extrabold text-slate-800">{item.id}</td><td className="px-6 py-5 text-sm font-bold text-slate-800">{item.associate}</td><td className="px-6 py-5 text-sm font-semibold text-slate-600">{item.action}</td><td className="px-6 py-5 text-sm font-extrabold text-slate-800">{item.amount}</td><td className="px-6 py-5"><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${completed ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" : "bg-amber-100 text-amber-700 ring-1 ring-amber-200"}`}>{completed ? <CheckCircle2 size={16} /> : <Clock3 size={16} />}{item.status}</span></td><td className="px-6 py-5 text-sm font-semibold text-slate-600">{item.date}</td></tr>; })}</tbody></Table>
      </DataSection>
    </PageContainer>
  );
}
