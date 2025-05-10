// pages/_app.js
import "@/styles/globals.css";
import { useEffect } from "react";
import { CartProvider } from "@/components/CartContext";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebaseClient";
import { onAuthStateChanged, getAuth } from "firebase/auth";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isDashboard = router.pathname.startsWith("/dashboard");

  useEffect(() => {
    const authInstance = getAuth();

    const checkAndRefreshToken = async (user) => {
      try {
        const res = await fetch("/api/getUser");
        if (res.status === 401) {
          const data = await res.json();
          if (data.code === "token-expired") {
            console.log("🔄 Token expired. Refreshing...");
            const freshToken = await user.getIdToken(true); // force refresh
            await fetch("/api/setToken", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: freshToken }),
            });
            console.log("✅ Token refreshed.");
          }
        }
      } catch (err) {
        console.error("Error refreshing token:", err);
      }
    };

    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      if (user) {
        checkAndRefreshToken(user);

        const interval = setInterval(() => {
          checkAndRefreshToken(user);
        }, 30 * 60 * 1000); // Every 30 minutes

        return () => clearInterval(interval);
      }
    });

    return () => unsubscribe();
  }, []);

  const content = <Component {...pageProps} />;

  return (
    <CartProvider>
      {isDashboard ? <Layout>{content}</Layout> : content}
    </CartProvider>
  );
}
