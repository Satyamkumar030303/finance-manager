import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useUpdateTransaction } from "../hooks/useUpdateTransaction";

const EditTransactionModal = ({ transaction, onClose }) => {

  const { mutate: updateTx } = useUpdateTransaction();

  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    category: "",
    transactionDate: "",
    description: ""
  });

  useEffect(() => {

    if (transaction) {
      setForm({
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        transactionDate: transaction.transactionDate?.slice(0,10),
        description: transaction.description || ""
      });
    }

  }, [transaction]);

  useEffect(() => {

    const esc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", esc);

    return () => window.removeEventListener("keydown", esc);

  }, [onClose]);

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = (e) => {

    e.preventDefault();

    updateTx(
      { id: transaction._id, ...form },
      { onSuccess: onClose }
    );

  };

  if (!transaction) return null;

  return createPortal(

    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[9999]"
      onClick={onClose}
    >

      <div
        className="bg-white rounded-xl p-6 w-[420px] shadow-xl animate-modal"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex justify-between items-center mb-4">

          <h2 className="text-xl font-semibold">
            Edit Transaction
          </h2>

          <button onClick={onClose}>
            <X size={18}/>
          </button>

        </div>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="date"
            name="transactionDate"
            value={form.transactionDate}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />

          <div className="flex justify-end gap-2 pt-2">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Update
            </button>

          </div>

        </form>

      </div>

      <style>
        {`
          .animate-modal {
            animation: modalEnter 0.25s ease;
          }

          @keyframes modalEnter {
            from {
              opacity: 0;
              transform: translateY(-20px) scale(.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>

    </div>,

    document.body
  );
};

export default EditTransactionModal;