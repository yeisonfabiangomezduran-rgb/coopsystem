import { Ellipsis, Eye, Pencil } from "lucide-react";
import { useState } from "react";
import Button from "./Button";

export default function ActionMenu({ label, onEdit, onView, options = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex justify-end gap-1">
      <Button aria-label={`Ver ${label}`} onClick={onView} size="icon" title="Ver" variant="ghost"><Eye size={18} /></Button>
      <Button aria-label={`Editar ${label}`} onClick={onEdit} size="icon" title="Editar" variant="ghost"><Pencil size={17} /></Button>
      <Button aria-expanded={isOpen} aria-label={`Más opciones para ${label}`} onClick={() => setIsOpen((current) => !current)} size="icon" title="Más opciones" variant="ghost"><Ellipsis size={19} /></Button>
      {isOpen && <div className="absolute right-0 top-10 z-20 w-52 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">{options.map((option) => <button className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900" key={option.label} onClick={() => { setIsOpen(false); option.onClick(); }} type="button">{option.label}</button>)}</div>}
    </div>
  );
}
