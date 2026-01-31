import { createBrowserRouter } from "react-router-dom";
import CreateProduct from "../pages/CreateProduct";
import Products from "../pages/Products";
import Categories from "../pages/Categories";
import CategoryProducts from "../pages/CategoryProducts";
import Dashboard from "../pages/Dashboard";
import TransferStock from "../pages/TransferStock";
import MainLayout from "../../layouts/MainLayout";
import StockMovements from "../pages/StockMovements";
import OutletStock from "../pages/OutletStock";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <Dashboard /> },
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
        path: "/dashboard",
        element: <Dashboard />,
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
    ],
  },
]);

export default router;
