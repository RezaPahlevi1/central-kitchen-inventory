import api from "./axios";

export const createProduct = (data) => api.post("/products", data);

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
