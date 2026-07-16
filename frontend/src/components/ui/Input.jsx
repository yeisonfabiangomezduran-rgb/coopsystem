export default function Input({ className = "", leadingAdornment, ...props }) {
  return (
    <div className="relative">
      {leadingAdornment && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">{leadingAdornment}</span>}
      <input
        className={`min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 ${leadingAdornment ? "pl-10" : ""} ${className}`}
        {...props}
      />
    </div>
  );
}
