import { createBrowserRouter } from "react-router-dom";
import CreateProduct from "../pages/CreateProduct";
import Products from "../pages/products";
import Categories from "../pages/Categories";
import CategoryProducts from "../pages/CategoryProducts";
import Dashboard from "../pages/Dashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
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
]);

export default router;
