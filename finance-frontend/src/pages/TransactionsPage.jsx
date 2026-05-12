import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Download, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import TransactionFilters from "../components/TransactionFilters";
import EditTransactionModal from "../components/EditTransactionModal";
import api from "../api/axios";

const TransactionsPage = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [exporting, setExporting] = useState(false);

  const activeFilters = { ...filters, ...(search ? { search } : {}) };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.set("type", filters.type);
      if (filters.month) {
        const [y, m] = filters.month.split("-");
        params.set("month", m);
        params.set("year", y);
      }
      if (search) params.set("search", search);

      const res = await api.get(`/transactions/export?${params}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${new Date().toISOString().substring(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Exported successfully");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Helmet><title>Transactions — Finance Manager</title><meta name="robots" content="noindex" /></Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-800">{t("nav.transactions")}</h1>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-60"
          >
            <Download size={15} />
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Add Transaction</h2>
          <TransactionForm />
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-full border rounded-lg pl-9 pr-9 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={15} />
              </button>
            )}
          </div>
          <TransactionFilters filters={filters} setFilters={setFilters} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Transactions</h2>
          <TransactionList filters={activeFilters} setEditing={setEditing} />
        </div>

        {editing && <EditTransactionModal transaction={editing} onClose={() => setEditing(null)} />}
      </div>
    </>
  );
};

export default TransactionsPage;
