import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCategoryProducts } from "../api/category.api";
import Loading from "../components/Loading";

export default function CategoryProducts() {
  const { id } = useParams();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["category-products", id],
    queryFn: () => getCategoryProducts(id),
  });

  if (isLoading) return <Loading />;

  return (
    <div className="p-6">
      <Link to="/categories" className="text-blue-600">
        ← Kembali ke Categories
      </Link>

      <h1 className="text-xl font-bold mt-4 mb-4">Products in this Category</h1>

      {products.length === 0 ? (
        <p>Tidak ada product di category ini</p>
      ) : (
        <table className="border w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Nama</th>
              <th className="border p-2">Stock</th>
              <th className="border p-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="border p-2">{p.name}</td>
                <td className="border p-2">
                  {p.stock} {p.unit}
                </td>
                <td className="border p-2">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
