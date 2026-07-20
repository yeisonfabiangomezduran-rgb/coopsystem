import locations from "../../data/colombia.json";

const selectClassName = "min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100";

export default function LocationSelector({
  city,
  cityError,
  department,
  departmentError,
  idPrefix = "location",
  onCityChange,
  onDepartmentChange,
}) {
  const cities = locations.find((location) => location.department === department)?.cities ?? [];

  return (
    <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
      <label className="block" htmlFor={`${idPrefix}-department`}>
        <span className="mb-2 block text-sm font-bold text-slate-700">Departamento</span>
        <select aria-invalid={departmentError ? "true" : "false"} className={selectClassName} id={`${idPrefix}-department`} onChange={onDepartmentChange} value={department}>
          <option value="">Selecciona un departamento</option>
          {locations.map((location) => <option key={location.department} value={location.department}>{location.department}</option>)}
        </select>
        {departmentError && <p className="mt-1 text-sm font-semibold text-rose-600">{departmentError}</p>}
      </label>
      <label className="block" htmlFor={`${idPrefix}-city`}>
        <span className="mb-2 block text-sm font-bold text-slate-700">Municipio</span>
        <select aria-invalid={cityError ? "true" : "false"} className={selectClassName} disabled={!department} id={`${idPrefix}-city`} onChange={onCityChange} value={city}>
          <option value="">{department ? "Selecciona un municipio" : "Selecciona primero un departamento"}</option>
          {cities.map((currentCity) => <option key={currentCity} value={currentCity}>{currentCity}</option>)}
        </select>
        {cityError && <p className="mt-1 text-sm font-semibold text-rose-600">{cityError}</p>}
      </label>
    </div>
  );
}
