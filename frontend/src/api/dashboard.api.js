import api from "./axios";

export const getDashboard = async (days = 7) => {
  const res = await api.get(`/dashboard?days=${days}`);
  return res.data;
};
