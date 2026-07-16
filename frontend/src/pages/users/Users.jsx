import { KeyRound, Plus, ShieldCheck, UserRound, Users as UsersIcon } from "lucide-react";
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

const summaryCards = [
  { title: "Total usuarios", value: "48", subtitle: "Registrados en el sistema", icon: <UsersIcon size={28} />, color: "bg-blue-50 text-blue-600" },
  { title: "Usuarios activos", value: "41", subtitle: "98% del total", icon: <ShieldCheck size={28} />, color: "bg-emerald-50 text-emerald-600" },
  { title: "Administradores", value: "6", subtitle: "Roles principales", icon: <UserRound size={28} />, color: "bg-violet-50 text-violet-600" },
  { title: "Últimos accesos hoy", value: "17", subtitle: "Actualizado hace 10 min", icon: <KeyRound size={28} />, color: "bg-amber-50 text-amber-600" },
];

const users = [
  {
    id: 1,
    name: "Ana Gómez",
    email: "ana.gomez@coopsystem.com",
    role: "Administrador",
    status: "Activo",
    branch: "Bogotá",
    lastAccess: "Hoy · 09:18 a. m.",
    avatar: "AG",
  },
  {
    id: 2,
    name: "Carlos Ramírez",
    email: "carlos.ramirez@coopsystem.com",
    role: "Operador",
    status: "Activo",
    branch: "Medellín",
    lastAccess: "Hoy · 08:42 a. m.",
    avatar: "CR",
  },
  {
    id: 3,
    name: "Laura Gómez",
    email: "laura.gomez@coopsystem.com",
    role: "Consulta",
    status: "Inactivo",
    branch: "Cali",
    lastAccess: "Ayer · 04:20 p. m.",
    avatar: "LG",
  },
  {
    id: 4,
    name: "Andrés Torres",
    email: "andres.torres@coopsystem.com",
    role: "Administrador",
    status: "Bloqueado",
    branch: "Barranquilla",
    lastAccess: "Ayer · 11:10 a. m.",
    avatar: "AT",
  },
];

const statusVariant = {
  Activo: "success",
  Inactivo: "neutral",
  Bloqueado: "warning",
};

const roleVariant = {
  Administrador: "success",
  Operador: "warning",
  Consulta: "neutral",
};

const userFilters = [
  { id: "role", label: "Rol", ariaLabel: "Filtrar por rol", options: ["Todos", "Administrador", "Operador", "Consulta"] },
  { id: "status", label: "Estado", ariaLabel: "Filtrar por estado", options: ["Todos", "Activo", "Inactivo", "Bloqueado"] },
  { id: "branch", label: "Sucursal", ariaLabel: "Filtrar por sucursal", options: ["Todas", "Bogotá", "Medellín", "Cali", "Barranquilla"] },
];

export default function Users() {
  return (
    <PageContainer>
      <PageHeader
        action={<Button><Plus size={18} strokeWidth={2.5} />Nuevo usuario</Button>}
        eyebrow="Gestión de usuarios"
        subtitle="Administra los usuarios con acceso al sistema CoopSystem."
        title="Usuarios"
      />

      <SummaryCards items={summaryCards} />

      <Card className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Estado del sistema de usuarios</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Resumen operativo de accesos y permisos del sistema.</p>
          </div>
          <div className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">Última sincronización · 10:30 a. m.</div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-500">Usuarios habilitados</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">41</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-500">Usuarios bloqueados</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">3</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-500">Última sincronización</p>
            <p className="mt-2 text-xl font-extrabold text-slate-900">10:30 a. m.</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-500">Roles configurados</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">3</p>
          </div>
        </div>
      </Card>

      <FilterBar
        filters={userFilters}
        gridClassName="xl:grid-cols-[minmax(0,1.8fr)_minmax(12rem,0.8fr)_minmax(11rem,0.7fr)_minmax(10rem,0.7fr)_auto]"
        idPrefix="users"
        searchAriaLabel="Buscar usuario"
        searchLabel="Buscar usuario"
        searchPlaceholder="Nombre o correo"
      />

      <DataSection
        className="overflow-hidden p-0"
        description="Listado de usuarios con acceso al sistema."
        headerClassName="border-b border-slate-200 px-6 py-5"
        title="Usuarios del sistema"
      >
        {users.length === 0 ? (
          <EmptyState
            action={<Button><Plus size={18} strokeWidth={2.5} />Nuevo usuario</Button>}
            description="Cuando agregues un usuario, aparecerá aquí su información de acceso."
            icon={<UsersIcon size={24} />}
            title="Aún no hay usuarios registrados"
          />
        ) : (
          <Table className="min-w-[360px]">
            <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">Avatar</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Correo</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Último acceso</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr className="transition hover:bg-slate-50/70" key={user.id}>
                  <td className="px-6 py-4">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {user.avatar}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{user.name}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant={roleVariant[user.role]}>{user.role}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={statusVariant[user.status]}>{user.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">{user.lastAccess}</td>
                  <td className="px-6 py-4"><ActionMenu label={user.name} /></td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </DataSection>
    </PageContainer>
  );
}
