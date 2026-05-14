import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { PlusCircle, Trash2, Edit2, AlertTriangle, CheckCircle, X } from "lucide-react";
import { createPortal } from "react-dom";
import api from "../api/axios";
import { useCurrency } from "../context/CurrencyContext";
import { CATEGORIES } from "../constants/transaction";

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

function BudgetForm({ onClose, existing }) {
  const { t } = useTranslation();
  const { symbol } = useCurrency();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    category: existing?.category || "Food",
    limitAmount: existing?.budget || "",
    alertThreshold: existing?.alertThreshold || 80,
    month: existing?.month || currentMonth,
    year: existing?.year || currentYear,
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      existing
        ? api.put(`/budgets/${existing._id}`, data)
        : api.post("/budgets", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-comparison"] });
      toast.success(existing ? t("budgets.updated") : t("budgets.created"));
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || t("common.error")),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ ...form, limitAmount: parseFloat(form.limitAmount) });
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="card-raised w-full max-w-md animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {existing ? t("budgets.edit") : t("budgets.new")}
          </h2>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">{t("transactions.category")}</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{t(`categories.${c.toLowerCase()}`, c)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t("budgets.limit")} ({symbol})</label>
            <input type="number" min="1" value={form.limitAmount}
              onChange={(e) => setForm({ ...form, limitAmount: e.target.value })}
              className="input" required />
          </div>
          <div>
            <label className="label">{t("budgets.alert_threshold")} {form.alertThreshold}%</label>
            <input type="range" min="10" max="100" value={form.alertThreshold}
              onChange={(e) => setForm({ ...form, alertThreshold: parseInt(e.target.value) })}
              className="w-full accent-blue-600" />
            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
              <span>10%</span><span>100%</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">{t("common.cancel")}</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">
              {mutation.isPending ? t("common.saving") : t("budgets.save")}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function BudgetsPage() {
  const { t } = useTranslation();
  const { fmt } = useCurrency();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);

  const { data: comparison, isLoading } = useQuery({
    queryKey: ["budget-comparison", month, year],
    queryFn: () =>
      api.get(`/budgets/comparison?month=${month}&year=${year}`).then((r) => r.data.data),
    staleTime: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/budgets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-comparison"] });
      toast.success(t("budgets.deleted"));
    },
  });

  const barColor = (status, pct) => {
    if (status === "Exceeded") return "bg-red-500";
    if (pct >= 80) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const statusBadge = (b) => {
    if (b.status === "Exceeded") return (
      <span className="badge-red"><AlertTriangle size={9} /> {t("budgets.exceeded")}</span>
    );
    if (b.status === "Warning") return (
      <span className="badge-yellow"><AlertTriangle size={9} /> {b.percentage}%</span>
    );
    return (
      <span className="badge-green"><CheckCircle size={9} /> {b.percentage}%</span>
    );
  };

  return (
    <>
      <Helmet>
        <title>Budgets — Finance Manager</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">{t("budgets.title")}</h1>
            <p className="page-subtitle">{t("budgets.track_limits")}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="input w-auto text-sm"
            >
              {["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"].map((k, i) => (
                <option key={i + 1} value={i + 1}>{t(`months.${k}`)}</option>
              ))}
            </select>
            <input
              type="number" value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="input w-24 text-sm"
            />
            <button
              onClick={() => { setEditBudget(null); setShowForm(true); }}
              className="btn-primary btn-sm"
            >
              <PlusCircle size={15} /> {t("budgets.add")}
            </button>
          </div>
        </div>

        {/* Budget cards */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-36 rounded-2xl" />)}
          </div>
        ) : !comparison?.length ? (
          <div className="card py-16 text-center">
            <PlusCircle className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={40} />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("budgets.no_budgets")}</p>
            <button onClick={() => setShowForm(true)} className="btn-primary btn-sm mt-3">
              {t("budgets.create_first")}
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {comparison.map((b) => (
              <div
                key={b._id}
                className={`card p-5 space-y-3 border-l-4 ${
                  b.status === "Exceeded"
                    ? "border-l-red-500"
                    : b.percentage >= b.alertThreshold
                    ? "border-l-amber-500"
                    : "border-l-emerald-500"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                      {t(`categories.${b.category?.toLowerCase()}`, b.category)}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {fmt(b.actual)} / {fmt(b.budget)} {t("budgets.spent").toLowerCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {statusBadge(b)}
                    <button
                      onClick={() => { setEditBudget(b); setShowForm(true); }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(t("budgets.delete_confirm"))) deleteMutation.mutate(b._id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${barColor(b.status, b.percentage)}`}
                    style={{ width: `${Math.min(b.percentage, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{t("budgets.remaining")}: {fmt(Math.max(0, b.budget - b.actual))}</span>
                  <span>{t("budgets.alert_threshold")} {b.alertThreshold}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <BudgetForm
          onClose={() => { setShowForm(false); setEditBudget(null); }}
          existing={editBudget}
        />
      )}
    </>
  );
}
