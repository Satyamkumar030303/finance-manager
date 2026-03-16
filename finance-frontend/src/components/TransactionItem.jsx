import { useState } from "react";
import { Pencil, Trash } from "lucide-react";
import DeleteConfirmModal from "./DeleteConfirmModal";
import toast from "react-hot-toast";

const TransactionItem = ({ transaction, setEditing, onDelete }) => {

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  const isIncome = transaction.type === "income";

  const handleDelete = () => {

    setRemoving(true);

    let deleteTimer;

    const toastId = toast((t) => (
      <span className="flex items-center gap-2">
        Transaction deleted
        <button
          onClick={() => {
            clearTimeout(deleteTimer);
            setRemoving(false);
            toast.dismiss(t.id);
          }}
          className="text-blue-500 font-semibold"
        >
          Undo
        </button>
      </span>
    ), { duration: 5000 });

    deleteTimer = setTimeout(() => {
      onDelete();
      toast.dismiss(toastId);
    }, 5000);

  };

  return (
    <>
    
      <div
        className={`flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition duration-300 ${
          removing ? "opacity-0 scale-95" : ""
        }`}
      >

        <div>

          <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 font-medium">
            {transaction.category}
          </span>

          <p className="text-gray-600 text-sm mt-1">
            {transaction.description || "No description"}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            {new Date(transaction.transactionDate).toLocaleDateString()}
          </p>

        </div>

        <div className="text-right">

          <p
            className={`font-bold text-lg ${
              isIncome ? "text-green-600" : "text-red-600"
            }`}
          >
            {isIncome ? "+" : "-"}₹{transaction.amount}
          </p>

          <div className="flex gap-2 justify-end mt-2">

            <button
              onClick={() => setEditing(transaction)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition"
            >
              <Pencil size={14}/>
              Edit
            </button>

            <button
              onClick={() => setConfirmOpen(true)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition"
            >
              <Trash size={14}/>
              Delete
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
};

export default TransactionItem;