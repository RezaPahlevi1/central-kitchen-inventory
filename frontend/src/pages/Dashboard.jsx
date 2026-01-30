import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../api/dashboard.api";
import Loading from "../components/Loading";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

export default function Dashboard() {
  const [days, setDays] = useState(7);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", days],
    queryFn: () => getDashboard(days),
  });

  if (isLoading) return <Loading />;

  const lowStockProducts = data?.lowStockProducts || [];
  const todayIn = data?.todayMovement?.todayIn || 0;
  const todayOut = data?.todayMovement?.todayOut || 0;
  const movementChart = data?.movementChart || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* MOVEMENT CHART */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold">Stock Movement</h2>

        <select
          className="border px-2 py-1 rounded"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={7}>Last 7 Days</option>
          <option value={14}>Last 14 Days</option>
          <option value={30}>Last 30 Days</option>
        </select>
      </div>

      <div className="mb-6 border rounded p-4">
        <h2 className="font-bold mb-4">Stock Movement (Last 7 Days)</h2>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={movementChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                  })
                }
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalIn"
                stroke="#22c55e"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="totalOut"
                stroke="#ef4444"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

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
    </div>
  );
}
