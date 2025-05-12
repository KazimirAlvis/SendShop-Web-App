import "@/styles/globals.css";
import { useEffect } from "react";
import { CartProvider } from "@/components/CartContext";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isDashboard = router.pathname.startsWith("/dashboard");

  useEffect(() => {
    const refreshAndVerifyToken = async (user) => {
      try {
        // Refresh the Firebase token
        const freshToken = await user.getIdToken(true); // Force refresh
        console.log("🔑 Got fresh token:", freshToken);

        // Send the token to the server
        await fetch("/api/setToken", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: freshToken }),
          credentials: "include",
        });

        console.log("✅ Token set. Waiting 750ms...");
        await new Promise((resolve) => setTimeout(resolve, 750)); // Wait for token propagation

        // Verify the token on the server
        const res = await fetch("/api/getUser", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          console.log("✅ Verified user:", data.uid);
        } else {
          console.warn("🚫 Still not authenticated. Forcing reload.");

          // Prevent infinite reloads
          if (!localStorage.getItem("reloadAttempted")) {
            localStorage.setItem("reloadAttempted", "true");
            window.location.reload();
          } else {
            console.error("Reload already attempted. Stopping further reloads.");
          }
        }
      } catch (err) {
        console.error("❌ Token refresh failed:", err);
      }
    };

    let interval;

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("👤 Firebase user signed in:", user.email || user.uid);

        // Refresh the token immediately
        refreshAndVerifyToken(user);

        // Set up periodic token refresh (every 30 minutes)
        interval = setInterval(() => {
          refreshAndVerifyToken(user);
        }, 30 * 60 * 1000); // 30 minutes
      } else {
        console.log("🚪 User signed out.");
        localStorage.removeItem("reloadAttempted"); // Reset reload prevention on sign-out
      }
    });

    // Cleanup on component unmount
    return () => {
      unsubscribe();
      if (interval) clearInterval(interval);
    };
  }, []);

  const content = <Component {...pageProps} />;

  return (
    <CartProvider>
      {isDashboard ? <Layout>{content}</Layout> : content}
    </CartProvider>
  );
}