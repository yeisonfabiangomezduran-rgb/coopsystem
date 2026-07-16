export default function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}) {
  const variants = {
    primary: "bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:outline-blue-600",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-slate-400",
    ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-slate-400",
  };
  const sizes = {
    md: "min-h-10 px-4 text-sm",
    sm: "min-h-9 px-3 text-sm",
    icon: "h-9 w-9",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
