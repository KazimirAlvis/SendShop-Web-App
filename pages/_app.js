// pages/_app.js
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
    const checkAndRefreshToken = async (user) => {
      try {
        const res = await fetch("/api/getUser");
        if (res.status === 401) {
          const data = await res.json();
          if (data.code === "token-expired") {
            const freshToken = await user.getIdToken(true);
            await fetch("/api/setToken", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: freshToken }),
            });
          }
        }
      } catch (err) {
        console.error("Error refreshing token:", err);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkAndRefreshToken(user);
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
