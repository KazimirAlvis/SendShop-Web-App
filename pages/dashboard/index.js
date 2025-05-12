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
        // Force token refresh to ensure we have a valid token
        const token = await currentUser.getIdToken(true);
        const res = await fetch("/api/store-info", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include' // Include cookies in the request
        });

        if (!res.ok) {
          const errorData = await res.json();
          if (errorData.code === "TOKEN_EXPIRED") {
            // Token expired, refresh and retry
            const newToken = await currentUser.getIdToken(true);
            return fetchStoreName(); // Retry with new token
          }
          throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setStoreName(data.storeName || "Your Store");
        setError(null);
      } catch (err) {
        console.error("Error fetching store name:", err);
        setError(err.message || "Failed to load store information");
      } finally {
        setLoading(false);
      }
    }

    fetchStoreName();
  }, [isAuthenticated, router]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">Please login to access your dashboard</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Something went wrong
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex space-x-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard content
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to {storeName} 👋
        </h1>
        <p className="text-gray-600 mb-8">
          This is your seller dashboard overview.
        </p>

        <div className="mt-8 space-y-4">
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
