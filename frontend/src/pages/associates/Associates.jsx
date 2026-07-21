import { useEffect, useMemo, useState } from "react";
import { Eye, FileWarning, Pencil, Plus, ShieldCheck, UserCheck, UserRound, Users } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import CatalogSelect from "../../components/ui/CatalogSelect";
import DataSection from "../../components/ui/DataSection";
import EmptyState from "../../components/ui/EmptyState";
import Input from "../../components/ui/Input";
import LocationSelector from "../../components/ui/LocationSelector";
import Modal from "../../components/ui/Modal";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import SummaryCards from "../../components/ui/SummaryCards";
import Table from "../../components/ui/Table";
import ToastProvider from "../../components/ui/ToastProvider";
import { notifySuccess } from "../../components/ui/toastNotifications";
import { associateStatusOptions, associateTypeOptions, initialAssociates } from "../../mock/associates";

const statusVariant = {
  Activo: "success",
  Inactivo: "neutral",
  Suspendido: "warning",
};

const sortOptions = [
  { value: "code", label: "Código" },
  { value: "firstName", label: "Nombre" },
  { value: "entryDate", label: "Fecha de ingreso" },
  { value: "status", label: "Estado" },
];

export default function Associates() {
  const [associates, setAssociates] = useState(initialAssociates);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedAssociate, setSelectedAssociate] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [cityFilter, setCityFilter] = useState("Todos");
  const [sortBy, setSortBy] = useState("code");
  const [page, setPage] = useState(1);
  const [nextId, setNextId] = useState(initialAssociates.length + 1);
  const pageSize = 10;

  const { register, handleSubmit, reset, formState: { errors }, setValue, control, clearErrors } = useForm({
    defaultValues: {
      code: "",
      documentType: "",
      documentNumber: "",
      firstName: "",
      lastName: "",
      birthDate: "",
      gender: "",
      cellphone: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      department: "",
      entryDate: "",
      type: "",
      status: "",
      observations: "",
    },
  });
  const documentTypeField = register("documentType", { required: "Selecciona el tipo de documento" });
  const selectedDepartment = useWatch({ control, name: "department" });
  const selectedCity = useWatch({ control, name: "city" });

  useEffect(() => {
    register("department", { required: "Selecciona el departamento" });
    register("city", { required: "Selecciona el municipio" });
  }, [register]);

  const filteredAssociates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return associates
      .filter((associate) => {
        const matchesSearch = !normalizedSearch || [associate.code, associate.documentNumber, associate.firstName, associate.lastName, associate.email].some((value) => value.toLowerCase().includes(normalizedSearch));
        const matchesStatus = statusFilter === "Todos" || associate.status === statusFilter;
        const matchesType = typeFilter === "Todos" || associate.type === typeFilter;
        const matchesCity = cityFilter === "Todos" || associate.city === cityFilter;
        return matchesSearch && matchesStatus && matchesType && matchesCity;
      })
      .sort((a, b) => {
        const direction = sortBy === "code" || sortBy === "firstName" ? "asc" : "desc";
        const aValue = (a[sortBy] ?? "").toString().toLowerCase();
        const bValue = (b[sortBy] ?? "").toString().toLowerCase();
        return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      });
  }, [associates, cityFilter, search, sortBy, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAssociates.length / pageSize));
  const pagedAssociates = useMemo(() => filteredAssociates.slice((page - 1) * pageSize, page * pageSize), [filteredAssociates, page]);
  const availableCities = useMemo(() => [...new Set(associates.map((associate) => associate.city).filter(Boolean))].sort((first, second) => first.localeCompare(second, "es-CO")), [associates]);

  const summaryCards = useMemo(() => [
    { title: "Total asociados", value: associates.length.toString(), subtitle: "Registrados en la cooperativa", icon: <Users size={28} />, color: "bg-blue-50 text-blue-600" },
    { title: "Asociados activos", value: associates.filter((associate) => associate.status === "Activo").length.toString(), subtitle: "92% del total registrado", icon: <UserCheck size={28} />, color: "bg-emerald-50 text-emerald-600" },
    { title: "Nuevos este mes", value: associates.filter((associate) => associate.entryDate >= "2026-07-01").length.toString(), subtitle: "Registrados recientemente", icon: <UserRound size={28} />, color: "bg-violet-50 text-violet-600" },
    { title: "Documentación pendiente", value: associates.filter((associate) => associate.status === "Suspendido").length.toString(), subtitle: "Requieren revisión", icon: <FileWarning size={28} />, color: "bg-amber-50 text-amber-600" },
  ], [associates]);

  function openCreateModal() {
    reset({
      code: "",
      documentType: "",
      documentNumber: "",
      firstName: "",
      lastName: "",
      birthDate: "",
      gender: "",
      cellphone: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      department: "",
      entryDate: "",
      type: "",
      status: "",
      observations: "",
    });
    setSelectedAssociate(null);
    setIsModalOpen(true);
  }

  function openEditModal(associate) {
    setSelectedAssociate(associate);
    setValue("code", associate.code);
    setValue("documentType", associate.documentType);
    setValue("documentNumber", associate.documentNumber);
    setValue("firstName", associate.firstName);
    setValue("lastName", associate.lastName);
    setValue("birthDate", associate.birthDate);
    setValue("gender", associate.gender);
    setValue("cellphone", associate.cellphone);
    setValue("phone", associate.phone);
    setValue("email", associate.email);
    setValue("address", associate.address);
    setValue("city", associate.city);
    setValue("department", associate.department);
    setValue("entryDate", associate.entryDate);
    setValue("type", associate.type);
    setValue("status", associate.status);
    setValue("observations", associate.observations);
    setIsModalOpen(true);
  }

  function openDetailModal(associate) {
    setSelectedAssociate(associate);
    setIsDetailOpen(true);
  }

  function openConfirmStatusModal(associate) {
    setSelectedAssociate(associate);
    setPendingStatus(associate.status === "Activo" ? "Suspendido" : "Activo");
    setIsConfirmOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setSelectedAssociate(null);
  }

  function handleCloseDetail() {
    setIsDetailOpen(false);
    setSelectedAssociate(null);
  }

  function handleCloseConfirm() {
    setIsConfirmOpen(false);
    setSelectedAssociate(null);
    setPendingStatus(null);
  }

  async function onSubmit(data) {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const payload = {
      id: selectedAssociate?.id ?? nextId,
      code: selectedAssociate?.code ?? `ASO-${String(nextId).padStart(4, "0")}`,
      documentType: data.documentType,
      documentNumber: data.documentNumber.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      birthDate: data.birthDate,
      gender: data.gender,
      cellphone: data.cellphone.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      address: data.address.trim(),
      city: data.city,
      department: data.department.trim(),
      entryDate: data.entryDate,
      type: data.type,
      status: data.status,
      observations: data.observations.trim(),
    };

    setAssociates((current) => {
      if (selectedAssociate) {
        return current.map((associate) => (associate.id === selectedAssociate.id ? payload : associate));
      }
      setNextId((currentId) => currentId + 1);
      return [payload, ...current];
    });
    setLoading(false);
    handleCloseModal();
    notifySuccess(selectedAssociate ? "Asociado actualizado." : "Asociado creado.");
  }

  async function changeStatus() {
    if (!selectedAssociate) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    setAssociates((current) => current.map((associate) => associate.id === selectedAssociate.id ? { ...associate, status: pendingStatus } : associate));
    setLoading(false);
    handleCloseConfirm();
    notifySuccess("Estado cambiado.");
  }

  function handleSearchChange(event) {
    setSearch(event.target.value);
  }

  function handleFilterChange(event, filterKey) {
    const value = event.target.value;
    if (filterKey === "status") setStatusFilter(value);
    if (filterKey === "type") setTypeFilter(value);
    if (filterKey === "city") setCityFilter(value);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("Todos");
    setTypeFilter("Todos");
    setCityFilter("Todos");
    setSortBy("code");
  }

  return (
    <>
      <PageContainer>
        <PageHeader eyebrow="Gestión de asociados" title="Asociados" subtitle="Administra la información de los asociados registrados." action={<Button onClick={openCreateModal}><Plus size={18} strokeWidth={2.5} />Nuevo asociado</Button>} />
        <SummaryCards items={summaryCards} />
        <Card className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Estado del portafolio de asociados</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Resumen operativo de afiliación y seguimientos pendientes.</p>
            </div>
            <div className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">Última sincronización · 10:30 a. m.</div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500">Activos</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{associates.filter((associate) => associate.status === "Activo").length}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500">Suspendidos</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{associates.filter((associate) => associate.status === "Suspendido").length}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500">Inactivos</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{associates.filter((associate) => associate.status === "Inactivo").length}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-500">Ciudades</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{new Set(associates.map((associate) => associate.city)).size}</p>
            </div>
          </div>
        </Card>

        <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(10rem,0.8fr)_minmax(10rem,0.7fr)_minmax(10rem,0.7fr)_auto]">
          <label className="block" htmlFor="associate-search">
            <span className="mb-2 block text-sm font-bold text-slate-700">Buscar asociado</span>
            <Input aria-label="Buscar asociado" id="associate-search" onChange={handleSearchChange} placeholder="Código, documento, nombre o correo" value={search} />
          </label>
          <label className="block" htmlFor="associate-status">
            <span className="mb-2 block text-sm font-bold text-slate-700">Estado</span>
            <select aria-label="Filtrar por estado" className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" id="associate-status" onChange={(event) => handleFilterChange(event, "status")} value={statusFilter}>
              <option value="Todos">Todos</option>
              {associateStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label className="block" htmlFor="associate-type">
            <span className="mb-2 block text-sm font-bold text-slate-700">Tipo</span>
            <select aria-label="Filtrar por tipo" className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" id="associate-type" onChange={(event) => handleFilterChange(event, "type")} value={typeFilter}>
              <option value="Todos">Todos</option>
              {associateTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <label className="block" htmlFor="associate-city">
            <span className="mb-2 block text-sm font-bold text-slate-700">Ciudad</span>
            <select aria-label="Filtrar por ciudad" className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" id="associate-city" onChange={(event) => handleFilterChange(event, "city")} value={cityFilter}>
              <option value="Todos">Todas</option>
              {availableCities.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
          </label>
          <label className="block" htmlFor="associate-sort">
            <span className="mb-2 block text-sm font-bold text-slate-700">Ordenar por</span>
            <select aria-label="Ordenar asociados" className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" id="associate-sort" onChange={(event) => setSortBy(event.target.value)} value={sortBy}>
              {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <div className="flex items-end">
            <Button className="w-full" onClick={clearFilters} variant="secondary">Limpiar</Button>
          </div>
        </div>

        <DataSection className="mt-6 overflow-hidden p-0" description={`${filteredAssociates.length} asociados encontrados.`} headerClassName="border-b border-slate-200 px-6 py-5" title="Listado de asociados">
          {pagedAssociates.length === 0 ? (
            <EmptyState
              icon={<Users size={24} />}
              title="No se encontraron asociados"
              description="Ajusta los filtros o registra un nuevo asociado."
              action={<Button onClick={openCreateModal}><Plus size={18} strokeWidth={2.5} />Nuevo asociado</Button>}
            />
          ) : (
            <Table className="min-w-300">
              <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Código</th><th className="px-6 py-4">Asociado</th><th className="px-6 py-4">Documento</th><th className="px-6 py-4">Teléfono</th><th className="px-6 py-4">Tipo</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4">Ingreso</th><th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pagedAssociates.map((associate) => (
                  <tr className="transition hover:bg-slate-50/70" key={associate.id}>
                    <td className="px-6 py-4 text-sm font-extrabold text-slate-800">{associate.code}</td>
                    <td className="px-6 py-4"><p className="text-sm font-bold text-slate-800">{`${associate.firstName} ${associate.lastName}`}</p><p className="mt-0.5 text-xs font-medium text-slate-500">{associate.email}</p></td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">{`${associate.documentType} ${associate.documentNumber}`}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">{associate.cellphone}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">{associate.type}</td>
                    <td className="px-6 py-4"><Badge variant={statusVariant[associate.status]}>{associate.status}</Badge></td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">{associate.entryDate}</td>
                    <td className="px-6 py-4"><div className="flex justify-end gap-1"><Button aria-label={`Ver ${associate.code}`} onClick={() => openDetailModal(associate)} size="icon" title="Ver detalle" variant="ghost"><Eye size={17} /></Button><Button aria-label={`Editar ${associate.code}`} onClick={() => openEditModal(associate)} size="icon" title="Editar" variant="ghost"><Pencil size={17} /></Button><Button aria-label={`Cambiar estado de ${associate.code}`} onClick={() => openConfirmStatusModal(associate)} size="icon" title="Cambiar estado" variant="ghost"><ShieldCheck size={17} /></Button></div></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </DataSection>

        {filteredAssociates.length > 0 && <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-semibold text-slate-500">Página {Math.min(page, totalPages)} de {totalPages}</p><div className="flex gap-2"><Button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} variant="secondary">Anterior</Button><Button disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} variant="secondary">Siguiente</Button></div></div>}
      </PageContainer>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="lg" title={selectedAssociate ? "Editar asociado" : "Nuevo asociado"}>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <CatalogSelect {...documentTypeField} catalog="documentTypes" error={errors.documentType?.message} label="Tipo de documento" />
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Número de documento</span><Input {...register("documentNumber", { required: "Ingresa el número de documento" })} placeholder="Número de documento" />{errors.documentNumber && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.documentNumber.message}</p>}</label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Nombres</span><Input {...register("firstName", { required: "Ingresa los nombres" })} placeholder="Nombres" />{errors.firstName && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.firstName.message}</p>}</label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Apellidos</span><Input {...register("lastName", { required: "Ingresa los apellidos" })} placeholder="Apellidos" />{errors.lastName && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.lastName.message}</p>}</label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Fecha de nacimiento</span><Input {...register("birthDate", { required: "Selecciona la fecha de nacimiento" })} type="date" />{errors.birthDate && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.birthDate.message}</p>}</label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Género</span><Input {...register("gender", { required: "Ingresa el género" })} placeholder="Género" />{errors.gender && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.gender.message}</p>}</label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Celular</span><Input {...register("cellphone", { required: "Ingresa el celular" })} placeholder="Celular" />{errors.cellphone && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.cellphone.message}</p>}</label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Teléfono</span><Input {...register("phone")} placeholder="Teléfono" /></label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Correo electrónico</span><Input {...register("email", { required: "Ingresa el correo electrónico" })} placeholder="correo@ejemplo.com" type="email" />{errors.email && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.email.message}</p>}</label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Dirección</span><Input {...register("address", { required: "Ingresa la dirección" })} placeholder="Dirección" />{errors.address && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.address.message}</p>}</label>
            <LocationSelector city={selectedCity} cityError={errors.city?.message} department={selectedDepartment} departmentError={errors.department?.message} idPrefix="associate" onCityChange={(event) => setValue("city", event.target.value, { shouldValidate: true })} onDepartmentChange={(event) => { setValue("department", event.target.value, { shouldValidate: true }); setValue("city", ""); clearErrors("city"); }} />
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Fecha de afiliación</span><Input {...register("entryDate", { required: "Selecciona la fecha de afiliación" })} type="date" />{errors.entryDate && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.entryDate.message}</p>}</label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Tipo de asociado</span><select {...register("type", { required: "Selecciona el tipo de asociado" })} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"><option value="">Selecciona una opción</option>{associateTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}</select>{errors.type && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.type.message}</p>}</label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Estado</span><select {...register("status", { required: "Selecciona el estado" })} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"><option value="">Selecciona una opción</option>{associateStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select>{errors.status && <p className="mt-1 text-sm font-semibold text-rose-600">{errors.status.message}</p>}</label>
          </div>
          <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Observaciones</span><textarea {...register("observations")} className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="Observaciones del asociado" /></label>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4"><Button onClick={handleCloseModal} type="button" variant="secondary">Cancelar</Button><Button disabled={loading} type="submit">{loading ? "Guardando..." : "Guardar asociado"}</Button></div>
        </form>
      </Modal>

      <Modal isOpen={isDetailOpen} onClose={handleCloseDetail} title="Detalle del asociado">
        {selectedAssociate && <div className="space-y-5"><div><p className="text-lg font-extrabold text-slate-900">{`${selectedAssociate.firstName} ${selectedAssociate.lastName}`}</p><p className="mt-1 text-sm font-semibold text-slate-500">{selectedAssociate.code}</p></div><div className="grid gap-4 sm:grid-cols-2"><div><p className="text-xs font-bold text-slate-500">Documento</p><p className="mt-1 text-sm font-semibold text-slate-800">{`${selectedAssociate.documentType} ${selectedAssociate.documentNumber}`}</p></div><div><p className="text-xs font-bold text-slate-500">Estado</p><div className="mt-1"><Badge variant={statusVariant[selectedAssociate.status]}>{selectedAssociate.status}</Badge></div></div><div><p className="text-xs font-bold text-slate-500">Celular</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedAssociate.cellphone}</p></div><div><p className="text-xs font-bold text-slate-500">Correo</p><p className="mt-1 break-all text-sm font-semibold text-slate-800">{selectedAssociate.email}</p></div><div><p className="text-xs font-bold text-slate-500">Ciudad</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedAssociate.city}</p></div><div><p className="text-xs font-bold text-slate-500">Fecha de afiliación</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedAssociate.entryDate}</p></div><div className="sm:col-span-2"><p className="text-xs font-bold text-slate-500">Observaciones</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedAssociate.observations || "Sin observaciones."}</p></div></div><div className="flex justify-end"><Button onClick={handleCloseDetail} variant="secondary">Cerrar</Button></div></div>}
      </Modal>

      <Modal isOpen={isConfirmOpen} onClose={handleCloseConfirm} title="Cambiar estado">
        <div className="space-y-5"><p className="text-sm font-medium text-slate-600">{`¿Deseas cambiar el estado de ${selectedAssociate?.firstName ?? "este asociado"} a ${pendingStatus ?? ""}?`}</p><div className="flex justify-end gap-3"><Button onClick={handleCloseConfirm} variant="secondary">Cancelar</Button><Button disabled={loading} onClick={changeStatus}>{loading ? "Actualizando..." : "Confirmar"}</Button></div></div>
      </Modal>

      <ToastProvider />
    </>
  );
}
