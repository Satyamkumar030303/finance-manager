import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown, PiggyBank, Download, PieChart as PieIcon, LineChart as LineIcon } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import { useTheme } from "../context/ThemeContext";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, LineChart, Line
} from "recharts";
import api from "../api/axios";
import EmptyState from "../components/ui/EmptyState";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1", "#14b8a6"];
const MONTH_KEYS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function StatCard({ label, value, icon: Icon, color }) {
  const { fmt } = useCurrency();
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{fmt(value || 0)}</p>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { t } = useTranslation();
  const { fmt, compact } = useCurrency();
  const { isDark } = useTheme();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);

  const gridStroke = isDark ? "#1f2937" : "#f0f0f0";
  const axisColor = isDark ? "#9ca3af" : "#6b7280";
  const tooltipStyle = {
    backgroundColor: isDark ? "#1f2937" : "#ffffff",
    border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
    borderRadius: "0.75rem",
    color: isDark ? "#f9fafb" : "#111827",
  };

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
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">{t("nav.reports")}</h1>
            <p className="page-subtitle">{t("reports.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="input w-auto text-sm"
            >
              {MONTH_KEYS.map((k, i) => <option key={i + 1} value={i + 1}>{t(`months.${k}`)}</option>)}
            </select>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="input w-24 text-sm"
            />
            <button onClick={handleExport} className="btn-secondary btn-sm">
              <Download size={15} /> {t("common.export_csv")}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">{t("reports.loading")}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label={t("reports.total_income")} value={summary?.totalIncome} icon={TrendingUp} color="bg-emerald-500" />
              <StatCard label={t("reports.total_expenses")} value={summary?.totalExpense} icon={TrendingDown} color="bg-red-500" />
              <StatCard label={t("reports.net_savings")} value={Math.abs(netSavings)} icon={PiggyBank} color={netSavings >= 0 ? "bg-blue-500" : "bg-orange-500"} />
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-700 dark:text-gray-300">{t("reports.savings_rate")}</h2>
                <span className={`text-lg font-bold ${savingsRate >= 20 ? "text-emerald-600 dark:text-emerald-400" : savingsRate >= 10 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                  {savingsRate}%
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${savingsRate >= 20 ? "bg-emerald-500" : savingsRate >= 10 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {savingsRate >= 20 ? t("reports.savings_rate_excellent") : savingsRate >= 10 ? t("reports.savings_rate_good") : t("reports.savings_rate_low")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-5">
                <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">{t("reports.expenses_by_category")}</h2>
                {catData.length === 0 ? (
                  <EmptyState compact icon={PieIcon} title={t("reports.no_category_data")} description={t("reports.no_category_data_help")} />
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={catData}
                        dataKey="total"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        label={({ name, percent }) => `${t(`categories.${String(name || "").toLowerCase()}`, name)} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        fontSize={11}
                      >
                        {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => fmt(v)} contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="card p-5">
                <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">{t("reports.monthly_trends")} ({year})</h2>
                {trends.length === 0 ? (
                  <EmptyState compact icon={LineIcon} title={t("reports.no_trend_data")} description={t("reports.no_trend_data_help")} />
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                      <XAxis dataKey="month" tickFormatter={(m) => t(`months.${MONTH_KEYS[m - 1]}`)} fontSize={11} tick={{ fill: axisColor }} stroke={axisColor} />
                      <YAxis fontSize={11} tickFormatter={(v) => compact(v)} tick={{ fill: axisColor }} stroke={axisColor} />
                      <Tooltip formatter={(v) => fmt(v)} contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ color: axisColor }} />
                      <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={false} name={t("reports.income_series")} />
                      <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={false} name={t("reports.expense_series")} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {catData.length > 0 && (
              <div className="card p-5">
                <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">{t("reports.category_breakdown")}</h2>
                <div className="space-y-3">
                  {catData
                    .sort((a, b) => b.total - a.total)
                    .map((cat, i) => {
                      const pct = summary?.totalExpense ? Math.round((cat.total / summary.totalExpense) * 100) : 0;
                      return (
                        <div key={cat._id} className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-sm text-gray-700 dark:text-gray-300 w-28 truncate">{t(`categories.${String(cat._id || "").toLowerCase()}`, cat._id)}</span>
                          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                            <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-24 text-right">{fmt(cat.total)}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">{pct}%</span>
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
