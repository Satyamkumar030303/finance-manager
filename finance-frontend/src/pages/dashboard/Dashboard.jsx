import { useState, useEffect } from "react";
import { useDashboard } from "../../hooks/dashboard/useDashboard";
import api from "../../api/axios";

import ExpensePieChart from "../../components/charts/ExpensePieChart";
import MonthlyTrendChart from "../../components/charts/MonthlyTrendChart";
import IncomeExpenseChart from "../../components/charts/IncomeExpenseChart";
import SmartInsights from "../../components/SmartInsights";

const Dashboard = () => {

  const [period, setPeriod] = useState("month");
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  const { data, isLoading } = useDashboard(period);

  useEffect(() => {

    const fetchRecent = async () => {
      const res = await api.get("/transactions/recent");
      setRecentTransactions(res.data);
    };

    fetchRecent();

  }, []);

  useEffect(() => {

    const fetchCharts = async () => {

      const category = await api.get(
        `/transactions/category-summary?period=${period}`
      );

      const trends = await api.get(
        `/transactions/trends?period=${period}`
      );

      setCategoryData(category.data);
      setTrendData(trends.data);
    };

    fetchCharts();

  }, [period]);

  if (isLoading) return <p>Loading dashboard...</p>;

  const income = data?.totalIncome || 0;
  const expense = data?.totalExpense || 0;
  const savings = data?.netSavings || 0;

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <select
          value={period}
          onChange={(e)=>setPeriod(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="month">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="year">This Year</option>
          <option value="decade">Last Decade</option>
          <option value="all">All Years</option>
        </select>

      </div>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-green-50 border-l-4 border-green-500 rounded-xl shadow p-6">
          <p>Income</p>
          <h2 className="text-3xl font-bold text-green-600">
            ₹{income}
          </h2>
        </div>

        <div className="bg-red-50 border-l-4 border-red-500 rounded-xl shadow p-6">
          <p>Expense</p>
          <h2 className="text-3xl font-bold text-red-600">
            ₹{expense}
          </h2>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl shadow p-6">
          <p>Savings</p>
          <h2 className="text-3xl font-bold text-blue-600">
            ₹{savings}
          </h2>
        </div>

      </div>

      {/* PIE + TREND */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white shadow-lg rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4">
            Expense by Category
          </h3>

          <ExpensePieChart data={categoryData} />
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4">
            Expense Trend
          </h3>

          <MonthlyTrendChart
            data={trendData}
            period={period}
          />
        </div>

      </div>

      {/* INCOME VS EXPENSE */}

      <div className="bg-white shadow-lg rounded-xl p-6 border">

        <h3 className="text-lg font-semibold mb-4">
          Income vs Expense
        </h3>

        <IncomeExpenseChart
          income={income}
          expense={expense}
          savings={savings}
        />

      </div>

      {/* SMART INSIGHTS */}

      <SmartInsights
        income={income}
        expense={expense}
        savings={savings}
        categories={categoryData}
      />

      {/* RECENT TRANSACTIONS */}

      <div className="bg-white shadow-lg rounded-xl p-6 border">

        <h2 className="text-xl font-semibold mb-4">
          Recent Transactions
        </h2>

        <table className="w-full text-left">

          <thead className="border-b">
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>

            {recentTransactions.map(tx => (

              <tr key={tx._id} className="border-b">

                <td>{tx.category}</td>

                <td>₹{tx.amount}</td>

                <td
                  className={
                    tx.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {tx.type}
                </td>

                <td>
                  {new Date(tx.createdAt).toLocaleDateString()}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default Dashboard;