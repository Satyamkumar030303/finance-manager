import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTransaction } from "../api/transactionApi";
import toast from "react-hot-toast";



export const useCreateTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTransaction,
    onSuccess: () => {
            toast.success("Transaction added ✅");
            queryClient.invalidateQueries(["transactions"]);
            },

            onError: () => {
            toast.error("Failed to add transaction ❌");
},
    });
};
