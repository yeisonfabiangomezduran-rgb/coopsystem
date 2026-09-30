const variants = {
  success: "bg-[#E8F7F0] text-[#16805C] ring-[#bde8d7]",
  neutral: "bg-slate-100 text-[#536273] ring-slate-200",
  warning: "bg-amber-50 text-[#D97706] ring-amber-200",
};

export default function Badge({ children, variant = "neutral", className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
