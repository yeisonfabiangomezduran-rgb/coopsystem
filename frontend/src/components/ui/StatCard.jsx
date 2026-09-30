import Card from "./Card";

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "bg-blue-100",
}) {
  return <Card className="relative overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"><span className="absolute inset-x-0 top-0 h-1 bg-[#163A63]" /><div className="flex items-start justify-between gap-4 pt-1"><div><p className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#536273]">{title}</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1B2A41]">{value}</h2></div><div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${color}`}>{icon}</div></div><p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-[#16805C]"><span className="h-1.5 w-1.5 rounded-full bg-[#16805C]" />{subtitle}</p></Card>;
}
