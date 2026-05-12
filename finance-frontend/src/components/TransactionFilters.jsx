import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

const CATEGORIES = [
  "Food", "Travel", "Shopping", "Salary", "Bills",
  "Entertainment", "Health", "Education", "Investment", "Miscellaneous",
];

export default function TransactionFilters({ filters, setFilters }) {
  const { t } = useTranslation();
  const hasFilters = filters.type || filters.month || filters.category;

  const clear = () => setFilters({ type: "", month: "", category: "" });

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Type */}
      <select
        value={filters.type || ""}
        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        className="input w-auto text-sm"
      >
        <option value="">{t("transactions.all_types")}</option>
        <option value="income">{t("transactions.income")}</option>
        <option value="expense">{t("transactions.expense")}</option>
      </select>

      {/* Category */}
      <select
        value={filters.category || ""}
        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        className="input w-auto text-sm"
      >
        <option value="">{t("transactions.all_categories")}</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{t(`categories.${c.toLowerCase()}`, c)}</option>
        ))}
      </select>

      {/* Month */}
      <input
        type="month"
        value={filters.month || ""}
        onChange={(e) => setFilters({ ...filters, month: e.target.value })}
        className="input w-auto text-sm"
      />

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clear}
          className="btn-ghost btn-sm gap-1.5"
        >
          <X size={13} /> {t("common.clear_filters")}
        </button>
      )}
    </div>
  );
}
