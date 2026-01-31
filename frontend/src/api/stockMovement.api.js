import api from "./axios";

export const transferStock = (data) =>
  api.post("/stock-movements/transfer", data);

// Mengambil data Central Kitchen
export const getStockMovements = async () => {
  const res = await api.get("/stock-movements");
  return res.data;
};

// BARU: Mengambil data Outlet
export const getOutletMovements = async () => {
  const res = await api.get("/stock-movements/outlet");
  return res.data;
};
