import { lazy, Suspense } from "react";
import { CircleDollarSign, Landmark, Plus, WalletCards } from "lucide-react";
import ActionMenu from "../../components/ui/ActionMenu";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataSection from "../../components/ui/DataSection";
import EmptyState from "../../components/ui/EmptyState";
import FilterBar from "../../components/ui/FilterBar";
import Loader from "../../components/ui/Loader";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import SummaryCards from "../../components/ui/SummaryCards";
import Table from "../../components/ui/Table";

const LoanChart = lazy(() => import("../dashboard/LoanChart"));
const savingTrend = [{ mes: "Ene", ahorro: 920 }, { mes: "Feb", ahorro: 990 }, { mes: "Mar", ahorro: 1060 }, { mes: "Abr", ahorro: 1120 }, { mes: "May", ahorro: 1210 }, { mes: "Jun", ahorro: 1280 }];
const savingsAccounts = [
  { code: "AHO-0019", associate: "Edgar Peñalosa Hernández", type: "Ahorro programado", balance: "$ 2.500.000", status: "Activa", openedAt: "02 may. 2026" },
  { code: "AHO-0020", associate: "María Camila Ulloa", type: "Ahorro a la vista", balance: "$ 8.750.000", status: "Activa", openedAt: "30 abr. 2026" },
  { code: "AHO-0021", associate: "José Manuel Veltrán", type: "Ahorro programado", balance: "$ 1.250.000", status: "Bloqueada", openedAt: "28 abr. 2026" },
  { code: "AHO-0022", associate: "Comercializadora Andina S.A.S.", type: "Ahorro empresarial", balance: "$ 14.200.000", status: "Activa", openedAt: "26 abr. 2026" },
  { code: "AHO-0023", associate: "Liliana Rodríguez Mora", type: "Ahorro a la vista", balance: "$ 680.000", status: "Inactiva", openedAt: "19 abr. 2026" },
];
const summaryCards = [
  { title: "Total cuentas", value: "318", subtitle: "Registradas en la cooperativa", icon: <WalletCards size={28} />, color: "bg-blue-50 text-blue-600" },
  { title: "Cuentas activas", value: "294", subtitle: "92% del total registrado", icon: <Landmark size={28} />, color: "bg-emerald-50 text-emerald-600" },
  { title: "Saldo total", value: "$1.280 M", subtitle: "8% frente al mes anterior", icon: <CircleDollarSign size={28} />, color: "bg-violet-50 text-violet-600" },
  { title: "Aperturas este mes", value: "18", subtitle: "4 más que el mes anterior", icon: <Plus size={28} />, color: "bg-amber-50 text-amber-600" },
];
const savingFilters = [
  { id: "type", label: "Tipo de ahorro", ariaLabel: "Filtrar por tipo de ahorro", options: ["Todos", "Ahorro a la vista", "Ahorro programado", "Ahorro empresarial"] },
  { id: "status", label: "Estado", ariaLabel: "Filtrar por estado", options: ["Todos", "Activa", "Inactiva", "Bloqueada"] },
];
const statusVariant = { Activa: "success", Inactiva: "neutral", Bloqueada: "warning" };

export default function Savings() {
  return (
    <PageContainer>
      <PageHeader eyebrow="Gestión de ahorros" title="Ahorros" subtitle="Gestiona las cuentas de ahorro y consulta su comportamiento." action={<Button><Plus size={18} strokeWidth={2.5} />Nueva cuenta</Button>} />
      <SummaryCards items={summaryCards} />
      <DataSection className="p-6" description="Evolución del saldo total durante los últimos seis meses." headerClassName="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between" title="Comportamiento del ahorro" titleClassName="text-lg font-extrabold tracking-tight text-slate-900" action={<div className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">+$360 M acumulados</div>}><div className="mt-5"><Suspense fallback={<Loader label="Cargando evolución..." />}><LoanChart data={savingTrend} dataKey="ahorro" gradientId="savings-volume" label="Ahorro total" valueSuffix="millones" /></Suspense></div></DataSection>
      <FilterBar filters={savingFilters} gridClassName="xl:grid-cols-[minmax(0,1.8fr)_minmax(12rem,0.8fr)_minmax(11rem,0.7fr)_auto]" idPrefix="savings" />
      <DataSection className="overflow-hidden p-0" description={`${savingsAccounts.length} cuentas registradas.`} headerClassName="border-b border-slate-200 px-6 py-5" title="Cuentas de ahorro">
        {savingsAccounts.length === 0 ? <EmptyState icon={<WalletCards size={24} />} title="Aún no hay cuentas de ahorro" description="Cuando registres una cuenta, su información aparecerá en este listado." action={<Button><Plus size={18} strokeWidth={2.5} />Nueva cuenta</Button>} /> : (
          <Table className="min-w-275">
            <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4">Código</th><th className="px-6 py-4">Asociado</th><th className="px-6 py-4">Producto</th><th className="px-6 py-4">Saldo</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4">Fecha apertura</th><th className="px-6 py-4 text-right">Acciones</th></tr></thead>
            <tbody className="divide-y divide-slate-200">{savingsAccounts.map((account) => <tr className="transition hover:bg-slate-50/70" key={account.code}><td className="px-6 py-4 text-sm font-extrabold text-slate-800">{account.code}</td><td className="px-6 py-4 text-sm font-bold text-slate-800">{account.associate}</td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{account.type}</td><td className="px-6 py-4 text-sm font-extrabold text-slate-800">{account.balance}</td><td className="px-6 py-4"><Badge variant={statusVariant[account.status]}>{account.status}</Badge></td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{account.openedAt}</td><td className="px-6 py-4"><ActionMenu label={account.code} /></td></tr>)}</tbody>
          </Table>
        )}
      </DataSection>
    </PageContainer>
  );
}
