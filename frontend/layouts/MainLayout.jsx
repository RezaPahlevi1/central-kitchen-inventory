import { NavLink, Outlet } from "react-router-dom";

export default function MainLayout() {
  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded ${
      isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR */}
      <aside className="w-64 border-r bg-white p-4">
        <h1 className="text-xl font-bold mb-6">Inventory</h1>

        <nav className="space-y-2">
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>

          <NavLink to="/products" className={linkClass}>
            Products
          </NavLink>

          <NavLink to="/products/create" className={linkClass}>
            Create Product
          </NavLink>

          <NavLink to="/categories" className={linkClass}>
            Categories
          </NavLink>

          <NavLink to="/stock-movements" className={linkClass}>
            Stock Movements
          </NavLink>

          <NavLink to="/stock-movements/transfer" className={linkClass}>
            Transfer Stock
          </NavLink>
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
