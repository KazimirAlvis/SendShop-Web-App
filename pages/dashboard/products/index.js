import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { useRouter } from "next/router";

export default function ProductList({ isAuthenticated, hasPrintfulToken: initialHasPrintfulToken }) {
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hasPrintfulToken, setHasPrintfulToken] = useState(initialHasPrintfulToken || false);
  const router = useRouter();
  const auth = getAuth();

  // Check Printful connection status via API
  const checkPrintfulStatus = async () => {
    try {
      const res = await fetch('/api/printful-status', { credentials: 'include' });
      const data = await res.json();
      setHasPrintfulToken(!!data.connected);
      return !!data.connected;
    } catch (err) {
      setHasPrintfulToken(false);
      return false;
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const checkAuthAndFetch = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.log("No authenticated user");
        return;
      }

      setUserId(user.uid);

      // Always check Printful status server-side
      const connected = await checkPrintfulStatus();
      if (connected) {
        await fetchProducts(user.uid);
      } else {
        setError("Please connect your Printful account first");
      }
    };

    checkAuthAndFetch();
    // eslint-disable-next-line
  }, [isAuthenticated, auth, router]);

  const fetchProducts = async (uid) => {
    try {
      if (!db) {
        throw new Error("Firestore not initialized");
      }
      const productsRef = collection(db, "products");
      const q = query(productsRef, where("sellerId", "==", uid));
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        name: doc.data().name || "Untitled Product",
        price: doc.data().price || 0,
        description: doc.data().description || "No description available",
        thumbnail_url: doc.data().thumbnail_url || ""
      }));
      setProducts(results);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/printful-sync', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      setSuccess('Products synced successfully');
      // Optionally, refresh products after sync
      if (userId) await fetchProducts(userId);
    } catch (error) {
      setError(error.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📦 Your Products</h1>
        <div>
          <button
            onClick={handleSync}
            disabled={syncing || !hasPrintfulToken}
            className={`px-4 py-2 rounded text-white transition-colors ${
              syncing || !hasPrintfulToken
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {syncing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Syncing...
              </span>
            ) : '🔄 Sync Now'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Product Name</th>
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">Image</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-2">{p.name}</td>
                <td className="p-2">
                  {typeof p.price === "number" ? `$${p.price.toFixed(2)}` : "N/A"}
                </td>
                <td className="p-2">{p.description}</td>
                <td className="p-2">
                  {p.thumbnail_url ? (
                    <a
                      href={p.thumbnail_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <img
                        src={p.thumbnail_url}
                        alt={p.name}
                        className="h-12 w-12 object-cover rounded shadow"
                        style={{ maxWidth: 48, maxHeight: 48 }}
                      />
                    </a>
                  ) : "No Image"}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No products found. Click &quot;Sync Now&quot; to import your products from Printful.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
