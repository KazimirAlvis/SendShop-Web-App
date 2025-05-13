import "@/styles/globals.css";
import { useEffect, useState } from "react";
import { CartProvider } from "@/components/CartContext";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import firebaseApp from "@/lib/firebaseClient";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPrintfulToken, setHasPrintfulToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const isDashboard = router.pathname.startsWith("/dashboard");

  // Set Firebase token in cookie
  const setFirebaseToken = async (user) => {
    try {
      const token = await user.getIdToken();
      document.cookie = `firebase_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error setting Firebase token:", error);
      setIsAuthenticated(false);
    }
  };

  // Check Printful connection status via API
  const checkPrintfulStatus = async () => {
    try {
      const res = await fetch('/api/printful-status', { credentials: 'include' });
      const data = await res.json();
      setHasPrintfulToken(!!data.connected);
    } catch (err) {
      setHasPrintfulToken(false);
    }
  };

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;

      if (user) {
        console.log("User signed in:", user.email);
        await setFirebaseToken(user);
        await checkPrintfulStatus();

        if (router.pathname === "/") {
          router.push("/dashboard");
        }
      } else {
        setIsAuthenticated(false);
        setHasPrintfulToken(false);

        if (isDashboard) {
          router.push("/");
        }
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [router.pathname]);

  // Show loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Protect dashboard routes
  if (isDashboard && !isAuthenticated) {
    router.push("/");
    return <div>Redirecting...</div>;
  }

  // Pass both auth states to components
  const content = (
    <Component 
      {...pageProps} 
      isAuthenticated={isAuthenticated}
      hasPrintfulToken={hasPrintfulToken}
    />
  );

  return (
    <CartProvider>
      {isDashboard ? <Layout>{content}</Layout> : content}
    </CartProvider>
  );
}