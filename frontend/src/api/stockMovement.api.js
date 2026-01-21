import api from "./axios";

export const transferStock = (data) =>
  api.post("/stock-movements/transfer", data);
