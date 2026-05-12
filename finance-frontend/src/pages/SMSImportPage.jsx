import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { MessageSquare, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { parseSMS, getQueue, enqueueTransaction, flushQueue } from "../services/sms.service";
import api from "../api/axios";
import { useCurrency } from "../context/CurrencyContext";

export default function SMSImportPage() {
  const { fmt } = useCurrency();
  const queryClient = useQueryClient();
  const [smsText, setSmsText] = useState("");
  const [parsed, setParsed] = useState(null);
  const [parseError, setParseError] = useState("");
  const queue = getQueue();

  const createMutation = useMutation({
    mutationFn: (data) => api.post("/transactions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Transaction added from SMS");
      setSmsText("");
      setParsed(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save");
      // Enqueue for retry if offline
      if (!navigator.onLine && parsed) enqueueTransaction(parsed);
    },
  });

  const handleParse = () => {
    setParseError("");
    setParsed(null);
    if (!smsText.trim()) return setParseError("Paste an SMS message to parse");
    const result = parseSMS(smsText);
    if (!result) {
      setParseError("Could not detect a financial transaction in this SMS. Try a bank debit/credit message.");
    } else {
      setParsed(result);
    }
  };

  const handleFlush = async () => {
    const { submitted, failed } = await flushQueue((url, data) => api.post(url, data));
    if (submitted > 0) {
      toast.success(`${submitted} queued transactions submitted`);
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    }
    if (failed > 0) toast.error(`${failed} transactions still failed`);
  };

  const EXAMPLE_SMS = [
    "Dear Customer, Rs.1,500.00 debited from A/c XX1234 for ZOMATO ORDER on 12-05-2026. Avl Bal: Rs.45,230.00 -HDFC Bank",
    "Your a/c XXXX9876 is credited with INR 50,000.00 on 12-05-2026 by NEFT. UPI Ref:123456789012. -SBI",
    "INR 299.00 paid to Netflix via UPI. UPI Ref: 406214887234. Avl Bal: INR 12,456.00 -Kotak Bank",
  ];

  return (
    <>
      <Helmet><title>SMS Import — Finance Manager</title><meta name="robots" content="noindex" /></Helmet>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">SMS Import</h1>
          <p className="text-sm text-gray-500">Paste a bank/UPI SMS to automatically create a transaction</p>
        </div>

        {/* On Android, auto-listener status would show here */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          <p className="font-medium mb-1">How it works</p>
          <p>Paste any bank or UPI payment SMS. The parser detects the amount, type (debit/credit), merchant, and category automatically. On Android, this works in the background via the native app.</p>
        </div>

        {/* SMS Input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
          <label className="block text-sm font-medium text-gray-700">Paste SMS Message</label>
          <textarea
            value={smsText}
            onChange={(e) => { setSmsText(e.target.value); setParsed(null); setParseError(""); }}
            placeholder="Dear Customer, Rs.1,500.00 debited from A/c XX1234..."
            rows={4}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          />

          {/* Example buttons */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_SMS.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => { setSmsText(ex); setParsed(null); setParseError(""); }}
                  className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 transition"
                >
                  Example {i + 1}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleParse}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            <MessageSquare size={15} /> Parse SMS
          </button>
        </div>

        {/* Parse result */}
        {parseError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{parseError}</p>
          </div>
        )}

        {parsed && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-600" />
              <p className="font-semibold text-green-700">Transaction Detected</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Type</p>
                <p className={`font-semibold ${parsed.type === "income" ? "text-green-700" : "text-red-700"}`}>
                  {parsed.type === "income" ? "Credit (Income)" : "Debit (Expense)"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Amount</p>
                <p className="font-semibold text-gray-800">{fmt(parsed.amount)}</p>
              </div>
              <div>
                <p className="text-gray-500">Category</p>
                <p className="font-semibold text-gray-800">{parsed.category}</p>
              </div>
              <div>
                <p className="text-gray-500">Merchant</p>
                <p className="font-semibold text-gray-800">{parsed.merchant || "Unknown"}</p>
              </div>
              {parsed.description && (
                <div className="col-span-2">
                  <p className="text-gray-500">Description</p>
                  <p className="font-medium text-gray-700 text-xs">{parsed.description.slice(0, 100)}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => createMutation.mutate(parsed)}
              disabled={createMutation.isPending}
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-60 text-sm font-medium"
            >
              <Plus size={15} />
              {createMutation.isPending ? "Adding..." : "Add Transaction"}
            </button>
          </div>
        )}

        {/* Offline Queue */}
        {queue.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="font-medium text-yellow-800 mb-1">{queue.length} transactions pending sync</p>
            <p className="text-sm text-yellow-700 mb-3">These were saved offline and will be submitted when you're back online.</p>
            <button onClick={handleFlush} className="text-sm bg-yellow-600 text-white px-4 py-1.5 rounded-lg hover:bg-yellow-700">
              Sync Now
            </button>
          </div>
        )}
      </div>
    </>
  );
}
