import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { PlusCircle, Trash2, Edit2, RefreshCcw, X, ToggleLeft, ToggleRight } from "lucide-react";
import api from "../api/axios";
import { useCurrency } from "../context/CurrencyContext";
import EmptyState from "../components/ui/EmptyState";
import { CATEGORIES, FREQUENCIES } from "../constants/transaction";

const FREQ_BADGE_CLASS = {
  daily: "badge-purple",
  weekly: "badge-blue",
  monthly: "badge-green",
  yearly: "badge-yellow",
};

function RecurringForm({ onClose, existing }) {
  const { t } = useTranslation();
  const { symbol } = useCurrency();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: existing?.name || "",
    type: existing?.type || "expense",
    category: existing?.category || "Food",
    amount: existing?.amount || "",
    frequency: existing?.frequency || "monthly",
    nextRunDate: existing?.nextRunDate ? existing.nextRunDate.substring(0, 10) : new Date().toISOString().substring(0, 10),
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      existing ? api.put(`/recurring/${existing._id}`, data) : api.post("/recurring", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
      toast.success(existing ? t("recurring.updated") : t("recurring.created"));
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || t("common.error")),
  });

  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            {existing ? t("recurring.edit") : t("recurring.new")}
          </h2>
          <button onClick={onClose} className="btn-icon text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate({ ...form, amount: parseFloat(form.amount) });
          }}
          className="p-5 space-y-4"
        >
          <div>
            <label className="label">{t("recurring.name_label")}</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t("recurring.name_placeholder")}
              className="input"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t("recurring.type")}</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="input"
              >
                <option value="expense">{t("transactions.expense")}</option>
                <option value="income">{t("transactions.income")}</option>
              </select>
            </div>
            <div>
              <label className="label">{t("recurring.category")}</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{t(`categories.${c.toLowerCase()}`, c)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t("recurring.amount")} ({symbol})</label>
              <input
                type="number"
                min="1"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">{t("recurring.frequency")}</label>
              <select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                className="input"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>{t(`frequencies.${f}`)}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">{t("recurring.next_run_date")}</label>
            <input
              type="date"
              value={form.nextRunDate}
              onChange={(e) => setForm({ ...form, nextRunDate: e.target.value })}
              className="input"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              {t("common.cancel")}
            </button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">
              {mutation.isPending ? t("common.saving") : t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RecurringPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const { data: recurring = [], isLoading } = useQuery({
    queryKey: ["recurring"],
    queryFn: () => api.get("/recurring").then((r) => r.data.data),
    staleTime: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/recurring/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["recurring"] }); toast.success(t("recurring.deleted")); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.put(`/recurring/${id}`, { isActive: !isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recurring"] }),
  });

  const active = recurring.filter((r) => r.isActive);
  const paused = recurring.filter((r) => !r.isActive);

  return (
    <>
      <Helmet><title>Recurring — Finance Manager</title><meta name="robots" content="noindex" /></Helmet>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">{t("nav.recurring")}</h1>
            <p className="page-subtitle">{t("recurring.subtitle_count", { count: active.length })}</p>
          </div>
          <button
            onClick={() => { setEditItem(null); setShowForm(true); }}
            className="btn-primary btn-sm"
          >
            <PlusCircle size={16} /> {t("recurring.add")}
          </button>
        </div>

        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        ) : recurring.length === 0 ? (
          <EmptyState
            icon={RefreshCcw}
            title={t("recurring.no_recurring")}
            description={t("recurring.no_recurring_help")}
            action={
              <button onClick={() => setShowForm(true)} className="btn-primary">
                <PlusCircle size={16} /> {t("recurring.add_first")}
              </button>
            }
          />
        ) : (
          <>
            {active.length > 0 && (
              <div>
                <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("recurring.active")}</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {active.map((r) => <RecurringCard key={r._id} item={r} onEdit={() => { setEditItem(r); setShowForm(true); }} onDelete={deleteMutation} onToggle={toggleMutation} />)}
                </div>
              </div>
            )}
            {paused.length > 0 && (
              <div>
                <h2 className="font-semibold text-gray-500 dark:text-gray-400 mb-3">{t("recurring.paused")}</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {paused.map((r) => <RecurringCard key={r._id} item={r} onEdit={() => { setEditItem(r); setShowForm(true); }} onDelete={deleteMutation} onToggle={toggleMutation} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showForm && <RecurringForm onClose={() => { setShowForm(false); setEditItem(null); }} existing={editItem} />}
    </>
  );
}

function RecurringCard({ item, onEdit, onDelete, onToggle }) {
  const { t } = useTranslation();
  const { fmt } = useCurrency();
  const nextRun = new Date(item.nextRunDate);
  const daysUntil = Math.ceil((nextRun - new Date()) / (1000 * 60 * 60 * 24));
  const badgeClass = FREQ_BADGE_CLASS[item.frequency] || "badge-gray";

  return (
    <div className={`card p-4 flex items-center gap-4 ${!item.isActive ? "opacity-60" : ""}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.type === "income" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
        <RefreshCcw size={18} className={item.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={badgeClass}>{t(`frequencies.${item.frequency}`, item.frequency)}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{t(`categories.${String(item.category || "").toLowerCase()}`, item.category)}</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {t("recurring.next_due")}: {nextRun.toLocaleDateString()} {daysUntil >= 0 ? `(${daysUntil}d)` : `(${t("recurring.overdue")})`}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`font-semibold ${item.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
          {item.type === "income" ? "+" : "-"}{fmt(item.amount)}
        </p>
        <div className="flex gap-1 mt-1 justify-end">
          <button onClick={() => onToggle.mutate({ id: item._id, isActive: item.isActive })} className="btn-icon hover:bg-gray-100 dark:hover:bg-gray-800">
            {item.isActive
              ? <ToggleRight size={16} className="text-emerald-500" />
              : <ToggleLeft size={16} className="text-gray-400" />}
          </button>
          <button onClick={onEdit} className="btn-icon hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-500">
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => { if (confirm(t("recurring.delete_confirm"))) onDelete.mutate(item._id); }}
            className="btn-icon hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
