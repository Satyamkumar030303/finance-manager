import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, Legend } from "recharts";
import { useTheme } from "../../context/ThemeContext";
import { useCurrency } from "../../context/CurrencyContext";

const PALETTE = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#f97316", "#ec4899", "#14b8a6", "#6366f1",
];

function CustomTooltip({ active, payload, fmt }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg px-3 py-2">
      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{d.name}</p>
      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
        {fmt(d.value)}
      </p>
    </div>
  );
}

export default function ExpensePieChart({ data }) {
  const { isDark } = useTheme();
  const { fmt } = useCurrency();

  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-52 text-sm text-gray-400 dark:text-gray-500">
        No expense data for this period
      </div>
    );
  }

  const formattedData = data.map((item) => ({
    name: item.category,
    value: item.amount,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={formattedData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={85}
          innerRadius={40}
          paddingAngle={2}
        >
          {formattedData.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip fmt={fmt} />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: isDark ? "#d1d5db" : "#374151", fontSize: 12 }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
