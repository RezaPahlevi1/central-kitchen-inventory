import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getOutlets, getOutletStocks } from "../api/outlet.api";
import Loading from "../components/Loading";

export default function OutletStock() {
  const [selectedOutlet, setSelectedOutlet] = useState("");

  const { data: outlets = [] } = useQuery({
    queryKey: ["outlets"],
    queryFn: getOutlets,
  });

  const { data: stocks = [], isLoading } = useQuery({
    queryKey: ["outlet-stocks", selectedOutlet],
    queryFn: () => getOutletStocks(selectedOutlet),
    enabled: !!selectedOutlet,
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Outlet Stocks</h1>

      {/* DROPDOWN */}
      <select
        className="border px-3 py-2 rounded mb-4"
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

                      {/* QTY + UNIT */}
                      <td className="border p-2 text-center font-semibold">
                        {p.stock} {p.unit}
                      </td>

                      {/* DIRECTION */}
                      <td
                        className={`border p-2 text-center font-semibold ${
                          isIn ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {p.last_direction || "-"}
                      </td>

                      {/* DATE */}
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
    </div>
  );
}
