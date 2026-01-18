import api from "./axios";

// GET all categories
export const getCategories = () =>
  api.get("/categories").then((res) => res.data);

// CREATE category
export const createCategory = (payload) =>
  api.post("/categories", payload).then((res) => res.data);

// UPDATE category
export const updateCategory = ({ id, name }) =>
  api.put(`/categories/${id}`, { name }).then((res) => res.data);

// DELETE category
export const deleteCategory = (id) =>
  api.delete(`/categories/${id}`).then((res) => res.data);

export const getCategoryProducts = (categoryId) =>
  api
    .get(`/categories/${categoryId}/products`)
    .then((res) => res.data.products);
