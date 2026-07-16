import { Ellipsis, Eye, Pencil } from "lucide-react";
import Button from "./Button";

export default function ActionMenu({ label }) {
  return (
    <div className="flex justify-end gap-1">
      <Button aria-label={`Ver ${label}`} size="icon" title="Ver" variant="ghost"><Eye size={18} /></Button>
      <Button aria-label={`Editar ${label}`} size="icon" title="Editar" variant="ghost"><Pencil size={17} /></Button>
      <Button aria-label={`Más opciones para ${label}`} size="icon" title="Más opciones" variant="ghost"><Ellipsis size={19} /></Button>
    </div>
  );
}
