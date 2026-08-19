import { useEffect, useMemo, useState } from "react";
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
import { notifyError, notifySuccess } from "../../components/ui/toastNotifications";
import userService from "../../services/userService";

const statusVariant = {
  Activo: "success",
  Inactivo: "neutral",
};

const sortOptions = [
  { value: "username", label: "Nombre de usuario" },
  { value: "email", label: "Correo" },
  { value: "status", label: "Estado" },
];

function getUserStatus(user) {
  return user.enabled ? "Activo" : "Inactivo";
}

function getUserAvatar(username) {
  return username.slice(0, 2).toUpperCase();
}

function getErrorMessage(error) {
  if (!error.response) {
    return "No fue posible conectar con el servidor.";
  }

  if (error.response.status >= 500) {
    return "El servidor presentó un error. Inténtalo nuevamente.";
  }

  return error.response.data?.errors?.[0] ?? error.response.data?.message ?? "No fue posible completar la operación.";
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [sortBy, setSortBy] = useState("username");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        setUsers(await userService.getAll());
      } catch (error) {
        notifyError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users
      .filter((user) => {
        const matchesSearch = !normalizedSearch || [user.username, user.email].some((value) => value.toLowerCase().includes(normalizedSearch));
        const matchesStatus = statusFilter === "Todos" || getUserStatus(user) === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((firstUser, secondUser) => {
        const firstValue = (sortBy === "status" ? getUserStatus(firstUser) : firstUser[sortBy]).toLowerCase();
        const secondValue = (sortBy === "status" ? getUserStatus(secondUser) : secondUser[sortBy]).toLowerCase();
        return firstValue.localeCompare(secondValue);
      });
  }, [search, sortBy, statusFilter, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const pagedUsers = useMemo(() => filteredUsers.slice((page - 1) * pageSize, page * pageSize), [filteredUsers, page]);

  const summaryCards = useMemo(() => [
    { title: "Total usuarios", value: users.length.toString(), subtitle: "Registrados en el sistema", icon: <UsersIcon size={28} />, color: "bg-blue-50 text-blue-600" },
    { title: "Usuarios activos", value: users.filter((user) => user.enabled).length.toString(), subtitle: "Con acceso habilitado", icon: <ShieldCheck size={28} />, color: "bg-emerald-50 text-emerald-600" },
    { title: "Usuarios inactivos", value: users.filter((user) => !user.enabled).length.toString(), subtitle: "Con acceso deshabilitado", icon: <UserRound size={28} />, color: "bg-violet-50 text-violet-600" },
    { title: "Correos registrados", value: users.filter((user) => user.email).length.toString(), subtitle: "Información de contacto", icon: <KeyRound size={28} />, color: "bg-amber-50 text-amber-600" },
  ], [users]);

  function openCreateModal() {
    reset({ username: "", email: "", password: "" });
    setSelectedUser(null);
    setIsModalOpen(true);
  }

  function openEditModal(user) {
    reset({ username: user.username, email: user.email, password: "" });
    setSelectedUser(user);
    setIsModalOpen(true);
  }

  async function openDetailModal(user) {
    try {
      setLoading(true);
      setSelectedUser(await userService.getById(user.id));
      setIsDetailOpen(true);
    } catch (error) {
      notifyError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function openDeleteModal(user) {
    setSelectedUser(user);
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
  }

  async function onSubmit(data) {
    const payload = {
      username: data.username.trim(),
      email: data.email.trim(),
      password: data.password,
    };

    try {
      setLoading(true);

      if (selectedUser) {
        const updatedUser = await userService.update(selectedUser.id, payload);
        setUsers((currentUsers) => currentUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
        notifySuccess("Usuario actualizado correctamente.");
      } else {
        const createdUser = await userService.create(payload);
        setUsers((currentUsers) => [createdUser, ...currentUsers]);
        notifySuccess("Usuario creado correctamente.");
      }

      handleCloseModal();
    } catch (error) {
      notifyError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser() {
    if (!selectedUser) return;

    try {
      setLoading(true);
      await userService.delete(selectedUser.id);
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== selectedUser.id));
      handleCloseConfirm();
      notifySuccess("Usuario eliminado correctamente.");
    } catch (error) {
      notifyError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("Todos");
    setSortBy("username");
    setPage(1);
  }

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
            <div className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">Información sincronizada con el servidor</div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500">Usuarios habilitados</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{users.filter((user) => user.enabled).length}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500">Usuarios inactivos</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{users.filter((user) => !user.enabled).length}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500">Usuarios registrados</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{users.length}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500">Correos registrados</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{users.filter((user) => user.email).length}</p>
            </div>
          </div>
        </Card>

        <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(9rem,0.7fr)_auto]">
          <label className="block" htmlFor="users-search">
            <span className="mb-2 block text-sm font-bold text-slate-700">Buscar usuario</span>
            <Input aria-label="Buscar usuario" id="users-search" onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Usuario o correo" value={search} />
          </label>
          <label className="block" htmlFor="users-status">
            <span className="mb-2 block text-sm font-bold text-slate-700">Estado</span>
            <select aria-label="Filtrar por estado" className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" id="users-status" onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} value={statusFilter}>
              <option>Todos</option>
              <option>Activo</option>
              <option>Inactivo</option>
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

        <DataSection className="mt-6 overflow-hidden p-0" description="Listado de usuarios con acceso al sistema." headerClassName="border-b border-slate-200 px-6 py-5" title="Usuarios del sistema">
          {loading ? <Loader label="Cargando usuarios..." /> : pagedUsers.length === 0 ? (
            <EmptyState action={<Button onClick={openCreateModal}><Plus size={18} strokeWidth={2.5} />Nuevo usuario</Button>} description="No hay usuarios que coincidan con los filtros actuales." icon={<UsersIcon size={24} />} title="No hay resultados" />
          ) : (
            <>
              <Table className="min-w-[360px]">
                <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Avatar</th>
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-6 py-4">Correo</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {pagedUsers.map((user) => {
                    const status = getUserStatus(user);

                    return (
                      <tr className="transition hover:bg-slate-50/70" key={user.id}>
                        <td className="px-6 py-4"><div className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">{getUserAvatar(user.username)}</div></td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{user.username}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-600">{user.email}</td>
                        <td className="px-6 py-4"><Badge variant={statusVariant[status]}>{status}</Badge></td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-1">
                            <Button aria-label={`Ver ${user.username}`} onClick={() => openDetailModal(user)} size="icon" title="Ver" variant="ghost"><Eye size={18} /></Button>
                            <Button aria-label={`Editar ${user.username}`} onClick={() => openEditModal(user)} size="icon" title="Editar" variant="ghost"><Pencil size={17} /></Button>
                            <Button aria-label={`Eliminar ${user.username}`} onClick={() => openDeleteModal(user)} size="icon" title="Eliminar" variant="ghost"><Trash2 size={17} /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-slate-500">Mostrando {pagedUsers.length} de {filteredUsers.length} usuarios</p>
                <div className="flex items-center gap-2">
                  <Button disabled={page === 1} onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))} size="sm" variant="secondary">Anterior</Button>
                  <span className="text-sm font-semibold text-slate-600">Página {page} de {totalPages}</span>
                  <Button disabled={page === totalPages} onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))} size="sm" variant="secondary">Siguiente</Button>
                </div>
              </div>
            </>
          )}
        </DataSection>
      </PageContainer>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="md" title={selectedUser ? "Editar usuario" : "Nuevo usuario"}>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Nombre de usuario</span>
            <Input {...register("username", { required: "El nombre de usuario es obligatorio", maxLength: { value: 50, message: "El nombre de usuario no puede superar 50 caracteres" } })} aria-invalid={errors.username ? "true" : "false"} placeholder="usuario" />
            {errors.username && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.username.message}</p>}
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Correo electrónico</span>
            <Input {...register("email", { required: "El correo es obligatorio", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Ingresa un correo válido" } })} aria-invalid={errors.email ? "true" : "false"} placeholder="correo@dominio.com" type="email" />
            {errors.email && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.email.message}</p>}
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">{selectedUser ? "Nueva contraseña" : "Contraseña"}</span>
            <Input {...register("password", { required: "La contraseña es obligatoria", minLength: { value: 8, message: "La contraseña debe tener al menos 8 caracteres" } })} aria-invalid={errors.password ? "true" : "false"} placeholder="Mínimo 8 caracteres" type="password" />
            {errors.password && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.password.message}</p>}
          </label>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <Button onClick={handleCloseModal} type="button" variant="secondary">Cancelar</Button>
            <Button disabled={loading} type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDetailOpen} onClose={handleCloseDetail} size="md" title="Detalle de usuario">
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-blue-600 text-lg font-bold text-white">{getUserAvatar(selectedUser.username)}</div>
              <div>
                <p className="text-lg font-extrabold text-slate-900">{selectedUser.username}</p>
                <p className="text-sm font-semibold text-slate-500">{selectedUser.email}</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-bold text-slate-500">Estado</p><p className="mt-1 text-sm font-semibold text-slate-800">{getUserStatus(selectedUser)}</p></div>
              <div className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-bold text-slate-500">Identificador</p><p className="mt-1 text-sm font-semibold text-slate-800">#{selectedUser.id}</p></div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isConfirmOpen} onClose={handleCloseConfirm} size="sm" title="Eliminar usuario">
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-600">¿Deseas eliminar a <span className="font-extrabold text-slate-900">{selectedUser.username}</span>? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <Button onClick={handleCloseConfirm} type="button" variant="secondary">Cancelar</Button>
              <Button disabled={loading} onClick={deleteUser} type="button">Eliminar</Button>
            </div>
          </div>
        )}
      </Modal>

      <ToastProvider />
    </>
  );
}
