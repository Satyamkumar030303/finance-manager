import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { PlusCircle, Trash2, Edit2, RefreshCcw, X, ToggleLeft, ToggleRight } from "lucide-react";
import api from "../api/axios";

const CATEGORIES = [
  "Food", "Transport", "Shopping", "Entertainment", "Utilities",
  "Health", "Education", "Finance", "Telecom", "Travel", "Miscellaneous", "Salary", "Business", "Investment"
];

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

function RecurringForm({ onClose, existing }) {
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
      toast.success(existing ? "Updated" : "Recurring transaction created");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Error"),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="font-semibold text-lg">{existing ? "Edit Recurring" : "New Recurring Transaction"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate({ ...form, amount: parseFloat(form.amount) });
          }}
          className="p-5 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name / Description</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Netflix Subscription"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
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
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                min="1"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next Run Date</label>
            <input
              type="date"
              value={form.nextRunDate}
              onChange={(e) => setForm({ ...form, nextRunDate: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {mutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const freqBadge = { daily: "bg-purple-100 text-purple-700", weekly: "bg-blue-100 text-blue-700", monthly: "bg-green-100 text-green-700", yearly: "bg-yellow-100 text-yellow-700" };

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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["recurring"] }); toast.success("Deleted"); },
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
            <h1 className="text-2xl font-bold text-gray-800">{t("nav.recurring")}</h1>
            <p className="text-sm text-gray-500">{active.length} active recurring transactions</p>
          </div>
          <button
            onClick={() => { setEditItem(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            <PlusCircle size={16} /> Add Recurring
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : recurring.length === 0 ? (
          <div className="text-center py-16">
            <RefreshCcw className="mx-auto text-gray-300 mb-3" size={56} />
            <p className="text-gray-500 mb-4">No recurring transactions yet</p>
            <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Add your first one
            </button>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <div>
                <h2 className="font-semibold text-gray-700 mb-3">Active</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {active.map((r) => <RecurringCard key={r._id} item={r} onEdit={() => { setEditItem(r); setShowForm(true); }} onDelete={deleteMutation} onToggle={toggleMutation} />)}
                </div>
              </div>
            )}
            {paused.length > 0 && (
              <div>
                <h2 className="font-semibold text-gray-700 mb-3 text-gray-400">Paused</h2>
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
  const nextRun = new Date(item.nextRunDate);
  const daysUntil = Math.ceil((nextRun - new Date()) / (1000 * 60 * 60 * 24));
  const freqColors = { daily: "bg-purple-100 text-purple-700", weekly: "bg-blue-100 text-blue-700", monthly: "bg-green-100 text-green-700", yearly: "bg-yellow-100 text-yellow-700" };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 ${!item.isActive ? "opacity-60" : ""}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.type === "income" ? "bg-green-100" : "bg-red-100"}`}>
        <RefreshCcw size={18} className={item.type === "income" ? "text-green-600" : "text-red-600"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">{item.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${freqColors[item.frequency]}`}>{item.frequency}</span>
          <span className="text-xs text-gray-500">{item.category}</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Next: {nextRun.toLocaleDateString("en-IN")} {daysUntil >= 0 ? `(${daysUntil}d)` : "(overdue)"}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`font-semibold ${item.type === "income" ? "text-green-600" : "text-red-600"}`}>
          {item.type === "income" ? "+" : "-"}₹{item.amount?.toLocaleString("en-IN")}
        </p>
        <div className="flex gap-1 mt-1 justify-end">
          <button onClick={() => onToggle.mutate({ id: item._id, isActive: item.isActive })} className="p-1 rounded hover:bg-gray-100">
            {item.isActive ? <ToggleRight size={16} className="text-green-500" /> : <ToggleLeft size={16} className="text-gray-400" />}
          </button>
          <button onClick={onEdit} className="p-1 rounded hover:bg-gray-100 text-blue-500"><Edit2 size={14} /></button>
          <button onClick={() => { if (confirm("Delete?")) onDelete.mutate(item._id); }} className="p-1 rounded hover:bg-gray-100 text-red-500"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}
