import associateTypes from "../../data/catalogs/associateTypes";
import documentTypes from "../../data/catalogs/documentTypes";
import genders from "../../data/catalogs/genders";
import loanDestinations from "../../data/catalogs/loanDestinations";
import savingsTypes from "../../data/catalogs/savingsTypes";

const catalogs = {
  associateTypes,
  documentTypes,
  genders,
  loanDestinations,
  savingsTypes,
};

const selectClassName = "min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100";

export default function CatalogSelect({
  label,
  catalog,
  value,
  onChange,
  placeholder = "Selecciona una opción",
  required = false,
  disabled = false,
  error,
  id,
  ...props
}) {
  const options = catalogs[catalog] ?? [];
  const inputId = id ?? `catalog-${catalog}`;
  const valueProps = value === undefined ? {} : { value };

  return (
    <label className="block" htmlFor={inputId}>
      {label && <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>}
      <select aria-invalid={error ? "true" : "false"} className={selectClassName} disabled={disabled} id={inputId} onChange={onChange} required={required} {...valueProps} {...props}>
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {error && <p className="mt-1 text-sm font-semibold text-rose-600">{error}</p>}
    </label>
  );
}
