import { createPortal } from "react-dom";
import { Trash2, X, AlertTriangle } from "lucide-react";

export default function DeleteConfirmModal({ onConfirm, onCancel }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center
                 bg-black/60 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="card-raised w-full max-w-sm animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-100 dark:bg-red-900/40 rounded-lg text-red-600 dark:text-red-400">
              <AlertTriangle size={14} />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Delete Transaction
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
            Are you sure you want to delete this transaction? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-2">
            <button onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button onClick={onConfirm} className="btn-danger">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
