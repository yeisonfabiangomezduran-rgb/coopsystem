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
    <nav className="border-b border-slate-200 bg-white" aria-label="Navegación principal">
      <div className="mx-auto flex max-w-[1440px] justify-center gap-1 overflow-x-auto px-3 sm:px-5 lg:px-6">
        {navigation.map(({ label, icon: Icon, to }) => to ? (
          <NavLink
            className={({ isActive }) => `relative flex shrink-0 flex-1 items-center justify-center gap-1.5 px-3 py-5 text-sm font-bold transition sm:px-4 sm:text-base ${isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-800"}`}
            end={to === "/"}
            key={label}
            to={to}
          >
            {({ isActive }) => <><Icon size={21} strokeWidth={2.2} />{label}{isActive && <span className="absolute inset-x-1 bottom-0 h-0.75 rounded-t-full bg-blue-600" />}</>}
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
