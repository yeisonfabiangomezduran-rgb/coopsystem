export default function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}) {
  const variants = {
    primary: "bg-[#163A63] text-white shadow-sm hover:bg-[#245B8F] focus-visible:outline-[#1769E0]",
    secondary: "border border-[#b9c9d7] bg-white text-[#163A63] hover:bg-[#EAF2F8] focus-visible:outline-[#1769E0]",
    ghost: "text-[#536273] hover:bg-[#EAF2F8] hover:text-[#163A63] focus-visible:outline-[#1769E0]",
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
