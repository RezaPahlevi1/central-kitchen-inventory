import api from "./axios";

export const createProduct = (data) => api.post("/products", data);

export const getProducts = async () => {
  const res = await api.get("/products");
  return res.data;
};

export const updateProduct = ({ id, ...data }) =>
  api.put(`/products/${id}`, data);

export const deleteProduct = (id) => api.delete(`/products/${id}`);
