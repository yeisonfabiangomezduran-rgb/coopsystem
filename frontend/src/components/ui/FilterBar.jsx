import { Search } from "lucide-react";
import Button from "./Button";
import Input from "./Input";
import SectionCard from "./SectionCard";

export default function FilterBar({
  filters,
  gridClassName,
  idPrefix,
  searchAriaLabel = "Buscar asociado",
  searchLabel = "Buscar asociado",
  searchPlaceholder = "Nombre, código o documento",
  searchValue,
  values = {},
  onSearchChange,
  onChange,
  onReset,
}) {
  return (
    <SectionCard title="Filtros" className="p-5 sm:p-6">
      <div className={`grid gap-3 md:grid-cols-2 xl:items-end ${gridClassName}`}>
        <label className="block" htmlFor={`${idPrefix}-search`}>
          <span className="mb-2 block text-sm font-bold text-slate-700">{searchLabel}</span>
          <Input aria-label={searchAriaLabel} id={`${idPrefix}-search`} leadingAdornment={<Search size={18} />} onChange={(event) => onSearchChange?.(event.target.value)} placeholder={searchPlaceholder} value={searchValue} />
        </label>
        {filters.map((filter) => (
          <label className="block" htmlFor={`${idPrefix}-${filter.id}`} key={filter.id}>
            <span className="mb-2 block text-sm font-bold text-slate-700">{filter.label}</span>
            <select aria-label={filter.ariaLabel} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" id={`${idPrefix}-${filter.id}`} onChange={(event) => onChange?.(filter.id, event.target.value)} value={values[filter.id]}>
              {filter.options.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        ))}
        <Button className="w-full xl:w-auto" onClick={onReset} type="button" variant="secondary">Limpiar filtros</Button>
      </div>
    </SectionCard>
  );
}
