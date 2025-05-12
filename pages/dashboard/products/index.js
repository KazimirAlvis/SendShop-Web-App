import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { useRouter } from "next/router";

export default function ProductList({ isAuthenticated }) {
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hasValidPrintfulToken, setHasValidPrintfulToken] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  // Check Printful token with better logging
  const validatePrintfulToken = () => {
    console.log("Checking cookies:", document.cookie); // Debug log

    if (typeof document === 'undefined') {
      console.log("Document not available yet");
      return false;
    }

    const cookies = document.cookie.split('; ');
    console.log("All cookies:", cookies); // Debug log

    const printfulToken = cookies.find(row => row.startsWith('printful_token='))?.split('=')[1];
    console.log("Found printful token:", printfulToken ? "Yes" : "No"); // Debug log

    if (printfulToken) {
      setHasValidPrintfulToken(true);
      return true;
    }
    
    setHasValidPrintfulToken(false);
    return false;
  };

  // Auth and token check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      // Add small delay to ensure cookies are available
      setTimeout(() => {
        setUserId(user.uid);
        const hasPrintfulToken = validatePrintfulToken();
        
        if (hasPrintfulToken) {
          console.log("Found Printful token, fetching products...");
          fetchProducts(user.uid);
        } else {
          console.log("No Printful token found in cookies:", document.cookie);
          setError("Please connect your Printful account first");
        }
      }, 100);
    });

    return () => unsubscribe();
  }, [auth, router]);

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
      setError(null); // Clear any existing errors
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
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Please sign in to sync products");
      }

      const hasPrintfulToken = validatePrintfulToken();
      if (!hasPrintfulToken) {
        throw new Error("Please connect your Printful account first");
      }

      const token = await user.getIdToken(true);
      console.log("Starting sync process...");
      
      const res = await fetch("/api/printful-sync", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include"
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to sync products");
      }

      setSuccess(`✅ Successfully synced ${data.count || 0} products`);
      await fetchProducts(user.uid);
    } catch (err) {
      console.error("Sync error:", err);
      setError(err.message);
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
          className={`px-4 py-2 rounded text-white transition-colors ${
            syncing 
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
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View Image
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
