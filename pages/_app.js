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
        const data = await res.json();

        if (res.status === 200) {
          console.log("✅ Authenticated:", data.uid);
        } else if (data.code === "token-expired") {
          console.log("🔄 Token expired. Refreshing...");
          const freshToken = await user.getIdToken(true); // force refresh
          await fetch("/api/setToken", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: freshToken }),
          });
          console.log("✅ Token refreshed.");
        } else {
          console.warn("🚫 User not authenticated.");
        }
      } catch (err) {
        console.error("❌ Error checking/refreshing token:", err);
      }
    };

    let interval;

    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      if (user) {
        console.log("👤 Firebase user signed in:", user.email || user.uid);
        checkAndRefreshToken(user);

        interval = setInterval(() => {
          checkAndRefreshToken(user);
        }, 30 * 60 * 1000); // every 30 minutes
      } else {
        console.log("🚪 User signed out.");
      }
    });

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
