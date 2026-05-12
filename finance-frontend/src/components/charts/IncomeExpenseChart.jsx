import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { useTheme } from "../../context/ThemeContext";
import { useCurrency } from "../../context/CurrencyContext";

const COLORS = { Income: "#10b981", Expense: "#ef4444", Savings: "#3b82f6" };

function CustomTooltip({ active, payload, label, fmt }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg px-3 py-2">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold" style={{ color: COLORS[label] }}>
        {fmt(payload[0].value)}
      </p>
    </div>
  );
}

export default function IncomeExpenseChart({ income, expense, savings }) {
  const { isDark } = useTheme();
  const { fmt, compact } = useCurrency();
  const gridColor = isDark ? "#1f2937" : "#f3f4f6";
  const axisColor = isDark ? "#6b7280" : "#9ca3af";

  const data = [
    { name: "Income",  value: Math.max(income, 0) },
    { name: "Expense", value: Math.max(expense, 0) },
    { name: "Savings", value: Math.abs(savings) },
  ];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: axisColor }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: axisColor }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => compact(v)}
          width={48}
        />
        <Tooltip content={<CustomTooltip fmt={fmt} />} cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={72}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
