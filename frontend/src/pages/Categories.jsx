import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/category.api";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";

export default function Categories() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [newCategory, setNewCategory] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // CREATE
  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      setNewCategory("");
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Gagal menambah category");
    },
  });

  // UPDATE
  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      setEditId(null);
      setEditName("");
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Gagal update category");
    },
  });

  // DELETE
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Gagal hapus category");
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate({ name: newCategory });
  };

  const handleUpdate = (id) => {
    updateMutation.mutate({ id, name: editName });
  };

  const handleDelete = (id) => {
    if (!confirm("Yakin ingin menghapus category ini?")) return;
    deleteMutation.mutate(id);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-bold mb-4">Categories</h1>

      {/* FORM ADD */}
      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Nama category"
          className="border p-2 flex-1"
          required
        />
        <button className="bg-black text-white px-4">Tambah</button>
      </form>

      {/* LIST */}
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="border p-3 flex justify-between items-center"
          >
            {editId === cat.id ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border p-1 flex-1 mr-2"
              />
            ) : (
              <span
                className="cursor-pointer"
                onClick={() => navigate(`/categories/${cat.id}`)}
              >
                {cat.name}
              </span>
            )}

            <div className="flex gap-2">
              {editId === cat.id ? (
                <>
                  <button
                    onClick={() => handleUpdate(cat.id)}
                    className="text-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditId(null)}
                    className="text-gray-500"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditId(cat.id);
                      setEditName(cat.name);
                    }}
                    className="text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
