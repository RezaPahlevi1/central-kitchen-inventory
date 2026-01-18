import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCategories } from "../api/category.api";
import { createProduct } from "../api/product.api";

export default function CreateProduct() {
  const [form, setForm] = useState({
    name: "",
    unit: "",
    min_stock: "",
    stock: "",
    category_id: "",
  });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      alert("Product berhasil ditambahkan");
      setForm({
        name: "",
        unit: "",
        min_stock: "",
        stock: "",
        category_id: "",
      });
    },
    onError: (err) => {
      console.error(err.response?.data || err);
      alert("Gagal menambahkan product");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]:
        name === "category_id" || name === "min_stock" ? Number(value) : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    mutation.mutate({
      name: form.name,
      unit: form.unit,
      min_stock: form.min_stock,
      stock: form.stock,
      category_id: form.category_id,
    });
  };

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-xl font-bold mb-4">Create Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama */}
        <input
          name="name"
          placeholder="Nama bahan"
          value={form.name}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

        {/* Unit */}
        <select
          name="unit"
          value={form.unit}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        >
          <option value="">Pilih unit</option>
          <option value="kg">Kg</option>
          <option value="liter">Liter</option>
          <option value="pcs">Pcs</option>
        </select>

        {/* Minimum stock */}
        <input
          name="min_stock"
          type="number"
          step="0.01"
          placeholder="Minimum stock"
          value={form.min_stock}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

        <input
          name="stock"
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        />

        {/* Category */}
        <select
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          className="border p-2 w-full"
          required
        >
          <option value="">Pilih kategori</option>
          {!isLoading &&
            categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>

        <button
          disabled={mutation.isPending}
          className="bg-black text-white px-4 py-2"
        >
          {mutation.isPending ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </div>
  );
}
