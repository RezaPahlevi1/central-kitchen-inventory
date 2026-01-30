import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../api/dashboard.api";
import Loading from "../components/Loading";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useState } from "react";
import { Link } from "react-router-dom";

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
  const recentMovements = data?.recentMovements || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* LOW STOCK SECTION */}
      {lowStockProducts.length > 0 && (
        <div className="mb-6 border border-red-300 bg-red-50 p-4 rounded">
          <div className="flex justify-between">
            <h2 className="font-bold text-red-600 mb-3">
              ⚠️ Low Stock Warning
            </h2>
            <Link to="/products">
              <span className="font-semibold cursor-pointer hover:text-stone-600">
                {">>"} Go to Products
              </span>
            </Link>
          </div>

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
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={movementChart}>
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

              <Area
                type="monotone"
                dataKey="totalIn"
                stroke="#22c55e"
                fill="#bbf7d0"
                name="Total IN"
              />

              <Area
                type="monotone"
                dataKey="totalOut"
                stroke="#ef4444"
                fill="#fecaca"
                name="Total OUT"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TODAY MOVEMENT */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border rounded p-4 bg-green-50 border-green-300">
          <p className="text-sm text-gray-600">Today IN</p>
          <p className="text-2xl font-bold text-green-600">
            {todayIn} (All Units)
          </p>
        </div>

        <div className="border rounded p-4 bg-red-50 border-red-300">
          <p className="text-sm text-gray-600">Today OUT</p>
          <p className="text-2xl font-bold text-red-600">
            {todayOut} (All Units)
          </p>
        </div>
      </div>

      {/* RECENT MOVEMENTS */}
      <div className="mb-6">
        <h2 className="font-bold mb-3">Recent Movements</h2>

        {recentMovements.length === 0 ? (
          <p className="text-gray-500">No recent movements</p>
        ) : (
          <div className="space-y-3">
            {recentMovements.map((m, i) => {
              const isIn = m.direction === "IN";

              return (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-xl px-4 py-3
            ${isIn ? "bg-green-50 border border-green-300" : "bg-red-50 border border-red-300"}
            hover:shadow-sm transition`}
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-3">
                    {/* ICON */}
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-full
                ${isIn ? "bg-green-500/90" : "bg-red-500/90"} 
                text-white font-bold`}
                    >
                      {isIn ? "+" : "-"}
                    </div>

                    {/* TEXT */}
                    <div>
                      <p className="font-semibold text-gray-800">{m.name}</p>

                      <p className="text-sm text-gray-600">
                        {isIn ? (
                          <>Stock In • Qty {m.qty}</>
                        ) : (
                          <>
                            Stock Out • Qty {m.qty}
                            {m.outlet_name && (
                              <span className="ml-2 text-red-600 font-medium">
                                → {m.outlet_name}
                              </span>
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="text-xs text-gray-500">
                    {new Date(m.created_at).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                    })}{" "}
                    {new Date(m.created_at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
