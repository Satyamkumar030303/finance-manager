import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import {
  TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight,
  Sparkles, ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useCurrency } from "../../context/CurrencyContext";

import ExpensePieChart from "../../components/charts/ExpensePieChart";
import MonthlyTrendChart from "../../components/charts/MonthlyTrendChart";
import IncomeExpenseChart from "../../components/charts/IncomeExpenseChart";
import SmartInsights from "../../components/SmartInsights";

const PERIOD_KEYS = ["month", "lastMonth", "year", "decade", "all"];

function KPICard({ label, value, icon: Icon, gradient, trend, trendLabel, loading }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${gradient}`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white" />
        <div className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full bg-white" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm font-medium text-white/80">{label}</p>
          <div className="p-2 bg-white/20 rounded-xl">
            <Icon size={16} />
          </div>
        </div>

        {loading ? (
          <div className="h-8 w-28 bg-white/20 rounded-lg animate-pulse mb-2" />
        ) : (
          <p className="text-2xl font-bold tracking-tight mb-1">{value}</p>
        )}

        {trend !== undefined && !loading && (
          <div className="flex items-center gap-1 text-xs text-white/80">
            {trend >= 0
              ? <ArrowUpRight size={12} />
              : <ArrowDownRight size={12} />
            }
            <span>{Math.abs(trend)}% {trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionCard({ title, children, action }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton h-8 w-32" />
      <div className="skeleton h-3 w-20" />
    </div>
  );
}

const Dashboard = () => {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const [period, setPeriod] = useState("month");

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

  const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : 0;

  return (
    <>
      <Helmet>
        <title>Dashboard — Finance Manager</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="space-y-6 animate-fadeIn">
        {/* Page header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">{t("dashboard.title")}</h1>
            <p className="page-subtitle">{t(`periods.${period}`)} {t("dashboard.overview")}</p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input w-auto text-sm"
          >
            {PERIOD_KEYS.map((val) => (
              <option key={val} value={val}>{t(`periods.${val}`)}</option>
            ))}
          </select>
        </div>

        {/* KPI Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPICard
              label={t("dashboard.total_income")}
              value={format(income)}
              icon={TrendingUp}
              gradient="gradient-emerald"
            />
            <KPICard
              label={t("dashboard.total_expense")}
              value={format(expense)}
              icon={TrendingDown}
              gradient="gradient-rose"
            />
            <KPICard
              label={t("dashboard.net_savings")}
              value={format(Math.abs(savings))}
              icon={Wallet}
              gradient={savings >= 0 ? "gradient-blue" : "gradient-amber"}
              trendLabel={t("insights.savings_rate").toLowerCase()}
              trend={parseFloat(savingsRate)}
            />
          </div>
        )}

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SectionCard title={t("dashboard.expense_by_category")}>
            {isLoading
              ? <div className="skeleton h-52 w-full" />
              : <ExpensePieChart data={categoryData} />
            }
          </SectionCard>

          <SectionCard title={t("dashboard.spending_trend")}>
            {isLoading
              ? <div className="skeleton h-52 w-full" />
              : <MonthlyTrendChart data={trendData} period={period} />
            }
          </SectionCard>
        </div>

        {/* Income vs Expense */}
        <SectionCard title={t("dashboard.income_vs_expense")}>
          {isLoading
            ? <div className="skeleton h-40 w-full" />
            : <IncomeExpenseChart income={income} expense={expense} savings={savings} />
          }
        </SectionCard>

        {/* Smart Insights */}
        {!isLoading && (
          <SmartInsights
            income={income}
            expense={expense}
            savings={savings}
            categories={categoryData}
          />
        )}

        {/* Recent Transactions */}
        <SectionCard
          title={t("dashboard.recent_transactions")}
          action={
            <Link
              to="/transactions"
              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400
                         hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              {t("common.view_all")} <ChevronRight size={13} />
            </Link>
          }
        >
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="skeleton h-10 w-full" />)}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="py-8 text-center">
              <Sparkles size={32} className="mx-auto mb-3 text-gray-300 dark:text-gray-700" />
              <p className="text-sm text-gray-400 dark:text-gray-500">{t("dashboard.no_transactions_yet")}</p>
              <Link to="/transactions" className="btn-primary btn-sm mt-3 inline-flex">
                {t("dashboard.add_first_transaction")}
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="table-base">
                <thead>
                  <tr>
                    <th className="table-th">{t("transactions.description")}</th>
                    <th className="table-th">{t("transactions.category")}</th>
                    <th className="table-th">{t("transactions.amount")}</th>
                    <th className="table-th hidden sm:table-cell">{t("transactions.date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx) => (
                    <tr key={tx._id} className="table-row">
                      <td className="table-td font-medium text-gray-900 dark:text-gray-100 max-w-[140px] truncate">
                        {tx.description || tx.category}
                      </td>
                      <td className="table-td">
                        <span className="badge-gray">{t(`categories.${String(tx.category || "").toLowerCase()}`, tx.category)}</span>
                      </td>
                      <td className="table-td">
                        <span className={`font-semibold ${tx.type === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-500 dark:text-red-400"}`}
                        >
                          {tx.type === "income" ? "+" : "−"}{format(tx.amount)}
                        </span>
                      </td>
                      <td className="table-td hidden sm:table-cell text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(tx.transactionDate || tx.createdAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
};

export default Dashboard;
