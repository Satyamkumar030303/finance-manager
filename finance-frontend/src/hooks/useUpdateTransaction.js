import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTransaction } from "../api/transactionApi";
import toast from "react-hot-toast";

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      updateTransaction(id, payload),
    onSuccess: () => {
      toast.success("Updated successfully ✏️");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || "Update failed ❌");
    },
  });
};