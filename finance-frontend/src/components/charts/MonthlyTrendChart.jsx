import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";
import { useCurrency } from "../../context/CurrencyContext";

function CustomTooltip({ active, payload, label, fmt }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg px-3 py-2">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Period {label}</p>
      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
        {fmt(payload[0].value)}
      </p>
    </div>
  );
}

export default function MonthlyTrendChart({ data, period }) {
  const { isDark } = useTheme();
  const { fmt, compact } = useCurrency();

  const gridColor = isDark ? "#1f2937" : "#f3f4f6";
  const axisColor = isDark ? "#6b7280" : "#9ca3af";

  if (!data) return null;

  let chartData = [];
  if (period === "month" || period === "lastMonth") {
    chartData = Array.from({ length: 31 }, (_, i) => {
      const day = i + 1;
      const found = data.find((d) => d._id === day);
      return { label: day, amount: found ? found.total : 0 };
    });
  } else if (period === "year") {
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    chartData = Array.from({ length: 12 }, (_, i) => {
      const found = data.find((d) => d._id === i + 1);
      return { label: MONTHS[i], amount: found ? found.total : 0 };
    });
  } else {
    chartData = data.map((d) => ({ label: d._id, amount: d.total }));
  }

  if (chartData.every((d) => d.amount === 0)) {
    return (
      <div className="flex items-center justify-center h-52 text-sm text-gray-400 dark:text-gray-500">
        No trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: axisColor }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: axisColor }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => compact(v)}
          width={48}
        />
        <Tooltip content={<CustomTooltip fmt={fmt} />} />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#3b82f6"
          strokeWidth={2.5}
          fill="url(#trendGrad)"
          dot={false}
          activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
          animationDuration={600}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
