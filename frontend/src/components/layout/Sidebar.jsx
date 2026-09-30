import { ChartNoAxesCombined, FileChartColumn, HandCoins, Landmark, ReceiptText, Settings2, UserRound, Users, WalletCards } from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  { label: "Dashboard", icon: ChartNoAxesCombined, to: "/" },
  { label: "Asociados", icon: Users, to: "/asociados" },
  { label: "Ahorros", icon: WalletCards, to: "/ahorros" },
  { label: "Préstamos", icon: HandCoins, to: "/prestamos" },
  { label: "Transacciones", icon: ReceiptText, to: "/transacciones" },
  { label: "Reportes", icon: FileChartColumn, to: "/reportes" },
  { label: "Usuarios", icon: UserRound, to: "/usuarios" },
  { label: "Configuración", icon: Settings2, to: "/configuracion" },
  { label: "Tesorería", icon: Landmark, to: "/tesoreria" },
];

export default function Sidebar() {
  return (
    <nav className="bg-[#163A63] shadow-sm" aria-label="Navegación principal">
      <div className="mx-auto flex max-w-[1440px] overflow-x-auto px-2 sm:px-5 lg:px-9">
        {navigation.map(({ label, icon: Icon, to }) => to ? (
          <NavLink
            className={({ isActive }) => `relative flex shrink-0 items-center gap-2 px-3 py-4 text-sm font-semibold whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white sm:px-4 ${isActive ? "bg-[#245B8F] text-white" : "text-[#dbe8f3] hover:bg-[#245B8F] hover:text-white"}`}
            end={to === "/"}
            key={label}
            to={to}
          >
            {({ isActive }) => <><Icon size={18} strokeWidth={2} />{label}{isActive && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-[#6dd4af]" />}</>}
          </NavLink>
        ) : (
          <button className="flex shrink-0 flex-1 items-center justify-center gap-1.5 px-3 py-5 text-sm font-bold text-slate-400 sm:px-4 sm:text-base" disabled key={label}>
            <Icon size={21} strokeWidth={2.2} />{label}
          </button>
        ))}
      </div>
    </nav>
  );
}
