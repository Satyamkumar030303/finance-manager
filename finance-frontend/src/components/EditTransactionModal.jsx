import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useUpdateTransaction } from "../hooks/useUpdateTransaction";
import { useCurrency } from "../context/CurrencyContext";
import { CATEGORIES } from "../constants/transaction";

export default function EditTransactionModal({ transaction, onClose }) {
  const { t } = useTranslation();
  const { symbol } = useCurrency();
  const { mutate: updateTx, isPending } = useUpdateTransaction();

  const [form, setForm] = useState({
    amount: "", type: "expense", category: "",
    transactionDate: "", description: "",
  });

  useEffect(() => {
    if (transaction) {
      setForm({
        amount: transaction.amount ?? "",
        type: transaction.type ?? "expense",
        category: transaction.category ?? "Food",
        transactionDate: transaction.transactionDate?.slice(0, 10) ?? "",
        description: transaction.description ?? "",
      });
    }
  }, [transaction]);

  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const set = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { toast.error(t("transactions.invalid_amount")); return; }

    updateTx(
      { id: transaction._id, payload: { ...form, amount } },
      {
        onSuccess: () => { toast.success(t("transactions.updated")); onClose(); },
        onError: () => toast.error(t("transactions.update_failed")),
      }
    );
  };

  if (!transaction) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center
                 bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="card-raised w-full max-w-md animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
              <Pencil size={14} />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {t("common.edit_transaction")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t("transactions.amount")} ({symbol})</label>
              <input type="number" name="amount" value={form.amount}
                onChange={set} min="0" step="0.01" className="input" required />
            </div>
            <div>
              <label className="label">{t("transactions.type")}</label>
              <select name="type" value={form.type} onChange={set} className="input">
                <option value="income">{t("transactions.income")}</option>
                <option value="expense">{t("transactions.expense")}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">{t("transactions.category")}</label>
            <select name="category" value={form.category} onChange={set} className="input">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{t(`categories.${c.toLowerCase()}`, c)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">{t("transactions.date")}</label>
            <input type="date" name="transactionDate" value={form.transactionDate}
              onChange={set} className="input" required />
          </div>

          <div>
            <label className="label">{t("transactions.description")}</label>
            <input type="text" name="description" value={form.description}
              onChange={set} placeholder={t("common.optional_note")} className="input" maxLength={120} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              {t("common.cancel")}
            </button>
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? t("common.saving") : t("common.save_changes")}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
