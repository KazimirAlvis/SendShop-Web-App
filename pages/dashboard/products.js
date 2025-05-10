// pages/dashboard/products.js
import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch("/api/printful/products");

      if (res.status === 401) {
        setConnected(false);
        return;
      }

      const data = await res.json();
      setProducts(data.result || []);
    }

    fetchProducts();
  }, []);

  if (!connected) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Printful Not Connected</h1>
        <p className="mb-4">To view your products, please connect your Printful store.</p>
        <a href="/api/printful/connect">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            🔗 Connect to Printful
          </button>
        </a>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🛍️ Printful Products</h1>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul className="space-y-4">
          {products.map((product) => (
            <li key={product.id} className="border p-4 rounded shadow-sm">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p>{product.synced ? "✅ Synced" : "❌ Not Synced"}</p>
              {product.thumbnail_url && (
                <img
                  src={product.thumbnail_url}
                  alt={product.name}
                  className="mt-2 w-32 h-32 object-contain"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
