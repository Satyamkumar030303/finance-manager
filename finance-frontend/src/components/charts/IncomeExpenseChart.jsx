import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const IncomeExpenseChart = ({ income, expense, savings }) => {

  const data = [
    { name: "Income", value: income },
    { name: "Expense", value: expense },
    { name: "Savings", value: savings }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="name" />

        <YAxis />

        <Tooltip formatter={(v) => `₹${v}`} />

        <Bar dataKey="value" fill="#3b82f6" radius={[6,6,0,0]} />

      </BarChart>
    </ResponsiveContainer>
  );
};

export default IncomeExpenseChart;