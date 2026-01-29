import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../api/dashboard.api";
import Loading from "../components/Loading";

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  if (isLoading) return <Loading />;

  const lowStockProducts = data?.lowStockProducts || [];
  const todayIn = data?.todayMovement?.todayIn || 0;
  const todayOut = data?.todayMovement?.todayOut || 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* TODAY MOVEMENT */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border rounded p-4 bg-green-50">
          <p className="text-sm text-gray-600">Today IN</p>
          <p className="text-2xl font-bold text-green-600">
            {todayIn} (All Units)
          </p>
        </div>

        <div className="border rounded p-4 bg-red-50">
          <p className="text-sm text-gray-600">Today OUT</p>
          <p className="text-2xl font-bold text-red-600">
            {todayOut} (All Units)
          </p>
        </div>
      </div>

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
