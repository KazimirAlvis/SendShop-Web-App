// pages/dashboard/products/index.js
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const fetchProducts = async (uid) => {
    const q = query(collection(db, "products"), where("owner", "==", uid));
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(results);
  };

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    setUserId(user.uid);
    fetchProducts(user.uid);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/printful-sync", {
        method: "POST",
      });

      if (!res.ok) throw new Error("Sync failed");
      const data = await res.json();
      console.log("✅ Synced:", data.count, "products");
      await fetchProducts(userId);
    } catch (err) {
      console.error("❌ Sync failed", err);
      alert("Sync failed. Check console for details.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📦 Your Products</h1>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "🔄 Sync Products"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2 border">Title</th>
              <th className="text-left p-2 border">Price</th>
              <th className="text-left p-2 border">Description</th>
              <th className="text-left p-2 border">Image URL</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-2 border">{p.title}</td>
                <td className="p-2 border">${p.price}</td>
                <td className="p-2 border">{p.description}</td>
                <td className="p-2 border text-blue-600 underline break-all">
                  <a href={p.imageUrl} target="_blank" rel="noopener noreferrer">
                    {p.imageUrl}
                  </a>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
