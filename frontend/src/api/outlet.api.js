import api from "./axios";

export const getOutlets = async () => {
  const res = await api.get("/outlets");
  return res.data;
};
