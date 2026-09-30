import { Bell, Landmark, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { logout, user } = useAuth();
  const username = user?.username ?? "Usuario";

  return (
    <header className="border-b border-[#dce5ed] bg-white">
      <div className="mx-auto flex min-h-20 max-w-[1440px] items-center gap-4 px-5 py-3 sm:px-8 lg:px-12">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#163A63] text-white shadow-sm">
            <Landmark size={24} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-extrabold tracking-tight text-[#163A63] sm:text-2xl">
              CoopSystem
            </p>
            <p className="truncate text-xs font-semibold text-[#536273] sm:text-sm">
              Sistema de Gestión Cooperativa
            </p>
          </div>
          <p className="ml-5 hidden border-l border-slate-200 pl-5 text-xs font-medium leading-4 text-[#536273] lg:block">Juntos construimos<br />un mejor futuro</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
            <button aria-label="Notificaciones" className="relative grid h-10 w-10 place-items-center rounded-lg text-[#536273] transition hover:bg-[#EAF2F8] hover:text-[#163A63] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1769E0]" type="button">
              <Bell size={20} /><span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#16805C] ring-2 ring-white" />
            </button>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-[#1B2A41]">{username}</p><p className="text-xs font-medium text-[#536273]">Usuario autenticado</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#EAF2F8] text-sm font-extrabold text-[#163A63] ring-1 ring-[#cfe0ed]" aria-label={`Usuario ${username}`}>
              {username.charAt(0).toUpperCase()}
            </div>
            <button aria-label="Cerrar sesión" className="inline-flex items-center gap-1.5 border-l border-slate-200 pl-3 text-sm font-bold text-[#536273] transition hover:text-[#D92D20] sm:pl-4" onClick={logout} type="button"><LogOut size={17} /> <span className="hidden lg:inline">Cerrar sesión</span></button>
        </div>
      </div>
    </header>
  );
}
