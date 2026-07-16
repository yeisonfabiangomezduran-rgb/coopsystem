import {
  BellRing,
  FileChartColumn,
  FolderSync,
  HandCoins,
  Landmark,
  LayoutGrid,
  Plus,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";

const settingsSections = [
  {
    name: "Sistema",
    description: "Configuración general del comportamiento del sistema.",
    icon: LayoutGrid,
    color: "bg-blue-50 text-blue-600",
  },
  {
    name: "Empresa",
    description: "Información de la cooperativa y datos institucionales.",
    icon: Landmark,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    name: "Usuarios y permisos",
    description: "Roles, accesos y validaciones para los usuarios del sistema.",
    icon: Users,
    color: "bg-violet-50 text-violet-600",
  },
  {
    name: "Tesorería",
    description: "Parámetros financieros y reglas operativas de caja.",
    icon: ReceiptText,
    color: "bg-amber-50 text-amber-600",
  },
  {
    name: "Ahorros",
    description: "Tipos de ahorro y condiciones de producto.",
    icon: WalletCards,
    color: "bg-sky-50 text-sky-600",
  },
  {
    name: "Préstamos",
    description: "Tipos de préstamo y reglas de aprobación.",
    icon: HandCoins,
    color: "bg-fuchsia-50 text-fuchsia-600",
  },
  {
    name: "Transacciones",
    description: "Configuración operativa para los movimientos del sistema.",
    icon: ReceiptText,
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    name: "Reportes",
    description: "Preferencias de generación y visualización de reportes.",
    icon: FileChartColumn,
    color: "bg-rose-50 text-rose-600",
  },
  {
    name: "Notificaciones",
    description: "Correo, alertas y canales de comunicación.",
    icon: BellRing,
    color: "bg-orange-50 text-orange-600",
  },
  {
    name: "Seguridad",
    description: "Políticas de acceso y protección del entorno.",
    icon: ShieldCheck,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    name: "Respaldos",
    description: "Copias de seguridad y políticas de restauración.",
    icon: FolderSync,
    color: "bg-cyan-50 text-cyan-600",
  },
];

const systemStatus = [
  { label: "Versión del sistema", value: "v2.4.0" },
  { label: "Última actualización", value: "Hoy · 10:30 a. m." },
  { label: "Estado de servicios", value: "Operativos" },
  { label: "Base de datos", value: "Sincronizada" },
  { label: "Usuarios conectados", value: "24" },
];

export default function Configuration() {
  return (
    <PageContainer>
      <PageHeader
        action={<Button><Plus size={18} strokeWidth={2.5} />Configurar</Button>}
        eyebrow="Centro de administración"
        subtitle="Administra los parámetros generales de CoopSystem."
        title="Configuración"
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,0.85fr)]">
        <div className="grid gap-4 md:grid-cols-2">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.name} className="flex h-full flex-col p-5">
                <div className={`grid h-11 w-11 place-items-center rounded-xl ${section.color}`}>
                  <Icon size={21} />
                </div>
                <h3 className="mt-4 text-lg font-extrabold tracking-tight text-slate-900">{section.name}</h3>
                <p className="mt-2 text-sm font-medium text-slate-500">{section.description}</p>
                <div className="mt-5">
                  <Button className="w-full" size="sm" variant="secondary">Configurar</Button>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="h-fit p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Estado del sistema</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Resumen operativo del entorno de administración.</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Sparkles size={20} />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {systemStatus.map((item) => (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3" key={item.label}>
                <span className="text-sm font-semibold text-slate-600">{item.label}</span>
                <span className="text-sm font-extrabold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </PageContainer>
  );
}
