import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "../api/transactionApi";

export const useTransactions = (filters) => {

  return useQuery({
    queryKey: ["transactions", filters],

    queryFn: () => getTransactions(filters),

    initialData: [],

    keepPreviousData: true
  });

};