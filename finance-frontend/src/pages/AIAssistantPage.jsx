import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Bot, Send, User, Sparkles, TrendingUp, Search, Calendar, Loader2 } from "lucide-react";
import api from "../api/axios";

function ScoreGauge({ score, band, emoji, breakdown }) {
  const pct = score || 0;
  const color = pct >= 75 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-yellow-500" />
        <h2 className="font-semibold text-gray-700">Financial Health Score</h2>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f0f0f0" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke={color} strokeWidth="3"
              strokeDasharray={`${pct} 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color }}>{pct}</span>
            <span className="text-xs text-gray-500">{emoji}</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-800 mb-2">{band}</p>
          {breakdown && (
            <div className="space-y-1.5">
              {Object.entries(breakdown).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-20 capitalize">{key.replace("Score", "")}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${(val / 25) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? "bg-blue-500" : "bg-slate-700"}`}>
        {isUser ? <User size={15} className="text-white" /> : <Bot size={15} className="text-white" />}
      </div>
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isUser ? "bg-blue-600 text-white rounded-tr-sm" : "bg-gray-100 text-gray-800 rounded-tl-sm"}`}>
        {msg.content}
      </div>
    </div>
  );
}

export default function AIAssistantPage() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your AI financial assistant. Ask me anything about your spending, savings, or get personalized tips. You can also use the quick actions below." }
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const bottomRef = useRef(null);

  const { data: score, isLoading: scoreLoading } = useQuery({
    queryKey: ["financial-score"],
    queryFn: () => api.get("/ai/score").then((r) => r.data.data),
    staleTime: 300000,
    retry: 1,
  });

  const { data: recommendations, isLoading: recLoading } = useQuery({
    queryKey: ["ai-recommendations"],
    queryFn: () => api.get("/ai/recommendations").then((r) => r.data.data),
    staleTime: 300000,
    retry: 1,
  });

  const chatMutation = useMutation({
    mutationFn: ({ message, hist }) => api.post("/ai/chat", { message, history: hist }),
    onSuccess: (res) => {
      const reply = res.data.data?.reply || "I couldn't process that. Try again.";
      const assistantMsg = { role: "assistant", content: reply };
      setMessages((prev) => [...prev, assistantMsg]);
      setHistory((prev) => [...prev, { role: "assistant", content: reply }]);
    },
    onError: () => {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble right now. Please try again later." }]);
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: () => api.post("/ai/analyze"),
    onSuccess: (res) => {
      const data = res.data.data;
      const summary = `Here's your spending analysis:\n\n${JSON.stringify(data, null, 2)}`;
      setMessages((prev) => [...prev, { role: "assistant", content: `Analysis complete! Your top spending category is ${data?.topCategory || "unknown"}. Total spent this month: ₹${data?.totalSpent?.toLocaleString("en-IN") || 0}. ${data?.insight || ""}` }]);
    },
    onError: () => toast.error("Analysis failed"),
  });

  const predictMutation = useMutation({
    mutationFn: () => api.get("/ai/predict"),
    onSuccess: (res) => {
      const data = res.data.data;
      setMessages((prev) => [...prev,
        { role: "user", content: "What will my spending look like next month?" },
        { role: "assistant", content: `Based on your patterns, I predict: Income ₹${data?.predictedIncome?.toLocaleString("en-IN") || 0}, Expenses ₹${data?.predictedExpense?.toLocaleString("en-IN") || 0}, Savings ₹${data?.predictedSavings?.toLocaleString("en-IN") || 0}. Confidence: ${data?.confidence || "moderate"}.` }
      ]);
    },
    onError: () => toast.error("Prediction failed"),
  });

  const subMutation = useMutation({
    mutationFn: () => api.get("/ai/subscriptions"),
    onSuccess: (res) => {
      const subs = res.data.data || [];
      if (subs.length === 0) {
        setMessages((prev) => [...prev, { role: "assistant", content: "I didn't detect any recurring subscriptions in your transactions." }]);
      } else {
        const list = subs.map((s) => `• ${s.name}: ₹${s.amount}/month`).join("\n");
        setMessages((prev) => [...prev, { role: "assistant", content: `I detected these potential subscriptions:\n\n${list}\n\nTotal: ₹${subs.reduce((acc, s) => acc + s.amount, 0)}/month` }]);
      }
    },
    onError: () => toast.error("Detection failed"),
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

  const isAnyLoading = chatMutation.isPending || analyzeMutation.isPending || predictMutation.isPending || subMutation.isPending;

  return (
    <>
      <Helmet><title>AI Assistant — Finance Manager</title><meta name="robots" content="noindex" /></Helmet>

      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t("nav.ai_assistant")}</h1>
          <p className="text-sm text-gray-500">Your personal AI-powered finance advisor</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: score + recommendations */}
          <div className="space-y-4">
            {scoreLoading ? (
              <div className="bg-white rounded-xl border border-gray-100 p-5 text-center text-gray-400">Loading score...</div>
            ) : score ? (
              <ScoreGauge score={score.score} band={score.band} emoji={score.emoji} breakdown={score.breakdown} />
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-5 text-center text-gray-400 text-sm">Score unavailable — add more transactions</div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</p>
              <div className="space-y-2">
                <button
                  onClick={() => { setMessages((p) => [...p, { role: "user", content: "Analyze my spending" }]); analyzeMutation.mutate(); }}
                  disabled={isAnyLoading}
                  className="w-full flex items-center gap-2 text-sm px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-60 transition"
                >
                  <TrendingUp size={15} /> Analyze Spending
                </button>
                <button
                  onClick={() => predictMutation.mutate()}
                  disabled={isAnyLoading}
                  className="w-full flex items-center gap-2 text-sm px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-60 transition"
                >
                  <Calendar size={15} /> Predict Next Month
                </button>
                <button
                  onClick={() => { setMessages((p) => [...p, { role: "user", content: "Find my subscriptions" }]); subMutation.mutate(); }}
                  disabled={isAnyLoading}
                  className="w-full flex items-center gap-2 text-sm px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 disabled:opacity-60 transition"
                >
                  <Search size={15} /> Detect Subscriptions
                </button>
              </div>
            </div>

            {/* Recommendations */}
            {!recLoading && recommendations?.tips?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recommendations</p>
                <ul className="space-y-2">
                  {recommendations.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-blue-500 flex-shrink-0">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Chat interface */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col" style={{ height: "520px" }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50 rounded-t-xl">
              <Bot size={16} className="text-blue-600" />
              <span className="font-medium text-gray-700 text-sm">AI Financial Assistant</span>
              <span className="ml-auto w-2 h-2 bg-green-400 rounded-full" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
              {isAnyLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    <Bot size={15} className="text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-gray-500" />
                    <span className="text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-3 border-t">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Ask about your finances..."
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isAnyLoading}
                  className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition"
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
