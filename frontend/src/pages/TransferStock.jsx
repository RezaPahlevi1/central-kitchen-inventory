import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { transferStock } from "../api/stockMovement.api";
import { getProducts } from "../api/product.api";
import { getOutlets } from "../api/outlet.api";

export default function TransferStock() {
  const [form, setForm] = useState({
    product_id: "",
    outlet_id: "",
    qty: "",
    note: "",
  });

  const [message, setMessage] = useState("");

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const { data: outlets = [] } = useQuery({
    queryKey: ["outlets"],
    queryFn: getOutlets,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await transferStock({
        product_id: Number(form.product_id),
        outlet_id: Number(form.outlet_id),
        qty: Number(form.qty),
        note: form.note,
      });

      setMessage("Transfer stock berhasil");
      setForm({ product_id: "", outlet_id: "", qty: "", note: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Terjadi kesalahan");
    }
  };

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-xl font-bold mb-4">Transfer Stock</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* PRODUCT */}
        <select
          name="product_id"
          value={form.product_id}
          onChange={handleChange}
          className="w-full border p-2"
          required
        >
          <option value="">Pilih Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (stok: {p.stock})
            </option>
          ))}
        </select>

        {/* OUTLET */}
        <select
          name="outlet_id"
          value={form.outlet_id}
          onChange={handleChange}
          className="w-full border p-2"
          required
        >
          <option value="">Pilih Outlet</option>
          {outlets.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>

        {/* QTY */}
        <input
          type="number"
          name="qty"
          placeholder="Qty"
          value={form.qty}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />

        {/* NOTE */}
        <input
          type="text"
          name="note"
          placeholder="Note (opsional)"
          value={form.note}
          onChange={handleChange}
          className="w-full border p-2"
        />

        <button className="w-full bg-black text-white py-2">Transfer</button>
      </form>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
