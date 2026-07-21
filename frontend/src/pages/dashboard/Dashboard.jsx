import { lazy, Suspense, useState } from "react";
import { ArrowRight, CheckCircle2, CircleAlert, Clock3, HandCoins, Landmark, TrendingUp, Users, WalletCards } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import DataSection from "../../components/ui/DataSection";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
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

const pendingItems = [
  { title: "Préstamos pendientes", description: "15 solicitudes de crédito están en revisión.", count: 15, route: "/prestamos" },
  { title: "Asociados pendientes", description: "4 registros requieren completar su información.", count: 4, route: "/asociados" },
  { title: "Cajas pendientes", description: "1 caja requiere arqueo y cierre de jornada.", count: 1, route: "/tesoreria" },
  { title: "Solicitudes pendientes", description: "8 solicitudes esperan una decisión de gestión.", count: 8, route: "/prestamos" },
];

const systemMovements = [
  { id: "TRX-0031", date: "2026-07-21T10:24:00", type: "Consignación", associate: "José Manuel Veltrán", amount: "$ 500.000", status: "Completado" },
  { id: "TRX-0030", date: "2026-07-21T09:48:00", type: "Desembolso", associate: "María Camila Ulloa", amount: "$ 8.000.000", status: "Pendiente" },
  { id: "TRX-0029", date: "2026-07-20T16:16:00", type: "Retiro", associate: "Liliana Rodríguez Mora", amount: "$ 275.000", status: "Completado" },
  { id: "TRX-0028", date: "2026-07-20T11:02:00", type: "Pago", associate: "Edgar Peñalosa Hernández", amount: "$ 850.000", status: "Completado" },
  { id: "TRX-0027", date: "2026-07-19T15:35:00", type: "Ajuste", associate: "Comercializadora Andina S.A.S.", amount: "$ 125.000", status: "Completado" },
].sort((first, second) => new Date(second.date) - new Date(first.date));

function formatMovementDate(value) {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)).replace(/\./g, "");
}

export default function Dashboard() {
  const [activeModal, setActiveModal] = useState(null);
  const navigate = useNavigate();

  function goTo(route) {
    setActiveModal(null);
    navigate(route);
  }

  return (
    <>
    <PageContainer>
      <PageHeader aside={<p className="text-sm font-medium text-slate-500">Actualizado hoy, 10:30 a. m.</p>} eyebrow="Resumen general" subtitle="Consulta el estado operativo de tu cooperativa." title="Panel de control" />
      <SummaryCards items={summaryCards} />
      <section className="grid gap-5 xl:grid-cols-3">
        <DataSection className="p-6 xl:col-span-2" description="Evolución durante los últimos seis meses." headerClassName="flex items-start justify-between gap-4" title="Solicitudes de préstamo" titleClassName="text-lg font-extrabold tracking-tight text-slate-900" action={<div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700"><TrendingUp size={16} /> +36%</div>}><div className="mt-5"><Suspense fallback={<Loader label="Cargando evolución..." />}><LoanChart /></Suspense></div></DataSection>
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-extrabold tracking-tight text-slate-900">Atención requerida</h2><p className="mt-1 text-sm font-medium text-slate-500">Tareas pendientes de gestión.</p></div><div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600"><CircleAlert size={21} /></div></div>
          <div className="mt-6 divide-y divide-slate-100"><div className="flex items-center justify-between gap-4 py-3 pt-0"><p className="text-sm font-semibold text-slate-600">Solicitudes por revisar</p><span className="text-lg font-extrabold text-slate-900">15</span></div><div className="flex items-center justify-between gap-4 py-3"><p className="text-sm font-semibold text-slate-600">Cuotas próximas a vencer</p><span className="text-lg font-extrabold text-slate-900">8</span></div><div className="flex items-center justify-between gap-4 py-3 pb-0"><p className="text-sm font-semibold text-slate-600">Documentos pendientes</p><span className="text-lg font-extrabold text-slate-900">4</span></div></div>
          <button className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition hover:text-blue-700" onClick={() => setActiveModal("pending")} type="button">Gestionar pendientes <ArrowRight size={16} /></button>
        </Card>
      </section>
      <DataSection className="overflow-hidden p-0" description="Últimos movimientos registrados en el sistema." title="Actividad reciente" action={<button className="inline-flex items-center gap-1.5 text-left text-sm font-bold text-blue-600 transition hover:text-blue-700" onClick={() => setActiveModal("movements")} type="button">Ver movimientos <ArrowRight size={16} /></button>}>
        <Table className="min-w-225"><thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-5">ID</th><th className="px-6 py-5">Asociado</th><th className="px-6 py-5">Movimiento</th><th className="px-6 py-5">Valor</th><th className="px-6 py-5">Estado</th><th className="px-6 py-5">Fecha</th></tr></thead><tbody className="divide-y divide-slate-200">{recentActivity.map((item) => { const completed = item.status === "Completado"; return <tr className="transition hover:bg-slate-50/70" key={item.id}><td className="px-6 py-5 text-sm font-extrabold text-slate-800">{item.id}</td><td className="px-6 py-5 text-sm font-bold text-slate-800">{item.associate}</td><td className="px-6 py-5 text-sm font-semibold text-slate-600">{item.action}</td><td className="px-6 py-5 text-sm font-extrabold text-slate-800">{item.amount}</td><td className="px-6 py-5"><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${completed ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" : "bg-amber-100 text-amber-700 ring-1 ring-amber-200"}`}>{completed ? <CheckCircle2 size={16} /> : <Clock3 size={16} />}{item.status}</span></td><td className="px-6 py-5 text-sm font-semibold text-slate-600">{item.date}</td></tr>; })}</tbody></Table>
      </DataSection>
    </PageContainer>
    <Modal isOpen={activeModal === "pending"} onClose={() => setActiveModal(null)} size="lg" title="Gestionar pendientes">
      <p className="text-sm font-medium text-slate-500">Revisa las tareas operativas pendientes y continúa en el módulo correspondiente.</p>
      <div className="mt-5 divide-y divide-slate-200 rounded-xl border border-slate-200">
        {pendingItems.map((item) => <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between" key={item.title}>
          <div className="flex items-start gap-3"><span className="grid h-10 min-w-10 place-items-center rounded-xl bg-amber-50 text-sm font-extrabold text-amber-700">{item.count}</span><div><h4 className="font-extrabold text-slate-900">{item.title}</h4><p className="mt-1 text-sm font-medium text-slate-500">{item.description}</p></div></div>
          <Button onClick={() => goTo(item.route)} size="sm" variant="secondary">Ir <ArrowRight size={16} /></Button>
        </div>)}
      </div>
    </Modal>
    <Modal isOpen={activeModal === "movements"} onClose={() => setActiveModal(null)} size="lg" title="Últimos movimientos del sistema">
      <p className="text-sm font-medium text-slate-500">Movimientos simulados ordenados del más reciente al más antiguo.</p>
      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
        <Table className="min-w-[760px]"><thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Asociado</th><th className="px-4 py-3">Valor</th><th className="px-4 py-3">Estado</th></tr></thead><tbody className="divide-y divide-slate-200">{systemMovements.map((movement) => <tr className="transition hover:bg-slate-50/70" key={movement.id}><td className="px-4 py-4 text-sm font-semibold text-slate-600">{formatMovementDate(movement.date)}</td><td className="px-4 py-4 text-sm font-extrabold text-slate-800">{movement.type}</td><td className="px-4 py-4 text-sm font-semibold text-slate-600">{movement.associate}</td><td className="px-4 py-4 text-sm font-extrabold text-slate-800">{movement.amount}</td><td className="px-4 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${movement.status === "Completado" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-amber-200"}`}>{movement.status}</span></td></tr>)}</tbody></Table>
      </div>
      <div className="mt-5 flex justify-end"><Button onClick={() => goTo("/transacciones")}>Ir a Transacciones <ArrowRight size={17} /></Button></div>
    </Modal>
    </>
  );
}
