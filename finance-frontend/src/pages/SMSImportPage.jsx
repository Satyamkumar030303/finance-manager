import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { MessageSquare, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { parseSMS, getQueue, enqueueTransaction, flushQueue } from "../services/sms.service";
import api from "../api/axios";
import { useCurrency } from "../context/CurrencyContext";

export default function SMSImportPage() {
  const { t } = useTranslation();
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
      toast.success(t("sms.added_toast"));
      setSmsText("");
      setParsed(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save");
      if (!navigator.onLine && parsed) enqueueTransaction(parsed);
    },
  });

  const handleParse = () => {
    setParseError("");
    setParsed(null);
    if (!smsText.trim()) return setParseError(t("sms.parse_empty"));
    const result = parseSMS(smsText);
    if (!result) {
      setParseError(t("sms.parse_no_match"));
    } else {
      setParsed(result);
    }
  };

  const handleFlush = async () => {
    const { submitted, failed } = await flushQueue((url, data) => api.post(url, data));
    if (submitted > 0) {
      toast.success(t("sms.queued_submitted", { count: submitted }));
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    }
    if (failed > 0) toast.error(t("sms.queued_failed", { count: failed }));
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
          <h1 className="page-title">{t("sms.title")}</h1>
          <p className="page-subtitle">{t("sms.subtitle")}</p>
        </div>

        <div className="banner-blue text-sm">
          <div>
            <p className="font-medium mb-1">{t("sms.how_it_works")}</p>
            <p>{t("sms.how_it_works_help")}</p>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <label className="label">{t("sms.paste_label")}</label>
          <textarea
            value={smsText}
            onChange={(e) => { setSmsText(e.target.value); setParsed(null); setParseError(""); }}
            placeholder={t("sms.paste_placeholder")}
            rows={4}
            className="input resize-none"
          />

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t("sms.try_example")}</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_SMS.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => { setSmsText(ex); setParsed(null); setParseError(""); }}
                  className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {t("sms.example_n", { n: i + 1 })}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleParse} className="btn-primary btn-sm">
            <MessageSquare size={15} /> {t("sms.parse")}
          </button>
        </div>

        {parseError && (
          <div className="banner-red text-sm">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <p>{parseError}</p>
          </div>
        )}

        {parsed && (
          <div className="card p-5 space-y-4 border-l-4 border-l-emerald-500 dark:border-l-emerald-400">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400" />
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">{t("sms.detected")}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">{t("sms.type")}</p>
                <p className={`font-semibold ${parsed.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {parsed.type === "income" ? t("sms.credit_income") : t("sms.debit_expense")}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">{t("sms.amount")}</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{fmt(parsed.amount)}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">{t("sms.category")}</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{t(`categories.${String(parsed.category || "").toLowerCase()}`, parsed.category)}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">{t("sms.merchant")}</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{parsed.merchant || t("common.unknown")}</p>
              </div>
              {parsed.description && (
                <div className="col-span-2">
                  <p className="text-gray-500 dark:text-gray-400">{t("sms.description")}</p>
                  <p className="font-medium text-gray-700 dark:text-gray-300 text-xs">{parsed.description.slice(0, 100)}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                const { rawSMS, senderSMS, ...payload } = parsed;
                createMutation.mutate(payload);
              }}
              disabled={createMutation.isPending}
              className="btn-success btn-sm"
            >
              <Plus size={15} />
              {createMutation.isPending ? t("sms.adding") : t("sms.add")}
            </button>
          </div>
        )}

        {queue.length > 0 && (
          <div className="banner-yellow flex-col items-stretch">
            <p className="font-medium mb-1">{t("sms.pending_sync", { count: queue.length })}</p>
            <p className="text-sm mb-3 opacity-90">{t("sms.pending_sync_help")}</p>
            <button onClick={handleFlush} className="btn-primary btn-sm self-start">
              {t("sms.sync_now")}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
