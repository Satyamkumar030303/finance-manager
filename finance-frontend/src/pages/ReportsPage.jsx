import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown, PiggyBank, Download } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from "recharts";
import api from "../api/axios";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1", "#14b8a6"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-800">₹{value?.toLocaleString("en-IN") || 0}</p>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["report-summary", month, year],
    queryFn: () =>
      api.get(`/transactions/summary?month=${month}&year=${year}`).then((r) => r.data.data),
    staleTime: 30000,
  });

  const { data: catData = [], isLoading: catLoading } = useQuery({
    queryKey: ["report-categories", month, year],
    queryFn: () =>
      api.get(`/transactions/category-summary?month=${month}&year=${year}`).then((r) => r.data.data),
    staleTime: 30000,
  });

  const { data: trends = [], isLoading: trendsLoading } = useQuery({
    queryKey: ["report-trends", year],
    queryFn: () =>
      api.get(`/transactions/trends?year=${year}`).then((r) => r.data.data),
    staleTime: 30000,
  });

  const netSavings = (summary?.totalIncome || 0) - (summary?.totalExpense || 0);
  const savingsRate = summary?.totalIncome
    ? Math.round((netSavings / summary.totalIncome) * 100)
    : 0;

  const handleExport = async () => {
    try {
      const res = await api.get(`/transactions/export?month=${month}&year=${year}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${year}-${String(month).padStart(2, "0")}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      // silently ignore export errors in demo
    }
  };

  const isLoading = summaryLoading || catLoading || trendsLoading;

  return (
    <>
      <Helmet><title>Reports — Finance Manager</title><meta name="robots" content="noindex" /></Helmet>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t("nav.reports")}</h1>
            <p className="text-sm text-gray-500">Detailed financial analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="border rounded-lg px-3 py-2 w-24 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={handleExport}
              className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm"
            >
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-gray-400">Loading report data...</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Total Income" value={summary?.totalIncome} icon={TrendingUp} color="bg-green-500" />
              <StatCard label="Total Expenses" value={summary?.totalExpense} icon={TrendingDown} color="bg-red-500" />
              <StatCard label="Net Savings" value={Math.abs(netSavings)} icon={PiggyBank} color={netSavings >= 0 ? "bg-blue-500" : "bg-orange-500"} />
            </div>

            {/* Savings Rate */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-700">Savings Rate</h2>
                <span className={`text-lg font-bold ${savingsRate >= 20 ? "text-green-600" : savingsRate >= 10 ? "text-yellow-600" : "text-red-600"}`}>
                  {savingsRate}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${savingsRate >= 20 ? "bg-green-500" : savingsRate >= 10 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {savingsRate >= 20 ? "Excellent! You're saving well." : savingsRate >= 10 ? "Good. Try to save more than 20%." : "Consider reducing expenses."}
              </p>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Pie */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-700 mb-4">Expenses by Category</h2>
                {catData.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">No expense data</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={catData} dataKey="total" nameKey="_id" cx="50%" cy="50%" outerRadius={85} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                        {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `₹${v?.toLocaleString("en-IN")}`} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Monthly Trends */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-700 mb-4">Monthly Trends ({year})</h2>
                {trends.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">No trend data</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tickFormatter={(m) => MONTHS[m - 1]} fontSize={11} />
                      <YAxis fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v) => `₹${v?.toLocaleString("en-IN")}`} />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={false} name="Income" />
                      <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={false} name="Expense" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Category Breakdown Table */}
            {catData.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-700 mb-4">Category Breakdown</h2>
                <div className="space-y-3">
                  {catData
                    .sort((a, b) => b.total - a.total)
                    .map((cat, i) => {
                      const pct = summary?.totalExpense ? Math.round((cat.total / summary.totalExpense) * 100) : 0;
                      return (
                        <div key={cat._id} className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-sm text-gray-700 w-28 truncate">{cat._id}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                          </div>
                          <span className="text-sm font-medium text-gray-800 w-24 text-right">₹{cat.total?.toLocaleString("en-IN")}</span>
                          <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
