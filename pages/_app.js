import "@/styles/globals.css";
import { useEffect } from "react";
import { CartProvider } from "@/components/CartContext";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth"; // you can keep this one



export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isDashboard = router.pathname.startsWith("/dashboard");

  useEffect(() => {


    const refreshAndVerifyToken = async (user) => {
      try {
        const freshToken = await user.getIdToken(true); // always refresh token
        console.log("🔑 Got fresh token");

        await fetch("/api/setToken", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: freshToken }),
          credentials: "include",
        });

        console.log("✅ Token set. Waiting 750ms...");
        await new Promise((resolve) => setTimeout(resolve, 750));

        const res = await fetch("/api/getUser", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          console.log("✅ Verified user:", data.uid);
        } else {
          console.warn("🚫 Still not authenticated. Forcing reload.");
          window.location.reload();
        }
      } catch (err) {
        console.error("❌ Token refresh failed:", err);
      }
    };

    let interval;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("👤 Firebase user signed in:", user.email || user.uid);
        refreshAndVerifyToken(user);

        interval = setInterval(() => {
          refreshAndVerifyToken(user);
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
