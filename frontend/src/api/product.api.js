import api from "./axios";

export const createProduct = async (data) => {
  const res = await api.post("/products", data);
  return res.data;
};

export const getAllProducts = async () => {
  const response = await api.get("/products/all");
  return response.data;
};

export const getProducts = async (search = "", page = 1) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  params.append("page", page);

  const response = await api.get(`/products?${params}`);

  console.log("API PRODUCTS RESPONSE:", response.data);

  return response.data;
};

export const updateProduct = ({ id, ...data }) =>
  api.put(`/products/${id}`, data);

export const deleteProduct = (id) => api.delete(`/products/${id}`);
