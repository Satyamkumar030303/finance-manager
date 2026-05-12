import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/index";
import toast from "react-hot-toast";
import {
  Bot, Send, User, Sparkles, TrendingUp, Search,
  Calendar, Loader2, CheckCircle, AlertTriangle, Lightbulb,
} from "lucide-react";
import api from "../api/axios";
import { useCurrency } from "../context/CurrencyContext";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreGauge({ score, band, emoji, breakdown }) {
  const pct = score || 0;
  const color = pct >= 75 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
  const breakdownEntries = breakdown
    ? Object.entries(breakdown).filter(([, v]) => typeof v === "object" && "score" in v)
    : [];

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-yellow-500" />
        <h2 className="font-semibold text-sm">Financial Health Score</h2>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-700" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
              strokeDasharray={`${pct} 100`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color }}>{pct}</span>
            <span className="text-xs">{emoji}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold mb-2 text-sm">{band}</p>
          <div className="space-y-1.5">
            {breakdownEntries.map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 w-20 truncate capitalize">
                  {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                </span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${((val.score || 0) / (val.max || 25)) * 100}%` }} />
                </div>
                <span className="text-xs font-medium w-8 text-right">{val.score}/{val.max}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? "bg-blue-500" : "bg-slate-700 dark:bg-slate-600"}`}>
        {isUser ? <User size={15} className="text-white" /> : <Bot size={15} className="text-white" />}
      </div>
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
        isUser
          ? "bg-blue-600 text-white rounded-tr-sm"
          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-sm"
      }`}>
        {msg.content}
      </div>
    </div>
  );
}

const PRIORITY_COLOR = { high: "text-red-600 dark:text-red-400", medium: "text-yellow-600 dark:text-yellow-400", low: "text-green-600 dark:text-green-400" };
const PRIORITY_ICON = { high: AlertTriangle, medium: Lightbulb, low: CheckCircle };

function RecommendationCard({ rec, index }) {
  const Icon = PRIORITY_ICON[rec.priority] || Lightbulb;
  return (
    <div className="flex gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
      <Icon size={14} className={`flex-shrink-0 mt-0.5 ${PRIORITY_COLOR[rec.priority]}`} />
      <div className="min-w-0">
        <p className="text-xs font-medium leading-snug">{rec.title}</p>
        {rec.estimatedSavings && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{rec.estimatedSavings}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AIAssistantPage() {
  const { t } = useTranslation();
  const { fmt } = useCurrency();
  const [messages, setMessages] = useState([
    { role: "assistant", content: t("ai.greeting") },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const bottomRef = useRef(null);

  // ── Data queries ──────────────────────────────────────────────────────────

  const { data: scoreData, isLoading: scoreLoading } = useQuery({
    queryKey: ["financial-score"],
    queryFn: () => api.get("/ai/score").then((r) => r.data.data),
    staleTime: 300_000,
    retry: 1,
  });

  // GET /ai/recommendations → array of { title, description, priority, category, estimatedSavings }
  const { data: recommendations, isLoading: recLoading } = useQuery({
    queryKey: ["ai-recommendations"],
    queryFn: () => api.get("/ai/recommendations").then((r) => r.data.data),
    staleTime: 300_000,
    retry: 1,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────

  const chatMutation = useMutation({
    mutationFn: ({ message, hist }) =>
      api.post("/ai/chat", { message, history: hist, language: i18n.language }),
    onSuccess: (res) => {
      const reply = res.data.data?.reply || "I couldn't process that. Try again.";
      const assistantMsg = { role: "assistant", content: reply };
      setMessages((prev) => [...prev, assistantMsg]);
      setHistory((prev) => [...prev, { role: "assistant", content: reply }]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble right now. Please try again later." },
      ]);
    },
  });

  // POST /ai/analyze → { patterns[], concerns[], positives[], actions[] }
  const analyzeMutation = useMutation({
    mutationFn: () => api.post("/ai/analyze", { language: i18n.language }),
    onSuccess: (res) => {
      const data = res.data.data;
      if (!data || data.unavailable) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Analysis unavailable right now. Try again later." },
        ]);
        return;
      }

      const parts = [];
      if (data.patterns?.length)
        parts.push(`📊 Patterns:\n${data.patterns.map((p) => `• ${p}`).join("\n")}`);
      if (data.concerns?.length)
        parts.push(`⚠️ Concerns:\n${data.concerns.map((c) => `• ${c}`).join("\n")}`);
      if (data.positives?.length)
        parts.push(`✅ Positives:\n${data.positives.map((p) => `• ${p}`).join("\n")}`);
      if (data.actions?.length)
        parts.push(`💡 Actions:\n${data.actions.map((a) => `• ${a}`).join("\n")}`);
      if (data.raw)
        parts.push(data.raw);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: parts.length ? parts.join("\n\n") : "No spending data found yet — add some transactions first.",
        },
      ]);
    },
    onError: () => toast.error("Spending analysis failed"),
  });

  // GET /ai/predict → { predictedTotal, predictedIncome, byCategory, note }
  const predictMutation = useMutation({
    mutationFn: () => api.get("/ai/predict"),
    onSuccess: (res) => {
      const data = res.data.data;
      const savings = (data?.predictedIncome || 0) - (data?.predictedTotal || 0);
      const topCat = data?.byCategory
        ? Object.entries(data.byCategory).sort((a, b) => b[1] - a[1])[0]
        : null;

      setMessages((prev) => [
        ...prev,
        { role: "user", content: "What will my spending look like next month?" },
        {
          role: "assistant",
          content:
            `Based on your last 90 days:\n\n` +
            `• Predicted Income: ${fmt(data?.predictedIncome || 0)}\n` +
            `• Predicted Expenses: ${fmt(data?.predictedTotal || 0)}\n` +
            `• Estimated Savings: ${fmt(savings)}\n` +
            (topCat ? `• Biggest category: ${t(`categories.${topCat[0]?.toLowerCase()}`, topCat[0])} (${fmt(topCat[1])})\n` : "") +
            `\n_${data?.note || "Based on historical averages"}_`,
        },
      ]);
    },
    onError: () => toast.error("Prediction failed"),
  });

  // GET /ai/subscriptions → array of { category, amount, description, occurrences, estimatedFrequency, monthlyImpact }
  const subMutation = useMutation({
    mutationFn: () => api.get("/ai/subscriptions"),
    onSuccess: (res) => {
      const subs = res.data.data || [];
      if (subs.length === 0) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "No recurring subscriptions detected in your recent transactions." },
        ]);
      } else {
        const list = subs
          .map((s) => `• ${s.description || t(`categories.${s.category?.toLowerCase()}`, s.category)}: ${fmt(s.amount)} (${s.estimatedFrequency || "recurring"}, ~${fmt(s.monthlyImpact || s.amount)}/mo)`)
          .join("\n");
        const total = subs.reduce((acc, s) => acc + (s.monthlyImpact || s.amount || 0), 0);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Detected ${subs.length} recurring expense pattern${subs.length > 1 ? "s" : ""}:\n\n${list}\n\n${t("ai.recurring_impact")}: ${fmt(total)}`,
          },
        ]);
      }
    },
    onError: () => toast.error("Subscription detection failed"),
  });

  const sendMessage = () => {
    if (!input.trim() || chatMutation.isPending) return;
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    const newHist = [...history, userMsg];
    setHistory(newHist);
    setInput("");
    chatMutation.mutate({ message: input, hist: newHist });
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isAnyLoading =
    chatMutation.isPending ||
    analyzeMutation.isPending ||
    predictMutation.isPending ||
    subMutation.isPending;

  const recsArray = Array.isArray(recommendations) ? recommendations : [];

  return (
    <>
      <Helmet>
        <title>AI Assistant — Finance Manager</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="page-title">{t("nav.ai_assistant", "AI Assistant")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your personal AI-powered finance advisor</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel */}
          <div className="space-y-4">
            {scoreLoading ? (
              <div className="card p-5 skeleton h-48" />
            ) : scoreData ? (
              <ScoreGauge
                score={scoreData.score}
                band={scoreData.band}
                emoji={scoreData.emoji}
                breakdown={scoreData.breakdown}
              />
            ) : (
              <div className="card p-5 text-center text-sm text-gray-400 dark:text-gray-500">
                Score unavailable — add more transactions
              </div>
            )}

            {/* Quick Actions */}
            <div className="card p-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                {t("ai.quick_actions")}
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setMessages((p) => [...p, { role: "user", content: t("ai.analyze_spending") }]);
                    analyzeMutation.mutate();
                  }}
                  disabled={isAnyLoading}
                  className="btn-ghost w-full justify-start gap-2 text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                >
                  <TrendingUp size={15} /> {t("ai.analyze_spending")}
                </button>
                <button
                  onClick={() => predictMutation.mutate()}
                  disabled={isAnyLoading}
                  className="btn-ghost w-full justify-start gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40"
                >
                  <Calendar size={15} /> {t("ai.predict_next_month")}
                </button>
                <button
                  onClick={() => {
                    setMessages((p) => [...p, { role: "user", content: t("ai.detect_subscriptions") }]);
                    subMutation.mutate();
                  }}
                  disabled={isAnyLoading}
                  className="btn-ghost w-full justify-start gap-2 text-sm text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40"
                >
                  <Search size={15} /> {t("ai.detect_subscriptions")}
                </button>
              </div>
            </div>

            {/* Recommendations */}
            {!recLoading && recsArray.length > 0 && (
              <div className="card p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  {t("ai.recommendations")}
                </p>
                <div className="space-y-2">
                  {recsArray.slice(0, 5).map((rec, i) => (
                    <RecommendationCard key={i} rec={rec} index={i} />
                  ))}
                </div>
              </div>
            )}
            {recLoading && (
              <div className="card p-4 space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="skeleton h-10 rounded-lg" />)}
              </div>
            )}
          </div>

          {/* Chat panel */}
          <div
            className="lg:col-span-2 card flex flex-col"
            style={{ height: "560px" }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-t-xl">
              <Bot size={16} className="text-blue-600" />
              <span className="font-medium text-sm">AI Financial Assistant</span>
              <span className="ml-auto w-2 h-2 bg-green-400 rounded-full" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <ChatMessage key={i} msg={msg} />
              ))}
              {isAnyLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 dark:bg-slate-600 flex items-center justify-center">
                    <Bot size={15} className="text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-gray-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t("ai.thinking")}</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder={t("ai.ask_placeholder")}
                  className="input flex-1"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isAnyLoading}
                  className="btn-primary p-2.5 disabled:opacity-60"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
