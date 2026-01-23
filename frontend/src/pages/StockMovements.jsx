import { useQuery } from "@tanstack/react-query";
import { getStockMovements } from "../api/stockMovement.api";
import Loading from "../components/Loading";

export default function StockMovements() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["stock-movements"],
    queryFn: getStockMovements,
  });

  if (isLoading) return <Loading />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Stock Movement Ledger</h1>

      <div className="border rounded overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Tanggal</th>
              <th className="border p-2 text-left">Product</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Unit</th>
              <th className="border p-2">Direction</th>
              <th className="border p-2">Type</th>
              <th className="border p-2 text-left">Outlet</th>
              <th className="border p-2 text-left">Admin</th>
              <th className="border p-2 text-left">Note</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center p-4 text-gray-500">
                  Belum ada pergerakan stok
                </td>
              </tr>
            ) : (
              data.map((m) => (
                <tr key={m.id}>
                  <td className="border p-2">
                    {new Date(m.created_at).toLocaleString()}
                  </td>

                  <td className="border p-2 font-medium">{m.product_name}</td>

                  <td className="border p-2 text-center font-bold">{m.qty}</td>

                  <td className="border p-2 text-center">{m.unit}</td>

                  <td
                    className={`border p-2 text-center font-bold ${
                      m.direction === "OUT" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {m.direction}
                  </td>

                  <td className="border p-2 text-center">{m.movement_type}</td>

                  <td className="border p-2">{m.outlet_name || "-"}</td>

                  <td className="border p-2">{m.created_by}</td>

                  <td className="border p-2 text-sm text-gray-600">
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
