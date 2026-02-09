import { createBrowserRouter, Navigate } from "react-router-dom";
import CreateProduct from "../pages/CreateProduct";
import Products from "../pages/Products";
import Categories from "../pages/Categories";
import CategoryProducts from "../pages/CategoryProducts";
import Dashboard from "../pages/Dashboard";
import TransferStock from "../pages/TransferStock";
import MainLayout from "../../layouts/MainLayout";
import StockMovements from "../pages/StockMovements";
import OutletStock from "../pages/OutletStock";
import Login from "../pages/Login";
import Staff from "../pages/Staff";
import PrivateRoute from "../components/PrivateRoute";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: <Dashboard /> },
          {
            path: "/products/create",
            element: <CreateProduct />,
          },
          {
            path: "/products",
            element: <Products />,
          },
          {
            path: "/categories",
            element: <Categories />,
          },
          {
            path: "/categories/:id",
            element: <CategoryProducts />,
          },
          {
            path: "/stock-movements",
            element: <StockMovements />,
          },
          {
            path: "/stock-movements/transfer",
            element: <TransferStock />,
          },
          {
            path: "/:outlet_id/stocks",
            element: <OutletStock />,
          },
          // Superadmin Routes
          {
            element: <PrivateRoute allowedRoles={["superadmin"]} />,
            children: [
              {
                path: "/staff",
                element: <Staff />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
