import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import { PlusCircle, Trash2, Target, CheckCircle, Plus, X } from "lucide-react";
import api from "../api/axios";
import { useCurrency } from "../context/CurrencyContext";

const EMOJIS = ["🎯", "🏠", "✈️", "🚗", "📱", "💍", "🎓", "💰"];

function GoalForm({ onClose, existing }) {
  const { t } = useTranslation();
  const { symbol } = useCurrency();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: existing?.name || "",
    targetAmount: existing?.targetAmount || "",
    savedAmount: existing?.savedAmount || 0,
    deadline: existing?.deadline ? existing.deadline.substring(0, 10) : "",
    category: existing?.category || "General",
    icon: existing?.icon || "🎯",
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      existing ? api.put(`/goals/${existing._id}`, data) : api.post("/goals", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success(existing ? "Goal updated" : "Goal created");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error"),
  });

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="card-raised w-full max-w-md animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {existing ? t("goals.edit") : t("goals.new")}
          </h2>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={16} />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate({ ...form, targetAmount: parseFloat(form.targetAmount) });
          }}
          className="p-5 space-y-4"
        >
          {/* Emoji picker */}
          <div className="grid grid-cols-8 gap-1.5">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji} type="button"
                onClick={() => setForm({ ...form, icon: emoji })}
                className={`text-xl p-1.5 rounded-lg border-2 transition-all ${
                  form.icon === emoji
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div>
            <label className="label">{t("goals.goal_name")}</label>
            <input placeholder="e.g., Emergency Fund" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">{t("goals.target_amount")} ({symbol})</label>
            <input type="number" min="1" placeholder="0" value={form.targetAmount}
              onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">{t("goals.deadline_optional")}</label>
            <input type="date" value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">{t("common.cancel")}</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">
              {mutation.isPending ? t("common.saving") : t("goals.save")}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function ContributeModal({ goal, onClose }) {
  const { t } = useTranslation();
  const { symbol } = useCurrency();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");

  const mutation = useMutation({
    mutationFn: () => api.post(`/goals/${goal._id}/contribute`, { amount: parseFloat(amount) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Contribution added!");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error"),
  });

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="card-raised w-full max-w-sm animate-scaleIn p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t("goals.contribute_to")} {goal.icon} {goal.name}
        </h3>
        <div className="mb-4">
          <label className="label">{t("transactions.amount")} ({symbol})</label>
          <input type="number" min="1" placeholder="0" value={amount}
            onChange={(e) => setAmount(e.target.value)} className="input" autoFocus />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">{t("common.cancel")}</button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!amount || mutation.isPending}
            className="btn-success flex-1"
          >
            {mutation.isPending ? "..." : t("common.add")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function GoalsPage() {
  const { t } = useTranslation();
  const { fmt } = useCurrency();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [contributeGoal, setContributeGoal] = useState(null);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: () => api.get("/goals").then((r) => r.data.data),
    staleTime: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/goals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal deleted");
    },
  });

  const active = goals.filter((g) => !g.isCompleted);
  const completed = goals.filter((g) => g.isCompleted);

  return (
    <>
      <Helmet>
        <title>Savings Goals — Finance Manager</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">{t("goals.title")}</h1>
            <p className="page-subtitle">{active.length} {t("common.active_goals")}</p>
          </div>
          <button
            onClick={() => { setEditGoal(null); setShowForm(true); }}
            className="btn-primary btn-sm"
          >
            <PlusCircle size={15} /> {t("goals.add")}
          </button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}
          </div>
        ) : goals.length === 0 ? (
          <div className="card py-16 text-center">
            <Target className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={40} />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t("goals.no_goals")}</p>
            <button onClick={() => setShowForm(true)} className="btn-primary btn-sm">
              {t("goals.create_first")}
            </button>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
                  {t("goals.active")}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {active.map((g) => {
                    const pct = Math.min(Math.round((g.savedAmount / g.targetAmount) * 100), 100);
                    const remaining = g.deadline
                      ? Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                      : null;
                    return (
                      <div key={g._id} className="card p-5 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{g.icon}</span>
                            <div>
                              <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{g.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {fmt(g.savedAmount)} / {fmt(g.targetAmount)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => setContributeGoal(g)}
                              className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                              title={t("goals.contribute")}
                            >
                              <Plus size={13} />
                            </button>
                            <button
                              onClick={() => { setEditGoal(g); setShowForm(true); }}
                              className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                              title={t("common.edit")}
                            >
                              <Target size={13} />
                            </button>
                            <button
                              onClick={() => { if (window.confirm(t("goals.delete_confirm"))) deleteMutation.mutate(g._id); }}
                              className="p-1.5 rounded-lg text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                              title={t("common.delete")}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium text-blue-600 dark:text-blue-400">{pct}% {t("goals.pct_complete")}</span>
                          {remaining !== null && (
                            <span className={remaining < 0 ? "text-red-500" : ""}>
                              {remaining > 0 ? `${remaining} ${t("goals.days_left")}` : t("goals.overdue")}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-500" /> {t("goals.completed_section")}
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {completed.map((g) => (
                    <div key={g._id}
                      className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50
                                 bg-emerald-50 dark:bg-emerald-900/20">
                      <span className="text-2xl">{g.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-800 dark:text-gray-100 truncate">{g.name}</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          {fmt(g.targetAmount)} — {t("goals.achieved")}
                        </p>
                      </div>
                      <CheckCircle className="text-emerald-500 flex-shrink-0" size={18} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <GoalForm onClose={() => { setShowForm(false); setEditGoal(null); }} existing={editGoal} />
      )}
      {contributeGoal && (
        <ContributeModal goal={contributeGoal} onClose={() => setContributeGoal(null)} />
      )}
    </>
  );
}
