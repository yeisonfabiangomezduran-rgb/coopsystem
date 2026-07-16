import { Landmark, LogOut } from "lucide-react";

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-28 max-w-[1440px] items-center px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-200">
            <Landmark size={26} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              CoopSystem
            </p>
            <p className="mt-0.5 text-sm font-medium text-slate-500 sm:text-base">
              Sistema de Gestión Cooperativa
            </p>
          </div>
        </div>

        <div className="flex flex-1 justify-center">
          <div className="hidden md:block" />
        </div>

        <div className="flex flex-1 justify-end">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="font-bold text-slate-900">Administrador</p>
              <button className="mt-1 flex items-center gap-1 text-sm font-semibold text-rose-500 transition hover:text-rose-600">
                <LogOut size={15} /> Cerrar sesión
              </button>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-sm">
              A
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
