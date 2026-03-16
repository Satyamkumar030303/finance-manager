import { useState } from "react";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import TransactionFilters from "../components/TransactionFilters";
import EditTransactionModal from "../components/EditTransactionModal";

const TransactionsPage = () => {

  const [filters, setFilters] = useState({});
  const [editing, setEditing] = useState(null);

  return (

    <div className="space-y-6">

      <h1 className="text-3xl font-bold text-gray-800">
        Transactions
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-lg border">

        <h2 className="text-lg font-semibold mb-4">
          Add Transaction
        </h2>

        <TransactionForm />

      </div>

      <div className="bg-white p-4 rounded-xl shadow-lg border">

        <TransactionFilters
          filters={filters}
          setFilters={setFilters}
        />

      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border">

        <h2 className="text-lg font-semibold mb-4">
          Transactions
        </h2>

        <TransactionList
          filters={filters}
          setEditing={setEditing}
        />

      </div>

      {editing && (
        <EditTransactionModal
          transaction={editing}
          onClose={() => setEditing(null)}
        />
      )}

    </div>

  );
};

export default TransactionsPage;