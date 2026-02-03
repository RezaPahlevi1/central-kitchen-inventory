import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getOutlets,
  getOutletStocks,
  createOutlet,
  deleteOutlet, // ← Import
} from "../api/outlet.api";
import Loading from "../components/Loading";

export default function OutletStock() {
  const queryClient = useQueryClient();

  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
  });

  const { data: outlets = [] } = useQuery({
    queryKey: ["outlets"],
    queryFn: getOutlets,
  });

  const { data: stocks = [], isLoading } = useQuery({
    queryKey: ["outlet-stocks", selectedOutlet],
    queryFn: () => getOutletStocks(selectedOutlet),
    enabled: !!selectedOutlet,
  });

  // CREATE MUTATION
  const createMutation = useMutation({
    mutationFn: createOutlet,
    onSuccess: () => {
      queryClient.invalidateQueries(["outlets"]);
      setOpenModal(false);
      setForm({ name: "", address: "" });
      alert("Outlet berhasil dibuat!");
    },
    onError: () => {
      alert("Gagal membuat outlet");
    },
  });

  // DELETE MUTATION ← TAMBAH INI
  const deleteMutation = useMutation({
    mutationFn: deleteOutlet,
    onSuccess: () => {
      queryClient.invalidateQueries(["outlets"]);
      setSelectedOutlet(""); // Reset selection
      alert("Outlet berhasil dihapus");
    },
    onError: () => {
      alert("Gagal menghapus outlet");
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Nama outlet wajib diisi");
      return;
    }

    createMutation.mutate(form);
  };

  const handleOpenModal = () => {
    setForm({ name: "", address: "" });
    setOpenModal(true);
  };

  // ← TAMBAH FUNCTION DELETE
  const handleDelete = (id, name) => {
    if (
      !confirm(
        `Yakin hapus outlet "${name}"?\n\nStok di outlet akan hilang, tapi riwayat transfer tetap tersimpan.`,
      )
    ) {
      return;
    }
    deleteMutation.mutate(id);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Outlet Stocks</h1>

        <button
          onClick={handleOpenModal}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          + Create Outlet
        </button>
      </div>

      {/* ← UPDATE DROPDOWN DENGAN DELETE BUTTON */}
      <div className="flex gap-2 mb-4">
        <select
          className="border px-3 py-2 rounded flex-1"
          value={selectedOutlet}
          onChange={(e) => setSelectedOutlet(e.target.value)}
        >
          <option value="">Select Outlet</option>
          {outlets.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>

        {/* Delete Button - hanya muncul jika ada outlet yang dipilih */}
        {selectedOutlet && (
          <button
            onClick={() => {
              const outlet = outlets.find(
                (o) => o.id === parseInt(selectedOutlet),
              );
              if (outlet) handleDelete(outlet.id, outlet.name);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete Outlet
          </button>
        )}
      </div>

      {!selectedOutlet && <p className="text-gray-500">Select outlet first</p>}

      {isLoading && <Loading />}

      {selectedOutlet && !isLoading && (
        <div className="border rounded overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">Product</th>
                <th className="border p-2 text-center">Qty</th>
                <th className="border p-2 text-center">Direction</th>
                <th className="border p-2 text-center">Last Update</th>
              </tr>
            </thead>

            <tbody>
              {stocks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">
                    No stock in this outlet
                  </td>
                </tr>
              ) : (
                stocks.map((p) => {
                  const isIn = p.last_direction === "IN";

                  return (
                    <tr key={p.product_id}>
                      <td className="border p-2">{p.product_name}</td>

                      <td className="border p-2 text-center font-semibold">
                        {p.stock} {p.unit}
                      </td>

                      <td
                        className={`border p-2 text-center font-semibold ${
                          isIn ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {p.last_direction || "-"}
                      </td>

                      <td className="border p-2 text-center text-sm text-gray-600">
                        {p.last_update
                          ? new Date(p.last_update).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-96 rounded shadow-lg">
            <h2 className="font-bold text-lg mb-4">Create New Outlet</h2>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nama Outlet <span className="text-red-500">*</span>
                </label>
                <input
                  className="border p-2 w-full rounded"
                  placeholder="Contoh: Outlet Cabang A"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Alamat</label>
                <textarea
                  className="border p-2 w-full rounded"
                  placeholder="Alamat outlet (opsional)"
                  rows="3"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
