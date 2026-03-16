import { createPortal } from "react-dom";
import { Trash2, X } from "lucide-react";

const DeleteConfirmModal = ({ onConfirm, onCancel }) => {

  return createPortal(

    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >

      <div
        className="bg-white w-[380px] rounded-xl p-6 shadow-xl animate-modal"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex justify-between items-center mb-3">

          <h2 className="text-lg font-semibold">
            Delete Transaction
          </h2>

          <button onClick={onCancel}>
            <X size={18}/>
          </button>

        </div>

        <p className="text-gray-600 mb-5">
          Are you sure you want to delete this transaction?
        </p>

        <div className="flex justify-end gap-2">

          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            <Trash2 size={16}/>
            Delete
          </button>

        </div>

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

export default DeleteConfirmModal;