import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

export const useDashboard = (period) => {
  return useQuery({
    queryKey: ["dashboard", period],
    queryFn: async () => {
      const res = await api.get(`/transactions/summary?period=${period}`);
      return res.data.data;
    },
    staleTime: 0,
    cacheTime: 0
  });
};