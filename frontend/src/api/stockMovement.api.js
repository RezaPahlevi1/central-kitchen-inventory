import api from "./axios";

export const transferStock = (data) =>
  api.post("/stock-movements/transfer", data);

export const getStockMovements = async () => {
  const res = await api.get("/stock-movements");
  return res.data;
};
