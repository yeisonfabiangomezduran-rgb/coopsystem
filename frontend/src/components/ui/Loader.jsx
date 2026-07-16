export default function Loader({ label = "Cargando..." }) {
  return (
    <div className="flex min-h-48 items-center justify-center gap-3 text-sm font-semibold text-slate-500" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
      {label}
    </div>
  );
}
