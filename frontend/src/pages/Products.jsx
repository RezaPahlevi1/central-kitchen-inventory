import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, updateProduct, deleteProduct } from "../api/product.api";
import { getCategories } from "../api/category.api";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";

export default function Products() {
  const queryClient = useQueryClient();

  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: "",
    unit: "",
    min_stock: "",
    stock: "",
    category_id: "",
  });

  // PRODUCTS
  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  // CATEGORIES (buat dropdown)
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // UPDATE
  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      setOpenModal(false);
    },
    onError: () => alert("Gagal update product"),
  });

  // DELETE
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
    },
    onError: () => alert("Gagal hapus product"),
  });

  const handleEdit = (p) => {
    setForm({
      id: p.id,
      name: p.name,
      unit: p.unit,
      min_stock: p.min_stock,
      stock: p.stock,
      category_id: p.category_id,
    });
    setOpenModal(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const handleDelete = (id) => {
    if (!confirm("Yakin hapus product ini?")) return;
    deleteMutation.mutate(id);
  };

  if (isLoading) return <Loading />;
  if (isError) return <p>Gagal load products</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Products</h1>

      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Nama</th>
            <th className="p-2">Minimal Stock</th>
            <th className="p-2">Stock</th>
            <th className="p-2">Kategori</th>
            <th className="p-2">Dibuat oleh</th>
            <th className="p-2">Tanggal</th>
            <th className="p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="p-2">{p.name}</td>
              <td className="p-2">
                {p.min_stock} {p.unit}
              </td>
              <td className="p-2">
                {p.stock} {p.unit}
              </td>
              <td className="p-2">{p.category}</td>
              <td className="p-2">{p.created_by}</td>
              <td className="p-2">
                {new Date(p.created_at).toLocaleDateString()}
              </td>
              <td className="p-2 flex gap-2">
                <button onClick={() => handleEdit(p)} className="text-blue-600">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link
        to="/products/create"
        className="inline-block mt-4 bg-black text-white px-4 py-2"
      >
        Create Product
      </Link>

      {/* MODAL EDIT */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 w-96">
            <h2 className="font-bold mb-4">Edit Product</h2>

            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                className="border p-2 w-full"
                placeholder="Nama"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                type="number"
                className="border p-2 w-full"
                placeholder="Minimal Stock"
                value={form.min_stock}
                onChange={(e) =>
                  setForm({ ...form, min_stock: e.target.value })
                }
              />

              <input
                type="number"
                className="border p-2 w-full"
                placeholder="Stock"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />

              <select
                className="border p-2 w-full"
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
              >
                <option value="">Pilih Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-3"
                >
                  Batal
                </button>
                <button className="bg-black text-white px-4" type="submit">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
