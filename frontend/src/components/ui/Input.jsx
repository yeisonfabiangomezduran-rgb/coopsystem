export default function Input({ className = "", leadingAdornment, ...props }) {
  return (
    <div className="relative w-full min-w-0">
      {leadingAdornment && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">{leadingAdornment}</span>}
      <input
        className={`block h-10 w-full min-w-0 rounded-lg border border-[#c9d5df] bg-white px-3 text-sm font-medium text-[#1B2A41] outline-none transition placeholder:text-[#7b8794] focus:border-[#1769E0] focus:ring-3 focus:ring-[#EAF2F8] ${leadingAdornment ? "pl-10" : ""} ${className}`}
        {...props}
      />
    </div>
  );
}
