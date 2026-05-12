import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import api from "../../api/axios";

import ExpensePieChart from "../../components/charts/ExpensePieChart";
import MonthlyTrendChart from "../../components/charts/MonthlyTrendChart";
import IncomeExpenseChart from "../../components/charts/IncomeExpenseChart";
import SmartInsights from "../../components/SmartInsights";

function SummaryCard({ label, value, icon: Icon, colorClass, borderClass }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 ${borderClass} p-5`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <h2 className={`text-2xl font-bold mt-1 ${colorClass}`}>
            ₹{value?.toLocaleString("en-IN") || 0}
          </h2>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass.replace("text-", "bg-").replace("600", "100")}`}>
          <Icon size={20} className={colorClass} />
        </div>
      </div>
    </div>
  );
}

const Dashboard = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("month");

  // Single consolidated API call — replaces 3 separate useEffect calls
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", period],
    queryFn: () =>
      api.get(`/transactions/dashboard?period=${period}`).then((r) => r.data.data),
    staleTime: 30000,
    retry: 1,
  });

  const income = data?.summary?.totalIncome || 0;
  const expense = data?.summary?.totalExpense || 0;
  const savings = data?.summary?.netSavings || 0;
  const categoryData = data?.categoryBreakdown || [];
  const trendData = data?.trends || [];
  const recentTransactions = data?.recentTransactions || [];

  return (
    <>
      <Helmet><title>Dashboard — Finance Manager</title><meta name="robots" content="noindex" /></Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t("dashboard.title")}</h1>
            <p className="text-sm text-gray-500">Your financial overview</p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="month">{t("common.this_month")}</option>
            <option value="lastMonth">{t("common.last_month")}</option>
            <option value="year">{t("common.this_year")}</option>
            <option value="decade">Last Decade</option>
            <option value="all">{t("common.all_time")}</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-gray-400">Loading dashboard...</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SummaryCard
                label={t("dashboard.total_income")}
                value={income}
                icon={TrendingUp}
                colorClass="text-green-600"
                borderClass="border-green-500"
              />
              <SummaryCard
                label={t("dashboard.total_expense")}
                value={expense}
                icon={TrendingDown}
                colorClass="text-red-600"
                borderClass="border-red-500"
              />
              <SummaryCard
                label={t("dashboard.net_savings")}
                value={Math.abs(savings)}
                icon={PiggyBank}
                colorClass={savings >= 0 ? "text-blue-600" : "text-orange-600"}
                borderClass={savings >= 0 ? "border-blue-500" : "border-orange-500"}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
                <h3 className="text-base font-semibold text-gray-700 mb-4">{t("dashboard.expense_by_category")}</h3>
                <ExpensePieChart data={categoryData} />
              </div>
              <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
                <h3 className="text-base font-semibold text-gray-700 mb-4">{t("dashboard.spending_trend")}</h3>
                <MonthlyTrendChart data={trendData} period={period} />
              </div>
            </div>

            {/* Income vs Expense */}
            <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
              <h3 className="text-base font-semibold text-gray-700 mb-4">{t("dashboard.income_vs_expense")}</h3>
              <IncomeExpenseChart income={income} expense={expense} savings={savings} />
            </div>

            {/* Smart Insights */}
            <SmartInsights income={income} expense={expense} savings={savings} categories={categoryData} />

            {/* Recent Transactions */}
            <div className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
              <h2 className="text-base font-semibold text-gray-700 mb-4">{t("dashboard.recent_transactions")}</h2>
              {recentTransactions.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No transactions yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b text-gray-500 text-xs uppercase tracking-wide">
                        <th className="pb-2">Category</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((tx) => (
                        <tr key={tx._id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-2.5">{tx.category}</td>
                          <td className="py-2.5 font-medium">₹{tx.amount?.toLocaleString("en-IN")}</td>
                          <td className={`py-2.5 font-medium ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}>
                            {tx.type}
                          </td>
                          <td className="py-2.5 text-gray-500">
                            {new Date(tx.transactionDate || tx.createdAt).toLocaleDateString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
