import api from "./axios";

export const transferStock = (data) =>
  api.post("/stock-movements/transfer", data);

export const getStockMovements = async ({ queryKey }) => {
  const [, , page] = queryKey;

  const res = await api.get(`/stock-movements?page=${page}`);
  return res.data;
};

export const getOutletMovements = async ({ queryKey }) => {
  const [, , page] = queryKey;

  const res = await api.get(`/stock-movements/outlet?page=${page}`);
  return res.data;
};
