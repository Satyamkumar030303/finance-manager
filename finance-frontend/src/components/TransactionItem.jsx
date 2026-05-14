import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { useCurrency } from "../context/CurrencyContext";

export default function TransactionItem({ transaction, setEditing, onDelete }) {
  const { t } = useTranslation();
  const { fmt } = useCurrency();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  const isIncome = transaction.type === "income";

  const handleDelete = () => {
    setRemoving(true);
    let timer;

    const toastId = toast(
      (toastState) => (
        <div className="flex items-center gap-3">
          <span className="text-sm">{t("transactions.deleted")}</span>
          <button
            onClick={() => {
              clearTimeout(timer);
              setRemoving(false);
              toast.dismiss(toastState.id);
            }}
            className="text-blue-500 dark:text-blue-400 text-xs font-semibold hover:underline"
          >
            {t("common.undo")}
          </button>
        </div>
      ),
      { duration: 5000 }
    );

    timer = setTimeout(() => {
      onDelete();
      toast.dismiss(toastId);
    }, 5000);
  };

  const date = new Date(
    transaction.transactionDate || transaction.createdAt
  ).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <>
      <div
        className={`flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800
                    bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/70
                    transition-all duration-200 group
                    ${removing ? "opacity-0 scale-95 pointer-events-none" : ""}`}
      >
        {/* Left: category + description + date */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Color dot */}
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base
              ${isIncome
                ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                : "bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400"
              }`}
          >
            {isIncome ? "+" : "−"}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge-blue text-[10px]">{t(`categories.${transaction.category?.toLowerCase()}`, transaction.category)}</span>
            </div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
              {transaction.description || transaction.category}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{date}</p>
          </div>
        </div>

        {/* Right: amount + actions */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <p
            className={`text-base font-bold tabular-nums ${
              isIncome
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-500 dark:text-red-400"
            }`}
          >
            {isIncome ? "+" : "−"}{fmt(transaction.amount)}
          </p>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditing(transaction)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400
                         hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              aria-label={t("common.edit")}
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400
                         hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              aria-label={t("common.delete")}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {confirmOpen && (
        <DeleteConfirmModal
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            handleDelete();
          }}
        />
      )}
    </>
  );
}
