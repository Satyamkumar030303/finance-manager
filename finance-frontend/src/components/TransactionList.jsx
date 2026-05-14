import { Receipt, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTransactions } from "../hooks/useTransactions";
import { useDeleteTransaction } from "../hooks/useDeleteTransaction";
import TransactionItem from "./TransactionItem";
import EmptyState from "./ui/EmptyState";

export default function TransactionList({ filters, setEditing, clearFilters }) {
  const { t } = useTranslation();
  const { data, isLoading } = useTransactions(filters);
  const { mutate: deleteTx } = useDeleteTransaction();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="skeleton w-9 h-9 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-4 w-40" />
            </div>
            <div className="skeleton h-5 w-20 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!data?.length) {
    const hasFilters = Object.values(filters || {}).some(
      (v) => v !== "" && v !== null && v !== undefined
    );

    if (hasFilters) {
      return (
        <EmptyState
          bare
          icon={Filter}
          title={t("transactions.no_match_title")}
          description={t("transactions.no_match_help")}
          action={
            clearFilters && (
              <button onClick={clearFilters} className="btn-secondary btn-sm">
                {t("common.clear_filters")}
              </button>
            )
          }
        />
      );
    }

    return (
      <EmptyState
        bare
        icon={Receipt}
        title={t("transactions.no_yet_title")}
        description={t("transactions.no_yet_help")}
      />
    );
  }

  return (
    <div className="space-y-2">
      {data.map((tx) => (
        <TransactionItem
          key={tx._id}
          transaction={tx}
          setEditing={setEditing}
          onDelete={() => deleteTx(tx._id)}
        />
      ))}
    </div>
  );
}
