import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { PlusCircle, Trash2, Target, CheckCircle, Plus, X } from "lucide-react";
import api from "../api/axios";

function GoalForm({ onClose, existing }) {
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="font-semibold text-lg">{existing ? "Edit Goal" : "New Savings Goal"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ ...form, targetAmount: parseFloat(form.targetAmount) }); }} className="p-5 space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {["🎯", "🏠", "✈️", "🚗", "📱", "💍", "🎓", "💰"].map((emoji) => (
              <button
                key={emoji} type="button"
                onClick={() => setForm({ ...form, icon: emoji })}
                className={`text-2xl p-2 rounded-lg border-2 transition ${form.icon === emoji ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <input placeholder="Goal name (e.g., Emergency Fund)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
          <input type="number" min="1" placeholder="Target Amount (₹)" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Deadline (optional)</label>
            <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {mutation.isPending ? "Saving..." : "Save Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ContributeModal({ goal, onClose }) {
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h3 className="font-semibold text-lg mb-4">Add to {goal.icon} {goal.name}</h3>
        <input type="number" min="1" placeholder="Amount (₹)" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={!amount || mutation.isPending} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60">
            {mutation.isPending ? "..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const { t } = useTranslation();
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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["goals"] }); toast.success("Goal deleted"); },
  });

  const active = goals.filter((g) => !g.isCompleted);
  const completed = goals.filter((g) => g.isCompleted);

  return (
    <>
      <Helmet><title>Savings Goals — Finance Manager</title><meta name="robots" content="noindex" /></Helmet>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t("goals.title")}</h1>
            <p className="text-sm text-gray-500">{active.length} active goals</p>
          </div>
          <button onClick={() => { setEditGoal(null); setShowForm(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
            <PlusCircle size={16} /> {t("goals.add")}
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading goals...</div>
        ) : goals.length === 0 ? (
          <div className="text-center py-16">
            <Target className="mx-auto text-gray-300 mb-3" size={56} />
            <p className="text-gray-500 mb-4">{t("goals.no_goals")}</p>
            <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Create your first goal
            </button>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <div>
                <h2 className="font-semibold text-gray-700 mb-3">Active Goals</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {active.map((g) => {
                    const pct = Math.min(Math.round((g.savedAmount / g.targetAmount) * 100), 100);
                    const remaining = g.deadline ? Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                    return (
                      <div key={g._id} className="bg-white rounded-xl shadow-sm p-5 space-y-3 border border-gray-100">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{g.icon}</span>
                            <div>
                              <p className="font-semibold text-gray-800">{g.name}</p>
                              <p className="text-xs text-gray-500">
                                ₹{g.savedAmount?.toLocaleString("en-IN")} / ₹{g.targetAmount?.toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => setContributeGoal(g)} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"><Plus size={14} /></button>
                            <button onClick={() => { setEditGoal(g); setShowForm(true); }} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Target size={14} /></button>
                            <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(g._id); }} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 size={14} /></button>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{pct}% complete</span>
                          {remaining !== null && <span>{remaining > 0 ? `${remaining} days left` : "Overdue"}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div>
                <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Completed Goals</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {completed.map((g) => (
                    <div key={g._id} className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                      <span className="text-2xl">{g.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{g.name}</p>
                        <p className="text-xs text-green-600">₹{g.targetAmount?.toLocaleString("en-IN")} — Goal achieved!</p>
                      </div>
                      <CheckCircle className="text-green-500" size={20} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showForm && <GoalForm onClose={() => { setShowForm(false); setEditGoal(null); }} existing={editGoal} />}
      {contributeGoal && <ContributeModal goal={contributeGoal} onClose={() => setContributeGoal(null)} />}
    </>
  );
}
