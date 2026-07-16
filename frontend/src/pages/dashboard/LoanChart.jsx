import {
  Area,
  AreaChart,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  Tooltip,
} from "recharts";

const defaultData = [
  { mes: "Ene", prestamos: 8 },
  { mes: "Feb", prestamos: 12 },
  { mes: "Mar", prestamos: 18 },
  { mes: "Abr", prestamos: 15 },
  { mes: "May", prestamos: 22 },
  { mes: "Jun", prestamos: 30 },
];

const chartMargin = { top: 8, right: 8, left: -20, bottom: 0 };
const xAxisTick = { fill: "#64748b", fontSize: 12, fontWeight: 600 };
const tooltipContentStyle = { border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)" };
const tooltipCursor = { stroke: "#cbd5e1", strokeWidth: 1 };
const tooltipLabelStyle = { color: "#334155", fontWeight: 700 };
const activeDot = { r: 5, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2 };

export default function LoanChart({
  data = defaultData,
  dataKey = "prestamos",
  gradientId = "loan-volume",
  label = "Préstamos",
  valueSuffix = "solicitudes",
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={chartMargin}>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis axisLine={false} dataKey="mes" tick={xAxisTick} tickLine={false} />
        <Tooltip
          contentStyle={tooltipContentStyle}
          cursor={tooltipCursor}
          formatter={(value) => [`${value} ${valueSuffix}`, label]}
          labelStyle={tooltipLabelStyle}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          fill={`url(#${gradientId})`}
          stroke="#2563eb"
          strokeWidth={3}
          activeDot={activeDot}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
