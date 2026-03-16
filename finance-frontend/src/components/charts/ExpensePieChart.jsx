import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#ef4444", "#22c55e", "#f59e0b", "#3b82f6", "#a855f7"];

const ExpensePieChart = ({ data }) => {

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-400">
        No expense data for this period
      </div>
    );
  }

  const formattedData = data.map((item) => ({
    name: item.category,
    value: item.amount
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>

        <Pie
          data={formattedData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {formattedData.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip />
        <Legend />

      </PieChart>
    </ResponsiveContainer>
  );
};

export default ExpensePieChart;