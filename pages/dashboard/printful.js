import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function PrintfulIntegration({ isAuthenticated }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push("/login");
      return;
    }

    const fetchPrintfulToken = async () => {
      // Check if the token already exists in cookies
      const existingToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("printful_token="))
        ?.split("=")[1];

      if (existingToken) {
        console.log("Printful token already exists:", existingToken);
        setLoading(false); // Stop loading if the token exists
        return;
      }

      try {
        const res = await fetch("/api/getPrintfulToken");
        if (res.ok) {
          const { printful_token } = await res.json();
          document.cookie = `printful_token=${printful_token}; path=/;`;
          console.log("Printful token refreshed:", printful_token);
        } else {
          console.error("Failed to fetch Printful token");
          setError("Failed to fetch Printful token. Please try again.");
        }
      } catch (err) {
        console.error("Error fetching Printful token:", err);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false); // Stop loading after the fetch attempt
      }
    };

    fetchPrintfulToken();
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  if (loading) {
    return <div>Loading Printful integration...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return <div>Welcome to the Printful Integration Dashboard</div>;
}