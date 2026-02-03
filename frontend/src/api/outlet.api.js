import api from "./axios";

export const getOutlets = async () => {
  const res = await api.get("/outlets");
  return res.data;
};

export const createOutlet = async (data) => {
  const res = await api.post("/outlets", data);
  return res.data;
};

export const getOutletStocks = async (outletId) => {
  const res = await api.get(`/outlets/${outletId}/stocks`);
  return res.data;
};
