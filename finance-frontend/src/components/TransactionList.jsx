import { useTransactions } from "../hooks/useTransactions";
import { useDeleteTransaction } from "../hooks/useDeleteTransaction";
import TransactionItem from "./TransactionItem";
import { Receipt } from "lucide-react";

export default function TransactionList({ filters, setEditing }) {
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
    return (
      <div className="py-10 text-center">
        <Receipt size={32} className="mx-auto mb-3 text-gray-300 dark:text-gray-700" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No transactions found</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Try adjusting your filters or add a new transaction above.
        </p>
      </div>
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
