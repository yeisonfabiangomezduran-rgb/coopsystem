import { useState } from "react";
import { BellRing, Building2, CreditCard, FolderKanban, Landmark, LockKeyhole, Plus, Save, Settings2, ShieldCheck, Users, WalletCards } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import CatalogSelect from "../../components/ui/CatalogSelect";
import DataSection from "../../components/ui/DataSection";
import Input from "../../components/ui/Input";
import LocationSelector from "../../components/ui/LocationSelector";
import Modal from "../../components/ui/Modal";
import PageContainer from "../../components/ui/PageContainer";
import PageHeader from "../../components/ui/PageHeader";
import SummaryCards from "../../components/ui/SummaryCards";
import Table from "../../components/ui/Table";
import ToastProvider from "../../components/ui/ToastProvider";
import { notifySuccess } from "../../components/ui/toastNotifications";

const sections = [
  { id: "company", label: "Información de la cooperativa", icon: Building2 },
  { id: "users", label: "Usuarios y Roles", icon: Users },
  { id: "catalogs", label: "Catálogos", icon: FolderKanban },
  { id: "savings", label: "Productos de ahorro", icon: WalletCards },
  { id: "credit", label: "Líneas de crédito", icon: CreditCard },
  { id: "financial", label: "Parámetros financieros", icon: Landmark },
  { id: "sequences", label: "Consecutivos", icon: Settings2 },
  { id: "notifications", label: "Notificaciones", icon: BellRing },
  { id: "security", label: "Seguridad", icon: LockKeyhole },
];

const initialCatalogs = [
  { id: "documentTypes", name: "Tipos de documento", description: "Documentos de identificación de asociados", records: 4, status: "Activo" },
  { id: "associateTypes", name: "Tipos de asociado", description: "Clasificación de asociados", records: 2, status: "Activo" },
  { id: "savingsTypes", name: "Tipos de ahorro", description: "Productos de ahorro disponibles", records: 3, status: "Activo" },
  { id: "loanDestinations", name: "Destinos de préstamo", description: "Finalidades de crédito permitidas", records: 5, status: "Activo" },
  { id: "states", name: "Estados", description: "Estados operativos del sistema", records: 6, status: "Activo" },
  { id: "genders", name: "Géneros", description: "Opciones de identificación", records: 3, status: "Inactivo" },
];

const initialSavingsProducts = [
  { id: 1, name: "Ahorro a la vista", rate: "2,5% E.A.", status: "Activo" },
  { id: 2, name: "Ahorro programado", rate: "4,2% E.A.", status: "Activo" },
  { id: 3, name: "Ahorro empresarial", rate: "3,8% E.A.", status: "Inactivo" },
];

const initialCreditLines = [
  { id: 1, name: "Crédito de libre inversión", rate: "18,5% E.A.", term: "60 meses", amount: "$ 50.000.000", status: "Activo" },
  { id: 2, name: "Crédito de vivienda", rate: "12,0% E.A.", term: "180 meses", amount: "$ 250.000.000", status: "Activo" },
  { id: 3, name: "Crédito educativo", rate: "10,5% E.A.", term: "48 meses", amount: "$ 30.000.000", status: "Inactivo" },
];

const statusVariant = { Activo: "success", Inactivo: "neutral" };
const fieldClassName = "min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100";

export default function Configuration() {
  const [activeSection, setActiveSection] = useState("company");
  const [company, setCompany] = useState({ name: "Cooperativa CoopSystem", nit: "901.234.567-8", address: "Carrera 15 # 98-12", department: "Cundinamarca", city: "Bogotá", phone: "601 743 2500", email: "contacto@coopsystem.co", website: "www.coopsystem.co", logo: "Logo institucional" });
  const [catalogs, setCatalogs] = useState(initialCatalogs);
  const [savingsProducts, setSavingsProducts] = useState(initialSavingsProducts);
  const [creditLines, setCreditLines] = useState(initialCreditLines);
  const [financial, setFinancial] = useState({ currentInterest: "18,5", lateInterest: "27,75", graceDays: "5", currency: "COP" });
  const [sequences, setSequences] = useState({ associate: "ASO", savings: "AHO", loan: "PRE", transaction: "TRA" });
  const [security, setSecurity] = useState({ session: "30", passwordLength: "8", attempts: "3", twoFactor: true });
  const [notifications, setNotifications] = useState({ email: true, dueDates: true, operations: false });
  const [modal, setModal] = useState(null);
  const [modalValue, setModalValue] = useState("");

  function updateCompany(field, value) {
    setCompany((current) => ({ ...current, [field]: value }));
  }

  function save(message) {
    notifySuccess(message);
  }

  function toggleStatus(setter, id) {
    setter((items) => items.map((item) => item.id === id ? { ...item, status: item.status === "Activo" ? "Inactivo" : "Activo" } : item));
    notifySuccess("Estado actualizado correctamente.");
  }

  function openEditModal(type, item) {
    setModal({ type, item });
    setModalValue(item.name);
  }

  function openNewSavingsProduct() {
    setModal({ type: "savings", item: { id: Date.now(), name: "", rate: "0,0% E.A.", status: "Activo", isNew: true } });
    setModalValue("");
  }

  function saveModal() {
    if (!modalValue.trim()) return;
    const updater = modal.type === "savings" ? setSavingsProducts : modal.type === "credit" ? setCreditLines : setCatalogs;
    updater((items) => modal.item.isNew ? [...items, { ...modal.item, name: modalValue.trim() }] : items.map((item) => item.id === modal.item.id ? { ...item, name: modalValue.trim() } : item));
    setModal(null);
    notifySuccess("Configuración actualizada correctamente.");
  }

  function renderCompany() {
    return <DataSection className="p-6" description="Datos institucionales visibles en documentos y comunicaciones de la cooperativa." title="Información de la cooperativa"><form className="mt-6 space-y-5" onSubmit={(event) => { event.preventDefault(); save("Información de la cooperativa guardada."); }}><div className="grid gap-4 md:grid-cols-2"><label className="block md:col-span-2"><span className="mb-2 block text-sm font-bold text-slate-700">Nombre</span><Input onChange={(event) => updateCompany("name", event.target.value)} value={company.name} /></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">NIT</span><Input onChange={(event) => updateCompany("nit", event.target.value)} value={company.nit} /></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Teléfono</span><Input onChange={(event) => updateCompany("phone", event.target.value)} value={company.phone} /></label><label className="block md:col-span-2"><span className="mb-2 block text-sm font-bold text-slate-700">Dirección</span><Input onChange={(event) => updateCompany("address", event.target.value)} value={company.address} /></label><LocationSelector city={company.city} department={company.department} idPrefix="company" onCityChange={(event) => updateCompany("city", event.target.value)} onDepartmentChange={(event) => { updateCompany("department", event.target.value); updateCompany("city", ""); }} /><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Correo</span><Input onChange={(event) => updateCompany("email", event.target.value)} type="email" value={company.email} /></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Página web</span><Input onChange={(event) => updateCompany("website", event.target.value)} value={company.website} /></label><label className="block md:col-span-2"><span className="mb-2 block text-sm font-bold text-slate-700">Logo</span><Input accept="image/*" onChange={(event) => updateCompany("logo", event.target.files?.[0]?.name ?? "Logo institucional")} type="file" /><p className="mt-1 text-sm font-semibold text-slate-500">{company.logo}</p></label></div><div className="flex justify-end border-t border-slate-200 pt-4"><Button type="submit"><Save size={17} />Guardar cambios</Button></div></form></DataSection>;
  }

  function renderCatalogs() {
    return <DataSection className="overflow-hidden p-0" description="Administra los valores de referencia usados en todo el sistema." headerClassName="border-b border-slate-200 px-6 py-5" title="Catálogos del sistema"><div className="px-6 pt-5"><CatalogSelect catalog="documentTypes" label="Catálogo de referencia" onChange={() => {}} value="" /></div><Table className="min-w-[780px]"><thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4">Catálogo</th><th className="px-6 py-4">Descripción</th><th className="px-6 py-4">Registros</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-slate-200">{catalogs.map((catalog) => <tr className="transition hover:bg-slate-50/70" key={catalog.id}><td className="px-6 py-4 text-sm font-extrabold text-slate-800">{catalog.name}</td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{catalog.description}</td><td className="px-6 py-4 text-sm font-semibold text-slate-700">{catalog.records}</td><td className="px-6 py-4"><Badge variant={statusVariant[catalog.status]}>{catalog.status}</Badge></td><td className="px-6 py-4"><div className="flex justify-end gap-2"><Button onClick={() => setModal({ type: "view", item: catalog })} size="sm" variant="ghost">Ver</Button><Button onClick={() => openEditModal("catalog", catalog)} size="sm" variant="ghost">Editar</Button><Button onClick={() => toggleStatus(setCatalogs, catalog.id)} size="sm" variant="ghost">{catalog.status === "Activo" ? "Desactivar" : "Activar"}</Button></div></td></tr>)}</tbody></Table></DataSection>;
  }

  function renderProducts() {
    return <DataSection action={<Button onClick={openNewSavingsProduct} size="sm"><Plus size={16} />Nuevo producto</Button>} className="overflow-hidden p-0" description="Configura los productos de ahorro disponibles para los asociados." headerClassName="flex items-center justify-between border-b border-slate-200 px-6 py-5" title="Productos de ahorro"><Table className="min-w-[680px]"><thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4">Nombre</th><th className="px-6 py-4">Tasa</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-slate-200">{savingsProducts.map((product) => <tr key={product.id}><td className="px-6 py-4 text-sm font-extrabold text-slate-800">{product.name}</td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{product.rate}</td><td className="px-6 py-4"><Badge variant={statusVariant[product.status]}>{product.status}</Badge></td><td className="px-6 py-4"><div className="flex justify-end gap-2"><Button onClick={() => openEditModal("savings", product)} size="sm" variant="ghost">Editar</Button><Button onClick={() => toggleStatus(setSavingsProducts, product.id)} size="sm" variant="ghost">{product.status === "Activo" ? "Desactivar" : "Activar"}</Button></div></td></tr>)}</tbody></Table></DataSection>;
  }

  function renderCredit() {
    return <DataSection className="overflow-hidden p-0" description="Define las condiciones de las líneas de crédito de la cooperativa." headerClassName="border-b border-slate-200 px-6 py-5" title="Líneas de crédito"><Table className="min-w-[860px]"><thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4">Nombre</th><th className="px-6 py-4">Tasa</th><th className="px-6 py-4">Plazo máximo</th><th className="px-6 py-4">Monto máximo</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-slate-200">{creditLines.map((line) => <tr key={line.id}><td className="px-6 py-4 text-sm font-extrabold text-slate-800">{line.name}</td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{line.rate}</td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{line.term}</td><td className="px-6 py-4 text-sm font-semibold text-slate-600">{line.amount}</td><td className="px-6 py-4"><Badge variant={statusVariant[line.status]}>{line.status}</Badge></td><td className="px-6 py-4"><div className="flex justify-end gap-2"><Button onClick={() => openEditModal("credit", line)} size="sm" variant="ghost">Editar</Button><Button onClick={() => toggleStatus(setCreditLines, line.id)} size="sm" variant="ghost">{line.status === "Activo" ? "Desactivar" : "Activar"}</Button></div></td></tr>)}</tbody></Table></DataSection>;
  }

  function renderFinancial() {
    return <DataSection className="p-6" description="Valores de referencia aplicados a los procesos financieros." title="Parámetros financieros"><form className="mt-6 space-y-5" onSubmit={(event) => { event.preventDefault(); save("Parámetros financieros guardados."); }}><div className="grid gap-4 md:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Interés corriente (%)</span><Input onChange={(event) => setFinancial({ ...financial, currentInterest: event.target.value })} value={financial.currentInterest} /></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Interés de mora (%)</span><Input onChange={(event) => setFinancial({ ...financial, lateInterest: event.target.value })} value={financial.lateInterest} /></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Días de gracia</span><Input min="0" onChange={(event) => setFinancial({ ...financial, graceDays: event.target.value })} type="number" value={financial.graceDays} /></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Moneda</span><select className={fieldClassName} onChange={(event) => setFinancial({ ...financial, currency: event.target.value })} value={financial.currency}><option>COP</option><option>USD</option></select></label></div><div className="flex justify-end border-t border-slate-200 pt-4"><Button type="submit"><Save size={17} />Guardar parámetros</Button></div></form></DataSection>;
  }

  function renderSequences() {
    const sequenceRows = [["Asociados", "associate"], ["Ahorros", "savings"], ["Préstamos", "loan"], ["Transacciones", "transaction"]];
    return <DataSection className="p-6" description="El número se incrementa automáticamente; solo el prefijo puede ser modificado." title="Consecutivos"><div className="mt-6 space-y-4">{sequenceRows.map(([label, key]) => <div className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[minmax(0,1fr)_10rem_minmax(12rem,.7fr)] md:items-end" key={key}><p className="pb-2 text-sm font-extrabold text-slate-800">{label}</p><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Prefijo</span><Input maxLength="3" onChange={(event) => setSequences({ ...sequences, [key]: event.target.value.toUpperCase() })} value={sequences[key]} /></label><div><p className="mb-2 text-sm font-bold text-slate-700">Siguiente consecutivo</p><p className="min-h-10 rounded-lg bg-slate-100 px-3 py-2 text-sm font-extrabold text-slate-700">{`${sequences[key]}-000001`}</p></div></div>)}</div><div className="mt-5 flex justify-end"><Button onClick={() => save("Consecutivos actualizados.")}><Save size={17} />Guardar consecutivos</Button></div></DataSection>;
  }

  function renderSecurity() {
    return <DataSection className="p-6" description="Políticas simuladas para proteger el acceso a CoopSystem." title="Seguridad"><div className="mt-6 grid gap-4 md:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Tiempo de sesión (minutos)</span><Input min="1" onChange={(event) => setSecurity({ ...security, session: event.target.value })} type="number" value={security.session} /></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Longitud mínima de contraseña</span><Input min="6" onChange={(event) => setSecurity({ ...security, passwordLength: event.target.value })} type="number" value={security.passwordLength} /></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Intentos permitidos</span><Input min="1" onChange={(event) => setSecurity({ ...security, attempts: event.target.value })} type="number" value={security.attempts} /></label><label className="flex min-h-10 items-center justify-between rounded-lg border border-slate-200 px-3"><span className="text-sm font-bold text-slate-700">Doble autenticación</span><input checked={security.twoFactor} className="h-4 w-4 accent-blue-600" onChange={(event) => setSecurity({ ...security, twoFactor: event.target.checked })} type="checkbox" /></label></div><div className="mt-5 flex justify-end"><Button onClick={() => save("Configuración de seguridad guardada.")}><Save size={17} />Guardar seguridad</Button></div></DataSection>;
  }

  function renderSimpleSection(title, description, values) {
    return <DataSection className="p-6" description={description} title={title}><div className="mt-6 grid gap-4 md:grid-cols-2">{values.map(([label, value]) => <div className="rounded-xl border border-slate-200 p-4" key={label}><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-1 text-sm font-extrabold text-slate-800">{value}</p></div>)}</div></DataSection>;
  }

  const sectionContent = { company: renderCompany(), users: renderSimpleSection("Usuarios y Roles", "Administración simulada de perfiles y permisos del sistema.", [["Usuarios administradores", "4"], ["Roles configurados", "3"], ["Última revisión", "Hoy · 10:30 a. m."], ["Estado", "Operativo"]]), catalogs: renderCatalogs(), savings: renderProducts(), credit: renderCredit(), financial: renderFinancial(), sequences: renderSequences(), notifications: <DataSection className="p-6" description="Preferencias simuladas de comunicación y alertas operativas." title="Notificaciones"><div className="mt-6 space-y-3">{[["email", "Notificaciones por correo"], ["dueDates", "Alertas de vencimientos"], ["operations", "Confirmaciones de operaciones"]].map(([key, label]) => <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3" key={key}><span className="text-sm font-bold text-slate-700">{label}</span><input checked={notifications[key]} className="h-4 w-4 accent-blue-600" onChange={(event) => setNotifications({ ...notifications, [key]: event.target.checked })} type="checkbox" /></label>)}</div><div className="mt-5 flex justify-end"><Button onClick={() => save("Preferencias de notificación guardadas.")}><Save size={17} />Guardar preferencias</Button></div></DataSection>, security: renderSecurity() };

  return <><PageContainer><PageHeader eyebrow="Centro de administración" subtitle="Administra los parámetros generales y la operación de CoopSystem." title="Configuración" /><SummaryCards items={[{ title: "Cooperativa", value: "1", subtitle: company.name, icon: <Building2 size={28} />, color: "bg-blue-50 text-blue-600" }, { title: "Catálogos", value: catalogs.length.toString(), subtitle: "Configurados en el sistema", icon: <FolderKanban size={28} />, color: "bg-emerald-50 text-emerald-600" }, { title: "Usuarios administradores", value: "4", subtitle: "Con acceso administrativo", icon: <Users size={28} />, color: "bg-violet-50 text-violet-600" }, { title: "Última actualización", value: "Hoy", subtitle: "10:30 a. m.", icon: <ShieldCheck size={28} />, color: "bg-amber-50 text-amber-600" }]} /><section className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]"><aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><p className="px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">Categorías</p><nav className="space-y-1" aria-label="Categorías de configuración">{sections.map((section) => { const Icon = section.icon; const active = activeSection === section.id; return <button className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`} key={section.id} onClick={() => setActiveSection(section.id)} type="button"><Icon size={18} />{section.label}</button>; })}</nav></aside><div>{sectionContent[activeSection]}</div></section></PageContainer><Modal isOpen={Boolean(modal)} onClose={() => setModal(null)} size="md" title={modal?.type === "view" ? modal.item.name : "Editar configuración"}>{modal?.type === "view" ? <div className="space-y-4"><p className="text-sm font-semibold text-slate-600">{modal.item.description}</p><div className="rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-700">{modal.item.records} registros configurados · Estado {modal.item.status}</div><div className="flex justify-end"><Button onClick={() => setModal(null)} variant="secondary">Cerrar</Button></div></div> : <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); saveModal(); }}><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Nombre</span><Input onChange={(event) => setModalValue(event.target.value)} value={modalValue} /></label><div className="flex justify-end gap-3 border-t border-slate-200 pt-4"><Button onClick={() => setModal(null)} variant="secondary">Cancelar</Button><Button type="submit">Guardar</Button></div></form>}</Modal><ToastProvider /></>;
}
