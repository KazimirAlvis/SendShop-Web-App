import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";

export default function DashboardHome({ isAuthenticated }) {
  const [storeName, setStoreName] = useState("loading...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const currentUser = auth.currentUser;
    
    if (!currentUser || !isAuthenticated) {
      router.push("/login");
      return;
    }

    async function fetchStoreName() {
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch("/api/store-info", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setStoreName(data.storeName || "Your Store");
        setError(null);
      } catch (err) {
        console.error("Error fetching store name:", err);
        setError("Failed to load store information");
      } finally {
        setLoading(false);
      }
    }

    fetchStoreName();
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">Please login to access your dashboard</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Something went wrong</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to {storeName} 👋
        </h1>
        <p className="text-gray-600 mb-8">
          This is your seller dashboard overview.
        </p>

        <div className="mt-8">
          <button
            onClick={() => router.push('/dashboard/printful')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            🔗 Connect to Printful
          </button>
        </div>
      </div>
    </div>
  );
}
