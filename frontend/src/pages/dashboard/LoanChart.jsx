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
const xAxisTick = { fill: "#536273", fontSize: 12, fontWeight: 600 };
const tooltipContentStyle = { border: "1px solid #dce5ed", borderRadius: "8px", boxShadow: "0 8px 20px rgba(27, 42, 65, 0.08)" };
const tooltipCursor = { stroke: "#c9d5df", strokeWidth: 1 };
const tooltipLabelStyle = { color: "#1B2A41", fontWeight: 700 };
const activeDot = { r: 5, fill: "#163A63", stroke: "#ffffff", strokeWidth: 2 };

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
            <stop offset="0%" stopColor="#245B8F" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#245B8F" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#dce5ed" strokeDasharray="3 3" />
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
          stroke="#163A63"
          strokeWidth={3}
          activeDot={activeDot}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
