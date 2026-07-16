import { FileWarning, Plus, UserCheck, UserRound, Users } from "lucide-react";
import ActionMenu from "../../components/ui/ActionMenu";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataSection from "../../components/ui/DataSection";
import EmptyState from "../../components/ui/EmptyState";
import FilterBar from "../../components/ui/FilterBar";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import SummaryCards from "../../components/ui/SummaryCards";
import Table from "../../components/ui/Table";

const associates = [
  { code: "ASO-0019", name: "Edgar Peñalosa Hernández", document: "1.019.243.765", phone: "310 458 2190", status: "Activo", type: "Persona natural", joinedAt: "02 may. 2026" },
  { code: "ASO-0020", name: "María Camila Ulloa", document: "1.024.981.376", phone: "315 762 4308", status: "Activo", type: "Persona natural", joinedAt: "30 abr. 2026" },
  { code: "ASO-0021", name: "José Manuel Veltrán", document: "79.852.911", phone: "312 970 1184", status: "Pendiente", type: "Persona natural", joinedAt: "28 abr. 2026" },
  { code: "ASO-0022", name: "Comercializadora Andina S.A.S.", document: "901.625.184-7", phone: "601 743 2500", status: "Activo", type: "Persona jurídica", joinedAt: "26 abr. 2026" },
  { code: "ASO-0023", name: "Liliana Rodríguez Mora", document: "52.184.067", phone: "300 814 6091", status: "Inactivo", type: "Persona natural", joinedAt: "19 abr. 2026" },
];

const summaryCards = [
  { title: "Total asociados", value: "325", subtitle: "Registrados en la cooperativa", icon: <Users size={28} />, color: "bg-blue-50 text-blue-600" },
  { title: "Asociados activos", value: "301", subtitle: "92% del total registrado", icon: <UserCheck size={28} />, color: "bg-emerald-50 text-emerald-600" },
  { title: "Nuevos este mes", value: "12", subtitle: "3 más que el mes anterior", icon: <UserRound size={28} />, color: "bg-violet-50 text-violet-600" },
  { title: "Documentación pendiente", value: "8", subtitle: "Requieren revisión", trend: "down", icon: <FileWarning size={28} />, color: "bg-amber-50 text-amber-600" },
];

const associateFilters = [
  { id: "status", label: "Estado", ariaLabel: "Filtrar por estado", options: ["Todos", "Activo", "Inactivo", "Pendiente"] },
  { id: "type", label: "Tipo de asociado", ariaLabel: "Filtrar por tipo de asociado", options: ["Todos", "Persona natural", "Persona jurídica"] },
];

const statusVariant = { Activo: "success", Inactivo: "neutral", Pendiente: "warning" };

export default function Associates() {
  return (
    <PageContainer>
      <PageHeader eyebrow="Gestión de asociados" title="Asociados" subtitle="Administra la información de los asociados registrados." action={<Button><Plus size={18} strokeWidth={2.5} />Nuevo asociado</Button>} />
      <SummaryCards items={summaryCards} />
      <FilterBar filters={associateFilters} gridClassName="xl:grid-cols-[minmax(0,1.8fr)_minmax(11rem,0.7fr)_minmax(12rem,0.8fr)_auto]" idPrefix="associate" />
      <DataSection className="overflow-hidden p-0" description={`${associates.length} asociados registrados.`} headerClassName="flex flex-col gap-1 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between" title="Listado de asociados">
        {associates.length === 0 ? <EmptyState icon={<Users size={24} />} title="Aún no hay asociados registrados" description="Cuando registres un asociado, su información aparecerá en este listado." action={<Button><Plus size={18} strokeWidth={2.5} />Nuevo asociado</Button>} /> : (
          <Table className="min-w-275">
            <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4">Código</th><th className="px-6 py-4">Nombre</th><th className="px-6 py-4">Documento</th><th className="px-6 py-4">Teléfono</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4">Fecha de ingreso</th><th className="px-6 py-4 text-right">Acciones</th></tr></thead>
            <tbody className="divide-y divide-slate-200">{associates.map((associate) => <tr className="transition hover:bg-slate-50/70" key={associate.code}><td className="px-6 py-4 text-sm font-extrabold text-slate-800">{associate.code}</td><td className="px-6 py-4"><p className="text-sm font-bold text-slate-800">{associate.name}</p><p className="mt-0.5 text-xs font-medium text-slate-500">{associate.type}</p></td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{associate.document}</td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{associate.phone}</td><td className="px-6 py-4"><Badge variant={statusVariant[associate.status]}>{associate.status}</Badge></td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{associate.joinedAt}</td><td className="px-6 py-4"><ActionMenu label={associate.name} /></td></tr>)}</tbody>
          </Table>
        )}
      </DataSection>
    </PageContainer>
  );
}
