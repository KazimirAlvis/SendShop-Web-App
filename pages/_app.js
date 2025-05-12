import "@/styles/globals.css";
import { useEffect } from "react";
import { CartProvider } from "@/components/CartContext";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import firebaseApp from "@/lib/firebaseClient";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isDashboard = router.pathname.startsWith("/dashboard");

  // ✅ Refresh Firebase tokens periodically
  useEffect(() => {
    const auth = getAuth(firebaseApp);

    const refreshTokens = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const token = await user.getIdToken(true); // Force refresh
          document.cookie = `firebase_token=${token}; path=/;`;
          console.log("Firebase token refreshed:", token);
        } catch (err) {
          console.error("Failed to refresh Firebase token:", err);
          if (err.code === "auth/id-token-expired") {
            console.error("Token expired. Redirecting to login...");
            router.push("/login");
          }
        }
      }
    };

    refreshTokens();
    const interval = setInterval(refreshTokens, 30 * 60 * 1000); // Refresh every 30 minutes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchPrintfulToken = async () => {
      try {
        const res = await fetch("/api/getPrintfulToken");
        if (res.ok) {
          const { printful_token } = await res.json();
          document.cookie = `printful_token=${printful_token}; path=/;`;
          console.log("Printful token refreshed:", printful_token);
        } else {
          console.error("Failed to fetch Printful token");
        }
      } catch (err) {
        console.error("Error fetching Printful token:", err);
      }
    };

    // Fetch Printful token after redirection
    fetchPrintfulToken();
  }, []);

  // ✅ Listen for authentication state changes
  useEffect(() => {
    const auth = getAuth(firebaseApp);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User signed in:", user.email);
      } else {
        console.log("User signed out");
        // Clear the Firebase token cookie on sign-out
        document.cookie = "firebase_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        router.push("/login");
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const content = <Component {...pageProps} />;

  return (
    <CartProvider>
      {isDashboard ? <Layout>{content}</Layout> : content}
    </CartProvider>
  );
}