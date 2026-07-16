import { ArrowDown, ArrowUp } from "lucide-react";
import Card from "./Card";

export default function StatCard({ title, value, subtitle, icon, color = "bg-blue-50 text-blue-600", trend = "up" }) {
  const isUp = trend === "up";

  return (
    <Card className="group min-h-48 p-6 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <p className="text-base font-bold text-slate-500">{title}</p>
          <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl ${color}`}>
            {icon}
          </div>
        </div>
        <p className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">{value}</p>
        <p className={`mt-auto flex items-center gap-1 text-sm font-bold ${isUp ? "text-emerald-600" : "text-rose-500"}`}>
          {isUp ? <ArrowUp size={17} strokeWidth={3} /> : <ArrowDown size={17} strokeWidth={3} />}
          {subtitle}
        </p>
      </div>
    </Card>
  );
}
