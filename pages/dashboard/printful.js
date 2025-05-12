import { useEffect, useState } from "react";

export default function PrintfulIntegration() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
          setError("Failed to fetch Printful token");
        }
      } catch (err) {
        console.error("Error fetching Printful token:", err);
        setError("Error fetching Printful token");
      } finally {
        setLoading(false); // Stop loading after the fetch attempt
      }
    };

    fetchPrintfulToken();
  }, []);

  if (loading) {
    return <div>Loading Printful integration...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>Welcome to the Dashboard</div>;
}