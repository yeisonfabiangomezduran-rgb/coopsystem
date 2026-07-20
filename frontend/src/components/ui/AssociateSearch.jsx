import { useState } from "react";
import { Search, X } from "lucide-react";
import Badge from "./Badge";
import Button from "./Button";
import Input from "./Input";

const statusVariant = {
  Activo: "success",
  Inactivo: "neutral",
  Suspendido: "warning",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value).replace("COP", "$ ");
}

export default function AssociateSearch({ associates = [], onClear = () => {}, onSelect = () => {}, searchInputId = "associate-search", selectedAssociate, selectedSummary }) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLocaleLowerCase("es-CO");
  const matches = normalizedSearch ? associates.filter((associate) => [associate.code, associate.firstName, associate.lastName, associate.documentNumber].some((value) => value.toLocaleLowerCase("es-CO").includes(normalizedSearch))) : [];

  function selectAssociate(associate) {
    onSelect(associate);
    setSearch("");
  }

  function clearAssociate() {
    onClear();
    setSearch("");
  }

  return (
    <div className="space-y-3">
      <label className="block" htmlFor={searchInputId}>
        <span className="mb-2 block text-sm font-bold text-slate-700">Buscar asociado</span>
        <Input aria-label="Buscar asociado por código, documento, nombre o apellido" id={searchInputId} leadingAdornment={<Search size={18} />} onChange={(event) => setSearch(event.target.value)} placeholder="Código, documento, nombre o apellido" value={search} />
      </label>

      {!selectedAssociate && normalizedSearch && (
        <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white">
          {matches.length ? matches.map((associate) => (
            <button className="flex w-full items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50" key={associate.id} onClick={() => selectAssociate(associate)} type="button">
              <span><span className="block text-sm font-bold text-slate-800">{`${associate.firstName} ${associate.lastName}`}</span><span className="mt-0.5 block text-xs font-medium text-slate-500">{associate.documentNumber}</span></span>
              <Badge variant={statusVariant[associate.status]}>{associate.status}</Badge>
            </button>
          )) : <p className="px-4 py-3 text-sm font-semibold text-slate-500">No se encontraron asociados.</p>}
        </div>
      )}

      {selectedAssociate && (
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-base font-extrabold text-slate-900">{`${selectedAssociate.firstName} ${selectedAssociate.lastName}`}</p><p className="mt-1 text-sm font-semibold text-slate-500">{selectedAssociate.code}</p></div>
            <Button aria-label="Cambiar asociado" onClick={clearAssociate} size="icon" title="Cambiar asociado" variant="ghost"><X size={17} /></Button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div><p className="text-xs font-bold text-slate-500">Código</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedAssociate.code}</p></div>
            <div><p className="text-xs font-bold text-slate-500">Documento</p><p className="mt-1 text-sm font-semibold text-slate-800">{`${selectedAssociate.documentType} ${selectedAssociate.documentNumber}`}</p></div>
            <div><p className="text-xs font-bold text-slate-500">Nombre completo</p><p className="mt-1 text-sm font-semibold text-slate-800">{`${selectedAssociate.firstName} ${selectedAssociate.lastName}`}</p></div>
            <div><p className="text-xs font-bold text-slate-500">Estado</p><div className="mt-1"><Badge variant={statusVariant[selectedAssociate.status]}>{selectedAssociate.status}</Badge></div></div>
            <div><p className="text-xs font-bold text-slate-500">Fecha de afiliación</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedAssociate.entryDate}</p></div>
            {selectedSummary && <><div><p className="text-xs font-bold text-slate-500">Total de ahorros</p><p className="mt-1 text-sm font-semibold text-slate-800">{formatCurrency(selectedSummary.totalSavings)}</p></div><div><p className="text-xs font-bold text-slate-500">Préstamos activos</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedSummary.activeLoans}</p></div><div><p className="text-xs font-bold text-slate-500">Saldo pendiente</p><p className="mt-1 text-sm font-semibold text-slate-800">{formatCurrency(selectedSummary.pendingBalance)}</p></div></>}
          </div>
        </div>
      )}
    </div>
  );
}
