import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getStockMovements,
  getOutletMovements,
} from "../api/stockMovement.api";
import Loading from "../components/Loading";

export default function StockMovements() {
  // State untuk Tab: 'CENTRAL' atau 'OUTLET'
  const [activeTab, setActiveTab] = useState("CENTRAL");

  // Query 1: Data Central Kitchen
  const { data: ckData = [], isLoading: ckLoading } = useQuery({
    queryKey: ["stock-movements", "central"],
    queryFn: getStockMovements,
  });

  // Query 2: Data Outlet
  const { data: outletData = [], isLoading: outletLoading } = useQuery({
    queryKey: ["stock-movements", "outlet"],
    queryFn: getOutletMovements,
  });

  // Tentukan data dan loading state mana yang dipakai berdasarkan Tab Aktif
  const data = activeTab === "CENTRAL" ? ckData : outletData;
  const isLoading = activeTab === "CENTRAL" ? ckLoading : outletLoading;

  if (isLoading) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Stock Movement Ledger</h1>

        {/* Tombol Export atau Filter bisa ditaruh disini nantinya */}
      </div>

      {/* --- TAB NAVIGATION --- */}
      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 font-medium transition-colors ${
            activeTab === "CENTRAL"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("CENTRAL")}
        >
          Central Kitchen
        </button>
        <button
          className={`py-2 px-4 font-medium transition-colors ${
            activeTab === "OUTLET"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("OUTLET")}
        >
          Outlet Movements
        </button>
      </div>

      {/* --- TAB CONTENT (TABLE) --- */}
      <div className="border rounded overflow-x-auto shadow-sm">
        <table className="w-full border-collapse bg-white">
          <thead className="bg-gray-50 text-sm uppercase text-gray-700">
            <tr>
              <th className="border p-3 text-left">Tanggal</th>
              <th className="border p-3 text-left">Product</th>
              <th className="border p-3 text-center">Qty</th>
              <th className="border p-3 text-center">Unit</th>
              <th className="border p-3 text-center">Direction</th>
              <th className="border p-3 text-center">Type</th>

              {/* Kolom Outlet ditampilkan dinamis tergantung Tab */}
              <th className="border p-3 text-left">
                {activeTab === "CENTRAL"
                  ? "Tujuan/Asal (Outlet)"
                  : "Outlet Name"}
              </th>

              <th className="border p-3 text-left">Admin/User</th>
              <th className="border p-3 text-left">Note</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {data.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center p-8 text-gray-500">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-medium">Tidak ada data</span>
                    <span className="text-sm">
                      Belum ada pergerakan stok di{" "}
                      {activeTab === "CENTRAL" ? "Central Kitchen" : "Outlet"}.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="border p-3 whitespace-nowrap">
                    {new Date(m.created_at).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td className="border p-3 font-medium text-gray-900">
                    {m.product_name}
                  </td>

                  <td className="border p-3 text-center font-bold">{m.qty}</td>

                  <td className="border p-3 text-center text-gray-500">
                    {m.unit}
                  </td>

                  <td className="border p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        m.direction === "OUT"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {m.direction}
                    </span>
                  </td>

                  <td className="border p-3 text-center">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {m.movement_type}
                    </span>
                  </td>

                  <td className="border p-3">{m.outlet_name || "-"}</td>

                  <td className="border p-3">{m.created_by}</td>

                  <td className="border p-3 text-gray-500 italic max-w-xs truncate">
                    {m.note || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
