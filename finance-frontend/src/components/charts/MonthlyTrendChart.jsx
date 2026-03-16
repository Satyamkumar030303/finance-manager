import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

const MonthlyTrendChart = ({ data, period }) => {

  if (!data) return null;

  let chartData = [];

  if (period === "month" || period === "lastMonth") {

    chartData = Array.from({ length: 31 }, (_, i) => {
      const day = i + 1;
      const found = data.find(d => d._id === day);

      return {
        label: day,
        amount: found ? found.total : 0
      };
    });

  }

  else if (period === "year") {

    chartData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const found = data.find(d => d._id === month);

      return {
        label: month,
        amount: found ? found.total : 0
      };
    });

  }

  else {

    chartData = data.map(d => ({
      label: d._id,
      amount: d.total
    }));

  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-400">
        No expense trend available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="label" />

        <YAxis domain={[0, "auto"]} />

        <Tooltip formatter={(value) => `₹${value}`} />

        <Line
          type="monotone"
          dataKey="amount"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          animationDuration={800}
        />

      </LineChart>
    </ResponsiveContainer>
  );
};

export default MonthlyTrendChart;