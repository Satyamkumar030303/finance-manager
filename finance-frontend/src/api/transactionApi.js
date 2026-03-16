import axiosInstance from "./axios";

export const getTransactions = async (params) => {

  const res = await axiosInstance.get("/transactions", { params });

  // backend returns { success, data, pagination }
  return res.data?.data || [];

};

export const createTransaction = async (payload) => {

  const res = await axiosInstance.post("/transactions", payload);

  return res.data;

};

export const deleteTransaction = async (id) => {

  const res = await axiosInstance.delete(`/transactions/${id}`);

  return res.data;

};

export const updateTransaction = async (id, payload) => {

  const res = await axiosInstance.put(`/transactions/${id}`, payload);

  return res.data;

};