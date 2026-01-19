import { useQuery } from "@tanstack/react-query";
import { getLowStock } from "../api/dashboard.api";
import Loading from "../components/Loading";

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getLowStock,
  });

  if (isLoading) return <Loading />;

  const lowStockProducts = data?.lowStockProducts || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* LOW STOCK SECTION */}
      {lowStockProducts.length > 0 && (
        <div className="mb-6 border border-red-300 bg-red-50 p-4 rounded">
          <h2 className="font-bold text-red-600 mb-3">⚠️ Low Stock Warning</h2>

          <table className="w-full border">
            <thead>
              <tr className="bg-red-100">
                <th className="border p-2 text-left">Product</th>
                <th className="border p-2">Stock</th>
                <th className="border p-2">Min Stock</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((p) => (
                <tr key={p.id}>
                  <td className="border p-2">{p.name}</td>
                  <td className="border p-2 text-red-600 font-bold text-center">
                    {p.stock}
                  </td>
                  <td className="border p-2 text-center">{p.min_stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION LAIN (placeholder) */}
      <div className="text-gray-500">
        Dashboard summary lainnya akan ditambahkan di sini
      </div>
    </div>
  );
}
