import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../src/context/AuthContext";

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded ${
      isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
    }`;

  if (!user) return null; // Should be handled by PrivateRoute, but safe guard

  return (
    <div className="flex h-screen overflow-hidden">
      {/* SIDEBAR - Fixed, no scroll */}
      <aside className="w-64 border-r bg-white p-4 flex flex-col overflow-y-auto">
        <h1 className="text-xl font-bold mb-6">Inventory</h1>

        <div className="mb-6 px-4 py-2 bg-gray-100 rounded">
          <p className="text-sm font-semibold">{user.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
        </div>

        <nav className="space-y-2 flex-1">
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

          <NavLink to="/:outlet_id/stocks" className={linkClass}>
            Outlets
          </NavLink>

          {/* SUPERADMIN ONLY */}
          {user.role === "superadmin" && (
            <NavLink to="/staff" className={linkClass}>
              Manage Staff
            </NavLink>
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-4 w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded"
        >
          Logout
        </button>
      </aside>

      {/* CONTENT - Scrollable */}
      <main className="flex-1 bg-gray-50 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
