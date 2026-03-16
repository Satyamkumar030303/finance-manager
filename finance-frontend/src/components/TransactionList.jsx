import { useTransactions } from "../hooks/useTransactions";
import { useDeleteTransaction } from "../hooks/useDeleteTransaction";
import TransactionItem from "./TransactionItem";

const TransactionList = ({ filters, setEditing }) => {

  const { data, isLoading } = useTransactions(filters);
  const { mutate: deleteTx } = useDeleteTransaction();

  if (isLoading) return <p className="text-gray-500">Loading...</p>;

  if (!data || data.length === 0)
    return <p className="text-gray-500">No transactions found</p>;

  return (
    <div className="space-y-3">

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
};

export default TransactionList;