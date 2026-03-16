import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTransaction } from "../api/transactionApi";
import toast from "react-hot-toast";

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      toast.success("Deleted successfully 🗑️");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || "Delete failed ❌");
    },
  });
};