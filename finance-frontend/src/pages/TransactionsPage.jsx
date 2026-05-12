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

export default function TransactionsPage() {
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
      <Helmet>
        <title>Transactions — Finance Manager</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">{t("nav.transactions")}</h1>
            <p className="page-subtitle">Add, filter, and manage your transactions</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-secondary btn-sm"
          >
            <Download size={14} />
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>

        {/* Add form */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Add Transaction
          </h2>
          <TransactionForm editing={null} setEditing={() => {}} />
        </div>

        {/* Search + Filters */}
        <div className="card p-4 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by description or category..."
              className="input pl-10 pr-10"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <TransactionFilters filters={filters} setFilters={setFilters} />
        </div>

        {/* List */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            All Transactions
          </h2>
          <TransactionList filters={activeFilters} setEditing={setEditing} />
        </div>

        {editing && (
          <EditTransactionModal transaction={editing} onClose={() => setEditing(null)} />
        )}
      </div>
    </>
  );
}
