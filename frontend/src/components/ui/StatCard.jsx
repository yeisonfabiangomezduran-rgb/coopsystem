import Card from "./Card";

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "bg-blue-100",
}) {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer">
      <div className="flex flex-col gap-5">
        <div
          className={`
            w-14
            h-14
            rounded-2xl
            flex
            items-center
            justify-center
            ${color}
          `}
        >
          {icon}
        </div>

        <div>
          <h2 className="text-4xl font-bold text-slate-800">
            {value}
          </h2>

          <p className="text-slate-500 mt-2">
            {title}
          </p>
        </div>

        <p className="text-green-600 font-semibold">
          {subtitle}
        </p>
      </div>
    </Card>
  );
}