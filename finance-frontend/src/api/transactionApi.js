import axiosInstance from "./axios";

export const getTransactions = async (filters = {}) => {
  const params = { ...filters };
  // <input type="month"> stores "YYYY-MM"; backend expects numeric month + year.
  if (typeof params.month === "string" && params.month.includes("-")) {
    const [y, m] = params.month.split("-");
    params.month = parseInt(m, 10);
    params.year = parseInt(y, 10);
  }

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