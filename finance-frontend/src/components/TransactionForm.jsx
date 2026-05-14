import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCreateTransaction } from "../hooks/useCreateTransaction";
import { useUpdateTransaction } from "../hooks/useUpdateTransaction";
import { useCurrency } from "../context/CurrencyContext";
import { CATEGORIES } from "../constants/transaction";

const EMPTY = {
  amount: "",
  type: "expense",
  category: "Food",
  transactionDate: new Date().toISOString().split("T")[0],
  description: "",
};

export default function TransactionForm({ editing, setEditing }) {
  const { t } = useTranslation();
  const { symbol } = useCurrency();
  const { mutate: createTx, isPending: creating } = useCreateTransaction();
  const { mutate: updateTx, isPending: updating } = useUpdateTransaction();

  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (editing) {
      setForm({
        amount: editing.amount ?? "",
        type: editing.type ?? "expense",
        category: editing.category ?? "Food",
        transactionDate: editing.transactionDate
          ? editing.transactionDate.split("T")[0]
          : new Date().toISOString().split("T")[0],
        description: editing.description ?? "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [editing]);

  const set = (field) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      toast.error(t("transactions.invalid_amount"));
      return;
    }
    if (!form.transactionDate) {
      toast.error(t("transactions.select_date"));
      return;
    }

    const payload = { ...form, amount };

    if (editing) {
      updateTx(
        { id: editing._id, payload },
        {
          onSuccess: () => {
            toast.success(t("transactions.updated"));
            setEditing(null);
          },
          onError: () => toast.error(t("transactions.update_failed")),
        }
      );
    } else {
      createTx(payload, {
        onSuccess: () => {
          toast.success(t("transactions.added"));
          setForm(EMPTY);
        },
        onError: () => toast.error(t("transactions.add_failed")),
      });
    }
  };

  const isLoading = creating || updating;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {/* Amount */}
        <div>
          <label className="label">{t("transactions.amount")} ({symbol})</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={set("amount")}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="input"
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="label">{t("transactions.type")}</label>
          <select
            name="type"
            value={form.type}
            onChange={set("type")}
            className="input"
          >
            <option value="expense">{t("transactions.expense")}</option>
            <option value="income">{t("transactions.income")}</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="label">{t("transactions.category")}</label>
          <select
            name="category"
            value={form.category}
            onChange={set("category")}
            className="input"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{t(`categories.${c.toLowerCase()}`, c)}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="label">{t("transactions.date")}</label>
          <input
            type="date"
            name="transactionDate"
            value={form.transactionDate}
            onChange={set("transactionDate")}
            className="input"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="label">{t("transactions.description")}</label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={set("description")}
            placeholder={t("common.optional_note")}
            className="input"
            maxLength={120}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
        >
          {editing ? <Pencil size={15} /> : <Plus size={15} />}
          {editing
            ? updating ? t("common.saving") : t("common.save_changes")
            : creating ? t("common.adding") : t("common.add_transaction")}
        </button>

        {editing && (
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="btn-secondary"
          >
            <X size={15} /> {t("common.cancel")}
          </button>
        )}
      </div>
    </form>
  );
}
