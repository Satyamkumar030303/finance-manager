import { useState, useEffect } from "react";
import { useCreateTransaction } from "../hooks/useCreateTransaction";
import { useUpdateTransaction } from "../hooks/useUpdateTransaction";

const categories = ["Food", "Travel", "Shopping", "Salary", "Bills"];

const TransactionForm = ({ editing, setEditing }) => {

  const { mutate: createTx, isLoading } = useCreateTransaction();
  const { mutate: updateTx } = useUpdateTransaction();

  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    category: "Food",
    transactionDate: "",
    description: "",
  });

  useEffect(() => {

    if (editing) {
      setForm({
        amount: editing.amount || "",
        type: editing.type || "expense",
        category: editing.category || "Food",
        transactionDate: editing.transactionDate
          ? editing.transactionDate.split("T")[0]
          : "",
        description: editing.description || "",
      });
    }

  }, [editing]);

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === "amount" ? Number(value) : value,
    });
  };

  const resetForm = () => {

    setForm({
      amount: "",
      type: "expense",
      category: "Food",
      transactionDate: "",
      description: "",
    });
  };

  const handleSubmit = (e) => {

    e.preventDefault();

    if (!form.amount || !form.category || !form.transactionDate) {
      alert("Please fill all required fields");
      return;
    }

    if (editing) {

      updateTx(
        { id: editing._id, payload: form },
        {
          onSuccess: () => {
            resetForm();
            setEditing(null);
          },
        }
      );

    } else {

      createTx(form, {
        onSuccess: () => {
          resetForm();
        },
      });

    }

  };

  return (

    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-5 gap-4"
    >

      <input
        type="number"
        name="amount"
        value={form.amount}
        placeholder="Amount"
        onChange={handleChange}
        className="border rounded-lg px-3 py-2"
      />

      <select
        name="type"
        value={form.type}
        onChange={handleChange}
        className="border rounded-lg px-3 py-2"
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

       <select
        name="category"
        value={form.category}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
      >

      <option value="">Select Category</option>

      <option value="Miscellaneous">Salary</option>
      <option value="Food">Food</option>
      <option value="Travel">Travel</option>
      <option value="Shopping">Shopping</option>
      <option value="Bills">Bills</option>
      <option value="Entertainment">Entertainment</option>
      <option value="Health">Health</option>
      <option value="Education">Education</option>
      <option value="Miscellaneous">Miscellaneous</option>

      </select>

          <input
            type="date"
            name="transactionDate"
            value={form.transactionDate}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2"
         />

      <input
        type="text"
        name="description"
        value={form.description}
        placeholder="Description"
        onChange={handleChange}
        className="border rounded-lg px-3 py-2"
      />

      <div className="md:col-span-5 flex gap-3 mt-2">

        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          {editing
            ? "Update Transaction"
            : isLoading
            ? "Adding..."
            : "Add Transaction"}
        </button>

        {editing && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setEditing(null);
            }}
            className="bg-gray-400 text-white px-5 py-2 rounded-lg"
          >
            Cancel
          </button>
        )}

      </div>

    </form>
  );
};

export default TransactionForm;