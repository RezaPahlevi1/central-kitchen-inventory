import api from "./axios";

export const getLowStock = () => api.get("/dashboard").then((res) => res.data);
