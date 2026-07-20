import { useMemo, useState } from "react";
import { Eye, KeyRound, Pencil, Plus, ShieldCheck, Trash2, UserRound, Users as UsersIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import DataSection from "../../components/ui/DataSection";
import EmptyState from "../../components/ui/EmptyState";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import SummaryCards from "../../components/ui/SummaryCards";
import Table from "../../components/ui/Table";
import ToastProvider from "../../components/ui/ToastProvider";
import { notifySuccess } from "../../components/ui/toastNotifications";
import { branchOptions, initialUsers, roleOptions, statusOptions } from "../../mock/users";

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
  { id: "role", label: "Rol", ariaLabel: "Filtrar por rol", options: ["Todos", ...roleOptions] },
  { id: "status", label: "Estado", ariaLabel: "Filtrar por estado", options: ["Todos", ...statusOptions] },
  { id: "branch", label: "Sucursal", ariaLabel: "Filtrar por sucursal", options: ["Todas", ...branchOptions] },
];

const sortOptions = [
  { value: "name", label: "Nombre" },
  { value: "email", label: "Correo" },
  { value: "lastAccess", label: "Último acceso" },
  { value: "role", label: "Rol" },
];

export default function Users() {
  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [branchFilter, setBranchFilter] = useState("Todas");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [nextId, setNextId] = useState(initialUsers.length + 1);

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      status: "",
      branch: "",
    },
  });

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return users
      .filter((user) => {
        const matchesSearch = !normalizedSearch || [user.firstName, user.lastName, user.email, user.role].some((value) => value.toLowerCase().includes(normalizedSearch));
        const matchesRole = roleFilter === "Todos" || user.role === roleFilter;
        const matchesStatus = statusFilter === "Todos" || user.status === statusFilter;
        const matchesBranch = branchFilter === "Todas" || user.branch === branchFilter;
        return matchesSearch && matchesRole && matchesStatus && matchesBranch;
      })
      .sort((a, b) => {
        const direction = sortBy === "name" || sortBy === "email" || sortBy === "role" ? "asc" : "desc";
        const aValue = (a[sortBy] ?? "").toString().toLowerCase();
        const bValue = (b[sortBy] ?? "").toString().toLowerCase();
        return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      });
  }, [branchFilter, roleFilter, search, sortBy, statusFilter, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const pagedUsers = useMemo(() => filteredUsers.slice((page - 1) * pageSize, page * pageSize), [filteredUsers, page]);

  const summaryCards = useMemo(() => [
    { title: "Total usuarios", value: users.length.toString(), subtitle: "Registrados en el sistema", icon: <UsersIcon size={28} />, color: "bg-blue-50 text-blue-600" },
    { title: "Usuarios activos", value: users.filter((user) => user.status === "Activo").length.toString(), subtitle: "98% del total", icon: <ShieldCheck size={28} />, color: "bg-emerald-50 text-emerald-600" },
    { title: "Administradores", value: users.filter((user) => user.role === "Administrador").length.toString(), subtitle: "Roles principales", icon: <UserRound size={28} />, color: "bg-violet-50 text-violet-600" },
    { title: "Últimos accesos hoy", value: users.filter((user) => user.lastAccess.includes("Hoy")).length.toString(), subtitle: "Actualizado hace 10 min", icon: <KeyRound size={28} />, color: "bg-amber-50 text-amber-600" },
  ], [users]);

  function openCreateModal() {
    reset({ firstName: "", lastName: "", email: "", phone: "", role: "", status: "", branch: "" });
    setSelectedUser(null);
    setIsModalOpen(true);
  }

  function openEditModal(user) {
    setSelectedUser(user);
    setValue("firstName", user.firstName);
    setValue("lastName", user.lastName);
    setValue("email", user.email);
    setValue("phone", user.phone);
    setValue("role", user.role);
    setValue("status", user.status);
    setValue("branch", user.branch);
    setIsModalOpen(true);
  }

  function openDetailModal(user) {
    setSelectedUser(user);
    setIsDetailOpen(true);
  }

  function openConfirmStatusModal(user) {
    setSelectedUser(user);
    setPendingStatus(user.status === "Activo" ? "Inactivo" : "Activo");
    setIsConfirmOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setSelectedUser(null);
  }

  function handleCloseDetail() {
    setIsDetailOpen(false);
    setSelectedUser(null);
  }

  function handleCloseConfirm() {
    setIsConfirmOpen(false);
    setSelectedUser(null);
    setPendingStatus(null);
  }

  async function onSubmit(data) {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const payload = {
      id: selectedUser?.id ?? nextId,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      role: data.role,
      status: data.status,
      branch: data.branch,
      lastAccess: selectedUser ? selectedUser.lastAccess : "Hoy · 00:00 a. m.",
      createdAt: selectedUser ? selectedUser.createdAt : new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }),
      avatar: selectedUser ? selectedUser.avatar : `${data.firstName.trim().charAt(0) ?? "U"}${data.lastName.trim().charAt(0) ?? "U"}`.toUpperCase(),
    };

    setUsers((current) => {
      if (selectedUser) {
        return current.map((user) => (user.id === selectedUser.id ? payload : user));
      }
      setNextId((currentId) => currentId + 1);
      return [payload, ...current];
    });
    setLoading(false);
    handleCloseModal();
    notifySuccess(selectedUser ? "Usuario actualizado correctamente." : "Usuario creado correctamente.");
  }

  async function changeStatus() {
    if (!selectedUser) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    setUsers((current) => current.map((user) => user.id === selectedUser.id ? { ...user, status: pendingStatus } : user));
    setLoading(false);
    handleCloseConfirm();
    notifySuccess("Estado actualizado correctamente.");
  }

  function handleSearchChange(event) {
    setSearch(event.target.value);
  }

  function handleFilterChange(event, filterKey) {
    const value = event.target.value;
    if (filterKey === "role") setRoleFilter(value);
    if (filterKey === "status") setStatusFilter(value);
    if (filterKey === "branch") setBranchFilter(value);
  }

  function clearFilters() {
    setSearch("");
    setRoleFilter("Todos");
    setStatusFilter("Todos");
    setBranchFilter("Todas");
    setSortBy("name");
  }

  const visibleUsers = pagedUsers;

  return (
    <>
      <PageContainer>
        <PageHeader
          action={<Button onClick={openCreateModal}><Plus size={18} strokeWidth={2.5} />Nuevo usuario</Button>}
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
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{users.filter((user) => user.status !== "Bloqueado").length}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500">Usuarios bloqueados</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{users.filter((user) => user.status === "Bloqueado").length}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500">Última sincronización</p>
              <p className="mt-2 text-xl font-extrabold text-slate-900">10:30 a. m.</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500">Roles configurados</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{new Set(users.map((user) => user.role)).size}</p>
            </div>
          </div>
        </Card>

        <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(10rem,0.8fr)_minmax(9rem,0.7fr)_minmax(9rem,0.7fr)_auto]">
          <label className="block" htmlFor="users-search">
            <span className="mb-2 block text-sm font-bold text-slate-700">Buscar usuario</span>
            <Input aria-label="Buscar usuario" id="users-search" onChange={handleSearchChange} placeholder="Nombre o correo" value={search} />
          </label>
          <label className="block" htmlFor="users-role">
            <span className="mb-2 block text-sm font-bold text-slate-700">Rol</span>
            <select aria-label="Filtrar por rol" className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" id="users-role" onChange={(event) => handleFilterChange(event, "role")} value={roleFilter}>
              {userFilters[0].options.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className="block" htmlFor="users-status">
            <span className="mb-2 block text-sm font-bold text-slate-700">Estado</span>
            <select aria-label="Filtrar por estado" className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" id="users-status" onChange={(event) => handleFilterChange(event, "status")} value={statusFilter}>
              {userFilters[1].options.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className="block" htmlFor="users-branch">
            <span className="mb-2 block text-sm font-bold text-slate-700">Sucursal</span>
            <select aria-label="Filtrar por sucursal" className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" id="users-branch" onChange={(event) => handleFilterChange(event, "branch")} value={branchFilter}>
              {userFilters[2].options.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <Button className="w-full md:w-auto" onClick={clearFilters} variant="secondary">Limpiar filtros</Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="block min-w-[180px]" htmlFor="users-sort">
            <span className="mb-2 block text-sm font-bold text-slate-700">Ordenar por</span>
            <select aria-label="Ordenar resultados" className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" id="users-sort" onChange={(event) => setSortBy(event.target.value)} value={sortBy}>
              {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        <DataSection
          className="mt-6 overflow-hidden p-0"
          description="Listado de usuarios con acceso al sistema."
          headerClassName="border-b border-slate-200 px-6 py-5"
          title="Usuarios del sistema"
        >
          {loading ? <Loader label="Procesando operación..." /> : visibleUsers.length === 0 ? (
            <EmptyState
              action={<Button onClick={openCreateModal}><Plus size={18} strokeWidth={2.5} />Nuevo usuario</Button>}
              description="No hay usuarios que coincidan con los filtros actuales."
              icon={<UsersIcon size={24} />}
              title="No hay resultados"
            />
          ) : (
            <>
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
                  {visibleUsers.map((user) => (
                    <tr className="transition hover:bg-slate-50/70" key={user.id}>
                      <td className="px-6 py-4">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
                          {user.avatar}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">{`${user.firstName} ${user.lastName}`}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-600">{user.email}</td>
                      <td className="px-6 py-4"><Badge variant={roleVariant[user.role]}>{user.role}</Badge></td>
                      <td className="px-6 py-4"><Badge variant={statusVariant[user.status]}>{user.status}</Badge></td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-600">{user.lastAccess}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          <Button aria-label={`Ver ${user.firstName}`} onClick={() => openDetailModal(user)} size="icon" title="Ver" variant="ghost"><Eye size={18} /></Button>
                          <Button aria-label={`Editar ${user.firstName}`} onClick={() => openEditModal(user)} size="icon" title="Editar" variant="ghost"><Pencil size={17} /></Button>
                          <Button aria-label={`Cambiar estado ${user.firstName}`} onClick={() => openConfirmStatusModal(user)} size="icon" title="Cambiar estado" variant="ghost"><ShieldCheck size={18} /></Button>
                          <Button aria-label={`Eliminar ${user.firstName}`} size="icon" title="Eliminar" variant="ghost"><Trash2 size={17} /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-slate-500">Mostrando {visibleUsers.length} de {filteredUsers.length} usuarios</p>
                <div className="flex items-center gap-2">
                  <Button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} size="sm" variant="secondary">Anterior</Button>
                  <span className="text-sm font-semibold text-slate-600">Página {page} de {totalPages}</span>
                  <Button disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} size="sm" variant="secondary">Siguiente</Button>
                </div>
              </div>
            </>
          )}
        </DataSection>
      </PageContainer>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="md" title={selectedUser ? "Editar usuario" : "Nuevo usuario"}>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Nombre</span>
              <Input {...register("firstName", { required: "El nombre es obligatorio" })} aria-invalid={errors.firstName ? "true" : "false"} placeholder="Nombre" />
              {errors.firstName && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.firstName.message}</p>}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Apellido</span>
              <Input {...register("lastName", { required: "El apellido es obligatorio" })} aria-invalid={errors.lastName ? "true" : "false"} placeholder="Apellido" />
              {errors.lastName && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.lastName.message}</p>}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Correo electrónico</span>
              <Input {...register("email", { required: "El correo es obligatorio", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Ingresa un correo válido" } })} aria-invalid={errors.email ? "true" : "false"} placeholder="correo@dominio.com" />
              {errors.email && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.email.message}</p>}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Teléfono</span>
              <Input {...register("phone", { required: "El teléfono es obligatorio" })} aria-invalid={errors.phone ? "true" : "false"} placeholder="3001234567" />
              {errors.phone && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.phone.message}</p>}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Rol</span>
              <select {...register("role", { required: "El rol es obligatorio" })} aria-invalid={errors.role ? "true" : "false"} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100">
                <option value="">Selecciona un rol</option>
                {roleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              {errors.role && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.role.message}</p>}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Estado</span>
              <select {...register("status", { required: "El estado es obligatorio" })} aria-invalid={errors.status ? "true" : "false"} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100">
                <option value="">Selecciona un estado</option>
                {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              {errors.status && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.status.message}</p>}
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Sucursal</span>
            <select {...register("branch", { required: "La sucursal es obligatoria" })} aria-invalid={errors.branch ? "true" : "false"} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100">
              <option value="">Selecciona una sucursal</option>
              {branchOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            {errors.branch && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.branch.message}</p>}
          </label>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <Button onClick={handleCloseModal} type="button" variant="secondary">Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDetailOpen} onClose={handleCloseDetail} size="md" title="Detalle de usuario">
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-blue-600 text-lg font-bold text-white">{selectedUser.avatar}</div>
              <div>
                <p className="text-lg font-extrabold text-slate-900">{`${selectedUser.firstName} ${selectedUser.lastName}`}</p>
                <p className="text-sm font-semibold text-slate-500">{selectedUser.email}</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-bold text-slate-500">Rol</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{selectedUser.role}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-bold text-slate-500">Estado</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{selectedUser.status}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-bold text-slate-500">Último acceso</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{selectedUser.lastAccess}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-bold text-slate-500">Fecha de creación</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{selectedUser.createdAt}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isConfirmOpen} onClose={handleCloseConfirm} size="sm" title="Cambiar estado">
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-600">¿Deseas cambiar el estado de <span className="font-extrabold text-slate-900">{`${selectedUser.firstName} ${selectedUser.lastName}`}</span> a <span className="font-extrabold text-slate-900">{pendingStatus}</span>?</p>
            <div className="flex justify-end gap-3">
              <Button onClick={handleCloseConfirm} type="button" variant="secondary">Cancelar</Button>
              <Button onClick={changeStatus} type="button">Confirmar</Button>
            </div>
          </div>
        )}
      </Modal>

      <ToastProvider />
    </>
  );
}
