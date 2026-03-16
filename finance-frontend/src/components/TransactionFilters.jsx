const TransactionFilters = ({ filters, setFilters }) => {
  return (
    <div className="flex flex-wrap gap-4 items-center">

      {/* Type Filter */}
      <select
        value={filters.type || ""}
        onChange={(e) =>
          setFilters({ ...filters, type: e.target.value })
        }
        className="border rounded-lg px-3 py-2 bg-white"
      >
        <option value="">All Types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      {/* Month Filter */}
      <input
        type="month"
        value={filters.month || ""}
        onChange={(e) =>
          setFilters({ ...filters, month: e.target.value })
        }
        className="border rounded-lg px-3 py-2"
      />

    </div>
  );
};

export default TransactionFilters;