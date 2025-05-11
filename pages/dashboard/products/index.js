import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    setUserId(user.uid);
    fetchProducts(user.uid);
  }, []);

const fetchProducts = async (uid) => {
  const q = query(collection(db, "products"), where("sellerId", "==", uid));
  const querySnapshot = await getDocs(q);
  const results = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || "Untitled Product",
      price: data.price || 0, // Default to 0 if price is missing
      description: data.description || "No description available",
      thumbnail_url: data.thumbnail_url || "", // Ensure thumbnail_url is always present
    };
  });
  setProducts(results);
};

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setSuccess(null);

    if (!userId) {
      setError("User ID is not available. Please log in again.");
      setSyncing(false);
      return;
    }

    try {
      console.log("Sending sync request...");
      const res = await fetch("/api/printful-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ Ensure cookies are sent
      });

      console.log("Sync response status:", res.status);

      if (!res.ok) {
        let error;
        try {
          error = await res.json();
        } catch {
          throw new Error("Failed to parse server response");
        }
        throw new Error(error.details || error.error || "Failed to sync");
      }

      const data = await res.json();
      setSuccess(`✅ Synced ${data.count} products`);
      if (userId) {
        await fetchProducts(userId);
      }
    } catch (err) {
      setError(`❌ Sync failed: ${err.message || "Network error"}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📦 Your Products</h1>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {syncing ? "Syncing..." : "🔄 Sync Now"}
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      <div className="overflow-x-auto">
        <tbody>
  {products.map((p) => (
    <tr key={p.id} className="border-t hover:bg-gray-50">
      <td className="p-2 border">{p.name || "No Name"}</td>
      <td className="p-2 border">
        {typeof p.price === "number" ? `$${p.price.toFixed(2)}` : "N/A"}
      </td>
      <td className="p-2 border">{p.description || "No Description"}</td>
      <td className="p-2 border text-blue-600 underline break-all">
        <a href={p.thumbnail_url} target="_blank" rel="noopener noreferrer">
          {p.thumbnail_url ? "View Image" : "No Image"}
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
      </div>
    </div>
  );
}
