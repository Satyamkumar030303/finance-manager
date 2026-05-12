import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { PlusCircle, Trash2, Edit2, AlertTriangle, CheckCircle, X } from "lucide-react";
import api from "../api/axios";

const CATEGORIES = [
  "Food", "Transport", "Shopping", "Entertainment", "Utilities",
  "Health", "Education", "Finance", "Telecom", "Travel", "Miscellaneous"
];

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

function BudgetForm({ onClose, existing }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    category: existing?.category || "Food",
    limitAmount: existing?.budget || "",
    alertThreshold: existing?.alertThreshold || 80,
    month: currentMonth,
    year: currentYear,
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      existing
        ? api.put(`/budgets/${existing.id}`, data)
        : api.post("/budgets", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-comparison"] });
      toast.success(existing ? "Budget updated" : "Budget created");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ ...form, limitAmount: parseFloat(form.limitAmount) });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="font-semibold text-lg">{existing ? "Edit Budget" : "New Budget"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Limit Amount (₹)</label>
            <input
              type="number"
              min="1"
              value={form.limitAmount}
              onChange={(e) => setForm({ ...form, limitAmount: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alert Threshold ({form.alertThreshold}%)
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={form.alertThreshold}
              onChange={(e) => setForm({ ...form, alertThreshold: parseInt(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {mutation.isPending ? "Saving..." : "Save Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BudgetsPage() {
  const { t } = useTranslation();
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
      toast.success("Budget deleted");
    },
  });

  const statusColor = (status, pct) => {
    if (status === "Exceeded") return "bg-red-500";
    if (pct >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <>
      <Helmet>
        <title>Budgets — Finance Manager</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t("budgets.title")}</h1>
            <p className="text-sm text-gray-500">Track your spending limits by category</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="border rounded-lg px-3 py-2 w-24 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={() => { setEditBudget(null); setShowForm(true); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
            >
              <PlusCircle size={16} /> {t("budgets.add")}
            </button>
          </div>
        </div>

        {/* Budget cards */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading budgets...</div>
        ) : !comparison?.length ? (
          <div className="text-center py-12">
            <PlusCircle className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500">{t("budgets.no_budgets")}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {comparison.map((b) => (
              <div
                key={b.category}
                className={`bg-white rounded-xl shadow-sm border-l-4 p-5 space-y-3 ${
                  b.status === "Exceeded"
                    ? "border-red-500"
                    : b.percentage >= b.alertThreshold
                    ? "border-yellow-500"
                    : "border-green-500"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{b.category}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ₹{b.actual?.toFixed(0)} / ₹{b.budget?.toFixed(0)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        b.status === "Exceeded"
                          ? "bg-red-100 text-red-700"
                          : b.status === "Warning"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {b.status === "Exceeded" ? (
                        <span className="flex items-center gap-1"><AlertTriangle size={10} /> Exceeded</span>
                      ) : b.status === "Warning" ? (
                        <span className="flex items-center gap-1"><AlertTriangle size={10} /> {b.percentage}%</span>
                      ) : (
                        <span className="flex items-center gap-1"><CheckCircle size={10} /> {b.percentage}%</span>
                      )}
                    </span>
                    <button
                      onClick={() => { setEditBudget({ ...b, id: b._id }); setShowForm(true); }}
                      className="text-gray-400 hover:text-blue-600 transition"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this budget?")) deleteMutation.mutate(b._id);
                      }}
                      className="text-gray-400 hover:text-red-600 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${statusColor(b.status, b.percentage)}`}
                    style={{ width: `${Math.min(b.percentage, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>{t("budgets.remaining")}: ₹{Math.max(0, b.budget - b.actual).toFixed(0)}</span>
                  <span>Alert at {b.alertThreshold}%</span>
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
